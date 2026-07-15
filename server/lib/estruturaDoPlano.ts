/**
 * Motor de Cálculo: Estrutura do Plano
 * Replicação 100% fiel do HTML original (SimuladordeConsórcioCliente_.renatto.html)
 *
 * Funções portadas diretamente do JavaScript do HTML:
 * - initialBalances, adjustmentDue, applyAdjustment, insuranceFor
 * - rangeForMonth, applyPaymentPolicy, simulateProposal
 * - buildYearlyCorrections
 * - renderCosts (cálculo de custos)
 * - simulateInvestmentComparison (consórcio x investimentos)
 */

const EPS = 0.02;

export interface PaymentRange {
  start: number;
  end: number;
  type: 'value' | 'percent';
  value: number;
}

export interface EstruturaOptions {
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  insuranceRate: number;
  adjustmentRate: number;
  adjustmentPeriod: number; // 12=Anual, 6=Semestral, 0=Sem
  firstAdjustmentMonth: number;
  paymentPolicyMode: 'standard' | 'ranges';
  paymentRanges: PaymentRange[];
  savingsRate: number; // taxa mensal poupança (%)
  cdbRate: number; // taxa mensal CDB (%)
  // Lance
  lanceProprio?: number; // Lance próprio em R$
  lanceFgts?: number; // Lance FGTS em R$
  lanceEmbutido?: number; // Lance embutido em R$
  baseDoLance?: 'carta' | 'categoria'; // Base do lance
  parcelasPagas?: number; // Parcelas já pagas
  estrategiaPos?: 'abater_parcela' | 'reduzir_prazo'; // Estratégia pós-contemplação
}

export interface EstruturaRow {
  month: number;
  year: number;
  credit: number;
  saldoAntes: number;
  reajuste: number;
  reajusteCredito: number;
  reajusteAdmin: number;
  saldoInicial: number;
  fc: number;
  ta: number;
  fr: number;
  insurance: number;
  policyAdjustment: number;
  policyLabel: string;
  payment: number;
  saldoAfterPayment: number;
  saldoFinal: number;
  tags: string[];
}

export interface YearlyCorrection {
  year: number;
  events: number;
  paidYear: number;
  corrCarta: number;
  corrSaldo: number;
  cartaFim: number;
  saldoFim: number;
  leitura: string;
}

export interface CostBlock {
  taxaContratada: number;
  correcaoCarta: number;
  correcaoAdm: number;
  correcaoOutros: number;
  reajusteSaldoTotal: number;
  taxaAdmProjetada: number;
  finalCredit: number;
  totalProjected: number;
  custoOperacional: number;
  principalPago: number;
  fundoReservaSeguro: number;
  saldoDevedorInicial: number;
  saldoDevedorCorrigido: number;
  // Campos extras para replicar HTML Raio-x do Consórcio
  contractualAdmin: number;
  contractualReserve: number;
  projectedAdmin: number;
  projectedInsurance: number;
  explicitCost: number;
  creditIncrease: number;
  totalPaidNominal: number;
  reserveCorrection: number;
  fundoReservaProjetado: number;
  oldMisleadingSpread: number;
}

export interface CostTableRow {
  camada: string;
  item: string;
  valor: number;
  leitura: string;
}

export interface InvestmentDetail {
  month: number;
  aporte: number;
  monthsHeld: number;
  grossValue: number;
  gain: number;
  irPct: number;
  ir: number;
  netValue: number;
}

export interface InvestmentResult {
  principal: number;
  gross: number;
  net: number;
  tax: number;
  grossGain: number;
  netGain: number;
  details: InvestmentDetail[];
}

export interface AuditRow {
  month: number;
  aporte: number;
  cartaAtualizada: number;
  saldoInvestimento: number;
}

export interface InvestmentComparison {
  finalCredit: number;
  totalPaid: number;
  nominalSpread: number;
  savings: InvestmentResult;
  cdb: InvestmentResult;
  savingsVsCredit: number;
  cdbNetVsCredit: number;
  cdbGrossVsCredit: number;
  cdbNetVsPaid: number;
  status: string;
  cls: string;
  rows: { layer: string; scenario: string; value: number; diff: number; leitura: string }[];
  auditRows: AuditRow[];
}

export interface LanceAnalysis {
  isActive: boolean;
  lanceProprio: number;
  lanceFgts: number;
  lanceEmbutido: number;
  totalLance: number;
  baseDoLance: string;
  parcelasPagas: number;
  estrategiaPos: string;
  baseValue: number;
  lancePct: number;
  competitiveness: number;
  verdict: string;
  decisionText: string;
  impactoParcela?: number;
  impactoPrazo?: number;
}

export interface EstruturaResult {
  rows: EstruturaRow[];
  yearlyCorrections: YearlyCorrection[];
  sums: {
    fc: number;
    ta: number;
    fr: number;
    insurance: number;
    policyAdjustment: number;
    payment: number;
    reajuste: number;
    reajusteCredito: number;
    reajusteAdmin: number;
  };
  first: EstruturaRow;
  last: EstruturaRow;
  maxPayment: number;
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  insuranceRate: number;
  adjustmentRate: number;
  adjustmentPeriod: number;
  costs: CostBlock;
  costRows: CostTableRow[];
  investments: InvestmentComparison;
  lanceAnalysis?: LanceAnalysis;
  lanceResult?: any; // Resultado da integração do calcLanceLivre
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

function sumRows<T>(rows: T[], key: keyof T): number {
  return rows.reduce((a, r) => a + (typeof r[key] === 'number' ? (r[key] as number) : 0), 0);
}

/* ─── Funções portadas do HTML ─────────────────────────────────────────────── */

function initialBalances(c: EstruturaOptions) {
  const adminTotal = c.credit * c.adminRate / 100;
  const reserve = c.credit * c.reserveRate / 100;
  return {
    creditCurrent: c.credit,
    common: c.credit,
    admin: adminTotal,
    reserve,
    deferred: 0,
    adminTotal,
  };
}

function adjustmentDue(c: EstruturaOptions, month: number): boolean {
  return c.adjustmentPeriod > 0 && c.adjustmentRate > 0 && month >= c.firstAdjustmentMonth && ((month - c.firstAdjustmentMonth) % c.adjustmentPeriod === 0);
}

function applyAdjustment(c: EstruturaOptions, b: any) {
  const factor = 1 + c.adjustmentRate / 100;
  const beforeTotal = b.common + b.admin + b.reserve + b.deferred;
  const beforeCredit = b.creditCurrent;
  const beforeAdmin = b.admin;
  b.creditCurrent *= factor;
  b.common *= factor;
  b.admin *= factor;
  b.reserve *= factor;
  b.deferred *= factor;
  const afterTotal = b.common + b.admin + b.reserve + b.deferred;
  return {
    factor,
    value: afterTotal - beforeTotal,
    creditIncrease: b.creditCurrent - beforeCredit,
    adminIncrease: b.admin - beforeAdmin,
  };
}

function insuranceFor(c: EstruturaOptions, b: any): number {
  return (b.common + b.admin + b.reserve + b.deferred) * c.insuranceRate / 100;
}

function rangeForMonth(c: EstruturaOptions, month: number): PaymentRange | null {
  if (c.paymentPolicyMode !== 'ranges') return null;
  return (c.paymentRanges || []).find(r => month >= r.start && month <= r.end) || null;
}

function applyPaymentPolicy(
  c: EstruturaOptions,
  month: number,
  fullComponents: { fc: number; ta: number; fr: number },
  insurance: number,
  b: any
) {
  const fullBase = fullComponents.fc + fullComponents.ta + fullComponents.fr;
  const range = rangeForMonth(c, month);
  if (!range || fullBase <= EPS) {
    b.common = Math.max(0, b.common - fullComponents.fc);
    b.admin = Math.max(0, b.admin - fullComponents.ta);
    b.reserve = Math.max(0, b.reserve - fullComponents.fr);
    return { fc: fullComponents.fc, ta: fullComponents.ta, fr: fullComponents.fr, insurance, payment: fullBase + insurance, policyAdjustment: 0, policyLabel: 'Parcela cheia' };
  }
  let componentBudget = fullBase;
  if (range.type === 'percent') componentBudget = fullBase * range.value / 100;
  else componentBudget = Math.max(0, range.value - insurance);
  componentBudget = Math.min(componentBudget, fullBase);
  const factor = fullBase > EPS ? componentBudget / fullBase : 0;
  const fc = fullComponents.fc * factor;
  const ta = fullComponents.ta * factor;
  const fr = fullComponents.fr * factor;
  b.common = Math.max(0, b.common - fc);
  b.admin = Math.max(0, b.admin - ta);
  b.reserve = Math.max(0, b.reserve - fr);
  const payment = componentBudget + insurance;
  const policyAdjustment = payment - (fullBase + insurance);
  const policyLabel = range.type === 'percent'
    ? `Faixa ${range.start}-${range.end}: ${range.value}% da parcela cheia`
    : `Faixa ${range.start}-${range.end}: R$ ${range.value.toFixed(2)}`;
  return { fc, ta, fr, insurance, payment, policyAdjustment, policyLabel };
}

function simulateProposal(c: EstruturaOptions): {
  rows: EstruturaRow[];
  sums: EstruturaResult['sums'];
  first: EstruturaRow;
  last: EstruturaRow;
  maxPayment: number;
  contract: EstruturaOptions;
} {
  const b = initialBalances(c);
  const rows: EstruturaRow[] = [];
  let prevPayment = 0;

  for (let month = 1; month <= c.term; month++) {
    const tags: string[] = [];
    const saldoAntes = b.common + b.admin + b.reserve + b.deferred;
    let adj = { value: 0, creditIncrease: 0, adminIncrease: 0, factor: 1 };

    if (adjustmentDue(c, month)) {
      adj = applyAdjustment(c, b);
      tags.push('CORREÇÃO');
    }

    const saldoInicial = b.common + b.admin + b.reserve + b.deferred;
    const rem = c.term - month + 1;
    const fullComponents = { fc: b.common / rem, ta: b.admin / rem, fr: b.reserve / rem };
    const insurance = insuranceFor(c, b);
    const paid = applyPaymentPolicy(c, month, fullComponents, insurance, b);

    if (Math.abs(paid.policyAdjustment) > EPS) tags.push('POLÍTICA DE PARCELA');
    const { fc, ta, fr, payment, policyAdjustment, policyLabel } = paid;
    const saldoFinal = b.common + b.admin + b.reserve + b.deferred;

    if (prevPayment > 0 && payment > prevPayment * 1.005) tags.push('AUMENTO');

    rows.push({
      month,
      year: Math.ceil(month / 12),
      credit: b.creditCurrent,
      saldoAntes,
      reajuste: adj.value,
      reajusteCredito: adj.creditIncrease,
      reajusteAdmin: adj.adminIncrease,
      saldoInicial,
      fc,
      ta,
      fr,
      insurance,
      policyAdjustment,
      policyLabel,
      payment,
      saldoAfterPayment: saldoFinal,
      saldoFinal,
      tags,
    });
    prevPayment = payment;
  }

  const sums = {
    fc: sumRows(rows, 'fc'),
    ta: sumRows(rows, 'ta'),
    fr: sumRows(rows, 'fr'),
    insurance: sumRows(rows, 'insurance'),
    policyAdjustment: sumRows(rows, 'policyAdjustment'),
    payment: sumRows(rows, 'payment'),
    reajuste: sumRows(rows, 'reajuste'),
    reajusteCredito: sumRows(rows, 'reajusteCredito'),
    reajusteAdmin: sumRows(rows, 'reajusteAdmin'),
  };

  return {
    rows,
    sums,
    first: rows[0],
    last: rows[rows.length - 1],
    maxPayment: Math.max(0, ...rows.map(r => r.payment)),
    contract: c,
  };
}

function buildYearlyCorrections(p: ReturnType<typeof simulateProposal>): YearlyCorrection[] {
  const years = Math.max(1, Math.ceil(p.contract.term / 12));
  const out: YearlyCorrection[] = [];
  for (let y = 1; y <= years; y++) {
    const rs = p.rows.filter(r => r.year === y);
    if (!rs.length) continue;
    const events = rs.filter(r => r.reajuste > EPS);
    const last = rs[rs.length - 1];
    const paidYear = sumRows(rs, 'payment');
    const corrCarta = sumRows(rs, 'reajusteCredito');
    const corrSaldo = sumRows(rs, 'reajuste');
    out.push({
      year: y,
      events: events.length,
      paidYear,
      corrCarta,
      corrSaldo,
      cartaFim: last.credit,
      saldoFim: last.saldoFinal,
      leitura: events.length ? 'Houve correção no período' : 'Sem correção no período',
    });
  }
  return out;
}

function buildCosts(p: ReturnType<typeof simulateProposal>): { block: CostBlock; rows: CostTableRow[] } {
  const c = p.contract;
  const taxaContratada = c.credit * c.adminRate / 100;
  const correcaoCarta = p.sums.reajusteCredito;
  const correcaoAdm = p.sums.reajusteAdmin;
  const correcaoOutros = Math.max(0, p.sums.reajuste - correcaoCarta - correcaoAdm);
  const reajusteSaldoTotal = p.sums.reajuste;
  const taxaAdmProjetada = p.sums.ta;
  const finalCredit = p.last.credit;
  const totalProjected = p.sums.payment;
  const custoOperacional = taxaAdmProjetada + p.sums.fr + p.sums.insurance;
  const principalPago = p.sums.fc;
  const fundoReservaSeguro = p.sums.fr + p.sums.insurance;

  const saldoDevedorInicial = c.credit + taxaContratada;
  const saldoDevedorCorrigido = saldoDevedorInicial + reajusteSaldoTotal;

  // Campos extras para replicar HTML Raio-x do Consórcio
  const contractualAdmin = c.credit * c.adminRate / 100;
  const contractualReserve = c.credit * c.reserveRate / 100;
  const projectedAdmin = Math.max(0, contractualAdmin + correcaoAdm);
  const projectedInsurance = Math.max(0, p.sums.insurance);
  const explicitCost = projectedAdmin + projectedInsurance;
  const creditIncrease = finalCredit - c.credit;
  const totalPaidNominal = p.sums.payment;
  const reserveCorrection = p.sums.reajuste - correcaoCarta - correcaoAdm;
  const fundoReservaProjetado = p.sums.fr;
  const oldMisleadingSpread = totalPaidNominal - finalCredit;

  const block: CostBlock = {
    taxaContratada,
    correcaoCarta,
    correcaoAdm,
    correcaoOutros,
    reajusteSaldoTotal,
    taxaAdmProjetada,
    finalCredit,
    totalProjected,
    custoOperacional,
    principalPago,
    fundoReservaSeguro,
    saldoDevedorInicial,
    saldoDevedorCorrigido,
    contractualAdmin,
    contractualReserve,
    projectedAdmin,
    projectedInsurance,
    explicitCost,
    creditIncrease,
    totalPaidNominal,
    reserveCorrection,
    fundoReservaProjetado,
    oldMisleadingSpread,
  };

  const rows: CostTableRow[] = [
    { camada: '1. Base de crédito', item: 'Carta contratada', valor: c.credit, leitura: 'Valor original informado na proposta.' },
    { camada: '1. Base de crédito', item: 'Reajuste da carta/fundo comum', valor: correcaoCarta, leitura: 'Parte da correção que aumenta o crédito e o fundo comum.' },
    { camada: '1. Base de crédito', item: 'Carta atualizada projetada', valor: finalCredit, leitura: 'Carta contratada + reajustes projetados da carta.' },
    { camada: '2. Correções do saldo', item: 'Correção sobre taxa adm.', valor: correcaoAdm, leitura: 'Parte da correção que aumenta a taxa de administração ainda não paga.' },
    { camada: '2. Correções do saldo', item: 'Correção sobre outros saldos', valor: correcaoOutros, leitura: 'Residual de fundo reserva ou saldos diferidos, quando existir.' },
    { camada: '2. Correções do saldo', item: 'Reajuste total do saldo devedor', valor: reajusteSaldoTotal, leitura: 'Soma informativa de todos os reajustes aplicados ao saldo. Não somar novamente ao custo operacional.' },
    { camada: '3. Custo operacional', item: 'Taxa adm. contratada', valor: taxaContratada, leitura: `${c.adminRate}% sobre a carta original.` },
    { camada: '3. Custo operacional', item: 'Taxa adm. projetada', valor: taxaAdmProjetada, leitura: 'Taxa nominal + correção da taxa adm., sem cobrança inicial no racional.' },
    { camada: '3. Custo operacional', item: 'Fundo reserva projetado', valor: p.sums.fr, leitura: 'Componente contratual quando previsto.' },
    { camada: '3. Custo operacional', item: 'Seguro projetado', valor: p.sums.insurance, leitura: 'Componente informado na simulação, quando existir.' },
    { camada: '3. Custo operacional', item: 'Custo operacional total', valor: custoOperacional, leitura: 'Taxa adm. projetada + fundo reserva + seguro.' },
    { camada: '4. Fluxo total', item: 'Principal pago/fundo comum', valor: principalPago, leitura: 'Valor destinado à formação do crédito/carta ao longo do fluxo.' },
    { camada: '4. Fluxo total', item: 'Total projetado pago', valor: totalProjected, leitura: 'Soma de todas as parcelas projetadas.' },
  ];

  return { block, rows };
}

function irRateByHeldMonths(monthsHeld: number): number {
  const days = Math.max(1, monthsHeld) * 30;
  if (days <= 180) return 22.5;
  if (days <= 360) return 20;
  if (days <= 720) return 17.5;
  return 15;
}

function accumulateInvestmentFlow(rows: EstruturaRow[], monthlyRatePct: number, taxable: boolean): InvestmentResult {
  const rate = Math.max(0, monthlyRatePct) / 100;
  const term = rows.length || 1;
  let principal = 0, gross = 0, net = 0, tax = 0, grossGain = 0;
  const details: InvestmentDetail[] = rows.map(r => {
    const monthsHeld = Math.max(1, term - r.month + 1);
    const aporte = Math.max(0, r.payment);
    const grossValue = aporte * Math.pow(1 + rate, monthsHeld);
    const gain = Math.max(0, grossValue - aporte);
    const irPct = taxable ? irRateByHeldMonths(monthsHeld) : 0;
    const ir = taxable ? gain * irPct / 100 : 0;
    const netValue = grossValue - ir;
    principal += aporte;
    gross += grossValue;
    net += netValue;
    tax += ir;
    grossGain += gain;
    return { month: r.month, aporte, monthsHeld, grossValue, gain, irPct, ir, netValue };
  });
  return { principal, gross, net, tax, grossGain, netGain: net - principal, details };
}

function simulateInvestmentComparison(c: EstruturaOptions, p: ReturnType<typeof simulateProposal>): InvestmentComparison {
  const savings = accumulateInvestmentFlow(p.rows, c.savingsRate, false);
  const cdb = accumulateInvestmentFlow(p.rows, c.cdbRate, false);
  const finalCredit = p.last.credit;
  const totalPaid = p.sums.payment;
  const nominalSpread = finalCredit - totalPaid;
  const savingsVsCredit = savings.net - finalCredit;
  const cdbNetVsCredit = cdb.net - finalCredit;
  const cdbGrossVsCredit = cdb.gross - finalCredit;
  const cdbNetVsPaid = cdb.net - totalPaid;
  const status = cdbNetVsCredit > EPS ? 'CDB líquido superou a carta' : (Math.abs(cdbNetVsCredit) <= EPS ? 'Empate técnico' : 'Consórcio venceu');
  const cls = cdbNetVsCredit > EPS ? 'critical' : (Math.abs(cdbNetVsCredit) <= EPS ? 'orange' : 'green');

  /* Auditoria de Fluxo de Caixa (Igualado) — saldo acumulado mês a mês no CDB */
  const cdbRate = Math.max(0, c.cdbRate) / 100;
  const auditRows: AuditRow[] = [];
  const sampleMonths = new Set<number>();
  sampleMonths.add(1);
  for (let m = 12; m <= p.rows.length; m += 12) sampleMonths.add(m);
  sampleMonths.add(p.rows.length);
  let runningBalance = 0;
  for (const r of p.rows) {
    runningBalance = (runningBalance + Math.max(0, r.payment)) * (1 + cdbRate);
    if (sampleMonths.has(r.month)) {
      auditRows.push({ month: r.month, aporte: r.payment, cartaAtualizada: r.credit, saldoInvestimento: runningBalance });
    }
  }

  const rows = [
    { layer: 'Consórcio', scenario: 'Total desembolsado no consórcio', value: totalPaid, diff: totalPaid - finalCredit, leitura: 'Soma das parcelas projetadas na aba 1. É o esforço financeiro usado também na simulação dos investimentos.' },
    { layer: 'Consórcio', scenario: 'Carta de crédito no final do plano', value: finalCredit, diff: 0, leitura: 'Carta corrigida até o último mês da proposta. É a referência contra a qual os investimentos são comparados.' },
    { layer: 'Leitura nominal', scenario: 'Diferença carta - desembolso', value: nominalSpread, diff: nominalSpread, leitura: 'Mostra se a carta final ficou acima do valor nominal pago. Não mede custo de oportunidade.' },
    { layer: 'Investimento', scenario: 'Poupança · mesmo fluxo mensal', value: savings.net, diff: savingsVsCredit, leitura: `Cada parcela do consórcio foi aplicada à taxa de ${c.savingsRate}% ao mês, sem IR.` },
    { layer: 'Investimento', scenario: 'CDB 100% CDI líquido · mesmo fluxo mensal', value: cdb.net, diff: cdbNetVsCredit, leitura: `Cada parcela foi aplicada à taxa líquida informada de ${c.cdbRate}% ao mês, sem nova dedução de IR no cálculo.` },
    { layer: 'Custo de oportunidade', scenario: 'CDB líquido contra desembolso nominal', value: cdbNetVsPaid, diff: cdbNetVsPaid, leitura: 'Quanto o CDB líquido ficou acima do total de parcelas pagas no consórcio.' },
  ];

  return { finalCredit, totalPaid, nominalSpread, savings, cdb, savingsVsCredit, cdbNetVsCredit, cdbGrossVsCredit, cdbNetVsPaid, status, cls, rows, auditRows };
}

/* ─── Função principal exportada ───────────────────────────────────────────── */

function analyzeLanceImpact(opts: EstruturaOptions, proposal: any): LanceAnalysis | undefined {
  const lanceProprio = opts.lanceProprio || 0;
  const lanceFgts = opts.lanceFgts || 0;
  const lanceEmbutido = opts.lanceEmbutido || 0;
  const totalLance = lanceProprio + lanceFgts + lanceEmbutido;

  if (totalLance <= 0) return undefined;

  const baseDoLance = opts.baseDoLance || 'carta';
  const baseValue = baseDoLance === 'categoria' ? opts.credit * (1 + opts.adminRate / 100) : opts.credit;
  const lancePct = (totalLance / baseValue) * 100;
  const referenceBidPct = 45;
  const competitiveness = (lancePct / referenceBidPct) * 100;

  let verdict: string = 'atencao';
  let decisionText = '';

  if (lancePct <= 0) {
    verdict = 'critico';
    decisionText = 'Sem lance, a contemplacao depende exclusivamente de sorteio.';
  } else if (competitiveness < 70) {
    verdict = 'critico';
    decisionText = `Seu lance representa apenas ${lancePct.toFixed(1)}% da base. Pouco provavel que venca por lance.`;
  } else if (competitiveness < 90) {
    verdict = 'atencao';
    decisionText = `Seu lance esta abaixo da media historica (${competitiveness.toFixed(0)}% da referencia). Pode contemplar em assembleias fracas.`;
  } else if (competitiveness > 140) {
    verdict = 'atencao';
    decisionText = `Seu lance esta bem acima da referencia (${competitiveness.toFixed(0)}%). Chance alta, mas pode estar imobilizando capital.`;
  } else {
    verdict = 'positivo';
    decisionText = `Seu lance esta na faixa competitiva (${competitiveness.toFixed(0)}% da referencia), com boa relacao entre chance e capital.`;
  }

  const estrategiaPos = opts.estrategiaPos || 'abater_parcela';
  const parcelasPagas = opts.parcelasPagas || 0;
  const remainingInstallments = Math.max(0, opts.term - parcelasPagas);
  const installmentBase = baseValue / opts.term;
  const remainingDebt = Math.max(0, baseValue - installmentBase * parcelasPagas - totalLance);

  let impactoParcela: number | undefined;
  let impactoPrazo: number | undefined;

  if (estrategiaPos === 'abater_parcela' && remainingInstallments > 0) {
    const newInstallment = remainingDebt / remainingInstallments;
    impactoParcela = installmentBase - newInstallment;
  } else if (estrategiaPos === 'reduzir_prazo') {
    const monthsCovered = installmentBase > 0.02 ? Math.floor(totalLance / installmentBase) : 0;
    impactoPrazo = Math.min(monthsCovered, remainingInstallments);
  }

  return {
    isActive: true,
    lanceProprio,
    lanceFgts,
    lanceEmbutido,
    totalLance,
    baseDoLance,
    parcelasPagas,
    estrategiaPos,
    baseValue,
    lancePct,
    competitiveness,
    verdict,
    decisionText,
    impactoParcela,
    impactoPrazo,
  };
}

export function simulateEstruturaDoPlano(opts: EstruturaOptions): EstruturaResult {
  const c: EstruturaOptions = {
    credit: Math.max(0, opts.credit),
    term: clamp(Math.round(opts.term || 1), 1, 300),
    adminRate: clamp(opts.adminRate, 0, 100),
    reserveRate: clamp(opts.reserveRate, 0, 100),
    insuranceRate: Math.max(0, opts.insuranceRate || 0),
    adjustmentRate: clamp(opts.adjustmentRate, 0, 1000),
    adjustmentPeriod: Math.round(opts.adjustmentPeriod || 0),
    firstAdjustmentMonth: Math.round(opts.firstAdjustmentMonth || (opts.adjustmentPeriod === 6 ? 7 : 13)),
    paymentPolicyMode: opts.paymentPolicyMode || 'standard',
    paymentRanges: opts.paymentRanges || [],
    savingsRate: Math.max(0, opts.savingsRate ?? 0.515),
    cdbRate: Math.max(0, opts.cdbRate ?? 0.795),
  };

  const proposal = simulateProposal(c);
  const yearlyCorrections = buildYearlyCorrections(proposal);
  const { block: costs, rows: costRows } = buildCosts(proposal);
  const investments = simulateInvestmentComparison(c, proposal);
  const lanceAnalysis = analyzeLanceImpact(opts, proposal);

  // Integração do calcLanceLivre
  let lanceResult: any = undefined;
  if (opts.lanceProprio || opts.lanceFgts || opts.lanceEmbutido) {
    const { calcLanceLivre } = require('./lanceLivre');
    const totalLance = (opts.lanceProprio || 0) + (opts.lanceFgts || 0) + (opts.lanceEmbutido || 0);
    const bidPct = (totalLance / c.credit) * 100;
    
    lanceResult = calcLanceLivre({
      credit: c.credit,
      adminRate: c.adminRate,
      term: c.term,
      paidInstallments: opts.parcelasPagas || 0,
      bidPct,
      referenceBidPct: 45,
      lanceUse: opts.estrategiaPos || 'abater_parcela',
      own: opts.lanceProprio || 0,
      fgts: opts.lanceFgts || 0,
      embedded: opts.lanceEmbutido || 0,
    });
  }

  return {
    rows: proposal.rows,
    yearlyCorrections,
    sums: proposal.sums,
    first: proposal.first,
    last: proposal.last,
    maxPayment: proposal.maxPayment,
    credit: c.credit,
    term: c.term,
    adminRate: c.adminRate,
    reserveRate: c.reserveRate,
    insuranceRate: c.insuranceRate,
    adjustmentRate: c.adjustmentRate,
    adjustmentPeriod: c.adjustmentPeriod,
    costs,
    costRows,
    investments,
    lanceAnalysis,
    lanceResult,
  };
}
