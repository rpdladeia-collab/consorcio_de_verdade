import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { calcLanceEmbutido } from '../lib/lanceEmbutido';

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

export const simuladoresRouter = router({
  lanceEmbutido: publicProcedure
    .input(lanceEmbutidoSchema)
    .mutation(({ input }) => {
      return calcLanceEmbutido(input);
    }),
});
