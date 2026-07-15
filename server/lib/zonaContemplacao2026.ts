/**
 * Zona de Contemplação 2026 — Motor Matemático
 * Fonte única da verdade: ZONADECONTEMPLAÇÃO.2026_.renatto.html
 * Todas as fórmulas são migração fiel das funções JS originais.
 * NUNCA expor este arquivo no frontend.
 */

// ─── Tipos de entrada ────────────────────────────────────────────────────────

export interface HistoricoRow {
  ass: number;
  low: number;
  mid: number;
  high: number;
}

export interface QuantitativoRow {
  ass: number;
  sg: number;    // base geral
  p30: number;   // participantes fixo 30%
  p50: number;   // participantes fixo 50%
  clivre: number;
  clim: number;
  c30: number;
  c50: number;
  csort: number; // sorteio geral
  outras: number;
}

export interface ZonaHistoricoInput {
  rows: HistoricoRow[];
  meulance: number;
  metodoZona: "media" | "mediana";
  modalidade: string;
  grupoNome: string;
}

export interface ZonaQuantitativoInput {
  rows: QuantitativoRow[];
  selectedIndexes: number[];
  hPrazo: number;
}

// ─── Tipos de saída ──────────────────────────────────────────────────────────

export interface ChipItem {
  text: string;
  cls: "green" | "yellow" | "red";
}

export interface TrendResult {
  label: string;
  detail: string;
  cls: "trend-up" | "trend-down" | "trend-flat";
}

export interface ZonaHistoricoOutput {
  low: number;
  mid: number;
  high: number;
  trend: TrendResult;
  position: {
    title: string;
    detail: string;
    pos: number; // 0–100 para o pin
  };
  pressao: {
    label: string;
    detail: string;
  };
  chips: ChipItem[];
  simulationId: string;
  generatedAt: string;
}

export interface ZonaQuantitativoOutput {
  totalCont: number;
  indice: number;
  nec: number;
  cob: number;
  probSorteioGeral: number;
  probSorteioDetalhe: string;
  hStatus: {
    title: string;
    detail: string;
    chip: "green" | "yellow" | "red";
    pin: number; // 0–100
  };
  chips: ChipItem[];
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

// ─── Helpers internos (fórmulas do HTML original) ────────────────────────────

function avg(arr: HistoricoRow[], key: keyof Pick<HistoricoRow, "low" | "mid" | "high">): number {
  const v = arr.map((r) => r[key]).filter((x) => x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

function median(arr: HistoricoRow[], key: keyof Pick<HistoricoRow, "low" | "mid" | "high">): number {
  const v = arr
    .map((r) => r[key])
    .filter((x) => x > 0)
    .sort((a, b) => a - b);
  if (!v.length) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function stat(
  arr: HistoricoRow[],
  key: keyof Pick<HistoricoRow, "low" | "mid" | "high">,
  metodo: "media" | "mediana"
): number {
  return metodo === "mediana" ? median(arr, key) : avg(arr, key);
}

function meanVals(vals: number[]): number {
  const v = vals.filter((x) => x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

/** trendZone — fiel ao HTML original */
function trendZone(data: HistoricoRow[]): TrendResult {
  if (data.length < 6) {
    return { label: "—", detail: "mínimo 6 assembleias", cls: "trend-flat" };
  }
  const last3 = meanVals(data.slice(0, 3).map((r) => r.mid));
  const prev3 = meanVals(data.slice(3, 6).map((r) => r.mid));
  const diff = last3 - prev3;
  const fmtDiff = Math.abs(diff).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";
  if (Math.abs(diff) < 1) {
    return {
      label: "→ Estável",
      detail: "variação de " + diff.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "% nas médias",
      cls: "trend-flat",
    };
  }
  if (diff > 0) {
    return {
      label: "↑ Alta",
      detail: "3 últimas acima das 3 anteriores em " + fmtDiff,
      cls: "trend-up",
    };
  }
  return {
    label: "↓ Queda",
    detail: "3 últimas abaixo das 3 anteriores em " + fmtDiff,
    cls: "trend-down",
  };
}

function fmt(n: number): string {
  return (
    (Number.isFinite(n)
      ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0,00") + "%"
  );
}

function fmtPP(n: number): string {
  return (
    (Number.isFinite(n)
      ? Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0,00") + " p.p."
  );
}

function generateSimulationId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// ─── Motor 1: Histórico de Contemplações ─────────────────────────────────────

/**
 * runZonaHistorico
 * Migração fiel da função calc() do HTML original.
 * Calcula: piso/zona média/teto, tendência, posição do lance, pressão competitiva, chips.
 */
export function runZonaHistorico(input: ZonaHistoricoInput): ZonaHistoricoOutput {
  const { rows, meulance, metodoZona, modalidade } = input;

  const low = stat(rows, "low", metodoZona);
  const mid = stat(rows, "mid", metodoZona);
  const high = stat(rows, "high", metodoZona);
  const me = meulance;

  const trend = trendZone(rows);

  // Posição do lance (fiel ao calc() do HTML)
  let pos = 0;
  let posTitle = "Sem dados suficientes";
  let posDetail = "Preencha menor, médio e maior lance.";
  const chips: ChipItem[] = [];

  if (rows.length && low && mid && high) {
    // Mapeia diretamente na escala visual [low, high] para que o pin reflita
    // exatamente onde o lance testado cai entre piso e teto.
    if (high > low) {
      pos = clamp(((me - low) / (high - low)) * 100, 0, 100);
    } else {
      pos = 50;
    }

    if (me < low) {
      posTitle = "Abaixo da zona";
      posDetail = "O lance testado está abaixo do piso histórico.";
    } else if (me < mid) {
      posTitle = "Zona de entrada";
      posDetail = "Passou do piso, mas ainda está abaixo da referência central.";
    } else if (me <= high) {
      posTitle = "Zona competitiva";
      posDetail = "Está dentro da faixa central/teto do histórico.";
    } else {
      posTitle = "Zona agressiva";
      posDetail = "Acima do teto histórico. Pode contemplar, mas reduz eficiência.";
    }

    const meChipCls: ChipItem["cls"] = me < low ? "red" : me < mid ? "yellow" : me <= high ? "green" : "red";
    chips.push({ text: "Meu lance: " + fmt(me), cls: meChipCls });

    const distRef = me - mid;
    const distTxt =
      Math.abs(distRef) < 0.005
        ? "na referência central"
        : fmtPP(distRef) + " " + (distRef > 0 ? "acima" : "abaixo") + " da ref. central";
    chips.push({ text: "Distância p/ referência: " + distTxt, cls: distRef >= 0 ? "green" : "yellow" });
    chips.push({ text: "Método: " + (metodoZona === "mediana" ? "Mediana" : "Média simples"), cls: "yellow" });
    chips.push({ text: "Modalidade: " + modalidade, cls: "yellow" });
  }

  // Pressão competitiva (fiel ao calc() do HTML)
  const amp = high && low ? high - low : 0;
  let pressaoLabel = "—";
  let pressaoDetail = "Amplitude entre menor e maior lance.";
  if (amp) {
    if (amp <= 10) {
      pressaoLabel = "Baixa";
      pressaoDetail = "Disputa mais concentrada.";
    } else if (amp <= 22) {
      pressaoLabel = "Média";
      pressaoDetail = "Existe dispersão relevante. Leia com margem.";
    } else {
      pressaoLabel = "Alta";
      pressaoDetail = "Disputa muito aberta. Um lance isolado pode distorcer.";
    }
  }

  return {
    low,
    mid,
    high,
    trend,
    position: { title: posTitle, detail: posDetail, pos },
    pressao: { label: pressaoLabel, detail: pressaoDetail },
    chips,
    simulationId: generateSimulationId(),
    generatedAt: new Date().toISOString(),
  };
}

// ─── Motor 2: Quantitativo das Contemplações ─────────────────────────────────

/**
 * runZonaQuantitativo
 * Migração fiel da função calcHealth() do HTML original.
 * Calcula: total, índice, média necessária, cobertura, taxa sorteio geral,
 * lance fixo 30%/50%, distribuição, diagnóstico.
 */
export function runZonaQuantitativo(input: ZonaQuantitativoInput): ZonaQuantitativoOutput {
  const { rows, selectedIndexes, hPrazo } = input;

  // Filtra linhas selecionadas e válidas (fiel ao selectedHealthRows() do HTML)
  const allWithValid = rows.map((r) => {
    const total = r.clivre + r.clim + r.c30 + r.c50 + r.csort + r.outras;
    const invalid =
      (r.sg > 0 && total > r.sg) ||
      (r.sg > 0 && r.p30 > r.sg) ||
      (r.sg > 0 && r.p50 > r.sg) ||
      r.c30 > r.p30 ||
      r.c50 > r.p50;
    return { ...r, total, invalid };
  });

  const idxToUse = selectedIndexes.length ? selectedIndexes : [0];
  const selected = idxToUse
    .map((i) => allWithValid[i])
    .filter((r) => r !== undefined && !r.invalid);

  const prazo = hPrazo || 120;
  const latest = selected.length ? Math.max(...selected.map((r) => r.ass || 0)) : 0;
  const baseRow = selected.find((r) => r.ass === latest) || selected[0];
  const baseGeral = baseRow ? baseRow.sg : 0;
  const rest = Math.max(1, prazo - latest);

  const sum = (k: keyof QuantitativoRow) =>
    selected.reduce((a, r) => a + (r[k] as number || 0), 0);

  const sLivre = sum("clivre");
  const sLim = sum("clim");
  const sC30 = sum("c30");
  const sC50 = sum("c50");
  const sSort = sum("csort");
  const sOutras = sum("outras");
  const total = sLivre + sLim + sC30 + sC50 + sSort + sOutras;
  const mediaReal = selected.length ? total / selected.length : 0;
  const participantes = sum("sg");
  const indice = participantes ? (total / participantes) * 100 : 0;

  // Lógica central: média necessária = base geral da última assembleia / prazo restante
  const nec = baseGeral ? baseGeral / rest : 0;
  const cob = nec ? (mediaReal / nec) * 100 : 0;

  const probSorteioGeral = participantes ? (sSort / participantes) * 100 : 0;
  const inversa = sSort ? participantes / sSort : 0;
  const probSorteioDetalhe = sSort
    ? "aprox. 1 em " +
      inversa.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
      " cotas"
    : "sorteio geral / base geral";

  // Diagnóstico (fiel ao calcHealth() do HTML)
  let statusTitle = "Sem base suficiente";
  let statusDetail = "Selecione assembleias para analisar.";
  let statusChip: "green" | "yellow" | "red" = "red";
  let pin = 0;

  if (baseGeral && total) {
    pin = clamp(cob, 0, 140) / 140 * 100;
    if (cob >= 110) {
      statusTitle = "Ritmo acima do necessário";
      statusDetail =
        "No recorte selecionado, a média realizada ficou acima da média matemática necessária. É um sinal positivo, mas não garante manutenção futura.";
      statusChip = "green";
    } else if (cob >= 85) {
      statusTitle = "Ritmo compatível";
      statusDetail =
        "No recorte selecionado, a média realizada está próxima da média necessária para o prazo restante.";
      statusChip = "yellow";
    } else if (cob >= 55) {
      statusTitle = "Ritmo abaixo do ideal";
      statusDetail =
        "No recorte selecionado, a média realizada está abaixo da média necessária. O grupo exige cautela.";
      statusChip = "yellow";
    } else {
      statusTitle = "Ritmo crítico";
      statusDetail =
        "No recorte selecionado, a média realizada está muito abaixo da média necessária. Atenção máxima.";
      statusChip = "red";
    }
  }

  const chips: ChipItem[] = [];
  chips.push({ text: "Prazo restante: " + rest, cls: "yellow" });
  chips.push({ text: "Base geral: " + baseGeral.toLocaleString("pt-BR"), cls: statusChip });
  chips.push({
    text: "Média realizada: " + mediaReal.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
    cls: statusChip,
  });
  chips.push({
    text: "Cobertura: " + (cob || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "%",
    cls: statusChip,
  });

  // Lance fixo
  const p30 = sum("p30");
  const p50 = sum("p50");
  const c30 = sum("c30");
  const c50 = sum("c50");
  const pct30 = p30 ? (c30 / p30) * 100 : 0;
  const pct50 = p50 ? (c50 / p50) * 100 : 0;

  const fixo30Txt = p30
    ? `${p30} cotas participantes para ${c30} contemplação(ões). Taxa histórica observada: ${pct30.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
    : "sem dados";
  const fixo50Txt = p50
    ? `${p50} cotas participantes para ${c50} contemplação(ões). Taxa histórica observada: ${pct50.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
    : "sem dados";

  const odds30Txt =
    p30 && c30
      ? "1 para cada " + (p30 / c30).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " cotas"
      : "preencha participantes e contemplações";
  const odds50Txt =
    p50 && c50
      ? "1 para cada " + (p50 / c50).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " cotas"
      : "preencha participantes e contemplações";

  const distribText =
    total.toLocaleString("pt-BR") +
    " contemplações selecionadas. Sorteio geral: " +
    sSort.toLocaleString("pt-BR") +
    ". Outras: " +
    sOutras.toLocaleString("pt-BR") +
    ". Taxa histórica do sorteio geral: " +
    fmt(participantes ? (sSort / participantes) * 100 : 0) +
    ".";

  const restanteText =
    prazo +
    " - " +
    latest +
    " = " +
    rest +
    " assembleias. Média necessária: " +
    nec.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
    ".";

  const trendText =
    "média realizada de " +
    mediaReal.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
    " contemplações por assembleia versus média necessária de " +
    nec.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
    ".";

  return {
    totalCont: total,
    indice,
    nec,
    cob,
    probSorteioGeral,
    probSorteioDetalhe,
    hStatus: { title: statusTitle, detail: statusDetail, chip: statusChip, pin },
    chips,
    fixo30: { pct: pct30, txt: fixo30Txt },
    fixo50: { pct: pct50, txt: fixo50Txt },
    odds30Pct: pct30,
    odds50Pct: pct50,
    distribText,
    restanteText,
    trendText,
    simulationId: generateSimulationId(),
    generatedAt: new Date().toISOString(),
  };
}
