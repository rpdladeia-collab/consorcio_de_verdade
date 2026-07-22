/**
 * FASE 1: Helpers de banco de dados para motor de ingestão do BC
 * Funções para inserir, atualizar e consultar dados das tabelas bc_*
 */

import { db } from "../../db";
import {
  bcImportacoes,
  bcArquivos,
  bcDadosMensais,
  InsertBcImportacao,
  InsertBcArquivo,
  InsertBcDadosMensal,
} from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Criar novo registro de importação
 */
export async function createImportacao(data: InsertBcImportacao) {
  const result = await db.insert(bcImportacoes).values(data);
  return result;
}

/**
 * Buscar importação por hash do arquivo (para detectar duplicatas)
 */
export async function findImportacaoByHash(hashArquivo: string) {
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
  quantidadeArquivos?: number
) {
  const updateData: any = { status };
  if (logs) updateData.logs = logs;
  if (quantidadeArquivos !== undefined)
    updateData.quantidadeArquivosExtraidos = quantidadeArquivos;

  await db
    .update(bcImportacoes)
    .set(updateData)
    .where(eq(bcImportacoes.id, importacaoId));
}

/**
 * Inserir arquivo extraído
 */
export async function createArquivo(data: InsertBcArquivo) {
  await db.insert(bcArquivos).values(data);
}

/**
 * Inserir dados mensais (dados brutos do BC)
 */
export async function createDadosMensal(data: InsertBcDadosMensal) {
  await db.insert(bcDadosMensais).values(data);
}

/**
 * Buscar última importação bem-sucedida
 */
export async function getUltimaImportacaoSucesso() {
  const result = await db
    .select()
    .from(bcImportacoes)
    .where(eq(bcImportacoes.status, "sucesso"))
    .orderBy((t) => t.dataImportacao)
    .limit(1);
  return result[0] || null;
}

/**
 * Listar todas as importações (para auditoria)
 */
export async function listImportacoes(limit: number = 50, offset: number = 0) {
  const result = await db
    .select()
    .from(bcImportacoes)
    .orderBy((t) => t.dataImportacao)
    .limit(limit)
    .offset(offset);
  return result;
}

/**
 * Buscar dados mensais por data-base
 */
export async function getDadosMensaisByDataBase(dataBase: string) {
  const result = await db
    .select()
    .from(bcDadosMensais)
    .where(eq(bcDadosMensais.dataBase, dataBase));
  return result;
}
