/**
 * FASE 6: Setup do Heartbeat Job para atualização diária automática do motor de ingestão
 * Registra o job "bc-admin-daily-import" no Heartbeat service na inicialização do servidor.
 * Cron: "0 0 3 * * *" — diariamente às 03:00 UTC
 * Callback: POST /api/scheduled/bc-admin-import
 */

import { createHeartbeatJob, listHeartbeatJobs } from "../../_core/heartbeat";
import { ENV } from "../../_core/env";

const JOB_NAME = "bc-admin-daily-import";
const JOB_CRON = "0 0 3 * * *";
const JOB_PATH = "/api/scheduled/bc-admin-import";
const JOB_DESCRIPTION = "Daily check and import of new Banco Central consortium data files";

/**
 * Registrar o job diário no Heartbeat service.
 * Se o job já existir, não faz nada (idempotente).
 * Requer uma sessão de usuário válida — usa o token do owner do projeto.
 */
export async function setupDailyImportHeartbeat(): Promise<void> {
  try {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.log("[HEARTBEAT-SETUP] Forge API not configured, skipping job registration");
      return;
    }

    // Verificar se o job já existe (empty string = project owner identity)
    const existingResult = await listHeartbeatJobs("");
    const existingJobs = existingResult?.jobs ?? [];
    const existing = existingJobs.find((j) => j.name === JOB_NAME);

    if (existing) {
      console.log(`[HEARTBEAT-SETUP] Job "${JOB_NAME}" already exists (taskUid: ${existing.taskUid}), skipping`);
      return;
    }

    // Criar o job — empty string = project owner identity
    const result = await createHeartbeatJob(
      {
        name: JOB_NAME,
        cron: JOB_CRON,
        path: JOB_PATH,
        method: "POST",
        description: JOB_DESCRIPTION,
      },
      "",
    );

    console.log(`[HEARTBEAT-SETUP] Job "${JOB_NAME}" created successfully (taskUid: ${result.taskUid}, nextExecution: ${result.nextExecutionAt})`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[HEARTBEAT-SETUP] Failed to register daily import job: ${errorMsg}`);
  }
}
