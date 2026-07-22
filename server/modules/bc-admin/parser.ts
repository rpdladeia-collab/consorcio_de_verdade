/**
 * FASE 1: Parser de Dados do Banco Central
 * Responsável por:
 * 1. Ler arquivos CSV
 * 2. Converter para JSON (preservando estrutura original)
 * 3. Validar campos obrigatórios
 * 4. Armazenar dados brutos no banco
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Interface para resultado do parse
 */
export interface ParseResult {
  success: boolean;
  tipoDados: string; // tipo de dados (ex: segmentos_consolidados, bens_imoveis_grupos)
  rowCount: number;
  data?: Record<string, any>[]; // dados parseados
  error?: string;
}

/**
 * Ler e parsear arquivo CSV
 * Retorna dados como array de objetos (sem transformação)
 */
export async function parseCSVFile(filePath: string): Promise<ParseResult> {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        tipoDados: "",
        rowCount: 0,
        error: `File not found: ${filePath}`,
      };
    }

    // Validar extensão
    if (!filePath.endsWith(".csv")) {
      return {
        success: false,
        tipoDados: "",
        rowCount: 0,
        error: `Not a CSV file: ${filePath}`,
      };
    }

    // Ler arquivo
    const content = fs.readFileSync(filePath, "utf-8");

    // Detectar tipo de dados pelo nome do arquivo
    const fileName = path.basename(filePath);
    const tipoDados = extractTipoDados(fileName);

    // Parsear CSV
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return {
        success: false,
        tipoDados,
        rowCount: 0,
        error: "CSV file is empty or has no data rows",
      };
    }

    // Primeira linha = headers
    const headers = parseCSVLine(lines[0]);

    if (headers.length === 0) {
      return {
        success: false,
        tipoDados,
        rowCount: 0,
        error: "CSV file has no headers",
      };
    }

    // Parsear dados
    const data: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length === 0) {
        continue; // Ignorar linhas vazias
      }

      // Criar objeto com headers como chaves
      const row: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || null;
      }

      data.push(row);
    }

    return {
      success: true,
      tipoDados,
      rowCount: data.length,
      data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      tipoDados: "",
      rowCount: 0,
      error: `Error parsing CSV: ${errorMessage}`,
    };
  }
}

/**
 * Parsear linha CSV (com suporte a semicolons e aspas)
 * O BC usa semicolons como separador
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if ((char === ";" || char === ",") && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Extrair tipo de dados do nome do arquivo
 * Ex: 202607Segmentos_Consolidados.csv → segmentos_consolidados
 */
function extractTipoDados(fileName: string): string {
  // Remover extensão
  const nameWithoutExt = fileName.replace(/\.csv$/i, "");

  // Remover prefixo de data (ex: 202607)
  const withoutDate = nameWithoutExt.replace(/^\d{6}/, "");

  // Converter para snake_case e lowercase
  return withoutDate
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/_+/g, "_"); // Remover underscores duplicados
}

/**
 * Validar dados parseados
 * Verifica campos obrigatórios e tipos
 */
export function validateParsedData(
  data: Record<string, any>[],
  tipoDados: string
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    errors.push("No data rows found");
    return { valid: false, errors };
  }

  // Validações específicas por tipo de dados
  switch (tipoDados) {
    case "segmentos_consolidados":
      // Verificar campos obrigatórios
      const requiredFields = [
        "CNPJ_Administradora",
        "Nome_Administradora",
        "Codigo_Segmento",
      ];
      for (const field of requiredFields) {
        if (!data[0].hasOwnProperty(field)) {
          errors.push(
            `Missing required field: ${field} (segmentos_consolidados)`
          );
        }
      }
      break;

    case "bens_imoveis_grupos":
      // Verificar campos obrigatórios
      const groupFields = ["CNPJ_Administradora", "Codigo_Grupo"];
      for (const field of groupFields) {
        if (!data[0].hasOwnProperty(field)) {
          errors.push(`Missing required field: ${field} (bens_imoveis_grupos)`);
        }
      }
      break;

    default:
      // Validação genérica: verificar se há dados
      if (data.length === 0) {
        errors.push("No data rows found");
      }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ler arquivo XLSX (dicionário de dados)
 * Por enquanto, apenas registra que foi encontrado
 * Implementação completa depende de biblioteca XLSX
 */
export async function parseXLSXFile(filePath: string): Promise<ParseResult> {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        tipoDados: "dicionario",
        rowCount: 0,
        error: `File not found: ${filePath}`,
      };
    }

    // Validar extensão
    if (!filePath.endsWith(".xlsx")) {
      return {
        success: false,
        tipoDados: "dicionario",
        rowCount: 0,
        error: `Not an XLSX file: ${filePath}`,
      };
    }

    // TODO: Implementar parsing de XLSX
    // Por enquanto, apenas registrar que o arquivo foi encontrado
    const stats = fs.statSync(filePath);

    return {
      success: true,
      tipoDados: "dicionario",
      rowCount: 1, // Placeholder
      data: [
        {
          tipo: "dicionario",
          arquivo: path.basename(filePath),
          tamanho: stats.size,
          nota: "XLSX parsing not yet implemented",
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      tipoDados: "dicionario",
      rowCount: 0,
      error: `Error parsing XLSX: ${errorMessage}`,
    };
  }
}
