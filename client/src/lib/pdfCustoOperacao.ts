/**
 * Gerador de PDF — Módulo 3: Custo da Operação
 * Padrão aprovado: logo no canto superior direito, rodapé obrigatório, bloco de transparência.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MOTOR_VERSION = "v1.0";
const DOMAIN = "consorciodeverdade.com.br";
const TRANSPARENCY_TEXT =
  "Transparência e Metodologia: Este relatório apresenta uma projeção matemática baseada em parâmetros fornecidos pelo usuário, " +
  "destinada exclusivamente à compreensão da dinâmica financeira do produto. Esta análise é uma projeção independente para apoio " +
  "à decisão e não substitui o contrato oficial. Toda e qualquer informação deve ser validada diretamente com a Administradora " +
  "de Consórcios antes de qualquer decisão.";

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

export interface PdfCustoOperacaoData {
  kpis: { contractualAdmin: number; adminCorrection: number; projectedInsurance: number; explicitCost: number; fcCorrection: number };
  readboxes: { title: string; body: string }[];
  classificationTable: { item: string; value: string; classification: string; reading: string }[];
  rows: { month: number; credit: number; installment: number; insurance: number; balance: number; tags?: string[] }[];
  warnings: string[];
  totalPaidNominal: number;
  simulationId: string;
  generatedAt: string;
  form: { credit: string; term: string; adminRate: string; reserveRate: string; insuranceRate: string; adjRate: string; adjEvery: string; mode: string };
}

function drawFooter(doc: jsPDF, data: PdfCustoOperacaoData) {
  const pageCount = (doc as any).internal.getNumberOfPages();
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

export async function generatePdfCustoOperacao(data: PdfCustoOperacaoData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  let y = 0;

  // Cabeçalho editorial
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(14, 8, pw - 14, 8);
  
  // Título Centralizado
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("RAIO-X DO CUSTO TOTAL", pw / 2, 16, { align: "center" });

  try {
    const logoUrl = window.location.origin + "/brand/logo-light.png";
    const logoBase64 = await loadImageAsBase64(logoUrl);
    // Logo r.enatto redimensionada (h-10 equivalente em mm é ~3.5mm, mas vamos usar 8mm para visibilidade profissional)
    doc.addImage(logoBase64, "PNG", pw - 35, 11, 21, 8);
  } catch { /* sem logo */ }

  doc.line(14, 22, pw - 14, 22);
  y = 30;

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
      ["Seguro (% saldo/mês)", `${data.form.insuranceRate}%`],
      ["Correção anual", `${data.form.adjRate}%`],
      ["Periodicidade", data.form.adjEvery === "0" ? "Sem correção" : data.form.adjEvery === "6" ? "Semestral" : "Anual"],
      ["Modelo de parcela", data.form.mode === "linear" ? "Linear" : "Não linear"],
    ],
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Indicadores
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Indicadores principais", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Taxa adm. contratual", brl(data.kpis.contractualAdmin)],
      ["Adm. sobre correções", brl(data.kpis.adminCorrection)],
      ["Seguro projetado", brl(data.kpis.projectedInsurance)],
      ["Custo explícito total", brl(data.kpis.explicitCost)],
      ["Total pago nominal", brl(data.totalPaidNominal)],
    ],
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Avisos
  if (data.warnings.length > 0) {
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

  // Tabela de classificação econômica
  doc.addPage(); y = 20;
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Classificação econômica dos componentes", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Componente", "Valor", "Classificação", "Leitura"]],
    body: data.classificationTable.map((r) => [r.item, r.value, r.classification, r.reading]),
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 3: { cellWidth: 55 } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Transparência
  doc.addPage(); y = 20;
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Transparência e Metodologia", 14, y); y += 6;
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
  const tLines = doc.splitTextToSize(TRANSPARENCY_TEXT, pw - 28);
  doc.text(tLines, 14, y);

  drawFooter(doc, data);
  doc.save(`raio-x-custo-total-${data.simulationId}.pdf`);
}
