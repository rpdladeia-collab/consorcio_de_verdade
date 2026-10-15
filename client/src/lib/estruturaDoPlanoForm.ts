import type { PaymentRange } from "../../../server/lib/estruturaDoPlano";

/** Texto editável: não converter cada tecla em número nem substituir vazio por zero. */
export interface PaymentRangeDraft {
  start: string;
  end: string;
  type: "value" | "percent";
  value: string;
}

export function parseRangeValue(text: string, type: PaymentRangeDraft["type"]): number {
  let raw = text.trim().replace(/\s/g, "");
  if (type === "value") raw = raw.replace(/^R\$/i, "");
  else raw = raw.replace(/%$/, "");
  if (!raw) throw new Error("Informe o valor da faixa; use 0 se a intenção for não amortizar.");

  // A vírgula identifica a notação brasileira; pontos anteriores são milhares.
  // Sem vírgula, dinheiro também aceita grupos de milhares e ponto decimal (1500.00).
  if (raw.includes(",")) {
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d+$/.test(raw)) {
      throw new Error("Valor inválido. Use 1.500,00 ou 1500.00.");
    }
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else if (type === "value" && /^\d{1,3}(?:\.\d{3})+$/.test(raw)) {
    raw = raw.replace(/\./g, "");
  } else if (!/^\d+(?:\.\d+)?$/.test(raw)) {
    throw new Error("Valor inválido. Informe um número não negativo.");
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error("Valor da faixa inválido.");
  return value;
}

export function parsePaymentRanges(drafts: PaymentRangeDraft[], term: number, adjustmentMode: "fixed" | "balanceRebase" = "fixed"): PaymentRange[] {
  const ranges = drafts.map((draft, index) => {
    try {
      const startText = draft.start.trim();
      const endText = draft.end.trim();
      if (!/^\d+$/.test(startText) || !/^\d+$/.test(endText)) {
        throw new Error("Início e fim devem ser meses inteiros.");
      }
      const start = Number(startText);
      const end = Number(endText);
      if (start < 1 || end < start || end > term) {
        throw new Error(`Use 1 ≤ início ≤ fim ≤ ${term}.`);
      }
      return { start, end, type: draft.type, value: parseRangeValue(draft.value, draft.type) };
    } catch (error) {
      throw new Error(`Faixa ${index + 1}: ${(error as Error).message}`);
    }
  });
  if (adjustmentMode === "balanceRebase") {
    if (!ranges.length || ranges.some(range => range.type !== "value")) {
      throw new Error("O recálculo pelo saldo exige faixas monetárias explícitas.");
    }
    const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
    let nextMonth = 1;
    for (const range of sorted) {
      if (range.start < nextMonth) throw new Error("No recálculo pelo saldo, as faixas não podem se sobrepor.");
      if (range.start > nextMonth) throw new Error(`No recálculo pelo saldo, falta definir a faixa do mês ${nextMonth}.`);
      nextMonth = range.end + 1;
    }
    if (nextMonth <= term) throw new Error(`No recálculo pelo saldo, falta definir a faixa do mês ${nextMonth}.`);
  }
  return ranges;
}
