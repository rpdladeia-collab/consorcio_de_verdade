import { resolve } from "node:path";
import { config } from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";

const runIntegration = process.env.RUN_PANORAMA_INTEGRATION === "1";
const integration = runIntegration ? describe : describe.skip;

integration("router Panorama BC com Railway real", () => {
  let caller: ReturnType<
    typeof import("./panorama-router").panoramaRouter.createCaller
  >;

  beforeAll(async () => {
    config({
      path: resolve(process.cwd(), ".env.local"),
      quiet: true,
      override: true,
    });
    const { panoramaRouter } = await import("./panorama-router");
    caller = panoramaRouter.createCaller({} as never);
  });

  it("retorna os 19 grupos cuja soma cobre as 125 métricas", async () => {
    const groups = await caller.listGroups();
    expect(groups).toHaveLength(19);
    expect(groups.reduce((total, group) => total + group.metricCount, 0)).toBe(125);
  });

  it("retorna o catálogo oficial completo e permite busca", async () => {
    const metrics = await caller.listMetrics();
    const searched = await caller.listMetrics({ search: "Cotas ativas" });

    expect(metrics).toHaveLength(125);
    expect(searched.length).toBeGreaterThan(0);
    expect(
      searched.every(metric =>
        `${metric.name} ${metric.groupName}`.toLocaleLowerCase("pt-BR").includes("cotas ativas"),
      ),
    ).toBe(true);
  });

  it("entrega série real, cobertura e granularidade para cinco anos", async () => {
    const result = await caller.getMetricData({
      metricId: "1",
      period: "5y",
    });

    expect(result.metric.id).toBe("1");
    expect(result.coverage).toMatchObject({
      earliestDataBase: 201612,
      latestDataBase: 202512,
      observationCount: 10,
    });
    expect(result.granularity.code).toBe("annual-december");
    expect(result.series).toHaveLength(5);
    expect(result.series[0]?.dataBase).toBe(202112);
    expect(result.series.at(-1)?.dataBase).toBe(202512);
    expect(result.series.every(point => point.source === "BCB")).toBe(true);
  });

  it("retorna NOT_FOUND para identificador inexistente", async () => {
    await expect(
      caller.getMetricData({ metricId: "inexistente", period: "all" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
