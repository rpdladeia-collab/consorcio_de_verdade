export type DirecaoBruta = "Crescendo" | "Diminuindo" | "Estável";
export type DirecaoUsuario = "Melhorou" | "Piorou" | "Estável";
export type IndicadorTendencia =
  | "cotasAtivas"
  | "contemplacoes"
  | "exclusoes"
  | "filaEspera"
  | "gruposAtivos"
  | "cotasComercializadas";

/**
 * Traduz a variação bruta já existente em uma leitura útil para o consumidor.
 * A regra de cálculo do backend permanece inalterada: esta função só muda a linguagem exibida.
 */
export function interpretarTendencia(
  indicador: IndicadorTendencia,
  direcao: DirecaoBruta,
): DirecaoUsuario {
  if (direcao === "Estável") return "Estável";

  const aumentou = direcao === "Crescendo";
  const indicadorNegativo = indicador === "exclusoes" || indicador === "filaEspera";

  if (indicadorNegativo) return aumentou ? "Piorou" : "Melhorou";
  return aumentou ? "Melhorou" : "Piorou";
}

/**
 * Só libera uma razão para exibição quando numerador e denominador formam,
 * de fato, uma proporção entre zero e cem por cento.
 */
export function percentualSeguro(numerador: number, denominador: number): number | null {
  if (!Number.isFinite(numerador) || !Number.isFinite(denominador)) return null;
  if (numerador < 0 || denominador <= 0 || numerador > denominador) return null;
  return (numerador / denominador) * 100;
}

export function leituraSegmento(posicao: number, total: number): string {
  if (total <= 1) return "Único segmento da administradora";
  if (posicao === 0) return "Maior segmento da administradora";
  if (posicao === total - 1) return "Menor segmento da administradora";
  return "Segmento complementar da operação";
}

export function situacaoRelativa(
  valor: number,
  referencia: number,
): "Muito abaixo da média" | "Abaixo da média" | "Dentro da média" | "Acima da média" | "Muito acima da média" {
  const diferenca = valor - referencia;
  if (diferenca <= -10) return "Muito abaixo da média";
  if (diferenca < -3) return "Abaixo da média";
  if (diferenca <= 3) return "Dentro da média";
  if (diferenca < 10) return "Acima da média";
  return "Muito acima da média";
}
