import {
  fetchMetricCatalog,
  fetchMetricValues,
} from "../server/modules/panorama-bc/data/bcb-client";

const dataBase = Number(process.argv[2] ?? "202512");
const [catalog, values] = await Promise.all([
  fetchMetricCatalog(),
  fetchMetricValues(dataBase),
]);

const groupCount = new Set(catalog.map(item => item.groupId)).size;
const catalogIds = new Set(catalog.map(item => item.id));
const valueIds = new Set(values.map(item => item.metricId));
const missingValueIds = [...catalogIds].filter(id => !valueIds.has(id));

console.log(
  JSON.stringify(
    {
      source: "Banco Central do Brasil",
      dataBase,
      metricsInCatalog: catalog.length,
      groupsInCatalog: groupCount,
      valuesForDataBase: values.length,
      missingValueIds,
    },
    null,
    2,
  ),
);
