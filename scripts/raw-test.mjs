import { createRequire } from "module";
const require = createRequire("/home/ubuntu/panorama-bc-web/");
const mysql = require("mysql2/promise");
import { parseCSVFile } from "/home/ubuntu/panorama-bc-web/server/modules/bc-admin/parser.ts";

const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname, port: url.port || 3306,
  user: url.username, password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true },
});

const r = await parseCSVFile("/storage/banco-central/2024-09/202409Bens_Moveis_Grupos.csv");
const json = JSON.stringify(r.data || []);
console.log("JSON_SIZE:", (json.length / 1024 / 1024).toFixed(2), "MB");

// Test 1: Small JSON WITH backticks
try {
  await conn.execute("INSERT INTO `bc_dados_mensais` (`importacaoId`, `dataBase`, `tipoDados`, `nomeArquivoOriginal`, `dadosJson`, `quantidadeLinhas`, `cabecalhosOriginais`) VALUES (?,?,?,?,?,?,?)", [999998, "202409", "test_small", "t.csv", '{"a":1}', 1, '["a"]']);
  console.log("SMALL_BACKTICK: OK");
  await conn.execute("DELETE FROM `bc_dados_mensais` WHERE `tipoDados`='test_small'");
} catch (e) { console.log("SMALL_BACKTICK_ERROR:", e.code, e.message.substring(0,100)); }

// Test 2: Large JSON WITH backticks
try {
  await conn.execute("INSERT INTO `bc_dados_mensais` (`importacaoId`, `dataBase`, `tipoDados`, `nomeArquivoOriginal`, `dadosJson`, `quantidadeLinhas`, `cabecalhosOriginais`) VALUES (?,?,?,?,?,?,?)", [999997, "202409", "test_large", "t.csv", json, r.rowCount, JSON.stringify(r.headers)]);
  console.log("LARGE_BACKTICK: OK");
  await conn.execute("DELETE FROM `bc_dados_mensais` WHERE `tipoDados`='test_large'");
} catch (e) { console.log("LARGE_BACKTICK_ERROR:", e.code, e.errno, e.message.substring(0,200)); }

// Test 3: Medium JSON (1MB) WITH backticks
const mediumJson = JSON.stringify(r.data.slice(0, 1500));
console.log("MEDIUM_SIZE:", (mediumJson.length / 1024).toFixed(0), "KB");
try {
  await conn.execute("INSERT INTO `bc_dados_mensais` (`importacaoId`, `dataBase`, `tipoDados`, `nomeArquivoOriginal`, `dadosJson`, `quantidadeLinhas`, `cabecalhosOriginais`) VALUES (?,?,?,?,?,?,?)", [999996, "202409", "test_medium", "t.csv", mediumJson, 1500, JSON.stringify(r.headers)]);
  console.log("MEDIUM_BACKTICK: OK");
  await conn.execute("DELETE FROM `bc_dados_mensais` WHERE `tipoDados`='test_medium'");
} catch (e) { console.log("MEDIUM_BACKTICK_ERROR:", e.code, e.errno, e.message.substring(0,200)); }

await conn.end();
process.exit(0);
