/**
 * Panorama > Administradoras — V2
 * Redesenho completo para seguir o padrão visual do Consórcio de Verdade.
 * Coluna esquerda = inputs | Coluna direita = outputs/inteligência.
 * Raio-X organizado em 8 blocos lógicos, como demais módulos do site.
 */
import { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  interpretarTendencia,
  leituraSegmento,
  percentualSeguro,
  type DirecaoBruta,
  type IndicadorTendencia,
} from "@/lib/panoramaAdministradoras";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import WaitingAnalysisScreen from "@/components/cdv/WaitingAnalysisScreen";
import {
  KpiCard,
  DiagnosticCard,
  MeaningBlock,
  TransparencyBlock,
  ConsultCTA,
  SectionTitle,
  formatBRL,
  formatPct,
  type Verdict,
} from "@/components/cdv/SimuladorUI";
import { ArrowLeft, Search, Loader2, Building2, TrendingUp, Users, GitBranch, BarChart3, Eye, ShieldCheck } from "lucide-react";

// ─── Classificação manual das administradoras ─────────────────────────────────
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

function fmtPctLocal(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

function fmtMoeda(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Componente: Tendência (estilo CDV) ───────────────────────────────────────
function TendenciaItem({ label, indicador, variacao }: { label: string; indicador: IndicadorTendencia; variacao: { pct: number; direcao: DirecaoBruta } | null }) {
  if (!variacao) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
        <span className="text-[14px] md:text-[15px] font-bold text-white">{label}</span>
        <span className="text-[13px] font-bold text-white/30">Sem dados</span>
      </div>
    );
  }
  const pct = Math.abs(variacao.pct).toFixed(1) + "%";
  const direcao = interpretarTendencia(indicador, variacao.direcao);
  let color = "text-white/60";
  let bg = "bg-white/5";
  if (direcao === "Melhorou") { color = "text-[var(--positive)]"; bg = "bg-[color-mix(in_oklch,var(--positive)_15%,transparent)]"; }
  if (direcao === "Piorou") { color = "text-[var(--orange)]"; bg = "bg-[color-mix(in_oklch,var(--orange)_15%,transparent)]"; }
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <span className="text-[14px] md:text-[15px] font-bold text-white">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-bold text-white/70">{pct}</span>
        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${bg} ${color}`}>{direcao}</span>
      </div>
    </div>
  );
}

// ─── Bloco do Raio-X (wrapper visual consistente) ─────────────────────────────
function RaioXBlock({ eyebrow, title, children, icon: Icon }: { eyebrow: string; title: string; children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[var(--orange)]" />}
        <div>
          <p className="eyebrow text-[var(--orange)] mb-0.5">{eyebrow}</p>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELA INICIAL — Coluna esquerda: inputs | Coluna direita: o que descobrirá
// ═══════════════════════════════════════════════════════════════════════════════
function ListaAdministradoras({ onSelect }: { onSelect: (nome: string) => void }) {
  const [search, setSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [segmentoFiltro, setSegmentoFiltro] = useState("todos");
  const { data, isLoading, isError } = trpc.panoramaAdmin.listAdministradoras.useQuery(
    segmentoFiltro === "todos" ? undefined : { codigoSegmento: segmentoFiltro },
  );
  const { data: totais } = trpc.panoramaAdmin.mercadoTotais.useQuery();

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (search.trim()) {
      const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      list = list.filter((a: { nomeAdministradora: string }) => {
        const n = a.nomeAdministradora.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return n.includes(q);
      });
    }
    if (categoriaFiltro !== "todas") {
      list = list.filter((a: { nomeAdministradora: string }) => getCategoria(a.nomeAdministradora) === categoriaFiltro);
    }
    return list;
  }, [data, search, categoriaFiltro]);

  const selectedNome = selectedOption || (filtered.length === 1 ? filtered[0].nomeAdministradora : "");
  const canAnalyze = !!selectedNome;

  const handleAnalyze = () => {
    if (selectedNome) onSelect(selectedNome);
  };

  const fmtMilhoes = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " milhões de";
    return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  };
  const fmtMil = (v: number) => {
    if (v >= 1_000) return (v / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " mil";
    return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  };

  // ─── Formulário (coluna esquerda) ───
  const formPanel = (
    <div className="space-y-4">
      <SectionTitle eyebrow="Panorama BC" title="Qual administradora você deseja analisar?" desc="Busque pelo nome ou selecione na lista alfabética." />

      {/* Campo de busca */}
      <div className="relative">
        <input
          type="search"
          placeholder="Buscar por nome"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedOption(""); }}
          className="w-full px-4 py-3 pr-12 text-[15px] md:text-[16px] font-medium border border-border rounded-xl bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none w-5 h-5" />
      </div>

      {/* Resultados filtrados */}
      {search.trim() && filtered.length > 0 && filtered.length <= 5 && (
        <div className="space-y-1.5">
          {filtered.map((adm: { nomeAdministradora: string }) => (
            <button
              key={adm.nomeAdministradora}
              onClick={() => { setSelectedOption(adm.nomeAdministradora); setSearch(""); }}
              className="w-full text-left px-4 py-2.5 text-[14px] font-bold text-foreground bg-secondary/60 hover:bg-secondary rounded-lg transition-colors"
            >
              {adm.nomeAdministradora}
            </button>
          ))}
        </div>
      )}
      {search.trim() && filtered.length > 5 && (
        <p className="text-[13px] text-foreground/60 font-bold">
          {filtered.length} administradoras encontradas. Refine sua busca ou use a lista abaixo.
        </p>
      )}
      {search.trim() && !isLoading && !isError && filtered.length === 0 && (
        <p className="text-[13px] text-foreground/40 font-bold">Nenhuma administradora encontrada para "{search}"</p>
      )}

      {/* Divisor OU */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-[11px] uppercase tracking-wider font-bold text-foreground/40">OU</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      {/* Select alfabético */}
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-bold text-foreground/60 mb-2">Selecione uma administradora</label>
        <select
          value={selectedOption}
          disabled={isLoading || !data?.length}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full px-4 py-3 text-[15px] md:text-[16px] font-medium border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all disabled:opacity-60"
        >
          <option value="">Selecione uma administradora</option>
          {(filtered.length > 0 ? filtered : data || []).map((adm: { nomeAdministradora: string; cnpjAdministradora: string }) => (
            <option key={adm.cnpjAdministradora + adm.nomeAdministradora} value={adm.nomeAdministradora}>
              {adm.nomeAdministradora}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros opcionais — Categoria */}
      <div className="border-t border-border pt-3">
        <label className="block text-[12px] uppercase tracking-wider font-bold text-foreground/60 mb-2">Categoria</label>
        <div className="flex flex-wrap gap-1.5">
          {["todas", "Banco", "Administradora Independente", "Cooperativas e Associações"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`rounded-lg border px-3 py-1.5 text-[12px] md:text-[13px] font-bold transition-colors ${
                categoriaFiltro === cat
                  ? "bg-[var(--orange)] text-white border-transparent"
                  : "bg-background text-foreground/60 border-border"
              }`}
            >
              {cat === "todas" ? "Todas" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros opcionais — Segmento */}
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-bold text-foreground/60 mb-2">Segmento</label>
        <div className="flex flex-wrap gap-1.5">
          {["todos", "1", "2", "3", "4", "5", "6"].map((seg) => (
            <button
              key={seg}
              onClick={() => {
                setSegmentoFiltro(seg);
                setSelectedOption("");
              }}
              className={`rounded-lg border px-3 py-1.5 text-[12px] md:text-[13px] font-bold transition-colors ${
                segmentoFiltro === seg
                  ? "bg-[var(--orange)] text-white border-transparent"
                  : "bg-background text-foreground/60 border-border"
              }`}
            >
              {seg === "todos" ? "Todos" : SEGMENTO_NOMES[seg]}
            </button>
          ))}
        </div>
      </div>

      {/* Mercado em números */}
      {totais && (
        <div className="border-t border-border pt-3">
          <p className="text-[12px] uppercase tracking-wider font-bold text-foreground/40 mb-2">Mercado em Números</p>
          <div className="text-foreground/70 text-[14px] md:text-[15px] leading-relaxed space-y-0.5">
            <p>{totais.administradoras} administradoras</p>
            <p>{fmtMilhoes(totais.cotasAtivas)} cotas ativas</p>
            <p>Mais de {fmtMil(totais.gruposAtivos)} grupos ativos</p>
            <p>Histórico oficial dos últimos {totais.periodoMeses} meses</p>
            <p className="text-foreground/50">Dados oficiais do Banco Central</p>
          </div>
        </div>
      )}

      {/* Botão */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-4 py-3 text-[14px] md:text-[15px] font-bold uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
      >
        <Search className="w-4 h-4" />
        Analisar administradora
      </button>

      {isError && (
        <p className="text-[13px] text-[var(--destructive)] font-bold text-center">Não foi possível carregar a lista. Atualize a página.</p>
      )}
    </div>
  );

  // ─── Coluna direita: O que você descobrirá ───
  const discoveryPanel = (
    <div className="space-y-5 px-2 sm:px-0">
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <p className="eyebrow text-[var(--orange)] mb-3">O que você poderá descobrir?</p>
        <div className="space-y-3 text-[14px] md:text-[15px] text-foreground/80 leading-relaxed">
          <div className="flex gap-2.5">
            <BarChart3 className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Qual é a <strong>participação de mercado</strong> da administradora.</span>
          </div>
          <div className="flex gap-2.5">
            <GitBranch className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Qual é seu <strong>principal segmento</strong> de atuação.</span>
          </div>
          <div className="flex gap-2.5">
            <TrendingUp className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Qual é o <strong>índice de exclusão</strong> da operação.</span>
          </div>
          <div className="flex gap-2.5">
            <Users className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Quantas <strong>cotas aguardam contemplação</strong>.</span>
          </div>
          <div className="flex gap-2.5">
            <Building2 className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Como a administradora <strong>se compara ao restante do mercado</strong>.</span>
          </div>
          <div className="flex gap-2.5">
            <Eye className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Quantas <strong>contemplações ocorrem por lance e por sorteio</strong>.</span>
          </div>
          <div className="flex gap-2.5">
            <TrendingUp className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Qual é a <strong>evolução operacional nos últimos 24 meses</strong>.</span>
          </div>
          <div className="flex gap-2.5">
            <GitBranch className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Quais <strong>segmentos possuem maior relevância</strong> dentro da operação.</span>
          </div>
          <div className="flex gap-2.5">
            <Users className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
            <span>Quais <strong>grupos representam a maior parte das cotas ativas</strong>.</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
          <div>
            <p className="eyebrow text-foreground/40 mb-2">Transparência e Metodologia</p>
            <p className="text-[14px] md:text-[15px] text-foreground/65 leading-relaxed">
              Todas as análises deste módulo são realizadas exclusivamente com dados oficiais
              publicados pelo Banco Central do Brasil. O resultado é uma projeção independente
              para apoio à decisão e não substitui a leitura do seu contrato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <RaioXLayout
      moduleNumber={0}
      title="Panorama BC · Administradoras"
      description="Consulte dados oficiais das administradoras de consórcio publicados pelo Banco Central. Escolha uma administradora e descubra o raio-X completo da operação."
      formPanel={formPanel}
      resultsPanel={discoveryPanel}
      hasResult={true}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAIO-X DA ADMINISTRADORA — 8 blocos lógicos no padrão CDV
// ═══════════════════════════════════════════════════════════════════════════════
function DetalheAdministradora({ nomeAdm, onBack }: { nomeAdm: string; onBack: () => void }) {
  const [segmentoSelecionado, setSegmentoSelecionado] = useState<string | null>(null);
  const [grupoBusca, setGrupoBusca] = useState("");

  const { data: raioXData, isLoading: raioXLoading, isError: raioXError } = trpc.panoramaAdmin.raioX.useQuery({
    searchTerm: nomeAdm,
  });
  const { data: contempData, isError: contempError } = trpc.panoramaAdmin.contemplacoes.useQuery({
    searchTerm: nomeAdm,
  });
  const { data: segData, isLoading: segLoading, isError: segError } = trpc.panoramaAdmin.detalheSegmento.useQuery(
    { searchTerm: nomeAdm, codigoSegmento: segmentoSelecionado || "" },
    { enabled: !!segmentoSelecionado },
  );

  const indicadores = raioXData?.indicadores ?? null;
  const mercado = raioXData?.mercado ?? null;
  const tendencia = raioXData?.tendencia ?? null;

  const contemp = useMemo(() => {
    if (!contempData || !contempData.dataBase) return null;
    const sorteio = contempData.contemplacoesSorteio || [];
    const lance = contempData.contemplacoesLance || [];
    const parseNum = (v: string | undefined): number => {
      if (!v) return 0;
      return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
    };
    const totalSorteio = sorteio.reduce((s: number, d: any) => s + parseNum(d["Quantidade_de_consorciados_ativos_contemplados_por_sorteio"]), 0);
    const totalLance = lance.reduce((s: number, d: any) => s + parseNum(d["Quantidade_de_consorciados_ativos_contemplados_por_lance"]), 0);
    const total = totalSorteio + totalLance;
    return {
      dataBase: contempData.dataBase,
      totalSorteio, totalLance, total,
      pctLance: total > 0 ? (totalLance / total) * 100 : 0,
      pctSorteio: total > 0 ? (totalSorteio / total) * 100 : 0,
    };
  }, [contempData]);

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
  const pctFilaSegmento = segData?.segmento ? percentualSeguro(segData.segmento.naoContempladas, segData.segmento.cotasAtivas) : null;

  // ─── Loading ───
  if (raioXLoading) {
    return (
      <div className="min-h-screen bg-[var(--paper)]">
        <section className="bg-[#0A0A08] text-white pt-8 pb-16 w-full px-4 md:px-5 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-[#FF4E1F] font-['IBM_Plex_Mono'] text-[14px] md:text-[15px] font-semibold uppercase tracking-widest hover:text-[#FFC93C] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h1 className="font-['Archivo_Black'] text-2xl md:text-3xl lg:text-4xl text-white uppercase">{nomeAdm}</h1>
          </div>
        </section>
        <section className="container py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[var(--orange)] mx-auto mb-3 animate-spin" />
            <p className="text-foreground/60 text-[14px] md:text-[15px]">Carregando raio-X…</p>
          </div>
        </section>
      </div>
    );
  }

  if (raioXError || (!raioXLoading && !indicadores)) {
    return (
      <div className="min-h-screen bg-[var(--paper)]">
        <section className="bg-[#0A0A08] text-white pt-8 pb-16 w-full px-4 md:px-5 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-[#FF4E1F] font-['IBM_Plex_Mono'] text-[14px] md:text-[15px] font-semibold uppercase tracking-widest hover:text-[#FFC93C] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h1 className="font-['Archivo_Black'] text-2xl md:text-3xl lg:text-4xl text-white uppercase">{nomeAdm}</h1>
          </div>
        </section>
        <section className="container py-16">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-foreground/60 text-[14px] md:text-[15px]">
              {raioXError ? "Erro ao carregar o raio-X. Atualize a página e tente novamente." : "Nenhum dado encontrado para esta administradora."}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* ── Hero (padrão CDV) ── */}
      <section className="bg-[#0A0A08] text-white pt-8 pb-16 w-full px-4 md:px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#FF4E1F] font-['IBM_Plex_Mono'] text-[14px] md:text-[15px] font-semibold uppercase tracking-widest hover:text-[#FFC93C] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
              categoria === "Banco" ? "bg-white text-[#0A0A08]" :
              categoria === "Cooperativas e Associações" ? "bg-[#2f5233] text-white" :
              "bg-white/10 text-white"
            }`}>
              {categoria}
            </span>
            {raioXData?.dataBase && (
              <span className="text-white/40 text-[12px] font-mono">Data-base: {raioXData.dataBase}</span>
            )}
          </div>
          <h1 className="font-['Archivo_Black'] text-2xl md:text-3xl lg:text-4xl text-white uppercase leading-tight">
            {nomeAdm}
          </h1>
        </div>
      </section>

      {/* ── Conteúdo: 8 blocos lógicos ── */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-5 lg:px-8 py-8 space-y-8">
        {/* BLOCO 1: RESUMO EXECUTIVO */}
        {indicadores && mercado && (
          <RaioXBlock eyebrow="Bloco 1" title="Resumo executivo da operação" icon={Eye}>
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <p className="text-[14px] md:text-[15px] text-foreground/85 leading-relaxed">
                <strong className="font-bold">{nomeAdm}</strong> é uma <strong className="font-bold">{categoria.toLowerCase()}</strong> com{" "}
                <strong className="font-bold text-[var(--orange)]">{fmtN(indicadores.totalGrupos)} grupos ativos</strong> e{" "}
                <strong className="font-bold text-[var(--orange)]">{fmtN(indicadores.totalCotasAtivas)} cotas ativas</strong>.
                A operação é mais concentrada em{" "}
                <strong className="font-bold">{indicadores.distribuicao[0]?.nome || "seus segmentos principais"}</strong>,
                que representa <strong className="font-bold text-[var(--orange)]">{fmtPctLocal(indicadores.distribuicao[0]?.pctAdm || 0)}</strong>{" "}
                da administradora. {contemp && contemp.total > 0 && (
                  <>No dado trimestral mais recente, <strong className="font-bold text-[var(--orange)]">{fmtPctLocal(contemp.pctLance)}</strong> das contemplações ocorreram por lance.</>
                )} {" "}A taxa média de administração é{" "}
                <strong className={`font-bold ${indicadores.taxaMedia <= mercado.taxaMedia ? "text-[var(--positive)]" : "text-[var(--orange)]"}`}>
                  {fmtMoeda(indicadores.taxaMedia)}%
                </strong>, {indicadores.taxaMedia <= mercado.taxaMedia ? "abaixo" : "acima"} da média do mercado ({fmtMoeda(mercado.taxaMedia)}%).
                {" "}No mês mais recente, contemplou{" "}
                <strong className="font-bold text-[var(--positive)]">{fmtN(indicadores.totalContempladas)} cotas</strong>{" "}
                ({fmtPctLocal(indicadores.pctContempladas)} das ativas).{" "}
                {pctFila !== null ? (
                  <>A fila informada corresponde a <strong className="font-bold">{fmtPctLocal(pctFila)}</strong> das cotas ativas.</>
                ) : (
                  <>A base informa <strong className="font-bold">{fmtN(indicadores.totalNaoContempladas)} cotas não contempladas</strong>; como esse valor supera o total de cotas ativas da mesma data-base, o percentual não é exibido.</>
                )}
              </p>
            </div>
          </RaioXBlock>
        )}

        {/* BLOCO 2: TAMANHO DA OPERAÇÃO */}
        {indicadores && (
          <RaioXBlock eyebrow="Bloco 2" title="Tamanho da operação" icon={Building2}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <KpiCard label="Categoria" value={categoria} />
              <KpiCard label="Grupos ativos" value={fmtN(indicadores.totalGrupos)} highlight />
              <KpiCard label="Cotas ativas" value={fmtN(indicadores.totalCotasAtivas)} highlight />
              <KpiCard label="Segmentos" value={fmtN(indicadores.totalSegmentos)} />
              <KpiCard label="Participação no mercado" value={fmtPctLocal(indicadores.pctMercado)} hint="do total de cotas ativas" />
            </div>
          </RaioXBlock>
        )}

        {/* BLOCO 3: CONTEMPLAÇÕES */}
        {indicadores && (
          <RaioXBlock eyebrow="Bloco 3" title="Contemplações" icon={Eye}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <KpiCard label="Contemplações no mês" value={fmtN(indicadores.totalContempladas)} hint={`${fmtPctLocal(indicadores.pctContempladas)} das cotas ativas`} highlight />
              {mercado && (
                <KpiCard label="Média do mercado" value={fmtPctLocal(mercado.pctContempladas)} hint="contemplações no mês sobre cotas ativas" />
              )}
            </div>
            {mercado && (
              <div className="rounded-xl border border-border bg-card p-4 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-foreground/50 mb-1">Contemplações da adm</span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-lg font-bold text-foreground">{fmtPctLocal(indicadores.pctContempladas)}</span>
                      <span className="text-[12px] font-bold text-foreground/40">Mercado: {fmtPctLocal(mercado.pctContempladas)}</span>
                    </div>
                    <span className={`text-[12px] font-bold ${indicadores.pctContempladas >= mercado.pctContempladas ? "text-[var(--positive)]" : "text-[var(--orange)]"}`}>
                      {indicadores.pctContempladas >= mercado.pctContempladas ? "Contemplação acima da média" : "Contemplação abaixo da média"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-foreground/50 mb-1">Leitura</span>
                    <span className={`text-[12px] font-bold ${indicadores.pctContempladas >= mercado.pctContempladas ? "text-[var(--positive)]" : "text-[var(--orange)]"}`}>
                      {indicadores.pctContempladas >= mercado.pctContempladas ? "A administradora contempla acima da média no mês" : "A administradora contempla abaixo da média no mês"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* Lance vs Sorteio */}
            {contemp && contemp.total > 0 ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="text-center">
                    <div className="font-mono text-3xl md:text-4xl font-bold text-[var(--orange)]">{fmtPctLocal(contemp.pctLance)}</div>
                    <p className="text-[12px] uppercase tracking-wider font-bold text-foreground/50 mt-1">Por Lance</p>
                    <p className="text-[14px] font-mono text-foreground mt-1">{fmtN(contemp.totalLance)} cotas</p>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-3xl md:text-4xl font-bold text-[var(--positive)]">{fmtPctLocal(contemp.pctSorteio)}</div>
                    <p className="text-[12px] uppercase tracking-wider font-bold text-foreground/50 mt-1">Por Sorteio</p>
                    <p className="text-[14px] font-mono text-foreground mt-1">{fmtN(contemp.totalSorteio)} cotas</p>
                  </div>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden border border-border">
                  <div className="bg-[var(--orange)] flex items-center justify-center text-white text-[12px] font-bold" style={{ width: `${contemp.pctLance}%` }}>
                    {contemp.pctLance > 15 ? "Lance" : ""}
                  </div>
                  <div className="bg-[var(--positive)] flex items-center justify-center text-white text-[12px] font-bold" style={{ width: `${contemp.pctSorteio}%` }}>
                    {contemp.pctSorteio > 15 ? "Sorteio" : ""}
                  </div>
                </div>
                <p className="text-[12px] text-foreground/40 font-bold mt-2">Data-base: {contemp.dataBase} (base trimestral Dados por UF)</p>
              </div>
            ) : contempError ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-[14px] text-foreground/60 font-bold">Erro ao carregar dados de contemplações. Tente novamente.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-[14px] text-foreground/60 font-bold">Dados de contemplações por lance e sorteio não disponíveis para esta administradora no período mais recente.</p>
              </div>
            )}
          </RaioXBlock>
        )}

        {/* BLOCO 4: FILA DE ESPERA */}
        {indicadores && (
          <RaioXBlock eyebrow="Bloco 4" title="Fila de espera" icon={Users}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <KpiCard label="Cotas não contempladas" value={fmtN(indicadores.totalNaoContempladas)} hint={pctFila !== null ? `${fmtPctLocal(pctFila)} das cotas ativas` : "Percentual indisponível"} highlight />
              {mercado && (
                <>
                  <KpiCard label="Mercado: não contempladas" value={fmtN(mercado.totalNaoContempladas)} hint={pctFilaMercado !== null ? `${fmtPctLocal(pctFilaMercado)} das cotas ativas` : "Percentual indisponível"} />
                  <div className="rounded-lg sm:rounded-xl p-3 border shadow-sm bg-card border-border flex flex-col justify-center">
                    <span className="text-[14px] leading-tight font-normal uppercase tracking-wide text-gray-700">Comparativo</span>
                    <span className={`text-[14px] md:text-[15px] font-bold mt-1 ${pctFila !== null && pctFilaMercado !== null && pctFila <= pctFilaMercado ? "text-[var(--positive)]" : "text-[var(--orange)]"}`}>
                      {pctFila !== null && pctFilaMercado !== null ? (pctFila <= pctFilaMercado ? "Fila menor que a média" : "Fila maior que a média") : "Comparativo indisponível nesta competência"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </RaioXBlock>
        )}

        {/* BLOCO 5: EXCLUSÕES */}
        {indicadores && (
          <RaioXBlock eyebrow="Bloco 5" title="Exclusões" icon={TrendingUp}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <KpiCard label="Cotas excluídas" value={fmtN(indicadores.totalExcluidas)} hint="Quantidade cumulativa informada pelo BC" highlight />
              {mercado && (
                <>
                  <KpiCard label="Mercado: excluídas" value={fmtN(mercado.totalExcluidas)} hint="Quantidade cumulativa informada pelo BC" />
                  <div className="rounded-lg sm:rounded-xl p-3 border shadow-sm bg-card border-border flex flex-col justify-center">
                    <span className="text-[14px] leading-tight font-normal uppercase tracking-wide text-gray-700">Comparativo</span>
                    <span className="text-[14px] md:text-[15px] font-bold text-foreground/50 mt-1">Indisponível nesta base</span>
                    <span className="text-[11px] text-foreground/40 font-bold mt-0.5">O BC publica exclusões acumuladas e cotas ativas como medidas de naturezas diferentes.</span>
                  </div>
                </>
              )}
            </div>
          </RaioXBlock>
        )}

        {/* BLOCO 6: SEGMENTOS DA OPERAÇÃO */}
        {indicadores && (
          <RaioXBlock eyebrow="Bloco 6" title="Segmentos da operação" icon={GitBranch}>
            <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-secondary/60 border-b border-border">
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-foreground/50">Segmento</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-foreground/50">Leitura</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Grupos ativos</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Cotas ativas</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">% na Adm</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">% Mercado</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.distribuicao.map((seg: any, posicao: number) => (
                    <tr
                      key={seg.codigo}
                      onClick={() => setSegmentoSelecionado(segmentoSelecionado === seg.codigo ? null : seg.codigo)}
                      className={`border-b border-border last:border-0 cursor-pointer hover:bg-secondary/40 transition-colors ${segmentoSelecionado === seg.codigo ? "bg-[var(--orange)]/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-bold text-foreground">{seg.nome}</td>
                      <td className="px-4 py-3 text-[12px] md:text-[13px] text-foreground/60 font-bold">{leituraSegmento(posicao, indicadores.distribuicao.length)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-foreground text-right">{fmtN(seg.grupos)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-foreground text-right">{fmtN(seg.cotas)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-[var(--orange)] text-right font-bold">{fmtPctLocal(seg.pctAdm)}</td>
                      <td className="px-4 py-3 text-[14px] md:text-[15px] font-mono text-[var(--positive)] text-right font-bold">{fmtPctLocal(seg.pctMercado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-foreground/40 font-bold mt-2">Clique em um segmento para ver os grupos.</p>

            {/* Detalhe do segmento selecionado */}
            {segmentoSelecionado && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <p className="eyebrow text-[var(--orange)]">Segmento: {getNomeSegmento(segmentoSelecionado)}</p>
                </div>
                {segLoading && (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 text-[var(--orange)] mx-auto animate-spin" />
                  </div>
                )}
                {segError && (
                  <div className="rounded-lg border border-[var(--orange)]/30 bg-[var(--orange)]/5 p-4">
                    <p className="text-[14px] text-foreground/60 font-bold">Erro ao carregar o detalhe do segmento. Tente novamente.</p>
                  </div>
                )}
                {segData?.segmento && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KpiCard label="Grupos ativos" value={fmtN(segData.segmento.gruposAtivos)} />
                    <KpiCard label="Cotas ativas" value={fmtN(segData.segmento.cotasAtivas)} />
                    <KpiCard label="Participação no mercado" value={fmtPctLocal(segData.segmento.pctMercado)} highlight />
                    <KpiCard label="Taxa média" value={fmtMoeda(segData.segmento.taxaMedia) + "%"} />
                    <KpiCard label="Contemplações no mês" value={fmtN(segData.segmento.contempladas)} hint={fmtPctLocal(segData.segmento.pctContempladas) + " das cotas ativas"} />
                    <KpiCard label="Exclusões" value={fmtN(segData.segmento.excluidas)} hint="Quantidade cumulativa informada pelo BC" />
                    <KpiCard label="Fila de espera" value={fmtN(segData.segmento.naoContempladas)} hint={pctFilaSegmento !== null ? `${fmtPctLocal(pctFilaSegmento)} das cotas ativas` : "Percentual indisponível"} />
                  </div>
                )}

                {/* Grupos do segmento */}
                {segData?.grupos && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow text-[var(--orange)]">Grupos do segmento</p>
                      <input
                        type="search"
                        placeholder="Buscar por código do grupo…"
                        value={grupoBusca}
                        onChange={(e) => setGrupoBusca(e.target.value)}
                        className="px-3 py-2 text-[13px] md:text-[14px] font-medium border border-border rounded-lg bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all max-w-[240px]"
                      />
                    </div>
                    {gruposSegmento.length > 0 ? (
                      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                          <thead>
                            <tr className="bg-secondary/60 border-b border-border">
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50">Grupo</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Cotas</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Contempl.</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Excluídas</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Taxa adm.</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">vs. Segmento</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Prazo</th>
                              <th className="px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold text-foreground/50 text-right">Correção</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gruposSegmento.map((g: any, i: number) => {
                              const totalCotasSeg = segData?.segmento?.cotasAtivas || 0;
                              const relevancia = totalCotasSeg > 0 ? (g.cotasAtivas / totalCotasSeg) * 100 : 0;
                              return (
                                <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono font-bold text-foreground">
                                    {g.codigoGrupo}
                                    <span className="block text-[10px] text-[var(--orange)] font-bold">{relevancia.toFixed(1)}% do segmento</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-foreground text-right">{fmtN(g.cotasAtivas)}</td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[var(--positive)] text-right">{fmtN(g.cotasContempladas)}</td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-[var(--orange)] text-right">{fmtN(g.cotasExcluidas)}</td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-foreground text-right">{fmtMoeda(g.taxaAdm) + "%"}</td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-right">
                                    {(() => {
                                      const segTaxa = segData?.segmento?.taxaMedia || 0;
                                      const diff = g.taxaAdm - segTaxa;
                                      if (Math.abs(diff) < 0.01) return <span className="text-foreground/50 font-bold">≈ média</span>;
                                      return <span className={diff > 0 ? "text-[var(--orange)] font-bold" : "text-[var(--positive)] font-bold"}>{diff > 0 ? "+" : ""}{fmtMoeda(diff)}%</span>;
                                    })()}
                                  </td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-foreground text-right">{g.prazoMeses > 0 ? g.prazoMeses + " meses" : "—"}</td>
                                  <td className="px-3 py-2.5 text-[13px] md:text-[14px] font-mono text-foreground text-right">{g.indiceCorrecao || "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-[14px] text-foreground/60 font-bold">{grupoBusca ? `Nenhum grupo encontrado para "${grupoBusca}".` : "Nenhum grupo disponível para este segmento."}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </RaioXBlock>
        )}

        {/* BLOCO 7: TENDÊNCIA DOS ÚLTIMOS 24 MESES */}
        {indicadores && (
          <RaioXBlock eyebrow="Bloco 7" title="Tendência dos últimos 24 meses" icon={BarChart3}>
            <div className="rounded-2xl border border-border bg-[var(--ink)] text-[var(--paper)] overflow-hidden">
              <div className="px-5 py-4">
                {tendencia ? (
                  <>
                    <TendenciaItem label="Cotas ativas" indicador="cotasAtivas" variacao={tendencia.cotasAtivas} />
                    <TendenciaItem label="Contemplações no mês" indicador="contemplacoes" variacao={tendencia.contemplacoes} />
                    <TendenciaItem label="Exclusões" indicador="exclusoes" variacao={tendencia.exclusoes} />
                    <TendenciaItem label="Fila de espera (não contempladas)" indicador="filaEspera" variacao={tendencia.filaEspera} />
                    <TendenciaItem label="Grupos ativos" indicador="gruposAtivos" variacao={tendencia.gruposAtivos} />
                    <TendenciaItem label="Cotas comercializadas" indicador="cotasComercializadas" variacao={tendencia.cotasComercializadas} />
                    <p className="text-[12px] text-white/30 font-bold mt-3">
                      Comparação entre {tendencia.periodoAntigo} e {tendencia.periodoRecente}.
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] text-white/50 font-bold py-4">Dados históricos insuficientes para calcular a tendência.</p>
                )}
              </div>
            </div>
          </RaioXBlock>
        )}

        {/* BLOCO 8: TRANSPARÊNCIA E METODOLOGIA (último bloco, cor 50% mais forte) */}
        <RaioXBlock eyebrow="Bloco 8" title="Transparência e Metodologia" icon={ShieldCheck}>
          <div className="rounded-2xl border-2 border-[var(--orange)]/45 bg-[var(--orange)]/8 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
              <div className="space-y-2 text-[14px] md:text-[15px] text-foreground/70 leading-relaxed">
                <p><strong className="text-foreground">Fonte:</strong> Todos os dados são oficiais do Banco Central do Brasil.</p>
                <p><strong className="text-foreground">Período:</strong> Dados de julho/2024 a maio/2026 (últimos 24 meses disponíveis).</p>
                <p><strong className="text-foreground">Classificação:</strong> A categoria (Banco, Administradora Independente, Cooperativas e Associações) é classificação própria do Consórcio de Verdade, não do Banco Central.</p>
                <p><strong className="text-foreground">Médias de mercado:</strong> Calculadas sobre todas as administradoras, ponderadas por cotas ativas.</p>
                <p><strong className="text-foreground">Leitura dos percentuais:</strong> quando a base oficial informa um valor que supera o respectivo total de cotas ativas na mesma data-base, o produto exibe a quantidade e não exibe um percentual potencialmente enganoso.</p>
              </div>
            </div>
          </div>
        </RaioXBlock>

        {/* CTA Consultoria */}
        <ConsultCTA context="esta análise" />
      </section>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function PanoramaAdministradoras() {
  const [selectedAdm, setSelectedAdm] = useState<string | null>(null);
  const [location, navigate] = useLocation();

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

  return <ListaAdministradoras onSelect={handleSelect} />;
}
