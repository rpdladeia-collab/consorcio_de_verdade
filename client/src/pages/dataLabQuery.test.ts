import { describe, expect, it } from "vitest";
import { getActiveCustomBounds, resolveVisibleMetricId } from "./dataLabQuery";

describe("entrada de consulta do Data Lab", () => {
  it("ignora limites personalizados enquanto um recorte predefinido está ativo", () => {
    expect(getActiveCustomBounds("10y", 201612, 202512)).toEqual({
      customStartDataBase: undefined,
      customEndDataBase: undefined,
    });
  });

  it("envia os limites personalizados apenas no recorte personalizado", () => {
    expect(getActiveCustomBounds("custom", 202112, 202512)).toEqual({
      customStartDataBase: 202112,
      customEndDataBase: 202512,
    });
  });

  it("seleciona a primeira métrica oficial quando nenhuma está ativa", () => {
    expect(resolveVisibleMetricId("", [{ id: "1" }, { id: "2" }])).toBe("1");
  });

  it("preserva a seleção atual enquanto ela continuar visível", () => {
    expect(resolveVisibleMetricId("2", [{ id: "1" }, { id: "2" }])).toBe("2");
  });

  it("retorna vazio sem entrar em carregamento quando o filtro não encontra métricas", () => {
    expect(resolveVisibleMetricId("2", [])).toBe("");
  });
});
