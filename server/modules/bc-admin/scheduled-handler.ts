/**
 * FASE 1: Handler para Cron Mensal de Importação do BC
 * Executado automaticamente no dia 15 de cada mês às 02:00 UTC
 * Responsável por: download, extração e importação de dados
 */

import { Request, Response } from "express";
import { processAllNewZips } from "./orchestrator";
import { sdk } from "../../_core/sdk";

/**
 * Handler para POST /api/scheduled/bc-admin-import
 * Executado pelo cron do Heartbeat
 */
export async function handleBCAdminImport(req: Request, res: Response) {
  try {
    // Autenticar como cron
    const user = await sdk.authenticateRequest(req);

    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    console.log(
      `[BC-ADMIN-CRON] Starting import cycle - taskUid: ${user.taskUid}`
    );

    // Executar importação de todos os ZIPs novos
    const results = await processAllNewZips();

    console.log(
      `[BC-ADMIN-CRON] Import cycle completed - ${results.length} ZIPs processed`
    );

    // Contar sucessos e erros
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return res.json({
      ok: true,
      taskUid: user.taskUid,
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: results.length,
        successful: successCount,
        failed: errorCount,
      },
      results: results.map((r) => ({
        success: r.success,
        importacaoId: r.importacaoId,
        dataBase: r.dataBase,
        arquivosProcessados: r.arquivosProcessados,
        linhasImportadas: r.linhasImportadas,
        erros: r.erros,
      })),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";

    console.error(`[BC-ADMIN-CRON] Error:`, error);

    return res.status(500).json({
      error: errorMessage,
      stack,
      context: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Informações sobre o cron
 */
export const BC_ADMIN_CRON_CONFIG = {
  name: "bc-admin-monthly-import",
  cron: "0 0 2 15 * *", // Dia 15 de cada mês às 02:00 UTC
  path: "/api/scheduled/bc-admin-import",
  description: "Monthly import of Banco Central consortium data",
  method: "POST" as const,
};
