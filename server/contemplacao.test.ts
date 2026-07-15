/**
 * Testes Vitest — Módulo 2: Contemplação
 * Cenário padrão aprovado pelo usuário:
 *   carta: 300.000 | prazo: 120 | adm: 16% | reserva: 2%
 *   parcelas pagas: 12 | lance próprio: 60.000 | FGTS: 0 | embutido: 60.000
 *   correção: 5% anual | base: carta
 *
 * Validações obrigatórias:
 *   - força de lance ≈ 40%
 *   - lance total = R$ 120.000
 *   - carta líquida = R$ 240.000
 *   - tabela de projeção retornando linhas
 *   - procedure tRPC funcionando (testada via runContemplation diretamente)
 */

import { describe, it, expect } from 'vitest';
import { runContemplation, buildContemplationProjection } from './lib/contemplacao';
import { buildSchedule } from './lib/raiox';

const CENARIO_PADRAO = {
  credit: 300_000,
  term: 120,
  adminRate: 16,
  reserveRate: 2,
  adjRate: 5,
  adjEvery: 12,
  mode: 'linear' as const,
  ranges: '',
  paidMonths: 12,
  base: 'credit' as const,
  own: 60_000,
  fgts: 0,
  embedded: 60_000,
};

describe('Módulo 2 — Contemplação (cenário padrão)', () => {
  const result = runContemplation(CENARIO_PADRAO);

  it('força de lance deve ser aproximadamente 40%', () => {
    // base = carta = 300.000 (no mês 12, após 1 reajuste de 5% no mês 13 — ainda sem reajuste)
    // totalLance = 60.000 + 0 + 60.000 = 120.000
    // forcePct = 120.000 / 300.000 * 100 = 40%
    expect(result.forcePct).toBeCloseTo(40, 0);
  });

  it('lance total deve ser R$ 120.000', () => {
    expect(result.totalLance).toBeCloseTo(120_000, 0);
  });

  it('carta líquida deve ser R$ 240.000', () => {
    // creditLiquid = credit - embedded = 300.000 - 60.000 = 240.000
    // (no mês 12, ainda sem reajuste — primeiro reajuste é no mês 13)
    expect(result.creditLiquid).toBeCloseTo(240_000, 0);
  });

  it('tabela de projeção deve retornar linhas', () => {
    expect(result.projection.rows.length).toBeGreaterThan(0);
  });

  it('tabela de projeção deve ter linha de "Lance aplicado" no mês 12', () => {
    const lanceRow = result.projection.rows.find((r) => r.event === 'Lance aplicado');
    expect(lanceRow).toBeDefined();
    expect(lanceRow?.month).toBe(12);
    expect(lanceRow?.lance).toBeCloseTo(result.applied, 0);
  });

  it('tabela de projeção deve ter parcelas projetadas após o lance', () => {
    const projectedRows = result.projection.rows.filter(
      (r) => r.event === 'Parcela projetada' || r.event === 'Reajuste / parcela projetada'
    );
    expect(projectedRows.length).toBeGreaterThan(0);
  });

  it('parcela pós-lance deve ser positiva', () => {
    expect(result.postLanceInstallment).toBeGreaterThan(0);
  });

  it('tabela de resumo deve ter 7 linhas', () => {
    expect(result.summaryRows.length).toBe(7);
  });

  it('warnings deve ser um array (pode ser vazio para cenário válido)', () => {
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

describe('Módulo 2 — Contemplação (base categoria)', () => {
  it('força de lance deve ser menor quando base é categoria (denominador maior)', () => {
    const resultCarta = runContemplation({ ...CENARIO_PADRAO, base: 'credit' });
    const resultCategoria = runContemplation({ ...CENARIO_PADRAO, base: 'category' });
    // base categoria = credit * (1 + adminRate/100) > credit → forcePct menor
    expect(resultCategoria.forcePct).toBeLessThan(resultCarta.forcePct);
  });
});

describe('Módulo 2 — Contemplação (warnings)', () => {
  it('deve gerar warning quando embutido > carta', () => {
    const result = runContemplation({
      ...CENARIO_PADRAO,
      embedded: 350_000, // maior que a carta de 300.000
    });
    const hasWarning = result.warnings.some((w) =>
      w.includes('Lance embutido maior que a carta')
    );
    expect(hasWarning).toBe(true);
  });

  it('deve gerar warning quando parcelas pagas excedem o prazo', () => {
    const result = runContemplation({
      ...CENARIO_PADRAO,
      paidMonths: 150, // maior que o prazo de 120
    });
    const hasWarning = result.warnings.some((w) =>
      w.includes('Parcelas pagas ajustadas para')
    );
    expect(hasWarning).toBe(true);
  });
});

describe('buildContemplationProjection (teste direto)', () => {
  it('deve retornar projeção com linhas históricas + lance + futuras', () => {
    const schedule = buildSchedule({
      credit: 300_000,
      term: 120,
      adminRate: 16,
      reserveRate: 2,
      insuranceRate: 0,
      adjRate: 5,
      adjEvery: 12,
      mode: 'linear',
      ranges: '',
    });

    const projection = buildContemplationProjection(schedule, 12, 60_000, {
      adjRate: 5,
      adjEvery: 12,
      firstAdj: 13,
      insuranceRate: 0,
    });

    // 12 linhas históricas + 1 linha de lance + (120 - 12) = 108 linhas projetadas = 121 total
    expect(projection.rows.length).toBe(121);

    // Linha de lance
    const lanceRow = projection.rows.find((r) => r.event === 'Lance aplicado');
    expect(lanceRow).toBeDefined();

    // saldo final deve ser próximo de zero (plano fecha)
    expect(projection.finalBalance).toBeCloseTo(0, 0);
  });
});
