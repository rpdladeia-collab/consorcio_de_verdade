import { describe, expect, it, vi } from "vitest";
import {
  buildQuarterCandidates,
  fetchGroups,
  fetchMetricCatalog,
  fetchMetricValues,
  findLatestAvailableDataBase,
  type FetchLike,
} from "./bcb-client";

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("cliente oficial do Panorama de Consórcios", () => {
  it("consulta e normaliza os grupos oficiais", async () => {
    const fetcherMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse({ value: [{ IdGrupo: "G1", Grupo: "Grupo oficial" }] }),
    );
    const fetcher = fetcherMock as unknown as FetchLike;

    await expect(fetchGroups(fetcher)).resolves.toEqual([
      { id: "G1", name: "Grupo oficial" },
    ]);
    expect(String(fetcherMock.mock.calls[0]?.[0])).toContain("GrupoDeMetricas()?$format=json");
  });

  it("consulta o catálogo com a assinatura OData correta", async () => {
    const fetcherMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse({
        value: [
          {
            IdMetrica: 1,
            Metrica: "Cotas ativas",
            IdGrupo: "G1",
            Grupo: "Cotas",
            Unidade: "Quantidade",
          },
        ],
      }),
    );
    const fetcher = fetcherMock as unknown as FetchLike;

    await expect(fetchMetricCatalog(fetcher)).resolves.toEqual([
      {
        id: "1",
        name: "Cotas ativas",
        groupId: "G1",
        groupName: "Cotas",
        unit: "Quantidade",
      },
    ]);
    expect(String(fetcherMock.mock.calls[0]?.[0])).toContain("CadastroDeMetricas()?$format=json");
  });

  it("consulta e normaliza valores para uma DataBase", async () => {
    const fetcherMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse({ value: [{ DataBase: 202512, IdMetrica: "1", Valor: "42.5" }] }),
    );
    const fetcher = fetcherMock as unknown as FetchLike;

    await expect(fetchMetricValues(202512, fetcher)).resolves.toEqual([
      { dataBase: 202512, metricId: "1", value: 42.5 },
    ]);
    expect(String(fetcherMock.mock.calls[0]?.[0])).toContain(
      "Metricas(DataBase=202512)?$format=json",
    );
  });

  it("rejeita DataBase fora do formato AAAAMM", async () => {
    await expect(fetchMetricValues(202513)).rejects.toThrow("mês inválido");
    await expect(fetchMetricValues(2025)).rejects.toThrow("formato AAAAMM");
  });

  it("gera competências trimestrais regressivas em UTC", () => {
    expect(buildQuarterCandidates(new Date("2026-07-21T00:00:00Z"), 5)).toEqual([
      202609,
      202606,
      202603,
      202512,
      202509,
    ]);
  });

  it("descobre a primeira competência que contém dados", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("DataBase=202512")) {
        return jsonResponse({
          value: [{ DataBase: 202512, IdMetrica: "1", Valor: 100 }],
        });
      }
      return jsonResponse({ value: [] });
    }) as unknown as FetchLike;

    const result = await findLatestAvailableDataBase({
      referenceDate: new Date("2026-07-21T00:00:00Z"),
      maximumQuarters: 5,
      fetcher,
    });

    expect(result.dataBase).toBe(202512);
    expect(result.values).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("propaga erro HTTP com status compreensível", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ error: "indisponível" }, 503)) as unknown as FetchLike;
    await expect(fetchGroups(fetcher)).rejects.toThrow("BCB respondeu 503");
  });
});
