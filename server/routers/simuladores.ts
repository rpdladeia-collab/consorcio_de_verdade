import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { calcZonaContemplacao } from '../lib/zonaContemplacao';
import { calcLanceLivre } from '../lib/lanceLivre';
import { calcLanceCartaXCategoria } from '../lib/lanceCartaXCategoria';
import { calcVendaCartaContemplada, calculateFixedTermContemplation } from '../lib/vendaCartaContemplada';

const zonaContemplacaoSchema = z.object({
  rows: z
    .array(
      z.object({
        ass: z.number().min(0),
        low: z.number().min(0).max(200),
        mid: z.number().min(0).max(200),
        high: z.number().min(0).max(200),
      })
    )
    .min(1, 'Informe ao menos uma assembleia'),
  myBid: z.number().min(0).max(200),
  method: z.enum(['media', 'mediana']).default('media'),
  modalidade: z.string().default('Lance livre'),
});

const lanceLivreSchema = z.object({
  credit: z.number().positive('A carta de crédito deve ser positiva'),
  adminRate: z.number().min(0).max(100).default(20),
  term: z.number().int().min(1).max(300).default(180),
  paidInstallments: z.number().int().min(0).max(300).default(0),
  bidPct: z.number().min(0).max(100),
  referenceBidPct: z.number().min(0).max(100).default(45),
  lanceUse: z.enum(['abater_parcela', 'reduzir_prazo']).default('abater_parcela'),
});

export const simuladoresRouter = router({
  zonaContemplacao: publicProcedure
    .input(zonaContemplacaoSchema)
    .mutation(({ input }) => {
      return calcZonaContemplacao(input);
    }),

  lanceLivre: publicProcedure
    .input(lanceLivreSchema)
    .mutation(({ input }) => {
      return calcLanceLivre(input);
    }),

  lanceCartaXCategoria: publicProcedure
    .input(z.object({
      credit: z.number().positive(),
      adminRate: z.number().min(0).max(100),
      bidPct: z.number().min(0).max(100),
    }))
    .mutation(({ input }) => {
      return calcLanceCartaXCategoria(input);
    }),

  vendaCartaContemplada: publicProcedure
    .input(z.object({
      valorInicial: z.number().positive(),
      parcelaInicial: z.number().positive(),
      indiceAnualPct: z.number().min(0),
      parcelaContemplacao: z.number().int().min(1),
      prazoTotal: z.number().int().min(1),
      taxaRepasseMensalRaw: z.string(),
      taxaFormato: z.enum(["auto", "percent", "factor"]),
      lanceEmbutido: z.number().min(0),
      lanceRealizado: z.number().min(0),
    }))
    .mutation(({ input }) => {
      return calcVendaCartaContemplada(
        input.valorInicial,
        input.parcelaInicial,
        input.indiceAnualPct,
        input.parcelaContemplacao,
        input.prazoTotal,
        input.taxaRepasseMensalRaw,
        input.taxaFormato,
        input.lanceEmbutido,
        input.lanceRealizado
      );
    }),

  vendaCartaContempladaFixedTerm: publicProcedure
    .input(z.object({
      valorInicial: z.number().positive(),
      parcelaInicial: z.number().positive(),
      indiceAnualPct: z.number().min(0),
      prazoTotal: z.number().int().min(1),
      lanceRealizado: z.number().min(0),
      taxaRepasseMensalRaw: z.string(),
      taxaFormato: z.enum(["auto", "percent", "factor"]),
    }))
    .mutation(({ input }) => {
      return calculateFixedTermContemplation(
        input.valorInicial,
        input.parcelaInicial,
        input.indiceAnualPct,
        input.prazoTotal,
        input.lanceRealizado,
        input.taxaRepasseMensalRaw,
        input.taxaFormato
      );
    }),
});
