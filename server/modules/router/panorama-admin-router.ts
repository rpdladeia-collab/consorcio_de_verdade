/**
 * FASE 6: Router tRPC da Camada Analítica V1 — Panorama > Administradoras
 * Expõe exclusivamente as consultas aprovadas no mapa fechado.
 * Nenhuma métrica proprietária, score, ranking ou recomendação é criada.
 */

import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import {
  listAdministradoras,
  listAvailableDataBases,
  getPerfilAdministradora,
  getContemplacoes,
  getSorteios,
  getLances,
  getExclusoes,
  getGrupos,
  getAdesoes,
  getHistoricoAdministradora,
  compararAdministradoras,
  getStatusIngestao,
  getRaioXCompleto,
  getDetalheSegmento,
  getMercadoTotais,
} from "../bc-admin/queries";

const searchTermSchema = z.string().trim().min(2).max(120);
const optionalDataBaseSchema = z.string().optional();
const searchTermsArraySchema = z.array(z.string().trim().min(2).max(120)).min(1).max(10);

export const panoramaAdminRouter = router({
  /**
   * Listar todas as administradoras únicas (ordem alfabética)
   */
  listAdministradoras: publicProcedure
    .input(z.object({ codigoSegmento: z.string().min(1).max(2).optional() }).optional())
    .query(({ input }) => listAdministradoras(input?.codigoSegmento)),

  /**
   * Status da ingestão: lista todas as importações realizadas
   */
  statusIngestao: publicProcedure.query(() => getStatusIngestao()),

  /**
   * Datas-base disponíveis para consulta
   */
  availableDataBases: publicProcedure.query(() => listAvailableDataBases()),

  /**
   * Perfil da administradora: todos os campos oficiais disponíveis
   */
  perfil: publicProcedure
    .input(z.object({ searchTerm: searchTermSchema }))
    .query(({ input }) => getPerfilAdministradora(input.searchTerm)),

  /**
   * Contemplações: separa sorteio e lance (base por UF)
   */
  contemplacoes: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) =>
      getContemplacoes(input.searchTerm, input.dataBase),
    ),

  /**
   * Sorteios: dados de sorteios (base por UF)
   */
  sorteios: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) => getSorteios(input.searchTerm, input.dataBase)),

  /**
   * Lances: dados de lances (base por UF)
   */
  lances: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) => getLances(input.searchTerm, input.dataBase)),

  /**
   * Exclusões: excluídos contemplados e não contemplados (base por UF)
   */
  exclusoes: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) => getExclusoes(input.searchTerm, input.dataBase)),

  /**
   * Grupos: grupos ativos, encerrados e em andamento (base consolidados)
   */
  grupos: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) => getGrupos(input.searchTerm, input.dataBase)),

  /**
   * Adesões: adesões trimestrais (base por UF)
   */
  adesoes: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) => getAdesoes(input.searchTerm, input.dataBase)),

  /**
   * Histórico: séries históricas por administradora
   */
  historico: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        baseOrigem: z.enum(["consolidados", "dados_uf"]).optional(),
      }),
    )
    .query(({ input }) =>
      getHistoricoAdministradora(input.searchTerm, input.baseOrigem),
    ),

  /**
   * Raio-X completo: indicadores + mercado + tendência (Entregas 02-05)
   */
  raioX: publicProcedure
    .input(z.object({ searchTerm: searchTermSchema }))
    .query(({ input }) => getRaioXCompleto(input.searchTerm)),

  /**
   * Detalhe de segmento: grupos e indicadores de um segmento específico (Entrega 06)
   */
  detalheSegmento: publicProcedure
    .input(
      z.object({
        searchTerm: searchTermSchema,
        codigoSegmento: z.string().min(1).max(10),
      }),
    )
    .query(({ input }) => getDetalheSegmento(input.searchTerm, input.codigoSegmento)),

  /**
   * Comparação: lado-a-lado de múltiplas administradoras
   */
  comparar: publicProcedure
    .input(
      z.object({
        searchTerms: searchTermsArraySchema,
        dataBase: optionalDataBaseSchema,
      }),
    )
    .query(({ input }) =>
      compararAdministradoras(input.searchTerms, input.dataBase),
    ),

  /**
   * Totais de mercado para a home (dados reais)
   */
  mercadoTotais: publicProcedure.query(() => getMercadoTotais()),
});
