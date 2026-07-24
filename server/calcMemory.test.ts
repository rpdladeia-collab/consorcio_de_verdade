import { describe, expect, it } from "vitest";
import { buildCalcMemoryProjection } from "@/lib/calcMemory";

describe("buildCalcMemoryProjection", () => {
  it("calcula correção do fundo comum por eliminação e fecha a conta", () => {
    const data = {
      cartaInicial: 300_000,
      taxaAdmPercentual: 16,
      fundoReservaPercentual: 2,
      cartaFinal: 465_398,
      adminCorrection: 12_374,
      reserveCorrection: 1_547,
      seguroTotal: 0,
      totalPago: 445_257,
    };
    const p = buildCalcMemoryProjection(data);

    // Coluna 1: Contrato Inicial
    expect(p.cartaInicial).toBe(300_000);
    expect(p.taxaAdmInicial).toBe(48_000); // 300000 * 16%
    expect(p.fundoReservaInicial).toBe(6_000); // 300000 * 2%

    // Coluna 2: Projeção de Correções
    expect(p.aumentoTaxaAdm).toBe(12_374);
    expect(p.aumentoFundoReserva).toBe(1_547);
    expect(p.seguroTotal).toBe(0);

    // Correção da Carta (Fundo Comum) por eliminação:
    // 445257 - 300000 - (48000 + 12374) - (6000 + 1547) - 0 = 77336
    expect(p.correcaoFundoComum).toBe(77_336);

    // FECHAMENTO: soma de todas as linhas = Total Pago
    const somaLinhas =
      p.cartaInicial +
      p.taxaAdmInicial +
      p.fundoReservaInicial +
      p.correcaoFundoComum +
      p.aumentoTaxaAdm +
      p.aumentoFundoReserva +
      p.seguroTotal;
    expect(somaLinhas).toBe(p.totalPago);
  });

  it("fecha a conta mesmo com seguro não-zero", () => {
    const data = {
      cartaInicial: 100_000,
      taxaAdmPercentual: 20,
      fundoReservaPercentual: 5,
      cartaFinal: 150_000,
      adminCorrection: 5_000,
      reserveCorrection: 1_000,
      seguroTotal: 3_000,
      totalPago: 200_000,
    };
    const p = buildCalcMemoryProjection(data);

    const somaLinhas =
      p.cartaInicial +
      p.taxaAdmInicial +
      p.fundoReservaInicial +
      p.correcaoFundoComum +
      p.aumentoTaxaAdm +
      p.aumentoFundoReserva +
      p.seguroTotal;
    expect(somaLinhas).toBe(p.totalPago);
  });
});
