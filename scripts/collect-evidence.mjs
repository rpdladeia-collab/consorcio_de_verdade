/**
 * Script para coletar as 12 evidências obrigatórias da importação
 */
import { getDb } from "../server/db.ts";

async function main() {
  const db = await getDb();
  if (!db) { console.log("DB not available"); process.exit(1); }

  const queries = [
    ["E1_TOTAL_IMPORTACOES", "SELECT COUNT(*) as total, SUM(CASE WHEN status='sucesso' THEN 1 ELSE 0 END) as sucessos, SUM(CASE WHEN status='erro' THEN 1 ELSE 0 END) as erros FROM bc_importacoes"],
    ["E2_POR_BASE", "SELECT baseOrigem, COUNT(*) as qtd FROM bc_importacoes WHERE status='sucesso' GROUP BY baseOrigem"],
    ["E3_DATAS_BASE", "SELECT dataBase, baseOrigem, quantidadeLinhasImportadas FROM bc_importacoes WHERE status='sucesso' ORDER BY dataBase"],
    ["E4_TOTAL_LINHAS", "SELECT COUNT(*) as total FROM bc_dados_linha"],
    ["E5_LINHAS_POR_BASE", "SELECT baseOrigem, COUNT(*) as qtd FROM bc_dados_linha GROUP BY baseOrigem"],
    ["E6_LINHAS_POR_TIPO", "SELECT tipoDados, COUNT(*) as qtd FROM bc_dados_linha GROUP BY tipoDados ORDER BY qtd DESC"],
    ["E7_TOTAL_ARQUIVOS", "SELECT COUNT(*) as total FROM bc_arquivos"],
    ["E8_ARQUIVOS_POR_TIPO", "SELECT tipoArquivo, COUNT(*) as qtd FROM bc_arquivos GROUP BY tipoArquivo"],
    ["E9_CNPJS_UNICOS", "SELECT COUNT(DISTINCT cnpjAdministradora) as total FROM bc_dados_linha"],
    ["E10_CNPJS_POR_BASE", "SELECT baseOrigem, COUNT(DISTINCT cnpjAdministradora) as qtd FROM bc_dados_linha GROUP BY baseOrigem"],
    ["E11_INTERSECAO_CNPJ", "SELECT COUNT(DISTINCT a.cnpjAdministradora) as intersecao FROM bc_dados_linha a INNER JOIN bc_dados_linha b ON a.cnpjAdministradora = b.cnpjAdministradora WHERE a.baseOrigem = 'consolidados' AND b.baseOrigem = 'dados_uf'"],
    ["E12_NOMES_UNICOS", "SELECT COUNT(DISTINCT nomeAdministradora) as total FROM bc_dados_linha"],
    ["E13_TRIMESTRAIS_BENS_MOVEIS", "SELECT dataBase, COUNT(*) as qtd FROM bc_dados_linha WHERE tipoDados = 'bens_moveis_grupos' GROUP BY dataBase ORDER BY dataBase"],
    ["E14_DADOS_UF", "SELECT dataBase, COUNT(*) as qtd FROM bc_dados_linha WHERE baseOrigem = 'dados_uf' GROUP BY dataBase ORDER BY dataBase"],
    ["E15_OLD_TABLE", "SELECT COUNT(*) as total FROM bc_dados_mensais"],
    ["E16_HASHES", "SELECT COUNT(DISTINCT hashArquivo) as hashes_unicos, COUNT(*) as total_importacoes FROM bc_importacoes"],
    ["E17_SEGMENTOS_MENSAL", "SELECT dataBase, COUNT(*) as qtd FROM bc_dados_linha WHERE tipoDados = 'segmentos_consolidados' GROUP BY dataBase ORDER BY dataBase"],
    ["E18_BENS_IMOVEIS", "SELECT dataBase, COUNT(*) as qtd FROM bc_dados_linha WHERE tipoDados = 'bens_imoveis_grupos' GROUP BY dataBase ORDER BY dataBase"],
  ];

  for (const [label, sql] of queries) {
    try {
      const result = await db.execute(sql);
      const rows = Array.isArray(result) ? result[0] : result;
      console.log(`${label}: ${JSON.stringify(rows)}`);
    } catch (e) {
      console.log(`${label}: ERROR - ${e.message}`);
    }
  }

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
