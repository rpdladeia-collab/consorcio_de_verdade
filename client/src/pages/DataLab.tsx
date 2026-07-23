import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Database, ExternalLink, Info, Search, Table2, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { DATA_LAB_GROUP_SECTIONS } from "./dataLabCatalogGroups";
import {
  getActiveCustomBounds,
  resolveVisibleMetricId,
  type DataLabPeriodPreset,
} from "./dataLabQuery";

const PERIOD_OPTIONS: Array<{ id: DataLabPeriodPreset; label: string }> = [
  { id: "12m", label: "12 meses" },
  { id: "5y", label: "5 anos" },
  { id: "10y", label: "10 anos" },
  { id: "all", label: "Completo" },
  { id: "custom", label: "Personalizado" },
];

function monthInputToDataBase(value: string): number | undefined {
  if (!/^\d{4}-\d{2}$/.test(value)) return undefined;
  return Number(value.replace("-", ""));
}

function formatDataBase(dataBase: number): string {
  const year = Math.floor(dataBase / 100);
  const month = dataBase % 100;
  return new Date(year, month - 1).toLocaleString("pt-BR", { month: "short", year: "numeric" });
}

function formatMetricValue(value: number, unit: string): string {
  if (value === null || value === undefined) return "—";
  if (unit === "mil") return (value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "k";
  if (unit === "%") return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function formatAxisValue(value: number): string {
  if (value >= 1e6) return (value / 1e6).toFixed(0) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(0) + "k";
  return value.toFixed(0);
}

interface GroupGlossaryItem {
  id: string;
  name: string;
  description: string;
}

const GROUP_GLOSSARY: Record<string, GroupGlossaryItem> = {
  "4": {
    id: "4",
    name: "Grupos ativos",
    description: "Quantidade total de grupos de consórcio constituídos e em operação no mercado.",
  },
  "5": {
    id: "5",
    name: "Cotas ativas",
    description: "Número de cotas (participações) ativas em grupos de consórcio, divididas por tipo de bem.",
  },
  "6": {
    id: "6",
    name: "Carteira",
    description: "Valor total de créditos em aberto nos grupos de consórcio, por categoria de bem.",
  },
  "10": {
    id: "10",
    name: "Cotas comercializadas",
    description: "Número de cotas negociadas nos últimos 12 meses, indicando movimento de mercado.",
  },
  "13": {
    id: "13",
    name: "Recursos coletados",
    description: "Valor total de recursos arrecadados nos últimos 12 meses junto aos consorciados.",
  },
  "14": {
    id: "14",
    name: "Recursos a coletar",
    description: "Valor total ainda a ser arrecadado para honrar os compromissos dos grupos em operação.",
  },
  "7": {
    id: "7",
    name: "Ativos contemplados",
    description: "Quantidade de bens entregues aos consorciados nos últimos 12 meses, por sorteio ou lance.",
  },
  "8": {
    id: "8",
    name: "Cotas excluídas",
    description: "Número de cotas removidas de grupos por inadimplência ou outras causas.",
  },
  "9": {
    id: "9",
    name: "Índice de exclusão",
    description: "Percentual de cotas excluídas em relação ao total de cotas ativas, medindo risco de crédito.",
  },
  "16": {
    id: "16",
    name: "Taxa de administração",
    description: "Percentual cobrado pelos administradores de consórcio sobre o valor do bem.",
  },
  "17": {
    id: "17",
    name: "Valor médio",
    description: "Valor médio dos créditos (bens) nos grupos constituídos nos últimos 12 meses.",
  },
  "18": {
    id: "18",
    name: "Prazo médio",
    description: "Duração média dos grupos de consórcio, em meses, para contemplação de todos os participantes.",
  },
  "2": {
    id: "2",
    name: "PLA",
    description: "Percentual de Lucro Acumulado, indicador de rentabilidade dos grupos de consórcio.",
  },
  "3": {
    id: "3",
    name: "DT",
    description: "Duração Total esperada do grupo até a contemplação do último participante.",
  },
  "11": {
    id: "11",
    name: "Inadimplência",
    description: "Percentual de cotas em atraso de pagamento, indicador de saúde financeira dos grupos.",
  },
  "12": {
    id: "12",
    name: "Pré-inadimplência",
    description: "Percentual de cotas com atraso de até 30 dias, sinal de alerta de possível inadimplência.",
  },
  "15": {
    id: "15",
    name: "RNP",
    description: "Risco de Não Pagamento, medida agregada do risco de crédito no sistema de consórcios.",
  },
  "1": {
    id: "1",
    name: "Administradoras de consórcio",
    description: "Número de empresas administradoras de consórcio ativas no mercado.",
  },
  "19": {
    id: "19",
    name: "Cotas ativas por estado",
    description: "Distribuição geográfica de cotas ativas por unidade federativa do Brasil.",
  },
};

export function DataLabPage() {
  const [groupId, setGroupId] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMetricId, setSelectedMetricId] = useState("");
  const [period, setPeriod] = useState<DataLabPeriodPreset>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedGroupForGlossary, setSelectedGroupForGlossary] = useState<GroupGlossaryItem | null>(null);

  const groupsQuery = trpc.panorama.listGroups.useQuery();
  const metricsQuery = trpc.panorama.listMetrics.useQuery();
  const customBounds = getActiveCustomBounds(
    period,
    monthInputToDataBase(customStart),
    monthInputToDataBase(customEnd),
  );
  const isCustomPeriodReady =
    period !== "custom" || Boolean(customStart && customEnd && customStart <= customEnd);
  const metricDataQuery = trpc.panorama.getMetricData.useQuery(
    {
      metricId: selectedMetricId,
      period,
      ...customBounds,
    },
    { enabled: Boolean(selectedMetricId) && isCustomPeriodReady },
  );

  const organizedGroups = useMemo(
    () =>
      DATA_LAB_GROUP_SECTIONS.map(section => ({
        label: section.label,
        groups: section.groupIds.flatMap(groupId => {
          const group = groupsQuery.data?.find(item => item.id === groupId);
          return group ? [group] : [];
        }),
      })),
    [groupsQuery.data],
  );

  const filteredMetrics = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return (metricsQuery.data ?? []).filter(metric => {
      if (groupId !== "all" && metric.groupId !== groupId) return false;
      if (
        normalizedSearch &&
        !metric.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) &&
        !metric.groupName.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      ) {
        return false;
      }
      return true;
    });
  }, [groupId, metricsQuery.data, search]);

  const groupedMetrics = filteredMetrics.reduce(
    (acc, metric) => {
      const group = groupsQuery.data?.find(g => g.id === metric.groupId);
      if (!group) return acc;

      const section = organizedGroups.find(s => s.groups.some(g => g.id === group.id));
      if (!section) return acc;

      const existing = acc.find(item => item.group.id === group.id);
      if (existing) {
        existing.metrics.push(metric);
      } else {
        acc.push({
          sectionLabel: section.label,
          group,
          metrics: [metric],
        });
      }
      return acc;
    },
    [] as Array<{ sectionLabel: string; group: any; metrics: any[] }>
  );

  useEffect(() => {
    if (metricsQuery.isLoading) return;
    const nextMetricId = resolveVisibleMetricId(selectedMetricId, filteredMetrics);
    if (nextMetricId !== selectedMetricId) {
      setSelectedMetricId(nextMetricId);
    }
  }, [filteredMetrics, metricsQuery.isLoading, selectedMetricId]);

  const selectedMetric = metricsQuery.data?.find(m => m.id === selectedMetricId);
  const result = metricDataQuery.data;
  const series = result?.series || [];
  const latestPoint = series[series.length - 1];
  const firstPoint = series[0];
  const variation =
    latestPoint && firstPoint && firstPoint.value !== 0
      ? ((latestPoint.value - firstPoint.value) / firstPoint.value) * 100
      : null;

  const isCustomPeriodComplete = customStart && customEnd;
  const isCustomPeriodOrdered = isCustomPeriodComplete && customStart <= customEnd;

  const tableRows = series.slice().reverse();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#e5e0d8] bg-[#15140f] text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <a href="/" className="font-bold text-[#f97316]">
            Panorama BC
          </a>
          <a href="/panorama" className="text-sm font-semibold hover:text-[#f97316]">
            ← Voltar ao Panorama BC
          </a>
        </nav>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#f97316]">
              Panorama BC · Panorama Oficial
            </span>
            <span className="inline-flex items-center rounded-full border border-yellow-400 bg-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-700">
              Dados integrados com Banco Central em tempo real
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Mercado em Números</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/70 sm:text-[15px]">
            Dados conectados ao Banco Central do Brasil. Explore mais de uma década do mercado de consórcios
            através das informações oficiais, organizadas e interpretadas matematicamente, sem estimativas,
            projeções ou dados de terceiros.
          </p>

          <div className="mt-6 flex gap-4 sm:gap-6">
            <div className="bg-[#1c1b15] p-3">
              <strong className="block font-mono text-xl text-white">125</strong>
              <span className="block text-xs font-semibold leading-tight text-white/50">métricas oficiais</span>
            </div>
            <div className="bg-[#1c1b15] p-3">
              <strong className="block font-mono text-xl text-white">10+</strong>
              <span className="block text-xs font-semibold leading-tight text-white/50">anos de histórico</span>
            </div>
            <div className="bg-[#1c1b15] p-3">
              <strong className="block font-mono text-xl text-white">19</strong>
              <span className="block text-xs font-semibold leading-tight text-white/50">grupos de dados</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 border-b border-[#e5e0d8] bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl overflow-x-auto px-4">
          <a
            href="/panorama"
            className="shrink-0 border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-[#4b4843] hover:text-[#15140f]"
          >
            Panorama editorial
          </a>
          <span className="shrink-0 border-b-2 border-[#f97316] px-4 py-4 text-sm font-bold text-[#c2410c]">
            Mercado em Números
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:py-10">
        <section aria-labelledby="selecao-title" className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-[#d1ccc5] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#c2410c]">
                  Passo 01
                </span>
                <h2 id="selecao-title" className="mt-1 text-lg font-bold">
                  Escolha a métrica
                </h2>
              </div>
              <Database className="h-5 w-5 text-[#f97316]" />
            </div>

            <label className="mt-5 block text-sm font-bold text-[#2d2b27]" htmlFor="panorama-group">
              Grupo oficial
            </label>
            <select
              id="panorama-group"
              value={groupId}
              onChange={event => setGroupId(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-[#bfb8af] bg-white px-3 text-[15px] font-semibold text-[#15140f] outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            >
              <option value="all">Todos os 19 grupos</option>
              {organizedGroups.map(section => (
                <optgroup key={section.label} label={section.label}>
                  {section.groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.metricCount})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <label className="mt-4 block text-sm font-bold text-[#2d2b27]" htmlFor="panorama-search">
              Buscar no catálogo
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-[#716b60]" />
              <input
                id="panorama-search"
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Ex.: cotas, carteira, taxa"
                className="min-h-11 w-full rounded-lg border border-[#bfb8af] bg-white py-2 pl-10 pr-3 text-[15px] font-semibold text-[#15140f] outline-none placeholder:font-medium placeholder:text-[#8a847b] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
              />
            </div>

            <label className="mt-4 block text-sm font-bold text-[#2d2b27]" htmlFor="panorama-metric">
              Métrica
            </label>
            {metricsQuery.isLoading || groupsQuery.isLoading ? (
              <div className="mt-2 rounded-lg bg-[#f6f3ec] p-4 text-sm font-semibold text-[#4b4843]">
                Carregando catálogo oficial…
              </div>
            ) : metricsQuery.error || groupsQuery.error ? (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                Não foi possível carregar o catálogo.
              </div>
            ) : (
              <>
                <select
                  id="panorama-metric"
                  value={selectedMetricId}
                  onChange={event => setSelectedMetricId(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-lg border border-[#bfb8af] bg-white px-3 py-2 text-[15px] font-semibold text-[#15140f] outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                >
                  {groupedMetrics.length === 0 ? (
                    <option value="">Nenhuma métrica encontrada</option>
                  ) : (
                    groupedMetrics.map(({ sectionLabel, group, metrics: groupMetrics }) => (
                      <optgroup key={group.id} label={`${sectionLabel} — ${group.name}`}>
                        {groupMetrics.map(metric => (
                          <option key={metric.id} value={metric.id}>
                            {metric.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-[#716b60]">
                  {filteredMetrics.length} de 125 métricas visíveis no filtro atual.
                </p>
              </>
            )}

            {selectedMetric && (
              <div className="mt-5 border-t border-[#e5e0d8] pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#716b60]">
                  Seleção atual
                </span>
                <p className="mt-1 text-sm font-bold leading-snug">{selectedMetric.name}</p>
                <p className="mt-2 font-mono text-xs font-semibold text-[#c2410c]">
                  {selectedMetric.groupName} · {selectedMetric.unit}
                </p>
              </div>
            )}

            <div className="mt-5 border-t border-[#e5e0d8] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#716b60]">
                Interpretando as métricas
              </span>
              <div className="mt-3 space-y-3">
                {organizedGroups.map(section => (
                  <div key={section.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#4b4843]">{section.label}</p>
                    <div className="mt-1 space-y-1">
                      {section.groups.map(group => (
                        <button
                          key={group.id}
                          onClick={() => {
                            const glossaryItem = GROUP_GLOSSARY[group.id];
                            if (glossaryItem) setSelectedGroupForGlossary(glossaryItem);
                          }}
                          className="block w-full text-left rounded px-2 py-1 text-xs font-semibold text-[#c2410c] hover:bg-[#f6f3ec]"
                        >
                          {group.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <section className="rounded-xl border border-[#d1ccc5] bg-white p-4 shadow-sm sm:p-5">
              <div className="rounded-lg border-l-4 border-[#f97316] bg-[#fff8f1] p-3 text-sm font-semibold leading-relaxed text-[#4b4843]">
                Esta visualização respeita integralmente a estrutura oficial do Banco Central do Brasil. Até 2025,
                os dados históricos disponíveis foram divulgados em periodicidade anual (competência dezembro). Para
                2026 em diante, o Banco Central adotará a divulgação trimestral. Novas competências serão adicionadas
                automaticamente à medida que forem disponibilizadas na base oficial.
              </div>

              <div className="mt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#c2410c]">
                      Passo 02
                    </span>
                    <h2 className="mt-1 text-lg font-bold">Defina o período</h2>
                  </div>
                  <CalendarRange className="hidden h-5 w-5 text-[#f97316] sm:block" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Período da série">
                  {PERIOD_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPeriod(option.id)}
                      aria-pressed={period === option.id}
                      className={`min-h-10 rounded-full border px-4 py-2 text-sm font-bold transition-transform duration-150 active:scale-[0.97] ${
                        period === option.id
                          ? "border-[#15140f] bg-[#15140f] text-white"
                          : "border-[#c9c2b8] bg-white text-[#4b4843] hover:border-[#15140f]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {period === "custom" && (
                  <div className="mt-4 grid gap-3 rounded-lg bg-[#f6f3ec] p-4 sm:grid-cols-2">
                    <label className="text-sm font-bold">
                      Início
                      <input
                        type="month"
                        value={customStart}
                        onChange={event => setCustomStart(event.target.value)}
                        className="mt-2 min-h-11 w-full rounded-lg border border-[#bfb8af] bg-white px-3 text-[15px] outline-none focus:border-[#f97316]"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Fim
                      <input
                        type="month"
                        value={customEnd}
                        onChange={event => setCustomEnd(event.target.value)}
                        className="mt-2 min-h-11 w-full rounded-lg border border-[#bfb8af] bg-white px-3 text-[15px] outline-none focus:border-[#f97316]"
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>

            <div className="mt-5">
              {period === "custom" && !isCustomPeriodOrdered ? (
                <div className="rounded-xl border border-[#d1ccc5] bg-white p-6 text-center shadow-sm">
                  <CalendarRange className="mx-auto h-6 w-6 text-[#f97316]" />
                  <h3 className="mt-3 text-lg font-bold">Período personalizado incompleto</h3>
                  <p className="mt-2 text-sm font-semibold text-[#4b4843]">
                    {isCustomPeriodComplete
                      ? "A competência inicial deve ser anterior ou igual à competência final."
                      : "Informe as competências de início e fim para consultar apenas as observações oficiais desse intervalo."}
                  </p>
                </div>
              ) : !selectedMetricId ? (
                <div className="rounded-xl border border-[#d1ccc5] bg-white p-6 text-center shadow-sm">
                  <Info className="mx-auto h-6 w-6 text-[#f97316]" />
                  <h3 className="mt-3 text-lg font-bold">Nenhuma métrica selecionada</h3>
                  <p className="mt-2 text-sm font-semibold text-[#4b4843]">
                    Ajuste os filtros ou escolha uma métrica para consultar a série oficial.
                  </p>
                </div>
              ) : metricDataQuery.isLoading ? (
                <div className="rounded-xl border border-[#d1ccc5] bg-white p-6 text-center shadow-sm">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#f97316] border-r-transparent" />
                  <p className="mt-3 text-sm font-semibold text-[#4b4843]">Consultando a série histórica no banco oficial…</p>
                </div>
              ) : metricDataQuery.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
                  <Info className="mx-auto h-6 w-6 text-red-600" />
                  <h3 className="mt-3 text-lg font-bold text-red-800">Não foi possível carregar esta série</h3>
                  <p className="mt-2 text-sm font-semibold text-red-700">{metricDataQuery.error.message}</p>
                </div>
              ) : !result || !result.coverage ? (
                <div className="rounded-xl border border-[#d1ccc5] bg-white p-6 text-center shadow-sm">
                  <Info className="mx-auto h-6 w-6 text-[#f97316]" />
                  <h3 className="mt-3 text-lg font-bold">Métrica sem observações</h3>
                  <p className="mt-2 text-sm font-semibold text-[#4b4843]">
                    O indicador existe no catálogo, mas ainda não possui valores no histórico disponível.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <section className="rounded-xl border border-[#d1ccc5] bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#e5e0d8] pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#c2410c]">
                          Série histórica
                        </span>
                        <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
                          {result.metric.name}
                        </h2>
                        <p className="mt-2 text-sm font-semibold text-[#4b4843]">
                          {result.metric.groupName} · unidade: {result.metric.unit}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-lg bg-[#fff3e8] px-3 py-2 text-xs font-bold text-[#9a3412]">
                        {result.period?.label}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      <div className="rounded-lg border border-[#e5e0d8] p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716b60]">
                          Valor mais recente
                        </span>
                        <strong className="mt-1 block font-mono text-lg sm:text-xl">
                          {latestPoint ? formatMetricValue(latestPoint.value, result.metric.unit) : "—"}
                        </strong>
                        <span className="mt-1 block text-xs font-semibold text-[#716b60]">
                          {latestPoint ? formatDataBase(latestPoint.dataBase) : "Sem observação"}
                        </span>
                      </div>
                      <div className="rounded-lg border border-[#e5e0d8] p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716b60]">
                          Variação no recorte
                        </span>
                        <strong
                          className={`mt-1 block font-mono text-lg sm:text-xl ${variation !== null && variation < 0 ? "text-[#9f1239]" : "text-[#2f5233]"}`}
                        >
                          {variation === null
                            ? "—"
                            : `${variation >= 0 ? "+" : ""}${variation.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`}
                        </strong>
                        <span className="mt-1 block text-xs font-semibold text-[#716b60]">
                          primeiro × último ponto
                        </span>
                      </div>
                      <div className="rounded-lg border border-[#e5e0d8] p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716b60]">
                          Observações exibidas
                        </span>
                        <strong className="mt-1 block font-mono text-lg sm:text-xl">{series.length}</strong>
                        <span className="mt-1 block text-xs font-semibold text-[#716b60]">
                          de {result.coverage.observationCount} disponíveis
                        </span>
                      </div>
                      <div className="rounded-lg border border-[#e5e0d8] p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716b60]">
                          Cobertura completa
                        </span>
                        <strong className="mt-1 block font-mono text-sm sm:text-base">
                          {formatDataBase(result.coverage.earliestDataBase)} — {formatDataBase(result.coverage.latestDataBase)}
                        </strong>
                        <span className="mt-1 block text-xs font-semibold text-[#716b60]">
                          {result.granularity.label}
                        </span>
                      </div>
                    </div>

                    {series.length === 0 ? (
                      <div className="mt-5 rounded-lg bg-[#f6f3ec] p-6 text-center text-sm font-semibold text-[#4b4843]">
                        Não há observações dentro do período selecionado.
                      </div>
                    ) : (
                      <div className="mt-6 h-[300px] w-full sm:h-[360px]" aria-label="Gráfico da série histórica">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={series} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                            <CartesianGrid stroke="#d8d1c7" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="dataBase"
                              tickFormatter={formatDataBase}
                              tick={{ fill: "#4b4843", fontSize: 12, fontWeight: 600 }}
                              axisLine={{ stroke: "#9e9890" }}
                              tickLine={false}
                              minTickGap={24}
                            />
                            <YAxis
                              width={64}
                              tickFormatter={formatAxisValue}
                              tick={{ fill: "#4b4843", fontSize: 12, fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              labelFormatter={label => formatDataBase(Number(label))}
                              formatter={value => [
                                formatMetricValue(Number(value), result.metric.unit),
                                result.metric.name,
                              ]}
                              contentStyle={{
                                borderRadius: 10,
                                borderColor: "#c9c2b8",
                                color: "#15140f",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name={result.metric.name}
                              stroke="#c2410c"
                              strokeWidth={3}
                              dot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: "#15140f", stroke: "#fff", strokeWidth: 2 }}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </section>

                  <section className="overflow-hidden rounded-xl border border-[#d1ccc5] bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-[#e5e0d8] p-4 sm:p-5">
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#c2410c]">
                          Dados brutos
                        </span>
                        <h2 className="mt-1 text-lg font-bold">Tabela da série exibida</h2>
                      </div>
                      <Table2 className="h-5 w-5 text-[#f97316]" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                        <thead className="bg-[#f6f3ec] text-[11px] uppercase tracking-wider text-[#4b4843]">
                          <tr>
                            <th className="px-4 py-3 font-bold sm:px-5">Competência</th>
                            <th className="px-4 py-3 text-right font-bold sm:px-5">Valor</th>
                            <th className="px-4 py-3 font-bold sm:px-5">Unidade</th>
                            <th className="px-4 py-3 font-bold sm:px-5">Fonte</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map(point => (
                            <tr key={point.dataBase} className="border-t border-[#eee9e1]">
                              <td className="px-4 py-3 font-mono font-bold sm:px-5">
                                {formatDataBase(point.dataBase)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold sm:px-5">
                                {formatMetricValue(point.value, result.metric.unit)}
                              </td>
                              <td className="px-4 py-3 font-semibold text-[#4b4843] sm:px-5">
                                {result.metric.unit}
                              </td>
                              <td className="px-4 py-3 font-semibold text-[#4b4843] sm:px-5">
                                {point.source}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 border-l-4 border-[#f97316] bg-[#15140f] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#f97316]" />
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#f97316]">
                Transparência e método
              </span>
              <h2 className="mt-2 text-xl font-bold">Uma fonte, nenhuma interpolação.</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/70 sm:text-[15px]">
                Catálogo e valores vêm exclusivamente do Panorama do Sistema de Consórcios do Banco Central do
                Brasil. O gráfico e a tabela usam a mesma resposta do backend. Competências ausentes permanecem
                ausentes: nenhum número é completado, estimado ou derivado de fonte externa.
              </p>
              <a
                href="https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/documentacao"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#fb923c] hover:text-[#fdba74]"
              >
                Consultar a documentação oficial do BCB
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {selectedGroupForGlossary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedGroupForGlossary(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#d1ccc5] bg-white p-6 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#15140f]">{selectedGroupForGlossary.name}</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#4b4843]">
              {selectedGroupForGlossary.description}
            </p>
            <button
              onClick={() => setSelectedGroupForGlossary(null)}
              className="mt-4 w-full rounded-lg bg-[#15140f] py-2 text-sm font-bold text-white hover:bg-[#2d2b27]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
