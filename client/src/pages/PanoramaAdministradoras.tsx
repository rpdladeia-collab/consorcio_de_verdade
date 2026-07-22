/**
 * Panorama > Administradoras — V1
 * Entrega 01: Busca das administradoras
 * Campo de busca + select alfabético + navegação para página da administradora
 */
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

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
function TendenciaItemPct({ label, variacao }: { label: string; variacao: { pct: number; direcao: "Crescendo" | "Estável" | "Diminuindo" } | null }) {
  if (!variacao) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-[#e5e0d8] last:border-0">
        <span className="text-[14px] md:text-[15px] font-bold text-[#15140f]">{label}</span>
        <span className="text-[13px] font-bold text-[#9e9890]">Sem dados</span>
      </div>
    );
  }
  const pct = variacao.pct.toFixed(1) + "%";
  let color = "text-[#716b60]";
  let bg = "bg-[#f0ede5]";
  if (variacao.direcao === "Crescendo") { color = "text-[#2f5233]"; bg = "bg-green-50"; }
  if (variacao.direcao === "Diminuindo") { color = "text-[#c2410c]"; bg = "bg-orange-50"; }
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#e5e0d8] last:border-0">
      <span className="text-[14px] md:text-[15px] font-bold text-[#15140f]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-bold text-[#4b4843]">{pct}</span>
        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${bg} ${color}`}>{variacao.direcao}</span>
      </div>
    </div>
  );
}

// ─── Página: Lista de Administradoras (Entrega 01) ──────────────────────────
function ListaAdministradoras({ onSelect }: { onSelect: (nome: string) => void }) {
  const [search, setSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const { data, isLoading, isError } = trpc.panoramaAdmin.listAdministradoras.useQuery();

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return data.filter((a: { nomeAdministradora: string }) => {
      const n = a.nomeAdministradora.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return n.includes(q);
    });
  }, [data, search]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-2">
          Panorama: Administradoras
        </span>
        <h1 className="text-2xl md:text-4xl font-bold text-[#15140f] leading-tight mb-3 tracking-tight">
          Raio-X das administradoras de consórcio
        </h1>
        <p className="text-[#4b4843] text-[15px] md:text-[16px] leading-relaxed font-bold max-w-2xl">
          Selecione uma administradora para visualizar indicadores operacionais, segmentos, grupos,
          contemplações e tendências dos últimos 24 meses. Dados oficiais do Banco Central.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <label htmlFor="busca-administradora" className="sr-only">Buscar administradora</label>
        <div className="relative">
          <input
            id="busca-administradora"
            type="search"
            placeholder="Buscar por nome da administradora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3.5 pr-12 text-[15px] md:text-[16px] font-medium border border-[#d1ccc5] rounded-xl bg-white text-[#15140f] placeholder:text-[#9e9890] focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20 transition-all"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9e9890] pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <label htmlFor="select-administradora" className="block text-[11px] uppercase tracking-wider font-bold text-[#4b4843]">
          Ou selecione na lista alfabética
        </label>
        <select
          id="select-administradora"
          value={selectedOption}
          disabled={isLoading || !data?.length}
          onChange={(e) => {
            const nome = e.target.value;
            setSelectedOption(nome);
            if (nome) onSelect(nome);
          }}
          className="w-full px-4 py-3.5 text-[15px] md:text-[16px] font-medium border border-[#d1ccc5] rounded-xl bg-white text-[#15140f] focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20 transition-all disabled:opacity-60"
        >
          <option value="">Selecione uma administradora</option>
          {(data || []).map((adm: { nomeAdministradora: string; cnpjAdministradora: string }) => (
            <option key={adm.cnpjAdministradora + adm.nomeAdministradora} value={adm.nomeAdministradora}>
              {adm.nomeAdministradora}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#c2410c] border-t-transparent"></div>
          <p className="mt-3 text-[14px] text-[#4b4843] font-bold">Carregando administradoras...</p>
        </div>
      )}

      {isError && (
        <div className="text-center py-12 rounded-xl border border-orange-200 bg-orange-50">
          <p className="text-[15px] text-[#4b4843] font-bold">Não foi possível carregar a lista de administradoras. Atualize a página e tente novamente.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[15px] text-[#4b4843] font-bold">Nenhuma administradora encontrada para "{search}"</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <p className="text-[12px] text-[#9e9890] font-bold mb-3">
            {filtered.length} administradora{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {filtered.map((adm: { nomeAdministradora: string; cnpjAdministradora: string }) => {
              const cat = getCategoria(adm.nomeAdministradora);
              const catColor = cat === "Banco" ? "bg-[#15140f] text-white" :
                cat === "Cooperativas e Associações" ? "bg-[#2f5233] text-white" :
                "bg-white border border-[#d1ccc5] text-[#4b4843]";
              return (
                <button
                  key={adm.cnpjAdministradora + adm.nomeAdministradora}
                  onClick={() => onSelect(adm.nomeAdministradora)}
                  className="w-full text-left bg-white border border-[#e5e0d8] rounded-xl p-4 hover:border-[#c2410c] hover:shadow-md transition-all group flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${catColor}`}>
                        {cat}
                      </span>
                    </div>
                    <h3 className="text-[15px] md:text-[16px] font-bold text-[#15140f] group-hover:text-[#c2410c] transition-colors leading-tight truncate">
                      {adm.nomeAdministradora}
                    </h3>
                    <p className="text-[11px] text-[#9e9890] font-mono mt-0.5">CNPJ: {adm.cnpjAdministradora}</p>
                  </div>
                  <svg className="text-[#9e9890] group-hover:text-[#c2410c] shrink-0 transition-colors" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              );
            })}
          </div>
        </>
      )}
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

        {/* ── ENTREGA 02: Raio-X da Administradora ── */}
        {indicadores && (
          <>
            {/* Identidade */}
            <section>
              <div className="mb-4">
                <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Identidade da operação</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Raio-X da administradora</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <IndicadorCard label="Categoria" value={categoria} />
                <IndicadorCard label="Grupos ativos" value={fmtN(indicadores.totalGrupos)} accent />
                <IndicadorCard label="Cotas ativas" value={fmtN(indicadores.totalCotasAtivas)} accent />
                <IndicadorCard label="Segmentos" value={fmtN(indicadores.totalSegmentos)} />
                <IndicadorCard label="Participação no mercado" value={fmtPct(indicadores.pctMercado)} sublabel="do total de cotas ativas" />
              </div>
            </section>

            {/* Indicadores Operacionais */}
            <section>
              <div className="mb-4">
                <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Indicadores operacionais</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">O que está acontecendo agora</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <IndicadorCard
                  label="Contemplações no mês"
                  value={fmtN(indicadores.totalContempladas)}
                  sublabel={`${fmtPct(indicadores.pctContempladas)} das cotas ativas`}
                />
                <IndicadorCard
                  label="Cotas não contempladas"
                  value={fmtN(indicadores.totalNaoContempladas)}
                  sublabel={`${fmtPct(indicadores.pctNaoContempladas)} aguardando`}
                  accent
                />
                <IndicadorCard
                  label="Exclusões"
                  value={fmtN(indicadores.totalExcluidas)}
                  sublabel={`${fmtPct(indicadores.pctExcluidas)} das cotas ativas`}
                  accent
                />
                <IndicadorCard
                  label="Taxa média de adm."
                  value={fmtMoeda(indicadores.taxaMedia) + "%"}
                  sublabel="Ponderada por cotas ativas"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <IndicadorCard
                  label="Cotas comercializadas no mês"
                  value={fmtN(indicadores.totalCotasComercializadas)}
                  sublabel="Novos cotistas no período"
                />
              </div>
            </section>

            {/* ── ENTREGA 02b: Comparativo com a média do mercado ── */}
            {mercado && (
              <section>
                <div className="mb-4">
                  <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Comparativo com o mercado</span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Como esta adm se compara</h2>
                </div>
                <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Taxa média de administração</span>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-lg font-bold text-[#15140f]">{fmtMoeda(indicadores.taxaMedia)}%</span>
                        <span className="text-[12px] font-bold text-[#9e9890]">Mercado: {fmtMoeda(mercado.taxaMedia)}%</span>
                      </div>
                      <span className={`text-[12px] font-bold ${indicadores.taxaMedia <= mercado.taxaMedia ? "text-[#2f5233]" : "text-[#c2410c]"}`}>
                        {indicadores.taxaMedia <= mercado.taxaMedia ? "Abaixo da média" : "Acima da média"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Taxa de exclusão</span>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-lg font-bold text-[#15140f]">{fmtPct(indicadores.pctExcluidas)}</span>
                        <span className="text-[12px] font-bold text-[#9e9890]">Mercado: {fmtPct(mercado.pctExcluidas)}</span>
                      </div>
                      <span className={`text-[12px] font-bold ${indicadores.pctExcluidas <= mercado.pctExcluidas ? "text-[#2f5233]" : "text-[#c2410c]"}`}>
                        {indicadores.pctExcluidas <= mercado.pctExcluidas ? "Exclusão abaixo da média" : "Exclusão acima da média"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Taxa de contemplação</span>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-lg font-bold text-[#15140f]">{fmtPct(indicadores.pctContempladas)}</span>
                        <span className="text-[12px] font-bold text-[#9e9890]">Mercado: {fmtPct(mercado.pctContempladas)}</span>
                      </div>
                      <span className={`text-[12px] font-bold ${indicadores.pctContempladas >= mercado.pctContempladas ? "text-[#2f5233]" : "text-[#c2410c]"}`}>
                        {indicadores.pctContempladas >= mercado.pctContempladas ? "Contemplação acima da média" : "Contemplação abaixo da média"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">Participação no mercado</span>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-lg font-bold text-[#15140f]">{fmtPct(indicadores.pctMercado)}</span>
                        <span className="text-[12px] font-bold text-[#9e9890]">das cotas ativas totais</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── ENTREGA 03: Distribuição da Operação ── */}
            <section>
              <div className="mb-4">
                <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Distribuição da operação</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Segmentos em operação</h2>
              </div>
              <div className="bg-white border border-[#e5e0d8] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f6f3ec] border-b border-[#e5e0d8]">
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843]">Segmento</th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Grupos ativos</th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">Cotas ativas</th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">% na Adm</th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-[#4b4843] text-right">% Mercado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicadores.distribuicao.map((seg: any) => (
                      <tr
                        key={seg.codigo}
                        onClick={() => setSegmentoSelecionado(segmentoSelecionado === seg.codigo ? null : seg.codigo)}
                        className="border-b border-[#e5e0d8] last:border-0 cursor-pointer hover:bg-[#f6f3ec] transition-colors"
                      >
                        <td className="px-4 py-3 text-[14px] md:text-[15px] font-bold text-[#15140f]">{seg.nome}</td>
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

            {/* ── ENTREGA 04: Contemplações ── */}
            <section>
              <div className="mb-4">
                <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Contemplações</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Lance vs. Sorteio</h2>
              </div>
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
                  {/* Barra visual */}
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

            {/* ── ENTREGA 05: Tendência Operacional ── */}
            <section>
              <div className="mb-4">
                <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">Tendência operacional</span>
                <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">Últimos 24 meses</h2>
              </div>
              <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
                {tendencia ? (
                  <>
                    <TendenciaItemPct label="Cotas ativas" variacao={tendencia.cotasAtivas} />
                    <TendenciaItemPct label="Contemplações no mês" variacao={tendencia.contemplacoes} />
                    <TendenciaItemPct label="Exclusões" variacao={tendencia.exclusoes} />
                    <TendenciaItemPct label="Fila de espera (não contempladas)" variacao={tendencia.filaEspera} />
                    <TendenciaItemPct label="Grupos ativos" variacao={tendencia.gruposAtivos} />
                    <TendenciaItemPct label="Cotas comercializadas" variacao={tendencia.cotasComercializadas} />
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

            {/* ── ENTREGA 06: Segmentos (detalhe) ── */}
            {segmentoSelecionado && (
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
                      <IndicadorCard label="Contemplações no mês" value={fmtN(segData.segmento.contempladas)} sublabel={fmtPct(segData.segmento.pctContempladas) + " das cotas"} />
                      <IndicadorCard label="Exclusões" value={fmtN(segData.segmento.excluidas)} sublabel={fmtPct(segData.segmento.pctExcluidas) + " das cotas"} accent />
                      <IndicadorCard label="Não contempladas" value={fmtN(segData.segmento.naoContempladas)} accent />
                      <IndicadorCard label="Exclusão vs. mercado" value={fmtPct(segData.segmento.pctExcluidas)} sublabel={`Mercado: ${fmtPct(segData.segmento.mercadoPctExcluidas)}`} />
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
                </div>
              </div>
            </section>
          </>
        )}
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
