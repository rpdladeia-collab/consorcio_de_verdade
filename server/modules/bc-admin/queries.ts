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
import { eq, and, desc, inArray, like } from "drizzle-orm";

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
