/**
 * Gerador de PDF — Módulo 2: Contemplação
 * Padrão aprovado: logo no canto superior direito, rodapé obrigatório, bloco de transparência.
 * Rodapé: consorciodeverdade.com.br | Gerado em: [DATA/HORA] | Motor Matemático v1.0 | ID: [HASH]
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Constantes ─── */
const MOTOR_VERSION = "v1.0";
const DOMAIN = "consorciodeverdade.com.br";
const TRANSPARENCY_TEXT =
  "Transparência e Metodologia: Este simulador projeta cenários matemáticos com base nos " +
  "parâmetros informados pelo usuário e nas regras padrão do Banco Central. O resultado é uma " +
  "projeção independente para apoio à decisão e não substitui a leitura do seu contrato, que pode " +
  "conter regras específicas da administradora. " +
  "Essa é uma simulação baseada em dados incluídos pelo usuário - apenas com finalidade de conhecer a dinâmica do mercado de consórcio - não deve ser vista como recomendação financeira ou promessa de contemplação.";

/* ─── Cores (RGB) ─── */
const INK: [number, number, number] = [17, 17, 17];
const ORANGE: [number, number, number] = [249, 115, 22];
const GRAY: [number, number, number] = [120, 120, 120];
const LIGHT: [number, number, number] = [245, 240, 232];
const WHITE: [number, number, number] = [255, 255, 255];

/* ─── Tipos ─── */
interface ProjectionRow {
  month: number;
  credit: number;
  event: string;
  lance: number;
  installment: number;
  balance: number;
  projected: number;
  tags: string[];
}

interface SummaryRow {
  item: string;
  value: string;
  read: string;
}

export interface PdfContemplacao {
  // Resultado da procedure
  forcePct: number;
  totalLance: number;
  creditLiquid: number;
  postLanceInstallment: number;
  newInstallment: number;
  baseLabel: string;
  own: number;
  fgts: number;
  embedded: number;
  credit: number;
  applied: number;
  amortizable: number;
  paidTotal: number;
  summaryRows: SummaryRow[];
  projection: { rows: ProjectionRow[]; paidProjected: number; finalBalance: number };
  warnings: string[];
  simulationId: string;
  generatedAt: string;
  // Formulário (para exibir parâmetros no PDF)
  form: {
    credit: string;
    term: string;
    adminRate: string;
    reserveRate: string;
    adjRate: string;
    adjEvery: string;
    mode: string;
    paidMonths: string;
    base: string;
    own: string;
    fgts: string;
    embedded: string;
  };
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

function drawFooter(doc: jsPDF, data: PdfContemplacao) {
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
export async function generatePdfContemplacao(data: PdfContemplacao): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  let y = 0;

  /* ── CABEÇALHO EDITORIAL ── */
  // Linha horizontal fina superior
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(14, 8, pw - 14, 8);

  // Logo transparente branca no canto superior direito
  try {
    const logoUrl = window.location.origin + "/brand/logo-light.png";
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", pw - 20, 5, 12, 12);
  } catch {
    // Logo não disponível — continua sem ela
  }

  // Linha horizontal fina inferior
  doc.line(14, 22, pw - 14, 22);

  y = 30;

  /* ── PARÂMETROS ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Parâmetros informados", 14, y);
  y += 5;

  const adjLabel =
    data.form.adjEvery === "0" ? "Sem correção" :
    data.form.adjEvery === "6" ? "Semestral" : "Anual";

  autoTable(doc, {
    startY: y,
    head: [["Parâmetro", "Valor"]],
    body: [
      ["Carta de crédito", brl0(parseFloat(data.form.credit) || 0)],
      ["Prazo total", `${data.form.term} meses`],
      ["Taxa de administração", `${parseFloat(data.form.adminRate).toFixed(2)}%`],
      ["Fundo de reserva", `${parseFloat(data.form.reserveRate).toFixed(2)}%`],
      ["Parcelas pagas até a contemplação", data.form.paidMonths],
      ["Base do lance", data.baseLabel === "categoria" ? "Categoria (carta + taxa adm)" : "Carta de crédito"],
      ["Lance próprio", brl0(parseFloat(data.form.own) || 0)],
      ["FGTS", brl0(parseFloat(data.form.fgts) || 0)],
      ["Lance embutido", brl0(parseFloat(data.form.embedded) || 0)],
      ["Correção estimada", `${parseFloat(data.form.adjRate).toFixed(2)}% (${adjLabel})`],
      ["Modelo de parcela", data.form.mode === "linear" ? "Linear" : "Não linear"],
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
      ["Força de lance", pct(data.forcePct), `Base: ${data.baseLabel}`],
      ["Lance total", brl0(data.totalLance), "Próprio + FGTS + embutido"],
      ["Carta líquida", brl0(data.creditLiquid), "Carta menos lance embutido"],
      ["Parcela pós-lance", brl(data.postLanceInstallment), "1ª parcela projetada após o lance"],
      ["Amortização aplicada", brl0(data.applied), "min(lance total, capacidade amortizável)"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 }, 1: { cellWidth: 45 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  /* ── WARNINGS ── */
  if (data.warnings.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 80, 0);
    doc.text("Avisos do motor de cálculo", 14, y);
    y += 5;

    data.warnings.forEach((w) => {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const lines = doc.splitTextToSize(`⚠ ${w}`, pw - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  /* ── TABELA DE RESUMO ── */
  doc.addPage();
  y = 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Resumo da operação", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Item", "Valor", "Leitura"]],
    body: data.summaryRows.map((r) => [r.item, r.value, r.read]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  /* ── PROJEÇÃO MENSAL ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Projeção mensal completa", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Mês", "Carta corrigida", "Evento", "Lance aplicado", "Parcela / projeção", "Saldo estimado"]],
    body: data.projection.rows.map((r) => [
      r.month.toString(),
      brl0(r.credit),
      r.event,
      r.lance > 0 ? brl(r.lance) : "—",
      r.projected > 0 ? brl(r.projected) : "—",
      brl0(r.balance),
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: LIGHT },
    didParseCell: (hookData) => {
      if (hookData.section === "body") {
        const row = data.projection.rows[hookData.row.index];
        if (row?.event === "Lance aplicado") {
          hookData.cell.styles.fillColor = [255, 237, 213];
          hookData.cell.styles.textColor = [180, 60, 0];
        } else if (row?.tags?.includes("Reajuste")) {
          hookData.cell.styles.fillColor = [255, 247, 237];
          hookData.cell.styles.textColor = [180, 80, 0];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  /* ── BLOCO DE TRANSPARÊNCIA ── */
  doc.addPage();
  y = 20;

  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y - 4, pw - 28, 42, 3, 3, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("TRANSPARÊNCIA E METODOLOGIA", 20, y + 4);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  const transparencyLines = doc.splitTextToSize(TRANSPARENCY_TEXT, pw - 40);
  doc.text(transparencyLines, 20, y + 12);

  y += 50;

  /* ── RODAPÉ OBRIGATÓRIO (todas as páginas) ── */
  drawFooter(doc, data);

  /* ── SALVAR ── */
  const filename = `raio-x-contemplacao-${data.simulationId}.pdf`;
  doc.save(filename);
}
