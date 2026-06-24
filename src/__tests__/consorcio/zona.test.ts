import { avg, median, calculateHealth } from '@/lib/consorcio/zona-logic';

describe('Zona Logic', () => {
  const mockHistory = [
    { ass: 1, low: 10, mid: 20, high: 30 },
    { ass: 2, low: 15, mid: 25, high: 35 },
    { ass: 3, low: 20, mid: 30, high: 40 },
  ];

  it('deve calcular a média corretamente', () => {
    expect(avg(mockHistory, 'mid')).toBe(25);
  });

  it('deve calcular a mediana corretamente', () => {
    expect(median(mockHistory, 'mid')).toBe(25);
  });

  it('deve calcular a saúde do grupo corretamente', () => {
    const healthRows = [
      { ass: 36, sg: 200, p30: 20, p50: 10, clivre: 2, clim: 1, c30: 1, c50: 1, csort: 1, outras: 0 },
      { ass: 35, sg: 200, p30: 20, p50: 10, clivre: 2, clim: 1, c30: 1, c50: 1, csort: 1, outras: 0 }
    ];
    
    const result = calculateHealth(healthRows, 120);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.totalCont).toBe(12); // (2+1+1+1+1) * 2
      expect(result.avgCont).toBe(6);
      expect(result.needed).toBeCloseTo(200 / 6);
    }
  });
});
