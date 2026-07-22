/**
 * FASE 1: Downloader Automático do Banco Central
 * Responsável por:
 * 1. Acessar página do BC
 * 2. Detectar novos ZIPs
 * 3. Verificar duplicatas (por hash)
 * 4. Fazer download automático
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as crypto from "crypto";
import { createReadStream } from "fs";

const BC_URL = "https://www.bcb.gov.br/estabilidadefinanceira/consorciobd";
const STORAGE_DIR = "/storage/banco-central";

/**
 * Interface para representar um arquivo ZIP disponível no BC
 */
export interface BCZipFile {
  url: string;
  filename: string;
  dataBase: string; // YYYY-MM
}

/**
 * Garantir que o diretório de armazenamento existe
 */
export function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Calcular hash SHA-256 de um arquivo
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

/**
 * Fazer download de um arquivo ZIP
 * Retorna o caminho local do arquivo
 */
export async function downloadZipFile(
  url: string,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    https
      .get(url, (response) => {
        // Verificar se o download foi bem-sucedido
        if (response.statusCode !== 200) {
          fs.unlink(outputPath, () => {}); // Limpar arquivo parcial
          reject(
            new Error(
              `Download failed with status ${response.statusCode}: ${url}`
            )
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(outputPath);
        });

        file.on("error", (err) => {
          fs.unlink(outputPath, () => {}); // Limpar arquivo parcial
          reject(err);
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath, () => {}); // Limpar arquivo parcial
        reject(err);
      });
  });
}

/**
 * Extrair data-base do nome do arquivo ZIP
 * Ex: 202607.zip → 2026-07
 */
export function extractDataBaseFromZipName(zipName: string): string {
  // Remover extensão .zip
  const nameWithoutExt = zipName.replace(/\.zip$/i, "");

  // Extrair YYYYMM (últimos 6 dígitos)
  const match = nameWithoutExt.match(/(\d{6})$/);
  if (!match) {
    throw new Error(`Cannot extract date from ZIP name: ${zipName}`);
  }

  const yyyymm = match[1];
  const year = yyyymm.substring(0, 4);
  const month = yyyymm.substring(4, 6);

  return `${year}-${month}`;
}

/**
 * Verificar se um arquivo ZIP já foi importado (por hash)
 */
export async function isZipAlreadyImported(
  filePath: string,
  findImportacaoByHashFn: (hash: string) => Promise<any>
): Promise<boolean> {
  try {
    const hash = await calculateFileHash(filePath);
    const existing = await findImportacaoByHashFn(hash);
    return !!existing;
  } catch (error) {
    console.error("Error checking if ZIP is already imported:", error);
    return false;
  }
}

/**
 * Obter lista de ZIPs disponíveis no BC
 * NOTA: Esta é uma implementação simplificada
 * Em produção, seria necessário fazer scraping da página do BC
 * ou usar uma API se disponível
 */
export async function getAvailableBCZips(): Promise<BCZipFile[]> {
  // TODO: Implementar scraping ou integração com API do BC
  // Por enquanto, retorna array vazio
  // Este método será chamado pelo cron para detectar novos arquivos

  console.log(`Fetching available ZIPs from BC: ${BC_URL}`);

  // Placeholder: em produção, fazer scraping da página
  // e retornar lista de ZIPs disponíveis
  return [];
}

/**
 * Processar download de um novo ZIP
 * Retorna: { success, filePath, hash, dataBase, error }
 */
export async function processNewZip(
  zipFile: BCZipFile,
  findImportacaoByHashFn: (hash: string) => Promise<any>
): Promise<{
  success: boolean;
  filePath?: string;
  hash?: string;
  dataBase?: string;
  error?: string;
}> {
  try {
    ensureStorageDir();

    // Caminho onde o ZIP será armazenado
    const outputPath = path.join(STORAGE_DIR, zipFile.filename);

    // Verificar se o arquivo já existe localmente
    if (fs.existsSync(outputPath)) {
      const hash = await calculateFileHash(outputPath);

      // Verificar se já foi importado
      const alreadyImported = await isZipAlreadyImported(
        outputPath,
        findImportacaoByHashFn
      );
      if (alreadyImported) {
        return {
          success: false,
          error: `ZIP already imported: ${zipFile.filename}`,
        };
      }

      return {
        success: true,
        filePath: outputPath,
        hash,
        dataBase: zipFile.dataBase,
      };
    }

    // Fazer download do arquivo
    console.log(`Downloading ZIP: ${zipFile.filename}`);
    const downloadedPath = await downloadZipFile(zipFile.url, outputPath);

    // Calcular hash do arquivo baixado
    const hash = await calculateFileHash(downloadedPath);

    // Verificar se já foi importado (por hash)
    const alreadyImported = await isZipAlreadyImported(
      downloadedPath,
      findImportacaoByHashFn
    );
    if (alreadyImported) {
      fs.unlinkSync(downloadedPath); // Remover arquivo duplicado
      return {
        success: false,
        error: `ZIP already imported (duplicate hash): ${zipFile.filename}`,
      };
    }

    return {
      success: true,
      filePath: downloadedPath,
      hash,
      dataBase: zipFile.dataBase,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to process ZIP: ${errorMessage}`,
    };
  }
}
