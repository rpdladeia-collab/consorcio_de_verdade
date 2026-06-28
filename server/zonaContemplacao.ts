/**
 * Zona de Contemplação — Lógica de servidor
 * Fiel ao HTML original: ZonadeContemplação_ConsórciodeVerdade.html
 *
 * ABA 1 — Histórico de Contemplações
 *   Inputs: linhas {ass, low, mid, high}, meuLance, metodo (media|mediana), modalidade
 *   Outputs: kLow, kMid, kHigh, pos (0-100), diffRef, bandRow, chips
 *
 * ABA 2 — Quantitativo das Contemplações
 *   Inputs: linhas {ass, sg, p30, p50, c30, c50, csort, clivre, clim, outras}, prazo
 *   Outputs: total, indice, nec, cob, probSorteioGeral, status, odds30, odds50, chips
 *
 * ABA 3 — Leitura Técnica
 *   Derived from ABA 1 data: trend, position analysis, readboxes
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoricoRow {
  ass: number;
  low: number;
  mid: number;
  high: number;
}

export interface QuantRow {
  ass: number;
  sg: number;       // base geral (total de cotas do grupo)
  p30: number;      // participantes fixo 30%
  p50: number;      // participantes fixo 50%
  c30: number;      // contemplações fixo 30%
  c50: number;      // contemplações fixo 50%
  csort: number;    // contemplações sorteio geral
  clivre: number;   // contemplações lance livre
  clim: number;     // contemplações lance limitado
  outras: number;   // outras contemplações
}

export interface ZonaHistoricoInput {
  rows: HistoricoRow[];
  meuLance: number;
  metodo: "media" | "mediana";
  modalidade: string;
}

export interface ZonaQuantInput {
  rows: QuantRow[];
  prazo: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  const v = arr.filter((x) => x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

function median(arr: number[]): number {
  const v = arr.filter((x) => x > 0).sort((a, b) => a - b);
  if (!v.length) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 === 0 ? (v[mid - 1] + v[mid]) / 2 : v[mid];
}

function stat(arr: number[], metodo: "media" | "mediana"): number {
  return metodo === "mediana" ? median(arr) : avg(arr);
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

function fmtPct(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(2).replace(".", ",") + "%";
}

function fmtSignedPP(n: number): string {
  const abs = Math.abs(Number.isFinite(n) ? n : 0);
  const sign = Number.isFinite(n) && n > 0 ? "+" : "";
  return sign + abs.toFixed(2).replace(".", ",") + " p.p.";
}

// ─── ABA 1: Histórico de Contemplações ────────────────────────────────────────

export interface ZonaHistoricoResult {
  kLow: string;
  kMid: string;
  kHigh: string;
  kLowRaw: number;
  kMidRaw: number;
  kHighRaw: number;
  meuLance: string;
  meuLanceRaw: number;
  pos: number;          // 0-100 para o pin no termômetro
  diffRef: string;
  diffRefRaw: number;
  bandLow: string;
  bandMid: string;
  bandHigh: string;
  bandMe: string;
  bandDiff: string;
  chips: Array<{ label: string; cls: "yellow" | "green" | "red" }>;
  chartData: Array<{ label: string; low: number; mid: number; high: number }>;
  trend: { label: string; detail: string; cls: string };
  readboxes: Array<{ title: string; body: string }>;
  hasData: boolean;
}

export function calcHistorico(input: ZonaHistoricoInput): ZonaHistoricoResult {
  const { rows, meuLance, metodo, modalidade } = input;
  const data = rows.filter((r) => r.low > 0 || r.mid > 0 || r.high > 0);

  const lowVals = data.map((r) => r.low);
  const midVals = data.map((r) => r.mid);
  const highVals = data.map((r) => r.high);

  const kLowRaw = stat(lowVals, metodo);
  const kMidRaw = stat(midVals, metodo);
  const kHighRaw = stat(highVals, metodo);

  let pos = 0;
  let diffRefRaw = 0;
  let hasData = false;

  if (data.length && kLowRaw && kMidRaw && kHighRaw) {
    hasData = true;
    const minScale = Math.max(0, kLowRaw - 10);
    const maxScale = Math.max(kHighRaw + 10, meuLance + 5, 100);
    pos = clamp(((meuLance - minScale) / (maxScale - minScale)) * 100, 0, 100);
    diffRefRaw = meuLance - kMidRaw;
  }

  const chips: ZonaHistoricoResult["chips"] = [];
  if (hasData) {
    chips.push({ label: `Lance testado: ${fmtPct(meuLance)}`, cls: "yellow" });
    chips.push({ label: `Diferença vs referência: ${fmtSignedPP(diffRefRaw)}`, cls: "yellow" });
    chips.push({ label: `Método: ${metodo === "mediana" ? "Mediana" : "Média simples"}`, cls: "yellow" });
    chips.push({ label: `Modalidade: ${modalidade}`, cls: "yellow" });
  }

  // Trend (mínimo 6 assembleias)
  let trend = { label: "—", detail: "mínimo 6 assembleias", cls: "trend-flat" };
  if (data.length >= 6) {
    const last3 = avg(data.slice(0, 3).map((r) => r.mid).filter((x) => x > 0));
    const prev3 = avg(data.slice(3, 6).map((r) => r.mid).filter((x) => x > 0));
    const diff = last3 - prev3;
    if (Math.abs(diff) < 1) {
      trend = { label: "→ Estável", detail: `variação de ${fmtSignedPP(diff)} nas médias`, cls: "trend-flat" };
    } else if (diff > 0) {
      trend = { label: "↑ Alta", detail: `alta de ${fmtSignedPP(diff)} nas últimas 3 assembleias`, cls: "trend-up" };
    } else {
      trend = { label: "↓ Queda", detail: `queda de ${fmtSignedPP(Math.abs(diff))} nas últimas 3 assembleias`, cls: "trend-down" };
    }
  }

  // Readboxes (leitura técnica derivada dos dados históricos)
  const readboxes: ZonaHistoricoResult["readboxes"] = [];
  if (hasData) {
    const spread = kHighRaw - kLowRaw;
    readboxes.push({
      title: "Dispersão histórica",
      body: `A amplitude entre o menor (${fmtPct(kLowRaw)}) e o maior (${fmtPct(kHighRaw)}) lance registrado é de ${fmtPct(spread)}. Spreads acima de 20 p.p. indicam grupos com alta variabilidade — o lance "médio" pode ser enganoso.`,
    });

    const posLabel =
      meuLance < kLowRaw
        ? "abaixo do piso histórico"
        : meuLance <= kMidRaw
        ? "entre o piso e a referência central"
        : meuLance <= kHighRaw
        ? "entre a referência central e o teto"
        : "acima do teto histórico";

    readboxes.push({
      title: "Posicionamento do lance testado",
      body: `O lance de ${fmtPct(meuLance)} está ${posLabel}. A diferença em relação à referência central (${fmtPct(kMidRaw)}) é de ${fmtSignedPP(diffRefRaw)}. Isso é uma leitura histórica — não uma garantia de contemplação.`,
    });

    readboxes.push({
      title: "Aviso educativo",
      body: `Este histórico é informado pelo próprio usuário com base em dados públicos das assembleias. Não representa promessa ou garantia de contemplação futura. O comportamento dos lances pode mudar a qualquer momento conforme a dinâmica do grupo.`,
    });
  }

  // Chart data (ordenado por assembleia crescente para exibição)
  const chartData = [...data]
    .sort((a, b) => a.ass - b.ass)
    .map((r) => ({ label: `Ass. ${r.ass}`, low: r.low, mid: r.mid, high: r.high }));

  return {
    kLow: fmtPct(kLowRaw),
    kMid: fmtPct(kMidRaw),
    kHigh: fmtPct(kHighRaw),
    kLowRaw,
    kMidRaw,
    kHighRaw,
    meuLance: fmtPct(meuLance),
    meuLanceRaw: meuLance,
    pos,
    diffRef: fmtSignedPP(diffRefRaw),
    diffRefRaw,
    bandLow: fmtPct(kLowRaw),
    bandMid: fmtPct(kMidRaw),
    bandHigh: fmtPct(kHighRaw),
    bandMe: fmtPct(meuLance),
    bandDiff: hasData ? fmtSignedPP(diffRefRaw) : "—",
    chips,
    chartData,
    trend,
    readboxes,
    hasData,
  };
}

// ─── ABA 2: Quantitativo das Contemplações ────────────────────────────────────

export interface ZonaQuantResult {
  totalCont: number;
  indice: string;
  nec: string;
  necRaw: number;
  cob: string;
  cobRaw: number;
  probSorteioGeral: string;
  probSorteioDetalhe: string;
  status: { title: string; detail: string; chip: "green" | "yellow" | "red" };
  pin: number; // 0-100
  odds30: { pct: string; txt: string; barWidth: number };
  odds50: { pct: string; txt: string; barWidth: number };
  chips: Array<{ label: string; cls: "yellow" | "green" | "red" }>;
  distribText: string;
  restanteText: string;
  leituraText: string;
  prazoRestante: number;
  baseGeral: number;
  mediaRealizada: number;
}

export function calcQuant(input: ZonaQuantInput): ZonaQuantResult {
  const { rows, prazo } = input;

  const sum = (k: keyof QuantRow) =>
    rows.reduce((a, r) => a + (r[k] as number || 0), 0);

  const latest = rows.length ? Math.max(...rows.map((r) => r.ass || 0)) : 0;
  const baseRow = rows.find((r) => r.ass === latest) || rows[0];
  const baseGeral = baseRow ? baseRow.sg : 0;
  const rest = Math.max(1, prazo - latest);

  const sLivre = sum("clivre");
  const sLim = sum("clim");
  const sC30 = sum("c30");
  const sC50 = sum("c50");
  const sSort = sum("csort");
  const sOutras = sum("outras");
  const total = sLivre + sLim + sC30 + sC50 + sSort + sOutras;
  const mediaReal = rows.length ? total / rows.length : 0;
  const participantes = sum("sg");
  const indiceRaw = participantes ? (total / participantes) * 100 : 0;

  // Média necessária = base geral da última assembleia / prazo restante
  const necRaw = baseGeral ? baseGeral / rest : 0;
  const cobRaw = necRaw ? (mediaReal / necRaw) * 100 : 0;

  const probSorteioGeralRaw = participantes ? (sSort / participantes) * 100 : 0;
  const inversa = sSort ? participantes / sSort : 0;
  const probSorteioDetalhe = sSort
    ? `aprox. 1 em ${inversa.toFixed(1).replace(".", ",")} cotas`
    : "sorteio geral / base geral";

  let status: ZonaQuantResult["status"] = {
    title: "Sem base suficiente",
    detail: "Selecione assembleias para analisar.",
    chip: "red",
  };
  let pin = 0;

  if (baseGeral && total) {
    pin = clamp(cobRaw, 0, 140) / 140 * 100;
    if (cobRaw >= 110) {
      status = {
        title: "Ritmo acima do necessário",
        detail: "No recorte selecionado, a média realizada ficou acima da média matemática necessária. É um sinal positivo, mas não garante manutenção futura.",
        chip: "green",
      };
    } else if (cobRaw >= 85) {
      status = {
        title: "Ritmo compatível",
        detail: "No recorte selecionado, a média realizada está próxima da média necessária para o prazo restante.",
        chip: "yellow",
      };
    } else if (cobRaw >= 55) {
      status = {
        title: "Ritmo abaixo do ideal",
        detail: "No recorte selecionado, a média realizada está abaixo da média necessária. O grupo exige cautela.",
        chip: "yellow",
      };
    } else {
      status = {
        title: "Ritmo crítico",
        detail: "No recorte selecionado, a média realizada está muito abaixo da média necessária. Atenção máxima.",
        chip: "red",
      };
    }
  }

  const p30 = sum("p30");
  const p50 = sum("p50");
  const c30 = sum("c30");
  const c50 = sum("c50");
  const pct30 = p30 ? (c30 / p30) * 100 : 0;
  const pct50 = p50 ? (c50 / p50) * 100 : 0;

  const chips: ZonaQuantResult["chips"] = [];
  chips.push({ label: `Prazo restante: ${rest}`, cls: "yellow" });
  chips.push({ label: `Base geral: ${baseGeral.toLocaleString("pt-BR")}`, cls: status.chip });
  chips.push({ label: `Média realizada: ${mediaReal.toFixed(1).replace(".", ",")}`, cls: status.chip });
  chips.push({ label: `Cobertura: ${cobRaw.toFixed(0)}%`, cls: status.chip });

  return {
    totalCont: total,
    indice: fmtPct(indiceRaw),
    nec: necRaw.toFixed(1).replace(".", ","),
    necRaw,
    cob: `${cobRaw.toFixed(0)}%`,
    cobRaw,
    probSorteioGeral: fmtPct(probSorteioGeralRaw),
    probSorteioDetalhe,
    status,
    pin,
    odds30: {
      pct: `${pct30.toFixed(2).replace(".", ",")}%`,
      txt: p30 && c30
        ? `1 para cada ${(p30 / c30).toFixed(1).replace(".", ",")} cotas`
        : "preencha participantes e contemplações",
      barWidth: clamp(pct30, 0, 100),
    },
    odds50: {
      pct: `${pct50.toFixed(2).replace(".", ",")}%`,
      txt: p50 && c50
        ? `1 para cada ${(p50 / c50).toFixed(1).replace(".", ",")} cotas`
        : "preencha participantes e contemplações",
      barWidth: clamp(pct50, 0, 100),
    },
    chips,
    distribText: `${total.toLocaleString("pt-BR")} contemplações selecionadas. Sorteio geral: ${sSort.toLocaleString("pt-BR")}. Outras: ${sOutras.toLocaleString("pt-BR")}. Taxa histórica do sorteio geral: ${fmtPct(probSorteioGeralRaw)}.`,
    restanteText: `${prazo} - ${latest} = ${rest} assembleias. Média necessária: ${necRaw.toFixed(1).replace(".", ",")}.`,
    leituraText: `Média realizada de ${mediaReal.toFixed(1).replace(".", ",")} contemplações por assembleia versus média necessária de ${necRaw.toFixed(1).replace(".", ",")}.`,
    prazoRestante: rest,
    baseGeral,
    mediaRealizada: mediaReal,
  };
}
