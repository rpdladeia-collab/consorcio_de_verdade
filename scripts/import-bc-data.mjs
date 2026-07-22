/**
 * Script standalone para executar a importação real dos últimos 24 meses
 * das duas bases oficiais do Banco Central.
 * Executa via: node scripts/import-bc-data.mjs
 */

import { getAvailableBCZips } from "../server/modules/bc-admin/downloader.ts";
import { executeFullImportFlow } from "../server/modules/bc-admin/orchestrator.ts";

async function main() {
  console.log("=== Panorama BC — Importação dos últimos 24 meses ===\n");

  const allZips = getAvailableBCZips(24);
  console.log(`Total de ZIPs a processar: ${allZips.length}`);
  console.log(`  Dados Consolidados: ${allZips.filter((z) => z.baseOrigem === "consolidados").length}`);
  console.log(`  Dados por UF: ${allZips.filter((z) => z.baseOrigem === "dados_uf").length}\n`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let totalRows = 0;

  for (const zipFile of allZips) {
    process.stdout.write(`[${zipFile.baseOrigem}] ${zipFile.filename} ... `);
    const result = await executeFullImportFlow(zipFile);

    if (result.success) {
      console.log(`OK (${result.linhasImportadas} linhas)`);
      successCount++;
      totalRows += result.linhasImportadas || 0;
    } else {
      const isDup = result.erros?.some((e) => e.includes("duplicate") || e.includes("already imported"));
      const isNotFound = result.erros?.some((e) => e.includes("Download failed"));
      if (isDup) {
        console.log("SKIP (duplicado)");
        skipCount++;
      } else if (isNotFound) {
        console.log("SKIP (não disponível)");
        skipCount++;
      } else {
        console.log(`FAIL: ${result.erros?.join("; ")}`);
        failCount++;
      }
    }
  }

  console.log(`\n=== Resumo ===`);
  console.log(`Sucessos: ${successCount}`);
  console.log(`Falhas: ${failCount}`);
  console.log(`Ignorados (duplicados/não disponíveis): ${skipCount}`);
  console.log(`Total de linhas importadas: ${totalRows}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
