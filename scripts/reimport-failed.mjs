import { executeFullImportFlow } from "../server/modules/bc-admin/orchestrator.ts";
import { getAvailableBCZips } from "../server/modules/bc-admin/downloader.ts";

const failedZips = [
  "202603Consorcios.zip",
  "202512Consorcios.zip",
  "202509Consorcios.zip",
  "202506Consorcios.zip",
  "202503Consorcios.zip",
  "202412Consorcios.zip",
  "202409Consorcios.zip",
];

const allZips = getAvailableBCZips(24);
const toReimport = allZips.filter(z => failedZips.includes(z.filename));

console.log(`Re-importing ${toReimport.length} failed ZIPs`);

for (let i = 0; i < toReimport.length; i++) {
  const zip = toReimport[i];
  process.stdout.write(`[${i+1}/${toReimport.length}] ${zip.filename} ... `);
  try {
    const result = await executeFullImportFlow(zip);
    if (result.success) {
      console.log(`OK (${result.linhasImportadas} rows)`);
    } else {
      console.log(`FAIL: ${result.erros?.join("; ")}`);
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
}
console.log("DONE");
