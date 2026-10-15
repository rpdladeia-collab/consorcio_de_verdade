import { z } from 'zod';
import { createHash } from 'crypto';
import { publicProcedure, router } from '../_core/trpc';
import { simulateEstruturaDoPlano, validatePaymentRanges } from '../lib/estruturaDoPlano';

export const estruturaDoPlanoRouter = router({
  simulate: publicProcedure
    .input(
      z.object({
        credit: z.number().min(0),
        term: z.number().int().min(1).max(300),
        adminRate: z.number().min(0).max(100),
        reserveRate: z.number().min(0).max(100),
        insuranceRate: z.number().min(0).default(0),
        adjustmentRate: z.number().min(0).default(0),
        adjustmentPeriod: z.number().int().default(12),
        firstAdjustmentMonth: z.number().int().default(13),
        paymentPolicyMode: z.enum(['standard', 'ranges']).default('standard'),
        paymentAdjustmentMode: z.enum(['fixed', 'balanceRebase']).default('fixed'),
        paymentRanges: z.array(z.object({
          start: z.number().int().min(1),
          end: z.number().int().min(1),
          type: z.enum(['value', 'percent']),
          value: z.number().min(0),
        })).default([]),
        savingsRate: z.number().min(0).default(0.515),
        cdbRate: z.number().min(0).default(0.795),
        // Lance
        lanceProprio: z.number().min(0).default(0),
        lanceFgts: z.number().min(0).default(0),
        lanceEmbutido: z.number().min(0).default(0),
        baseDoLance: z.enum(['carta', 'categoria']).default('carta'),
        parcelasPagas: z.number().int().min(0).default(0),
        estrategiaPos: z.enum(['abater_parcela', 'reduzir_prazo']).default('abater_parcela'),
      }).superRefine((input, ctx) => {
        if (input.paymentAdjustmentMode === 'balanceRebase' && input.paymentPolicyMode !== 'ranges') {
          ctx.addIssue({ code: 'custom', path: ['paymentPolicyMode'], message: 'O recálculo pelo saldo exige política de parcelas por faixas.' });
          return;
        }
        if (input.paymentPolicyMode !== 'ranges' && input.paymentAdjustmentMode !== 'balanceRebase') return;
        for (const message of validatePaymentRanges(input.paymentRanges, input.term, input.paymentAdjustmentMode, input.adjustmentPeriod, input.adjustmentRate, input.firstAdjustmentMonth)) {
          ctx.addIssue({ code: 'custom', path: ['paymentRanges'], message });
        }
      })
    )
    .mutation(({ input }) => {
      const result = simulateEstruturaDoPlano({
        credit: input.credit,
        term: input.term,
        adminRate: input.adminRate,
        reserveRate: input.reserveRate,
        insuranceRate: input.insuranceRate,
        adjustmentRate: input.adjustmentRate,
        adjustmentPeriod: input.adjustmentPeriod,
        firstAdjustmentMonth: input.firstAdjustmentMonth,
        paymentPolicyMode: input.paymentPolicyMode,
        paymentAdjustmentMode: input.paymentAdjustmentMode,
        paymentRanges: input.paymentRanges,
        savingsRate: input.savingsRate,
        cdbRate: input.cdbRate,
        lanceProprio: input.lanceProprio,
        lanceFgts: input.lanceFgts,
        lanceEmbutido: input.lanceEmbutido,
        baseDoLance: input.baseDoLance,
        parcelasPagas: input.parcelasPagas,
        estrategiaPos: input.estrategiaPos,
      });

      const raw = JSON.stringify({
        ...input,
        paidTotal: result.sums.payment,
      });
      const simulationId = createHash('sha256')
        .update(raw)
        .digest('hex')
        .slice(0, 12)
        .toUpperCase();
      const generatedAt = new Date().toISOString();

      return {
        result,
        parameters: input,
        simulationId,
        generatedAt,
      };
    }),
});
