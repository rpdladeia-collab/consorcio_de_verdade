import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../../../_core/trpc";
import {
  getPanoramaMetric,
  getPanoramaMetricCoverage,
  getPanoramaMetricSeries,
  listPanoramaGroups,
  listPanoramaMetrics,
} from "../data/panorama-repository";
import {
  PERIOD_PRESETS,
  resolvePeriod,
  type PeriodPreset,
} from "../domain/period";

const metricFiltersSchema = z
  .object({
    groupId: z.string().trim().min(1).max(64).optional(),
    search: z.string().trim().max(120).optional(),
  })
  .optional();

const metricDataSchema = z.object({
  metricId: z.string().trim().min(1).max(64),
  period: z.enum(PERIOD_PRESETS).default("all"),
  customStartDataBase: z.number().int().optional(),
  customEndDataBase: z.number().int().optional(),
});

function inferGranularity(dataBases: number[]): {
  code: "annual-december" | "annual" | "quarterly" | "monthly" | "irregular";
  label: string;
} {
  if (dataBases.length < 2) {
    return { code: "irregular", label: "Cobertura insuficiente para inferir frequência" };
  }

  const months = new Set(dataBases.map(dataBase => dataBase % 100));
  const monthIndexes = dataBases.map(dataBase => {
    const year = Math.floor(dataBase / 100);
    return year * 12 + (dataBase % 100) - 1;
  });
  const intervals = monthIndexes.slice(1).map((value, index) => value - monthIndexes[index]);

  if (intervals.every(interval => interval === 12)) {
    if (months.size === 1 && months.has(12)) {
      return { code: "annual-december", label: "Série anual — bases de dezembro" };
    }
    return { code: "annual", label: "Série anual" };
  }
  if (intervals.every(interval => interval === 3)) {
    return { code: "quarterly", label: "Série trimestral" };
  }
  if (intervals.every(interval => interval === 1)) {
    return { code: "monthly", label: "Série mensal" };
  }
  return { code: "irregular", label: "Série com frequência irregular" };
}

export const panoramaRouter = router({
  listGroups: publicProcedure.query(() => listPanoramaGroups()),

  listMetrics: publicProcedure
    .input(metricFiltersSchema)
    .query(({ input }) => listPanoramaMetrics(input ?? {})),

  getMetricData: publicProcedure
    .input(metricDataSchema)
    .query(async ({ input }) => {
      const metric = await getPanoramaMetric(input.metricId);
      if (!metric) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Métrica do Panorama BC não encontrada",
        });
      }

      const coverage = await getPanoramaMetricCoverage(metric.id);
      if (!coverage) {
        return {
          metric,
          coverage: null,
          period: null,
          granularity: {
            code: "irregular" as const,
            label: "Métrica sem observações disponíveis",
          },
          series: [],
          source: {
            organization: "Banco Central do Brasil",
            dataset: "Panorama do Sistema de Consórcios",
          },
        };
      }

      let period;
      try {
        period = resolvePeriod(
          {
            preset: input.period as PeriodPreset,
            customStartDataBase: input.customStartDataBase,
            customEndDataBase: input.customEndDataBase,
          },
          coverage,
        );
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Período inválido",
        });
      }

      const [series, fullSeries] = await Promise.all([
        getPanoramaMetricSeries(metric.id, period.startDataBase, period.endDataBase),
        getPanoramaMetricSeries(
          metric.id,
          coverage.earliestDataBase,
          coverage.latestDataBase,
        ),
      ]);

      return {
        metric,
        coverage,
        period,
        granularity: inferGranularity(fullSeries.map(point => point.dataBase)),
        series,
        source: {
          organization: "Banco Central do Brasil",
          dataset: "Panorama do Sistema de Consórcios",
        },
      };
    }),
});
