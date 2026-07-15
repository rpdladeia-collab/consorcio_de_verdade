import { describe, expect, it } from "vitest";
import { simulateEstruturaDoPlano, type EstruturaOptions } from "./lib/estruturaDoPlano";

const htmlDefaults: EstruturaOptions = {
  credit: 500_000,
  term: 180,
  adminRate: 15,
  reserveRate: 0,
  insuranceRate: 0,
  adjustmentRate: 5,
  adjustmentPeriod: 12,
  firstAdjustmentMonth: 13,
  paymentPolicyMode: "standard",
  paymentRanges: [],
  savingsRate: 0.515,
  cdbRate: 0.795,
};

describe("simulateEstruturaDoPlano", () => {
  it("reproduz os valores padrão do HTML original", () => {
    const result = simulateEstruturaDoPlano(htmlDefaults);

    expect(result.rows).toHaveLength(180);
    expect(result.first.payment).toBeCloseTo(3_194.44, 2);
    expect(result.maxPayment).toBeCloseTo(6_324.78, 2);
    expect(result.sums.payment).toBeCloseTo(827_178.27, 2);
    expect(result.last.credit).toBeCloseTo(989_965.80, 2);
    expect(result.costs.custoOperacional).toBeCloseTo(107_892.82, 2);

    expect(result.investments.savings.net).toBeCloseTo(1_290_104.28, 2);
    expect(result.investments.cdb.gross).toBeCloseTo(1_690_491.86, 2);
    expect(result.investments.cdb.tax).toBe(0);
    expect(result.investments.cdb.net).toBeCloseTo(1_690_491.86, 2);
    expect(result.investments.auditRows.at(-1)?.saldoInvestimento).toBeCloseTo(result.investments.cdb.net, 2);
  });

  it("trata a taxa de CDI informada como líquida sem aplicar IR novamente", () => {
    const result = simulateEstruturaDoPlano(htmlDefaults);

    expect(result.investments.cdb.tax).toBe(0);
    expect(result.investments.cdb.net).toBeCloseTo(result.investments.cdb.gross, 8);
    expect(result.investments.auditRows.at(-1)?.saldoInvestimento).toBeCloseTo(result.investments.cdb.net, 8);
  });

  it("não aplica reajustes quando a periodicidade é sem correção", () => {
    const result = simulateEstruturaDoPlano({
      ...htmlDefaults,
      credit: 300_000,
      adminRate: 25,
      insuranceRate: 0.038,
      adjustmentRate: 7,
      adjustmentPeriod: 0,
    });

    expect(result.rows).toHaveLength(180);
    expect(result.rows.every((row) => row.reajuste === 0)).toBe(true);
    expect(result.yearlyCorrections.every((year) => year.events === 0)).toBe(true);
    expect(result.first.payment).toBeCloseTo(2_225.83, 2);
    expect(result.maxPayment).toBeCloseTo(2_225.83, 2);
    expect(result.last.credit).toBeCloseTo(300_000, 2);
    expect(result.sums.payment).toBeCloseTo(387_896.25, 2);
  });

  it("inclui fundo de reserva no cálculo quando reserveRate > 0", () => {
    const result = simulateEstruturaDoPlano({
      ...htmlDefaults,
      reserveRate: 1,
    });

    // Fundo reserva deve aparecer em todos os meses
    expect(result.rows.every((row) => row.fr > 0)).toBe(true);

    // sums.fr deve ser positivo e refletir o total do fundo reserva
    expect(result.sums.fr).toBeGreaterThan(0);

    // custoOperacional deve incluir fundo reserva (taxa adm + fr + seguro)
    expect(result.costs.custoOperacional).toBeGreaterThan(result.costs.explicitCost);

    // fundoReservaProjetado deve ser igual a contractualReserve + reserveCorrection
    expect(result.costs.fundoReservaProjetado).toBeGreaterThan(result.costs.contractualReserve);

    // O custo total com fundo de reserva deve ser maior que sem fundo de reserva
    const semReserva = simulateEstruturaDoPlano(htmlDefaults);
    expect(result.costs.custoOperacional).toBeGreaterThan(semReserva.costs.custoOperacional);
  });
});


