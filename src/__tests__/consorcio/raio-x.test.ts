import { buildSchedule } from '@/lib/consorcio/raio-x-logic';

describe('Raio-x Logic', () => {
  it('deve calcular corretamente um plano linear simples', () => {
    const opts = {
      credit: 100000,
      term: 10,
      adminRate: 10, // 10%
      reserveRate: 0,
      insuranceRate: 0,
      adjRate: 0,
      adjEvery: 0,
      mode: 'linear' as const
    };
    
    const result = buildSchedule(opts);
    
    // 100k + 10k (admin) = 110k total
    // 110k / 10 meses = 11k por mês
    expect(result.initialObligation).toBe(110000);
    expect(result.rows.length).toBe(10);
    expect(result.rows[0].installment).toBeCloseTo(11000);
    expect(result.paidTotal).toBeCloseTo(110000);
  });

  it('deve aplicar reajustes corretamente', () => {
    const opts = {
      credit: 100000,
      term: 12,
      adminRate: 0,
      reserveRate: 0,
      insuranceRate: 0,
      adjRate: 10, // 10% de reajuste
      adjEvery: 12,
      firstAdj: 12,
      mode: 'linear' as const
    };
    
    const result = buildSchedule(opts);
    // Mês 12 deve ter reajuste
    expect(result.rows[11].tags).toContain('Reajuste');
    expect(result.rows[11].credit).toBeCloseTo(110000);
  });
});
