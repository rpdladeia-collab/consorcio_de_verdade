export interface CalcMemoryData {
  cartaInicial: number;
  taxaAdmPercentual: number;
  fundoReservaPercentual: number;
  cartaFinal: number;
  adminCorrection: number;
  reserveCorrection: number;
  seguroTotal: number;
  totalPago: number;
}

export interface CalcMemoryProjection {
  cartaInicial: number;
  taxaAdmInicial: number;
  fundoReservaInicial: number;
  correcaoFundoComum: number;
  aumentoTaxaAdm: number;
  aumentoFundoReserva: number;
  seguroTotal: number;
  totalPago: number;
}

/**
 * Converte o resultado real da simulação nos valores exibidos no card
 * "Como essa projeção foi construída".
 *
 * A mágica do fechamento: a Correção da Carta (Fundo Comum) é calculada
 * por eliminação, garantindo que a soma de todas as linhas (Coluna 1 +
 * Coluna 2) seja exatamente igual ao Total Pago exibido no rodapé.
 */
export function buildCalcMemoryProjection(data: CalcMemoryData): CalcMemoryProjection {
  const taxaAdmInicial = data.cartaInicial * (data.taxaAdmPercentual / 100);
  const fundoReservaInicial = data.cartaInicial * (data.fundoReservaPercentual / 100);

  // Totais projetados (valor inicial + correção ao longo do plano)
  const taxaAdmTotalProjetada = taxaAdmInicial + data.adminCorrection;
  const fundoReservaTotalProjetado = fundoReservaInicial + data.reserveCorrection;
  const seguroTotalProjetado = data.seguroTotal;

  // Correção da Carta (Fundo Comum) calculada por eliminação:
  // totalPago - cartaInicial - taxaAdmTotalProjetada - fundoReservaTotalProjetado - seguroTotalProjetado
  const correcaoFundoComum =
    data.totalPago -
    data.cartaInicial -
    taxaAdmTotalProjetada -
    fundoReservaTotalProjetado -
    seguroTotalProjetado;

  return {
    cartaInicial: data.cartaInicial,
    taxaAdmInicial,
    fundoReservaInicial,
    correcaoFundoComum,
    aumentoTaxaAdm: data.adminCorrection,
    aumentoFundoReserva: data.reserveCorrection,
    seguroTotal: seguroTotalProjetado,
    totalPago: data.totalPago,
  };
}
