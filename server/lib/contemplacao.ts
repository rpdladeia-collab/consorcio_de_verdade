/**
 * Módulo 2 — Contemplação
 * Lógica extraída fielmente do HTML original Raio-X do Consórcio.
 * Funções: buildContemplationProjection + runContemplation
 * Fonte: Raio-xdoConsórcioSITE_.renatto.html (linhas 362–462)
 *
 * REGRA: Não alterar nenhuma fórmula sem aprovação explícita.
 */

import { buildSchedule, ScheduleResult } from './raiox';

// EPS idêntico ao HTML original
const EPS = 0.01;

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function firstAdjustmentMonth(every: number): number {
  const n = Math.round(every || 0);
  if (n === 12) return 13;
  if (n === 6) return 7;
  return 0;
}

function isAdjustMonth(m: number, every: number, first: number): boolean {
  return every > 0 && first > 0 && m >= first && (m - first) % every === 0;
}

function moneyStr(v: number): string {
  return (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tipos
───────────────────────────────────────────────────────────────────────────── */

export interface ContemplationProjectionRow {
  month: number;
  credit: number;
  event: string;
  lance: number;
  installment: number;
  balance: number;
  projected: number;
  tags: string[];
}

export interface ContemplationProjection {
  rows: ContemplationProjectionRow[];
  paidProjected: number;
  finalBalance: number;
}

export interface ContemplationSummaryRow {
  item: string;
  value: string;
  read: string;
}

export interface ContemplationResult {
  // KPIs
  forcePct: number;
  totalLance: number;
  creditLiquid: number;
  postLanceInstallment: number;
  newInstallment: number;
  // Leitura técnica
  baseLabel: string;
  own: number;
  fgts: number;
  embedded: number;
  credit: number;
  applied: number;
  amortizable: number;
  paidTotal: number;
  // Tabelas
  summaryRows: ContemplationSummaryRow[];
  projection: ContemplationProjection;
  // Warnings
  warnings: string[];
  // Metadados
  simulationId: string;
  generatedAt: string;
}

export interface ContemplationOptions {
  // Campos do plano (buildSchedule)
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  adjRate: number;
  adjEvery: number;
  mode: 'linear' | 'nonlinear';
  ranges: string;
  // Campos específicos da contemplação
  paidMonths: number;
  base: 'credit' | 'category';
  own: number;
  fgts: number;
  embedded: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   buildContemplationProjection
   Fiel ao HTML original (linhas 362–404)
───────────────────────────────────────────────────────────────────────────── */
export function buildContemplationProjection(
  schedule: ScheduleResult,
  paidMonths: number,
  appliedLance: number,
  opts: { adjRate: number; adjEvery: number; firstAdj: number; insuranceRate: number }
): ContemplationProjection {
  const term = schedule.term;

  // startRow: estado do plano no mês da contemplação
  const startRow =
    paidMonths > 0
      ? schedule.rows[paidMonths - 1]
      : {
          credit: schedule.credit,
          fcBal: schedule.credit,
          taBal: schedule.credit * (schedule.adminRate),
          frBal: schedule.credit * (schedule.reserveRate),
          balance: schedule.initialObligation,
          paidTotal: 0,
        };

  let creditCurrent = (startRow as { credit?: number }).credit || schedule.credit;
  let fc = Math.max(0, (startRow as { fcBal?: number }).fcBal || 0);
  let ta = Math.max(0, (startRow as { taBal?: number }).taBal || 0);
  let fr = Math.max(0, (startRow as { frBal?: number }).frBal || 0);

  // Amortização do lance: primeiro no fundo comum, depois proporcionalmente em ta/fr
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

  const adjRate = opts.adjRate / 100;
  const adjEvery = Math.round(opts.adjEvery || 0);
  const firstAdj = Math.round(opts.firstAdj || firstAdjustmentMonth(adjEvery));
  const insuranceRate = Math.max(0, opts.insuranceRate || 0) / 100;

  const rows: ContemplationProjectionRow[] = [];

  // Linhas das parcelas já pagas (histórico)
  schedule.rows.slice(0, paidMonths).forEach((r) => {
    rows.push({
      month: r.month,
      credit: r.credit,
      event: r.tags.includes('Reajuste') ? 'Reajuste / parcela paga' : 'Parcela paga',
      lance: 0,
      installment: r.installment,
      balance: r.balance,
      projected: r.installment,
      tags: r.tags,
    });
  });

  // Linha do lance aplicado
  if (paidMonths > 0) {
    rows.push({
      month: paidMonths,
      credit: creditCurrent,
      event: 'Lance aplicado',
      lance: appliedLance,
      installment: 0,
      balance: fc + ta + fr,
      projected: 0,
      tags: ['Lance'],
    });
  }

  // Projeção das parcelas futuras
  let paidProjected = 0;
  for (let m = paidMonths + 1; m <= term; m++) {
    const tags: string[] = [];
    let opening = fc + ta + fr;

    if (isAdjustMonth(m, adjEvery, firstAdj)) {
      creditCurrent *= 1 + adjRate;
      fc *= 1 + adjRate;
      ta *= 1 + adjRate;
      fr *= 1 + adjRate;
      opening = fc + ta + fr;
      tags.push('Reajuste');
    }

    const monthsLeft = term - m + 1;
    const componentPay = (fc + ta + fr) / Math.max(1, monthsLeft);
    const total = fc + ta + fr;

    const payFc = total > EPS ? Math.min(fc, componentPay * (fc / total)) : 0;
    const payTa = total > EPS ? Math.min(ta, componentPay * (ta / total)) : 0;
    const payFr = total > EPS ? Math.min(fr, componentPay * (fr / total)) : 0;

    fc -= payFc;
    ta -= payTa;
    fr -= payFr;

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
      tags,
    });

    void opening; // usado apenas para rastreabilidade
  }

  return { rows, paidProjected, finalBalance: fc + ta + fr };
}

/* ─────────────────────────────────────────────────────────────────────────────
   runContemplation
   Fiel ao HTML original (linhas 422–462)
───────────────────────────────────────────────────────────────────────────── */
export function runContemplation(opts: ContemplationOptions): ContemplationResult {
  // Gera o fluxo base do plano
  const s: ScheduleResult = buildSchedule({
    credit: opts.credit,
    term: opts.term,
    adminRate: opts.adminRate,
    reserveRate: opts.reserveRate,
    insuranceRate: 0,
    adjRate: opts.adjRate,
    adjEvery: opts.adjEvery,
    mode: opts.mode,
    ranges: opts.ranges,
  });

  const rawPaidMonths = Math.round(opts.paidMonths);
  const paidMonths = clamp(rawPaidMonths, 0, s.term);

  // Estado no mês da contemplação
  const row =
    paidMonths > 0
      ? s.rows[paidMonths - 1]
      : {
          credit: s.credit,
          balance: s.initialObligation,
          fcBal: s.credit,
          taBal: s.credit * (s.adminRate),
          frBal: s.credit * (s.reserveRate),
          paidTotal: 0,
          installment: s.rows[0]?.installment || 0,
        };

  const credit = (row as { credit?: number }).credit || s.credit;

  // Base do lance: sobre carta ou sobre categoria (carta + taxa adm)
  const base =
    opts.base === 'category' ? credit * (1 + opts.adminRate / 100) : credit;

  const own = Math.max(0, opts.own);
  const fgts = Math.max(0, opts.fgts);
  const embedded = Math.max(0, opts.embedded);
  const totalLance = own + fgts + embedded;
  const creditLiquid = Math.max(0, credit - embedded);

  // Capacidade amortizável: saldo do fundo comum no mês (fcBal), ou min(balance, credit)
  const amortizable = Math.max(
    0,
    (row as { fcBal?: number }).fcBal ?? Math.min(row.balance, credit)
  );
  const applied = Math.min(totalLance, amortizable);
  const residual = Math.max(0, row.balance - applied);
  const monthsLeft = Math.max(1, s.term - paidMonths);
  const newInstallment = residual / monthsLeft;
  const forcePct = base > 0 ? (totalLance / base) * 100 : 0;

  // Projeção pós-lance
  const projection = buildContemplationProjection(s, paidMonths, applied, {
    adjRate: opts.adjRate,
    adjEvery: opts.adjEvery,
    firstAdj: firstAdjustmentMonth(opts.adjEvery),
    insuranceRate: 0,
  });

  const firstProjectedRow = projection.rows.find(
    (r) => r.month > paidMonths && r.projected > 0
  );
  const postLanceInstallment = firstProjectedRow ? firstProjectedRow.projected : 0;

  // Tabela de resumo (7 linhas — fiel ao HTML)
  const summaryRows: ContemplationSummaryRow[] = [
    {
      item: 'Carta atualizada no mês',
      value: moneyStr(credit),
      read: 'Base econômica antes do embutido.',
    },
    {
      item: 'Parcelas pagas acumuladas',
      value: moneyStr((row as { paidTotal?: number }).paidTotal || 0),
      read: 'Desembolso já realizado até a contemplação.',
    },
    {
      item: 'Lance próprio',
      value: moneyStr(own),
      read: 'Dinheiro do cliente. Ajuda a contemplar e reduz eficiência econômica.',
    },
    {
      item: 'FGTS',
      value: moneyStr(fgts),
      read: 'Recurso próprio vinculado. Não reduz a carta, mas reduz dinheiro novo.',
    },
    {
      item: 'Lance embutido',
      value: moneyStr(embedded),
      read: 'Não sai do bolso, mas reduz a carta líquida.',
    },
    {
      item: 'Carta líquida após embutido',
      value: moneyStr(creditLiquid),
      read: 'Valor que sobra para compra.',
    },
    {
      item: 'Saldo estimado pós-lance',
      value: moneyStr(projection.finalBalance),
      read: 'Saldo residual ao final da projeção, após parcelas futuras.',
    },
  ];

  // Warnings (fiel ao HTML)
  const warnings: string[] = [...s.warnings];

  if (rawPaidMonths !== paidMonths) {
    if (rawPaidMonths > s.term) {
      warnings.push(
        `Parcelas pagas ajustadas para ${s.term}, que é o prazo máximo do plano. Você informou ${rawPaidMonths}; por isso o motor usa a última parcela válida do fluxo.`
      );
    } else if (rawPaidMonths < 0) {
      warnings.push(
        'Parcelas pagas ajustadas para 0. O simulador não aceita mês negativo de contemplação.'
      );
    }
  }

  if (paidMonths >= s.term) {
    warnings.push(
      'A contemplação foi simulada no fim do prazo. Neste ponto o saldo residual tende a zero; a carta líquida exibida representa o crédito atualizado antes do lance embutido, não uma dívida a vencer.'
    );
  }

  if (embedded > credit) {
    warnings.push(
      'Lance embutido maior que a carta: a carta líquida foi travada em zero. Revise a premissa.'
    );
  }

  if (totalLance > amortizable + EPS) {
    warnings.push(
      `O lance informado excede a capacidade amortizável estimada no mês. O motor limitou a amortização a ${moneyStr(applied)}.`
    );
  }

  return {
    forcePct,
    totalLance,
    creditLiquid,
    postLanceInstallment,
    newInstallment,
    baseLabel: opts.base === 'category' ? 'categoria' : 'carta',
    own,
    fgts,
    embedded,
    credit,
    applied,
    amortizable,
    paidTotal: (row as { paidTotal?: number }).paidTotal || 0,
    summaryRows,
    projection,
    warnings,
    simulationId: '',   // preenchido pela procedure tRPC
    generatedAt: '',    // preenchido pela procedure tRPC
  };
}
