/**
 * Lógica matemática do Simulador de Lance Embutido.
 * PROTEGIDA NO BACKEND — nunca exposta ao frontend.
 * Fiel ao HTML original (renatto.com.br · Consórcio de Verdade).
 */

const EPS = 1e-9;

export type LanceBaseMode = "carta" | "category";

export interface LanceEmbutidoInput {
  /** Carta de crédito contratada (R$) */
  credit: number;
  /** Prazo em meses */
  term?: number;
  /** Taxa de administração total (%) */
  adminRate: number;
  /** Fundo de reserva (%) */
  reserveRate?: number;
  /** Base de aplicação do percentual de lance: carta ou categoria */
  lanceBase?: LanceBaseMode;
  /** Limite contratual do embutido (% da carta) */
  embeddedLimitPct?: number;
  /** Percentual de lance embutido desejado (%) */
  embeddedPct: number;
  /** Capital próprio aportado (R$) — recurso externo, inclui FGTS */
  ownBid?: number;
  /** Preço-alvo do bem desejado (R$) */
  targetPrice?: number;
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

function classifyEffective(eff: number, nominal: number): [string, string] {
  if (eff <= nominal * 1.12) return ["green", "Eficiente"];
  if (eff <= nominal * 1.35) return ["warn", "Atenção"];
  if (eff <= nominal * 1.75) return ["orange", "Caro"];
  return ["red", "Crítico"];
}

function classifyCredit(preserved: number): [string, string] {
  if (preserved >= 80) return ["green", "Crédito preservado"];
  if (preserved >= 65) return ["warn", "Perda relevante"];
  if (preserved >= 50) return ["orange", "Crédito pressionado"];
  return ["red", "Crédito crítico"];
}

export interface ComparisonRow {
  cenario: string;
  cartaContratada: number;
  embutido: number;
  capitalProprio: number;
  creditoLiquido: number;
  capitalFinanciado: number;
  taxaAdminRS: number;
  taxaSobreCreditoLiquido: number | null;
  taxaSobreCapitalFinanciado: number | null;
  excessoVsCartaMenor: number;
  leitura: string;
  tone: "good" | "highlight" | "neutral";
}

export interface SensitivityRow {
  percentualEmbutido: number;
  valorEmbutido: number;
  creditoLiquido: number;
  capitalProprio: number;
  capitalFinanciado: number;
  taxaSobreCreditoLiquido: number | null;
  taxaSobreCapitalFinanciado: number | null;
  multiplicador: number | null;
  classificacao: string;
  tone: "good" | "highlight" | "danger" | "neutral";
}

export interface AuditRow {
  item: string;
  valor: string;
  racional: string;
}

export interface LanceEmbutidoResult {
  inputs: Required<LanceEmbutidoInput>;
  // KPIs principais
  credit: number;
  category: number;
  base: number;
  requestedEmbedded: number;
  limitValue: number;
  embeddedValue: number;
  ownBid: number;
  liquidCredit: number;
  financedCapital: number;
  nominalAdminValue: number;
  nominalReserveValue: number;
  effAdminRate: number | null;
  effFinancedAdminRate: number | null;
  effTotalFeeRate: number | null;
  effFinancedTotalFeeRate: number | null;
  feeMultiplier: number;
  financedMultiplier: number | null;
  totalRanking: number;
  rankingPctCredit: number;
  rankingPctBase: number;
  noCashPart: number;
  ownCashRatio: number;
  creditPreserved: number;
  financedPreserved: number;
  complementNeeded: number;
  excessAdmin: number;
  // Classificações
  effClass: string;
  effLabel: string;
  finClass: string;
  finLabel: string;
  credClass: string;
  credLabel: string;
  // Veredito
  verdict: "positivo" | "atencao" | "critico";
  decisionText: string;
  formula: string;
  warnings: string[];
  // Tabelas
  comparison: ComparisonRow[];
  sensitivity: SensitivityRow[];
  audit: AuditRow[];
}

export function calcLanceEmbutido(raw: LanceEmbutidoInput): LanceEmbutidoResult {
  const warnings: string[] = [];

  const credit = clamp(raw.credit || 0, 0, 1e12);
  const term = clamp(Math.round(raw.term || 1), 1, 300);
  const adminRate = clamp(raw.adminRate || 0, 0, 100);
  const reserveRate = clamp(raw.reserveRate || 0, 0, 100);
  const embeddedLimitPct = clamp(raw.embeddedLimitPct ?? 30, 0, 100);
  const embeddedPctRaw = clamp(raw.embeddedPct || 0, 0, 100);
  const ownBid = clamp(raw.ownBid || 0, 0, 1e12);
  const targetPrice = clamp(raw.targetPrice || 0, 0, 1e12);
  const baseMode: LanceBaseMode = raw.lanceBase === "category" ? "category" : "carta";

  const category = credit * (1 + (adminRate + reserveRate) / 100);
  const base = baseMode === "category" ? category : credit;
  const requestedEmbedded = (base * embeddedPctRaw) / 100;
  const limitValue = (credit * embeddedLimitPct) / 100;
  const embeddedValue = Math.min(requestedEmbedded, limitValue, credit);

  if (requestedEmbedded > limitValue + 0.01) {
    warnings.push(
      `O lance embutido solicitado excedia o limite contratual informado. O simulador limitou o embutido efetivo a ${money(limitValue)}.`
    );
  }

  const liquidCredit = Math.max(0, credit - embeddedValue);
  const financedCapital = Math.max(0, liquidCredit - ownBid);

  if (ownBid > liquidCredit + 0.01) {
    warnings.push(
      "O capital próprio informado supera o capital financiável após o embutido. Para a leitura de eficiência do financiamento, o capital financiado pelo grupo foi limitado a R$ 0,00."
    );
  }

  const nominalAdminValue = (credit * adminRate) / 100;
  const nominalReserveValue = (credit * reserveRate) / 100;
  const effAdminRate = liquidCredit > EPS ? (nominalAdminValue / liquidCredit) * 100 : null;
  const effFinancedAdminRate = financedCapital > EPS ? (nominalAdminValue / financedCapital) * 100 : null;
  const effTotalFeeRate = liquidCredit > EPS ? ((nominalAdminValue + nominalReserveValue) / liquidCredit) * 100 : null;
  const effFinancedTotalFeeRate = financedCapital > EPS ? ((nominalAdminValue + nominalReserveValue) / financedCapital) * 100 : null;
  const feeMultiplier = adminRate > EPS && effAdminRate !== null ? effAdminRate / adminRate : 0;
  const financedMultiplier = adminRate > EPS && effFinancedAdminRate !== null ? effFinancedAdminRate / adminRate : null;

  const totalRanking = embeddedValue + ownBid;
  const rankingPctCredit = credit > EPS ? (totalRanking / credit) * 100 : 0;
  const rankingPctBase = base > EPS ? (totalRanking / base) * 100 : 0;
  const noCashPart = totalRanking > EPS ? (embeddedValue / totalRanking) * 100 : 0;
  const ownCashRatio = totalRanking > EPS ? (ownBid / totalRanking) * 100 : 0;
  const creditPreserved = credit > EPS ? (liquidCredit / credit) * 100 : 0;
  const financedPreserved = credit > EPS ? (financedCapital / credit) * 100 : 0;
  const complementNeeded = Math.max(0, targetPrice - liquidCredit);
  const smallerLetterAdmin = (liquidCredit * adminRate) / 100;
  const excessAdmin = Math.max(0, nominalAdminValue - smallerLetterAdmin);

  const [effClass, effLabel] = effAdminRate !== null ? classifyEffective(effAdminRate, adminRate) : ["red", "Sem carta líquida"];
  const [finClass, finLabel] = effFinancedAdminRate !== null ? classifyEffective(effFinancedAdminRate, adminRate) : ["red", "Sem capital financiado"];
  const [credClass, credLabel] = classifyCredit(creditPreserved);

  // Veredito narrativo
  let decisionText = "";
  let verdict: "positivo" | "atencao" | "critico" = "atencao";
  if (liquidCredit <= EPS) {
    decisionText = "O lance embutido consome praticamente todo o crédito. A operação perde função de compra e deve ser reavaliada.";
    verdict = "critico";
  } else if (financedCapital <= EPS) {
    decisionText = "O cliente está praticamente deixando de financiar capital pelo grupo, mas ainda paga taxa sobre a carta cheia. A eficiência do financiamento fica sem base econômica.";
    verdict = "critico";
  } else if (complementNeeded > 0 && creditPreserved < 70) {
    decisionText = "O lance pode fortalecer a contemplação, mas deixa a carta líquida distante do objetivo. A decisão depende de recurso complementar fora do consórcio.";
    verdict = "atencao";
  } else if (effFinancedAdminRate !== null && effFinancedAdminRate > adminRate * 1.75) {
    decisionText = "A estratégia contempla com muita força própria/embutida, mas a taxa sobre o capital efetivamente financiado fica crítica. Compare com carta menor, financiamento tradicional ou menor lance.";
    verdict = "critico";
  } else if ((effAdminRate !== null && effAdminRate > adminRate * 1.35) || (effFinancedAdminRate !== null && effFinancedAdminRate > adminRate * 1.35)) {
    decisionText = "A contemplação ganha força, mas a taxa fica proporcionalmente cara quando medida pelo crédito útil ou pelo capital realmente financiado. Compare com carta menor ou menor uso de lances.";
    verdict = "atencao";
  } else {
    decisionText = "A leitura está em zona controlada. Ainda assim, a decisão deve considerar histórico do grupo, contrato, caixa próprio e custo de oportunidade.";
    verdict = "positivo";
  }

  const formula =
    `Crédito líquido = carta - lance embutido = ${money(credit)} - ${money(embeddedValue)} = ${money(liquidCredit)}\n` +
    `Capital financiado pelo grupo = crédito líquido - capital próprio = ${money(liquidCredit)} - ${money(ownBid)} = ${money(financedCapital)}\n` +
    `Taxa sobre crédito líquido = taxa adm. R$ / crédito líquido = ${money(nominalAdminValue)} / ${money(liquidCredit)} = ${effAdminRate !== null ? pct(effAdminRate) : "sem base"}\n` +
    `Taxa sobre capital financiado = taxa adm. R$ / capital financiado = ${money(nominalAdminValue)} / ${money(financedCapital)} = ${effFinancedAdminRate !== null ? pct(effFinancedAdminRate) : "sem base"}`;

  // Tabela de comparação de cenários
  const comparison = buildComparison({
    credit, ownBid, nominalAdminValue, liquidCredit, financedCapital, embeddedValue, adminRate, effAdminRate, effFinancedAdminRate, excessAdmin,
  });

  // Tabela de sensibilidade
  const sensitivity = buildSensitivity({ base, limitValue, credit, ownBid, adminRate });

  // Memória auditável
  const audit = buildAudit({
    credit, category, baseMode, requestedEmbedded, embeddedPctRaw, limitValue, embeddedLimitPct, embeddedValue, ownBid, totalRanking,
    rankingPctCredit, rankingPctBase, liquidCredit, financedCapital, nominalAdminValue, adminRate, effAdminRate, effFinancedAdminRate,
    effTotalFeeRate, effFinancedTotalFeeRate, feeMultiplier, financedMultiplier, excessAdmin, complementNeeded, noCashPart, ownCashRatio,
  });

  return {
    inputs: { credit, term, adminRate, reserveRate, lanceBase: baseMode, embeddedLimitPct, embeddedPct: embeddedPctRaw, ownBid, targetPrice },
    credit, category, base, requestedEmbedded, limitValue, embeddedValue, ownBid, liquidCredit, financedCapital,
    nominalAdminValue, nominalReserveValue, effAdminRate, effFinancedAdminRate, effTotalFeeRate, effFinancedTotalFeeRate,
    feeMultiplier, financedMultiplier, totalRanking, rankingPctCredit, rankingPctBase, noCashPart, ownCashRatio,
    creditPreserved, financedPreserved, complementNeeded, excessAdmin,
    effClass, effLabel, finClass, finLabel, credClass, credLabel,
    verdict, decisionText, formula, warnings, comparison, sensitivity, audit,
  };
}

function buildComparison(o: {
  credit: number; ownBid: number; nominalAdminValue: number; liquidCredit: number; financedCapital: number;
  embeddedValue: number; adminRate: number; effAdminRate: number | null; effFinancedAdminRate: number | null; excessAdmin: number;
}): ComparisonRow[] {
  const rateLiquid = (admin: number, liquid: number) => (liquid > EPS ? (admin / liquid) * 100 : null);
  const rateFin = (admin: number, fin: number) => (fin > EPS ? (admin / fin) * 100 : null);
  const noEmbLiquid = o.credit;
  const noEmbFinanced = Math.max(0, o.credit - o.ownBid);
  const smallerAdmin = (o.liquidCredit * o.adminRate) / 100;
  const smallerFinanced = Math.max(0, o.liquidCredit - o.ownBid);
  return [
    {
      cenario: "Sem embutido", cartaContratada: o.credit, embutido: 0, capitalProprio: o.ownBid, creditoLiquido: noEmbLiquid,
      capitalFinanciado: noEmbFinanced, taxaAdminRS: o.nominalAdminValue, taxaSobreCreditoLiquido: rateLiquid(o.nominalAdminValue, noEmbLiquid),
      taxaSobreCapitalFinanciado: rateFin(o.nominalAdminValue, noEmbFinanced), excessoVsCartaMenor: 0,
      leitura: "Carta cheia preservada. Se houver capital próprio, ele reduz o capital financiado, não o crédito líquido.", tone: "good",
    },
    {
      cenario: "Com embutido", cartaContratada: o.credit, embutido: o.embeddedValue, capitalProprio: o.ownBid, creditoLiquido: o.liquidCredit,
      capitalFinanciado: o.financedCapital, taxaAdminRS: o.nominalAdminValue, taxaSobreCreditoLiquido: o.effAdminRate,
      taxaSobreCapitalFinanciado: o.effFinancedAdminRate, excessoVsCartaMenor: o.excessAdmin,
      leitura: "Mais força de ranking, menor crédito útil e menor capital financiado pelo grupo.", tone: "highlight",
    },
    {
      cenario: "Carta menor equivalente", cartaContratada: o.liquidCredit, embutido: 0, capitalProprio: o.ownBid, creditoLiquido: o.liquidCredit,
      capitalFinanciado: smallerFinanced, taxaAdminRS: smallerAdmin, taxaSobreCreditoLiquido: o.adminRate,
      taxaSobreCapitalFinanciado: rateFin(smallerAdmin, smallerFinanced), excessoVsCartaMenor: 0,
      leitura: "Mesma carta líquida sem embutido teria taxa administrativa em R$ menor.", tone: "neutral",
    },
  ];
}

function buildSensitivity(o: { base: number; limitValue: number; credit: number; ownBid: number; adminRate: number }): SensitivityRow[] {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80];
  return steps.map((p) => {
    const req = (o.base * p) / 100;
    const emb = Math.min(req, o.limitValue, o.credit);
    const liquid = Math.max(0, o.credit - emb);
    const financed = Math.max(0, liquid - o.ownBid);
    const admin = (o.credit * o.adminRate) / 100;
    const effLiquid = liquid > EPS ? (admin / liquid) * 100 : null;
    const effFin = financed > EPS ? (admin / financed) * 100 : null;
    const mult = o.adminRate > EPS && effFin !== null ? effFin / o.adminRate : null;
    let classificacao: string;
    let tone: "good" | "highlight" | "danger" | "neutral";
    if (financed <= EPS) { classificacao = "Sem capital financiado"; tone = "danger"; }
    else if (effFin !== null && effFin > o.adminRate * 1.75) { classificacao = "Crítico"; tone = "danger"; }
    else if (effFin !== null && effFin > o.adminRate * 1.35) { classificacao = "Caro"; tone = "highlight"; }
    else if (effFin !== null && effFin > o.adminRate * 1.12) { classificacao = "Atenção"; tone = "neutral"; }
    else { classificacao = "Controlado"; tone = "good"; }
    return {
      percentualEmbutido: p, valorEmbutido: emb, creditoLiquido: liquid, capitalProprio: o.ownBid, capitalFinanciado: financed,
      taxaSobreCreditoLiquido: effLiquid, taxaSobreCapitalFinanciado: effFin, multiplicador: mult, classificacao, tone,
    };
  });
}

function buildAudit(o: Record<string, number | string | null>): AuditRow[] {
  const n = (v: unknown) => (typeof v === "number" ? v : 0);
  const effAdminRate = o.effAdminRate as number | null;
  const effFinancedAdminRate = o.effFinancedAdminRate as number | null;
  const effTotalFeeRate = o.effTotalFeeRate as number | null;
  const effFinancedTotalFeeRate = o.effFinancedTotalFeeRate as number | null;
  const financedMultiplier = o.financedMultiplier as number | null;
  return [
    { item: "Carta contratada", valor: money(n(o.credit)), racional: "Base nominal sobre a qual o plano foi contratado." },
    { item: "Categoria estimada", valor: money(n(o.category)), racional: "Carta × (1 + taxa adm. + fundo reserva)." },
    { item: "Base escolhida para lance", valor: o.baseMode === "category" ? "Categoria" : "Carta", racional: "Define onde o percentual do lance é aplicado." },
    { item: "Lance embutido solicitado", valor: money(n(o.requestedEmbedded)), racional: `${pct(n(o.embeddedPctRaw))} sobre a base escolhida.` },
    { item: "Limite contratual embutido", valor: money(n(o.limitValue)), racional: `${pct(n(o.embeddedLimitPct))} da carta.` },
    { item: "Lance embutido efetivo", valor: money(n(o.embeddedValue)), racional: "Menor valor entre solicitado, limite e carta disponível." },
    { item: "Capital próprio", valor: money(n(o.ownBid)), racional: "Recurso externo; inclui FGTS quando permitido e não reduz a carta líquida." },
    { item: "Lance total de ranking", valor: money(n(o.totalRanking)), racional: `${money(n(o.embeddedValue))} + ${money(n(o.ownBid))}.` },
    { item: "Lance total / carta", valor: pct(n(o.rankingPctCredit)), racional: "Força de contemplação em relação à carta." },
    { item: "Lance total / base escolhida", valor: pct(n(o.rankingPctBase)), racional: "Força de contemplação em relação à base contratual do lance." },
    { item: "Crédito líquido disponível", valor: money(n(o.liquidCredit)), racional: "Carta - lance embutido. Mede o crédito útil para compra." },
    { item: "Capital financiado pelo grupo", valor: money(n(o.financedCapital)), racional: "Crédito líquido - capital próprio. Mede quanto capital o cliente efetivamente financia pelo consórcio." },
    { item: "Taxa adm. nominal", valor: money(n(o.nominalAdminValue)), racional: `${pct(n(o.adminRate))} × carta contratada.` },
    { item: "Taxa adm. efetiva sobre crédito líquido", valor: effAdminRate !== null ? pct(effAdminRate) : "Sem base", racional: "Taxa adm. R$ ÷ crédito líquido. Capta o efeito do embutido." },
    { item: "Taxa adm. efetiva sobre capital financiado", valor: effFinancedAdminRate !== null ? pct(effFinancedAdminRate) : "Sem base", racional: "Taxa adm. R$ ÷ capital financiado pelo grupo. Capta embutido + capital próprio." },
    { item: "Taxas totais efetivas sobre crédito líquido", valor: effTotalFeeRate !== null ? pct(effTotalFeeRate) : "Sem base", racional: "Taxa adm. + fundo reserva sobre crédito líquido." },
    { item: "Taxas totais efetivas sobre capital financiado", valor: effFinancedTotalFeeRate !== null ? pct(effFinancedTotalFeeRate) : "Sem base", racional: "Taxa adm. + fundo reserva sobre capital financiado." },
    { item: "Multiplicador da taxa sobre crédito líquido", valor: `${br(n(o.feeMultiplier))}x`, racional: "Quanto a taxa efetiva subiu em relação à nominal pela perda de crédito líquido." },
    { item: "Multiplicador da taxa sobre capital financiado", valor: financedMultiplier !== null ? `${br(financedMultiplier)}x` : "Sem base", racional: "Quanto a taxa efetiva subiu em relação à nominal pelo menor capital financiado." },
    { item: "Excesso vs carta menor", valor: money(n(o.excessAdmin)), racional: "Taxa adm. paga sobre a parte da carta que virou embutido." },
    { item: "Complemento necessário", valor: money(n(o.complementNeeded)), racional: "Preço-alvo - crédito líquido." },
    { item: "Ranking via embutido", valor: pct(n(o.noCashPart)), racional: "Parcela do lance formada pela própria carta, sem dinheiro novo." },
    { item: "Capital próprio no lance", valor: pct(n(o.ownCashRatio)), racional: "Parcela do lance formada por recurso externo ao crédito." },
  ];
}

// Formatadores (pt-BR) — usados apenas para strings de memória/auditoria
function money(n: number): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function pct(n: number, d = 2): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";
}
function br(n: number, d = 2): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
}
