/**
 * FASE 6: Helpers de banco de dados para motor de ingestão do BC
 * Funções para inserir, atualizar e consultar dados das tabelas bc_*
 * Modelo linha a linha: 1 linha CSV = 1 linha no banco (Alternativa A)
 */

import { getDb } from "../../db";
import {
  bcImportacoes,
  bcArquivos,
  bcDadosLinha,
  type InsertBcImportacao,
  type InsertBcArquivo,
  type InsertBcDadosLinha,
} from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Banco de dados indisponível para ingestão BC");
  }
  return db;
}

/**
 * Criar novo registro de importação
 */
export async function createImportacao(data: InsertBcImportacao): Promise<number> {
  const db = await requireDb();
  const result = await db.insert(bcImportacoes).values(data) as any;
  const insertId = Array.isArray(result) ? result[0]?.insertId : result?.insertId;
  if (!insertId || isNaN(Number(insertId))) {
    const found = await findImportacaoByHash(data.hashArquivo);
    return found?.id ?? 0;
  }
  return Number(insertId);
}

/**
 * Buscar importação por hash do arquivo (para detectar duplicatas)
 */
export async function findImportacaoByHash(hashArquivo: string) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(bcImportacoes)
    .where(eq(bcImportacoes.hashArquivo, hashArquivo))
    .limit(1);
  return result[0] || null;
}

/**
 * Buscar importação por nome do ZIP
 */
export async function findImportacaoByNomeZip(nomeZip: string) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(bcImportacoes)
    .where(eq(bcImportacoes.nomeZip, nomeZip))
    .limit(1);
  return result[0] || null;
}

/**
 * Atualizar status da importação
 */
export async function updateImportacaoStatus(
  importacaoId: number,
  status: "pendente" | "sucesso" | "erro",
  logs?: string,
  quantidadeArquivos?: number,
  quantidadeLinhas?: number,
) {
  const db = await requireDb();
  const updateData: Record<string, unknown> = { status };
  if (logs) updateData.logs = logs;
  if (quantidadeArquivos !== undefined)
    updateData.quantidadeArquivosExtraidos = quantidadeArquivos;
  if (quantidadeLinhas !== undefined)
    updateData.quantidadeLinhasImportadas = quantidadeLinhas;

  await db
    .update(bcImportacoes)
    .set(updateData)
    .where(eq(bcImportacoes.id, importacaoId));
}

/**
 * Inserir arquivo extraído
 */
export async function createArquivo(data: InsertBcArquivo) {
  const db = await requireDb();
  await db.insert(bcArquivos).values(data);
}

/**
 * Inserir múltiplas linhas no banco (bulk insert linha a linha)
 * Cada item do array = 1 linha do CSV = 1 linha no banco
 * Divide em lotes de 500 para respeitar limites do TiDB
 */
export async function createDadosLinhaBatch(rows: InsertBcDadosLinha[]): Promise<number> {
  if (rows.length === 0) return 0;
  const db = await requireDb();
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(bcDadosLinha).values(batch);
    inserted += batch.length;
  }

  return inserted;
}

/**
 * Buscar última importação bem-sucedida
 */
export async function getUltimaImportacaoSucesso() {
  const db = await requireDb();
  const result = await db
    .select()
    .from(bcImportacoes)
    .where(eq(bcImportacoes.status, "sucesso"))
    .orderBy(desc(bcImportacoes.dataImportacao))
    .limit(1);
  return result[0] || null;
}

/**
 * Listar todas as importações (para auditoria)
 */
export async function listImportacoes(limit: number = 50, offset: number = 0) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(bcImportacoes)
    .orderBy(desc(bcImportacoes.dataImportacao))
    .limit(limit)
    .offset(offset);
  return result;
}

/**
 * Buscar linhas por data-base
 */
export async function getDadosLinhaByDataBase(dataBase: string) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(bcDadosLinha)
    .where(eq(bcDadosLinha.dataBase, dataBase));
  return result;
}

/**
 * Buscar linhas por data-base e tipo de dados
 */
export async function getDadosLinhaByTipo(
  dataBase: string,
  tipoDados: string,
) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(bcDadosLinha)
    .where(eq(bcDadosLinha.dataBase, dataBase));
  return result.filter((r) => r.tipoDados === tipoDados);
}
