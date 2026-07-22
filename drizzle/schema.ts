import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * FASE 1: Motor de Ingestão de Dados do Banco Central
 * Tabelas para armazenar ZIPs, arquivos e dados brutos (espelho do BC)
 */

/**
 * Tabela: bc_importacoes
 * Responsável por registrar cada importação de dados do Banco Central
 * Rastreia: data da importação, data-base do arquivo, nome do ZIP, hash, status, logs
 */
export const bcImportacoes = mysqlTable("bc_importacoes", {
  id: int("id").autoincrement().primaryKey(),
  /** Data da importação (quando o arquivo foi processado) */
  dataImportacao: timestamp("dataImportacao").defaultNow().notNull(),
  /** Data-base do arquivo (YYYY-MM, ex: 2026-07) */
  dataBase: varchar("dataBase", { length: 7 }).notNull(),
  /** Nome do arquivo ZIP (ex: 202607Consorcios.zip) */
  nomeZip: varchar("nomeZip", { length: 255 }).notNull().unique(),
  /** Hash SHA-256 do arquivo para detectar duplicatas */
  hashArquivo: varchar("hashArquivo", { length: 64 }).notNull().unique(),
  /** Base de origem oficial do Banco Central */
  baseOrigem: mysqlEnum("baseOrigem", ["consolidados", "dados_uf"]).notNull(),
  /** Status da importação: pendente, sucesso, erro */
  status: mysqlEnum("status", ["pendente", "sucesso", "erro"]).default("pendente").notNull(),
  /** Quantidade de arquivos extraídos do ZIP */
  quantidadeArquivosExtraidos: int("quantidadeArquivosExtraidos").default(0),
  /** Quantidade total de linhas importadas */
  quantidadeLinhasImportadas: int("quantidadeLinhasImportadas").default(0),
  /** Logs do processo (erros, avisos, etc.) */
  logs: longtext("logs"),
  /** Timestamp de criação */
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
  /** Timestamp de última atualização */
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type BcImportacao = typeof bcImportacoes.$inferSelect;
export type InsertBcImportacao = typeof bcImportacoes.$inferInsert;

/**
 * Tabela: bc_arquivos
 * Responsável por registrar cada arquivo extraído do ZIP
 * Rastreia: nome, tipo, data-base, caminho de armazenamento
 */
export const bcArquivos = mysqlTable("bc_arquivos", {
  id: int("id").autoincrement().primaryKey(),
  /** Referência à importação */
  importacaoId: int("importacaoId").notNull(),
  /** Nome do arquivo (ex: 202607Segmentos_Consolidados.csv) */
  nomeArquivo: varchar("nomeArquivo", { length: 255 }).notNull(),
  /** Tipo do arquivo (csv, xlsx, txt, etc.) */
  tipoArquivo: varchar("tipoArquivo", { length: 10 }).notNull(),
  /** Data-base do arquivo (YYYY-MM) */
  dataBase: varchar("dataBase", { length: 7 }).notNull(),
  /** Caminho completo do arquivo armazenado (ex: /storage/banco-central/2026-07/arquivo.csv) */
  caminhoArmazenado: text("caminhoArmazenado").notNull(),
  /** Timestamp de criação */
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type BcArquivo = typeof bcArquivos.$inferSelect;
export type InsertBcArquivo = typeof bcArquivos.$inferInsert;

/**
 * Tabela: bc_dados_linha
 * RESPONSÁVEL POR ARMAZENAR CADA LINHA DOS ARQUIVOS CSV DO BANCO CENTRAL
 * REGRA ARQUITETURAL DEFINITIVA: 1 linha CSV = 1 linha no banco de dados
 *
 * Colunas individuais para campos comuns a todos os arquivos (filtros e cruzamentos):
 * - dataBase, baseOrigem, tipoDados, cnpjAdministradora, nomeAdministradora, codigoSegmento
 *
 * Coluna dadosLinha (JSON): preserva INTEGRALMENTE todos os campos oficiais de cada linha
 * Nenhum campo oficial é descartado.
 */
export const bcDadosLinha = mysqlTable("bc_dados_linha", {
  id: int("id").autoincrement().primaryKey(),
  /** Referência à importação */
  importacaoId: int("importacaoId").notNull(),
  /** Data-base do arquivo (YYYY-MM, ex: 2026-05) */
  dataBase: varchar("dataBase", { length: 7 }).notNull(),
  /** Base de origem oficial do Banco Central */
  baseOrigem: mysqlEnum("baseOrigem", ["consolidados", "dados_uf"]).notNull(),
  /** Tipo de dados (ex: segmentos_consolidados, bens_imoveis_grupos, bens_moveis_grupos, dados_uf) */
  tipoDados: varchar("tipoDados", { length: 100 }).notNull(),
  /** Nome do arquivo CSV original dentro do ZIP */
  nomeArquivoOriginal: varchar("nomeArquivoOriginal", { length: 255 }).notNull(),
  /** CNPJ da administradora (8 dígitos, zero-padded) — chave de relacionamento entre bases */
  cnpjAdministradora: varchar("cnpjAdministradora", { length: 20 }).notNull(),
  /** Nome da administradora (preservado do campo oficial) */
  nomeAdministradora: varchar("nomeAdministradora", { length: 255 }).notNull(),
  /** Código do segmento (preservado do campo oficial) */
  codigoSegmento: varchar("codigoSegmento", { length: 10 }).notNull(),
  /** Todos os campos oficiais da linha CSV, preservados integralmente como JSON */
  dadosLinha: text("dadosLinha").notNull(),
  /** Cabeçalhos originais do arquivo CSV (preservados integralmente) */
  cabecalhosOriginais: text("cabecalhosOriginais"),
  /** Timestamp de criação */
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type BcDadosLinha = typeof bcDadosLinha.$inferSelect;
export type InsertBcDadosLinha = typeof bcDadosLinha.$inferInsert;