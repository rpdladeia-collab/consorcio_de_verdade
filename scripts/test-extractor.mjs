/**
 * Teste isolado: chamar validateZipIntegrity do extractor.ts
 */
import { validateZipIntegrity } from "../server/modules/bc-admin/extractor.ts";

async function main() {
  const zipPath = "/storage/banco-central/202605Consorcios.zip";
  console.log("Calling validateZipIntegrity...");
  const result = await validateZipIntegrity(zipPath);
  console.log("Result:", JSON.stringify(result));
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
