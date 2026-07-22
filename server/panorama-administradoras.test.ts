import { describe, expect, it } from "vitest";
import {
  interpretarTendencia,
  leituraSegmento,
  percentualSeguro,
  situacaoRelativa,
} from "../client/src/lib/panoramaAdministradoras";

describe("interpretarTendencia", () => {
  it("traduz crescimento de indicador positivo como melhora", () => {
    expect(interpretarTendencia("contemplacoes", "Crescendo")).toBe("Melhorou");
    expect(interpretarTendencia("cotasAtivas", "Diminuindo")).toBe("Piorou");
  });

  it("inverte a leitura para indicadores negativos", () => {
    expect(interpretarTendencia("exclusoes", "Crescendo")).toBe("Piorou");
    expect(interpretarTendencia("filaEspera", "Diminuindo")).toBe("Melhorou");
  });

  it("mantém estabilidade sem interpretação adicional", () => {
    expect(interpretarTendencia("gruposAtivos", "Estável")).toBe("Estável");
  });
});

describe("percentualSeguro", () => {
  it("retorna a proporção quando os dados são matematicamente coerentes", () => {
    expect(percentualSeguro(25, 100)).toBe(25);
  });

  it("omite percentuais que ultrapassam o total de referência", () => {
    expect(percentualSeguro(101, 100)).toBeNull();
    expect(percentualSeguro(0, 0)).toBeNull();
  });
});

describe("leituraSegmento", () => {
  it("identifica o maior e o menor segmento da operação", () => {
    expect(leituraSegmento(0, 4)).toBe("Maior segmento da administradora");
    expect(leituraSegmento(3, 4)).toBe("Menor segmento da administradora");
  });
});

describe("situacaoRelativa", () => {
  it("classifica a situação contra a referência de mercado", () => {
    expect(situacaoRelativa(30, 45)).toBe("Muito abaixo da média");
    expect(situacaoRelativa(46, 45)).toBe("Dentro da média");
    expect(situacaoRelativa(58, 45)).toBe("Muito acima da média");
  });
});
