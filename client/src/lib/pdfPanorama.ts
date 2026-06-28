/**
 * Gerador de PDFs por bloco — Panorama: Dados Oficiais
 * Padrão aprovado: logo 14×14 canto superior direito, rodapé obrigatório, bloco de transparência.
 * Rodapé: consorciodeverdade.com.br | Gerado em: [DATA/HORA] | Motor Matemático v1.0 | ID: [HASH]
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  annualData,
  segmentData,
  complaintsBCB,
  consumerGovComplaints,
  consumerGovTopReasons2025,
  macroData,
} from "./panoramaData";
import { LOGO } from "./brand";

/* ─── Constantes ─── */
const MOTOR_VERSION = "v1.0";
const DOMAIN = "consorciodeverdade.com.br";
const FONTE_TEXTO =
  "Fonte: Banco Central do Brasil — Panorama de Consórcio BCB 2016–2024. " +
  "Seção de reclamações: Consumidor.gov.br (painel público). " +
  "O Consórcio de Verdade não tem a ABAC como fonte de dados.";
const TRANSPARENCY_TEXT =
  "Esta é uma projeção matemática independente e não constitui recomendação financeira. " +
  "Os dados apresentados são de fontes oficiais públicas. Nenhuma informação deste relatório " +
  "constitui recomendação de compra ou venda de consórcio.";

/* ─── Cores (RGB) ─── */
const INK: [number, number, number] = [21, 20, 15];
const ORANGE: [number, number, number] = [249, 115, 22];
const TERRA: [number, number, number] = [194, 65, 12];
const GRAY: [number, number, number] = [158, 152, 144];
const LIGHT: [number, number, number] = [246, 243, 236];
const WHITE: [number, number, number] = [255, 255, 255];
const GRID: [number, number, number] = [229, 224, 216];

/* ─── Helpers ─── */
function pct(v: number): string { return (v * 100).toFixed(1) + "%"; }
function mi(v: number): string { return v >= 1 ? v.toFixed(2) + " mi" : (v * 1000).toFixed(0) + " mil"; }
function fmtN(v: number): string { return v.toLocaleString("pt-BR"); }

function generateHash(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas ctx null"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function addHeader(doc: jsPDF, titulo: string, subtitulo: string, logoBase64?: string) {
  const W = doc.internal.pageSize.getWidth();
  // Faixa escura no topo
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 20, "F");

  // Título principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text("PANORAMA: DADOS OFICIAIS", 12, 9);

  // Subtítulo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text(subtitulo.toUpperCase(), 12, 16);

  // Logo no canto superior direito
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", W - 22, 3, 14, 14); } catch { /* sem logo */ }
  }

  // Título do bloco
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(titulo, 12, 32);

  // Linha separadora
  doc.setDrawColor(...TERRA);
  doc.setLineWidth(0.5);
  doc.line(12, 36, W - 12, 36);
}

function addFooter(doc: jsPDF, hash: string) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  // Bloco de transparência
  doc.setFillColor(...LIGHT);
  doc.rect(12, H - 38, W - 24, 18, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const lines = doc.splitTextToSize(TRANSPARENCY_TEXT, W - 32);
  doc.text(lines.slice(0, 3), 16, H - 33);

  // Rodapé
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`${DOMAIN}  ·  Gerado em: ${now}  ·  Motor Matemático ${MOTOR_VERSION}  ·  ID: ${hash}`, 12, H - 8);
}

function addFonte(doc: jsPDF, y: number): number {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...LIGHT);
  doc.rect(12, y, W - 24, 14, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const lines = doc.splitTextToSize(FONTE_TEXTO, W - 32);
  doc.text(lines.slice(0, 2), 16, y + 5);
  return y + 18;
}

/* ─── Bloco: Mercado de consórcios ─── */
async function pdfVendas(doc: jsPDF, y: number, logo?: string): Promise<number> {
  addHeader(doc, "Mercado de consórcios", "Vendas — Recordes Históricos", logo);
  let cy = 44;
  const W = doc.internal.pageSize.getWidth();

  // KPIs
  const kpis = [
    { num: "4,53 mi", label: "Cotas vendidas em 2024" },
    { num: "11,35 mi", label: "Cotas ativas em dez/2024" },
    { num: "+98%", label: "Crescimento 2016→2024" },
    { num: "9 anos", label: "de crescimento ininterrupto" },
  ];
  const kw = (W - 24) / 4;
  kpis.forEach((k, i) => {
    const x = 12 + i * kw;
    doc.setFillColor(...LIGHT);
    doc.rect(x, cy, kw - 2, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TERRA);
    doc.text(k.num, x + 3, cy + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(k.label, x + 3, cy + 14);
  });
  cy += 22;

  // Tabela de cotas totais
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Cotas comercializadas — total (2016–2024)", 12, cy + 6);
  cy += 10;

  autoTable(doc, {
    startY: cy,
    head: [["Ano", "Cotas Vendidas (mi)", "Cotas Ativas (mi)", "Contemplações (mi)"]],
    body: annualData.map((d) => [
      String(d.ano),
      d.vendidas.toFixed(2),
      d.ativas.toFixed(2),
      d.contemplacoes.toFixed(2),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  cy = addFonte(doc, cy);
  return cy;
}

/* ─── Bloco: Exclusões e permanência ─── */
async function pdfExclusao(doc: jsPDF, y: number, logo?: string): Promise<number> {
  addHeader(doc, "Exclusões e permanência", "Índice de Exclusão — Isso é Grave", logo);
  let cy = 44;
  const W = doc.internal.pageSize.getWidth();

  // KPIs
  const kpis = [
    { num: "48,6%", label: "IE geral 2024" },
    { num: "10,75 mi", label: "Cotas excluídas em 2024" },
    { num: "50,7%", label: "Pico histórico (2017)" },
    { num: "9 anos", label: "acima de 48%" },
  ];
  const kw = (W - 24) / 4;
  kpis.forEach((k, i) => {
    const x = 12 + i * kw;
    doc.setFillColor(...LIGHT);
    doc.rect(x, cy, kw - 2, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TERRA);
    doc.text(k.num, x + 3, cy + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(k.label, x + 3, cy + 14);
  });
  cy += 22;

  // Tabela IE geral
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Índice de exclusão — geral (2016–2024)", 12, cy + 6);
  cy += 10;

  autoTable(doc, {
    startY: cy,
    head: [["Ano", "IE Geral (%)", "Cotas Excluídas (mi)", "Cotas Ativas (mi)"]],
    body: annualData.map((d) => [
      String(d.ano),
      (d.ie * 100).toFixed(1) + "%",
      d.excluidas.toFixed(2),
      d.ativas.toFixed(2),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Tabela IE por segmento (2024)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("IE por segmento — 2024", 12, cy + 6);
  cy += 10;

  const seg2024 = segmentData.filter((d) => d.ano === 2024);
  autoTable(doc, {
    startY: cy,
    head: [["Segmento", "IE (%)", "Vendidas (mi)", "Ativas (mi)", "Excluídas (mi)"]],
    body: seg2024.map((d) => [
      d.segmento,
      pct(d.ie),
      mi(d.vendidas),
      mi(d.ativas),
      mi(d.excluidas),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  cy = addFonte(doc, cy);
  return cy;
}

/* ─── Bloco: Reclamações e atendimento ─── */
async function pdfReclamacoes(doc: jsPDF, y: number, logo?: string): Promise<number> {
  addHeader(doc, "Reclamações e atendimento", "Reclamações — Crescem", logo);
  let cy = 44;
  const W = doc.internal.pageSize.getWidth();

  // KPIs
  const kpis = [
    { num: "6.400", label: "Reclamações BCB 2025" },
    { num: "2.955", label: "Procedentes BCB 2025" },
    { num: "6.986", label: "Consumidor.gov 2025" },
    { num: "+998%", label: "Crescimento 2016→2025" },
  ];
  const kw = (W - 24) / 4;
  kpis.forEach((k, i) => {
    const x = 12 + i * kw;
    doc.setFillColor(...LIGHT);
    doc.rect(x, cy, kw - 2, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TERRA);
    doc.text(k.num, x + 3, cy + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(k.label, x + 3, cy + 14);
  });
  cy += 22;

  // Tabela BCB
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Reclamações BCB — total e procedentes (2017–2025)", 12, cy + 6);
  cy += 10;

  autoTable(doc, {
    startY: cy,
    head: [["Ano", "Total", "Procedentes", "Outras", "Índice Proc./Milhão"]],
    body: complaintsBCB.map((d) => [
      String(d.ano),
      fmtN(d.total),
      fmtN(d.procedentes),
      fmtN(d.outras),
      d.indice_proc_milhao.toFixed(2),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Tabela Consumidor.gov
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Reclamações — Consumidor.gov.br (2016–2025)", 12, cy + 6);
  cy += 10;

  autoTable(doc, {
    startY: cy,
    head: [["Ano", "Reclamações"]],
    body: consumerGovComplaints.map((d) => [String(d.ano), fmtN(d.reclamacoes)]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Principais motivos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Principais motivos de reclamação — Consumidor.gov.br 2025", 12, cy + 6);
  cy += 10;

  autoTable(doc, {
    startY: cy,
    head: [["Rank", "Motivo", "% do total"]],
    body: consumerGovTopReasons2025.map((r) => [
      `#${r.rank}`,
      r.motivo,
      pct(r.pct),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  cy = addFonte(doc, cy);
  return cy;
}

/* ─── Bloco: Contemplações: lance e sorteio ─── */
async function pdfSorte(doc: jsPDF, y: number, logo?: string): Promise<number> {
  addHeader(doc, "Contemplações: lance e sorteio", "Sorte — Não conte com ela", logo);
  let cy = 44;
  const W = doc.internal.pageSize.getWidth();

  // KPIs
  const kpis = [
    { num: "78,3%", label: "Por lance em 2024" },
    { num: "21,7%", label: "Por sorteio em 2024" },
    { num: "69,8%", label: "Lance em 2016" },
    { num: "1,68 mi", label: "Contemplações totais 2024" },
  ];
  const kw = (W - 24) / 4;
  kpis.forEach((k, i) => {
    const x = 12 + i * kw;
    doc.setFillColor(...LIGHT);
    doc.rect(x, cy, kw - 2, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TERRA);
    doc.text(k.num, x + 3, cy + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(k.label, x + 3, cy + 14);
  });
  cy += 22;

  // Tabela
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Contemplações: lance vs. sorteio (2016–2024)", 12, cy + 6);
  cy += 10;

  autoTable(doc, {
    startY: cy,
    head: [["Ano", "Total Contemplações (mi)", "% Lance", "% Sorteio"]],
    body: annualData.map((d) => [
      String(d.ano),
      d.contemplacoes.toFixed(2),
      (d.lance * 100).toFixed(1) + "%",
      ((1 - d.lance) * 100).toFixed(1) + "%",
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  cy = addFonte(doc, cy);
  return cy;
}

/* ─── Bloco: Consórcio em diferentes cenários econômicos ─── */
async function pdfMacro(doc: jsPDF, y: number, logo?: string): Promise<number> {
  addHeader(doc, "Consórcio em diferentes cenários econômicos", "Macroeconomia — Ciclos Econômicos", logo);
  let cy = 44;

  // Texto introdutório
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(113, 107, 96);
  const W = doc.internal.pageSize.getWidth();
  const introText =
    "O comportamento do consórcio também pode ser observado em diferentes ciclos da economia. " +
    "Esta leitura ajuda a comparar o desempenho do mercado em períodos de juros, inflação, crédito e " +
    "atividade econômica distintos, sempre a partir dos dados utilizados na base.";
  const introLines = doc.splitTextToSize(introText, W - 24);
  doc.text(introLines, 12, cy);
  cy += introLines.length * 5 + 8;

  // Tabela macro
  autoTable(doc, {
    startY: cy,
    head: [["Ano", "Selic (%)", "Fin. Imob. (%)", "Vendidas (mi)", "Ativas (mi)", "IE (%)", "Contexto"]],
    body: macroData.map((d) => [
      String(d.ano),
      (d.selic * 100).toFixed(2) + "%",
      (d.financiamento_imob * 100).toFixed(2) + "%",
      d.vendidas.toFixed(2),
      d.ativas.toFixed(2),
      (d.ie * 100).toFixed(1) + "%",
      d.evento,
    ]),
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 6: { cellWidth: 40 } },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  cy = addFonte(doc, cy);
  return cy;
}

/* ─── Bloco: Base de dados completa ─── */
async function pdfBase(doc: jsPDF, y: number, logo?: string): Promise<number> {
  addHeader(doc, "Base de dados completa", "Dados Oficiais BCB 2016–2024", logo);
  let cy = 44;

  autoTable(doc, {
    startY: cy,
    head: [["Ano", "Segmento", "Vendidas (mi)", "Ativas (mi)", "Excluídas (mi)", "IE (%)", "Status"]],
    body: segmentData.map((row) => [
      String(row.ano),
      row.segmento,
      mi(row.vendidas),
      mi(row.ativas),
      mi(row.excluidas),
      pct(row.ie),
      row.status,
    ]),
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 12, right: 12 },
  });

  cy = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  cy = addFonte(doc, cy);
  return cy;
}

/* ─── Exportador principal ─── */
export async function gerarPdfPanorama(bloco: string): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const hash = generateHash();

  let logoBase64: string | undefined;
  try {
    logoBase64 = await loadImageAsBase64(LOGO.dark);
  } catch {
    logoBase64 = undefined;
  }

  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  switch (bloco) {
    case "vendas":
      await pdfVendas(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-mercado-consorcios-${new Date().getFullYear()}.pdf`);
      break;
    case "exclusao":
      await pdfExclusao(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-exclusoes-permanencia-${new Date().getFullYear()}.pdf`);
      break;
    case "reclamacoes":
      await pdfReclamacoes(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-reclamacoes-atendimento-${new Date().getFullYear()}.pdf`);
      break;
    case "sorte":
      await pdfSorte(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-contemplacoes-lance-sorteio-${new Date().getFullYear()}.pdf`);
      break;
    case "macro":
      await pdfMacro(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-cenarios-economicos-${new Date().getFullYear()}.pdf`);
      break;
    case "base":
      await pdfBase(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-base-dados-completa-${new Date().getFullYear()}.pdf`);
      break;
    default:
      // PDF completo com todos os blocos
      await pdfVendas(doc, y, logoBase64);
      addFooter(doc, hash);
      doc.addPage();
      await pdfExclusao(doc, 0, logoBase64);
      addFooter(doc, hash);
      doc.addPage();
      await pdfReclamacoes(doc, 0, logoBase64);
      addFooter(doc, hash);
      doc.addPage();
      await pdfSorte(doc, 0, logoBase64);
      addFooter(doc, hash);
      doc.addPage();
      await pdfMacro(doc, 0, logoBase64);
      addFooter(doc, hash);
      doc.addPage();
      await pdfBase(doc, 0, logoBase64);
      addFooter(doc, hash);
      doc.save(`panorama-dados-oficiais-completo-${new Date().getFullYear()}.pdf`);
  }
}
