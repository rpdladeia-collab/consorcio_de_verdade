import { describe, expect, it } from "vitest";
import {
  PANORAMA_EDITORIAL_CHAPTER_ONE_KPIS,
  PANORAMA_EDITORIAL_COVERAGE_LABEL,
  PANORAMA_EDITORIAL_HERO_STATS,
  PANORAMA_EDITORIAL_SEGMENT_SALES_2025,
  PANORAMA_EDITORIAL_TOTAL_SALES_2025,
} from "./panoramaEditorialStats";

describe("indicadores editoriais do Panorama", () => {
  it("usa a cobertura atualizada até 2025", () => {
    expect(PANORAMA_EDITORIAL_COVERAGE_LABEL).toBe("2016–2025");
  });

  it("mantém exatamente os quatro valores e competências do hero", () => {
    expect(PANORAMA_EDITORIAL_HERO_STATS).toEqual([
      { num: "5,3 mi", label: "cotas comercializadas em 2025" },
      { num: "12,8 mi", label: "cotas ativas em dez/2025" },
      { num: "48,4%", label: "índice de exclusão geral em 2025" },
      { num: "77,8%", label: "contemplações por lance em 2025" },
    ]);
  });

  it("mantém exatamente os quatro KPIs do Capítulo 01", () => {
    expect(PANORAMA_EDITORIAL_CHAPTER_ONE_KPIS).toEqual([
      { num: "5,3 mi", label: "Cotas vendidas em 2025", accent: true },
      { num: "12,8 mi", label: "Cotas ativas em dez/2025" },
      {
        num: "+132,46%",
        label: "Crescimento 2016→2025",
        note: "de 2,28 mi para 5,3 mi",
      },
      { num: "9 anos", label: "de crescimento ininterrupto" },
    ]);
  });

  it("inclui o ponto total de 2025 com o valor aprovado", () => {
    expect(PANORAMA_EDITORIAL_TOTAL_SALES_2025).toEqual({
      ano: "2025",
      vendidas: 5.32,
    });
  });

  it("mantém os quatro valores por produto independentes do total", () => {
    expect(PANORAMA_EDITORIAL_SEGMENT_SALES_2025).toEqual({
      Imóveis: 1.39,
      Automóveis: 1.92,
      Motocicletas: 1.44,
      "Outros bens e serviços": 0.48,
    });

    const somaDosProdutos = Object.values(
      PANORAMA_EDITORIAL_SEGMENT_SALES_2025,
    ).reduce((total, valor) => total + valor, 0);

    expect(somaDosProdutos).toBeCloseTo(5.23, 2);
    expect(PANORAMA_EDITORIAL_TOTAL_SALES_2025.vendidas).toBe(5.32);
  });
});
