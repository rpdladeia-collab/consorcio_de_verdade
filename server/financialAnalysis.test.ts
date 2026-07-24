import { describe, it, expect } from 'vitest';
import { buildSchedule } from './lib/raiox';
import { analyzeFinancials } from './lib/financialAnalysis';

describe('Financial Analysis', () => {
  it('should generate complete financial analysis', () => {
    const schedule = buildSchedule({
      credit: 300000,
      term: 120,
      adminRate: 16,
      reserveRate: 2,
      insuranceRate: 0,
      adjRate: 5,
      adjEvery: 12,
      mode: 'linear',
      ranges: '',
    });

    const analysis = analyzeFinancials(schedule, 12);

    // Verificar estrutura base
    expect(analysis).toBeDefined();
    expect(analysis.cardTags).toBeDefined();
    expect(analysis.executiveSummary).toBeDefined();
    expect(analysis.moneyDistribution).toBeDefined();
    expect(analysis.effectiveCost).toBeDefined();
    expect(analysis.moneyFlow).toBeDefined();
    expect(analysis.installmentEvolution).toBeDefined();
    expect(analysis.creditEvolution).toBeDefined();
    expect(analysis.adminEvolution).toBeDefined();
    expect(analysis.technicalIndicators).toBeDefined();
    expect(analysis.autoInterpretation).toBeDefined();

    // Verificar card tags
    expect(analysis.cardTags.firstInstallment).toBeTruthy();
    expect(analysis.cardTags.maxInstallment).toBeTruthy();
    expect(analysis.cardTags.totalPaid).toBeTruthy();
    expect(analysis.cardTags.finalCredit).toBeTruthy();

    // Verificar visão executiva
    expect(analysis.executiveSummary.credit).toBe(300000);
    expect(analysis.executiveSummary.term).toBe(120);
    expect(analysis.executiveSummary.adminRate).toBe(16);
    expect(['low', 'medium', 'high']).toContain(analysis.executiveSummary.riskLevel);

    // Verificar distribuição de dinheiro
    expect(analysis.moneyDistribution.creditInitial).toBe(300000);
    expect(analysis.moneyDistribution.creditFinal).toBeGreaterThan(300000);
    expect(analysis.moneyDistribution.creditGrowthPct).toBeGreaterThan(0);

    // Verificar custo efetivo
    expect(analysis.effectiveCost.explicit).toBeGreaterThan(0);
    expect(analysis.effectiveCost.pctOfInitial).toBeGreaterThan(0);
    expect(analysis.effectiveCost.interpretation).toBeTruthy();

    // Verificar fluxo de dinheiro
    expect(analysis.moneyFlow.amortizationPct).toBeGreaterThan(0);
    expect(analysis.moneyFlow.adminPct).toBeGreaterThan(0);
    expect(analysis.moneyFlow.correctionPct).toBeGreaterThan(0);

    // Verificar evolução de parcelas
    expect(analysis.installmentEvolution.first).toBeGreaterThan(0);
    expect(analysis.installmentEvolution.max).toBeGreaterThanOrEqual(analysis.installmentEvolution.first);
    expect(analysis.installmentEvolution.adjustmentCount).toBeGreaterThan(0);

    // Verificar evolução da carta
    expect(analysis.creditEvolution.initial).toBe(300000);
    expect(analysis.creditEvolution.final).toBeGreaterThan(300000);
    expect(analysis.creditEvolution.growthPct).toBeGreaterThan(0);

    // Verificar evolução da taxa
    expect(analysis.adminEvolution.contracted).toBe(16);
    expect(analysis.adminEvolution.effective).toBeGreaterThan(0);
    expect(analysis.adminEvolution.explanation).toBeTruthy();

    // Verificar indicadores técnicos
    expect(analysis.technicalIndicators.term).toContain('120');
    expect(analysis.technicalIndicators.correction).toBeTruthy();
    expect(analysis.technicalIndicators.insurance).toBeTruthy();
    expect(analysis.technicalIndicators.adminRate).toBe('16.0% — Moderada');
    expect(analysis.technicalIndicators.model).toBe('Anual');

    // Verificar interpretação automática
    expect(Array.isArray(analysis.autoInterpretation.positives)).toBe(true);
    expect(Array.isArray(analysis.autoInterpretation.attentions)).toBe(true);
    expect(Array.isArray(analysis.autoInterpretation.risks)).toBe(true);
    expect(Array.isArray(analysis.autoInterpretation.profile)).toBe(true);
  });

  it('should identify low risk scenario', () => {
    const schedule = buildSchedule({
      credit: 100000,
      term: 60,
      adminRate: 12,
      reserveRate: 1,
      insuranceRate: 0,
      adjRate: 3,
      adjEvery: 12,
      mode: 'linear',
      ranges: '',
    });

    const analysis = analyzeFinancials(schedule, 12);

    expect(analysis.executiveSummary.riskLevel).toBe('low');
  });

  it('should identify high risk scenario', () => {
    const schedule = buildSchedule({
      credit: 500000,
      term: 200,
      adminRate: 25,
      reserveRate: 3,
      insuranceRate: 0.5,
      adjRate: 8,
      adjEvery: 12,
      mode: 'linear',
      ranges: '',
    });

    const analysis = analyzeFinancials(schedule, 12);

    expect(analysis.executiveSummary.riskLevel).toBe('high');
  });

  it('should calculate percentages correctly', () => {
    const schedule = buildSchedule({
      credit: 300000,
      term: 120,
      adminRate: 16,
      reserveRate: 2,
      insuranceRate: 0,
      adjRate: 5,
      adjEvery: 12,
      mode: 'linear',
      ranges: '',
    });

    const analysis = analyzeFinancials(schedule, 12);

    // Verificar que cada percentual é positivo
    expect(analysis.moneyFlow.amortizationPct).toBeGreaterThan(0);
    expect(analysis.moneyFlow.adminPct).toBeGreaterThan(0);
    expect(analysis.moneyFlow.correctionPct).toBeGreaterThan(0);

    // Verificar que a soma é maior que 0
    const totalPct = 
      analysis.moneyFlow.amortizationPct + 
      analysis.moneyFlow.adminPct + 
      analysis.moneyFlow.insurancePct + 
      analysis.moneyFlow.correctionPct;

    expect(totalPct).toBeGreaterThan(0);
  });
});
