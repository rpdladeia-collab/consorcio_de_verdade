/**
 * Gerador de PDF — Módulo: Estrutura do Lance
 * Padrão aprovado: logo no canto superior direito, rodapé obrigatório, bloco de transparência.
 * Rodapé: consorciodeverdade.com.br | Gerado em: [DATA/HORA] | Motor Matemático v1.0 | ID: [HASH]
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Constantes ─── */
const MOTOR_VERSION = "v1.0";
const DOMAIN = "consorciodeverdade.com.br";
const TRANSPARENCY_TEXT =
  "Transparência e Metodologia: Este relatório apresenta uma projeção matemática baseada em parâmetros fornecidos pelo usuário, " +
  "destinada exclusivamente à compreensão da dinâmica financeira do produto. Esta análise é uma projeção independente para apoio " +
  "à decisão e não substitui o contrato oficial. Toda e qualquer informação deve ser validada diretamente com a Administradora " +
  "de Consórcios antes de qualquer decisão.";

/* ─── Cores (RGB) ─── */
const INK: [number, number, number] = [17, 17, 17];
const ORANGE: [number, number, number] = [249, 115, 22];
const GRAY: [number, number, number] = [120, 120, 120];
const LIGHT: [number, number, number] = [245, 240, 232];
const WHITE: [number, number, number] = [255, 255, 255];

/* ─── Tipos ─── */
interface ContemplationRow {
  month: number;
  credit: number;
  event: string;
  lance: number;
  payment: number;
  balance: number;
  tags: string[];
}

export interface PdfEstruturaDaLance {
  // Parâmetros da proposta
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  adjustmentRate: number;
  adjustmentPeriod: string;
  paidMonths: number;
  
  // Parâmetros do lance
  baseDoLance: 'carta' | 'categoria';
  lanceProprio: number;
  lanceFgts: number;
  lanceEmbutido: number;
  
  // Resultados (KPIs)
  cartaAtualizada: number;
  cartaLiquida: number;
  lanceTotal: number;
  forcaPct: number;
  parcelaAntes: number;
  parcelaPosLance: number;
  
  // Diagnóstico
  diagnosticoTexto: string;
  
  // Tabela de evolução
  rows: ContemplationRow[];
  
  // Metadata
  simulationId: string;
  generatedAt: string;
}

/* ─── Helpers ─── */
function brl(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isFinite(v) ? v : 0);
}

function brl0(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(isFinite(v) ? v : 0);
}

function pct(v: number): string {
  return `${(isFinite(v) ? v : 0).toFixed(1).replace(".", ",")}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
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

function drawFooter(doc: jsPDF, data: PdfEstruturaDaLance) {
  const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  const footerText = `${DOMAIN}  |  Gerado em: ${formatDate(data.generatedAt)}  |  Motor Matemático ${MOTOR_VERSION}  |  ID: ${data.simulationId}`;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.4);
    doc.line(14, ph - 16, pw - 14, ph - 16);

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(footerText, pw / 2, ph - 10, { align: "center" });
    doc.text(`${i} / ${pageCount}`, pw - 14, ph - 10, { align: "right" });
  }
}

/* ─── Gerador principal ─── */
export async function generatePdfEstruturaDaLance(data: PdfEstruturaDaLance): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  let y = 0;

  /* ── CABEÇALHO EDITORIAL ── */
  // Linha horizontal fina superior
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(14, 8, pw - 14, 8);

  // Logo oficial em preto no canto superior direito
  try {
    const logoUrl = window.location.origin + "/assets/logo-dark.png";
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", pw - 30, 5, 20, 15);
  } catch {
    // Logo não disponível — continua sem ela
  }

  // Linha horizontal fina inferior
  doc.line(14, 22, pw - 14, 22);

  y = 30;

  /* ── TÍTULO ── */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Análise de Estrutura do Lance", 14, y);
  y += 6;

  /* ── PARÂMETROS ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Parâmetros informados", 14, y);
  y += 5;

  const adjLabel =
    data.adjustmentPeriod === "0" ? "Sem correção" :
    data.adjustmentPeriod === "6" ? "Semestral" : "Anual";

  autoTable(doc, {
    startY: y,
    head: [["Parâmetro", "Valor"]],
    body: [
      ["Carta de crédito", brl0(data.credit)],
      ["Prazo total", `${data.term} meses`],
      ["Taxa de administração", `${data.adminRate.toFixed(2)}%`],
      ["Fundo de reserva", `${data.reserveRate.toFixed(2)}%`],
      ["Parcelas pagas até a contemplação", `${data.paidMonths}`],
      ["Base do lance", data.baseDoLance === "categoria" ? "Categoria (carta + taxa adm)" : "Carta de crédito"],
      ["Lance próprio", brl0(data.lanceProprio)],
      ["FGTS", brl0(data.lanceFgts)],
      ["Lance embutido", brl0(data.lanceEmbutido)],
      ["Correção estimada", `${data.adjustmentRate.toFixed(2)}% (${adjLabel})`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  /* ── KPIs ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Resultados principais", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor", "Observação"]],
    body: [
      ["Carta atualizada", brl0(data.cartaAtualizada), "Valor nominal atualizado"],
      ["Carta líquida", brl0(data.cartaLiquida), "Carta menos embutido"],
      ["Lance total", brl0(data.lanceTotal), "Próprio + FGTS + embutido"],
      ["Força do lance", pct(data.forcaPct), data.baseDoLance === "categoria" ? "Em relação à carta + taxas" : "Em relação à carta"],
      ["Parcela antes", brl(data.parcelaAntes), "Último mês antes da contemplação"],
      ["Parcela pós-lance", brl(data.parcelaPosLance), "1ª parcela após o lance"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 }, 1: { cellWidth: 45 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  /* ── DIAGNÓSTICO ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Diagnóstico do lance", 14, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  const diagnosticoLines = doc.splitTextToSize(data.diagnosticoTexto, pw - 28);
  doc.text(diagnosticoLines, 14, y);
  y += diagnosticoLines.length * 4 + 5;

  /* ── TABELA DE EVOLUÇÃO (primeiras 30 linhas) ── */
  if (data.rows && data.rows.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text("Evolução das parcelas (primeiros 30 meses)", 14, y);
    y += 5;

    const displayRows = data.rows.slice(0, 30).map((r) => [
      String(r.month),
      brl0(r.credit),
      r.event || "—",
      brl0(r.lance),
      brl(r.payment),
      brl0(r.balance),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Mês", "Carta", "Evento", "Lance", "Parcela", "Saldo"]],
      body: displayRows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  /* ── BLOCO DE TRANSPARÊNCIA ── */
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const transparencyLines = doc.splitTextToSize(TRANSPARENCY_TEXT, pw - 28);
  
  // Verificar se cabe na página atual
  if (y + transparencyLines.length * 3 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 30;
  }

  doc.text(transparencyLines, 14, y, { align: "left" });

  /* ── RODAPÉ ── */
  drawFooter(doc, data);

  /* ── DOWNLOAD ── */
  doc.save(`Estrutura_do_Lance_${data.simulationId}.pdf`);
}
