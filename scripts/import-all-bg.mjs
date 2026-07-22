import { executeFullImportFlow } from "../server/modules/bc-admin/orchestrator.ts";
import { getAvailableBCZips } from "../server/modules/bc-admin/downloader.ts";

const allZips = getAvailableBCZips(24);
console.log(`[BG] Starting full import of ${allZips.length} ZIPs`);

let success = 0, fail = 0, skip = 0, totalRows = 0;
const results = [];

for (let i = 0; i < allZips.length; i++) {
  const zip = allZips[i];
  process.stdout.write(`[${i+1}/${allZips.length}] ${zip.filename} ... `);
  try {
    const result = await executeFullImportFlow(zip);
    if (result.success) {
      success++;
      totalRows += result.linhasImportadas || 0;
      console.log(`OK (${result.linhasImportadas} rows)`);
      results.push({ zip: zip.filename, status: "ok", rows: result.linhasImportadas });
    } else {
      const isDup = result.erros?.some(e => e.includes("duplicate") || e.includes("already imported"));
      const is404 = result.erros?.some(e => e.includes("Download failed"));
      if (isDup) { skip++; console.log("SKIP (duplicado)"); results.push({ zip: zip.filename, status: "dup" }); }
      else if (is404) { skip++; console.log("SKIP (404)"); results.push({ zip: zip.filename, status: "404" }); }
      else { fail++; console.log(`FAIL: ${result.erros?.join("; ")}`); results.push({ zip: zip.filename, status: "fail", error: result.erros?.join("; ") }); }
    }
  } catch (e) {
    fail++;
    console.log(`ERROR: ${e.message}`);
    results.push({ zip: zip.filename, status: "error", error: e.message });
  }
}

console.log(`\n=== RESUMO FINAL ===`);
console.log(`Sucessos: ${success}`);
console.log(`Falhas: ${fail}`);
console.log(`Ignorados: ${skip}`);
console.log(`Total de linhas: ${totalRows}`);
console.log(`\n=== DETALHES ===`);
results.forEach(r => console.log(`${r.zip}: ${r.status}${r.rows ? ` (${r.rows} rows)` : ""}${r.error ? ` - ${r.error}` : ""}`));
