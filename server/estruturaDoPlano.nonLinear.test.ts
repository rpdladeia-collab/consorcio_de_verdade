import { describe, expect, it } from "vitest";
import { simulateEstruturaDoPlano } from "./lib/estruturaDoPlano";
import { estruturaDoPlanoRouter } from "./routers/estruturaDoPlano";
import { parsePaymentRanges, parseRangeValue } from "../client/src/lib/estruturaDoPlanoForm";
import { buildLancePresentation, buildPdfEstruturaDaLance } from "../client/src/lib/estruturaDoPlanoLance";
import { comparisonScenarios, independentRebasedSchedule, independentSchedule, realPlanOptions, referenceOptions } from "./test-fixtures/estruturaDoPlano";

const close = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThan(0.00001);
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

// Não usa contexto autenticado, banco, rede, cookies ou credenciais de produção.
const caller = estruturaDoPlanoRouter.createCaller({ user: null } as any);

describe("Faixas — conversão somente na submissão", () => {
  it.each([
    ["300,00", 300], ["R$ 300,00", 300], ["1.500,00", 1500], ["R$ 1.500,00", 1500],
    ["3.194,44", 3194.44], ["300", 300], ["1500.00", 1500], ["3194.44", 3194.44],
    ["1.500", 1500], ["0", 0],
  ])("converte dinheiro %s em %s sem perda", (text, expected) => {
    expect(parseRangeValue(String(text), "value")).toBe(expected);
  });
  it.each([["50,5", 50.5], ["50.5", 50.5], ["50,5%", 50.5], ["100", 100], ["0", 0]])("converte percentual %s", (text, expected) => {
    expect(parseRangeValue(String(text), "percent")).toBe(expected);
  });
  it.each(["", "-1", "abc", "1,2,3", "1.50,00", "1e9", "Infinity"])("não transforma entrada inválida %s em zero", text => {
    expect(() => parseRangeValue(text, "value")).toThrow();
  });
  it("aceita espaços externos de colagem nos meses sem modificar o período", () => {
    expect(parsePaymentRanges([{ start: " 1", end: "12 ", type: "value", value: "300,00" }], 180))
      .toEqual([{ start: 1, end: 12, type: "value", value: 300 }]);
  });
  it("não inverte, arredonda nem amplia silenciosamente os períodos", () => {
    for (const [start, end] of [["", "12"], ["1.5", "12"], ["13", "12"], ["0", "12"], ["1", "181"]]) {
      expect(() => parsePaymentRanges([{ start, end, type: "value", value: "300,00" }], 180)).toThrow();
    }
  });
  it("no modo rebase exige faixas monetárias contíguas e sem sobreposição", () => {
    expect(parsePaymentRanges([
      { start: "1", end: "10", type: "value", value: "3.430,78" },
      { start: "11", end: "160", type: "value", value: "2.577,34" },
    ], 160, "balanceRebase")).toHaveLength(2);
    expect(() => parsePaymentRanges([{ start: "1", end: "10", type: "value", value: "3.430,78" }], 160, "balanceRebase")).toThrow(/falta definir/);
    expect(() => parsePaymentRanges([
      { start: "1", end: "20", type: "value", value: "3.430,78" },
      { start: "10", end: "160", type: "value", value: "2.577,34" },
    ], 160, "balanceRebase")).toThrow(/sobrepor/);
  });
});

describe("Etapa 4 — quatro cronogramas completos e indicadores das seis abas", () => {
  for (const scenario of comparisonScenarios) {
    it(`${scenario.id}: confere 180 linhas com oráculo independente`, () => {
      const result = simulateEstruturaDoPlano(scenario.options);
      const independent = independentSchedule(scenario.options);
      expect(result.rows).toHaveLength(180);
      result.rows.forEach((row, i) => {
        for (const [key, expected] of Object.entries(independent[i])) close((row as any)[key], expected);
        close(row.payment, row.fc + row.ta + row.fr + row.insurance);
        close(row.saldoFinal, row.saldoInicial - row.fc - row.ta - row.fr);
        close(row.saldoInicial, row.saldoAntes + row.reajuste);
        expect(row.saldoFinal).toBeGreaterThanOrEqual(0);
      });
      expect(result.rows.filter(r => r.tags.includes("CORREÇÃO")).map(r => r.month)).toEqual(Array.from({ length: 14 }, (_, i) => 13 + 12 * i));
      close(result.last.credit, 300000 * 1.07 ** 14);
      close(result.last.saldoFinal, 0);
      close(result.sums.payment, sum(independent.map(r => r.payment)));
      close(result.costs.custoOperacional, sum(independent.map(r => r.ta + r.fr + r.insurance)));
      close(result.costs.contractualAdmin + result.costs.correcaoAdm, result.sums.ta);
      close(result.costs.totalPaidNominal, result.sums.payment);
      close(sum(result.yearlyCorrections.map(y => y.paidYear)), result.sums.payment);
      close(sum(result.yearlyCorrections.map(y => y.corrSaldo)), result.sums.reajuste);
      close(result.yearlyCorrections.at(-1)!.cartaFim, result.last.credit);
      close(result.yearlyCorrections.at(-1)!.saldoFim, result.last.saldoFinal);
      for (const [rate, investment] of [[0.515, result.investments.savings], [0.795, result.investments.cdb]] as const) {
        let balance = 0;
        independent.forEach(row => { balance = (balance + row.payment) * (1 + rate / 100); });
        close(investment.net, balance);
        close(investment.principal, result.sums.payment);
        expect(investment.tax).toBe(0);
        investment.details.forEach((row, i) => close(row.aporte, independent[i].payment));
      }
      close(result.investments.auditRows.at(-1)!.saldoInvestimento, result.investments.cdb.net);
      close(result.investments.finalCredit, result.last.credit);
      expect(result.contemplation).toBeUndefined();
      expect(result.eficienciaTaxa!.nominal).toBe(25);
      expect(result.eficienciaTaxa!.onNew).toBe(25);
    });
    it(`${scenario.id}: lance e eficiência usam as mesmas faixas calculadas; PDF usa snapshot`, async () => {
      const options = { ...scenario.options, lanceProprio: 45000, lanceFgts: 15000, lanceEmbutido: 30000, parcelasPagas: 24, baseDoLance: "categoria" as const, estrategiaPos: "abater_parcela" as const };
      const { result, simulationId, generatedAt, parameters } = await caller.simulate(options);
      expect(parameters.paymentRanges).toEqual(options.paymentRanges);
      const contemplation = result.contemplation!;
      expect(contemplation.contract.paymentRanges).toEqual(options.paymentRanges);
      for (let i = 0; i < 24; i++) {
        close(contemplation.rows[i].payment, result.rows[i].payment);
        close(contemplation.rows[i].saldoAfterPayment, result.rows[i].saldoFinal);
      }
      close(contemplation.event.balanceAfter, result.rows[23].saldoFinal - contemplation.event.total);
      close(contemplation.event.base, result.rows[23].credit * 1.25);
      close(contemplation.finalBalance, 0);
      const view = buildLancePresentation(result);
      close(view.forcaPct, 90000 / (result.rows[23].credit * 1.25) * 100);
      close(result.eficienciaTaxa!.paidAmount, result.rows.slice(0, 24).reduce((total, row) => total + row.payment, 0));
      close(result.eficienciaTaxa!.newMoney, Math.max(0, 300000 - 90000 - result.eficienciaTaxa!.paidAmount));
      const degradationAt25 = result.eficienciaTaxa!.degradacao!.rows.find(row => row.parcela === 25)!;
      close(degradationAt25.desembolsoAcumulado, 60000 + result.rows.slice(0, 25).reduce((total, row) => total + row.payment, 0));
      const pdf = buildPdfEstruturaDaLance(result, { simulationId, generatedAt });
      expect(pdf.paymentRanges).toEqual(options.paymentRanges);
      expect(pdf.insuranceRate).toBe(0.038);
      expect(pdf.firstAdjustmentMonth).toBe(13);
      expect(pdf.rows).toHaveLength(contemplation.rows.length);
      close(pdf.forcaPct, view.forcaPct);
      close(pdf.cartaAtualizada, result.rows[23].credit);
      close(pdf.cartaLiquida, contemplation.event.creditAvailable);
      close(pdf.parcelaAntes, contemplation.rows[22].payment);
      expect(pdf.diagnosticoTexto).toBe(view.diagnosticoTexto);
      pdf.rows.forEach((row, i) => { close(row.payment, contemplation.rows[i].payment); close(row.balance, contemplation.rows[i].saldoFinal); });
    });
  }
});

describe("Política existente preservada e intervalos validados", () => {
  it("valor total de R$ 300 preserva seguro e rateia componentes", () => {
    const r = simulateEstruturaDoPlano(comparisonScenarios[1].options).first;
    close(r.payment, 300); close(r.insurance, 142.5);
    close(r.fc, 126); close(r.ta, 31.5); close(r.fr, 0);
  });
  it("percentual reduz componentes, não o seguro", () => {
    const r = simulateEstruturaDoPlano(comparisonScenarios[3].options).first;
    close(r.payment, 375000 / 180 * 0.5 + 142.5);
  });
  it("lacunas retomam saldo corrigido / prazo restante, inclusive ao terminar a faixa", () => {
    const result = simulateEstruturaDoPlano(comparisonScenarios[1].options);
    const row = result.rows[12];
    close(row.payment, row.saldoInicial / 168 + row.insurance);
    expect(result.warnings.some(w => w.includes("168 mês(es) sem faixa"))).toBe(true);
  });
  it("sobreposição mantém primeira faixa e a sinaliza", () => {
    const result = simulateEstruturaDoPlano({ ...referenceOptions, paymentPolicyMode: "ranges", paymentRanges: [
      { start: 1, end: 12, type: "value", value: 300 }, { start: 6, end: 18, type: "value", value: 1500 },
    ] });
    close(result.rows[5].payment, 300);
    expect(result.warnings.some(w => w.includes("7 mês(es)") && w.includes("primeira"))).toBe(true);
  });
  it("valor ou percentual acima da cheia são limitados, sem antecipação nova", () => {
    for (const range of [{ start: 1, end: 12, type: "value" as const, value: 3194.44 }, { start: 1, end: 12, type: "percent" as const, value: 150 }]) {
      const result = simulateEstruturaDoPlano({ ...referenceOptions, paymentPolicyMode: "ranges", paymentRanges: [range] });
      close(result.first.payment, simulateEstruturaDoPlano(referenceOptions).first.payment);
      expect(result.warnings.some(w => w.includes("sem antecipar"))).toBe(true);
    }
  });
  it("faixa abaixo do seguro não inventa subsídio e mostra aviso", () => {
    const result = simulateEstruturaDoPlano({ ...referenceOptions, paymentPolicyMode: "ranges", paymentRanges: [{ start: 1, end: 1, type: "value", value: 100 }] });
    close(result.first.payment, 142.5); close(result.first.fc, 0);
    expect(result.warnings.some(w => w.includes("menor que o seguro"))).toBe(true);
  });
  it("residual não é apagado nem convertido em quitação/alongamento automático", () => {
    const result = simulateEstruturaDoPlano({ ...referenceOptions, paymentPolicyMode: "ranges", paymentRanges: [{ start: 1, end: 180, type: "percent", value: 50 }] });
    expect(result.last.saldoFinal).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(180);
    expect(result.warnings.some(w => w.startsWith("Saldo residual"))).toBe(true);
  });
  it("inclui fundo de reserva no rateio sem modificar o seguro", () => {
    const options = { ...comparisonScenarios[1].options, reserveRate: 2 };
    const result = simulateEstruturaDoPlano(options);
    independentSchedule(options).forEach((row, i) => { close(result.rows[i].fr, row.fr); close(result.rows[i].payment, row.payment); });
  });
  it.each([[13, 12], [1, 181], [0, 12], [1.5, 12]])("API e motor rejeitam período %s–%s", async (start, end) => {
    const options = { ...referenceOptions, paymentPolicyMode: "ranges" as const, paymentRanges: [{ start, end, type: "value" as const, value: 300 }] };
    expect(() => simulateEstruturaDoPlano(options)).toThrow();
    await expect(caller.simulate(options)).rejects.toThrow();
  });
  it("base categoria selecionada não inclui reserva nem carta inicial no evento corrigido", () => {
    const result = simulateEstruturaDoPlano({ ...referenceOptions, reserveRate: 2, lanceProprio: 45000, baseDoLance: "categoria", parcelasPagas: 24 });
    const c = result.contemplation!;
    close(c.event.base, c.rows[23].credit * 1.25);
    close(buildLancePresentation(result).forcaPct, c.event.total / c.event.base * 100);
  });
  it("mês 0 mantém convenção existente de evento no mês 1 e PDF registra mês real", () => {
    const result = simulateEstruturaDoPlano({ ...referenceOptions, lanceProprio: 45000, parcelasPagas: 0 });
    expect(result.contemplation!.eventMonth).toBe(1);
    expect(buildPdfEstruturaDaLance(result, { simulationId: "TEST", generatedAt: "2026-10-15T03:00:00Z" }).paidMonths).toBe(1);
  });
  it("redução de prazo mantém a parcela de componentes do evento conforme motor original", () => {
    const result = simulateEstruturaDoPlano({ ...comparisonScenarios[1].options, lanceProprio: 45000, parcelasPagas: 24, estrategiaPos: "reduzir_prazo" });
    const c = result.contemplation!;
    expect(c.newTerm).toBeLessThan(180);
    close(c.finalBalance, 0);
    for (let i = 0; i < 24; i++) close(c.rows[i].payment, result.rows[i].payment);
  });
});

describe("Plano real de 160 meses — saldo corrigido e perfil não linear", () => {
  const indices = [1, 10, 11, 12, 13, 14, 24, 25, 159, 160];

  it("reproduz 12 pagamentos nominais, reajusta 13 vezes pelo saldo e quita na parcela 160", () => {
    const result = simulateEstruturaDoPlano(realPlanOptions);
    const independent = independentRebasedSchedule(realPlanOptions);
    expect(result.rows).toHaveLength(160);
    result.rows.forEach((row, i) => {
      const expected = independent.rows[i];
      for (const key of ["payment", "saldoAntes", "reajuste", "saldoInicial", "fc", "ta", "insurance", "paymentScale", "saldoFinal"] as const) {
        close(row[key], expected[key]);
      }
      close(row.payment, row.fc + row.ta + row.fr + row.insurance);
      close(row.saldoFinal, row.saldoInicial - row.fc - row.ta - row.fr);
      expect(row.saldoFinal).toBeGreaterThanOrEqual(0);
    });

    result.rows.slice(0, 10).forEach(row => close(row.payment, 3430.78));
    close(result.rows[10].payment, 2577.34);
    close(result.rows[11].payment, 2577.34);
    expect(result.rows.filter(row => row.tags.includes("CORREÇÃO")).map(row => row.month))
      .toEqual(Array.from({ length: 13 }, (_, i) => 13 + 12 * i));
    for (const month of [13, 25, 37, 49, 61, 73, 85, 97, 109, 121, 133, 145, 157]) {
      const row = result.rows[month - 1];
      close(row.saldoInicial, row.saldoAntes * 1.07);
      expect(row.paymentScale).toBeGreaterThan(month === 13 ? 1 : result.rows[month - 13].paymentScale);
    }
    for (let month = 13; month <= 24; month++) close(result.rows[month - 1].paymentScale, result.rows[12].paymentScale);
    for (let month = 25; month <= 36; month++) close(result.rows[month - 1].paymentScale, result.rows[24].paymentScale);
    close(result.last.saldoFinal, 0);
    close(result.last.fc + result.last.ta, result.last.saldoInicial);
    expect(result.warnings.some(warning => warning.includes("recalibradas pelo saldo amortizável restante"))).toBe(true);
    expect(result.warnings.some(warning => warning.startsWith("Saldo residual"))).toBe(false);
    expect(indices.map(month => result.rows[month - 1].month)).toEqual(indices);
  });

  it("reconcilia custos, correções, investimentos, eficiência e API às mesmas 160 linhas", async () => {
    const result = simulateEstruturaDoPlano(realPlanOptions);
    const api = await caller.simulate(realPlanOptions);
    expect(api.parameters.paymentAdjustmentMode).toBe("balanceRebase");
    expect(api.result.rows).toHaveLength(160);
    close(api.result.sums.payment, result.sums.payment);
    close(api.result.last.saldoFinal, result.last.saldoFinal);
    close(result.sums.fc, result.rows.reduce((sum, row) => sum + row.fc, 0));
    close(result.sums.ta, result.rows.reduce((sum, row) => sum + row.ta, 0));
    close(result.sums.insurance, result.rows.reduce((sum, row) => sum + row.insurance, 0));
    close(result.costs.totalPaidNominal, result.rows.reduce((sum, row) => sum + row.payment, 0));
    close(result.costs.custoOperacional, result.sums.ta + result.sums.fr + result.sums.insurance);
    close(sum(result.yearlyCorrections.map(row => row.paidYear)), result.sums.payment);
    close(sum(result.yearlyCorrections.map(row => row.corrSaldo)), result.sums.reajuste);
    close(result.investments.totalPaid, result.sums.payment);
    close(result.investments.savings.principal, result.sums.payment);
    close(result.investments.cdb.principal, result.sums.payment);
    result.investments.savings.details.forEach((row, i) => close(row.aporte, result.rows[i].payment));
    result.investments.cdb.details.forEach((row, i) => close(row.aporte, result.rows[i].payment));
    expect(result.contemplation).toBeUndefined(); // nenhum lance ou mês de contemplação foi informado
    close(result.eficienciaTaxa!.paidAmount, 0); // nenhuma parcela já paga foi informada
    expect(result.paymentAdjustmentMode).toBe("balanceRebase");
  });

  it("a projeção de lance reutiliza o mesmo cronograma até a assembleia de teste", () => {
    const withTestBid = { ...realPlanOptions, lanceProprio: 1, parcelasPagas: 24 };
    const result = simulateEstruturaDoPlano(withTestBid);
    const contemplation = result.contemplation!;
    for (let i = 0; i < 24; i++) {
      close(contemplation.rows[i].payment, result.rows[i].payment);
      close(contemplation.rows[i].saldoAfterPayment, result.rows[i].saldoFinal);
    }
    close(result.eficienciaTaxa!.paidAmount, result.rows.slice(0, 24).reduce((sum, row) => sum + row.payment, 0));
    expect(buildPdfEstruturaDaLance(result, { simulationId: "TEST-REAL", generatedAt: "2026-10-15T03:00:00.000Z" }).paymentAdjustmentMode).toBe("balanceRebase");
  });

  it("a API rejeita modo rebase sem perfil completo de valores fixos", async () => {
    await expect(caller.simulate({ ...realPlanOptions, paymentRanges: [{ start: 1, end: 10, type: "value", value: 3430.78 }] })).rejects.toThrow();
    await expect(caller.simulate({ ...realPlanOptions, paymentRanges: [{ start: 1, end: 160, type: "percent", value: 100 }] })).rejects.toThrow();
    await expect(caller.simulate({ ...realPlanOptions, paymentAdjustmentMode: "balanceRebase", paymentPolicyMode: "standard", paymentRanges: [] })).rejects.toThrow();
  });

  it("cenário 142 meses: a primeira faixa de R$ 3.240,00 chega intacta à API e à parcela inicial", async () => {
    const paymentRanges = parsePaymentRanges([
      { start: "1", end: "11", type: "value", value: "R$ 3.240,00" },
      // Faixa restante apenas completa o perfil obrigatório; o prompt não define esse valor.
      { start: "12", end: "142", type: "value", value: "2.945,15" },
    ], 142, "balanceRebase");
    const options = {
      ...referenceOptions, credit: 320_000, term: 142, adminRate: 24, reserveRate: 0,
      insuranceRate: 0.038, adjustmentRate: 7, adjustmentPeriod: 12,
      firstAdjustmentMonth: 13, paymentPolicyMode: "ranges" as const,
      paymentAdjustmentMode: "balanceRebase" as const, paymentRanges,
    };
    const api = await caller.simulate(options);

    expect(api.parameters.paymentAdjustmentMode).toBe("balanceRebase");
    expect(api.parameters.paymentRanges[0]).toEqual({ start: 1, end: 11, type: "value", value: 3240 });
    close(api.result.first.payment, 3240);
    close(api.result.rows[0].payment, 3240);
    close(api.result.rows[10].payment, 3240);
    const month13 = api.result.rows[12];
    expect(month13.tags).toContain("CORREÇÃO");
    close(month13.saldoInicial, month13.saldoAntes * 1.07);
    expect(month13.paymentScale).toBeGreaterThan(1);
    close(api.result.rows[13].paymentScale, month13.paymentScale);
    const month25 = api.result.rows[24];
    expect(month25.tags).toContain("CORREÇÃO");
    close(month25.saldoInicial, month25.saldoAntes * 1.07);
    expect(month25.paymentScale).toBeGreaterThan(month13.paymentScale);
  });
});
