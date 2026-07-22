/**
 * Script de teste: importar um único ZIP que existe para validar o motor end-to-end.
 */
import { getAvailableBCZips } from "../server/modules/bc-admin/downloader.ts";
import { executeFullImportFlow } from "../server/modules/bc-admin/orchestrator.ts";

async function main() {
  const allZips = getAvailableBCZips(24);
  // Pular o primeiro (404 - mês futuro) e testar o segundo
  const z = allZips[1];
  console.log("Testing:", z.filename, z.url);
  const r = await executeFullImportFlow(z);
  console.log("Result:", JSON.stringify(r, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
