/**
 * Gerador de PDF — Módulo 6: Auto Pagável?
 * Padrão aprovado: logo no canto superior direito, rodapé obrigatório, bloco de transparência.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MOTOR_VERSION = "v1.0";
const DOMAIN = "consorciodeverdade.com.br";
const TRANSPARENCY_TEXT =
  "Transparência e Metodologia: Este simulador projeta cenários matemáticos com base nos " +
  "parâmetros informados pelo usuário e nas regras padrão do Banco Central. O resultado é uma " +
  "projeção independente para apoio à decisão e não substitui a leitura do seu contrato, que pode " +
  "conter regras específicas da administradora. " +
  "Essa é uma simulação baseada em dados incluídos pelo usuário - apenas com finalidade de conhecer a dinâmica do mercado de consórcio - não deve ser vista como recomendação financeira ou promessa de contemplação.";

const INK: [number, number, number] = [17, 17, 17];
const ORANGE: [number, number, number] = [249, 115, 22];
const GRAY: [number, number, number] = [120, 120, 120];
const LIGHT: [number, number, number] = [245, 240, 232];
const WHITE: [number, number, number] = [255, 255, 255];

function brl(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(isFinite(v) ? v : 0);
}
function brl0(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(isFinite(v) ? v : 0);
}
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Sao_Paulo" });
  } catch { return iso; }
}

function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas ctx null"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export interface PdfAutoPagavelData {
  kpis: { coverage: number; coverageCls: string; investedPurchaseMonth: number | null; finalInv: number; finalCons: number };
  readboxes: { title: string; body: string }[];
  table: { month: number; objective: string; parcel: string; income: string; consReserve: string; extras: string; invAsset: string; patrimonioInv: string; patrimonioCons: string }[];
  warnings: string[];
  diff: number;
  simulationId: string;
  generatedAt: string;
  form: { credit: string; term: string; adminRate: string; reserveRate: string; appreciation: string; annualReturn: string; initial: string; budget: string; contMonth: string; own: string; embedded: string; rent: string; mode: string };
}

function drawFooter(doc: jsPDF, data: PdfAutoPagavelData) {
  const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  const footerText = `${DOMAIN}  |  Gerado em: ${formatDate(data.generatedAt)}  |  Motor Matemático ${MOTOR_VERSION}  |  ID: ${data.simulationId}`;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...ORANGE); doc.setLineWidth(0.4);
    doc.line(14, ph - 16, pw - 14, ph - 16);
    doc.setFontSize(7); doc.setTextColor(...GRAY); doc.setFont("helvetica", "normal");
    doc.text(footerText, pw / 2, ph - 10, { align: "center" });
    doc.text(`${i} / ${pageCount}`, pw - 14, ph - 10, { align: "right" });
  }
}

export async function generatePdfAutoPagavel(data: PdfAutoPagavelData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  let y = 0;

  // Cabeçalho
  doc.setFillColor(...INK);
  doc.rect(0, 0, pw, 52, "F");
  try {
    const logoUrl = window.location.origin + "/manus-storage/logo-pdf-v2_dca9a8b9.jpg";
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", pw - 22, 9, 14, 14);
  } catch { /* sem logo */ }
  doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(...ORANGE);
  doc.text("Consórcio de Verdade", 14, 18);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 180, 180);
  doc.text("Raio-X do Consórcio · Módulo 6: Auto Pagável?", 14, 26);
  doc.setFontSize(8); doc.setTextColor(140, 140, 140);
  doc.text("Simulação matemática · Consórcio de Verdade", 14, 33);
  doc.text(`ID: ${data.simulationId}`, 14, 39);
  doc.setFontSize(7); doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${formatDate(data.generatedAt)}`, 14, 45);
  y = 60;

  // Parâmetros
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Parâmetros da simulação", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Parâmetro", "Valor"]],
    body: [
      ["Carta de crédito", brl0(parseFloat(data.form.credit))],
      ["Prazo", `${data.form.term} meses`],
      ["Taxa de administração", `${data.form.adminRate}%`],
      ["Fundo de reserva", `${data.form.reserveRate}%`],
      ["Valorização do bem (% a.a.)", `${data.form.appreciation}%`],
      ["Rentabilidade investimento (% a.a.)", `${data.form.annualReturn}%`],
      ["Capital inicial", brl0(parseFloat(data.form.initial))],
      ["Orçamento mensal", brl0(parseFloat(data.form.budget))],
      ["Mês hipotético de contemplação", data.form.contMonth],
      ["Lance próprio", brl0(parseFloat(data.form.own))],
      ["Lance embutido", brl0(parseFloat(data.form.embedded))],
      ["Renda mensal do bem", brl0(parseFloat(data.form.rent))],
      ["Modelo de parcela", data.form.mode === "linear" ? "Linear" : "Não linear"],
    ],
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // KPIs
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Indicadores principais", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Cobertura da parcela (%)", `${(isFinite(data.kpis.coverage) ? data.kpis.coverage : 0).toFixed(1).replace(".", ",")}%`],
      ["Compra via investimento", data.kpis.investedPurchaseMonth !== null ? `Mês ${data.kpis.investedPurchaseMonth}` : "Não alcança no prazo"],
      ["Patrimônio final — Investimento", brl(data.kpis.finalInv)],
      ["Patrimônio final — Consórcio", brl(data.kpis.finalCons)],
      ["Diferença (Consórcio − Investimento)", brl(data.diff)],
    ],
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Warnings
  if (data.warnings.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(200, 80, 0);
    doc.text("Avisos do motor de cálculo", 14, y); y += 5;
    data.warnings.forEach((w) => {
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 60, 0);
      const lines = doc.splitTextToSize(`⚠ ${w}`, pw - 28);
      doc.text(lines, 14, y); y += lines.length * 4.5 + 2;
    });
    y += 4;
  }

  // Readboxes
  data.readboxes.forEach((rb) => {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
    doc.text(rb.title, 14, y); y += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(rb.body, pw - 28);
    doc.text(lines, 14, y); y += lines.length * 4.5 + 6;
  });

  // Tabela de comparação (primeiros 24 meses)
  doc.addPage(); y = 20;
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Comparação de patrimônio (primeiros 24 meses)", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Mês", "Objetivo", "Parcela", "Renda", "Reserva", "Extra", "Bem Inv.", "Patrim. Inv.", "Patrim. Cons."]],
    body: data.table.slice(0, 24).map((r) => [r.month, r.objective, r.parcel, r.income, r.consReserve, r.extras, r.invAsset, r.patrimonioInv, r.patrimonioCons]),
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 6 },
    bodyStyles: { fontSize: 6 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Transparência
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Transparência e Metodologia", 14, y); y += 6;
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
  const tLines = doc.splitTextToSize(TRANSPARENCY_TEXT, pw - 28);
  doc.text(tLines, 14, y);

  drawFooter(doc, data);
  doc.save(`raio-x-auto-pagavel-${data.simulationId}.pdf`);
}
