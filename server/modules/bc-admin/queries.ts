/**
 * FASE 6: Consultas da Camada Analítica da V1
 * Implementa estritamente o mapa fechado aprovado.
 * Consulta os dados ingeridos das duas bases oficiais:
 * - Dados Consolidados (Segmentos, Bens Imóveis, Bens Móveis)
 * - Dados por UF
 *
 * Modelo linha a linha: cada linha CSV = 1 linha no banco (Alternativa A)
 * Nenhuma métrica proprietária, score, ranking ou recomendação é criada.
 * Apenas dados oficiais do Banco Central são expostos.
 */

import { getDb } from "../../db";
import { bcImportacoes, bcDadosLinha } from "../../../drizzle/schema";
import { eq, and, desc, inArray, like, ne } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Banco de dados indisponível para consultas analíticas");
  }
  return db;
}

/**
 * Normalizar nome de administradora para busca (remove acentos, maiúsculas)
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Verificar se um nome de administradora corresponde ao termo de busca
 */
function matchesAdminName(rowName: string, searchTerm: string): boolean {
  const normalizedRow = normalizeName(rowName);
  const normalizedSearch = normalizeName(searchTerm);
  return normalizedRow.includes(normalizedSearch);
}

/**
 * Obter linhas do banco por data-base e opcionalmente por base de origem
 * Retorna as linhas individuais (cada linha = 1 linha CSV do BC)
 */
async function getLinhasByDataBase(
  dataBase: string,
  baseOrigem?: "consolidados" | "dados_uf",
) {
  const db = await requireDb();

  // Buscar importações bem-sucedidas para esta data-base
  const importacoes = await db
    .select()
    .from(bcImportacoes)
    .where(
      and(
        eq(bcImportacoes.dataBase, dataBase),
        eq(bcImportacoes.status, "sucesso"),
        baseOrigem
          ? eq(bcImportacoes.baseOrigem, baseOrigem)
          : undefined,
      ),
    );

  if (importacoes.length === 0) {
    return [];
  }

  const importacaoIds = importacoes.map((imp) => imp.id);

  // Buscar linhas individuais associadas
  const linhas = await db
    .select()
    .from(bcDadosLinha)
    .where(inArray(bcDadosLinha.importacaoId, importacaoIds));

  // Deserializar dadosLinha (JSON) para obter os campos oficiais
  return linhas.map((linha) => ({
    ...linha,
    dadosLinha: JSON.parse(linha.dadosLinha) as Record<string, string>,
    cabecalhosOriginais: linha.cabecalhosOriginais
      ? JSON.parse(linha.cabecalhosOriginais) as string[]
      : null,
  }));
}

/**
 * Filtrar linhas por nome de administradora usando a coluna nomeAdministradora
 */
function filterLinhasByAdminName<
  T extends { nomeAdministradora: string },
>(linhas: T[], searchTerm: string): T[] {
  return linhas.filter((linha) =>
    matchesAdminName(linha.nomeAdministradora, searchTerm),
  );
}

/**
 * Listar todas as administradoras únicas em ordem alfabética
 * Retorna nome e CNPJ para o select de busca
 */
export async function listAdministradoras() {
  const db = await requireDb();
  const results = await db
    .selectDistinct({
      nomeAdministradora: bcDadosLinha.nomeAdministradora,
      cnpjAdministradora: bcDadosLinha.cnpjAdministradora,
    })
    .from(bcDadosLinha)
    .where(ne(bcDadosLinha.nomeAdministradora, ""))
    .orderBy(bcDadosLinha.nomeAdministradora);

  return results;
}

/**
 * Listar todas as datas-base disponíveis na base
 */
export async function listAvailableDataBases() {
  const db = await requireDb();
  const results = await db
    .select({
      dataBase: bcImportacoes.dataBase,
      baseOrigem: bcImportacoes.baseOrigem,
      status: bcImportacoes.status,
      nomeZip: bcImportacoes.nomeZip,
      quantidadeArquivos: bcImportacoes.quantidadeArquivosExtraidos,
      quantidadeLinhas: bcImportacoes.quantidadeLinhasImportadas,
    })
    .from(bcImportacoes)
    .where(eq(bcImportacoes.status, "sucesso"))
    .orderBy(desc(bcImportacoes.dataBase));

  return results;
}

/**
 * Consulta 1: PERFIL DA ADMINISTRADORA
 * Retorna todos os campos oficiais disponíveis para a administradora
 * nas duas bases (Consolidados e Dados por UF) na data-base mais recente
 */
export async function getPerfilAdministradora(searchTerm: string) {
  const db = await requireDb();

  // Obter a data-base mais recente com sucesso
  const latestImport = await db
    .select()
    .from(bcImportacoes)
    .where(eq(bcImportacoes.status, "sucesso"))
    .orderBy(desc(bcImportacoes.dataBase))
    .limit(1);

  if (latestImport.length === 0) {
    return { searchTerm, dataBase: null, consolidados: [], dadosUf: [] };
  }

  const dataBase = latestImport[0].dataBase;

  // Buscar dados consolidados (linha a linha)
  const consolidadosLinhas = await getLinhasByDataBase(dataBase, "consolidados");
  // Buscar dados por UF (linha a linha)
  const dadosUfLinhas = await getLinhasByDataBase(dataBase, "dados_uf");

  // Filtrar por administradora
  const consolidadosFiltrados = filterLinhasByAdminName(consolidadosLinhas, searchTerm);
  const dadosUfFiltrados = filterLinhasByAdminName(dadosUfLinhas, searchTerm);

  // Agrupar por tipoDados para manter compatibilidade com a estrutura de saída
  const consolidadosAgrupados: Record<string, any>[] = [];
  const tiposConsolidados = Array.from(new Set(consolidadosFiltrados.map((l) => l.tipoDados)));
  for (const tipo of tiposConsolidados) {
    const linhasTipo = consolidadosFiltrados.filter((l) => l.tipoDados === tipo);
    const primeiro = linhasTipo[0];
    consolidadosAgrupados.push({
      tipoDados: tipo,
      nomeArquivoOriginal: primeiro.nomeArquivoOriginal,
      cabecalhosOriginais: primeiro.cabecalhosOriginais,
      quantidadeLinhas: linhasTipo.length,
      dados: linhasTipo.map((l) => l.dadosLinha),
    });
  }

  const dadosUfAgrupados: Record<string, any>[] = [];
  const tiposUf = Array.from(new Set(dadosUfFiltrados.map((l) => l.tipoDados)));
  for (const tipo of tiposUf) {
    const linhasTipo = dadosUfFiltrados.filter((l) => l.tipoDados === tipo);
    const primeiro = linhasTipo[0];
    dadosUfAgrupados.push({
      tipoDados: tipo,
      nomeArquivoOriginal: primeiro.nomeArquivoOriginal,
      cabecalhosOriginais: primeiro.cabecalhosOriginais,
      quantidadeLinhas: linhasTipo.length,
      dados: linhasTipo.map((l) => l.dadosLinha),
    });
  }

  return {
    searchTerm,
    dataBase,
    consolidados: consolidadosAgrupados,
    dadosUf: dadosUfAgrupados,
  };
}

/**
 * Consulta 2: CONTEMPLAÇÕES
 * Retorna dados de contemplações (por sorteio e por lance) da base por UF
 * e totais consolidados, filtrados por administradora
 */
export async function getContemplacoes(
  searchTerm: string,
  dataBase?: string,
) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(
        and(
          eq(bcImportacoes.status, "sucesso"),
          eq(bcImportacoes.baseOrigem, "dados_uf"),
        ),
      )
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { searchTerm, dataBase: null, contemplacoesSorteio: [], contemplacoesLance: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const dadosUf = await getLinhasByDataBase(dataBase, "dados_uf");
  const filtered = filterLinhasByAdminName(dadosUf, searchTerm);

  const contemplacoesSorteio: Record<string, any>[] = [];
  const contemplacoesLance: Record<string, any>[] = [];

  for (const linha of filtered) {
    const keys = Object.keys(linha.dadosLinha);
    const hasSorteio = keys.some((k) => k.toLowerCase().includes("sorteio"));
    const hasLance = keys.some((k) => k.toLowerCase().includes("lance"));

    if (hasSorteio) {
      contemplacoesSorteio.push({
        tipoDados: linha.tipoDados,
        ...linha.dadosLinha,
      });
    }
    if (hasLance) {
      contemplacoesLance.push({
        tipoDados: linha.tipoDados,
        ...linha.dadosLinha,
      });
    }
  }

  return {
    searchTerm,
    dataBase,
    contemplacoesSorteio,
    contemplacoesLance,
  };
}

/**
 * Consulta 3: SORTEIOS
 * Retorna dados de sorteios da base por UF, filtrados por administradora
 */
export async function getSorteios(searchTerm: string, dataBase?: string) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(
        and(
          eq(bcImportacoes.status, "sucesso"),
          eq(bcImportacoes.baseOrigem, "dados_uf"),
        ),
      )
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { searchTerm, dataBase: null, sorteios: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const dadosUf = await getLinhasByDataBase(dataBase, "dados_uf");
  const filtered = filterLinhasByAdminName(dadosUf, searchTerm);
  const sorteios: Record<string, any>[] = [];

  for (const linha of filtered) {
    const keys = Object.keys(linha.dadosLinha);
    if (keys.some((k) => k.toLowerCase().includes("sorteio"))) {
      sorteios.push({ tipoDados: linha.tipoDados, ...linha.dadosLinha });
    }
  }

  return { searchTerm, dataBase, sorteios };
}

/**
 * Consulta 4: LANCES
 * Retorna dados de lances da base por UF, filtrados por administradora
 */
export async function getLances(searchTerm: string, dataBase?: string) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(
        and(
          eq(bcImportacoes.status, "sucesso"),
          eq(bcImportacoes.baseOrigem, "dados_uf"),
        ),
      )
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { searchTerm, dataBase: null, lances: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const dadosUf = await getLinhasByDataBase(dataBase, "dados_uf");
  const filtered = filterLinhasByAdminName(dadosUf, searchTerm);
  const lances: Record<string, any>[] = [];

  for (const linha of filtered) {
    const keys = Object.keys(linha.dadosLinha);
    if (keys.some((k) => k.toLowerCase().includes("lance"))) {
      lances.push({ tipoDados: linha.tipoDados, ...linha.dadosLinha });
    }
  }

  return { searchTerm, dataBase, lances };
}

/**
 * Consulta 5: EXCLUSÕES
 * Retorna dados de exclusões (excluídos contemplados e não contemplados)
 * da base por UF, filtrados por administradora
 */
export async function getExclusoes(searchTerm: string, dataBase?: string) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(
        and(
          eq(bcImportacoes.status, "sucesso"),
          eq(bcImportacoes.baseOrigem, "dados_uf"),
        ),
      )
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { searchTerm, dataBase: null, exclusoes: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const dadosUf = await getLinhasByDataBase(dataBase, "dados_uf");
  const filtered = filterLinhasByAdminName(dadosUf, searchTerm);
  const exclusoes: Record<string, any>[] = [];

  for (const linha of filtered) {
    const keys = Object.keys(linha.dadosLinha);
    if (keys.some((k) => k.toLowerCase().includes("exclu"))) {
      exclusoes.push({ tipoDados: linha.tipoDados, ...linha.dadosLinha });
    }
  }

  return { searchTerm, dataBase, exclusoes };
}

/**
 * Consulta 6: GRUPOS
 * Retorna dados de grupos (ativos, encerrados, em andamento)
 * das bases consolidadas, filtrados por administradora
 */
export async function getGrupos(searchTerm: string, dataBase?: string) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(
        and(
          eq(bcImportacoes.status, "sucesso"),
          eq(bcImportacoes.baseOrigem, "consolidados"),
        ),
      )
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { searchTerm, dataBase: null, grupos: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const consolidados = await getLinhasByDataBase(dataBase, "consolidados");
  const filtered = filterLinhasByAdminName(consolidados, searchTerm);
  const grupos: Record<string, any>[] = [];

  for (const linha of filtered) {
    // Filtrar apenas tipos de dados que contêm informações de grupos
    if (
      linha.tipoDados.includes("grupos") ||
      linha.tipoDados.includes("segmentos")
    ) {
      grupos.push({
        tipoDados: linha.tipoDados,
        nomeArquivoOriginal: linha.nomeArquivoOriginal,
        ...linha.dadosLinha,
      });
    }
  }

  return { searchTerm, dataBase, grupos };
}

/**
 * Consulta 7: ADESÕES
 * Retorna dados de adesões trimestrais da base por UF, filtrados por administradora
 */
export async function getAdesoes(searchTerm: string, dataBase?: string) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(
        and(
          eq(bcImportacoes.status, "sucesso"),
          eq(bcImportacoes.baseOrigem, "dados_uf"),
        ),
      )
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { searchTerm, dataBase: null, adesoes: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const dadosUf = await getLinhasByDataBase(dataBase, "dados_uf");
  const filtered = filterLinhasByAdminName(dadosUf, searchTerm);
  const adesoes: Record<string, any>[] = [];

  for (const linha of filtered) {
    const keys = Object.keys(linha.dadosLinha);
    if (keys.some((k) => k.toLowerCase().includes("ades"))) {
      adesoes.push({ tipoDados: linha.tipoDados, ...linha.dadosLinha });
    }
  }

  return { searchTerm, dataBase, adesoes };
}

/**
 * Consulta 8: HISTÓRICO
 * Retorna séries históricas de todos os dados-base disponíveis
 * para uma administradora específica
 */
export async function getHistoricoAdministradora(
  searchTerm: string,
  baseOrigem?: "consolidados" | "dados_uf",
) {
  const db = await requireDb();

  // Listar todas as datas-base disponíveis
  const importacoes = await db
    .select()
    .from(bcImportacoes)
    .where(
      and(
        eq(bcImportacoes.status, "sucesso"),
        baseOrigem ? eq(bcImportacoes.baseOrigem, baseOrigem) : undefined,
      ),
    )
    .orderBy(desc(bcImportacoes.dataBase));

  const historico: Array<{
    dataBase: string;
    baseOrigem: string;
    tiposDados: Array<{
      tipoDados: string;
      nomeArquivoOriginal: string;
      quantidadeLinhas: number;
      linhasFiltradas: number;
    }>;
  }> = [];

  for (const imp of importacoes) {
    const linhas = await db
      .select()
      .from(bcDadosLinha)
      .where(eq(bcDadosLinha.importacaoId, imp.id));

    // Filtrar por administradora usando a coluna nomeAdministradora
    const filtered = filterLinhasByAdminName(linhas, searchTerm);

    // Agrupar por tipoDados
    const tiposMap = new Map<string, { nomeArquivoOriginal: string; total: number; filtradas: number }>();
    for (const linha of linhas) {
      const existing = tiposMap.get(linha.tipoDados);
      if (existing) {
        existing.total++;
      } else {
        tiposMap.set(linha.tipoDados, {
          nomeArquivoOriginal: linha.nomeArquivoOriginal,
          total: 1,
          filtradas: 0,
        });
      }
    }
    for (const linha of filtered) {
      const entry = tiposMap.get(linha.tipoDados);
      if (entry) entry.filtradas++;
    }

    const tiposDados: Array<{
      tipoDados: string;
      nomeArquivoOriginal: string;
      quantidadeLinhas: number;
      linhasFiltradas: number;
    }> = [];
    for (const [tipo, info] of Array.from(tiposMap)) {
      if (info.filtradas > 0) {
        tiposDados.push({
          tipoDados: tipo,
          nomeArquivoOriginal: info.nomeArquivoOriginal,
          quantidadeLinhas: info.total,
          linhasFiltradas: info.filtradas,
        });
      }
    }

    if (tiposDados.length > 0) {
      historico.push({
        dataBase: imp.dataBase,
        baseOrigem: imp.baseOrigem,
        tiposDados,
      });
    }
  }

  return { searchTerm, historico };
}

/**
 * Consulta 8b: RAIO-X COMPLETO DA ADMINISTRADORA (Entregas 02-05)
 * Retorna indicadores agregados + comparativos de mercado + tendência
 */
export async function getRaioXCompleto(searchTerm: string) {
  const db = await requireDb();

  // Obter a data-base mais recente com sucesso (consolidados)
  const latestImport = await db
    .select()
    .from(bcImportacoes)
    .where(
      and(
        eq(bcImportacoes.status, "sucesso"),
        eq(bcImportacoes.baseOrigem, "consolidados"),
      ),
    )
    .orderBy(desc(bcImportacoes.dataBase))
    .limit(1);

  if (latestImport.length === 0) {
    return { searchTerm, dataBase: null, indicadores: null, mercado: null, tendencia: null };
  }

  const dataBase = latestImport[0].dataBase;

  // Buscar todas as linhas de segmentos_consolidados para esta data-base
  const allLinhas = await getLinhasByDataBase(dataBase, "consolidados");
  const segLinhas = allLinhas.filter((l) => l.tipoDados === "segmentos_consolidados");

  // Filtrar linhas da administradora
  const admLinhas = filterLinhasByAdminName(segLinhas, searchTerm);

  if (admLinhas.length === 0) {
    return { searchTerm, dataBase, indicadores: null, mercado: null, tendencia: null };
  }

  // Helper: parse número brasileiro (vírgula decimal)
  const parseNum = (v: string | undefined): number => {
    if (!v) return 0;
    return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
  };

  // Calcular indicadores da administradora
  let totalGrupos = 0;
  let totalCotasAtivas = 0;
  let totalContempladas = 0;
  let totalNaoContempladas = 0;
  let totalExcluidas = 0;
  let totalCotasComercializadas = 0;
  let taxaPond = 0;
  let taxaPeso = 0;
  const segMap = new Map<string, { grupos: number; cotas: number; taxa: number; taxaPeso: number; contempladas: number; naoContempladas: number; excluidas: number }>();

  for (const linha of admLinhas) {
    const d = linha.dadosLinha;
    const cod = d["Código_do_segmento"] || d["Codigo_do_segmento"] || "?";
    const grupos = parseInt(d["Quantidade_de_grupos_ativos"] || "0") || 0;
    const cotas = parseNum(d["Quantidade_de_cotas_ativas_em_dia"] || d["Quantidade_de_cotas_ativas"] || "0");
    const contempladas = parseNum(d["Quantidade_de_cotas_ativas_contempladas_no_mês"] || "0");
    const naoContempladas = parseNum(d["Quantidade_de_cotas_ativas_não_contempladas"] || "0");
    const excluidas = parseNum(d["Quantidade_de_cotas_excluídas"] || "0");
    const comercializadas = parseNum(d["Quantidade_de_cotas_comercializadas_no_mês"] || "0");
    const taxa = parseNum(d["Taxa_de_administração"] || "0");

    totalGrupos += grupos;
    totalCotasAtivas += cotas;
    totalContempladas += contempladas;
    totalNaoContempladas += naoContempladas;
    totalExcluidas += excluidas;
    totalCotasComercializadas += comercializadas;

    if (cotas > 0) {
      taxaPond += taxa * cotas;
      taxaPeso += cotas;
    }

    const existing = segMap.get(cod);
    if (existing) {
      existing.grupos += grupos;
      existing.cotas += cotas;
      existing.contempladas += contempladas;
      existing.naoContempladas += naoContempladas;
      existing.excluidas += excluidas;
      existing.taxa += taxa * cotas;
      existing.taxaPeso += cotas;
    } else {
      segMap.set(cod, { grupos, cotas, taxa: taxa * cotas, taxaPeso: cotas, contempladas, naoContempladas, excluidas });
    }
  }

  const taxaMedia = taxaPeso > 0 ? taxaPond / taxaPeso : 0;

  // Calcular totais de mercado (todas as administradoras)
  let mercadoGrupos = 0;
  let mercadoCotas = 0;
  let mercadoContempladas = 0;
  let mercadoNaoContempladas = 0;
  let mercadoExcluidas = 0;
  let mercadoTaxaPond = 0;
  let mercadoTaxaPeso = 0;
  const mercadoSegMap = new Map<string, { grupos: number; cotas: number }>();

  for (const linha of segLinhas) {
    const d = linha.dadosLinha;
    const cod = d["Código_do_segmento"] || d["Codigo_do_segmento"] || "?";
    const grupos = parseInt(d["Quantidade_de_grupos_ativos"] || "0") || 0;
    const cotas = parseNum(d["Quantidade_de_cotas_ativas_em_dia"] || d["Quantidade_de_cotas_ativas"] || "0");
    const contempladas = parseNum(d["Quantidade_de_cotas_ativas_contempladas_no_mês"] || "0");
    const naoContempladas = parseNum(d["Quantidade_de_cotas_ativas_não_contempladas"] || "0");
    const excluidas = parseNum(d["Quantidade_de_cotas_excluídas"] || "0");
    const taxa = parseNum(d["Taxa_de_administração"] || "0");

    mercadoGrupos += grupos;
    mercadoCotas += cotas;
    mercadoContempladas += contempladas;
    mercadoNaoContempladas += naoContempladas;
    mercadoExcluidas += excluidas;
    if (cotas > 0) {
      mercadoTaxaPond += taxa * cotas;
      mercadoTaxaPeso += cotas;
    }

    const existing = mercadoSegMap.get(cod);
    if (existing) {
      existing.grupos += grupos;
      existing.cotas += cotas;
    } else {
      mercadoSegMap.set(cod, { grupos, cotas });
    }
  }

  const mercadoTaxaMedia = mercadoTaxaPeso > 0 ? mercadoTaxaPond / mercadoTaxaPeso : 0;

  // Distribuição por segmento com participação no mercado
  const distribuicao = Array.from(segMap.entries()).map(([cod, v]) => ({
    codigo: cod,
    nome: SEGMENTOS_NOMES[cod] || `Segmento ${cod}`,
    grupos: v.grupos,
    cotas: v.cotas,
    pctAdm: totalCotasAtivas > 0 ? (v.cotas / totalCotasAtivas) * 100 : 0,
    pctMercado: mercadoSegMap.get(cod)?.cotas ? (v.cotas / (mercadoSegMap.get(cod)!.cotas)) * 100 : 0,
    taxaMedia: v.taxaPeso > 0 ? v.taxa / v.taxaPeso : 0,
    contempladas: v.contempladas,
    naoContempladas: v.naoContempladas,
    excluidas: v.excluidas,
  })).sort((a, b) => b.cotas - a.cotas);

  const indicadores = {
    totalGrupos,
    totalCotasAtivas,
    totalContempladas,
    totalNaoContempladas,
    totalExcluidas,
    totalCotasComercializadas,
    totalSegmentos: segMap.size,
    taxaMedia,
    pctContempladas: totalCotasAtivas > 0 ? (totalContempladas / totalCotasAtivas) * 100 : 0,
    pctNaoContempladas: totalCotasAtivas > 0 ? (totalNaoContempladas / totalCotasAtivas) * 100 : 0,
    pctExcluidas: totalCotasAtivas > 0 ? (totalExcluidas / totalCotasAtivas) * 100 : 0,
    pctMercado: mercadoCotas > 0 ? (totalCotasAtivas / mercadoCotas) * 100 : 0,
    distribuicao,
  };

  const mercado = {
    totalGrupos: mercadoGrupos,
    totalCotas: mercadoCotas,
    totalContempladas: mercadoContempladas,
    totalNaoContempladas: mercadoNaoContempladas,
    totalExcluidas: mercadoExcluidas,
    taxaMedia: mercadoTaxaMedia,
    pctContempladas: mercadoCotas > 0 ? (mercadoContempladas / mercadoCotas) * 100 : 0,
    pctNaoContempladas: mercadoCotas > 0 ? (mercadoNaoContempladas / mercadoCotas) * 100 : 0,
    pctExcluidas: mercadoCotas > 0 ? (mercadoExcluidas / mercadoCotas) * 100 : 0,
  };

  // Tendência: comparar mês mais recente com 12 meses atrás (ou o mais antigo disponível)
  const allImportacoes = await db
    .select()
    .from(bcImportacoes)
    .where(
      and(
        eq(bcImportacoes.status, "sucesso"),
        eq(bcImportacoes.baseOrigem, "consolidados"),
      ),
    )
    .orderBy(desc(bcImportacoes.dataBase));

  const tendencia = await calcularTendencia(searchTerm, allImportacoes, parseNum);

  return { searchTerm, dataBase, indicadores, mercado, tendencia };
}

/** Mapeamento oficial de códigos de segmento para nomes amigáveis */
const SEGMENTOS_NOMES: Record<string, string> = {
  "1": "Imóveis",
  "2": "Pesados",
  "3": "Automóveis",
  "4": "Motocicletas",
  "5": "Outros",
  "6": "Serviços",
};

/** Calcular tendência operacional comparando período mais recente com o mais antigo disponível */
async function calcularTendencia(
  searchTerm: string,
  importacoes: Array<{ id: number; dataBase: string }>,
  parseNum: (v: string | undefined) => number,
) {
  if (importacoes.length < 2) return null;

  const recente = importacoes[0];
  // Buscar o mais antigo (último da lista ordenada desc)
  const antigo = importacoes[importacoes.length - 1];

  // Calcular indicadores para o período mais recente
  const calcPeriodo = async (importId: number) => {
    const linhas = await db.select().from(bcDadosLinha).where(
      and(
        eq(bcDadosLinha.importacaoId, importId),
        eq(bcDadosLinha.tipoDados, "segmentos_consolidados"),
      ),
    );
    const filtered = filterLinhasByAdminName(linhas, searchTerm);

    let grupos = 0, cotas = 0, contempladas = 0, excluidas = 0, naoContempladas = 0, comercializadas = 0;
    for (const linha of filtered) {
      const d = JSON.parse(linha.dadosLinha) as Record<string, string>;
      grupos += parseInt(d["Quantidade_de_grupos_ativos"] || "0") || 0;
      cotas += parseNum(d["Quantidade_de_cotas_ativas_em_dia"] || d["Quantidade_de_cotas_ativas"] || "0");
      contempladas += parseNum(d["Quantidade_de_cotas_ativas_contempladas_no_mês"] || "0");
      naoContempladas += parseNum(d["Quantidade_de_cotas_ativas_não_contempladas"] || "0");
      excluidas += parseNum(d["Quantidade_de_cotas_excluídas"] || "0");
      comercializadas += parseNum(d["Quantidade_de_cotas_comercializadas_no_mês"] || "0");
    }
    return { grupos, cotas, contempladas, excluidas, naoContempladas, comercializadas };
  };

  const db = await requireDb();
  const valRecente = await calcPeriodo(recente.id);
  const valAntigo = await calcPeriodo(antigo.id);

  const calcVar = (antigo: number, recente: number): { pct: number; direcao: "Crescendo" | "Estável" | "Diminuindo" } => {
    if (antigo === 0) return { pct: 0, direcao: "Estável" };
    const pct = ((recente - antigo) / antigo) * 100;
    const direcao = pct > 5 ? "Crescendo" : pct < -5 ? "Diminuindo" : "Estável";
    return { pct, direcao };
  };

  return {
    periodoAntigo: antigo.dataBase,
    periodoRecente: recente.dataBase,
    cotasAtivas: calcVar(valAntigo.cotas, valRecente.cotas),
    contemplacoes: calcVar(valAntigo.contempladas, valRecente.contempladas),
    exclusoes: calcVar(valAntigo.excluidas, valRecente.excluidas),
    filaEspera: calcVar(valAntigo.naoContempladas, valRecente.naoContempladas),
    gruposAtivos: calcVar(valAntigo.grupos, valRecente.grupos),
    cotasComercializadas: calcVar(valAntigo.comercializadas, valRecente.comercializadas),
  };
}

/**
 * Consulta 8c: DETALHE DE SEGMENTO (Entrega 06)
 * Retorna indicadores de um segmento específico de uma administradora
 */
export async function getDetalheSegmento(searchTerm: string, codigoSegmento: string) {
  const db = await requireDb();

  const latestImport = await db
    .select()
    .from(bcImportacoes)
    .where(
      and(
        eq(bcImportacoes.status, "sucesso"),
        eq(bcImportacoes.baseOrigem, "consolidados"),
      ),
    )
    .orderBy(desc(bcImportacoes.dataBase))
    .limit(1);

  if (latestImport.length === 0) {
    return { searchTerm, dataBase: null, segmento: null, grupos: [] };
  }

  const dataBase = latestImport[0].dataBase;
  const allLinhas = await getLinhasByDataBase(dataBase, "consolidados");

  const parseNum = (v: string | undefined): number => {
    if (!v) return 0;
    return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
  };

  // Grupos da administradora neste segmento (bens_imoveis_grupos e bens_moveis_grupos)
  const gruposLinhas = allLinhas.filter((l) =>
    (l.tipoDados === "bens_imoveis_grupos" || l.tipoDados === "bens_moveis_grupos") &&
    l.codigoSegmento === codigoSegmento,
  );
  const admGrupos = filterLinhasByAdminName(gruposLinhas, searchTerm);

  // Indicadores agregados do segmento (segmentos_consolidados)
  const segLinhas = allLinhas.filter((l) => l.tipoDados === "segmentos_consolidados" && l.codigoSegmento === codigoSegmento);
  const admSeg = filterLinhasByAdminName(segLinhas, searchTerm);

  let gruposAtivos = 0, cotasAtivas = 0, excluidas = 0, contempladas = 0, naoContempladas = 0;
  let taxaPond = 0, taxaPeso = 0;
  for (const l of admSeg) {
    const d = l.dadosLinha;
    gruposAtivos += parseInt(d["Quantidade_de_grupos_ativos"] || "0") || 0;
    cotasAtivas += parseNum(d["Quantidade_de_cotas_ativas_em_dia"] || d["Quantidade_de_cotas_ativas"] || "0");
    excluidas += parseNum(d["Quantidade_de_cotas_excluídas"] || "0");
    contempladas += parseNum(d["Quantidade_de_cotas_ativas_contempladas_no_mês"] || "0");
    naoContempladas += parseNum(d["Quantidade_de_cotas_ativas_não_contempladas"] || "0");
    const taxa = parseNum(d["Taxa_de_administração"] || "0");
    if (cotasAtivas > 0) { taxaPond += taxa * cotasAtivas; taxaPeso += cotasAtivas; }
  }

  // Mercado do segmento
  let mercadoCotas = 0, mercadoExcluidas = 0, mercadoContempladas = 0, mercadoNaoContempladas = 0;
  for (const l of segLinhas) {
    const d = l.dadosLinha;
    mercadoCotas += parseNum(d["Quantidade_de_cotas_ativas_em_dia"] || d["Quantidade_de_cotas_ativas"] || "0");
    mercadoExcluidas += parseNum(d["Quantidade_de_cotas_excluídas"] || "0");
    mercadoContempladas += parseNum(d["Quantidade_de_cotas_ativas_contempladas_no_mês"] || "0");
    mercadoNaoContempladas += parseNum(d["Quantidade_de_cotas_ativas_não_contempladas"] || "0");
  }

  const segmento = {
    codigo: codigoSegmento,
    nome: SEGMENTOS_NOMES[codigoSegmento] || `Segmento ${codigoSegmento}`,
    gruposAtivos,
    cotasAtivas,
    excluidas,
    contempladas,
    naoContempladas,
    taxaMedia: taxaPeso > 0 ? taxaPond / taxaPeso : 0,
    pctExcluidas: cotasAtivas > 0 ? (excluidas / cotasAtivas) * 100 : 0,
    pctContempladas: cotasAtivas > 0 ? (contempladas / cotasAtivas) * 100 : 0,
    pctMercado: mercadoCotas > 0 ? (cotasAtivas / mercadoCotas) * 100 : 0,
    mercadoPctExcluidas: mercadoCotas > 0 ? (mercadoExcluidas / mercadoCotas) * 100 : 0,
    mercadoPctContempladas: mercadoCotas > 0 ? (mercadoContempladas / mercadoCotas) * 100 : 0,
  };

  // Lista de grupos individuais
  const grupos = admGrupos.map((l) => {
    const d = l.dadosLinha;
    return {
      codigoGrupo: d["Código_do_grupo"] || d["Codigo_do_grupo"] || "?",
      valorMedioBem: parseNum(d["Valor_médio_do_bem"] || "0"),
      indiceCorrecao: d["Índice_de_correção"] || "—",
      taxaAdm: parseNum(d["Taxa_de_administração"] || "0"),
      prazoMeses: parseInt(d["Prazo_do_grupo_em_meses"] || "0") || 0,
      cotasAtivas: parseNum(d["Quantidade_de_cotas_ativas_em_dia"] || "0"),
      cotasContempladas: parseNum(d["Quantidade_de_cotas_ativas_contempladas_no_mês"] || "0"),
      cotasExcluidas: parseNum(d["Quantidade_de_cotas_excluídas"] || "0"),
      cotasQuitadas: parseNum(d["Quantidade_de_cotas_ativas_quitadas"] || "0"),
      cotasCreditoPendente: parseNum(d["Quantidade_de_cotas_ativas_com_crédito_pendente_de_utilização"] || "0"),
    };
  }).sort((a, b) => b.cotasAtivas - a.cotasAtivas);

  return { searchTerm, dataBase, segmento, grupos };
}

/**
 * Consulta 9: COMPARAÇÃO ENTRE ADMINISTRADORAS
 * Retorna dados lado-a-lado de múltiplas administradoras
 * para a mesma data-base e tipo de dado
 */
export async function compararAdministradoras(
  searchTerms: string[],
  dataBase?: string,
) {
  const db = await requireDb();

  if (!dataBase) {
    const latest = await db
      .select()
      .from(bcImportacoes)
      .where(eq(bcImportacoes.status, "sucesso"))
      .orderBy(desc(bcImportacoes.dataBase))
      .limit(1);
    if (latest.length === 0) {
      return { dataBase: null, comparacao: [] };
    }
    dataBase = latest[0].dataBase;
  }

  const allLinhas = await getLinhasByDataBase(dataBase);

  const comparacao: Array<{
    searchTerm: string;
    baseOrigem: string;
    tipoDados: string;
    dados: Record<string, string>[];
  }> = [];

  for (const searchTerm of searchTerms) {
    const filtered = filterLinhasByAdminName(allLinhas, searchTerm);
    // Agrupar por tipoDados
    const tiposMap = new Map<string, { baseOrigem: string; dados: Record<string, string>[] }>();
    for (const linha of filtered) {
      const existing = tiposMap.get(linha.tipoDados);
      if (existing) {
        existing.dados.push(linha.dadosLinha);
      } else {
        tiposMap.set(linha.tipoDados, {
          baseOrigem: linha.baseOrigem,
          dados: [linha.dadosLinha],
        });
      }
    }
    for (const [tipo, info] of Array.from(tiposMap)) {
      if (info.dados.length > 0) {
        comparacao.push({
          searchTerm,
          baseOrigem: info.baseOrigem,
          tipoDados: tipo,
          dados: info.dados,
        });
      }
    }
  }

  return { dataBase, comparacao };
}

/**
 * Consulta 10: STATUS DA INGESTÃO
 * Retorna o status completo de todas as importações realizadas
 */
export async function getStatusIngestao() {
  const db = await requireDb();
  const importacoes = await db
    .select()
    .from(bcImportacoes)
    .orderBy(desc(bcImportacoes.dataImportacao));

  return importacoes.map((imp) => ({
    id: imp.id,
    dataBase: imp.dataBase,
    baseOrigem: imp.baseOrigem,
    nomeZip: imp.nomeZip,
    status: imp.status,
    quantidadeArquivos: imp.quantidadeArquivosExtraidos,
    quantidadeLinhas: imp.quantidadeLinhasImportadas,
    dataImportacao: imp.dataImportacao,
  }));
}

/**
 * Consulta 11: TOTAIS DE MERCADO
 * Retorna os totais reais calculados a partir dos dados importados
 * para exibição no bloco "Mercado em Números" da home.
 */
export async function getMercadoTotais() {
  const db = await requireDb();

  // Data-base mais recente
  const latest = await db
    .select()
    .from(bcImportacoes)
    .where(eq(bcImportacoes.status, "sucesso"))
    .orderBy(desc(bcImportacoes.dataBase))
    .limit(1);

  if (latest.length === 0) {
    return null;
  }

  const dataBase = latest[0].dataBase;

  // Buscar todas as linhas da data-base mais recente (base segmentos_consolidados)
  const linhas = await getLinhasByDataBase(dataBase);

  const linhasConsolidadas = linhas.filter(
    (l) => l.tipoDados === "segmentos_consolidados",
  );

  // Helper: parse número brasileiro (vírgula decimal)
  const parseNum = (v: string | undefined): number => {
    if (!v) return 0;
    return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
  };

  // Administradoras únicas
  const admsSet = new Set<string>();
  // Segmentos únicos
  const segmentosSet = new Set<string>();
  // Acumuladores
  let totalCotasAtivas = 0;
  let totalGrupos = 0;

  for (const linha of linhasConsolidadas) {
    const d = linha.dadosLinha;
    // As colunas normalizadas preservam o identificador oficial sem depender
    // de variações de grafia no cabeçalho CSV.
    if (linha.nomeAdministradora) admsSet.add(linha.nomeAdministradora);
    if (linha.codigoSegmento) segmentosSet.add(linha.codigoSegmento);

    totalCotasAtivas += parseNum(
      d["Quantidade_de_cotas_ativas_em_dia"] || d["Quantidade_de_cotas_ativas"] || "0",
    );
    totalGrupos += parseInt(d["Quantidade_de_grupos_ativos"] || "0") || 0;
  }

  return {
    dataBase,
    administradoras: admsSet.size,
    segmentos: segmentosSet.size,
    cotasAtivas: totalCotasAtivas,
    gruposAtivos: totalGrupos,
    periodoMeses: 24,
  };
}
