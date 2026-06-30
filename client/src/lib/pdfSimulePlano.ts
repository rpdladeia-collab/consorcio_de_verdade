/**
 * Gerador de PDF — Módulo 1: Raio-X da Parcela
 * Rodapé obrigatório: consorciodeverdade.com.br | Gerado em: [DATA/HORA] | Motor Matemático v1.0 | ID: [HASH]
 * Bloco de transparência: texto exato aprovado pelo usuário.
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
export interface ScheduleRow {
  month: number;
  credit: number;
  opening: number;
  fc: number;
  ta: number;
  fr: number;
  insurance: number;
  installment: number;
  paidTotal: number;
  balance: number;
  tags: string[];
}

export interface PdfInput {
  // Parâmetros do formulário
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  insuranceRate: number;
  adjRate: number;
  adjEvery: string;
  mode: string;
  ranges: string;
  // Resultado da procedure
  rows: ScheduleRow[];
  paidTotal: number;
  residual: number;
  finalCredit: number;
  initialObligation: number;
  insuranceTotal: number;
  correctionNominal: number;
  warnings: string[];
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

/* ─── Pré-carregamento de imagem como base64 ─── */
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

/* ─── Rodapé obrigatório ─── */
function drawFooter(doc: jsPDF, data: PdfInput) {
  const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  const footerText = `${DOMAIN}  |  Gerado em: ${formatDate(data.generatedAt)}  |  Motor Matemático ${MOTOR_VERSION}  |  ID: ${data.simulationId}`;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Linha separadora
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.4);
    doc.line(14, ph - 16, pw - 14, ph - 16);

    // Texto do rodapé
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(footerText, pw / 2, ph - 10, { align: "center" });

    // Número de página
    doc.text(`${i} / ${pageCount}`, pw - 14, ph - 10, { align: "right" });
  }
}

/* ─── Gerador principal ─── */
export async function generatePdfSimulePlano(data: PdfInput): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  let y = 0;

  /* ── CAPA / CABEÇALHO ── */
  // Fundo escuro
  doc.setFillColor(...INK);
  doc.rect(0, 0, pw, 52, "F");

  // Logomarca oficial no canto superior direito (pré-carregada como base64)
  try {
    const logoUrl = window.location.origin + "/manus-storage/logo-pdf_03e08f7d.jpg";
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", pw - 22, 9, 14, 14);
  } catch {
    // Logo não disponível — continua sem ela
  }

  // Logomarca textual
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text("Consórcio de Verdade", 14, 18);

  // Subtítulo
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Simulação matemática · Consórcio de Verdade", 14, 25);

  // Título do relatório
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("Raio-X da Parcela", 14, 40);

  // Módulo
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...ORANGE);
  doc.text("MÓDULO 1", 14, 47);

  y = 62;

  /* ── PARÂMETROS ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Parâmetros informados", 14, y);
  y += 5;

  const adjLabel =
    data.adjEvery === "0"
      ? "Sem reajuste"
      : data.adjEvery === "6"
      ? "Semestral"
      : "Anual";

  autoTable(doc, {
    startY: y,
    head: [["Parâmetro", "Valor"]],
    body: [
      ["Carta de crédito", brl0(data.credit)],
      ["Prazo total", `${data.term} meses`],
      ["Taxa de administração", `${data.adminRate.toFixed(2)}%`],
      ["Fundo de reserva", `${data.reserveRate.toFixed(2)}%`],
      ["Seguro mensal", data.insuranceRate > 0 ? `${data.insuranceRate.toFixed(4)}%` : "Não informado"],
      ["Correção estimada", `${data.adjRate.toFixed(2)}% (${adjLabel})`],
      ["Modelo de parcela", data.mode === "linear" ? "Linear" : "Não linear"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  /* ── KPIs ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Resultados principais", 14, y);
  y += 5;

  const first = data.rows[0]?.installment ?? 0;
  const maxInstallment = Math.max(...data.rows.map((r) => r.installment));

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor", "Observação"]],
    body: [
      ["1ª parcela", brl(first), "Parcela estimada no mês 1"],
      ["Maior parcela", brl(maxInstallment), "Pressão máxima de caixa"],
      ["Total pago projetado", brl0(data.paidTotal), "Inclui seguro, se informado"],
      ["Carta final corrigida", brl0(data.finalCredit), `Após reajustes de ${data.adjRate.toFixed(1)}%`],
      ["Saldo final (residual)", brl(data.residual), data.residual > 1 ? "⚠ Revisar faixas não lineares" : "Plano fecha no prazo ✓"],
      ...(data.insuranceTotal > 0 ? [["Seguro total projetado", brl0(data.insuranceTotal), "Calculado sobre saldo residual mensal"]] : []),
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 }, 1: { cellWidth: 50 } },
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

  /* ── FLUXO MENSAL ── */
  doc.addPage();
  y = 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Fluxo mensal completo", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Mês", "Carta", "Saldo inicial", "F. Comum", "T. Adm.", "F. Reserva", "Seguro", "Parcela", "Pago acum.", "Saldo final"]],
    body: data.rows.map((r) => [
      r.month.toString(),
      brl0(r.credit),
      brl0(r.opening),
      brl(r.fc),
      brl(r.ta),
      brl(r.fr),
      r.insurance > 0.005 ? brl(r.insurance) : "—",
      brl(r.installment),
      brl0(r.paidTotal),
      brl0(r.balance),
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: LIGHT },
    didParseCell: (hookData) => {
      if (hookData.section === "body") {
        const rowIndex = hookData.row.index;
        const row = data.rows[rowIndex];
        if (row?.tags.includes("Reajuste")) {
          hookData.cell.styles.fillColor = [255, 237, 213]; // laranja claro
          hookData.cell.styles.textColor = [180, 60, 0];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  /* ── BLOCO DE TRANSPARÊNCIA ── */
  doc.addPage();
  y = 20;

  // Fundo cinza claro
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

  /* ── MEMÓRIA DE CÁLCULO ── */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Memória de cálculo", 14, y);
  y += 5;

  const adjCount = data.rows.filter((r) => r.tags.includes("Reajuste")).length;

  autoTable(doc, {
    startY: y,
    head: [["Etapa", "Valor", "Fórmula / Nota"]],
    body: [
      ["Carta de crédito", brl0(data.credit), "Valor nominal contratado"],
      ["Obrigação inicial total", brl0(data.initialObligation), `Carta + ${data.adminRate.toFixed(1)}% adm + ${data.reserveRate.toFixed(1)}% reserva`],
      ["Parcela linear base (mês 1)", brl(data.initialObligation / data.term), `${brl0(data.initialObligation)} ÷ ${data.term} meses`],
      ["Carta final corrigida", brl0(data.finalCredit), `Após ${adjCount} reajuste(s) de ${data.adjRate.toFixed(1)}%`],
      ["Correção nominal acumulada", brl0(data.correctionNominal), "Δ fundo comum + Δ taxa adm + Δ fundo reserva"],
      ...(data.insuranceTotal > 0
        ? [["Seguro total projetado", brl0(data.insuranceTotal), `${data.insuranceRate.toFixed(4)}% × saldo residual mensal`]]
        : []),
      ["Total pago projetado", brl0(data.paidTotal), "Σ parcelas mensais (componentes + seguro)"],
      ["Saldo final (residual)", brl(data.residual), data.residual < 1 ? "Plano fecha no prazo ✓" : "Revisar faixas não lineares"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 }, 1: { cellWidth: 45 } },
    margin: { left: 14, right: 14 },
  });

  /* ── RODAPÉ OBRIGATÓRIO (todas as páginas) ── */
  drawFooter(doc, data);

  /* ── SALVAR ── */
  const filename = `raio-x-simule-seu-plano-${data.simulationId}.pdf`;
  doc.save(filename);
}
