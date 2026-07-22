import { describe, expect, it } from "vitest";
import {
  isValidDataBase,
  resolvePeriod,
  shiftDataBaseMonths,
} from "./period";

const coverage = {
  earliestDataBase: 201612,
  latestDataBase: 202512,
};

describe("recortes temporais do Panorama BC", () => {
  it("valida competências no formato AAAAMM", () => {
    expect(isValidDataBase(202512)).toBe(true);
    expect(isValidDataBase(202500)).toBe(false);
    expect(isValidDataBase(202513)).toBe(false);
    expect(isValidDataBase(2025)).toBe(false);
  });

  it("desloca meses atravessando anos", () => {
    expect(shiftDataBaseMonths(202501, -1)).toBe(202412);
    expect(shiftDataBaseMonths(202512, -11)).toBe(202501);
    expect(shiftDataBaseMonths(202512, -59)).toBe(202101);
  });

  it("resolve 12 meses em relação à última base disponível", () => {
    expect(resolvePeriod({ preset: "12m" }, coverage)).toMatchObject({
      startDataBase: 202501,
      endDataBase: 202512,
      wasClampedToCoverage: false,
    });
  });

  it("resolve cinco e dez anos sem usar a data do servidor", () => {
    expect(resolvePeriod({ preset: "5y" }, coverage)).toMatchObject({
      startDataBase: 202101,
      endDataBase: 202512,
    });
    expect(resolvePeriod({ preset: "10y" }, coverage)).toMatchObject({
      startDataBase: 201612,
      endDataBase: 202512,
      wasClampedToCoverage: true,
    });
  });

  it("resolve histórico completo pela cobertura real", () => {
    expect(resolvePeriod({ preset: "all" }, coverage)).toEqual({
      preset: "all",
      label: "Histórico completo",
      startDataBase: 201612,
      endDataBase: 202512,
      wasClampedToCoverage: false,
    });
  });

  it("limita período personalizado à cobertura existente", () => {
    expect(
      resolvePeriod(
        {
          preset: "custom",
          customStartDataBase: 201501,
          customEndDataBase: 202612,
        },
        coverage,
      ),
    ).toMatchObject({
      startDataBase: 201612,
      endDataBase: 202512,
      wasClampedToCoverage: true,
    });
  });

  it("rejeita intervalo personalizado invertido ou sem interseção", () => {
    expect(() =>
      resolvePeriod(
        {
          preset: "custom",
          customStartDataBase: 202501,
          customEndDataBase: 202401,
        },
        coverage,
      ),
    ).toThrow("não pode ser posterior");

    expect(() =>
      resolvePeriod(
        {
          preset: "custom",
          customStartDataBase: 201001,
          customEndDataBase: 201512,
        },
        coverage,
      ),
    ).toThrow("não cruza a cobertura");
  });
});
