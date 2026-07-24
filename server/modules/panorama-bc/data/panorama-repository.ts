import {
  and,
  asc,
  between,
  count,
  eq,
  like,
  max,
  min,
  or,
  sql,
} from "drizzle-orm";
import {
  panoramaMetadata,
  panoramaMetrics,
} from "../../../../drizzle/panorama-schema";
import { getDb } from "../../../db";

export interface PanoramaGroupSummary {
  id: string;
  name: string;
  metricCount: number;
}

export interface PanoramaMetricSummary {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  unit: string;
  publicationStatus: "publicado" | "pendente" | "arquivado";
}

export interface PanoramaMetricPoint {
  dataBase: number;
  value: number;
  source: string;
  importedAt: Date;
}

export interface PanoramaMetricCoverage {
  earliestDataBase: number;
  latestDataBase: number;
  observationCount: number;
}

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Banco de dados do Panorama indisponível");
  }
  return db;
}

export async function listPanoramaGroups(): Promise<PanoramaGroupSummary[]> {
  const db = await requireDb();
  const rows = await db
    .select({
      id: panoramaMetadata.groupId,
      name: panoramaMetadata.groupName,
      metricCount: count(),
    })
    .from(panoramaMetadata)
    .groupBy(panoramaMetadata.groupId, panoramaMetadata.groupName)
    .orderBy(
      sql`CAST(${panoramaMetadata.groupId} AS UNSIGNED)`,
      asc(panoramaMetadata.groupName),
    );

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    metricCount: Number(row.metricCount),
  }));
}

export async function listPanoramaMetrics(filters: {
  groupId?: string;
  search?: string;
} = {}): Promise<PanoramaMetricSummary[]> {
  const db = await requireDb();
  const normalizedSearch = filters.search?.trim();
  const conditions = [
    filters.groupId ? eq(panoramaMetadata.groupId, filters.groupId) : undefined,
    normalizedSearch
      ? or(
          like(panoramaMetadata.metricName, `%${normalizedSearch}%`),
          like(panoramaMetadata.groupName, `%${normalizedSearch}%`),
        )
      : undefined,
  ].filter(condition => condition !== undefined);

  const rows = await db
    .select({
      id: panoramaMetadata.metricId,
      name: panoramaMetadata.metricName,
      groupId: panoramaMetadata.groupId,
      groupName: panoramaMetadata.groupName,
      unit: panoramaMetadata.unit,
      publicationStatus: panoramaMetadata.publicationStatus,
    })
    .from(panoramaMetadata)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      sql`CAST(${panoramaMetadata.groupId} AS UNSIGNED)`,
      sql`CAST(${panoramaMetadata.metricId} AS UNSIGNED)`,
      asc(panoramaMetadata.metricName),
    );

  return rows;
}

export async function getPanoramaMetric(
  metricId: string,
): Promise<PanoramaMetricSummary | null> {
  const db = await requireDb();
  const rows = await db
    .select({
      id: panoramaMetadata.metricId,
      name: panoramaMetadata.metricName,
      groupId: panoramaMetadata.groupId,
      groupName: panoramaMetadata.groupName,
      unit: panoramaMetadata.unit,
      publicationStatus: panoramaMetadata.publicationStatus,
    })
    .from(panoramaMetadata)
    .where(eq(panoramaMetadata.metricId, metricId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getPanoramaMetricCoverage(
  metricId: string,
): Promise<PanoramaMetricCoverage | null> {
  const db = await requireDb();
  const rows = await db
    .select({
      earliestDataBase: min(panoramaMetrics.dataBase),
      latestDataBase: max(panoramaMetrics.dataBase),
      observationCount: count(),
    })
    .from(panoramaMetrics)
    .where(eq(panoramaMetrics.metricId, metricId));

  const row = rows[0];
  if (
    !row ||
    row.earliestDataBase === null ||
    row.latestDataBase === null ||
    Number(row.observationCount) === 0
  ) {
    return null;
  }

  return {
    earliestDataBase: Number(row.earliestDataBase),
    latestDataBase: Number(row.latestDataBase),
    observationCount: Number(row.observationCount),
  };
}

export async function getPanoramaMetricSeries(
  metricId: string,
  startDataBase: number,
  endDataBase: number,
): Promise<PanoramaMetricPoint[]> {
  const db = await requireDb();
  const rows = await db
    .select({
      dataBase: panoramaMetrics.dataBase,
      value: panoramaMetrics.value,
      source: panoramaMetrics.source,
      importedAt: panoramaMetrics.importedAt,
    })
    .from(panoramaMetrics)
    .where(
      and(
        eq(panoramaMetrics.metricId, metricId),
        between(panoramaMetrics.dataBase, startDataBase, endDataBase),
      ),
    )
    .orderBy(asc(panoramaMetrics.dataBase));

  return rows.map(row => ({
    dataBase: row.dataBase,
    value: Number(row.value),
    source: row.source,
    importedAt: row.importedAt,
  }));
}
