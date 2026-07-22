import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Tipagem das tabelas Panorama já existentes no Railway.
 *
 * Este arquivo é deliberadamente separado do schema migratório principal. O
 * módulo Panorama só realiza SELECTs e não deve gerar ou aplicar migrações.
 */
export const panoramaMetadata = mysqlTable("panorama_metadata", {
  metricId: varchar("id_metrica", { length: 64 }).primaryKey(),
  metricName: varchar("metrica_nome", { length: 512 }).notNull(),
  groupId: varchar("id_grupo", { length: 64 }).notNull(),
  groupName: varchar("grupo_nome", { length: 256 }).notNull(),
  unit: varchar("unidade", { length: 64 }).notNull(),
  publicationStatus: mysqlEnum("status", ["publicado", "pendente", "arquivado"])
    .default("pendente")
    .notNull(),
  discoveredAt: timestamp("data_descoberta").defaultNow().notNull(),
});

export const panoramaMetrics = mysqlTable("panorama_metrics", {
  id: int("id").autoincrement().primaryKey(),
  dataBase: int("data_base").notNull(),
  metricId: varchar("id_metrica", { length: 64 }).notNull(),
  value: decimal("valor", { precision: 20, scale: 4 }).notNull(),
  importedAt: timestamp("data_importacao").defaultNow().notNull(),
  source: varchar("fonte", { length: 64 }).default("BCB").notNull(),
});

export const panoramaSyncLogs = mysqlTable("panorama_sync_logs", {
  id: int("id").autoincrement().primaryKey(),
  executedAt: timestamp("data_execucao").defaultNow().notNull(),
  apiStatus: varchar("status_api", { length: 32 }).notNull(),
  dataBase: int("data_base_bcb"),
  newRecords: int("registros_novos").default(0).notNull(),
  discoveredMetrics: int("metricas_descobertas").default(0).notNull(),
  details: varchar("detalhes", { length: 1024 }),
});

export type PanoramaMetadataRow = typeof panoramaMetadata.$inferSelect;
export type PanoramaMetricRow = typeof panoramaMetrics.$inferSelect;
export type PanoramaSyncLogRow = typeof panoramaSyncLogs.$inferSelect;
