const PT_BR_NUMBER = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

const QUANTITY_BY_GROUP: Record<string, string> = {
  "administradoras de consórcio": "administradoras",
  "ativos contemplados": "cotas",
  "cotas ativas": "cotas",
  "cotas ativas por estado": "cotas",
  "cotas comercializadas": "cotas",
  "cotas excluídas": "cotas",
  "grupos ativos": "grupos",
};

export function formatDataBase(dataBase: number): string {
  const year = Math.floor(dataBase / 100);
  const month = dataBase % 100;
  if (!Number.isInteger(dataBase) || month < 1 || month > 12) return "—";

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("pt-BR", {
    month: "short",
    timeZone: "UTC",
  });
  return `${monthLabel} ${year}`;
}

/**
 * Exibe o valor exatamente na unidade declarada pelo BCB.
 * Não converte `mil` para `k` nem aplica uma segunda abreviação sobre o dado oficial.
 */
export function formatOfficialMetricValue(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  const formatted = PT_BR_NUMBER.format(value);
  return unit === "%" ? `${formatted}%` : formatted;
}

export function describeOfficialUnit(unit: string, groupName: string): string {
  const quantity = QUANTITY_BY_GROUP[groupName.trim().toLocaleLowerCase("pt-BR")];

  if (unit === "%") return "percentual (%)";
  if (unit === "mil") return quantity ? `mil ${quantity}` : "mil unidades";
  if (unit === "mi") return quantity ? `milhões de ${quantity}` : "milhões de unidades";
  if (unit === "unidade") return quantity ?? "unidades";
  return unit;
}

export function formatOfficialMetricValueWithUnit(
  value: number,
  unit: string,
  groupName: string,
): string {
  const formatted = formatOfficialMetricValue(value, unit);
  if (formatted === "—" || unit === "%") return formatted;

  if (unit.startsWith("R$ ")) {
    return `R$ ${formatted} ${unit.slice(3)}`;
  }

  return `${formatted} ${describeOfficialUnit(unit, groupName)}`;
}

export function formatOfficialPeriodicity(code: string, fallbackLabel: string): string {
  const labels: Record<string, string> = {
    "annual-december": "Anual (divulgação oficial do Banco Central)",
    annual: "Anual (divulgação oficial do Banco Central)",
    quarterly: "Trimestral (divulgação oficial do Banco Central)",
    monthly: "Mensal (divulgação oficial do Banco Central)",
  };

  return labels[code] ?? fallbackLabel;
}
