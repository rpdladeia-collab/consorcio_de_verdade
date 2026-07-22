export const PERIOD_PRESETS = ["12m", "5y", "10y", "all", "custom"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export interface DataCoverage {
  earliestDataBase: number;
  latestDataBase: number;
}

export interface PeriodSelection {
  preset: PeriodPreset;
  customStartDataBase?: number;
  customEndDataBase?: number;
}

export interface ResolvedPeriod {
  preset: PeriodPreset;
  label: string;
  startDataBase: number;
  endDataBase: number;
  wasClampedToCoverage: boolean;
}

export function isValidDataBase(dataBase: number): boolean {
  if (!Number.isInteger(dataBase) || dataBase < 190001 || dataBase > 299912) {
    return false;
  }
  const month = dataBase % 100;
  return month >= 1 && month <= 12;
}

export function shiftDataBaseMonths(dataBase: number, deltaMonths: number): number {
  if (!isValidDataBase(dataBase)) {
    throw new Error("DataBase deve estar no formato AAAAMM");
  }
  if (!Number.isInteger(deltaMonths)) {
    throw new Error("deltaMonths deve ser inteiro");
  }

  const year = Math.floor(dataBase / 100);
  const monthIndex = (dataBase % 100) - 1;
  const shifted = new Date(Date.UTC(year, monthIndex + deltaMonths, 1));
  return shifted.getUTCFullYear() * 100 + shifted.getUTCMonth() + 1;
}

function assertCoverage(coverage: DataCoverage): void {
  if (
    !isValidDataBase(coverage.earliestDataBase) ||
    !isValidDataBase(coverage.latestDataBase) ||
    coverage.earliestDataBase > coverage.latestDataBase
  ) {
    throw new Error("Cobertura temporal inválida");
  }
}

export function resolvePeriod(
  selection: PeriodSelection,
  coverage: DataCoverage,
): ResolvedPeriod {
  assertCoverage(coverage);

  let requestedStart = coverage.earliestDataBase;
  let requestedEnd = coverage.latestDataBase;
  let label = "Histórico completo";

  if (selection.preset === "12m") {
    requestedStart = shiftDataBaseMonths(coverage.latestDataBase, -11);
    label = "Últimos 12 meses";
  } else if (selection.preset === "5y") {
    requestedStart = shiftDataBaseMonths(coverage.latestDataBase, -59);
    label = "Últimos 5 anos";
  } else if (selection.preset === "10y") {
    requestedStart = shiftDataBaseMonths(coverage.latestDataBase, -119);
    label = "Últimos 10 anos";
  } else if (selection.preset === "custom") {
    const { customStartDataBase, customEndDataBase } = selection;
    if (
      customStartDataBase === undefined ||
      customEndDataBase === undefined ||
      !isValidDataBase(customStartDataBase) ||
      !isValidDataBase(customEndDataBase)
    ) {
      throw new Error("Período personalizado exige início e fim no formato AAAAMM");
    }
    if (customStartDataBase > customEndDataBase) {
      throw new Error("Início do período não pode ser posterior ao fim");
    }
    requestedStart = customStartDataBase;
    requestedEnd = customEndDataBase;
    label = "Período personalizado";
  }

  const startDataBase = Math.max(requestedStart, coverage.earliestDataBase);
  const endDataBase = Math.min(requestedEnd, coverage.latestDataBase);

  if (startDataBase > endDataBase) {
    throw new Error("Período selecionado não cruza a cobertura disponível");
  }

  return {
    preset: selection.preset,
    label,
    startDataBase,
    endDataBase,
    wasClampedToCoverage:
      startDataBase !== requestedStart || endDataBase !== requestedEnd,
  };
}
