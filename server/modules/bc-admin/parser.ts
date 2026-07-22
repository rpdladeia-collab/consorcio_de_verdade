/**
 * FASE 6: Parser de Dados do Banco Central
 * Preserva integralmente todos os campos das duas bases oficiais:
 * - Dados Consolidados (Segmentos, Bens Imóveis, Bens Móveis)
 * - Dados por UF
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Interface para resultado do parse
 */
export interface ParseResult {
  success: boolean;
  tipoDados: string;
  rowCount: number;
  data?: Record<string, string>[];
  headers?: string[];
  error?: string;
}

/**
 * Ler e parsear arquivo CSV
 * Preserva cabeçalhos originais e todos os campos sem transformação
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

    if (!filePath.endsWith(".csv")) {
      return {
        success: false,
        tipoDados: "",
        rowCount: 0,
        error: `Not a CSV file: ${filePath}`,
      };
    }

    const content = fs.readFileSync(filePath, "latin1");
    const fileName = path.basename(filePath);
    const tipoDados = extractTipoDados(fileName);

    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return {
        success: false,
        tipoDados,
        rowCount: 0,
        error: "CSV file is empty or has no data rows",
      };
    }

    // Primeira linha = cabeçalhos originais (preservar com prefixo # se presente)
    const headers = parseCSVLine(lines[0]);

    if (headers.length === 0) {
      return {
        success: false,
        tipoDados,
        rowCount: 0,
        error: "CSV file has no headers",
      };
    }

    // Parsear dados preservando todos os campos
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length === 0) {
        continue;
      }

      const row: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] ?? "";
      }

      data.push(row);
    }

    return {
      success: true,
      tipoDados,
      rowCount: data.length,
      data,
      headers,
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
 * Parsear linha CSV (separador: semicolon, suporte a aspas)
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
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ";" && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Extrair tipo de dados do nome do arquivo oficial do BC
 * Ex: 202605Segmentos_Consolidados.csv → segmentos_consolidados
 *     202603Consorcios_UF.csv → dados_uf
 *     202603Bens_Imoveis_Grupos.csv → bens_imoveis_grupos
 *     202603Bens_Moveis_Grupos.csv → bens_moveis_grupos
 *     Significado_dos_campos_e_metricas.xlsx → significado_campos_metricas
 *     Significado_dos_campos_UF.csv → significado_campos_uf
 */
function extractTipoDados(fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.(csv|xlsx)$/i, "");

  // Padrão: Significado_dos_campos_e_metricas ou Significado_dos_campos_UF
  if (/^Significado_dos_campos/i.test(nameWithoutExt)) {
    if (/UF/i.test(nameWithoutExt)) {
      return "significado_campos_uf";
    }
    return "significado_campos_metricas";
  }

  // Padrão: AAAAMMConsorcios_UF (Dados por UF)
  if (/Consorcios_UF$/i.test(nameWithoutExt)) {
    return "dados_uf";
  }

  // Remover prefixo de data (ex: 202605)
  const withoutDate = nameWithoutExt.replace(/^\d{6}/, "");

  // Converter para snake_case e lowercase
  return withoutDate
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/_+/g, "_");
}

/**
 * Validar dados parseados
 * Verifica apenas que há dados e cabeçalhos — não descarta campos
 */
export function validateParsedData(
  data: Record<string, any>[],
  tipoDados: string,
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    errors.push("No data rows found");
    return { valid: false, errors };
  }

  // Validação genérica: verificar se há pelo menos um campo
  const firstRow = data[0];
  if (Object.keys(firstRow).length === 0) {
    errors.push("No fields found in data rows");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ler arquivo XLSX (dicionário de dados)
 * Por enquanto, apenas registra que foi encontrado
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

    if (!filePath.endsWith(".xlsx")) {
      return {
        success: false,
        tipoDados: "dicionario",
        rowCount: 0,
        error: `Not an XLSX file: ${filePath}`,
      };
    }

    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const tipoDados = extractTipoDados(fileName);

    return {
      success: true,
      tipoDados,
      rowCount: 1,
      data: [
        {
          tipo: "dicionario",
          arquivo: fileName,
          tamanho: String(stats.size),
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
