/**
 * Gerador de PDF — Zona de Contemplação 2026
 * Padrão aprovado: logo 14×14 canto superior direito, rodapé obrigatório, bloco de transparência.
 * Rodapé: consorciodeverdade.com.br | Gerado em: [DATA/HORA] | Motor Matemático v1.0 | ID: [HASH]
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Constantes ─── */
const MOTOR_VERSION = "v1.0";
const DOMAIN = "consorciodeverdade.com.br";
const TRANSPARENCY_TEXT =
  "Transparência e Metodologia: Este simulador apresenta uma leitura histórica de lances e " +
  "quantitativo de contemplações com base nos dados informados pelo usuário. O resultado é " +
  "educativo e não garante contemplação futura. Consulte sempre o contrato, regulamento, " +
  "regras da administradora, caixa do grupo e critérios de desempate. " +
  "Essa é uma simulação baseada em dados incluídos pelo usuário - apenas com finalidade de conhecer a dinâmica do mercado de consórcio - não deve ser vista como recomendação financeira ou promessa de contemplação.";

/* ─── Cores (RGB) ─── */
const INK: [number, number, number] = [17, 17, 17];
const ORANGE: [number, number, number] = [242, 106, 33];
const GRAY: [number, number, number] = [120, 120, 120];
const LIGHT: [number, number, number] = [247, 243, 234];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [39, 192, 125];
const YELLOW: [number, number, number] = [244, 211, 79];
const RED: [number, number, number] = [229, 72, 72];

/* ─── Helpers ─── */
function fmt(n: number): string {
  return (
    (Number.isFinite(n)
      ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0,00") + "%"
  );
}

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

function addHeader(doc: jsPDF, grupoNome: string, titulo: string, logoBase64?: string) {
  const W = doc.internal.pageSize.getWidth();
  // Faixa laranja no topo
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, W, 18, "F");

  // Título principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text("ZONA DE CONTEMPLAÇÃO.2026", 12, 12);

  // Logo no canto superior direito (se disponível)
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", W - 22, 2, 14, 14); } catch { /* sem logo */ }
  }

  // Subtítulo à direita (apenas se sem logo)
  if (!logoBase64) {
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    doc.text("consorciodeverdade.com.br", W - 12, 7, { align: "right" });
    doc.text("renatto", W - 12, 13, { align: "right" });
  }

  // Nome do grupo
  doc.setFillColor(...INK);
  doc.rect(0, 18, W, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...LIGHT);
  doc.text(grupoNome || "Grupo não informado", 12, 25);
  doc.setTextColor(180, 180, 180);
  doc.text(titulo, W - 12, 25, { align: "right" });
}

function addFooter(doc: jsPDF, hash: string) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const now = new Date().toLocaleString("pt-BR");

  doc.setFillColor(245, 240, 232);
  doc.rect(0, H - 14, W, 14, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`${DOMAIN} · Gerado em: ${now} · Motor Matemático ${MOTOR_VERSION} · ID: ${hash}`, W / 2, H - 5, { align: "center" });
}

function addTransparency(doc: jsPDF, y: number): number {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(250, 246, 238);
  doc.setDrawColor(...ORANGE);
  doc.roundedRect(12, y, W - 24, 18, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...ORANGE);
  doc.text("TRANSPARÊNCIA E METODOLOGIA", 16, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(TRANSPARENCY_TEXT, W - 30);
  doc.text(lines, 16, y + 10);
  return y + 22;
}

/* ─── Tipos de entrada ─── */

interface HistoricoRowPdf {
  ass: number;
  low: number;
  mid: number;
  high: number;
}

interface QuantitativoRowPdf {
  ass: number;
  sg: number;
  p30: number;
  p50: number;
  clivre: number;
  clim: number;
  c30: number;
  c50: number;
  csort: number;
  outras: number;
}

interface ZonaResultPdf {
  low: number;
  mid: number;
  high: number;
  trend: { label: string; detail: string; cls: string };
  position: { title: string; detail: string; pos: number };
  pressao: { label: string; detail: string };
  chips: { text: string; cls: string }[];
  simulationId: string;
  generatedAt: string;
}

interface QuantResultPdf {
  totalCont: number;
  indice: number;
  nec: number;
  cob: number;
  probSorteioGeral: number;
  probSorteioDetalhe: string;
  hStatus: { title: string; detail: string; chip: string; pin: number };
  chips: { text: string; cls: string }[];
  fixo30: { pct: number; txt: string };
  fixo50: { pct: number; txt: string };
  odds30Pct: number;
  odds50Pct: number;
  distribText: string;
  restanteText: string;
  trendText: string;
  simulationId: string;
  generatedAt: string;
}

export interface PdfZonaContemplacaoParams {
  tab: "dados" | "quant" | "leitura";
  grupoNome: string;
  zonaResult?: ZonaResultPdf;
  historicoRows?: HistoricoRowPdf[];
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  quantResult?: QuantResultPdf;
  quantRows?: QuantitativoRowPdf[];
}

/* ─── Gerador principal ─── */

export async function gerarPdfZonaContemplacao(params: PdfZonaContemplacaoParams): Promise<void> {
  const { tab, grupoNome, zonaResult, historicoRows, canvasRef, quantResult, quantRows } = params;
  const hash = generateHash();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Pré-carregar logo
  let logoBase64: string | undefined;
  try {
    const logoUrl = window.location.origin + "/manus-storage/logo-pdf-v2_dca9a8b9.jpg";
    logoBase64 = await loadImageAsBase64(logoUrl);
  } catch { /* sem logo */ }

  // ── ABA 1: Histórico de Contemplações ──
  if (tab === "dados" && zonaResult) {
    addHeader(doc, grupoNome, "Histórico de Contemplações", logoBase64);

    let y = 32;

    // KPIs da zona
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("RESUMO DA ZONA", 12, y);
    y += 5;

    const kpis = [
      { label: "Piso histórico", value: fmt(zonaResult.low), color: GREEN },
      { label: "Zona média", value: fmt(zonaResult.mid), color: YELLOW },
      { label: "Teto histórico", value: fmt(zonaResult.high), color: INK },
      { label: "Tendência", value: zonaResult.trend.label, color: ORANGE },
    ];

    const kpiW = (W - 24 - 9) / 4;
    kpis.forEach((k, i) => {
      const kx = 12 + i * (kpiW + 3);
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(...k.color);
      doc.roundedRect(kx, y, kpiW, 18, 3, 3, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...GRAY);
      doc.text(k.label.toUpperCase(), kx + 3, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...INK);
      doc.text(k.value, kx + 3, y + 14);
    });
    y += 22;

    // Zona de entrada + Pressão
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("ZONA DE ENTRADA", 12, y);
    y += 5;
    doc.setFillColor(250, 250, 248);
    doc.setDrawColor(...ORANGE);
    doc.roundedRect(12, y, (W - 24) / 2 - 3, 14, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(zonaResult.position.title, 16, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const posLines = doc.splitTextToSize(zonaResult.position.detail, (W - 24) / 2 - 10);
    doc.text(posLines, 16, y + 11);

    const px2 = 12 + (W - 24) / 2 + 3;
    doc.setFillColor(250, 250, 248);
    doc.setDrawColor(...ORANGE);
    doc.roundedRect(px2, y, (W - 24) / 2 - 3, 14, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("Pressão competitiva: " + zonaResult.pressao.label, px2 + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(zonaResult.pressao.detail, px2 + 4, y + 11);
    y += 18;

    // Tendência detalhe
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text("Tendência: " + zonaResult.trend.detail, 12, y);
    y += 6;

    // Gráfico Canvas
    if (canvasRef?.current) {
      try {
        const imgData = canvasRef.current.toDataURL("image/png");
        const chartH = 60;
        const chartW = W - 24;
        doc.setFillColor(247, 243, 234);
        doc.roundedRect(12, y, chartW, chartH, 3, 3, "F");
        doc.addImage(imgData, "PNG", 12, y, chartW, chartH);
        y += chartH + 4;
      } catch (_) {
        // canvas não disponível
      }
    }

    // Tabela histórico
    if (historicoRows?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...INK);
      doc.text("HISTÓRICO MENSAL", 12, y);
      y += 3;
      autoTable(doc, {
        startY: y,
        head: [["Assembleia", "Menor lance (%)", "Lance médio (%)", "Maior lance (%)"]],
        body: historicoRows.map((r) => [r.ass, fmt(r.low), fmt(r.mid), fmt(r.high)]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 248, 244] },
        margin: { left: 12, right: 12 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    y = addTransparency(doc, y);
    addFooter(doc, hash);
    doc.save(`zona_contemplacao_historico_${hash}.pdf`);
    return;
  }

  // ── ABA 2: Quantitativo das Contemplações ──
  if (tab === "quant" && quantResult) {
    addHeader(doc, grupoNome, "Quantitativo das Contemplações", logoBase64);

    let y = 32;

    // 5 KPIs
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("DIAGNÓSTICO", 12, y);
    y += 5;

    const kpis = [
      { label: "Total selecionado", value: String(quantResult.totalCont), color: GREEN },
      { label: "Taxa hist. recorte", value: fmt(quantResult.indice), color: YELLOW },
      { label: "Média necessária", value: quantResult.nec.toLocaleString("pt-BR", { maximumFractionDigits: 1 }), color: ORANGE },
      { label: "Cobertura", value: (quantResult.cob || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "%", color: RED },
      { label: "Taxa sorteio geral", value: fmt(quantResult.probSorteioGeral), color: ORANGE },
    ];

    const kpiW = (W - 24 - 12) / 5;
    kpis.forEach((k, i) => {
      const kx = 12 + i * (kpiW + 3);
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(...k.color);
      doc.roundedRect(kx, y, kpiW, 18, 3, 3, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...GRAY);
      doc.text(k.label.toUpperCase(), kx + 2, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...INK);
      doc.text(k.value, kx + 2, y + 14);
    });
    y += 22;

    // Pulso do grupo
    doc.setFillColor(250, 250, 248);
    doc.setDrawColor(...ORANGE);
    doc.roundedRect(12, y, W - 24, 14, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text("Pulso do grupo: " + quantResult.hStatus.title, 16, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const pulsoLines = doc.splitTextToSize(quantResult.hStatus.detail, W - 32);
    doc.text(pulsoLines, 16, y + 11);
    y += 18;

    // Lance fixo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("LANCE FIXO", 12, y);
    y += 5;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(12, y, (W - 24) / 2 - 3, 16, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("Fixo 30% — Taxa hist.: " + fmt(quantResult.odds30Pct), 16, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const f30Lines = doc.splitTextToSize(quantResult.fixo30.txt, (W - 24) / 2 - 10);
    doc.text(f30Lines, 16, y + 11);

    const fx2 = 12 + (W - 24) / 2 + 3;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(fx2, y, (W - 24) / 2 - 3, 16, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("Fixo 50% — Taxa hist.: " + fmt(quantResult.odds50Pct), fx2 + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const f50Lines = doc.splitTextToSize(quantResult.fixo50.txt, (W - 24) / 2 - 10);
    doc.text(f50Lines, fx2 + 4, y + 11);
    y += 20;

    // Distribuição, Prazo restante, Leitura
    const bullets = [
      { label: "Distribuição", text: quantResult.distribText },
      { label: "Prazo restante", text: quantResult.restanteText },
      { label: "Leitura", text: quantResult.trendText },
    ];
    bullets.forEach((b) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...INK);
      doc.text(b.label + ":", 12, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      const lines = doc.splitTextToSize(b.text, W - 50);
      doc.text(lines, 40, y);
      y += 6;
    });

    // Tabela quantitativo
    if (quantRows?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...INK);
      doc.text("TABELA DE QUANTITATIVO", 12, y);
      y += 3;
      autoTable(doc, {
        startY: y,
        head: [["Ass.", "Base geral", "P.30%", "P.50%", "C.livre", "C.lim.", "C.30%", "C.50%", "Sorteio", "Outras", "Total"]],
        body: quantRows.map((r) => {
          const total = r.clivre + r.clim + r.c30 + r.c50 + r.csort + r.outras;
          return [r.ass, r.sg, r.p30, r.p50, r.clivre, r.clim, r.c30, r.c50, r.csort, r.outras, total];
        }),
        styles: { fontSize: 6.5, cellPadding: 1.5 },
        headStyles: { fillColor: INK, textColor: WHITE, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 248, 244] },
        margin: { left: 12, right: 12 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    y = addTransparency(doc, y);
    addFooter(doc, hash);
    doc.save(`zona_contemplacao_quantitativo_${hash}.pdf`);
    return;
  }

  // ── ABA 3: Leitura Técnica ──
  addHeader(doc, grupoNome, "Leitura Técnica", logoBase64);
  let y = 32;

  doc.setFillColor(250, 246, 238);
  doc.setDrawColor(...ORANGE);
  doc.roundedRect(12, y, W - 24, 50, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ORANGE);
  doc.text("LEITURA TÉCNICA — SEM PROMESSA", 16, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  const leituraText =
    "O simulador Zona de Contemplação 2026 é uma ferramenta educativa. " +
    "Histórico de lance, quantidade de contemplações e taxa histórica observada não garantem contemplação futura. " +
    "Consulte sempre contrato, regulamento, regras da administradora, caixa do grupo e critérios de desempate. " +
    "A leitura depende dos dados informados pelo usuário. " +
    "Essa é uma simulação baseada em dados incluídos pelo usuário - apenas com finalidade de conhecer a dinâmica do mercado de consórcio - não deve ser vista como recomendação financeira ou promessa de contemplação.";
  const leituraLines = doc.splitTextToSize(leituraText, W - 32);
  doc.text(leituraLines, 16, y + 16);
  y += 56;

  y = addTransparency(doc, y);
  addFooter(doc, hash);
  doc.save(`zona_contemplacao_leitura_tecnica_${hash}.pdf`);
}
