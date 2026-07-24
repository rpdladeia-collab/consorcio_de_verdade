import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { runZonaHistorico, runZonaQuantitativo } from "../lib/zonaContemplacao2026";

const historicoRowSchema = z.object({
  ass: z.number().min(1),
  low: z.number().min(0).max(100),
  mid: z.number().min(0).max(100),
  high: z.number().min(0).max(100),
});

const quantitativoRowSchema = z.object({
  ass: z.number().min(1),
  sg: z.number().min(0),
  p30: z.number().min(0),
  p50: z.number().min(0),
  clivre: z.number().min(0),
  clim: z.number().min(0),
  c30: z.number().min(0),
  c50: z.number().min(0),
  csort: z.number().min(0),
  outras: z.number().min(0),
});

export const zonaContemplacaoRouter = router({
  /**
   * calcHistorico — Aba 1: Histórico de Contemplações
   * Calcula piso/zona média/teto, tendência, posição do lance, pressão competitiva.
   */
  calcHistorico: publicProcedure
    .input(
      z.object({
        rows: z.array(historicoRowSchema).min(1).max(240),
        meulance: z.number().min(0).max(100),
        metodoZona: z.enum(["media", "mediana"]).default("media"),
        modalidade: z.string(),
        grupoNome: z.string().default(""),
      })
    )
    .mutation(({ input }) => {
      return runZonaHistorico(input);
    }),

  /**
   * calcQuantitativo — Aba 2: Quantitativo das Contemplações
   * Calcula total, índice, média necessária, cobertura, taxa sorteio geral, lance fixo.
   */
  calcQuantitativo: publicProcedure
    .input(
      z.object({
        rows: z.array(quantitativoRowSchema).min(1).max(240),
        selectedIndexes: z.array(z.number().int().min(0)).default([0]),
        hPrazo: z.number().min(1).max(240).default(120),
      })
    )
    .mutation(({ input }) => {
      return runZonaQuantitativo(input);
    }),
});
