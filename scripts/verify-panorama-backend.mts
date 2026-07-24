import assert from "node:assert/strict";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true, override: true });

const [repository, periods] = await Promise.all([
  import("../server/modules/panorama-bc/data/panorama-repository"),
  import("../server/modules/panorama-bc/domain/period"),
]);

const groups = await repository.listPanoramaGroups();
const metrics = await repository.listPanoramaMetrics();
const metric = await repository.getPanoramaMetric("1");
const coverage = await repository.getPanoramaMetricCoverage("1");

assert.equal(groups.length, 19, "catálogo deve ter 19 grupos");
assert.equal(metrics.length, 125, "catálogo deve ter 125 métricas");
assert.ok(metric, "métrica 1 deve existir");
assert.ok(coverage, "métrica 1 deve ter cobertura");
assert.equal(coverage.earliestDataBase, 201612);
assert.equal(coverage.latestDataBase, 202512);
assert.equal(coverage.observationCount, 10);

const period = periods.resolvePeriod({ preset: "5y" }, coverage);
const series = await repository.getPanoramaMetricSeries(
  metric.id,
  period.startDataBase,
  period.endDataBase,
);

assert.equal(series.length, 5, "recorte de cinco anos deve retornar cinco bases anuais");
assert.equal(series[0]?.dataBase, 202112);
assert.equal(series.at(-1)?.dataBase, 202512);
assert.ok(series.every(point => point.source === "BCB"));

console.log(
  JSON.stringify(
    {
      groups: groups.length,
      metrics: metrics.length,
      metric: {
        id: metric.id,
        name: metric.name,
        group: metric.groupName,
        unit: metric.unit,
      },
      coverage,
      period,
      selectedObservations: series.length,
      firstSelectedDataBase: series[0]?.dataBase,
      lastSelectedDataBase: series.at(-1)?.dataBase,
      sourceValues: [...new Set(series.map(point => point.source))],
    },
    null,
    2,
  ),
);
