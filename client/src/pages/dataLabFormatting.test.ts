import { describe, expect, it } from "vitest";
import {
  describeOfficialUnit,
  formatDataBase,
  formatOfficialMetricValue,
  formatOfficialMetricValueWithUnit,
  formatOfficialPeriodicity,
} from "./dataLabFormatting";

describe("formatação oficial do Panorama BC", () => {
  it("exibe competências sem o conector redundante 'de'", () => {
    expect(formatDataBase(201612)).toBe("dez. 2016");
    expect(formatDataBase(202512)).toBe("dez. 2025");
  });

  it("mantém valores abaixo de 10 mil em formato absoluto pt-BR", () => {
    expect(formatOfficialMetricValue(245, "unidade")).toBe("245");
    expect(formatOfficialMetricValue(1800, "mil")).toBe("1.800");
    expect(formatOfficialMetricValue(8750, "mil")).toBe("8.750");
  });

  it("preserva decimais e percentuais na unidade oficial", () => {
    expect(formatOfficialMetricValue(12.8, "R$ bilhões")).toBe("12,8");
    expect(formatOfficialMetricValue(48.4, "%")).toBe("48,4%");
  });

  it("nunca produz a abreviação k", () => {
    const outputs = [
      formatOfficialMetricValue(1400, "mil"),
      formatOfficialMetricValueWithUnit(1400, "mil", "Ativos Contemplados"),
      formatOfficialMetricValueWithUnit(8750, "mil", "Cotas ativas"),
    ];

    expect(outputs).toEqual(["1.400", "1.400 mil cotas", "8.750 mil cotas"]);
    expect(outputs.join(" ").toLocaleLowerCase("pt-BR")).not.toContain("k");
  });

  it("descreve a grandeza junto da unidade oficial do Banco Central", () => {
    expect(describeOfficialUnit("mil", "Ativos Contemplados")).toBe("mil cotas");
    expect(describeOfficialUnit("mi", "Ativos Contemplados")).toBe("milhões de cotas");
    expect(describeOfficialUnit("unidade", "Administradoras de Consórcio")).toBe("administradoras");
    expect(describeOfficialUnit("R$ bilhões", "Carteira")).toBe("R$ bilhões");
    expect(formatOfficialMetricValueWithUnit(18.7, "R$ bilhões", "Carteira")).toBe(
      "R$ 18,7 bilhões",
    );
  });

  it("explicita a periodicidade da divulgação oficial", () => {
    expect(formatOfficialPeriodicity("annual-december", "Série anual — bases de dezembro")).toBe(
      "Anual (divulgação oficial do Banco Central)",
    );
    expect(formatOfficialPeriodicity("quarterly", "Série trimestral")).toBe(
      "Trimestral (divulgação oficial do Banco Central)",
    );
  });
});
