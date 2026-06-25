/**
 * Testes Vitest — Módulos 3, 4, 5 e 6
 * Cenários padrão baseados nos defaults do HTML original.
 */

import { describe, it, expect } from 'vitest';
import { runOperationCost } from './lib/custoOperacao';
import { runEfficiency } from './lib/proporcaoTaxa';
import { runCorrections } from './lib/historicoCorrecoes';
import { runAutoPayable } from './lib/autoPagavel';

// ─── Parâmetros padrão compartilhados ───────────────────────────────────────
const BASE = {
  credit: 300_000,
  term: 120,
  adminRate: 16,
  reserveRate: 2,
  insuranceRate: 0,
  adjRate: 5,
  adjEvery: 12,
  mode: 'linear' as const,
  ranges: '',
};

// ─── Módulo 3 — Custo da Operação ───────────────────────────────────────────
describe('Módulo 3 — Custo da Operação', () => {
  const result = runOperationCost(BASE);

  it('retorna resultado sem erros', () => {
    expect(result).toBeDefined();
  });

  it('taxa adm. contratual = 16% de 300.000 = 48.000', () => {
    expect(result.kpis.contractualAdmin).toBeCloseTo(48_000, 0);
  });

  it('custo explícito = adm. projetada + seguro projetado', () => {
    const expected = Math.max(0, result.kpis.contractualAdmin + result.kpis.adminCorrection)
      + Math.max(0, result.kpis.projectedInsurance);
    expect(result.kpis.explicitCost).toBeCloseTo(expected, 1);
  });

  it('tabela de classificação tem 7 linhas', () => {
    expect(result.classificationTable).toHaveLength(7);
  });

  it('tabela de fluxo tem 120 linhas (prazo = 120)', () => {
    expect(result.rows).toHaveLength(120);
  });

  it('readboxes tem 4 blocos de texto', () => {
    expect(result.readboxes).toHaveLength(4);
  });

  it('simulationId é string não vazia', () => {
    expect(typeof result.simulationId).toBe('string');
    expect(result.simulationId.length).toBeGreaterThan(0);
  });
});

// ─── Módulo 4 — Proporção da Taxa ───────────────────────────────────────────
describe('Módulo 4 — Proporção da Taxa', () => {
  const input = {
    credit: 300_000,
    adminPct: 16,
    paid: 30_000,
    own: 60_000,
    fgts: 0,
    embedded: 60_000,
    basis: 'newMoney' as const,
  };
  const result = runEfficiency(input);

  it('retorna resultado sem erros', () => {
    expect(result).toBeDefined();
  });

  it('taxa nominal = 16%', () => {
    expect(result.kpis.nominal).toBeCloseTo(16, 1);
  });

  it('carta líquida = 300.000 - 60.000 = 240.000', () => {
    expect(result.liquidCredit).toBeCloseTo(240_000, 0);
  });

  it('dinheiro novo = 300.000 - 60.000 - 60.000 - 0 - 30.000 = 150.000', () => {
    expect(result.newMoney).toBeCloseTo(150_000, 0);
  });

  it('taxa sobre dinheiro novo > taxa nominal (penalidade positiva)', () => {
    expect(result.kpis.onNew).toBeGreaterThan(result.kpis.nominal);
  });

  it('tabela tem 7 linhas', () => {
    expect(result.table).toHaveLength(7);
  });

  it('readboxes tem 2 blocos de texto', () => {
    expect(result.readboxes).toHaveLength(2);
  });

  it('meter tem widthPct entre 0 e 100', () => {
    expect(result.meter.widthPct).toBeGreaterThanOrEqual(0);
    expect(result.meter.widthPct).toBeLessThanOrEqual(100);
  });
});

// ─── Módulo 5 — Histórico de Correções ──────────────────────────────────────
describe('Módulo 5 — Histórico de Correções', () => {
  const result = runCorrections(BASE);

  it('retorna resultado sem erros', () => {
    expect(result).toBeDefined();
  });

  it('carta inicial = 300.000', () => {
    expect(result.kpis.creditInicial).toBeCloseTo(300_000, 0);
  });

  it('carta final > carta inicial (com reajuste de 5%)', () => {
    expect(result.kpis.creditFinal).toBeGreaterThan(result.kpis.creditInicial);
  });

  it('carta final ≈ 465.398,46 (9 reajustes de 5% em 120 meses)', () => {
    expect(result.kpis.creditFinal).toBeCloseTo(465_398.46, 0);
  });

  it('tabela anual tem 10 linhas (120 meses / 12)', () => {
    expect(result.yearlyTable).toHaveLength(10);
  });

  it('primeiro ano tem carta inicial = 300.000', () => {
    // Ano 1: sem reajuste ainda (primeiro reajuste no mês 13)
    expect(parseFloat(result.yearlyTable[0].creditEndOfYear.replace(/[R$\s.]/g, '').replace(',', '.'))).toBeCloseTo(300_000, 0);
  });

  it('simulationId é string não vazia', () => {
    expect(typeof result.simulationId).toBe('string');
    expect(result.simulationId.length).toBeGreaterThan(0);
  });
});

// ─── Módulo 6 — Auto Pagável? ────────────────────────────────────────────────
describe('Módulo 6 — Auto Pagável?', () => {
  const input = {
    credit: 300_000,
    term: 120,
    adminRate: 16,
    reserveRate: 2,
    appreciation: 5,
    annualReturn: 10,
    initial: 80_000,
    budget: 3_500,
    contMonth: 18,
    own: 60_000,
    embedded: 60_000,
    rent: 2_200,
    mode: 'linear' as const,
    ranges: '',
  };
  const result = runAutoPayable(input);

  it('retorna resultado sem erros', () => {
    expect(result).toBeDefined();
  });

  it('tabela tem 120 linhas (prazo = 120)', () => {
    expect(result.table).toHaveLength(120);
  });

  it('readboxes tem 4 blocos de texto', () => {
    expect(result.readboxes).toHaveLength(4);
  });

  it('cobertura da parcela é número finito entre 0 e 500', () => {
    expect(result.kpis.coverage).toBeGreaterThanOrEqual(0);
    expect(result.kpis.coverage).toBeLessThan(500);
  });

  it('patrimônio final investimento é positivo', () => {
    expect(result.kpis.finalInv).toBeGreaterThan(0);
  });

  it('simulationId é string não vazia', () => {
    expect(typeof result.simulationId).toBe('string');
    expect(result.simulationId.length).toBeGreaterThan(0);
  });
});
