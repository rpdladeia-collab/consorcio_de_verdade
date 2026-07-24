import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "dotenv";
import mysql from "mysql2/promise";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true, override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada em .env.local");
}

interface CatalogRow extends mysql.RowDataPacket {
  id_metrica: string;
  metrica_nome: string;
  id_grupo: string;
  grupo_nome: string;
  unidade: string;
  status: "publicado" | "pendente" | "arquivado";
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await connection.query<CatalogRow[]>(`
    SELECT id_metrica, metrica_nome, id_grupo, grupo_nome, unidade, status
    FROM panorama_metadata
    ORDER BY CAST(id_grupo AS UNSIGNED), id_grupo, CAST(id_metrica AS UNSIGNED), id_metrica
  `);

  const catalog = rows.map(row => ({
    metricId: row.id_metrica,
    metricName: row.metrica_nome,
    groupId: row.id_grupo,
    groupName: row.grupo_nome,
    unit: row.unidade,
    publicationStatus: row.status,
  }));

  const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [
    ["metric_id", "metric_name", "group_id", "group_name", "unit", "publication_status"],
    ...catalog.map(item => [
      item.metricId,
      item.metricName,
      item.groupId,
      item.groupName,
      item.unit,
      item.publicationStatus,
    ]),
  ]
    .map(row => row.map(quote).join(","))
    .join("\n");

  await Promise.all([
    writeFile(
      resolve(process.cwd(), "docs/panorama_bc_catalogo_125_metricas.json"),
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      resolve(process.cwd(), "docs/panorama_bc_catalogo_125_metricas.csv"),
      `${csv}\n`,
      "utf8",
    ),
  ]);

  console.log(
    JSON.stringify({
      metrics: catalog.length,
      groups: new Set(catalog.map(item => item.groupId)).size,
      files: [
        "docs/panorama_bc_catalogo_125_metricas.json",
        "docs/panorama_bc_catalogo_125_metricas.csv",
      ],
    }),
  );
} finally {
  await connection.end();
}
