/**
 * Panorama > Administradoras — V1
 * Entrega 01: Busca das administradoras
 * Campo de busca + select alfabético + navegação para página da administradora
 */
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  interpretarTendencia,
  leituraSegmento,
  percentualSeguro,
  type DirecaoBruta,
  type IndicadorTendencia,
} from "@/lib/panoramaAdministradoras";

// Classificação manual das administradoras (ativo do projeto)
const CLASSIFICACAO: Record<string, string> = {
  "BANCORBRÁS": "Banco",
  "BANRISUL S.A. ADM CONSÓRCIOS": "Banco",
  "BB CONSÓRCIOS": "Banco",
  "BRADESCO CONS. LTDA.": "Banco",
  "ITAÚ ADM DE CONSÓRCIOS LTDA": "Banco",
  "ITAÚ UNIBANCO VEÍCULOS ADM CONS LTDA.": "Banco",
  "SANTANDER BRASIL ADM CONS LTDA": "Banco",
  "ADM CONS SICREDI LTDA": "Cooperativas e Associações",
  "ADM CONS UNICOOB LTDA": "Cooperativas e Associações",
  "SICOOB ADM CONS LTDA.": "Cooperativas e Associações",
  "COOP MISTA ROMA (ANTIGA JOCKEY": "Cooperativas e Associações",
  "COOP MISTA ROMA (ANTIGA JOCKEY  - PROIBIDA": "Cooperativas e Associações",
  "COOPERATIVA MISTA ROMA (ANTIGA JOCKEY) - PROIBIDA": "Cooperativas e Associações",
  "COOPERATIVA MISTA ROMA (EX-JOCKEY": "Cooperativas e Associações",
  "ASSOC BAHIANA DE MEDICINA ABM": "Cooperativas e Associações",
  "ASSOC DOS JUIZES DO RS": "Cooperativas e Associações",
  "CLUBE NAVAL": "Cooperativas e Associações",
  "FUNDACAO HAB. DO EXERCITO-FHE": "Cooperativas e Associações",
  "UNAFISCO-ASS NAC AUD FISC RFB": "Cooperativas e Associações",
  "FED.NAC.ASSOC.SERV.BCO CENTRAL": "Cooperativas e Associações",
};

function getCategoria(nome: string): string {
  return CLASSIFICACAO[nome] || "Administradora Independente";
}

const SEGMENTO_NOMES: Record<string, string> = {
  "1": "Imóveis",
  "2": "Pesados",
  "3": "Automóveis",
  "4": "Motocicletas",
  "5": "Outros",
  "6": "Serviços",
};

function getNomeSegmento(codigo: string): string {
  return SEGMENTO_NOMES[codigo] || `Segmento ${codigo}`;
}

function fmtN(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function fmtPct(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

function fmtMoeda(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Componente: Card de Indicador ──────────────────────────────────────────
function IndicadorCard({ label, value, sublabel, accent }: { label: string; value: string; sublabel?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-4 border shadow-sm ${accent ? "bg-orange-50 border-orange-200" : "bg-white border-[#e5e0d8]"}`}>
      <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1.5">{label}</span>
      <div className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${accent ? "text-[#c2410c]" : "text-[#15140f]"}`}>{value}</div>
      {sublabel && <p className="mt-1 text-[11px] text-[#4b4843] leading-snug font-bold">{sublabel}</p>}
    </div>
  );
}

// ─── Componente: Tendência ──────────────────────────────────────────────────
function TendenciaItemPct({ label, indicador, variacao }: { label: string; indicador: IndicadorTendencia; variacao: { pct: number; direcao: DirecaoBruta } | null }) {
  if (!variacao) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-[#e5e0d8] last:border-0">
        <span className="text-[14px] md:text-[15px] font-bold text-[#15140f]">{label}</span>
        <span className="text-[13px] font-bold text-[#9e9890]">Sem dados</span>
      </div>
    );
  }
  const pct = Math.abs(variacao.pct).toFixed(1) + "%";
  const direcao = interpretarTendencia(indicador, variacao.direcao);
  let color = "text-[#716b60]";
  let bg = "bg-[#f0ede5]";
  if (direcao === "Melhorou") { color = "text-[#2f5233]"; bg = "bg-green-50"; }
  if (direcao === "Piorou") { color = "text-[#c2410c]"; bg = "bg-orange-50"; }
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#e5e0d8] last:border-0">
      <span className="text-[14px] md:text-[15px] font-bold text-[#15140f]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-bold text-[#4b4843]">{pct}</span>
        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${bg} ${color}`}>{direcao}</span>
      </div>
    </div>
  );
}

// ─── Página: Home do Panorama > Administradoras (Fase 8.2) ─────────────────
function ListaAdministradoras({ onSelect }: { onSelect: (nome: string) => void }) {
  const [search, setSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const { data, isLoading, isError } = trpc.panoramaAdmin.listAdministradoras.useQuery();

  // Filtrar resultados de busca para o select
  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return data.filter((a: { nomeAdministradora: string }) => {
      const n = a.nomeAdministradora.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return n.includes(q);
    });
  }, [data, search]);

  // Determinar se uma administradora está selecionada (via busca ou select)
  const selectedNome = selectedOption || (filtered.length === 1 ? filtered[0].nomeAdministradora : "");
  const canAnalyze = !!selectedNome;

  const handleAnalyze = () => {
    if (selectedNome) onSelect(selectedNome);
  };

  // Estrutura visual dos rankings. A consulta consolidada ainda não existe no mapa analítico aprovado.
  function RankingCard({ titulo }: { titulo: string }) {
    return (
      <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#c2410c] mb-4">{titulo}</h3>
        <ol className="space-y-3" aria-label={`${titulo} em desenvolvimento`}>
          {[1, 2, 3].map((posicao) => (
            <li key={posicao} className="flex items-center gap-3 text-[#9e9890]">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#f0ede5] text-[13px] font-bold shrink-0">{posicao}º</span>
              <span className="h-3 rounded-full bg-[#f0ede5] flex-1" />
            </li>
          ))}
        </ol>
        <button type="button" disabled className="mt-4 text-[12px] font-bold text-[#9e9890] cursor-not-allowed" aria-label={`Ranking completo de ${titulo} em desenvolvimento`}>
          Ver ranking completo · Em desenvolvimento
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      {/* ─── BLOCO 1: HERO (reduzido 70%) ─── */}
      <div className="mb-6 md:mb-8">
        <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1.5">
          Panorama BC | Administradoras
        </span>
        <p className="text-[#4b4843] text-[14px] md:text-[15px] leading-relaxed font-bold">
          Dados oficiais do Banco Central dos últimos 24 meses. Pesquise qualquer administradora de consórcio ou explore os principais indicadores do mercado.
        </p>
      </div>

      {/* ─── BLOCO 2: BUSCA (principal) ─── */}
      <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5 md:p-7 shadow-sm mb-8">
        <label htmlFor="busca-administradora" className="block text-[14px] md:text-[15px] font-bold text-[#15140f] mb-3">
          Qual administradora deseja analisar?
        </label>
        <div className="relative mb-3">
          <input
            id="busca-administradora"
            type="search"
            placeholder="Digite o nome da administradora..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedOption("");
            }}
            className="w-full px-4 py-3.5 pr-12 text-[15px] md:text-[16px] font-medium border border-[#d1ccc5] rounded-xl bg-white text-[#15140f] placeholder:text-[#9e9890] focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20 transition-all"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9e9890] pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>

        {/* Resultados filtrados da busca (apenas quando digitando) */}
        {search.trim() && filtered.length > 0 && filtered.length <= 5 && (
          <div className="mb-3 space-y-1.5">
            {filtered.map((adm: { nomeAdministradora: string }) => (
              <button
                key={adm.nomeAdministradora}
                onClick={() => {
                  setSelectedOption(adm.nomeAdministradora);
                  setSearch("");
                }}
                className="w-full text-left px-4 py-2.5 text-[14px] font-bold text-[#15140f] bg-[#f6f3ec] hover:bg-[#f0ede5] rounded-lg transition-colors"
              >
                {adm.nomeAdministradora}
              </button>
            ))}
          </div>
        )}

        {search.trim() && filtered.length > 5 && (
          <p className="mb-3 text-[13px] text-[#4b4843] font-bold">
            {filtered.length} administradoras encontradas. Refine sua busca ou use a lista abaixo.
          </p>
        )}

        {search.trim() && !isLoading && !isError && filtered.length === 0 && (
          <p className="mb-3 text-[13px] text-[#9e9890] font-bold">Nenhuma administradora encontrada para "{search}"</p>
        )}

        {/* Divisor OU */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-[#e5e0d8]"></div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#9e9890]">OU</span>
          <div className="flex-1 h-px bg-[#e5e0d8]"></div>
        </div>

        <label htmlFor="select-administradora" className="block text-[11px] uppercase tracking-wider font-bold text-[#4b4843] mb-2">
          Selecione uma administradora
        </label>
        <select
          id="select-administradora"
          value={selectedOption}
          disabled={isLoading || !data?.length}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full px-4 py-3.5 text-[15px] md:text-[16px] font-medium border border-[#d1ccc5] rounded-xl bg-white text-[#15140f] focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20 transition-all disabled:opacity-60 mb-4"
        >
          <option value="">Selecione uma administradora</option>
          {(data || []).map((adm: { nomeAdministradora: string; cnpjAdministradora: string }) => (
            <option key={adm.cnpjAdministradora + adm.nomeAdministradora} value={adm.nomeAdministradora}>
              {adm.nomeAdministradora}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="w-full px-6 py-3.5 text-[15px] md:text-[16px] font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed enabled:bg-[#c2410c] enabled:text-white enabled:hover:bg-[#a33d0a] bg-[#d1ccc5] text-[#9e9890]"
        >
          ANALISAR
        </button>

        {isError && (
          <p className="mt-3 text-[13px] text-[#c2410c] font-bold text-center">Não foi possível carregar a lista. Atualize a página.</p>
        )}
      </div>

      {/* ─── BLOCO 3: EXPLORAR O MERCADO ─── */}
      <div className="mb-8">
        <h2 className="text-[12px] uppercase tracking-widest font-bold text-[#4b4843] mb-4">Explorar o Mercado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="text-[14px] font-bold text-[#15140f] mb-1">Administradoras</p>
            <p className="text-[12px] text-[#9e9890] font-bold">Em desenvolvimento</p>
          </div>
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="text-[14px] font-bold text-[#15140f] mb-1">Segmentos</p>
            <p className="text-[12px] text-[#9e9890] font-bold">Em desenvolvimento</p>
          </div>
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="text-[14px] font-bold text-[#15140f] mb-1">Rankings</p>
            <p className="text-[12px] text-[#9e9890] font-bold">Veja abaixo</p>
          </div>
        </div>
      </div>

      {/* ─── BLOCO 4: RANKINGS DO MERCADO (TOP 3) ─── */}
      <div className="mb-8">
        <h2 className="text-[12px] uppercase tracking-widest font-bold text-[#4b4843] mb-4">Rankings do Mercado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RankingCard titulo="Top 10 — Cotas Ativas" />
          <RankingCard titulo="Top 10 — Contemplações" />
          <RankingCard titulo="Top 10 — Participação de Mercado" />
          <RankingCard titulo="Top 10 — Grupos Ativos" />
          <RankingCard titulo="Top 10 — Comercialização" />
        </div>
      </div>

      {/* ─── BLOCO 5: MERCADO EM NÚMEROS ─── */}
      <div className="mb-8">
        <h2 className="text-[12px] uppercase tracking-widest font-bold text-[#4b4843] mb-4">Mercado em Números</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="font-mono text-xl md:text-2xl font-bold text-[#15140f]">{isLoading ? "—" : data?.length ?? "—"}</p>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Administradoras</p>
          </div>
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="font-mono text-xl md:text-2xl font-bold text-[#15140f]">6</p>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Segmentos</p>
          </div>
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="font-mono text-xl md:text-2xl font-bold text-[#15140f]">—</p>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Cotas Ativas</p>
          </div>
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="font-mono text-xl md:text-2xl font-bold text-[#15140f]">—</p>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Grupos Ativos</p>
          </div>
          <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 text-center shadow-sm">
            <p className="font-mono text-[14px] md:text-[15px] font-bold text-[#15140f] leading-tight">24 meses</p>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Período</p>
          </div>
        </div>
      </div>

      {/* ─── BLOCO 6: RODAPÉ ─── */}
      <div className="border-t border-[#e5e0d8] pt-5">
        <p className="text-[12px] md:text-[13px] text-[#9e9890] font-bold text-center leading-relaxed">
          Dados oficiais publicados pelo Banco Central do Brasil e atualizados automaticamente pelo motor do Consórcio de Verdade.
        </p>
      </div>
    </div>
  );
}

// ─── Página: Detalhe da Administradora (Entregas 02-07) ─────────────────────
function DetalheAdministradora({ nomeAdm, onBack }: { nomeAdm: string; onBack: () => void }) {
  const [segmentoSelecionado, setSegmentoSelecionado] = useState<string | null>(null);
  const [grupoBusca, setGrupoBusca] = useState("");

  // Raio-X completo: indicadores + mercado + tendência (Entregas 02-05)
  const { data: raioXData, isLoading: raioXLoading, isError: raioXError } = trpc.panoramaAdmin.raioX.useQuery({
    searchTerm: nomeAdm,
  });

  // Contemplações: lance vs sorteio (base trimestral dados_uf)
  const { data: contempData, isError: contempError } = trpc.panoramaAdmin.contemplacoes.useQuery({
    searchTerm: nomeAdm,
  });

  // Detalhe do segmento selecionado (Entrega 06-07)
  const { data: segData, isLoading: segLoading, isError: segError } = trpc.panoramaAdmin.detalheSegmento.useQuery(
    { searchTerm: nomeAdm, codigoSegmento: segmentoSelecionado || "" },
    { enabled: !!segmentoSelecionado },
  );

  const indicadores = raioXData?.indicadores ?? null;
  const mercado = raioXData?.mercado ?? null;
  const tendencia = raioXData?.tendencia ?? null;

  // Processar contemplações (lance vs sorteio)
  const contemp = useMemo(() => {
    if (!contempData || !contempData.dataBase) return null;
    const sorteio = contempData.contemplacoesSorteio || [];
    const lance = contempData.contemplacoesLance || [];

    const parseNum = (v: string | undefined): number => {
      if (!v) return 0;
      return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
    };

    const totalSorteio = sorteio.reduce((s: number, d: any) => {
      return s + parseNum(d["Quantidade_de_consorciados_ativos_contemplados_por_sorteio"]);
    }, 0);
    const totalLance = lance.reduce((s: number, d: any) => {
      return s + parseNum(d["Quantidade_de_consorciados_ativos_contemplados_por_lance"]);
    }, 0);
    const total = totalSorteio + totalLance;

    return {
      dataBase: contempData.dataBase,
      totalSorteio,
      totalLance,
      total,
      pctLance: total > 0 ? (totalLance / total) * 100 : 0,
      pctSorteio: total > 0 ? (totalSorteio / total) * 100 : 0,
    };
  }, [contempData]);

  // Grupos do segmento selecionado (do novo endpoint detalheSegmento)
  const gruposSegmento = useMemo(() => {
    if (!segData?.grupos) return [];
    let grupos = segData.grupos;
    if (grupoBusca.trim()) {
      const q = grupoBusca.toLowerCase();
      grupos = grupos.filter((g) => g.codigoGrupo.toLowerCase().includes(q));
    }
    return grupos.slice(0, 100);
  }, [segData, grupoBusca]);

  const categoria = getCategoria(nomeAdm);
  const pctFila = indicadores ? percentualSeguro(indicadores.totalNaoContempladas, indicadores.totalCotasAtivas) : null;
  const pctFilaMercado = mercado ? percentualSeguro(mercado.totalNaoContempladas, mercado.totalCotas) : null;
  const pctFilaSegmento = segData?.segmento
    ? percentualSeguro(segData.segmento.naoContempladas, segData.segmento.cotasAtivas)
    : null;

  return (
    <div className="min-h-screen" style={{ background: "#f6f3ec" }}>
      {/* Header */}
      <header className="bg-[#15140f] text-white pt-8 pb-6 px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/60 hover:text-white transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar para lista
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
              categoria === "Banco" ? "bg-white text-[#15140f]" :
              categoria === "Cooperativas e Associações" ? "bg-[#2f5233] text-white" :
              "bg-white/10 text-white"
            }`}>
              {categoria}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">{nomeAdm}</h1>
          {raioXData?.dataBase && (
            <p className="text-white/50 text-[12px] font-mono mt-2">Data-base: {raioXData.dataBase}</p>
          )}
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {raioXLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#c2410c] border-t-transparent"></div>
            <p className="mt-3 text-[14px] text-[#4b4843] font-bold">Carregando raio-X...</p>
          </div>
        )}

        {raioXError && (
          <div className="text-center py-16 rounded-xl border border-orange-200 bg-orange-50">
            <p className="text-[15px] text-[#4b4843] font-bold">Erro ao carregar o raio-X. Atualize a página e tente novamente.</p>
          </div>
        )}

        {!raioXLoading && !raioXError && !indicadores && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#4b4843] font-bold">Nenhum dado encontrado para esta administradora.</p>
          </div>
        )}

        {/* ── BLOCO 1: Resumo Executivo Automático ── */}
        {indicadores && mercado && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Raio-X da administradora</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">O que importa nesta operação</h2>
            </div>
            <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
              <p className="text-[15px] md:text-[16px] text-[#15140f] leading-relaxed font-medium">
                <strong className="font-bold">{nomeAdm}</strong> é uma <strong className="font-bold">{categoria.toLowerCase()}</strong> com <strong className="font-bold text-[#c2410c]">{fmtN(indicadores.totalGrupos)} grupos ativos</strong> e <strong className="font-bold text-[#c2410c]">{fmtN(indicadores.totalCotasAtivas)} cotas ativas</strong>. A operação é mais concentrada em <strong className="font-bold">{indicadores.distribuicao[0]?.nome || "seus segmentos principais"}</strong>, que representa <strong className="font-bold text-[#c2410c]">{fmtPct(indicadores.distribuicao[0]?.pctAdm || 0)}</strong> da administradora. {contemp && contemp.total > 0 && <>No dado trimestral mais recente, <strong className="font-bold text-[#c2410c]">{fmtPct(contemp.pctLance)}</strong> das contemplações ocorreram por lance.</>} {" "}A taxa média de administração é <strong className={`font-bold ${indicadores.taxaMedia <= mercado.taxaMedia ? "text-[#2f5233]" : "text-[#c2410c]"}`}>{fmtMoeda(indicadores.taxaMedia)}%</strong>, {indicadores.taxaMedia <= mercado.taxaMedia ? "abaixo" : "acima"} da média do mercado ({fmtMoeda(mercado.taxaMedia)}%). {" "}No mês mais recente, contemplou <strong className="font-bold text-[#2f5233]">{fmtN(indicadores.totalContempladas)} cotas</strong> ({fmtPct(indicadores.pctContempladas)} das ativas). {pctFila !== null ? <>A fila informada corresponde a <strong className="font-bold">{fmtPct(pctFila)}</strong> das cotas ativas.</> : <>A base informa <strong className="font-bold">{fmtN(indicadores.totalNaoContempladas)} cotas não contempladas</strong>; como esse valor supera o total de cotas ativas da mesma data-base, o percentual não é exibido.</>}</p>
            </div>
          </section>
        )}

        {/* ── BLOCO 2: Tamanho da Operação ── */}
        {indicadores && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Tamanho da operação</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Quão grande é esta administradora</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <IndicadorCard label="Categoria" value={categoria} />
              <IndicadorCard label="Grupos ativos" value={fmtN(indicadores.totalGrupos)} accent />
              <IndicadorCard label="Cotas ativas" value={fmtN(indicadores.totalCotasAtivas)} accent />
              <IndicadorCard label="Segmentos" value={fmtN(indicadores.totalSegmentos)} />
              <IndicadorCard label="Participação no mercado" value={fmtPct(indicadores.pctMercado)} sublabel="do total de cotas ativas" />
            </div>
          </section>
        )}

        {/* ── BLOCO 3: Contemplações ── */}
        {indicadores && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Contemplações</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Quantas cotas foram contempladas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <IndicadorCard
                label="Contemplações no mês"
                value={fmtN(indicadores.totalContempladas)}
                sublabel={`${fmtPct(indicadores.pctContempladas)} das cotas ativas`}
                accent
              />
              {mercado && (
                <IndicadorCard
                  label="Média do mercado"
                  value={fmtPct(mercado.pctContempladas)}
                  sublabel="contemplações no mês sobre cotas ativas"
                />
              )}
            </div>
            {/* Comparativo de contemplações com mercado */}
            {mercado && (
              <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 shadow-sm mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Contemplações da adm</span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-lg font-bold text-[#15140f]">{fmtPct(indicadores.pctContempladas)}</span>
                      <span className="text-[12px] font-bold text-[#9e9890]">Mercado: {fmtPct(mercado.pctContempladas)}</span>
                    </div>
                    <span className={`text-[12px] font-bold ${indicadores.pctContempladas >= mercado.pctContempladas ? "text-[#2f5233]" : "text-[#c2410c]"}`}>
                      {indicadores.pctContempladas >= mercado.pctContempladas ? "Contemplação acima da média" : "Contemplação abaixo da média"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Leitura</span>
                    <span className={`text-[12px] font-bold ${indicadores.pctContempladas >= mercado.pctContempladas ? "text-[#2f5233]" : "text-[#c2410c]"}`}>
                      {indicadores.pctContempladas >= mercado.pctContempladas ? "A administradora contempla acima da média no mês" : "A administradora contempla abaixo da média no mês"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Lance vs Sorteio */}
            {contemp && contemp.total > 0 ? (
              <div className="bg-white border border-[#e5e0d8] rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="font-mono text-3xl md:text-4xl font-bold text-[#c2410c]">{fmtPct(contemp.pctLance)}</div>
                    <p className="text-[12px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Por Lance</p>
                    <p className="text-[14px] font-mono text-[#15140f] mt-1">{fmtN(contemp.totalLance)} cotas</p>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-3xl md:text-4xl font-bold text-[#2f5233]">{fmtPct(contemp.pctSorteio)}</div>
                    <p className="text-[12px] uppercase tracking-wider font-bold text-[#4b4843] mt-1">Por Sorteio</p>
                    <p className="text-[14px] font-mono text-[#15140f] mt-1">{fmtN(contemp.totalSorteio)} cotas</p>
                  </div>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden border border-[#e5e0d8]">
                  <div className="bg-[#c2410c] flex items-center justify-center text-white text-[12px] font-bold" style={{ width: `${contemp.pctLance}%` }}>
                    {contemp.pctLance > 15 ? "Lance" : ""}
                  </div>
                  <div className="bg-[#2f5233] flex items-center justify-center text-white text-[12px] font-bold" style={{ width: `${contemp.pctSorteio}%` }}>
                    {contemp.pctSorteio > 15 ? "Sorteio" : ""}
                  </div>
                </div>
                <p className="text-[12px] text-[#9e9890] font-bold mt-3">
                  Data-base: {contemp.dataBase} (base trimestral Dados por UF)
                </p>
              </div>
            ) : contempError ? (
              <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
                <p className="text-[14px] text-[#4b4843] font-bold">
                  Erro ao carregar dados de contemplações. Tente novamente.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#e5e0d8] rounded-xl p-6 shadow-sm">
                <p className="text-[14px] text-[#4b4843] font-bold">
                  Dados de contemplações por lance e sorteio não disponíveis para esta administradora no período mais recente.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── BLOCO 4: Fila de Espera ── */}
        {indicadores && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Fila de espera</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Quantos cotistas aguardam contemplação</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <IndicadorCard
                label="Cotas não contempladas"
                value={fmtN(indicadores.totalNaoContempladas)}
                sublabel={pctFila !== null ? `${fmtPct(pctFila)} das cotas ativas` : "Percentual indisponível: valor superior às cotas ativas"}
                accent
              />
              {mercado && (
                <>
                  <IndicadorCard
                    label="Mercado: não contempladas"
                    value={fmtN(mercado.totalNaoContempladas)}
                    sublabel={pctFilaMercado !== null ? `${fmtPct(pctFilaMercado)} das cotas ativas` : "Percentual indisponível"}
                  />
                  <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Comparativo</span>
                    <span className={`text-[14px] font-bold ${pctFila !== null && pctFilaMercado !== null && pctFila <= pctFilaMercado ? "text-[#2f5233]" : "text-[#c2410c]"}`}>
                      {pctFila !== null && pctFilaMercado !== null ? (pctFila <= pctFilaMercado ? "Fila menor que a média" : "Fila maior que a média") : "Comparativo indisponível nesta competência"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── BLOCO 5: Exclusões ── */}
        {indicadores && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Exclusões</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Índice de exclusão</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <IndicadorCard
                label="Cotas excluídas"
                value={fmtN(indicadores.totalExcluidas)}
                sublabel="Quantidade cumulativa informada pelo BC"
                accent
              />
              {mercado && (
                <>
                  <IndicadorCard
                    label="Mercado: excluídas"
                    value={fmtN(mercado.totalExcluidas)}
                    sublabel="Quantidade cumulativa informada pelo BC"
                  />
                  <div className="bg-white border border-[#e5e0d8] rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Comparativo</span>
                    <div className="space-y-1">
                      <span className="text-[14px] font-bold text-[#716b60]">Indisponível nesta base</span>
                      <span className="block text-[11px] text-[#9e9890] font-bold">O BC publica exclusões acumuladas e cotas ativas como medidas de naturezas diferentes.</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── BLOCO 6: Distribuição da Operação ── */}
        {indicadores && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Distribuição da operação</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Segmentos em operação</h2>
            </div>
            <div className="bg-white border border-[#e5e0d8] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-[#f6f3ec] border-b border-[#e5e0d8]">
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843]">Segmento</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843]">Leitura</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Grupos ativos</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Cotas ativas</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">% na Adm</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">% Mercado</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.distribuicao.map((seg: any, posicao: number) => (
                    <tr
                      key={seg.codigo}
                      onClick={() => setSegmentoSelecionado(segmentoSelecionado === seg.codigo ? null : seg.codigo)}
                      className={`border-b border-[#e5e0d8] last:border-0 cursor-pointer hover:bg-[#f6f3ec] transition-colors ${segmentoSelecionado === seg.codigo ? "bg-[#c2410c]/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-bold text-[#15140f]">{seg.nome}</td>
                      <td className="px-4 py-3 text-[12px] md:text-[13px] text-[#4b4843] font-bold">{leituraSegmento(posicao, indicadores.distribuicao.length)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-[#15140f] text-right">{fmtN(seg.grupos)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-[#15140f] text-right">{fmtN(seg.cotas)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-[#c2410c] text-right font-bold">{fmtPct(seg.pctAdm)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-[#2f5233] text-right font-bold">{fmtPct(seg.pctMercado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-[#9e9890] font-bold mt-2">Clique em um segmento para ver os grupos.</p>
          </section>
        )}

        {/* ── BLOCO 7: Tendência Operacional ── */}
        {indicadores && (
          <section>
            <div className="mb-4">
              <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Tendência operacional</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Últimos 24 meses</h2>
            </div>
            <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
              {tendencia ? (
                <>
                  <TendenciaItemPct label="Cotas ativas" indicador="cotasAtivas" variacao={tendencia.cotasAtivas} />
                  <TendenciaItemPct label="Contemplações no mês" indicador="contemplacoes" variacao={tendencia.contemplacoes} />
                  <TendenciaItemPct label="Exclusões" indicador="exclusoes" variacao={tendencia.exclusoes} />
                  <TendenciaItemPct label="Fila de espera (não contempladas)" indicador="filaEspera" variacao={tendencia.filaEspera} />
                  <TendenciaItemPct label="Grupos ativos" indicador="gruposAtivos" variacao={tendencia.gruposAtivos} />
                  <TendenciaItemPct label="Cotas comercializadas" indicador="cotasComercializadas" variacao={tendencia.cotasComercializadas} />
                  <p className="text-[12px] text-[#9e9890] font-bold mt-3">
                    Comparação entre {tendencia.periodoAntigo} e {tendencia.periodoRecente}.
                  </p>
                </>
              ) : (
                <p className="text-[14px] text-[#4b4843] font-bold py-4">
                  Dados históricos insuficientes para calcular a tendência.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── BLOCO 8: Segmentos (detalhe) ── */}
        {indicadores && segmentoSelecionado && (
              <section>
                <div className="mb-4">
                  <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Segmento: {getNomeSegmento(segmentoSelecionado)}</span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Detalhe do segmento</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {segLoading && (
                    <div className="col-span-full text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#c2410c] border-t-transparent"></div>
                    </div>
                  )}
                  {segError && (
                    <div className="col-span-full text-center py-4 rounded-lg border border-orange-200 bg-orange-50">
                      <p className="text-[14px] text-[#4b4843] font-bold">Erro ao carregar o detalhe do segmento. Tente novamente.</p>
                    </div>
                  )}
                  {segData?.segmento && (
                    <>
                      <IndicadorCard label="Grupos ativos" value={fmtN(segData.segmento.gruposAtivos)} />
                      <IndicadorCard label="Cotas ativas" value={fmtN(segData.segmento.cotasAtivas)} />
                      <IndicadorCard label="Participação no mercado" value={fmtPct(segData.segmento.pctMercado)} accent />
                      <IndicadorCard label="Taxa média" value={fmtMoeda(segData.segmento.taxaMedia) + "%"} />
                      <IndicadorCard label="Contemplações no mês" value={fmtN(segData.segmento.contempladas)} sublabel={fmtPct(segData.segmento.pctContempladas) + " das cotas ativas"} />
                      <IndicadorCard label="Exclusões" value={fmtN(segData.segmento.excluidas)} sublabel="Quantidade cumulativa informada pelo BC" accent />
                      <IndicadorCard label="Fila de espera" value={fmtN(segData.segmento.naoContempladas)} sublabel={pctFilaSegmento !== null ? `${fmtPct(pctFilaSegmento)} das cotas ativas` : "Percentual indisponível nesta competência"} accent />
                    </>
                  )}
                </div>

                {/* ── ENTREGA 07: Grupos ── */}
                <div className="mb-4 mt-8">
                  <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Grupos do segmento</span>
                  <h3 className="text-lg md:text-xl font-bold text-[#15140f] tracking-tight">Pesquisar grupo</h3>
                </div>
                <div className="mb-4">
                  <input
                    type="search"
                    placeholder="Buscar por código do grupo..."
                    value={grupoBusca}
                    onChange={(e) => setGrupoBusca(e.target.value)}
                    className="w-full px-4 py-3 text-[14px] md:text-[15px] font-medium border border-[#d1ccc5] rounded-xl bg-white text-[#15140f] placeholder:text-[#9e9890] focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20 transition-all"
                  />
                </div>
                {gruposSegmento.length > 0 ? (
                  <div className="bg-white border border-[#e5e0d8] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-[#f6f3ec] border-b border-[#e5e0d8]">
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843]">Grupo</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Cotas</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Contempl.</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Excluídas</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Taxa adm.</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">vs. Segmento</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Prazo</th>
                          <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Correção</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gruposSegmento.map((g: any, i: number) => {
                          const totalCotasSeg = segData?.segmento?.cotasAtivas || 0;
                          const relevancia = totalCotasSeg > 0 ? (g.cotasAtivas / totalCotasSeg) * 100 : 0;
                          return (
                            <tr key={i} className="border-b border-[#e5e0d8] last:border-0 hover:bg-[#f6f3ec] transition-colors">
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono font-bold text-[#15140f]">
                                {g.codigoGrupo}
                                <span className="block text-[10px] text-[#c2410c] font-bold">{relevancia.toFixed(1)}% do segmento</span>
                              </td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[#15140f] text-right">{fmtN(g.cotasAtivas)}</td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[#2f5233] text-right">{fmtN(g.cotasContempladas)}</td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[#c2410c] text-right">{fmtN(g.cotasExcluidas)}</td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[#15140f] text-right">{fmtMoeda(g.taxaAdm) + "%"}</td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-right">
                                {(() => {
                                  const segTaxa = segData?.segmento?.taxaMedia || 0;
                                  const diff = g.taxaAdm - segTaxa;
                                  if (Math.abs(diff) < 0.01) return <span className="text-[#716b60] font-bold">≈ média</span>;
                                  return (
                                    <span className={diff > 0 ? "text-[#c2410c] font-bold" : "text-[#2f5233] font-bold"}>
                                      {diff > 0 ? "+" : ""}{fmtMoeda(diff)}%
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[#15140f] text-right">{g.prazoMeses > 0 ? g.prazoMeses + " meses" : "—"}</td>
                              <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[#15140f] text-right">{g.indiceCorrecao || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-[#e5e0d8] rounded-xl p-6 shadow-sm">
                    <p className="text-[14px] text-[#4b4843] font-bold">
                      {grupoBusca ? `Nenhum grupo encontrado para "${grupoBusca}".` : "Nenhum grupo disponível para este segmento."}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Bloco Transparência e Método */}
            <section className="pt-4 border-t border-[#bfb8af]">
              <div className="rounded-xl p-5 border-2 border-[#c2410c]/30 bg-[#c2410c]/5">
                <h3 className="text-[12px] uppercase tracking-widest font-bold text-[#c2410c] mb-3">Transparência e Método</h3>
                <div className="space-y-2 text-[13px] md:text-[14px] text-[#4b4843] leading-relaxed font-bold">
                  <p><strong className="text-[#15140f]">Fonte:</strong> Todos os dados são oficiais do Banco Central do Brasil.</p>
                  <p><strong className="text-[#15140f]">Período:</strong> Dados de julho/2024 a maio/2026 (últimos 24 meses disponíveis).</p>
                  <p><strong className="text-[#15140f]">Classificação:</strong> A categoria (Banco, Administradora Independente, Cooperativas e Associações) é classificação própria do Consórcio de Verdade, não do Banco Central.</p>
                  <p><strong className="text-[#15140f]">Médias de mercado:</strong> Calculadas sobre todas as administradoras, ponderadas por cotas ativas.</p>
                  <p><strong className="text-[#15140f]">Leitura dos percentuais:</strong> quando a base oficial informa um valor que supera o respectivo total de cotas ativas na mesma data-base, o produto exibe a quantidade e não exibe um percentual potencialmente enganoso.</p>
                </div>
              </div>
            </section>
      </main>
    </div>
  );
}

// ─── Página Principal ───────────────────────────────────────────────────────
export default function PanoramaAdministradoras() {
  const [selectedAdm, setSelectedAdm] = useState<string | null>(null);
  const [location, navigate] = useLocation();

  // Sincronizar a seleção com a URL sem atualizar estado durante a renderização.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adm = params.get("adm");
    setSelectedAdm(adm ? decodeURIComponent(adm) : null);
  }, [location]);

  const handleSelect = (nome: string) => {
    setSelectedAdm(nome);
    navigate(`/panorama-administradoras?adm=${encodeURIComponent(nome)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setSelectedAdm(null);
    navigate("/panorama-administradoras");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (selectedAdm) {
    return <DetalheAdministradora nomeAdm={selectedAdm} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#f6f3ec" }}>
      <ListaAdministradoras onSelect={handleSelect} />
    </div>
  );
}
