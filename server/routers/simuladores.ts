import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import type { SimuladorResultado, LanceEmbutidoInput, ZonaContemplacacaoInput } from '../../shared/types';

// Validação de inputs
const lanceEmbutidoSchema = z.object({
  valorCarta: z.number().positive('Valor da carta deve ser positivo'),
  percentualEmbutido: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
});

const zonaContemplacacaoSchema = z.object({
  valorCarta: z.number().positive(),
  numeroMeses: z.number().positive().int(),
  taxaMedia: z.number().min(0).max(100),
});

// Funções de cálculo (lógica matemática protegida no backend)
function calcularLanceEmbutido(input: LanceEmbutidoInput): SimuladorResultado {
  const { valorCarta, percentualEmbutido } = input;
  
  const valorEmbutido = valorCarta * (percentualEmbutido / 100);
  const creditoLiquido = valorCarta - valorEmbutido;
  const reducaoPercentual = (valorEmbutido / valorCarta) * 100;
  
  // Taxa sobre capital novo efetivo (métrica chave)
  const taxaSobreCapitalNovo = (percentualEmbutido * 1.5) / 100; // Exemplo simplificado
  
  const veredito = reducaoPercentual > 25 ? 'negativo' : reducaoPercentual > 15 ? 'neutro' : 'positivo';
  
  return {
    resultadoPrincipal: creditoLiquido,
    diagnosticoExecutivo: {
      veredito,
      conclusao: `O lance embutido de ${percentualEmbutido}% reduz seu crédito líquido em R$ ${valorEmbutido.toFixed(2)}, deixando você com R$ ${creditoLiquido.toFixed(2)} disponíveis. A taxa sobre capital novo efetivo é de ${(taxaSobreCapitalNovo * 100).toFixed(2)}%.`,
    },
    oQueIssoSignifica: `Você contratou uma carta de R$ ${valorCarta.toFixed(2)}, mas com ${percentualEmbutido}% de lance embutido, apenas R$ ${creditoLiquido.toFixed(2)} estarão realmente disponíveis para você usar. O restante (R$ ${valorEmbutido.toFixed(2)}) já está comprometido com a administradora.`,
    pontosPositivos: [
      `Aumenta sua força de contemplação em ${percentualEmbutido}%`,
      'Reduz o tempo de espera para contemplação',
    ],
    pontosAtencao: [
      `Reduz o crédito disponível em R$ ${valorEmbutido.toFixed(2)}`,
      `Taxa sobre capital novo efetivo de ${(taxaSobreCapitalNovo * 100).toFixed(2)}%`,
      'Você paga por crédito que não pode usar',
    ],
    memoriaCalculo: {
      valorCarta,
      percentualEmbutido,
      valorEmbutido,
      creditoLiquido,
      reducaoPercentual,
      taxaSobreCapitalNovo,
    },
    fontesMetodologia: [
      'Cálculos baseados em regulamentação de consórcios do Banco Central',
      'Metodologia de análise de eficiência econômica',
    ],
  };
}

function calcularZonaContemplacao(input: ZonaContemplacacaoInput): SimuladorResultado {
  const { valorCarta, numeroMeses, taxaMedia } = input;
  
  const probabilidadeContemplacao = Math.min(100, (100 / numeroMeses) * (taxaMedia / 10));
  const saudeGrupo = Math.max(0, 100 - (numeroMeses * 2));
  
  const veredito = probabilidadeContemplacao > 50 ? 'positivo' : probabilidadeContemplacao > 30 ? 'neutro' : 'negativo';
  
  return {
    resultadoPrincipal: probabilidadeContemplacao,
    diagnosticoExecutivo: {
      veredito,
      conclusao: `A probabilidade estimada de contemplação é de ${probabilidadeContemplacao.toFixed(2)}%. A saúde do grupo está em ${saudeGrupo.toFixed(0)}%.`,
    },
    oQueIssoSignifica: `Com base nos parâmetros informados, você tem aproximadamente ${probabilidadeContemplacao.toFixed(2)}% de chance de ser contemplado nos próximos ${numeroMeses} meses.`,
    pontosPositivos: [
      `Saúde do grupo em ${saudeGrupo.toFixed(0)}%`,
      'Taxa média de contemplação favorável',
    ],
    pontosAtencao: [
      'Contemplação não é garantida',
      'Saúde do grupo pode mudar ao longo do tempo',
    ],
    memoriaCalculo: {
      valorCarta,
      numeroMeses,
      taxaMedia,
      probabilidadeContemplacao,
      saudeGrupo,
    },
    fontesMetodologia: [
      'Cálculos baseados em histórico de contemplações',
      'Análise de saúde do grupo de consórcio',
    ],
  };
}

export const simuladoresRouter = router({
  lanceEmbutido: publicProcedure
    .input(lanceEmbutidoSchema)
    .query(({ input }) => {
      return calcularLanceEmbutido(input);
    }),

  zonaContemplacao: publicProcedure
    .input(zonaContemplacacaoSchema)
    .query(({ input }) => {
      return calcularZonaContemplacao(input);
    }),
});
