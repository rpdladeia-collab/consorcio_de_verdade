import { z } from 'zod';
import { createHash } from 'crypto';
import { publicProcedure, router } from '../_core/trpc';
import { buildSchedule } from '../lib/raiox';
import { runContemplation } from '../lib/contemplacao';
import { runOperationCost } from '../lib/custoOperacao';
import { runEfficiency } from '../lib/proporcaoTaxa';
import { runCorrections } from '../lib/historicoCorrecoes';
import { runAutoPayable } from '../lib/autoPagavel';
import { runCancelamento } from '../lib/cancelamento';


export const raioxRouter = router({
  /**
   * Módulo 1 — Simule seu plano
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
      const raw = JSON.stringify({ ...input, paidTotal: schedule.paidTotal });
      const simulationId = createHash('sha256').update(raw).digest('hex').slice(0, 12).toUpperCase();
      const generatedAt = new Date().toISOString();
      return { ...schedule, simulationId, generatedAt };
    }),

  /**
   * Módulo 2 — Contemplação
   */
  contemplacao: publicProcedure
    .input(
      z.object({
        credit: z.number().min(0),
        term: z.number().int().min(1).max(240),
        adminRate: z.number().min(0).max(1000),
        reserveRate: z.number().min(0).max(1000),
        adjRate: z.number().min(0).default(0),
        adjEvery: z.enum(['0', '6', '12']).default('12'),
        mode: z.enum(['linear', 'nonlinear']).default('linear'),
        ranges: z.string().default(''),
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
      const raw = JSON.stringify({ ...input, forcePct: result.forcePct });
      const simulationId = createHash('sha256').update(raw).digest('hex').slice(0, 12).toUpperCase();
      const generatedAt = new Date().toISOString();
      return { ...result, simulationId, generatedAt };
    }),

  /**
   * Módulo 3 — Custo da Operação
   */
  custoOperacao: publicProcedure
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
      return runOperationCost({
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
    }),

  /**
   * Módulo 4 — Proporção da Taxa
   */
  proporcaoTaxa: publicProcedure
    .input(
      z.object({
        credit: z.number().min(0),
        adminPct: z.number().min(0).max(1000),
        paid: z.number().min(0).default(0),
        own: z.number().min(0).default(0),
        fgts: z.number().min(0).default(0),
        embedded: z.number().min(0).default(0),
        basis: z.enum(['newMoney', 'liquidCredit']).default('newMoney'),
        totalParcelas: z.number().int().min(1).max(360).optional(),
      })
    )
    .mutation(({ input }) => {
      return runEfficiency({
        credit: input.credit,
        adminPct: input.adminPct,
        paid: input.paid,
        own: input.own,
        fgts: input.fgts,
        embedded: input.embedded,
        basis: input.basis,
        totalParcelas: input.totalParcelas,
      });
    }),

  /**
   * Módulo 5 — Histórico de Correções
   */
  historicoCorrecoes: publicProcedure
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
      return runCorrections({
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
    }),

  /**
   * Módulo 6 — Auto Pagável?
   */
  autoPagavel: publicProcedure
    .input(
      z.object({
        credit: z.number().min(0),
        term: z.number().int().min(1).max(240),
        adminRate: z.number().min(0).max(1000),
        reserveRate: z.number().min(0).max(1000),
        appreciation: z.number().min(0).default(5),
        annualReturn: z.number().min(0).default(10),
        initial: z.number().min(0).default(0),
        budget: z.number().min(0).default(0),
        contMonth: z.number().int().min(1).default(18),
        own: z.number().min(0).default(0),
        embedded: z.number().min(0).default(0),
        rent: z.number().min(0).default(0),
        mode: z.enum(['linear', 'nonlinear']).default('linear'),
        ranges: z.string().default(''),
      })
    )
    .mutation(({ input }) => {
      return runAutoPayable({
        credit: input.credit,
        term: input.term,
        adminRate: input.adminRate,
        reserveRate: input.reserveRate,
        appreciation: input.appreciation,
        annualReturn: input.annualReturn,
        initial: input.initial,
        budget: input.budget,
        contMonth: input.contMonth,
        own: input.own,
        embedded: input.embedded,
        rent: input.rent,
        mode: input.mode,
        ranges: input.ranges,
      });
    }),

  /**
   * Módulo 9 — Custo de Cancelamento
   */
  cancelamento: publicProcedure
    .input(
      z.object({
        credit: z.number().min(0),
        totalMonths: z.number().int().min(1).max(360),
        canceledMonth: z.number().int().min(1).max(360),
        insurancePct: z.number().min(0),
        adminRatePct: z.number().min(0),
        reserveRatePct: z.number().min(0),
        reajustPct: z.number().min(0),
        reajustPeriod: z.number().int().min(1),
        reserveReturnable: z.boolean(),
        penaltyRatePct: z.number().min(0),
        correctionPct: z.number().min(0),
        cdiAnnualPct: z.number().min(0),
      })
    )
    .mutation(({ input }) => {
      return runCancelamento(input);
    }),

});
