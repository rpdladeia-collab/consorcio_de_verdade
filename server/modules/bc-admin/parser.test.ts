/**
 * Testes para parser de dados do BC
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  parseCSVFile,
  validateParsedData,
  ParseResult,
} from "./parser";

const TEST_DIR = "/tmp/bc-parser-tests";
const CSV_TEST_FILE = path.join(TEST_DIR, "202607Segmentos_Consolidados.csv");

/**
 * Criar arquivo CSV de teste
 */
function createTestCSV() {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }

  const csvContent = `CNPJ_Administradora;Nome_Administradora;Codigo_Segmento;Taxa_Administracao;Grupos_Ativos
84911098;Administradora A;10;0.015;100
84911099;Administradora B;20;0.018;150
84911100;Administradora C;10;0.020;80`;

  fs.writeFileSync(CSV_TEST_FILE, csvContent, "utf-8");
}

/**
 * Limpar arquivos de teste
 */
function cleanupTestFiles() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
}

describe("BC Parser", () => {
  beforeAll(() => {
    createTestCSV();
  });

  afterAll(() => {
    cleanupTestFiles();
  });

  it("should parse CSV file correctly", async () => {
    const result = await parseCSVFile(CSV_TEST_FILE);

    expect(result.success).toBe(true);
    expect(result.tipoDados).toBe("segmentos_consolidados");
    expect(result.rowCount).toBe(3);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBe(3);
  });

  it("should extract correct data from CSV", async () => {
    const result = await parseCSVFile(CSV_TEST_FILE);

    expect(result.data).toBeDefined();
    if (result.data) {
      const firstRow = result.data[0];
      expect(firstRow.CNPJ_Administradora).toBe("84911098");
      expect(firstRow.Nome_Administradora).toBe("Administradora A");
      expect(firstRow.Codigo_Segmento).toBe("10");
      expect(firstRow.Taxa_Administracao).toBe("0.015");
    }
  });

  it("should handle non-existent file", async () => {
    const result = await parseCSVFile("/tmp/nonexistent.csv");

    expect(result.success).toBe(false);
    expect(result.error).toContain("File not found");
  });

  it("should reject non-CSV files", async () => {
    const txtFile = path.join(TEST_DIR, "test.txt");
    fs.writeFileSync(txtFile, "test content");

    const result = await parseCSVFile(txtFile);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Not a CSV file");
  });

  it("should validate parsed data with required fields", async () => {
    const testData = [
      {
        CNPJ_Administradora: "84911098",
        Nome_Administradora: "Admin A",
        Codigo_Segmento: "10",
      },
    ];

    const validation = validateParsedData(
      testData,
      "segmentos_consolidados"
    );

    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it("should detect missing required fields", async () => {
    const testData = [
      {
        Nome_Administradora: "Admin A",
        Codigo_Segmento: "10",
        // Missing CNPJ_Administradora
      },
    ];

    const validation = validateParsedData(
      testData,
      "segmentos_consolidados"
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0]).toContain("CNPJ_Administradora");
  });

  it("should reject empty data", async () => {
    const validation = validateParsedData([], "segmentos_consolidados");

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain("No data rows found");
  });

  it("should extract correct tipo_dados from filename", async () => {
    const result = await parseCSVFile(CSV_TEST_FILE);

    expect(result.tipoDados).toBe("segmentos_consolidados");
  });

  it("should handle CSV with empty lines", async () => {
    const csvWithEmptyLines = path.join(TEST_DIR, "test_empty_lines.csv");
    const content = `CNPJ;Nome
84911098;Admin A

84911099;Admin B`;

    fs.writeFileSync(csvWithEmptyLines, content, "utf-8");

    const result = await parseCSVFile(csvWithEmptyLines);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2); // Should skip empty lines
  });

  it("should handle CSV with quoted fields", async () => {
    const csvWithQuotes = path.join(TEST_DIR, "test_quotes.csv");
    const content = `CNPJ;Nome;Descricao
84911098;"Admin A";"Descrição com ; ponto-vírgula"
84911099;"Admin B";"Outra descrição"`;

    fs.writeFileSync(csvWithQuotes, content, "utf-8");

    const result = await parseCSVFile(csvWithQuotes);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2);
  });
});
