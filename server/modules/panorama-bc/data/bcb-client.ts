const BCB_ODATA_BASE =
  "https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_TOP = 1_000;

export type FetchLike = typeof fetch;

export interface BcbGroup {
  id: string;
  name: string;
}

export interface BcbMetricMetadata {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  unit: string;
}

export interface BcbMetricValue {
  dataBase: number;
  metricId: string;
  value: number;
}

interface ODataEnvelope<T> {
  value?: T[];
}

type UnknownRecord = Record<string, unknown>;

function requiredText(value: unknown, field: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  throw new Error(`Resposta do BCB sem o campo obrigatório ${field}`);
}

function requiredNumber(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(parsed)) return parsed;
  throw new Error(`Resposta do BCB com valor inválido em ${field}`);
}

function buildCollectionUrl(resource: string): string {
  return `${BCB_ODATA_BASE}/${resource}?$format=json&$top=${DEFAULT_TOP}`;
}

async function requestCollection<T>(
  resource: string,
  fetcher: FetchLike = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(buildCollectionUrl(resource), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `BCB respondeu ${response.status} ${response.statusText || "sem descrição"}`,
      );
    }

    const payload = (await response.json()) as ODataEnvelope<T>;
    if (!Array.isArray(payload.value)) {
      throw new Error("Resposta OData do BCB não contém uma coleção value válida");
    }

    return payload.value;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Consulta ao BCB excedeu ${timeoutMs} ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGroups(fetcher: FetchLike = fetch): Promise<BcbGroup[]> {
  const rows = await requestCollection<UnknownRecord>("GrupoDeMetricas()", fetcher);
  return rows.map(row => ({
    id: requiredText(row.IdGrupo, "IdGrupo"),
    name: requiredText(row.Grupo, "Grupo"),
  }));
}

export async function fetchMetricCatalog(
  fetcher: FetchLike = fetch,
): Promise<BcbMetricMetadata[]> {
  const rows = await requestCollection<UnknownRecord>("CadastroDeMetricas()", fetcher);
  return rows.map(row => ({
    id: requiredText(row.IdMetrica, "IdMetrica"),
    name: requiredText(row.Metrica, "Metrica"),
    groupId: requiredText(row.IdGrupo, "IdGrupo"),
    groupName: requiredText(row.Grupo, "Grupo"),
    unit: requiredText(row.Unidade, "Unidade"),
  }));
}

export async function fetchMetricValues(
  dataBase: number,
  fetcher: FetchLike = fetch,
): Promise<BcbMetricValue[]> {
  if (!Number.isInteger(dataBase) || dataBase < 190001 || dataBase > 299912) {
    throw new Error("DataBase deve ser um inteiro no formato AAAAMM");
  }

  const month = dataBase % 100;
  if (month < 1 || month > 12) {
    throw new Error("DataBase contém mês inválido");
  }

  const rows = await requestCollection<UnknownRecord>(
    `Metricas(DataBase=${dataBase})`,
    fetcher,
  );

  return rows.map(row => ({
    dataBase: requiredNumber(row.DataBase, "DataBase"),
    metricId: requiredText(row.IdMetrica, "IdMetrica"),
    value: requiredNumber(row.Valor, "Valor"),
  }));
}

export function buildQuarterCandidates(
  referenceDate: Date,
  maximumQuarters = 16,
): number[] {
  if (!Number.isInteger(maximumQuarters) || maximumQuarters < 1) {
    throw new Error("maximumQuarters deve ser um inteiro positivo");
  }

  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth() + 1;
  const currentQuarterMonth = Math.floor((month - 1) / 3) * 3 + 3;
  const candidates: number[] = [];

  let candidateYear = year;
  let candidateMonth = currentQuarterMonth;

  for (let index = 0; index < maximumQuarters; index += 1) {
    candidates.push(candidateYear * 100 + candidateMonth);
    candidateMonth -= 3;
    if (candidateMonth <= 0) {
      candidateMonth = 12;
      candidateYear -= 1;
    }
  }

  return candidates;
}

export async function findLatestAvailableDataBase(
  options: {
    referenceDate?: Date;
    maximumQuarters?: number;
    fetcher?: FetchLike;
  } = {},
): Promise<{ dataBase: number; values: BcbMetricValue[] }> {
  const candidates = buildQuarterCandidates(
    options.referenceDate ?? new Date(),
    options.maximumQuarters ?? 16,
  );

  for (const dataBase of candidates) {
    const values = await fetchMetricValues(dataBase, options.fetcher ?? fetch);
    if (values.length > 0) return { dataBase, values };
  }

  throw new Error(
    `Nenhuma data-base do BCB foi encontrada nas últimas ${candidates.length} competências trimestrais`,
  );
}

export const BCB_PANORAMA_SOURCE = {
  service: "Panorama do Sistema de Consórcios",
  organization: "Banco Central do Brasil",
  baseUrl: BCB_ODATA_BASE,
} as const;
