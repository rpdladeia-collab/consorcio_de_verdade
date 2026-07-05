import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { calcLanceEmbutido } from '../lib/lanceEmbutido';
import { calcZonaContemplacao } from '../lib/zonaContemplacao';
import { calcLanceLivre } from '../lib/lanceLivre';
import { calcLanceCartaXCategoria } from '../lib/lanceCartaXCategoria';

// Validação de inputs do Lance Embutido — modo simples usa apenas credit + embeddedPct,
// os demais campos têm defaults sensatos para o modo avançado.
const lanceEmbutidoSchema = z.object({
  credit: z.number().positive('A carta de crédito deve ser positiva'),
  embeddedPct: z.number().min(0).max(100),
  adminRate: z.number().min(0).max(100).default(25),
  reserveRate: z.number().min(0).max(100).default(0),
  term: z.number().int().min(1).max(300).default(180),
  lanceBase: z.enum(['carta', 'category']).default('carta'),
  embeddedLimitPct: z.number().min(0).max(100).default(30),
  ownBid: z.number().min(0).default(0),
  targetPrice: z.number().min(0).default(0),
});

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
  lanceEmbutido: publicProcedure
    .input(lanceEmbutidoSchema)
    .mutation(({ input }) => {
      return calcLanceEmbutido(input);
    }),

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
});
