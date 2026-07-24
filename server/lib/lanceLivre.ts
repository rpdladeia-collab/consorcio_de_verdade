/**
 * Lógica matemática do Simulador de Lance Livre.
 * PROTEGIDA NO BACKEND — nunca exposta ao frontend.
 *
 * O lance livre é um percentual de recurso próprio ofertado para
 * antecipar a contemplação. Este simulador mede:
 *  - o desembolso necessário em dinheiro,
 *  - a competitividade frente a uma referência histórica,
 *  - o efeito do lance no fluxo (abatimento de parcelas ou redução de prazo).
 */

const EPS = 1e-9;

export type LanceUse = "abater_parcela" | "reduzir_prazo";

export interface LanceLivreInput {
  credit: number; // carta de crédito (R$)
  adminRate: number; // taxa de administração total (%)
  term: number; // prazo total (meses)
  paidInstallments: number; // parcelas já pagas
  bidPct: number; // lance livre ofertado (% da carta)
  referenceBidPct?: number; // lance médio histórico de referência (%)
  lanceUse?: LanceUse; // destino do lance ao contemplar
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}
function money(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    isFinite(v) ? v : 0
  );
}
function pct(v: number): string {
  return `${(isFinite(v) ? v : 0).toFixed(1).replace(".", ",")}%`;
}

export interface LanceLivreScenario {
  bidPct: number;
  bidValue: number;
  competitiveness: number; // % vs referência
  classificacao: string;
  tone: "good" | "highlight" | "danger" | "neutral";
}

export interface LanceLivreResult {
  inputs: Required<LanceLivreInput>;
  // núcleo
  category: number; // valor total (carta + taxas)
  installmentBase: number; // parcela média estimada
  bidValue: number; // lance em R$
  remainingDebt: number; // saldo devedor estimado após contemplação
  remainingInstallments: number; // parcelas restantes
  // efeito no fluxo
  newInstallment: number | null; // se abater parcela
  installmentReduction: number | null; // redução por parcela
  monthsReduced: number | null; // se reduzir prazo
  newTerm: number | null;
  // competitividade
  competitiveness: number; // % vs referência (>100 = acima da média)
  competLabel: string;
  competTone: "good" | "highlight" | "danger" | "neutral";
  // veredito
  verdict: "positivo" | "atencao" | "critico";
  decisionText: string;
  warnings: string[];
  positives: string[];
  attentions: string[];
  // tabelas
  sensitivity: LanceLivreScenario[];
  audit: { item: string; valor: string; racional: string }[];
}

export function calcLanceLivre(raw: LanceLivreInput): LanceLivreResult {
  const warnings: string[] = [];

  const credit = clamp(raw.credit || 0, 0, 1e12);
  const adminRate = clamp(raw.adminRate || 0, 0, 100);
  const term = clamp(Math.round(raw.term || 1), 1, 300);
  const paidInstallments = clamp(Math.round(raw.paidInstallments || 0), 0, term);
  const bidPct = clamp(raw.bidPct || 0, 0, 100);
  const referenceBidPct = clamp(raw.referenceBidPct ?? 45, 0, 100);
  const lanceUse: LanceUse = raw.lanceUse === "reduzir_prazo" ? "reduzir_prazo" : "abater_parcela";

  const category = credit * (1 + adminRate / 100);
  const installmentBase = category / term;
  const bidValue = (credit * bidPct) / 100;

  const remainingInstallments = Math.max(0, term - paidInstallments);
  const paidAmount = installmentBase * paidInstallments;
  // saldo devedor estimado (sem correção) = total - já pago - lance aplicado
  const remainingDebtBefore = Math.max(0, category - paidAmount);
  const remainingDebt = Math.max(0, remainingDebtBefore - bidValue);

  if (bidValue > remainingDebtBefore + 0.01) {
    warnings.push(
      `O lance ofertado (${money(bidValue)}) supera o saldo devedor estimado (${money(remainingDebtBefore)}). Na prática, o excedente costuma ser devolvido ou reduzir o saldo a zero.`
    );
  }

  // Efeito no fluxo
  let newInstallment: number | null = null;
  let installmentReduction: number | null = null;
  let monthsReduced: number | null = null;
  let newTerm: number | null = null;

  if (lanceUse === "abater_parcela") {
    newInstallment = remainingInstallments > 0 ? remainingDebt / remainingInstallments : 0;
    installmentReduction = installmentBase - (newInstallment ?? 0);
    newTerm = term;
  } else {
    const monthsCovered = installmentBase > EPS ? Math.floor(bidValue / installmentBase) : 0;
    monthsReduced = Math.min(monthsCovered, remainingInstallments);
    newTerm = Math.max(paidInstallments + 1, term - monthsReduced);
    newInstallment = installmentBase;
    installmentReduction = 0;
  }

  // Competitividade
  const competitiveness = referenceBidPct > EPS ? (bidPct / referenceBidPct) * 100 : 0;
  let competLabel: string;
  let competTone: "good" | "highlight" | "danger" | "neutral";
  if (competitiveness >= 110) {
    competLabel = "Acima da média histórica";
    competTone = "good";
  } else if (competitiveness >= 90) {
    competLabel = "Na faixa competitiva";
    competTone = "good";
  } else if (competitiveness >= 70) {
    competLabel = "Abaixo da média";
    competTone = "highlight";
  } else {
    competLabel = "Pouco competitivo";
    competTone = "danger";
  }

  // Veredito
  let verdict: "positivo" | "atencao" | "critico" = "atencao";
  let decisionText = "";
  if (bidPct <= 0) {
    verdict = "critico";
    decisionText = "Sem lance livre, a contemplação depende exclusivamente de sorteio. A chance por lance é nula.";
  } else if (competitiveness < 70) {
    verdict = "critico";
    decisionText = `Seu lance representa apenas ${pct(competitiveness)} da referência histórica. É pouco provável que vença por lance em assembleias disputadas.`;
  } else if (competitiveness < 90) {
    verdict = "atencao";
    decisionText = `Seu lance está abaixo da média histórica (${pct(competitiveness)} da referência). Pode contemplar em assembleias fracas, mas é arriscado.`;
  } else if (competitiveness > 140) {
    verdict = "atencao";
    decisionText = `Seu lance está bem acima da referência (${pct(competitiveness)}). A chance é alta, mas você pode estar imobilizando capital além do necessário.`;
  } else {
    verdict = "positivo";
    decisionText = `Seu lance está na faixa competitiva (${pct(competitiveness)} da referência), com boa relação entre chance de contemplação e capital empregado.`;
  }

  // Pontos
  const positives: string[] = [];
  const attentions: string[] = [];
  if (competTone === "good") positives.push("Lance dentro ou acima da faixa que historicamente contempla.");
  if (lanceUse === "abater_parcela" && (installmentReduction ?? 0) > 0)
    positives.push(`Reduz cada parcela em ${money(installmentReduction!)} após a contemplação.`);
  if (lanceUse === "reduzir_prazo" && (monthsReduced ?? 0) > 0)
    positives.push(`Encurta o plano em ${monthsReduced} parcela(s).`);
  positives.push("Lance livre usa recurso próprio: não incide taxa de administração sobre ele.");

  if (competitiveness < 90) attentions.push("Lance abaixo da média histórica reduz a chance de vencer.");
  if (bidValue > 0) attentions.push(`Exige desembolso imediato de ${money(bidValue)} em recurso próprio.`);
  if (competitiveness > 140) attentions.push("Capital empregado pode estar acima do necessário para contemplar.");
  if (!attentions.length) attentions.push("Compare a referência com dados reais e recentes do seu grupo.");

  // Sensibilidade
  const steps = [10, 20, 30, 40, 50, 60, 70];
  const sensitivity: LanceLivreScenario[] = steps.map((p) => {
    const v = (credit * p) / 100;
    const comp = referenceBidPct > EPS ? (p / referenceBidPct) * 100 : 0;
    let cls: string;
    let tone: "good" | "highlight" | "danger" | "neutral";
    if (comp >= 110) { cls = "Forte"; tone = "good"; }
    else if (comp >= 90) { cls = "Competitivo"; tone = "good"; }
    else if (comp >= 70) { cls = "Fraco"; tone = "highlight"; }
    else { cls = "Insuficiente"; tone = "danger"; }
    return { bidPct: p, bidValue: v, competitiveness: comp, classificacao: cls, tone };
  });

  const audit = [
    { item: "Valor total (categoria)", valor: money(category), racional: `carta × (1 + taxa adm.) = ${money(credit)} × (1 + ${pct(adminRate)})` },
    { item: "Parcela média estimada", valor: money(installmentBase), racional: `categoria ÷ prazo = ${money(category)} ÷ ${term}` },
    { item: "Lance livre em R$", valor: money(bidValue), racional: `carta × % lance = ${money(credit)} × ${pct(bidPct)}` },
    { item: "Saldo devedor estimado", valor: money(remainingDebt), racional: "categoria − parcelas pagas − lance aplicado" },
    { item: "Competitividade", valor: pct(competitiveness), racional: `% lance ÷ referência = ${pct(bidPct)} ÷ ${pct(referenceBidPct)}` },
    lanceUse === "abater_parcela"
      ? { item: "Nova parcela", valor: money(newInstallment ?? 0), racional: "saldo devedor ÷ parcelas restantes" }
      : { item: "Parcelas reduzidas", valor: `${monthsReduced ?? 0}`, racional: "lance ÷ parcela média (limitado às restantes)" },
  ];

  return {
    inputs: { credit, adminRate, term, paidInstallments, bidPct, referenceBidPct, lanceUse },
    category,
    installmentBase,
    bidValue,
    remainingDebt,
    remainingInstallments,
    newInstallment,
    installmentReduction,
    monthsReduced,
    newTerm,
    competitiveness,
    competLabel,
    competTone,
    verdict,
    decisionText,
    warnings,
    positives,
    attentions,
    sensitivity,
    audit,
  };
}
