/**
 * Teste isolado do validateZipIntegrity
 */
import * as fs from "fs";
import * as unzipper from "unzipper";

async function main() {
  const zipPath = "/storage/banco-central/202605Consorcios.zip";
  console.log("File exists:", fs.existsSync(zipPath));
  console.log("File size:", fs.statSync(zipPath).size);

  const result = await new Promise((resolve) => {
    let isValid = true;
    let errorMsg;
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        console.log("Entry:", entry.path);
        entry.autodrain();
      })
      .on("error", (error) => {
        isValid = false;
        errorMsg = "ZIP corrupted: " + error.message;
      })
      .on("close", () => {
        console.log("Close event fired");
        if (isValid) {
          resolve({ valid: true });
        } else {
          resolve({ valid: false, error: errorMsg });
        }
      });
  });
  console.log("Result:", JSON.stringify(result));
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
