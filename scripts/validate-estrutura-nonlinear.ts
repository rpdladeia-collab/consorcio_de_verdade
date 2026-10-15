import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { simulateEstruturaDoPlano } from "../server/lib/estruturaDoPlano";
import { comparisonScenarios, independentSchedule } from "../server/test-fixtures/estruturaDoPlano";
import { buildPdfEstruturaDaLance } from "../client/src/lib/estruturaDoPlanoLance";

const output = path.resolve(process.argv[2] || "artifacts/estrutura-nonlinear");
mkdirSync(output, { recursive: true });
const summary = [];
let maxDifference = 0;
for (const scenario of comparisonScenarios) {
  const result = simulateEstruturaDoPlano(scenario.options);
  const independent = independentSchedule(scenario.options);
  for (let i = 0; i < result.rows.length; i++) {
    for (const [key, expected] of Object.entries(independent[i])) {
      const difference = Math.abs((result.rows[i] as any)[key] - expected);
      assert.ok(difference < 1e-5, `${scenario.id}: mês ${i + 1}, ${key}, diferença ${difference}`);
      maxDifference = Math.max(maxDifference, difference);
    }
  }
  const lanceOptions = { ...scenario.options, lanceProprio: 45000, lanceFgts: 15000, lanceEmbutido: 30000,
    parcelasPagas: 24, baseDoLance: "categoria" as const, estrategiaPos: "abater_parcela" as const };
  const withLance = simulateEstruturaDoPlano(lanceOptions);
  const pdfData = buildPdfEstruturaDaLance(withLance, { simulationId: `AUDIT-${scenario.id}`, generatedAt: "2026-10-15T03:00:00.000Z" });
  writeFileSync(path.join(output, `${scenario.id}.json`), JSON.stringify({ options: scenario.options, result, lanceOptions, withLance, pdfData }, null, 2) + "\n");
  const keys = Object.keys(result.rows[0]);
  const cell = (value: unknown) => `"${String(Array.isArray(value) ? value.join(" | ") : value).replace(/"/g, '""')}"`;
  writeFileSync(path.join(output, `${scenario.id}.csv`), "\uFEFF" + keys.map(cell).join(";") + "\n" + result.rows.map(row => keys.map(key => cell((row as any)[key])).join(";")).join("\n") + "\n");
  summary.push({ id: scenario.id, label: scenario.label, rows: result.rows.length,
    initial: result.first.payment, final: result.last.payment, total: result.sums.payment,
    common: result.sums.fc, admin: result.sums.ta, insurance: result.sums.insurance,
    costs: result.costs.custoOperacional, creditFinal: result.last.credit, residual: result.last.saldoFinal,
    balanceCorrection: result.sums.reajuste, savings: result.investments.savings.net, cdb: result.investments.cdb.net,
    lanceStrength: pdfData.forcaPct, postBidPayment: pdfData.parcelaPosLance,
    efficiencyPaidEstimate: withLance.eficienciaTaxa!.paidAmount,
    efficiencyPaidActual: withLance.rows.slice(0, 24).reduce((total, row) => total + row.payment, 0),
    efficiencyRate: withLance.eficienciaTaxa!.onNew, warnings: result.warnings });
}
writeFileSync(path.join(output, "summary.json"), JSON.stringify({ maxDifference, summary }, null, 2) + "\n");
console.log(JSON.stringify({ output, maxDifference, summary }, null, 2));
