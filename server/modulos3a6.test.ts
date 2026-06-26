/**
 * Testes Vitest — Módulos 3, 4, 5 e 6
 * Cenários padrão baseados nos defaults do HTML original.
 */

import { describe, it, expect } from 'vitest';
import { runOperationCost } from './lib/custoOperacao';
import { runEfficiency, calcDegradacaoProgressiva } from './lib/proporcaoTaxa';
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

// ─── Módulo 4 — Degradação Progressiva ────────────────────────────────────────
describe('Módulo 4 — Degradação Progressiva de Eficiência', () => {
  /**
   * Cenário golden (conforme especificação exata do anexo):
   *   Carta = 300.000 | Taxa adm. = 16% | Lance próprio = 60.000
   *   FGTS = 0 | Embutido = 60.000 | Total parcelas = 120
   *   Admin total = 48.000 | Valor parcela = 48.000 / 120 = 400
   *
   * Parcela 0 (tabela obrigatória do anexo):
   *   Desembolso = R$ 0,00
   *   Dinheiro novo = 300.000 (carta cheia)
   *   Taxa efetiva = (16 * 300.000) / 300.000 = 16,00%
   *   Eficiência = (16 / 16) * 100 = 100,00%
   *   Degradação = 0,00%
   *
   * Parcela 120:
   *   Desembolso = 60.000 + 0 + (400 * 120) = 108.000
   *   Dinheiro novo = 300.000 - 60.000 - (400*120) - 60.000 - 0 = 132.000
   *   Taxa efetiva = (16 * 300.000) / 132.000 = 36,364%
   *   Eficiência = (16 / 36,364) * 100 = 44,00%
   *   Degradação = 100,00 - 44,00 = 56,00%
   */
  const deg = calcDegradacaoProgressiva(300_000, 16, 60_000, 0, 60_000, 120);

  it('retorna resultado sem erros', () => {
    expect(deg).toBeDefined();
    expect(deg.rows.length).toBeGreaterThan(0);
  });

  it('primeira linha é a parcela 0', () => {
    expect(deg.rows[0].parcela).toBe(0);
  });

  it('última linha é a parcela 120', () => {
    expect(deg.rows[deg.rows.length - 1].parcela).toBe(120);
  });

  it('eficiência inicial = 100,00% (parcela 0 — tabela obrigatória do anexo)', () => {
    expect(deg.eficienciaInicial).toBeCloseTo(100.0, 1);
  });

  it('eficiência final ≈ 44,00% (parcela 120)', () => {
    expect(deg.eficienciaFinal).toBeCloseTo(44.0, 1);
  });

  it('perda total ≈ 56,00% (100 - 44)', () => {
    expect(deg.perdaTotal).toBeCloseTo(56.0, 1);
  });

  it('dinheiro novo na parcela 0 = 300.000 (carta cheia, desembolso R$0)', () => {
    expect(deg.rows[0].dinheiroNovo).toBeCloseTo(300_000, 0);
  });

  it('dinheiro novo na parcela 120 ≈ 132.000', () => {
    expect(deg.rows[deg.rows.length - 1].dinheiroNovo).toBeCloseTo(132_000, 0);
  });

  it('taxa efetiva na parcela 0 = 16,00% (igual à nominal — eficiência 100%)', () => {
    expect(deg.rows[0].taxaEfetiva).toBeCloseTo(16.0, 2);
  });

  it('taxa efetiva na parcela 120 ≈ 36,36%', () => {
    expect(deg.rows[deg.rows.length - 1].taxaEfetiva).toBeCloseTo(36.364, 2);
  });

  it('degradação na parcela 0 = 0', () => {
    expect(deg.rows[0].degradacao).toBeCloseTo(0, 2);
  });

  it('desembolso na parcela 0 = R$ 0,00 (conforme tabela obrigatória do anexo)', () => {
    expect(deg.rows[0].desembolsoAcumulado).toBeCloseTo(0, 0);
  });

  it('alerta nivel é critico (perda > 35%)', () => {
    expect(deg.alerta.nivel).toBe('critico');
  });

  it('valor da parcela ≈ 400 (48.000 / 120)', () => {
    expect(deg.valorParcela).toBeCloseTo(400, 0);
  });

  it('impactoReais é número positivo', () => {
    expect(deg.impactoReais).toBeGreaterThan(0);
  });

  it('runEfficiency com totalParcelas retorna campo degradacao', () => {
    const r = runEfficiency({
      credit: 300_000, adminPct: 16, paid: 30_000,
      own: 60_000, fgts: 0, embedded: 60_000,
      basis: 'newMoney' as const, totalParcelas: 120,
    });
    expect(r.degradacao).toBeDefined();
    expect(r.degradacao!.rows.length).toBeGreaterThan(0);
  });

  it('runEfficiency sem totalParcelas não retorna degradacao', () => {
    const r = runEfficiency({
      credit: 300_000, adminPct: 16, paid: 30_000,
      own: 60_000, fgts: 0, embedded: 60_000,
      basis: 'newMoney' as const,
    });
    expect(r.degradacao).toBeUndefined();
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
