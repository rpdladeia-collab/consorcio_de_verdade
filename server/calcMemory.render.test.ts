import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalcMemory } from "@/components/cdv/SimuladorUI";

describe("CalcMemory", () => {
  it("renderiza as duas colunas, os sete campos e o Total Projetado real", () => {
    const html = renderToStaticMarkup(
      React.createElement(CalcMemory, {
        defaultOpen: true,
        data: {
          cartaInicial: 300_000,
          taxaAdmPercentual: 16,
          fundoReservaPercentual: 2,
          cartaFinal: 465_398,
          adminCorrection: 12_374,
          reserveCorrection: 1_547,
          seguroTotal: 0,
          totalPago: 445_257,
        },
      }),
    );

    expect(html).toContain("Contrato Inicial");
    expect(html).toContain("Projeção de Correções");

    for (const label of [
      "Carta de Crédito",
      "Taxa de Adm. Contratual",
      "Fundo de Reserva",
      "Correção da Carta (Fundo Comum)",
      "Aumento da Taxa de Adm.",
      "Aumento do Fundo de Reserva",
      "Seguro de Vida (Total)",
    ]) {
      expect(html).toContain(label);
    }

    expect(html).toContain("Total Projetado (O que sai do bolso)");
    expect(html).toContain("grid-cols-1 md:grid-cols-2");
  });
});
