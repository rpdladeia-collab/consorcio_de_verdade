import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { simulateEstruturaDoPlano } from "../server/lib/estruturaDoPlano";
import { independentRebasedSchedule, realPlanOptions } from "../server/test-fixtures/estruturaDoPlano";

const output = path.resolve(process.argv[2] || "/home/ubuntu/audit-cdv/etapa4/real-plan");
mkdirSync(output, { recursive: true });
const result = simulateEstruturaDoPlano(realPlanOptions);
const independent = independentRebasedSchedule(realPlanOptions);
const checkedFields = ["payment", "saldoAntes", "reajuste", "saldoInicial", "fc", "ta", "insurance", "paymentScale", "saldoFinal"] as const;
let maxDifference = 0;
for (let i = 0; i < result.rows.length; i++) {
  for (const key of checkedFields) {
    const difference = Math.abs(result.rows[i][key] - independent.rows[i][key]);
    assert.ok(difference < 1e-7, `Mês ${i + 1} ${key}: diferença ${difference}`);
    maxDifference = Math.max(maxDifference, difference);
  }
}
assert.equal(result.rows.length, 160);
for (const row of result.rows.slice(0, 10)) assert.ok(Math.abs(row.payment - 3430.78) < 1e-8);
for (const row of result.rows.slice(10, 12)) assert.ok(Math.abs(row.payment - 2577.34) < 1e-8);
const correctionMonths = result.rows.filter(row => row.tags.includes("CORREÇÃO")).map(row => row.month);
assert.deepEqual(correctionMonths, Array.from({ length: 13 }, (_, i) => 13 + i * 12));
assert.ok(Math.abs(result.last.saldoFinal) < 1e-7);

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const cumulativeFirst = (count: number) => sum(result.rows.slice(0, count).map(row => row.payment));
const with24Paid = simulateEstruturaDoPlano({ ...realPlanOptions, parcelasPagas: 24 });
assert.ok(Math.abs(with24Paid.eficienciaTaxa!.paidAmount - cumulativeFirst(24)) < 1e-7);
const paidCheckpoint25 = with24Paid.eficienciaTaxa!.degradacao!.rows.find(row => row.parcela === 25)!;
assert.ok(Math.abs(paidCheckpoint25.desembolsoAcumulado - cumulativeFirst(25)) < 1e-7);
const testOnlyLance = simulateEstruturaDoPlano({ ...realPlanOptions, lanceProprio: 1, parcelasPagas: 24 });
for (let i = 0; i < 24; i++) {
  assert.ok(Math.abs(testOnlyLance.contemplation!.rows[i].payment - result.rows[i].payment) < 1e-7);
  assert.ok(Math.abs(testOnlyLance.contemplation!.rows[i].saldoAfterPayment - result.rows[i].saldoFinal) < 1e-7);
}

const keyMonths = [1, 10, 11, 12, 13, 14, 24, 25, 159, 160];
const keyRows = keyMonths.map(month => {
  const row = result.rows[month - 1];
  const range = realPlanOptions.paymentRanges.find(item => item.start <= month && item.end >= month)!;
  return {
    month,
    nominalPayment: range.value,
    payment: row.payment,
    saldoAntes: row.saldoAntes,
    reajuste: row.reajuste,
    saldoInicial: row.saldoInicial,
    fundCommonPaid: row.fc,
    adminPaid: row.ta,
    insurance: row.insurance,
    paymentScale: row.paymentScale,
    saldoFinal: row.saldoFinal,
    events: row.tags,
  };
});
const pageChecks = {
  "1-proposta": { rows: result.rows.length, initialTenNominalExact: true, month11And12Exact: true, finalBalance: result.last.saldoFinal },
  "2-custos": { principalCommon: result.sums.fc, adminPaid: result.sums.ta, insurance: result.sums.insurance, totalPaid: result.sums.payment, reconcilesToRows: Math.abs(result.costs.totalPaidNominal - sum(result.rows.map(row => row.payment))) < 1e-7 },
  "3-correcoes": { events: correctionMonths, count: correctionMonths.length, totalBalanceCorrections: result.sums.reajuste, yearlyPaidReconciles: Math.abs(sum(result.yearlyCorrections.map(row => row.paidYear)) - result.sums.payment) < 1e-7 },
  "4-investimentos": { savingsPrincipal: result.investments.savings.principal, cdbPrincipal: result.investments.cdb.principal, monthlyDepositsMatchSchedule: result.investments.cdb.details.every((detail, i) => Math.abs(detail.aporte - result.rows[i].payment) < 1e-7) },
  "5-lance": { realScenarioInputs: "Nenhum lance/mês de contemplação informado; painel corretamente solicita esses dados.", testOnlyPreEventParity24Months: true },
  "6-eficiencia": { realScenarioPaidInstallments: 0, paidAmountAt24Test: with24Paid.eficienciaTaxa!.paidAmount, sumOfFirst24Payments: cumulativeFirst(24), degradationAt25UsesFirst25Payments: paidCheckpoint25.desembolsoAcumulado },
};

const csvHeaders = ["mês", "parcela nominal", "saldo antes da correção", "correção aplicada", "saldo após correção e antes da parcela", "carta atualizada", "fundo comum amortizado", "taxa adm. amortizada", "seguro", "parcela total calculada", "fator do perfil", "saldo após pagamento", "eventos"];
const csvCell = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;
const csvRows = result.rows.map(row => {
  const nominal = realPlanOptions.paymentRanges.find(range => range.start <= row.month && range.end >= row.month)!.value;
  return [row.month, nominal, row.saldoAntes, row.reajuste, row.saldoInicial, row.credit, row.fc, row.ta, row.insurance, row.payment, row.paymentScale, row.saldoFinal, row.tags.join(" | ")];
});
writeFileSync(path.join(output, "cronograma_160_meses.csv"), "\uFEFF" + [csvHeaders, ...csvRows].map(row => row.map(csvCell).join(";")).join("\n") + "\n");
const keyHeaders = ["mês", "parcela nominal informada", "prestação total calculada", "saldo devedor antes da correção", "correção aplicada", "saldo após correção/antes da parcela", "fundo comum amortizado", "taxa adm. amortizada", "seguro", "fator do perfil", "saldo devedor após pagamento", "eventos"];
const keyValues = keyRows.map(row => [row.month, row.nominalPayment, row.payment, row.saldoAntes, row.reajuste, row.saldoInicial, row.fundCommonPaid, row.adminPaid, row.insurance, row.paymentScale, row.saldoFinal, row.events.join(" | ")]);
writeFileSync(path.join(output, "prestações_chave.csv"), "\uFEFF" + [keyHeaders, ...keyValues].map(row => row.map(csvCell).join(";")).join("\n") + "\n");
writeFileSync(path.join(output, "plano_real_completo.json"), JSON.stringify({ options: realPlanOptions, result, independent, maxDifference, pageChecks, keyRows }, null, 2) + "\n");
writeFileSync(path.join(output, "resumo_validacao.json"), JSON.stringify({ maxDifference, paymentSum: result.sums.payment, finalBalance: result.last.saldoFinal, correctedCredit: result.last.credit, adjustmentSum: result.sums.reajuste, correctionMonths, factors: result.rows.filter(row => row.tags.includes("CORREÇÃO")).map(row => ({ month: row.month, scale: row.paymentScale })), keyRows, pageChecks, warnings: result.warnings }, null, 2) + "\n");
console.log(JSON.stringify({ output, maxDifference, keyRows, pageChecks, correctionMonths, warnings: result.warnings }, null, 2));
