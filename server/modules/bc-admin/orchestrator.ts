/**
 * FASE 1: Orquestrador de Ingestão de Dados do BC
 * Coordena todo o fluxo:
 * 1. Download → 2. Validação → 3. Armazenamento ZIP → 4. Extração → 5. Importação → 6. Registro
 */

import * as fs from "fs";
import * as path from "path";
import {
  createImportacao,
  findImportacaoByHash,
  updateImportacaoStatus,
  createArquivo,
  createDadosMensal,
} from "./db";
import {
  downloadZipFile,
  calculateFileHash,
  extractDataBaseFromZipName,
  isZipAlreadyImported,
  ensureStorageDir,
  BCZipFile,
} from "./downloader";
import { extractZipFile, validateZipIntegrity, listExtractedFiles } from "./extractor";
import { parseCSVFile, parseXLSXFile, validateParsedData } from "./parser";

const STORAGE_DIR = "/storage/banco-central";

/**
 * Interface para resultado da importação completa
 */
export interface ImportacaoResult {
  success: boolean;
  importacaoId?: number;
  dataBase?: string;
  arquivosProcessados?: number;
  linhasImportadas?: number;
  erros?: string[];
  logs?: string[];
}

/**
 * Executar fluxo completo de importação de um ZIP
 */
export async function executeFullImportFlow(
  zipFile: BCZipFile
): Promise<ImportacaoResult> {
  const logs: string[] = [];
  const erros: string[] = [];

  try {
    logs.push(`[START] Processing ZIP: ${zipFile.filename}`);

    ensureStorageDir();

    // ETAPA 1: Download
    logs.push(`[DOWNLOAD] Starting download from: ${zipFile.url}`);
    const outputPath = path.join(STORAGE_DIR, zipFile.filename);

    // Verificar se já existe localmente
    let filePath = outputPath;
    if (!fs.existsSync(outputPath)) {
      try {
        filePath = await downloadZipFile(zipFile.url, outputPath);
        logs.push(`[DOWNLOAD] Successfully downloaded to: ${filePath}`);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        erros.push(`Download failed: ${errorMsg}`);
        return {
          success: false,
          erros,
          logs,
        };
      }
    } else {
      logs.push(`[DOWNLOAD] File already exists locally: ${filePath}`);
    }

    // ETAPA 2: Validação de integridade
    logs.push(`[VALIDATE] Checking ZIP integrity`);
    const validation = await validateZipIntegrity(filePath);
    if (!validation.valid) {
      erros.push(`ZIP validation failed: ${validation.error}`);
      return {
        success: false,
        erros,
        logs,
      };
    }
    logs.push(`[VALIDATE] ZIP is valid`);

    // ETAPA 3: Calcular hash e verificar duplicatas
    logs.push(`[HASH] Calculating file hash`);
    const hash = await calculateFileHash(filePath);
    logs.push(`[HASH] SHA-256: ${hash}`);

    const alreadyImported = await isZipAlreadyImported(
      filePath,
      findImportacaoByHash
    );
    if (alreadyImported) {
      erros.push(`ZIP already imported (duplicate): ${zipFile.filename}`);
      return {
        success: false,
        erros,
        logs,
      };
    }
    logs.push(`[HASH] No duplicates found`);

    // ETAPA 4: Criar registro de importação
    logs.push(`[DB] Creating import record`);
    const dataBase = zipFile.dataBase;
    const importResult = await createImportacao({
      dataBase,
      nomeZip: zipFile.filename,
      hashArquivo: hash,
      status: "pendente",
      logs: logs.join("\n"),
    });

    const importacaoId = (importResult as any).insertId;
    logs.push(`[DB] Import record created: ID ${importacaoId}`);

    // ETAPA 5: Extrair arquivos
    logs.push(`[EXTRACT] Extracting ZIP contents`);
    const extractResult = await extractZipFile(filePath, dataBase);
    if (!extractResult.success) {
      erros.push(`Extraction failed: ${extractResult.error}`);
      await updateImportacaoStatus(
        importacaoId,
        "erro",
        logs.join("\n") + "\n" + erros.join("\n")
      );
      return {
        success: false,
        importacaoId,
        erros,
        logs,
      };
    }

    const extractedFiles = extractResult.files || [];
    logs.push(
      `[EXTRACT] Successfully extracted ${extractedFiles.length} files`
    );

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

    // ETAPA 7: Parsear e importar dados
    logs.push(`[PARSE] Parsing data files`);
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
          parseResult.tipoDados
        );
        if (!validation.valid) {
          erros.push(
            `Validation failed for ${file.name}: ${validation.errors.join(", ")}`
          );
          logs.push(`[PARSE] VALIDATION ERROR: ${validation.errors.join(", ")}`);
          continue;
        }
      }

      // Armazenar dados em JSON
      logs.push(
        `[PARSE] Storing ${parseResult.rowCount} rows for ${parseResult.tipoDados}`
      );
      await createDadosMensal({
        importacaoId,
        dataBase,
        tipoDados: parseResult.tipoDados,
        dadosJson: JSON.stringify(parseResult.data || []),
      });

      totalLinhasImportadas += parseResult.rowCount;
    }

    logs.push(`[PARSE] Total rows imported: ${totalLinhasImportadas}`);

    // ETAPA 8: Atualizar status para sucesso
    logs.push(`[COMPLETE] Import completed successfully`);
    await updateImportacaoStatus(
      importacaoId,
      "sucesso",
      logs.join("\n"),
      extractedFiles.length
    );

    return {
      success: true,
      importacaoId,
      dataBase,
      arquivosProcessados: extractedFiles.length,
      linhasImportadas: totalLinhasImportadas,
      logs,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    erros.push(`Unexpected error: ${errorMsg}`);
    logs.push(`[ERROR] ${errorMsg}`);

    return {
      success: false,
      erros,
      logs,
    };
  }
}

/**
 * Verificar se há novos ZIPs disponíveis no BC
 * NOTA: Esta função será chamada pelo cron
 */
export async function checkForNewZips(): Promise<BCZipFile[]> {
  // TODO: Implementar scraping ou integração com API do BC
  // Por enquanto, retorna array vazio
  return [];
}

/**
 * Processar todos os ZIPs novos disponíveis
 */
export async function processAllNewZips(): Promise<ImportacaoResult[]> {
  const results: ImportacaoResult[] = [];

  try {
    const newZips = await checkForNewZips();

    if (newZips.length === 0) {
      console.log("[CRON] No new ZIPs found");
      return results;
    }

    console.log(`[CRON] Found ${newZips.length} new ZIPs`);

    for (const zipFile of newZips) {
      const result = await executeFullImportFlow(zipFile);
      results.push(result);

      if (!result.success) {
        console.error(`[CRON] Failed to import ${zipFile.filename}:`, result.erros);
      } else {
        console.log(
          `[CRON] Successfully imported ${zipFile.filename}: ${result.linhasImportadas} rows`
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
