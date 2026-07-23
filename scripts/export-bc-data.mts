/**
 * Exporta a base de dados completa do Banco Central (bc_dados_linha)
 * para arquivos CSV, um por tipoDados, preservando todos os campos oficiais.
 *
 * Uso: npx tsx scripts/export-bc-data.mts
 * Saida: /home/ubuntu/bc-export/ (um CSV por tipoDados)
 */
import { getDb } from "../server/db.ts";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = "/home/ubuntu/bc-export";
const BATCH_SIZE = 5000;

function csvEscape(value: string): string {
  if (value === null || value === undefined) return "";
  if (value.includes(";") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function rowToCsvLine(row: Record<string, string>, headers: string[]): string {
  return headers.map((h) => csvEscape(row[h] ?? "")).join(";");
}

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Banco de dados indisponivel. Verifique DATABASE_URL.");
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Descobrir todos os tipoDados distintos
  const tiposResult = await db.execute(
    "SELECT DISTINCT `tipoDados` FROM bc_dados_linha ORDER BY `tipoDados`"
  );
  const tipos = (tiposResult[0] as any[]).map((r) => r.tipoDados as string);
  console.log(`Tipos de dados encontrados: ${tipos.length}`);
  tipos.forEach((t) => console.log(`  - ${t}`));

  const fixedHeaders = [
    "dataBase",
    "baseOrigem",
    "tipoDados",
    "nomeArquivoOriginal",
    "cnpjAdministradora",
    "nomeAdministradora",
    "codigoSegmento",
  ];

  // 2. Para cada tipoDados, exportar todas as linhas
  for (const tipo of tipos) {
    console.log(`\nExportando: ${tipo}`);

    // Pegar uma amostra para descobrir os headers do JSON
    const sampleSql = "SELECT `dadosLinha` FROM bc_dados_linha WHERE `tipoDados` = '" + esc(tipo) + "' LIMIT 1";
    const sampleResult = await db.execute(sampleSql);
    const sampleRows = sampleResult[0] as any[];
    if (sampleRows.length === 0) {
      console.log(`  Sem dados para ${tipo}, pulando.`);
      continue;
    }

    const sampleData = JSON.parse(sampleRows[0].dadosLinha) as Record<string, string>;
    const jsonHeaders = Object.keys(sampleData);
    const allHeaders = [...fixedHeaders, ...jsonHeaders.filter((h) => !fixedHeaders.includes(h))];

    // Contar total de linhas
    const countSql = "SELECT COUNT(*) as total FROM bc_dados_linha WHERE `tipoDados` = '" + esc(tipo) + "'";
    const countResult = await db.execute(countSql);
    const total = Number((countResult[0] as any[])[0].total);
    console.log(`  Total de linhas: ${total}`);

    // Nome do arquivo
    const safeFilename = tipo.replace(/[^a-zA-Z0-9_]/g, "_");
    const filepath = path.join(OUTPUT_DIR, safeFilename + ".csv");

    const writeStream = fs.createWriteStream(filepath, { encoding: "utf8" });
    writeStream.write("\uFEFF"); // BOM para Excel UTF-8
    writeStream.write(allHeaders.join(";") + "\n");

    let offset = 0;
    let written = 0;

    while (offset < total) {
      const batchSql = "SELECT `dataBase`, `baseOrigem`, `tipoDados`, `nomeArquivoOriginal`, `cnpjAdministradora`, `nomeAdministradora`, `codigoSegmento`, `dadosLinha` FROM bc_dados_linha WHERE `tipoDados` = '" + esc(tipo) + "' ORDER BY `id` LIMIT " + BATCH_SIZE + " OFFSET " + offset;
      const batchResult = await db.execute(batchSql);
      const batchRows = batchResult[0] as any[];

      if (batchRows.length === 0) break;

      for (const row of batchRows) {
        let dadosLinha: Record<string, string>;
        try {
          dadosLinha = JSON.parse(row.dadosLinha) as Record<string, string>;
        } catch {
          dadosLinha = {};
        }

        const combined: Record<string, string> = {
          dataBase: row.dataBase,
          baseOrigem: row.baseOrigem,
          tipoDados: row.tipoDados,
          nomeArquivoOriginal: row.nomeArquivoOriginal,
          cnpjAdministradora: row.cnpjAdministradora,
          nomeAdministradora: row.nomeAdministradora,
          codigoSegmento: row.codigoSegmento,
        };

        for (const h of jsonHeaders) {
          combined[h] = dadosLinha[h] ?? "";
        }

        writeStream.write(rowToCsvLine(combined, allHeaders) + "\n");
      }

      written += batchRows.length;
      offset += BATCH_SIZE;

      if (written % 10000 === 0 || written >= total) {
        console.log(`  Progresso: ${written}/${total} (${Math.round((written / total) * 100)}%)`);
      }
    }

    writeStream.end();
    await new Promise<void>((resolve) => writeStream.on("finish", resolve));

    const fileSizeMB = (fs.statSync(filepath).size / (1024 * 1024)).toFixed(2);
    console.log(`  Arquivo: ${filepath} (${fileSizeMB} MB, ${written} linhas)`);
  }

  console.log("\nExportacao concluida!");
  console.log(`Arquivos em: ${OUTPUT_DIR}`);

  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".csv"));
  console.log("\nArquivos gerados:");
  for (const f of files) {
    const size = (fs.statSync(path.join(OUTPUT_DIR, f)).size / (1024 * 1024)).toFixed(2);
    console.log(`  ${f} (${size} MB)`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("Erro na exportacao:", e);
  process.exit(1);
});
