/**
 * FASE 6: Orquestrador de Ingestão de Dados do BC
 * Coordena todo o fluxo para as duas bases oficiais aprovadas:
 * 1. Download → 2. Validação → 3. Extração → 4. Parse → 5. Importação → 6. Registro
 * Modelo linha a linha: 1 linha CSV = 1 linha no banco (Alternativa A)
 */

import * as fs from "fs";
import * as path from "path";
import {
  createImportacao,
  findImportacaoByHash,
  updateImportacaoStatus,
  createArquivo,
  createDadosLinhaBatch,
} from "./db";
import {
  downloadZipFile,
  calculateFileHash,
  isZipAlreadyImported,
  ensureStorageDir,
  getAvailableBCZips,
  type BCZipFile,
} from "./downloader";
import { extractZipFile, validateZipIntegrity } from "./extractor";
import { parseCSVFile, parseXLSXFile, validateParsedData } from "./parser";
import type { InsertBcDadosLinha } from "../../../drizzle/schema";

const STORAGE_DIR = "/storage/banco-central";

/**
 * Interface para resultado da importação completa
 */
export interface ImportacaoResult {
  success: boolean;
  importacaoId?: number;
  dataBase?: string;
  baseOrigem?: string;
  arquivosProcessados?: number;
  linhasImportadas?: number;
  erros?: string[];
  logs?: string[];
}

/**
 * Extrair campos comuns da linha CSV para colunas individuais
 * Campos comuns a todos os arquivos: CNPJ, Nome, Data_base, Código_do_segmento
 */
function extractCommonFields(row: Record<string, string>): {
  cnpjAdministradora: string;
  nomeAdministradora: string;
  codigoSegmento: string;
} {
  // CNPJ: presente em todos os arquivos como "CNPJ_da_Administradora"
  const cnpjAdministradora = (row["CNPJ_da_Administradora"] || row["#CNPJ_da_Administradora"] || "").trim();

  // Nome: presente em todos os arquivos como "Nome_da_Administradora" (pode ter prefixo #)
  const nomeAdministradora = (row["Nome_da_Administradora"] || row["#Nome_da_Administradora"] || "").trim();

  // Código do segmento: presente em todos os arquivos como "Código_do_segmento"
  const codigoSegmento = (row["Código_do_segmento"] || row["#Código_do_segmento"] || "").trim();

  return { cnpjAdministradora, nomeAdministradora, codigoSegmento };
}

/**
 * Executar fluxo completo de importação de um ZIP
 */
export async function executeFullImportFlow(
  zipFile: BCZipFile,
): Promise<ImportacaoResult> {
  const logs: string[] = [];
  const erros: string[] = [];

  try {
    logs.push(`[START] Processing ZIP: ${zipFile.filename} (base: ${zipFile.baseOrigem})`);

    ensureStorageDir();

    // ETAPA 1: Download
    logs.push(`[DOWNLOAD] Starting download from: ${zipFile.url}`);
    const outputPath = path.join(STORAGE_DIR, zipFile.filename);

    let filePath = outputPath;
    if (!fs.existsSync(outputPath)) {
      try {
        filePath = await downloadZipFile(zipFile.url, outputPath);
        logs.push(`[DOWNLOAD] Successfully downloaded to: ${filePath}`);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        erros.push(`Download failed: ${errorMsg}`);
        return { success: false, erros, logs };
      }
    } else {
      logs.push(`[DOWNLOAD] File already exists locally: ${filePath}`);
    }

    // ETAPA 2: Validação de integridade
    logs.push(`[VALIDATE] Checking ZIP integrity`);
    const validation = await validateZipIntegrity(filePath);
    if (!validation.valid) {
      erros.push(`ZIP validation failed: ${validation.error}`);
      return { success: false, erros, logs };
    }
    logs.push(`[VALIDATE] ZIP is valid`);

    // ETAPA 3: Calcular hash e verificar duplicatas
    logs.push(`[HASH] Calculating file hash`);
    const hash = await calculateFileHash(filePath);
    logs.push(`[HASH] SHA-256: ${hash}`);

    const alreadyImported = await isZipAlreadyImported(
      filePath,
      findImportacaoByHash,
    );
    if (alreadyImported) {
      erros.push(`ZIP already imported (duplicate): ${zipFile.filename}`);
      return { success: false, erros, logs };
    }
    logs.push(`[HASH] No duplicates found`);

    // ETAPA 4: Criar registro de importação
    logs.push(`[DB] Creating import record`);
    const dataBase = zipFile.dataBase;
    const importResult = await createImportacao({
      dataBase,
      nomeZip: zipFile.filename,
      hashArquivo: hash,
      baseOrigem: zipFile.baseOrigem,
      status: "pendente",
      logs: logs.join("\n"),
    });

    const importacaoId: number = importResult;
    logs.push(`[DB] Import record created: ID ${importacaoId}`);

    // ETAPA 5: Extrair arquivos
    logs.push(`[EXTRACT] Extracting ZIP contents`);
    const extractResult = await extractZipFile(filePath, dataBase);
    if (!extractResult.success) {
      erros.push(`Extraction failed: ${extractResult.error}`);
      await updateImportacaoStatus(
        importacaoId,
        "erro",
        logs.join("\n") + "\n" + erros.join("\n"),
      );
      return { success: false, importacaoId, erros, logs };
    }

    const extractedFiles = extractResult.files || [];
    logs.push(`[EXTRACT] Successfully extracted ${extractedFiles.length} files`);

    // ETAPA 6: Registrar arquivos extraídos
    logs.push(`[DB] Registering extracted files`);
    for (const file of extractedFiles) {
      await createArquivo({
        importacaoId,
        nomeArquivo: file.name,
        tipoArquivo: file.type,
        dataBase,
        caminhoArmazenado: file.path,
      });
    }
    logs.push(`[DB] Registered ${extractedFiles.length} files`);

    // ETAPA 7: Parsear e importar dados (linha a linha)
    logs.push(`[PARSE] Parsing data files (linha a linha)`);
    let totalLinhasImportadas = 0;

    for (const file of extractedFiles) {
      logs.push(`[PARSE] Processing: ${file.name}`);

      let parseResult;
      if (file.type === "csv") {
        parseResult = await parseCSVFile(file.path);
      } else if (file.type === "xlsx") {
        parseResult = await parseXLSXFile(file.path);
      } else {
        logs.push(`[PARSE] Skipping unsupported file type: ${file.type}`);
        continue;
      }

      if (!parseResult.success) {
        erros.push(`Failed to parse ${file.name}: ${parseResult.error}`);
        logs.push(`[PARSE] ERROR: ${parseResult.error}`);
        continue;
      }

      // Validar dados
      if (parseResult.data && parseResult.data.length > 0) {
        const validation = validateParsedData(
          parseResult.data,
          parseResult.tipoDados,
        );
        if (!validation.valid) {
          erros.push(
            `Validation failed for ${file.name}: ${validation.errors.join(", ")}`,
          );
          logs.push(`[PARSE] VALIDATION ERROR: ${validation.errors.join(", ")}`);
          continue;
        }
      }

      // MODELO LINHA A LINHA: cada linha do CSV = 1 linha no banco
      const allData = parseResult.data || [];
      if (allData.length === 0) {
        logs.push(`[PARSE] No data rows for ${parseResult.tipoDados}, skipping`);
        continue;
      }

      const headersJson = parseResult.headers
        ? JSON.stringify(parseResult.headers)
        : null;

      // Construir array de InsertBcDadosLinha (1 por linha CSV)
      const rowsToInsert: InsertBcDadosLinha[] = allData.map((csvRow) => {
        const common = extractCommonFields(csvRow);
        return {
          importacaoId,
          dataBase,
          baseOrigem: zipFile.baseOrigem,
          tipoDados: parseResult.tipoDados,
          nomeArquivoOriginal: file.name,
          cnpjAdministradora: common.cnpjAdministradora,
          nomeAdministradora: common.nomeAdministradora,
          codigoSegmento: common.codigoSegmento,
          dadosLinha: JSON.stringify(csvRow),
          cabecalhosOriginais: headersJson,
        };
      });

      logs.push(
        `[PARSE] Inserting ${rowsToInsert.length} rows for ${parseResult.tipoDados}`,
      );

      const insertedCount = await createDadosLinhaBatch(rowsToInsert);
      logs.push(`[PARSE] Inserted ${insertedCount} rows for ${parseResult.tipoDados}`);

      totalLinhasImportadas += insertedCount;
    }

    logs.push(`[PARSE] Total rows imported: ${totalLinhasImportadas}`);

    // ETAPA 8: Atualizar status para sucesso
    logs.push(`[COMPLETE] Import completed successfully`);
    await updateImportacaoStatus(
      importacaoId,
      "sucesso",
      logs.join("\n"),
      extractedFiles.length,
      totalLinhasImportadas,
    );

    return {
      success: true,
      importacaoId,
      dataBase,
      baseOrigem: zipFile.baseOrigem,
      arquivosProcessados: extractedFiles.length,
      linhasImportadas: totalLinhasImportadas,
      logs,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    erros.push(`Unexpected error: ${errorMsg}`);
    logs.push(`[ERROR] ${errorMsg}`);

    return { success: false, erros, logs };
  }
}

/**
 * Processar todos os ZIPs dos últimos 24 meses das duas bases oficiais
 */
export async function processAllNewZips(): Promise<ImportacaoResult[]> {
  const results: ImportacaoResult[] = [];

  try {
    const allZips = getAvailableBCZips(24);

    console.log(`[CRON] Found ${allZips.length} ZIPs to process (24 months)`);

    for (const zipFile of allZips) {
      const result = await executeFullImportFlow(zipFile);
      results.push(result);

      if (!result.success) {
        const isDuplicate =
          result.erros?.some((e) => e.includes("duplicate")) ||
          result.erros?.some((e) => e.includes("already imported"));
        const isNotFound =
          result.erros?.some((e) => e.includes("Download failed"));

        if (isDuplicate) {
          console.log(`[CRON] Skipped duplicate: ${zipFile.filename}`);
        } else if (isNotFound) {
          console.log(`[CRON] Not available yet: ${zipFile.filename}`);
        } else {
          console.error(
            `[CRON] Failed to import ${zipFile.filename}:`,
            result.erros,
          );
        }
      } else {
        console.log(
          `[CRON] Successfully imported ${zipFile.filename}: ${result.linhasImportadas} rows`,
        );
      }
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    console.error(`[CRON] Error in processAllNewZips: ${errorMsg}`);
  }

  return results;
}
