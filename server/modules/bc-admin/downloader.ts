/**
 * FASE 6: Downloader de arquivos ZIP do Banco Central
 * Implementa descoberta determinística dos últimos 24 meses para:
 * - Dados Consolidados (padrão: AAAAMMConsorcios.zip, mensal)
 * - Dados por UF (padrão: AAAAMMConsorcios_UF.zip, trimestral: mar/jun/set/dez)
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { createReadStream } from "fs";

const BC_BASE_URL = "https://www.bcb.gov.br";
const BC_DOWNLOAD_PATH = "/Fis/Consorcios/Port/BD";
const STORAGE_DIR = "/storage/banco-central";

/**
 * Base de origem oficial do Banco Central
 */
export type BaseOrigem = "consolidados" | "dados_uf";

/**
 * Interface para arquivo ZIP do BC
 */
export interface BCZipFile {
  url: string;
  filename: string;
  dataBase: string; // formato YYYY-MM
  baseOrigem: BaseOrigem;
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
 * Fazer download de um arquivo ZIP do BC
 */
export async function downloadZipFile(
  url: string,
  outputPath: string,
): Promise<string> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status} for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

/**
 * Extrair data-base (YYYY-MM) a partir do nome do ZIP oficial
 * Suporta padrões: 202605Consorcios.zip e 202603Consorcios_UF.zip
 */
export function extractDataBaseFromZipName(filename: string): string | null {
  const match = filename.match(/^(\d{4})(\d{2})Consorcios(?:_UF)?\.zip$/i);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

/**
 * Detectar base de origem a partir do nome do arquivo
 */
export function detectBaseOrigem(filename: string): BaseOrigem {
  if (/Consorcios_UF\.zip$/i.test(filename)) {
    return "dados_uf";
  }
  return "consolidados";
}

/**
 * Verificar se um ZIP já foi importado (por hash)
 */
export async function isZipAlreadyImported(
  filePath: string,
  findImportacaoByHashFn: (hash: string) => Promise<any>,
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
 * Gerar lista determinística de ZIPs de Dados Consolidados dos últimos N meses
 * Disponibilidade: mensal (todos os meses)
 */
function generateConsolidadosZipList(monthsBack: number): BCZipFile[] {
  const zips: BCZipFile[] = [];
  const now = new Date();
  // Usar o mês anterior como referência (o BC publica com defasagem de ~2 meses)
  const refDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  for (let i = 0; i < monthsBack; i++) {
    const date = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const yyyymm = `${year}${month}`;
    const filename = `${yyyymm}Consorcios.zip`;
    const dataBase = `${year}-${month}`;

    zips.push({
      url: `${BC_BASE_URL}${BC_DOWNLOAD_PATH}/${filename}`,
      filename,
      dataBase,
      baseOrigem: "consolidados",
    });
  }

  return zips;
}

/**
 * Gerar lista determinística de ZIPs de Dados por UF dos últimos N meses
 * Disponibilidade: trimestral (março, junho, setembro, dezembro)
 */
function generateDadosUfZipList(monthsBack: number): BCZipFile[] {
  const zips: BCZipFile[] = [];
  const now = new Date();
  const refDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const trimestralMonths = [2, 5, 8, 11]; // 0-indexed: mar=2, jun=5, set=8, dez=11

  for (let i = 0; i < monthsBack; i++) {
    const date = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const month = date.getMonth();

    if (trimestralMonths.includes(month)) {
      const year = date.getFullYear();
      const monthStr = String(month + 1).padStart(2, "0");
      const yyyymm = `${year}${monthStr}`;
      const filename = `${yyyymm}Consorcios_UF.zip`;
      const dataBase = `${year}-${monthStr}`;

      zips.push({
        url: `${BC_BASE_URL}${BC_DOWNLOAD_PATH}/${filename}`,
        filename,
        dataBase,
        baseOrigem: "dados_uf",
      });
    }
  }

  return zips;
}

/**
 * Obter lista de todos os ZIPs disponíveis dos últimos 24 meses
 * Inclui Dados Consolidados (mensal) e Dados por UF (trimestral)
 */
export function getAvailableBCZips(monthsBack: number = 24): BCZipFile[] {
  const consolidados = generateConsolidadosZipList(monthsBack);
  const dadosUf = generateDadosUfZipList(monthsBack);
  return [...consolidados, ...dadosUf];
}

/**
 * Obter lista de ZIPs de Dados Consolidados dos últimos N meses
 */
export function getConsolidadosZips(monthsBack: number = 24): BCZipFile[] {
  return generateConsolidadosZipList(monthsBack);
}

/**
 * Obter lista de ZIPs de Dados por UF dos últimos N meses
 */
export function getDadosUfZips(monthsBack: number = 24): BCZipFile[] {
  return generateDadosUfZipList(monthsBack);
}

/**
 * Processar download de um novo ZIP
 * Retorna: { success, filePath, hash, dataBase, error }
 */
export async function processNewZip(
  zipFile: BCZipFile,
  findImportacaoByHashFn: (hash: string) => Promise<any>,
): Promise<{
  success: boolean;
  filePath?: string;
  hash?: string;
  dataBase?: string;
  error?: string;
}> {
  try {
    ensureStorageDir();

    const outputPath = path.join(STORAGE_DIR, zipFile.filename);

    if (fs.existsSync(outputPath)) {
      const hash = await calculateFileHash(outputPath);
      const alreadyImported = await isZipAlreadyImported(
        outputPath,
        findImportacaoByHashFn,
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

    console.log(`Downloading ZIP: ${zipFile.filename}`);
    const downloadedPath = await downloadZipFile(zipFile.url, outputPath);
    const hash = await calculateFileHash(downloadedPath);

    const alreadyImported = await isZipAlreadyImported(
      downloadedPath,
      findImportacaoByHashFn,
    );
    if (alreadyImported) {
      fs.unlinkSync(downloadedPath);
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
