import { resolve } from "node:path";
import { config } from "dotenv";
import mysql from "mysql2/promise";
import { fetchMetricCatalog } from "../server/modules/panorama-bc/data/bcb-client";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true, override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada em .env.local");
}

interface LocalRow extends mysql.RowDataPacket {
  id_metrica: string;
  metrica_nome: string;
  id_grupo: string;
  grupo_nome: string;
  unidade: string;
}

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [localRows, officialRows] = await Promise.all([
    connection.query<LocalRow[]>(`
      SELECT id_metrica, metrica_nome, id_grupo, grupo_nome, unidade
      FROM panorama_metadata
      ORDER BY CAST(id_metrica AS UNSIGNED), id_metrica
    `),
    fetchMetricCatalog(),
  ]);

  const localCatalog = localRows[0];
  const officialById = new Map(officialRows.map(item => [item.id, item]));
  const localById = new Map(localCatalog.map(item => [item.id_metrica, item]));

  const missingLocally = officialRows
    .filter(item => !localById.has(item.id))
    .map(item => item.id);
  const extraLocally = localCatalog
    .filter(item => !officialById.has(item.id_metrica))
    .map(item => item.id_metrica);

  const divergences = localCatalog.flatMap(local => {
    const official = officialById.get(local.id_metrica);
    if (!official) return [];

    const fields = [
      ["name", normalize(local.metrica_nome), normalize(official.name)],
      ["groupId", local.id_grupo, official.groupId],
      ["groupName", normalize(local.grupo_nome), normalize(official.groupName)],
      ["unit", normalize(local.unidade), normalize(official.unit)],
    ] as const;

    return fields
      .filter(([, localValue, officialValue]) => localValue !== officialValue)
      .map(([field, localValue, officialValue]) => ({
        metricId: local.id_metrica,
        field,
        localValue,
        officialValue,
      }));
  });

  console.log(
    JSON.stringify(
      {
        localMetrics: localCatalog.length,
        officialMetrics: officialRows.length,
        localGroups: new Set(localCatalog.map(item => item.id_grupo)).size,
        officialGroups: new Set(officialRows.map(item => item.groupId)).size,
        missingLocally,
        extraLocally,
        divergenceCount: divergences.length,
        divergences,
      },
      null,
      2,
    ),
  );
} finally {
  connection.destroy();
}
