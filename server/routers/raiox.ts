import { z } from 'zod';
import { createHash } from 'crypto';
import { publicProcedure, router } from '../_core/trpc';
import { buildSchedule } from '../lib/raiox';
import { runContemplation } from '../lib/contemplacao';

export const raioxRouter = router({
  /**
   * Módulo 1 — Simule seu plano
   * Gera o fluxo mensal completo do consórcio com parcela linear ou não linear.
   * Fonte oficial: HTML Raio-x do Consórcio (buildSchedule).
   */
  simulePlano: publicProcedure
    .input(
      z.object({
        credit: z.number().min(0),
        term: z.number().int().min(1).max(240),
        adminRate: z.number().min(0).max(1000),
        reserveRate: z.number().min(0).max(1000),
        insuranceRate: z.number().min(0).default(0),
        adjRate: z.number().min(0).default(0),
        adjEvery: z.enum(['0', '6', '12']).default('12'),
        mode: z.enum(['linear', 'nonlinear']).default('linear'),
        ranges: z.string().default(''),
      })
    )
    .mutation(({ input }) => {
      const schedule = buildSchedule({
        credit: input.credit,
        term: input.term,
        adminRate: input.adminRate,
        reserveRate: input.reserveRate,
        insuranceRate: input.insuranceRate,
        adjRate: input.adjRate,
        adjEvery: Number(input.adjEvery),
        mode: input.mode,
        ranges: input.ranges,
      });

      // Hash único da simulação: SHA-256 dos inputs + total pago (12 hex chars)
      const raw = JSON.stringify({ ...input, paidTotal: schedule.paidTotal });
      const simulationId = createHash('sha256').update(raw).digest('hex').slice(0, 12).toUpperCase();
      const generatedAt = new Date().toISOString();

      return { ...schedule, simulationId, generatedAt };
    }),

  /**
   * Módulo 2 — Contemplação
   * Calcula força de lance, carta líquida, parcela pós-lance e projeção completa.
   * Fonte oficial: HTML Raio-x do Consórcio (runContemplation + buildContemplationProjection).
   */
  contemplacao: publicProcedure
    .input(
      z.object({
        // Campos do plano
        credit: z.number().min(0),
        term: z.number().int().min(1).max(240),
        adminRate: z.number().min(0).max(1000),
        reserveRate: z.number().min(0).max(1000),
        adjRate: z.number().min(0).default(0),
        adjEvery: z.enum(['0', '6', '12']).default('12'),
        mode: z.enum(['linear', 'nonlinear']).default('linear'),
        ranges: z.string().default(''),
        // Campos específicos da contemplação
        paidMonths: z.number().int().min(0).default(0),
        base: z.enum(['credit', 'category']).default('credit'),
        own: z.number().min(0).default(0),
        fgts: z.number().min(0).default(0),
        embedded: z.number().min(0).default(0),
      })
    )
    .mutation(({ input }) => {
      const result = runContemplation({
        credit: input.credit,
        term: input.term,
        adminRate: input.adminRate,
        reserveRate: input.reserveRate,
        adjRate: input.adjRate,
        adjEvery: Number(input.adjEvery),
        mode: input.mode,
        ranges: input.ranges,
        paidMonths: input.paidMonths,
        base: input.base,
        own: input.own,
        fgts: input.fgts,
        embedded: input.embedded,
      });

      // Hash único da simulação
      const raw = JSON.stringify({ ...input, forcePct: result.forcePct });
      const simulationId = createHash('sha256').update(raw).digest('hex').slice(0, 12).toUpperCase();
      const generatedAt = new Date().toISOString();

      return { ...result, simulationId, generatedAt };
    }),
});
