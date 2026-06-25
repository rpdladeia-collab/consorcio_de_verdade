/**
 * Módulo 5 — Histórico de Correções
 * Lógica extraída fielmente de runCorrections() do HTML original.
 * Fonte: Raio-xdoConsórcioSITE_.renatto.html, linhas 533-553
 */

import { buildSchedule } from './raiox';

export interface HistoricoCorrecoesInput {
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  insuranceRate: number;
  adjRate: number;
  adjEvery: number;
  mode: 'linear' | 'nonlinear';
  ranges?: string;
}

export interface HistoricoCorrecoesKpis {
  creditInicial: number;
  creditFinal: number;
  correcaoAcumulada: number;
  totalPago: number;
}

export interface HistoricoCorrecoesYearRow {
  year: string;
  creditEndOfYear: string;
  balanceEndOfYear: string;
  correctionInYear: string;
  correctionAccum: string;
  paidInYear: string;
  avgInstallment: string;
  events: string;  // ex: "2 reajuste(s)" ou ""
}

export interface HistoricoCorrecoesResult {
  kpis: HistoricoCorrecoesKpis;
  yearlyTable: HistoricoCorrecoesYearRow[];
  warnings: string[];
  simulationId: string;
  generatedAt: string;
}

function moneyStr(v: number): string {
  return (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function generateSimulationId(input: HistoricoCorrecoesInput, creditFinal: number): string {
  const raw = JSON.stringify(input) + creditFinal.toFixed(2);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0').slice(0, 12);
}

export function runCorrections(input: HistoricoCorrecoesInput): HistoricoCorrecoesResult {
  const s = buildSchedule({
    credit: input.credit,
    term: input.term,
    adminRate: input.adminRate,
    reserveRate: input.reserveRate,
    insuranceRate: input.insuranceRate,
    adjRate: input.adjRate,
    adjEvery: input.adjEvery,
    mode: input.mode,
    ranges: input.ranges,
  });

  // Fiel ao HTML: linhas 535-544
  const yearly: HistoricoCorrecoesYearRow[] = [];
  let correctionAccumYearly = 0;

  for (let y = 1; y <= Math.ceil(s.term / 12); y++) {
    const ys = s.rows.filter(r => Math.ceil(r.month / 12) === y);
    if (!ys.length) continue;

    const paid = ys.reduce((a, r) => a + r.installment, 0);
    const annualCorrection = ys.reduce((a, r) => a + (r.correctionDelta || 0), 0);
    correctionAccumYearly += annualCorrection;
    const corrections = ys.filter(r => r.tags.includes('Reajuste')).length;
    const lastRow = ys[ys.length - 1];

    yearly.push({
      year: `Ano ${y}`,
      creditEndOfYear: moneyStr(lastRow.credit),
      balanceEndOfYear: moneyStr(lastRow.balance),
      correctionInYear: moneyStr(annualCorrection),
      correctionAccum: moneyStr(correctionAccumYearly),
      paidInYear: moneyStr(paid),
      avgInstallment: moneyStr(paid / ys.length),
      events: corrections ? `${corrections} reajuste(s)` : '',
    });
  }

  // KPIs — fiel ao HTML linhas 546-550
  const kpis: HistoricoCorrecoesKpis = {
    creditInicial: s.credit,
    creditFinal: s.finalCredit,
    correcaoAcumulada: s.finalCredit - s.credit,
    totalPago: s.paidTotal,
  };

  const simulationId = generateSimulationId(input, s.finalCredit);
  const generatedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return {
    kpis,
    yearlyTable: yearly,
    warnings: s.warnings,
    simulationId,
    generatedAt,
  };
}
