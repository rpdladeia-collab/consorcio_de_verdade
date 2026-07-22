/**
 * Script de teste verboso: importa um único ZIP com logging detalhado.
 * Versão com imports estáticos.
 */
import * as fs from "fs";
import * as path from "path";
import * as unzipper from "unzipper";
import { getAvailableBCZips, downloadZipFile, calculateFileHash, ensureStorageDir } from "../server/modules/bc-admin/downloader.ts";
import { extractZipFile, validateZipIntegrity } from "../server/modules/bc-admin/extractor.ts";
import { parseCSVFile } from "../server/modules/bc-admin/parser.ts";
import { getDb } from "../server/db";

async function main() {
  console.log("[1] Getting ZIP list...");
  const allZips = getAvailableBCZips(24);
  const z = allZips[1]; // 202605Consorcios.zip (exists)
  console.log("[2] Target:", z.filename, z.url);

  // Step 1: Download
  console.log("[3] Ensuring storage dir...");
  ensureStorageDir();
  const outputPath = path.join("/storage/banco-central", z.filename);
  
  console.log("[4] Downloading...");
  if (!fs.existsSync(outputPath)) {
    await downloadZipFile(z.url, outputPath);
    console.log("[4a] Downloaded to:", outputPath);
  } else {
    console.log("[4a] Already exists:", outputPath);
  }

  // Step 2: Validate
  console.log("[5] Validating ZIP...");
  const validation = await validateZipIntegrity(outputPath);
  console.log("[5a] Valid:", validation.valid, validation.error || "");

  // Step 3: Hash
  console.log("[6] Calculating hash...");
  const hash = await calculateFileHash(outputPath);
  console.log("[6a] Hash:", hash.substring(0, 16) + "...");

  // Step 4: DB connection
  console.log("[7] Connecting to DB...");
  const db = await getDb();
  if (!db) {
    console.error("[7a] ERROR: Database not available!");
    process.exit(1);
  }
  console.log("[7a] DB connected successfully");

  // Step 5: Extract
  console.log("[8] Extracting ZIP...");
  const extractResult = await extractZipFile(outputPath, z.dataBase);
  console.log("[8a] Extracted:", extractResult.files?.length || 0, "files");
  if (extractResult.files) {
    for (const f of extractResult.files) {
      console.log("     -", f.name, "(" + f.type + ", " + f.size + " bytes)");
    }
  }

  // Step 6: Parse first CSV
  if (extractResult.files && extractResult.files.length > 0) {
    const firstFile = extractResult.files.find(f => f.type === "csv") || extractResult.files[0];
    console.log("[9] Parsing:", firstFile.name);
    const parseResult = await parseCSVFile(firstFile.path);
    console.log("[9a] Parsed:", parseResult.rowCount, "rows, tipo:", parseResult.tipoDados);
    console.log("[9b] Headers:", parseResult.headers?.slice(0, 5));
    if (parseResult.data && parseResult.data.length > 0) {
      console.log("[9c] First row keys:", Object.keys(parseResult.data[0]).slice(0, 5));
    }
  }

  console.log("[10] All steps completed successfully!");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
