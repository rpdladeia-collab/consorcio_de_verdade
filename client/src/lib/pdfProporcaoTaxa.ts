/**
 * Gerador de PDF — Módulo 4: Proporção da Taxa
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

export interface PdfProporcaoTaxaData {
  kpis: { nominal: number; onLiquid: number; onNew: number; penalty: number };
  adminValue: number;
  liquidCredit: number;
  newMoney: number;
  meter: { widthPct: number; label: string; cls: string; text: string };
  readboxes: { title: string; body: string; formula?: string }[];
  table: { indicator: string; value: string; reading: string }[];
  simulationId: string;
  generatedAt: string;
  form: { credit: string; adminPct: string; paid: string; own: string; fgts: string; embedded: string; basis: string };
}

function drawFooter(doc: jsPDF, data: PdfProporcaoTaxaData) {
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

export async function generatePdfProporcaoTaxa(data: PdfProporcaoTaxaData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  let y = 0;

  // Cabeçalho editorial
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(14, 8, pw - 14, 8);
  try {
    const logoUrl = window.location.origin + "/brand/logo-light.png";
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", pw - 20, 5, 12, 12);
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
      ["Taxa de administração (%)", `${data.form.adminPct}%`],
      ["Parcelas pagas", data.form.paid],
      ["Lance próprio", brl0(parseFloat(data.form.own))],
      ["FGTS", brl0(parseFloat(data.form.fgts))],
      ["Lance embutido", brl0(parseFloat(data.form.embedded))],
      ["Base de cálculo", data.form.basis === "newMoney" ? "Dinheiro novo" : "Carta líquida"],
    ],
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // KPIs
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Indicadores de proporção", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Taxa nominal (contratual)", `${data.kpis.nominal.toFixed(2).replace(".", ",")}%`],
      ["Taxa sobre carta líquida", `${data.kpis.onLiquid.toFixed(2).replace(".", ",")}%`],
      ["Taxa sobre dinheiro novo", `${data.kpis.onNew.toFixed(2).replace(".", ",")}%`],
      ["Peso adicional da taxa", `${data.kpis.penalty.toFixed(2).replace(".", ",")}%`],
      ["Valor da administração", brl(data.adminValue)],
      ["Carta líquida", brl0(data.liquidCredit)],
      ["Dinheiro novo", brl0(data.newMoney)],
    ],
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Termômetro (texto)
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text(`Termômetro: ${data.meter.label}`, 14, y); y += 5;
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
  const mLines = doc.splitTextToSize(data.meter.text, pw - 28);
  doc.text(mLines, 14, y); y += mLines.length * 4.5 + 6;

  // Readboxes
  data.readboxes.forEach((rb) => {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
    doc.text(rb.title, 14, y); y += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(rb.body, pw - 28);
    doc.text(lines, 14, y); y += lines.length * 4.5 + 4;
    if (rb.formula) {
      doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
      const fLines = doc.splitTextToSize(rb.formula, pw - 28);
      doc.text(fLines, 14, y); y += fLines.length * 4 + 4;
    }
  });

  // Tabela de indicadores
  if (y > 200) { doc.addPage(); y = 20; }
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK);
  doc.text("Tabela de indicadores", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor", "Leitura"]],
    body: data.table.map((r) => [r.indicator, r.value, r.reading]),
    headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 2: { cellWidth: 70 } },
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
  doc.save(`raio-x-proporcao-taxa-${data.simulationId}.pdf`);
}
