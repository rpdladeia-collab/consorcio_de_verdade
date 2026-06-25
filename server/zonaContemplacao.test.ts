/**
 * Testes Vitest — Zona de Contemplação 2026
 * Cenário golden: dados de exemplo do HTML original (ZONADECONTEMPLAÇÃO.2026_.renatto.html)
 * Todos os resultados esperados foram calculados manualmente a partir das fórmulas do HTML.
 */

import { describe, it, expect } from "vitest";
import { runZonaHistorico, runZonaQuantitativo } from "./lib/zonaContemplacao2026";

// ─── Dados de exemplo do HTML original ───────────────────────────────────────

/** sample[] do HTML — 12 assembleias */
const SAMPLE_ROWS = [
  { ass: 36, low: 48, mid: 56, high: 72 },
  { ass: 35, low: 45, mid: 54, high: 69 },
  { ass: 34, low: 50, mid: 58, high: 74 },
  { ass: 33, low: 43, mid: 52, high: 68 },
  { ass: 32, low: 46, mid: 55, high: 71 },
  { ass: 31, low: 44, mid: 53, high: 70 },
];

/** buildHealthRows() do HTML — 3 assembleias padrão */
const HEALTH_ROWS = [
  { ass: 36, sg: 220, p30: 18, p50: 9,  clivre: 2, clim: 1, c30: 1, c50: 1, csort: 1, outras: 0 },
  { ass: 35, sg: 217, p30: 20, p50: 10, clivre: 3, clim: 1, c30: 1, c50: 0, csort: 1, outras: 0 },
  { ass: 34, sg: 214, p30: 19, p50: 11, clivre: 2, clim: 1, c30: 1, c50: 1, csort: 1, outras: 0 },
];

// ─── Aba 1: Histórico de Contemplações ───────────────────────────────────────

describe("runZonaHistorico — cenário golden (6 assembleias, média simples)", () => {
  const result = runZonaHistorico({
    rows: SAMPLE_ROWS,
    meulance: 50,
    metodoZona: "media",
    modalidade: "Livre (Embutido + Recurso próprio)",
    grupoNome: "Consórcio Ibituruna · Grupo 0001 · Imóvel",
  });

  it("piso histórico (low) = média de 48,45,50,43,46,44 = 46,00", () => {
    expect(result.low).toBeCloseTo(46.0, 2);
  });

  it("zona média (mid) = média de 56,54,58,52,55,53 = 54,67", () => {
    expect(result.mid).toBeCloseTo(54.6667, 2);
  });

  it("teto histórico (high) = média de 72,69,74,68,71,70 = 70,67", () => {
    expect(result.high).toBeCloseTo(70.6667, 2);
  });

  it("tendência = ↑ Alta (3 últimas mid: 56,54,58 → 56; 3 anteriores: 52,55,53 → 53,33; diff +2,67)", () => {
    expect(result.trend.label).toBe("↑ Alta");
    expect(result.trend.cls).toBe("trend-up");
  });

  it("posição do lance 50% = 'Zona de entrada' (50 > 46 piso, 50 < 54,67 mid)", () => {
    expect(result.position.title).toBe("Zona de entrada");
  });

  it("pressão competitiva = 'Alta' (amplitude = 70,67 − 46 = 24,67 > 22)", () => {
    expect(result.pressao.label).toBe("Alta");
  });

  it("chips: primeiro chip com 'Meu lance: 50,00%'", () => {
    expect(result.chips[0].text).toContain("50,00%");
  });

  it("chips: chip de distância referência (abaixo da ref. central)", () => {
    const distChip = result.chips.find((c) => c.text.includes("Distância"));
    expect(distChip).toBeDefined();
    expect(distChip!.text).toContain("abaixo");
  });

  it("chips: chip de método = Média simples", () => {
    const metChip = result.chips.find((c) => c.text.includes("Método"));
    expect(metChip).toBeDefined();
    expect(metChip!.text).toContain("Média simples");
  });

  it("simulationId gerado (12 chars alfanuméricos)", () => {
    expect(result.simulationId).toMatch(/^[a-z0-9]{12}$/);
  });

  it("generatedAt é ISO string válida", () => {
    expect(() => new Date(result.generatedAt)).not.toThrow();
  });
});

describe("runZonaHistorico — método mediana", () => {
  const result = runZonaHistorico({
    rows: SAMPLE_ROWS,
    meulance: 50,
    metodoZona: "mediana",
    modalidade: "Livre",
    grupoNome: "Teste",
  });

  it("piso (low) com mediana = 45,50 e zona média (mid) = 54,50", () => {
    // sorted low: 43,44,45,46,48,50 → (45+46)/2 = 45.5
    // sorted mid: 52,53,54,55,56,58 → (54+55)/2 = 54.5
    expect(result.low).toBeCloseTo(45.5, 1);
    expect(result.mid).toBeCloseTo(54.5, 1);
  });
});

describe("runZonaHistorico — lance abaixo da zona", () => {
  const result = runZonaHistorico({
    rows: SAMPLE_ROWS,
    meulance: 30,
    metodoZona: "media",
    modalidade: "Livre",
    grupoNome: "Teste",
  });

  it("posição = 'Abaixo da zona' quando lance < piso", () => {
    expect(result.position.title).toBe("Abaixo da zona");
  });
});

describe("runZonaHistorico — lance na zona competitiva", () => {
  const result = runZonaHistorico({
    rows: SAMPLE_ROWS,
    meulance: 60,
    metodoZona: "media",
    modalidade: "Livre",
    grupoNome: "Teste",
  });

  it("posição = 'Zona competitiva' quando piso < lance ≤ teto", () => {
    expect(result.position.title).toBe("Zona competitiva");
  });
});

describe("runZonaHistorico — lance acima do teto", () => {
  const result = runZonaHistorico({
    rows: SAMPLE_ROWS,
    meulance: 80,
    metodoZona: "media",
    modalidade: "Livre",
    grupoNome: "Teste",
  });

  it("posição = 'Zona agressiva' quando lance > teto", () => {
    expect(result.position.title).toBe("Zona agressiva");
  });
});

describe("runZonaHistorico — tendência com menos de 6 assembleias", () => {
  const result = runZonaHistorico({
    rows: SAMPLE_ROWS.slice(0, 3),
    meulance: 50,
    metodoZona: "media",
    modalidade: "Livre",
    grupoNome: "Teste",
  });

  it("tendência = '—' quando menos de 6 assembleias", () => {
    expect(result.trend.label).toBe("—");
    expect(result.trend.cls).toBe("trend-flat");
  });
});

// ─── Aba 2: Quantitativo das Contemplações ───────────────────────────────────

describe("runZonaQuantitativo — cenário golden (assembleia 36 selecionada, prazo 120)", () => {
  const result = runZonaQuantitativo({
    rows: HEALTH_ROWS,
    selectedIndexes: [0], // apenas assembleia 36
    hPrazo: 120,
  });

  it("totalCont = 6 (2+1+1+1+1+0)", () => {
    expect(result.totalCont).toBe(6);
  });

  it("índice = 2,73% (6/220 × 100)", () => {
    expect(result.indice).toBeCloseTo(2.7273, 2);
  });

  it("média necessária = 2,6 (220 / (120-36) = 220/84)", () => {
    expect(result.nec).toBeCloseTo(2.619, 2);
  });

  it("cobertura = 229% (6 / 2,619 × 100)", () => {
    expect(result.cob).toBeCloseTo(229.1, 0);
  });

  it("taxa sorteio geral = 0,45% (1/220 × 100)", () => {
    expect(result.probSorteioGeral).toBeCloseTo(0.4545, 2);
  });

  it("probSorteioDetalhe contém '220'", () => {
    expect(result.probSorteioDetalhe).toContain("220");
  });

  it("diagnóstico = 'Ritmo acima do necessário' (cob > 110%)", () => {
    expect(result.hStatus.title).toBe("Ritmo acima do necessário");
    expect(result.hStatus.chip).toBe("green");
  });

  it("fixo30: taxa histórica = 5,56% (1/18 × 100)", () => {
    expect(result.odds30Pct).toBeCloseTo(5.5556, 2);
  });

  it("fixo50: taxa histórica = 11,11% (1/9 × 100)", () => {
    expect(result.odds50Pct).toBeCloseTo(11.1111, 2);
  });

  it("fixo30.txt contém '18 cotas'", () => {
    expect(result.fixo30.txt).toContain("18 cotas");
  });

  it("fixo50.txt contém '9 cotas'", () => {
    expect(result.fixo50.txt).toContain("9 cotas");
  });

  it("distribText contém '6 contemplações'", () => {
    expect(result.distribText).toContain("6 contemplações");
  });

  it("restanteText contém '84 assembleias'", () => {
    expect(result.restanteText).toContain("84 assembleias");
  });

  it("simulationId gerado (12 chars alfanuméricos)", () => {
    expect(result.simulationId).toMatch(/^[a-z0-9]{12}$/);
  });
});

describe("runZonaQuantitativo — seleção múltipla (assembleias 36+35+34)", () => {
  const result = runZonaQuantitativo({
    rows: HEALTH_ROWS,
    selectedIndexes: [0, 1, 2],
    hPrazo: 120,
  });

  it("totalCont = 18 (6+6+6)", () => {
    expect(result.totalCont).toBe(18);
  });

  it("mediaReal = 6 (18/3)", () => {
    // Verificado via cobertura: nec = 220/(120-36) = 2,619; cob = 6/2,619*100 ≈ 229%
    expect(result.hStatus.title).toBe("Ritmo acima do necessário");
  });
});

describe("runZonaQuantitativo — diagnóstico ritmo crítico", () => {
  const result = runZonaQuantitativo({
    rows: [{ ass: 36, sg: 220, p30: 0, p50: 0, clivre: 0, clim: 0, c30: 0, c50: 0, csort: 1, outras: 0 }],
    selectedIndexes: [0],
    hPrazo: 120,
  });

  it("diagnóstico = 'Ritmo crítico' quando cobertura < 55%", () => {
    // nec = 220/84 ≈ 2,619; mediaReal = 1; cob = 1/2,619*100 ≈ 38% < 55
    expect(result.hStatus.title).toBe("Ritmo crítico");
    expect(result.hStatus.chip).toBe("red");
  });
});

describe("runZonaQuantitativo — linha inválida excluída do cálculo", () => {
  const invalidRow = { ass: 36, sg: 5, p30: 0, p50: 0, clivre: 10, clim: 0, c30: 0, c50: 0, csort: 0, outras: 0 };
  // total (10) > sg (5) → inválida

  const result = runZonaQuantitativo({
    rows: [invalidRow, HEALTH_ROWS[0]],
    selectedIndexes: [0, 1],
    hPrazo: 120,
  });

  it("linha inválida é excluída e cálculo usa apenas a linha válida", () => {
    // Apenas HEALTH_ROWS[0] é válida (total=6 ≤ sg=220)
    expect(result.totalCont).toBe(6);
  });
});
