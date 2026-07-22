/**
 * Script de importação em batches: processa os ZIPs em grupos pequenos
 * para evitar timeout. Aceita --start e --count como argumentos.
 * Uso: npx tsx scripts/import-bc-batch.mjs --start=0 --count=4
 */
import { getAvailableBCZips } from "../server/modules/bc-admin/downloader.ts";
import { executeFullImportFlow } from "../server/modules/bc-admin/orchestrator.ts";

function parseArgs() {
  const args = process.argv.slice(2);
  let start = 0;
  let count = 4;
  for (const arg of args) {
    if (arg.startsWith("--start=")) start = parseInt(arg.split("=")[1]);
    if (arg.startsWith("--count=")) count = parseInt(arg.split("=")[1]);
  }
  return { start, count };
}

async function main() {
  const { start, count } = parseArgs();
  const allZips = getAvailableBCZips(24);
  const batch = allZips.slice(start, start + count);

  console.log(`=== Batch import: ${batch.length} ZIPs (start=${start}) ===\n`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let totalRows = 0;

  for (const zipFile of batch) {
    process.stdout.write(`[${zipFile.baseOrigem}] ${zipFile.filename} ... `);
    try {
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
    } catch (e) {
      console.log(`EXCEPTION: ${e}`);
      failCount++;
    }
  }

  console.log(`\n=== Resumo do batch ===`);
  console.log(`Sucessos: ${successCount}`);
  console.log(`Falhas: ${failCount}`);
  console.log(`Ignorados: ${skipCount}`);
  console.log(`Total de linhas: ${totalRows}`);
  console.log(`\nPróximo batch: --start=${start + count} --count=${count}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
