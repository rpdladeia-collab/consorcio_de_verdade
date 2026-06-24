export interface ScheduleOptions {
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  insuranceRate: number;
  adjRate: number;
  adjEvery: number;
  firstAdj?: number;
  mode?: 'linear' | 'nonlinear';
  ranges?: string;
}

export interface ScheduleRow {
  month: number;
  credit: number;
  correctionFactor: number;
  opening: number;
  fc: number;
  ta: number;
  fr: number;
  insurance: number;
  installment: number;
  paidTotal: number;
  balance: number;
  fcBal: number;
  taBal: number;
  frBal: number;
  correctionDelta: number;
  fcCorrectionDelta: number;
  adminCorrectionDelta: number;
  reserveCorrectionDelta: number;
  correctionAccum: number;
  tags: string[];
}

export interface ScheduleResult {
  rows: ScheduleRow[];
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  initialObligation: number;
  paidTotal: number;
  insuranceTotal: number;
  correctionNominal: number;
  fcCorrection: number;
  adminCorrection: number;
  reserveCorrection: number;
  residual: number;
  finalCredit: number;
  warnings: string[];
  overpay: number;
}

const EPS = 0.0001;

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function parseRanges(text: string, term: number) {
  const map = new Map<number, number>();
  const warnings: string[] = [];
  const lines = String(text || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
  
  lines.forEach((line, idx) => {
    const cleaned = line.replace(/m[eê]s(es)?/ig, '').replace(/R\$/ig, '');
    const m = cleaned.match(/(\d+)\s*(?:-|a|até|ate)\s*(\d+)\s*[:=]\s*([\d.,]+)/i) || cleaned.match(/(\d+)\s*[:=]\s*([\d.,]+)/i);
    
    if (!m) {
      warnings.push(`Linha ${idx + 1} ignorada: use 1-12: 2500.`);
      return;
    }
    
    let start, end, value;
    if (m.length === 4) {
      start = parseInt(m[1], 10);
      end = parseInt(m[2], 10);
      const valStr = m[3].replace(/\./g, '').replace(',', '.');
      value = parseFloat(valStr);
    } else {
      start = parseInt(m[1], 10);
      end = start;
      const valStr = m[2].replace(/\./g, '').replace(',', '.');
      value = parseFloat(valStr);
    }
    
    start = clamp(start, 1, term);
    end = clamp(end, 1, term);
    if (end < start) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    for (let i = start; i <= end; i++) map.set(i, value);
  });
  
  return { map, warnings };
}

function isAdjustMonth(m: number, every: number, first: number) {
  return every > 0 && first > 0 && m >= first && ((m - first) % every === 0);
}

function firstAdjustmentMonth(every: number) {
  const n = Math.round(every || 0);
  if (n === 12) return 13;
  if (n === 6) return 7;
  return 0;
}

export function buildSchedule(opts: ScheduleOptions): ScheduleResult {
  const credit = Math.max(0, opts.credit);
  const term = clamp(Math.round(opts.term || 1), 1, 360);
  const adminRate = clamp(opts.adminRate, 0, 1000) / 100;
  const reserveRate = clamp(opts.reserveRate, 0, 1000) / 100;
  const insuranceRate = Math.max(0, opts.insuranceRate || 0) / 100;
  const adjRate = (opts.adjRate || 0) / 100;
  const adjEvery = Math.round(opts.adjEvery || 0);
  const firstAdj = Math.round(opts.firstAdj || firstAdjustmentMonth(adjEvery));
  const mode = opts.mode || 'linear';
  
  const parsed = parseRanges(opts.ranges || '', term);
  
  let creditCurrent = credit;
  let correctionFactor = 1;
  let fc = credit, ta = credit * adminRate, fr = credit * reserveRate;
  let initialObligation = fc + ta + fr;
  let correctionNominal = 0, fcCorrection = 0, adminCorrection = 0, reserveCorrection = 0, insuranceTotal = 0, paidTotal = 0, overpay = 0;
  
  const rows: ScheduleRow[] = [];
  const warnings = [...parsed.warnings];
  
  for (let m = 1; m <= term; m++) {
    let tags: string[] = [];
    let correctionDelta = 0, fcCorrectionDelta = 0, adminCorrectionDelta = 0, reserveCorrectionDelta = 0;
    
    if (isAdjustMonth(m, adjEvery, firstAdj)) {
      const beforeFc = fc, beforeTa = ta, beforeFr = fr;
      creditCurrent *= 1 + adjRate;
      correctionFactor *= 1 + adjRate;
      fc *= 1 + adjRate;
      ta *= 1 + adjRate;
      fr *= 1 + adjRate;
      
      fcCorrectionDelta = fc - beforeFc;
      adminCorrectionDelta = ta - beforeTa;
      reserveCorrectionDelta = fr - beforeFr;
      correctionDelta = fcCorrectionDelta + adminCorrectionDelta + reserveCorrectionDelta;
      
      fcCorrection += fcCorrectionDelta;
      adminCorrection += adminCorrectionDelta;
      reserveCorrection += reserveCorrectionDelta;
      correctionNominal += correctionDelta;
      tags.push('Reajuste');
    }
    
    const monthsLeft = term - m + 1;
    const linearComponents = (fc + ta + fr) / monthsLeft;
    let desiredComponents = linearComponents;
    
    if (mode === 'nonlinear' && parsed.map.has(m)) {
      desiredComponents = (parsed.map.get(m) || 0) * correctionFactor;
    }
    
    desiredComponents = Math.max(0, desiredComponents);
    const outstanding = fc + ta + fr;
    let componentPay = Math.min(desiredComponents, outstanding);
    
    if (desiredComponents > outstanding + EPS) {
      overpay += desiredComponents - outstanding;
      tags.push('Excesso');
    }
    
    const fcShare = outstanding > EPS ? fc / outstanding : 0;
    const taShare = outstanding > EPS ? ta / outstanding : 0;
    const frShare = outstanding > EPS ? fr / outstanding : 0;
    
    const payFc = Math.min(fc, componentPay * fcShare);
    const payTa = Math.min(ta, componentPay * taShare);
    const payFr = Math.min(fr, componentPay * frShare);
    
    const opening = outstanding;
    fc -= payFc; ta -= payTa; fr -= payFr;
    
    if (fc < EPS) fc = 0;
    if (ta < EPS) ta = 0;
    if (fr < EPS) fr = 0;
    
    const insurance = (fc + ta + fr) * insuranceRate;
    insuranceTotal += insurance;
    const installment = componentPay + insurance;
    paidTotal += installment;
    
    rows.push({
      month: m,
      credit: creditCurrent,
      correctionFactor,
      opening,
      fc: payFc,
      ta: payTa,
      fr: payFr,
      insurance,
      installment,
      paidTotal,
      balance: fc + ta + fr,
      fcBal: fc,
      taBal: ta,
      frBal: fr,
      correctionDelta,
      fcCorrectionDelta,
      adminCorrectionDelta,
      reserveCorrectionDelta,
      correctionAccum: correctionNominal,
      tags
    });
  }
  
  const residual = fc + ta + fr;
  if (mode === 'nonlinear') {
    const missing: number[] = [];
    for (let i = 1; i <= term; i++) if (!parsed.map.has(i)) missing.push(i);
    if (missing.length) warnings.push(`${missing.length} mês(es) sem faixa não linear: nesses meses foi usada a parcela linear estimada, sempre com as correções do índice aplicadas.`);
    if (residual > 1) warnings.push(`Após aplicar as correções do índice, ainda existe saldo residual estimado. Revise as faixas informadas.`);
    if (overpay > 1) warnings.push(`As parcelas informadas excedem a obrigação contratual. O motor limitou o pagamento ao saldo restante.`);
  }
  
  return {
    rows,
    credit,
    term,
    adminRate: adminRate * 100,
    reserveRate: reserveRate * 100,
    initialObligation,
    paidTotal,
    insuranceTotal,
    correctionNominal,
    fcCorrection,
    adminCorrection,
    reserveCorrection,
    residual,
    finalCredit: creditCurrent,
    warnings,
    overpay
  };
}

export function buildContemplationProjection(
  schedule: ScheduleResult,
  paidMonths: number,
  appliedLance: number,
  opts: { adjRate: number; adjEvery: number; firstAdj?: number; insuranceRate: number; adminRate: number; reserveRate: number }
) {
  const term = schedule.term;
  const startRow = paidMonths > 0 ? schedule.rows[paidMonths - 1] : {
    credit: schedule.credit,
    fcBal: schedule.credit,
    taBal: schedule.credit * (opts.adminRate / 100),
    frBal: schedule.credit * (opts.reserveRate / 100),
    balance: schedule.initialObligation,
    paidTotal: 0
  };
  
  let creditCurrent = startRow.credit || schedule.credit;
  let fc = Math.max(0, startRow.fcBal || 0);
  let ta = Math.max(0, startRow.taBal || 0);
  let fr = Math.max(0, startRow.frBal || 0);
  let lanceLeft = Math.max(0, appliedLance);
  
  const fcLance = Math.min(fc, lanceLeft);
  fc -= fcLance;
  lanceLeft -= fcLance;
  
  if (lanceLeft > EPS) {
    const total = fc + ta + fr;
    const taLance = total > EPS ? Math.min(ta, lanceLeft * (ta / total)) : 0;
    const frLance = total > EPS ? Math.min(fr, lanceLeft * (fr / total)) : 0;
    ta -= taLance;
    fr -= frLance;
  }
  
  const adjRate = (opts.adjRate || 0) / 100;
  const adjEvery = Math.round(opts.adjEvery || 0);
  const firstAdj = Math.round(opts.firstAdj || firstAdjustmentMonth(adjEvery));
  const insuranceRate = Math.max(0, opts.insuranceRate || 0) / 100;
  
  const rows: any[] = [];
  schedule.rows.slice(0, paidMonths).forEach(r => {
    rows.push({
      month: r.month,
      credit: r.credit,
      event: r.tags.includes('Reajuste') ? 'Reajuste / parcela paga' : 'Parcela paga',
      lance: 0,
      installment: r.installment,
      balance: r.balance,
      projected: r.installment,
      tags: r.tags
    });
  });
  
  if (paidMonths > 0) {
    rows.push({
      month: paidMonths,
      credit: creditCurrent,
      event: 'Lance aplicado',
      lance: appliedLance,
      installment: 0,
      balance: fc + ta + fr,
      projected: 0,
      tags: ['Lance']
    });
  }
  
  let paidProjected = 0;
  for (let m = paidMonths + 1; m <= term; m++) {
    let tags: string[] = [];
    if (isAdjustMonth(m, adjEvery, firstAdj)) {
      creditCurrent *= 1 + adjRate;
      fc *= 1 + adjRate;
      ta *= 1 + adjRate;
      fr *= 1 + adjRate;
      tags.push('Reajuste');
    }
    
    const monthsLeft = term - m + 1;
    const componentPay = (fc + ta + fr) / Math.max(1, monthsLeft);
    const total = fc + ta + fr;
    const payFc = total > EPS ? Math.min(fc, componentPay * (fc / total)) : 0;
    const payTa = total > EPS ? Math.min(ta, componentPay * (ta / total)) : 0;
    const payFr = total > EPS ? Math.min(fr, componentPay * (fr / total)) : 0;
    
    fc -= payFc; ta -= payTa; fr -= payFr;
    if (fc < EPS) fc = 0;
    if (ta < EPS) ta = 0;
    if (fr < EPS) fr = 0;
    
    const insurance = (fc + ta + fr) * insuranceRate;
    const installment = componentPay + insurance;
    paidProjected += installment;
    
    rows.push({
      month: m,
      credit: creditCurrent,
      event: tags.includes('Reajuste') ? 'Reajuste / parcela projetada' : 'Parcela projetada',
      lance: 0,
      installment,
      balance: fc + ta + fr,
      projected: installment,
      tags
    });
  }
  
  return { rows, paidProjected, finalBalance: fc + ta + fr };
}
