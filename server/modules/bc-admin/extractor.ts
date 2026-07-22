/**
 * FASE 1: Extrator de Arquivos ZIP
 * Responsável por:
 * 1. Extrair conteúdo do ZIP
 * 2. Armazenar arquivos em disco
 * 3. Registrar metadados dos arquivos
 */

import * as fs from "fs";
import * as path from "path";
import * as unzipper from "unzipper";

const STORAGE_DIR = "/storage/banco-central";

/**
 * Interface para arquivo extraído
 */
export interface ExtractedFile {
  name: string;
  type: string; // csv, xlsx, txt, etc.
  path: string; // caminho completo no disco
  size: number; // tamanho em bytes
}

/**
 * Extrair todos os arquivos de um ZIP
 * Retorna lista de arquivos extraídos e seus metadados
 */
export async function extractZipFile(
  zipPath: string,
  dataBase: string
): Promise<{
  success: boolean;
  files?: ExtractedFile[];
  error?: string;
}> {
  try {
    // Validar se o arquivo ZIP existe
    if (!fs.existsSync(zipPath)) {
      return {
        success: false,
        error: `ZIP file not found: ${zipPath}`,
      };
    }

    // Criar diretório para esta data-base
    const extractDir = path.join(STORAGE_DIR, dataBase);
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    const extractedFiles: ExtractedFile[] = [];

    // Extrair ZIP
    return new Promise((resolve) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Parse())
        .on("entry", (entry) => {
          const fileName = entry.path;
          const type = getFileType(fileName);

          // Ignorar diretórios
          if (entry.type === "Directory") {
            entry.autodrain();
            return;
          }

          // Caminho completo onde o arquivo será salvo
          const filePath = path.join(extractDir, fileName);

          // Garantir que o diretório pai existe
          const fileDir = path.dirname(filePath);
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }

          // Escrever arquivo no disco
          const writeStream = fs.createWriteStream(filePath);

          entry.pipe(writeStream);

          writeStream.on("finish", () => {
            const stats = fs.statSync(filePath);
            extractedFiles.push({
              name: fileName,
              type,
              path: filePath,
              size: stats.size,
            });
          });

          writeStream.on("error", (error) => {
            console.error(`Error writing file ${fileName}:`, error);
          });
        })
        .on("error", (error) => {
          resolve({
            success: false,
            error: `Failed to extract ZIP: ${error.message}`,
          });
        })
        .on("close", () => {
          if (extractedFiles.length === 0) {
            resolve({
              success: false,
              error: "No files extracted from ZIP",
            });
          } else {
            resolve({
              success: true,
              files: extractedFiles,
            });
          }
        });
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error extracting ZIP: ${errorMessage}`,
    };
  }
}

/**
 * Obter tipo de arquivo pela extensão
 */
function getFileType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase().replace(".", "");
  return ext || "unknown";
}

/**
 * Validar integridade do ZIP
 */
export async function validateZipIntegrity(zipPath: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    if (!fs.existsSync(zipPath)) {
      return {
        valid: false,
        error: "ZIP file not found",
      };
    }

    // Tentar ler o ZIP para validar
    return new Promise((resolve) => {
      let isValid = true;
      let errorMsg: string | undefined;

      fs.createReadStream(zipPath)
        .pipe(unzipper.Parse())
        .on("error", (error) => {
          isValid = false;
          errorMsg = `ZIP corrupted: ${error.message}`;
        })
        .on("close", () => {
          if (isValid) {
            resolve({ valid: true });
          } else {
            resolve({ valid: false, error: errorMsg });
          }
        });
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      error: `Error validating ZIP: ${errorMessage}`,
    };
  }
}

/**
 * Listar arquivos em um diretório de data-base
 */
export function listExtractedFiles(dataBase: string): ExtractedFile[] {
  const extractDir = path.join(STORAGE_DIR, dataBase);

  if (!fs.existsSync(extractDir)) {
    return [];
  }

  const files: ExtractedFile[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        files.push({
          name: entry.name,
          type: getFileType(entry.name),
          path: fullPath,
          size: stats.size,
        });
      }
    }
  }

  walkDir(extractDir);
  return files;
}
