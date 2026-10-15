import type { EstruturaOptions } from "../lib/estruturaDoPlano";

/** Referência fornecida pelo usuário em 15/10/2026, Etapa 4; não muda defaults da UI. */
export const referenceOptions: EstruturaOptions = {
  credit: 300_000, term: 180, adminRate: 25, reserveRate: 0,
  insuranceRate: 0.038, adjustmentRate: 7, adjustmentPeriod: 12,
  firstAdjustmentMonth: 13, paymentPolicyMode: "standard", paymentRanges: [],
  savingsRate: 0.515, cdbRate: 0.795,
};

export const comparisonScenarios: { id: string; label: string; options: EstruturaOptions }[] = [
  { id: "linear", label: "Linear — parcela cheia", options: referenceOptions },
  { id: "reduzida", label: "R$ 300,00 nos meses 1–12; cheia depois", options: {
    ...referenceOptions, paymentPolicyMode: "ranges",
    paymentRanges: [{ start: 1, end: 12, type: "value", value: 300 }],
  } },
  { id: "multiplas", label: "R$ 1.500 (1–12), R$ 3.194,44 (13–24), R$ 300 (25–36); cheia depois", options: {
    ...referenceOptions, paymentPolicyMode: "ranges", paymentRanges: [
      { start: 1, end: 12, type: "value", value: 1500 },
      { start: 13, end: 24, type: "value", value: 3194.44 },
      { start: 25, end: 36, type: "value", value: 300 },
    ],
  } },
  { id: "percentuais", label: "50% dos componentes (1–12), 75% (13–24); cheia depois", options: {
    ...referenceOptions, paymentPolicyMode: "ranges", paymentRanges: [
      { start: 1, end: 12, type: "percent", value: 50 },
      { start: 13, end: 24, type: "percent", value: 75 },
    ],
  } },
];

/** Oráculo independente: saldo agregado e participações constantes, sem importar o motor. */
export function independentSchedule(options: EstruturaOptions) {
  const weights = [1, options.adminRate / 100, options.reserveRate / 100];
  const denominator = weights.reduce((a, b) => a + b, 0);
  let debt = options.credit * denominator;
  let credit = options.credit;
  const rows = [];
  for (let month = 1; month <= options.term; month++) {
    const opening = debt;
    const oldCredit = credit;
    const correctionDue = options.adjustmentPeriod > 0 && options.adjustmentRate > 0 && month >= options.firstAdjustmentMonth && (month - options.firstAdjustmentMonth) % options.adjustmentPeriod === 0;
    if (correctionDue) {
      credit *= 1 + options.adjustmentRate / 100;
      debt *= 1 + options.adjustmentRate / 100;
    }
    const adjusted = debt;
    const insurance = adjusted * options.insuranceRate / 100;
    const full = adjusted / (options.term + 1 - month);
    const range = options.paymentPolicyMode === "ranges" ? options.paymentRanges.find(r => r.start <= month && r.end >= month) : undefined;
    let components = full;
    if (range && full > 0.02) components = range.type === "value"
      ? Math.min(full, Math.max(0, range.value - insurance))
      : full * Math.min(100, range.value) / 100;
    debt = Math.max(0, adjusted - components);
    rows.push({ month, credit, saldoAntes: opening, saldoInicial: adjusted,
      reajuste: adjusted - opening, reajusteCredito: credit - oldCredit,
      reajusteAdmin: (adjusted - opening) * weights[1] / denominator,
      fc: components * weights[0] / denominator, ta: components * weights[1] / denominator,
      fr: components * weights[2] / denominator, insurance, payment: components + insurance,
      policyAdjustment: components - full, saldoFinal: debt, saldoAfterPayment: debt,
    });
  }
  return rows;
}

/** Plano real do usuário em 15/10/2026; valores de faixa são a prestação total com seguro. */
export const realPlanOptions: EstruturaOptions = {
  credit: 320_000, term: 160, adminRate: 24, reserveRate: 0,
  insuranceRate: 0.038, adjustmentRate: 7, adjustmentPeriod: 12,
  firstAdjustmentMonth: 13, paymentPolicyMode: "ranges", paymentAdjustmentMode: "balanceRebase",
  paymentRanges: [
    { start: 1, end: 10, type: "value", value: 3430.78 },
    { start: 11, end: 159, type: "value", value: 2577.34 },
    { start: 160, end: 160, type: "value", value: 2593.34 },
  ],
  savingsRate: 0.515, cdbRate: 0.795,
};

/**
 * Oráculo independente para o plano contratado: primeiro constrói o perfil base
 * sem correções; nos eventos, atualiza saldo e divide esse saldo pelo perfil ainda
 * não pago. Não importa helpers/fórmulas do motor de produção.
 */
export function independentRebasedSchedule(options: EstruturaOptions) {
  const initialCommon = options.credit;
  const initialAdmin = options.credit * options.adminRate / 100;
  let baseCommon = initialCommon;
  let baseAdmin = initialAdmin;
  const profile: number[] = [];
  const amountAt = (month: number) => options.paymentRanges.find(range => range.start <= month && range.end >= month)!.value;

  for (let month = 1; month <= options.term; month++) {
    const balance = baseCommon + baseAdmin;
    const insurance = balance * options.insuranceRate / 100;
    const requested = Math.max(0, amountAt(month) - insurance);
    profile.push(requested);
    const amortized = Math.min(balance, requested);
    if (balance > 0) {
      baseCommon = Math.max(0, baseCommon - amortized * baseCommon / balance);
      baseAdmin = Math.max(0, baseAdmin - amortized * baseAdmin / balance);
    }
  }

  const suffix = Array(profile.length + 1).fill(0);
  for (let i = profile.length - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + profile[i];

  let common = initialCommon;
  let admin = initialAdmin;
  let credit = options.credit;
  let scale = 1;
  const rows = [];
  for (let month = 1; month <= options.term; month++) {
    const before = common + admin;
    const oldCredit = credit;
    const due = options.adjustmentPeriod > 0 && month >= options.firstAdjustmentMonth && (month - options.firstAdjustmentMonth) % options.adjustmentPeriod === 0;
    if (due) {
      common *= 1 + options.adjustmentRate / 100;
      admin *= 1 + options.adjustmentRate / 100;
      credit *= 1 + options.adjustmentRate / 100;
      scale = (common + admin) / suffix[month - 1];
    }
    const opening = common + admin;
    const insurance = opening * options.insuranceRate / 100;
    const requested = profile[month - 1] * scale;
    const amortized = Math.min(opening, requested);
    const fc = opening > 0 ? amortized * common / opening : 0;
    const ta = opening > 0 ? amortized * admin / opening : 0;
    common = Math.max(0, common - fc);
    admin = Math.max(0, admin - ta);
    const balance = common + admin;
    const full = opening / (options.term - month + 1);
    rows.push({
      month, credit, saldoAntes: before, saldoInicial: opening, reajuste: opening - before,
      reajusteCredito: credit - oldCredit,
      reajusteAdmin: due ? admin * 0 + (opening - before) * options.adminRate / (100 + options.adminRate) : 0,
      fc, ta, fr: 0, insurance, payment: fc + ta + insurance,
      paymentScale: scale, policyAdjustment: amortized - full,
      saldoFinal: balance, saldoAfterPayment: balance,
    });
  }
  return { rows, profile, suffix };
}
