/**
 * Zona de Contemplação — Simulador nativo React + tRPC
 * 3 abas: 1. Histórico de Contemplações | 2. Quantitativo | 3. Leitura Técnica
 * Fiel ao HTML: ZonadeContemplação_ConsórciodeVerdade.html
 */
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft,
  Search,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  LabelList,
} from "recharts";
import { LOGO } from "@/lib/brand";
import WaitingAnalysisScreen from "@/components/cdv/WaitingAnalysisScreen";
import {
  AuditSeal,
  SectionTitle,
  KpiCard,
  DiagnosticCard,
  MeaningBlock,
  PointsList,
  CalcMemory,
  VideoBlock,
  MethodologyBlock,
  ConsultCTA,
  PdfButton,
  formatPct,
} from "@/components/cdv/SimuladorUI";
import { gerarPdfZonaContemplacao } from "@/lib/pdfZonaContemplacao";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistRow {
  ass: string;
  low: string;
  mid: string;
  high: string;
}

interface QuantRow {
  ass: string;
  sg: string;
  p30: string;
  p50: string;
  clivre: string;
  clim: string;
  c30: string;
  c50: string;
  csort: string;
  outras: string;
}

// ─── Dados de exemplo (XYZ) ───────────────────────────────────────────────────

const HIST_SEED: HistRow[] = [
  { ass: "3", low: "", mid: "", high: "" },
  { ass: "2", low: "", mid: "", high: "" },
  { ass: "1", low: "", mid: "", high: "" },
];

const QUANT_SEED: QuantRow[] = [
  { ass: "36", sg: "1200", p30: "360", p50: "600", clivre: "3", clim: "2", c30: "2", c50: "1", csort: "1", outras: "0" },
  { ass: "35", sg: "1200", p30: "360", p50: "600", clivre: "2", clim: "1", c30: "2", c50: "1", csort: "1", outras: "0" },
  { ass: "34", sg: "1200", p30: "360", p50: "600", clivre: "3", clim: "2", c30: "1", c50: "1", csort: "2", outras: "0" },
  { ass: "33", sg: "1200", p30: "360", p50: "600", clivre: "2", clim: "1", c30: "2", c50: "1", csort: "1", outras: "0" },
  { ass: "32", sg: "1200", p30: "360", p50: "600", clivre: "3", clim: "2", c30: "2", c50: "1", csort: "1", outras: "0" },
  { ass: "31", sg: "1200", p30: "360", p50: "600", clivre: "2", clim: "1", c30: "1", c50: "1", csort: "2", outras: "0" },
];

const MODALIDADES = [
  { value: "Livre", label: "Lance Livre (Embutido + Recurso próprio)" },
  { value: "Limitado", label: "Lance limitado - Recurso próprio" },
  { value: "Fixo30", label: "Lance fixo 30% - sorteio entre cotas participantes" },
  { value: "Fixo50", label: "Lance fixo 50% - sorteio entre cotas participantes" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(s: string): number {
  const n = parseFloat(String(s ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function CellInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      inputMode="decimal"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 data-num text-[14px] md:text-[15px] focus:outline-none focus:border-[var(--orange)] transition-colors"
    />
  );
}

function ChipBadge({ text, cls }: { text: string; cls: "green" | "yellow" | "red" }) {
  const colors = {
    green: "bg-[color-mix(in_oklch,var(--positive)_15%,transparent)] text-[var(--positive)] border-[color-mix(in_oklch,var(--positive)_30%,transparent)]",
    yellow: "bg-[color-mix(in_oklch,var(--orange)_12%,transparent)] text-[var(--orange)] border-[color-mix(in_oklch,var(--orange)_25%,transparent)]",
    red: "bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-[var(--destructive)] border-[color-mix(in_oklch,var(--destructive)_25%,transparent)]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[14px] md:text-[15px] font-medium border ${colors[cls]}`}>
      {text}
    </span>
  );
}

function Thermometer({ pos, label }: { pos: number; label: string }) {
  // Gradiente: vermelho forte (piso) → amarelo claro (abaixo da média) → amarelo escuro (média) → verde (teto)
  return (
    <div className="space-y-2">
      <div
        className="relative h-8 rounded-full overflow-visible border border-border"
        style={{ background: 'linear-gradient(to right, #dc2626 0%, #ef4444 15%, #f59e0b 35%, #d97706 50%, #84cc16 70%, #22c55e 100%)' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700"
          style={{ left: `${Math.max(2, Math.min(98, pos))}%`, transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
        >
          <div className="w-1 h-10 bg-[var(--ink)] rounded-full shadow-md" />
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[14px] md:text-[15px] font-bold data-num bg-[var(--ink)] text-white px-2 py-0.5 rounded-full shadow">
            {label}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-foreground/45 px-1">
        <span>Piso</span>
        <span>Referência central</span>
        <span>Teto</span>
      </div>
    </div>
  );
}

function ProgressBar({ pct, color = "orange" }: { pct: number; color?: "orange" | "green" | "red" }) {
  const bg = color === "green" ? "bg-[var(--positive)]" : color === "red" ? "bg-[var(--destructive)]" : "bg-[var(--orange)]";
  return (
    <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${bg}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SimuladorZonaContemplacao() {
  const [activeTab, setActiveTab] = useState<"dados" | "quant" | "leitura">("dados");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "dados" || hash === "quant" || hash === "leitura") {
      setActiveTab(hash as "dados" | "quant" | "leitura");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  }, []);
  const [grupoNome, setGrupoNome] = useState("XYZ");
  const [modalidade, setModalidade] = useState("Livre");
  const [metodo, setMetodo] = useState<"media" | "mediana">("media");

  // Aba 1 — Histórico
  const [histRows, setHistRows] = useState<HistRow[]>(HIST_SEED);
  const [meuLance, setMeuLance] = useState("56");

  // Aba 2 — Quantitativo
  const [quantRows, setQuantRows] = useState<QuantRow[]>(QUANT_SEED);
  const [prazo, setPrazo] = useState("180");
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([0, 1, 2, 3, 4, 5]);


  // Mutations
  const calcHist = trpc.zonaContemplacao.calcHistorico.useMutation({
    onError: (err) => toast.error(err.message || "Erro ao calcular histórico."),
  });
  const calcQuant = trpc.zonaContemplacao.calcQuantitativo.useMutation({
    onError: (err) => toast.error(err.message || "Erro ao calcular quantitativo."),
  });

  const histResult = calcHist.data;
  const quantResult = calcQuant.data;

  // ── Aba 1: Histórico ──────────────────────────────────────────────────────

  function updateHistRow(i: number, key: keyof HistRow, v: string) {
    setHistRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  }
  function addHistRow() {
    const nextAss = histRows.length ? Math.max(...histRows.map((r) => parseNum(r.ass))) + 1 : 1;
    setHistRows((prev) => [{ ass: String(nextAss), low: "", mid: "", high: "" }, ...prev]);
  }
  function removeHistRow(i: number) {
    setHistRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function runHistorico() {
    const parsed = histRows
      .map((r) => ({ ass: parseNum(r.ass), low: parseNum(r.low), mid: parseNum(r.mid), high: parseNum(r.high) }))
      .filter((r) => r.low > 0 || r.mid > 0 || r.high > 0);
    if (!parsed.length) { toast.error("Preencha ao menos uma assembleia com lances."); return; }
    calcHist.mutate({ rows: parsed, meulance: parseNum(meuLance), metodoZona: metodo, modalidade, grupoNome });
    setTimeout(() => document.getElementById("resultado-hist")?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  }

  // ── Aba 2: Quantitativo ───────────────────────────────────────────────────

  function updateQuantRow(i: number, key: keyof QuantRow, v: string) {
    setQuantRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  }
  function addQuantRow() {
    const nextAss = quantRows.length ? Math.max(...quantRows.map((r) => parseNum(r.ass))) + 1 : 1;
    setQuantRows((prev) => [{ ass: String(nextAss), sg: "", p30: "", p50: "", clivre: "", clim: "", c30: "", c50: "", csort: "", outras: "" }, ...prev]);
    setSelectedIndexes((prev) => prev.map((i) => i + 1));
  }
  function removeQuantRow(i: number) {
    setQuantRows((prev) => prev.filter((_, idx) => idx !== i));
    setSelectedIndexes((prev) => prev.filter((idx) => idx !== i).map((idx) => (idx > i ? idx - 1 : idx)));
  }
  function toggleQuantRow(i: number) {
    setSelectedIndexes((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  function runQuantitativo() {
    const parsed = quantRows.map((r) => ({
      ass: parseNum(r.ass),
      sg: parseNum(r.sg),
      p30: parseNum(r.p30),
      p50: parseNum(r.p50),
      clivre: parseNum(r.clivre),
      clim: parseNum(r.clim),
      c30: parseNum(r.c30),
      c50: parseNum(r.c50),
      csort: parseNum(r.csort),
      outras: parseNum(r.outras),
    }));
    if (!parsed.length) { toast.error("Preencha ao menos uma assembleia."); return; }
    calcQuant.mutate({ rows: parsed, selectedIndexes, hPrazo: parseNum(prazo) });
    setTimeout(() => document.getElementById("resultado-quant")?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  }

  // ── PDF ───────────────────────────────────────────────────────────────────

  async function handlePdf() {
    try {
      if (activeTab === "dados" && histResult) {
        const histRowsParsed = histRows
          .map((r) => ({ ass: parseNum(r.ass), low: parseNum(r.low), mid: parseNum(r.mid), high: parseNum(r.high) }))
          .filter((r) => r.low > 0 || r.mid > 0 || r.high > 0);
        await gerarPdfZonaContemplacao({
          tab: "dados",
          grupoNome,
          zonaResult: {
            low: histResult.low,
            mid: histResult.mid,
            high: histResult.high,
            trend: { label: histResult.trend.label, detail: histResult.trend.detail, cls: histResult.trend.cls },
            position: { title: histResult.position.title, detail: histResult.position.detail, pos: histResult.position.pos },
            pressao: { label: histResult.pressao.label, detail: histResult.pressao.detail },
            chips: histResult.chips.map((c) => ({ text: c.text, cls: c.cls })),
            simulationId: histResult.simulationId,
            generatedAt: histResult.generatedAt,
          },
          historicoRows: histRowsParsed,
        });
      } else if (activeTab === "quant" && quantResult) {
        const quantRowsParsed = quantRows.map((r) => ({
          ass: parseNum(r.ass),
          sg: parseNum(r.sg),
          p30: parseNum(r.p30),
          p50: parseNum(r.p50),
          clivre: parseNum(r.clivre),
          clim: parseNum(r.clim),
          c30: parseNum(r.c30),
          c50: parseNum(r.c50),
          csort: parseNum(r.csort),
          outras: parseNum(r.outras),
        }));
        await gerarPdfZonaContemplacao({
          tab: "quant",
          grupoNome,
          quantResult: {
            totalCont: quantResult.totalCont,
            indice: quantResult.indice,
            nec: quantResult.nec,
            cob: quantResult.cob,
            probSorteioGeral: quantResult.probSorteioGeral,
            probSorteioDetalhe: quantResult.probSorteioDetalhe,
            hStatus: { title: quantResult.hStatus.title, detail: quantResult.hStatus.detail, chip: quantResult.hStatus.chip, pin: quantResult.hStatus.pin },
            chips: quantResult.chips.map((c) => ({ text: c.text, cls: c.cls })),
            fixo30: quantResult.fixo30,
            fixo50: quantResult.fixo50,
            odds30Pct: quantResult.odds30Pct,
            odds50Pct: quantResult.odds50Pct,
            distribText: quantResult.distribText,
            restanteText: quantResult.restanteText,
            trendText: quantResult.trendText,
            simulationId: quantResult.simulationId,
            generatedAt: quantResult.generatedAt,
          },
          quantRows: quantRowsParsed,
        });
      } else {
        toast.info("Execute a análise desta aba antes de gerar o PDF.");
      }
    } catch (e) {
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  }

  // ── Gráfico (Aba 1) ───────────────────────────────────────────────────────

  const chartData = [...histRows]
    .filter((r) => parseNum(r.low) > 0 || parseNum(r.mid) > 0 || parseNum(r.high) > 0)
    .sort((a, b) => parseNum(a.ass) - parseNum(b.ass))
    .map((r) => ({ label: `Ass. ${r.ass}`, low: parseNum(r.low), mid: parseNum(r.mid), high: parseNum(r.high) }));

  // ─────────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "dados" as const, label: "1. Histórico de Contemplações" },
    { id: "quant" as const, label: "2. Quantitativo das Contemplações" },
    { id: "leitura" as const, label: "3. Leitura Técnica" },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* HERO */}
      <section id="hero" className="bg-[#0A0A08] text-white pt-8 pb-16 w-full px-4 md:px-5 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/simuladores#hero"
            className="inline-flex items-center gap-2 text-[#FF4E1F] font-['IBM_Plex_Mono'] text-[14px] md:text-[15px] font-semibold uppercase tracking-widest hover:text-[#FFC93C] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="max-w-3xl">
            <h1 className="font-['Archivo_Black'] text-2xl md:text-3xl lg:text-4xl mb-4 leading-tight text-white uppercase">
              Onde seu lance se encaixa no grupo?
            </h1>
            <p className="text-[#C9C4B8] text-[14px] md:text-[15px] md:text-base max-w-3xl leading-relaxed">
              O lance não é apenas um valor. É uma posição frente à concorrência.
              Analise o histórico, o quantitativo de vagas e a pressão do grupo para
              identificar a sua real zona de contemplação.
            </p>
          </div>
        </div>
      </section>
      {/* TABS */}
      <div className="sticky top-0 z-20 bg-[var(--paper)] border-b border-border shadow-sm">
        <div className="container">
          <div className="flex overflow-x-auto gap-0 -mb-px">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-4 text-[14px] md:text-[15px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "border-[var(--orange)] text-[var(--orange)]"
                    : "border-transparent text-foreground/55 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="container py-4 md:py-6">

        {/* ── ABA 1: HISTÓRICO ─────────────────────────────────────────────── */}
        {activeTab === "dados" && (
          <div className="space-y-5 max-w-5xl mx-auto">
            {/* Parâmetros */}
            <div id="parametros" className="rounded-2xl border border-border bg-card p-5 space-y-4 scroll-mt-24">
              <SectionTitle
                eyebrow="Parâmetros do histórico"
                title="Configurações do grupo"
                desc="Identifique o grupo e escolha a modalidade de lance para filtrar o histórico corretamente."
              />
              {/* Texto orientador */}
              <div className="rounded-xl bg-secondary/50 border border-border px-4 py-3">
                <p className="text-[14px] md:text-[15px] text-foreground/65 leading-relaxed">
                  Informe os lances observados nas últimas assembleias do grupo. Preencha o % do menor lance, do lance médio e do maior lance de cada assembleia, sempre usando dados da mesma modalidade. Depois, insira o percentual de lance que deseja testar. O simulador vai posicionar esse lance dentro da faixa histórica informada, permitindo comparar o valor testado com o piso, a referência central e o teto dos lances anteriores.{" "}
                  <strong className="text-foreground/80">O RESULTADO NÃO REFLETE PROMESSA OU GARANTIA DE CONTEMPLAÇÃO, APENAS MOSTRA COMO O GRUPO VEM SE MOVIMENTANDO.</strong>
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[14px] md:text-[15px] font-medium text-foreground/70 mb-1.5 block">Nome do grupo</label>
                  <input
                    value={grupoNome}
                    onChange={(e) => setGrupoNome(e.target.value)}
                    placeholder="Ex: XYZ"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[14px] md:text-[15px] focus:outline-none focus:border-[var(--orange)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[14px] md:text-[15px] font-medium text-foreground/70 mb-1.5 block">Modalidade</label>
                  <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[14px] md:text-[15px] focus:outline-none focus:border-[var(--orange)] transition-colors"
                  >
                    {MODALIDADES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] md:text-[15px] font-medium text-foreground/70 mb-1.5 block">Método estatístico</label>
                  <div className="flex gap-2">
                    {(["media", "mediana"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMetodo(m)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-[14px] md:text-[15px] font-medium transition-colors ${
                          metodo === m
                            ? "border-[var(--orange)] text-[var(--orange)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)]"
                            : "border-border text-foreground/60"
                        }`}
                      >
                        {m === "media" ? "Média" : "Mediana"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de histórico */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="font-semibold text-[14px] md:text-[15px]">Histórico mensal</p>
                <p className="text-[14px] md:text-[15px] text-foreground/75 mt-0.5">Informe, por assembleia, o menor, o médio e o maior lance vencedor (% da carta). Quanto mais assembleias, melhor a leitura.</p>
              </div>
              <div id="leitura" className="overflow-x-auto scroll-mt-24">
                <table className="w-full text-[14px] md:text-[15px]">
                  <thead>
                    <tr className="bg-secondary/60 text-foreground/55 text-[14px] md:text-[15px] uppercase tracking-wide">
                      <th className="text-left font-medium px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          Assembleia
                          <span title="Número da assembleia (mês do grupo)"><HelpCircle className="w-3 h-3 text-foreground/35" /></span>
                        </span>
                      </th>
                      <th className="text-left font-medium px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          Menor lance (%)
                          <span title="Menor percentual de lance que venceu contemplação nesta assembleia"><HelpCircle className="w-3 h-3 text-foreground/35" /></span>
                        </span>
                      </th>
                      <th className="text-left font-medium px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          Lance médio (%)
                          <span title="Lance médio dos contemplados nesta assembleia"><HelpCircle className="w-3 h-3 text-foreground/35" /></span>
                        </span>
                      </th>
                      <th className="text-left font-medium px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          Maior lance (%)
                          <span title="Maior percentual de lance vencedor nesta assembleia"><HelpCircle className="w-3 h-3 text-foreground/35" /></span>
                        </span>
                      </th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {histRows.map((r, i) => (
                      <tr key={i} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-2"><CellInput value={r.ass} onChange={(v) => updateHistRow(i, "ass", v)} /></td>
                        <td className="px-4 py-2"><CellInput value={r.low} onChange={(v) => updateHistRow(i, "low", v)} /></td>
                        <td className="px-4 py-2"><CellInput value={r.mid} onChange={(v) => updateHistRow(i, "mid", v)} /></td>
                        <td className="px-4 py-2"><CellInput value={r.high} onChange={(v) => updateHistRow(i, "high", v)} /></td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => removeHistRow(i)} className="text-foreground/30 hover:text-[var(--destructive)] transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border">
                <button onClick={addHistRow} className="inline-flex items-center gap-1.5 text-[14px] md:text-[15px] font-medium text-[var(--orange)] hover:underline">
                  <Plus className="w-4 h-4" /> Adicionar assembleia
                </button>
              </div>
            </div>

            {/* Lance a testar + botão */}
            <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
              <div>
                <label className="text-[14px] md:text-[15px] font-medium text-foreground/70 mb-1.5 block">Média de contemplação (% da carta)</label>
                <input
                  inputMode="decimal"
                  placeholder="Ex: 45,5%"
                  value={meuLance}
                  onChange={(e) => setMeuLance(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg data-num font-semibold focus:outline-none focus:border-[var(--orange)] transition-colors"
                />
                <p className="text-[14px] md:text-[15px] text-foreground/50 mt-1">Insira a média de contemplação em percentual (ex: 45,5%)</p>
              </div>
              <button
                onClick={runHistorico}
                disabled={calcHist.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3.5 text-[14px] md:text-[15px] font-semibold transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 whitespace-nowrap"
              >
                {calcHist.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando…</> : <><Search className="w-4 h-4" /> Analisar zona</>}
              </button>
            </div>

            {/* RESULTADO ABA 1 */}
            <div id="resultado-hist" className="scroll-mt-24 space-y-4">
              {!histResult && !calcHist.isPending && <WaitingAnalysisScreen />}

              {calcHist.isPending && (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <Loader2 className="w-10 h-10 text-[var(--orange)] mx-auto mb-4 animate-spin" />
                  <p className="text-foreground/60">Processando histórico no servidor…</p>
                </div>
              )}

              {histResult && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  {/* KPIs — Zona de Contemplação */}
                  <div>
                    <p className="eyebrow text-foreground/50 mb-2">Zona de Contemplação</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KpiCard label="Piso histórico" value={formatPct(histResult.low)} hint="Menor lance vencedor" />
                      <KpiCard label="Referência central" value={formatPct(histResult.mid)} hint="Lance médio" tone="orange" />
                      <KpiCard label="Teto histórico" value={formatPct(histResult.high)} hint="Maior lance vencedor" />
                      <KpiCard label="Lance testado" value={formatPct(parseNum(meuLance))} hint={histResult.position.title} highlight />
                    </div>
                  </div>

                  {/* Lance testado */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <p className="eyebrow text-foreground/50">Lance testado</p>
                    <div className="flex flex-wrap gap-2">
                      {histResult.chips.map((c, i) => (
                        <ChipBadge key={i} text={c.text} cls={c.cls} />
                      ))}
                    </div>
                  </div>



                  {/* Gráfico da zona */}
                  {chartData.length > 1 && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <p className="eyebrow text-foreground/50 mb-3">Gráfico da zona</p>
                      <div className="w-full overflow-x-auto">
                        <div style={{ minWidth: 480 }}>
                          <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -8, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--border)" />
                              <YAxis tick={{ fontSize: 10 }} stroke="var(--border)" unit="%" domain={["auto", "auto"]} />
                              <RechartsTooltip formatter={(v: number) => `${v}%`} />
                              <Legend />
                              <ReferenceLine
                                y={parseNum(meuLance)}
                                stroke="var(--ink)"
                                strokeDasharray="4 4"
                                label={{ value: "Meu lance", fontSize: 10, position: "insideTopRight" }}
                              />
                              <Line type="monotone" dataKey="low" name="Menor" stroke="#27c07d" strokeWidth={2} dot={{ r: 4 }}>
                                <LabelList dataKey="low" position="bottom" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#16a34a' }} />
                              </Line>
                              <Line type="monotone" dataKey="mid" name="Médio" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4 }}>
                                <LabelList dataKey="mid" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#ea580c' }} />
                              </Line>
                              <Line type="monotone" dataKey="high" name="Maior" stroke="#111" strokeWidth={2} dot={{ r: 4 }}>
                                <LabelList dataKey="high" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#111' }} />
                              </Line>
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* PDF */}
                  <div className="flex flex-wrap items-center gap-3">
                    <PdfButton onClick={handlePdf} />
                    <span className="inline-flex items-center gap-1.5 text-[14px] md:text-[15px] text-foreground/45">
                      <ShieldCheck className="w-3.5 h-3.5" /> Relatório de Auditoria Independente
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA 2: QUANTITATIVO ──────────────────────────────────────────── */}
        {activeTab === "quant" && (
          <div className="space-y-5 max-w-6xl mx-auto">
            <div id="parametros-quant" className="rounded-2xl border border-border bg-card p-5 space-y-4 scroll-mt-24">
              <SectionTitle
                eyebrow="Quantitativo das contemplações"
                title="Saúde do grupo"
              />
              {/* Texto orientador */}
              <div className="rounded-xl bg-secondary/50 border border-border px-4 py-3">
                <p className="text-[14px] md:text-[15px] text-foreground/75 leading-relaxed">
                  Preencha com a quantidade de contemplações realizadas, começando pela mais recente. Em cada linha, informe o número da assembleia, a base geral de cotas ativas participantes do sorteio geral, a quantidade de cotas que disputaram os lances fixos de 30% e 50% e quantas contemplações ocorreram em cada modalidade: lance livre, lance limitado, lance fixo 30%, lance fixo 50%, sorteio geral ou outras. O objetivo é organizar o comportamento histórico do grupo por assembleia, permitindo observar o ritmo das contemplações sem transformar esses dados em previsão, promessa ou garantia de resultado futuro.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[14px] md:text-[15px] font-medium text-foreground/70 mb-1.5 block">Prazo total do grupo (assembleias)</label>
                  <input
                    inputMode="numeric"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[14px] md:text-[15px] data-num focus:outline-none focus:border-[var(--orange)] transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-[14px] md:text-[15px] text-foreground/50">
                    Clique nas linhas da tabela para incluir/excluir assembleias da análise. Linhas marcadas em laranja estão selecionadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabela quantitativa */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[14px] md:text-[15px]">
                  <thead>
                    <tr className="bg-[var(--ink)] text-white text-[10px] uppercase tracking-wide">
                      <th className="text-left font-medium px-3 py-3">Ass.</th>
                      <th className="text-left font-medium px-3 py-3 border-l-2 border-[var(--orange)]">Base Geral</th>
                      <th className="text-left font-medium px-3 py-3 border-l-2 border-[var(--orange)]">Part. 30%</th>
                      <th className="text-left font-medium px-3 py-3">Part. 50%</th>
                      <th className="text-left font-medium px-3 py-3 border-l-2 border-[var(--orange)]">Livre</th>
                      <th className="text-left font-medium px-3 py-3">Limitado</th>
                      <th className="text-left font-medium px-3 py-3">Fixo 30%</th>
                      <th className="text-left font-medium px-3 py-3">Fixo 50%</th>
                      <th className="text-left font-medium px-3 py-3">Sorteio</th>
                      <th className="text-left font-medium px-3 py-3">Outras</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quantRows.map((r, i) => {
                      const isSelected = selectedIndexes.includes(i);
                      return (
                        <tr
                          key={i}
                          onClick={() => toggleQuantRow(i)}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-[color-mix(in_oklch,var(--orange)_8%,transparent)]" : "hover:bg-secondary/30"}`}
                        >
                          <td className="px-3 py-1.5"><CellInput value={r.ass} onChange={(v) => updateQuantRow(i, "ass", v)} /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.sg} onChange={(v) => updateQuantRow(i, "sg", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.p30} onChange={(v) => updateQuantRow(i, "p30", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.p50} onChange={(v) => updateQuantRow(i, "p50", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.clivre} onChange={(v) => updateQuantRow(i, "clivre", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.clim} onChange={(v) => updateQuantRow(i, "clim", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.c30} onChange={(v) => updateQuantRow(i, "c30", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.c50} onChange={(v) => updateQuantRow(i, "c50", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.csort} onChange={(v) => updateQuantRow(i, "csort", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5"><CellInput value={r.outras} onChange={(v) => updateQuantRow(i, "outras", v)} placeholder="0" /></td>
                          <td className="px-3 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => removeQuantRow(i)} className="text-foreground/30 hover:text-[var(--destructive)] transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <button onClick={addQuantRow} className="inline-flex items-center gap-1.5 text-[14px] md:text-[15px] font-medium text-[var(--orange)] hover:underline">
                  <Plus className="w-4 h-4" /> Adicionar assembleia
                </button>
                <span className="text-[14px] md:text-[15px] text-foreground/45">{selectedIndexes.length} selecionada(s)</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={runQuantitativo}
                disabled={calcQuant.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3.5 text-[14px] md:text-[15px] font-semibold transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
              >
                {calcQuant.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando…</> : <><Search className="w-4 h-4" /> Analisar quantitativo</>}
              </button>
            </div>

            {/* RESULTADO ABA 2 */}
            <div id="resultado-quant" className="scroll-mt-24 space-y-6">
              {!quantResult && !calcQuant.isPending && <WaitingAnalysisScreen />}

              {calcQuant.isPending && (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <Loader2 className="w-10 h-10 text-[var(--orange)] mx-auto mb-4 animate-spin" />
                  <p className="text-foreground/60">Processando quantitativo…</p>
                </div>
              )}

              {quantResult && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  {/* KPIs */}
                  <div>
                    <p className="eyebrow text-foreground/50 mb-3">Quantitativo das contemplações</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KpiCard label="Total contemplações" value={quantResult.totalCont.toLocaleString("pt-BR")} hint="No recorte selecionado" />
                      <KpiCard label="Índice de contemplação" value={`${quantResult.indice.toFixed(2).replace(".", ",")}%`} hint="Total / base geral" tone="orange" />
                      <KpiCard label="Média necessária" value={quantResult.nec.toFixed(1).replace(".", ",")} hint="Por assembleia" />
                      <KpiCard label="Cobertura" value={`${quantResult.cob.toFixed(0)}%`} hint="Realizado / necessário" highlight />
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <p className="eyebrow text-foreground/50">Diagnóstico</p>
                    <div className="flex flex-wrap gap-2">
                      {quantResult.chips.map((c, i) => (
                        <ChipBadge key={i} text={c.text} cls={c.cls} />
                      ))}
                    </div>
                    <div className={`rounded-xl p-4 border ${
                      quantResult.hStatus.chip === "green"
                        ? "bg-[color-mix(in_oklch,var(--positive)_10%,transparent)] border-[color-mix(in_oklch,var(--positive)_25%,transparent)]"
                        : quantResult.hStatus.chip === "red"
                        ? "bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)] border-[color-mix(in_oklch,var(--destructive)_25%,transparent)]"
                        : "bg-[color-mix(in_oklch,var(--orange)_8%,transparent)] border-[color-mix(in_oklch,var(--orange)_20%,transparent)]"
                    }`}>
                      <p className="font-bold">{quantResult.hStatus.title}</p>
                      <p className="text-[14px] md:text-[15px] text-foreground/70 mt-1">{quantResult.hStatus.detail}</p>
                    </div>
                  </div>



                  {/* Lance fixo */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <p className="eyebrow text-foreground/50">Lance fixo</p>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-[14px] md:text-[15px] font-semibold">Fixo 30%</p>
                          <span className="font-bold data-num text-[var(--orange)]">{quantResult.odds30Pct.toFixed(2).replace(".", ",")}%</span>
                        </div>
                        <ProgressBar pct={quantResult.odds30Pct} />
                        <p className="text-[14px] md:text-[15px] text-foreground/55">{quantResult.fixo30.txt}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-[14px] md:text-[15px] font-semibold">Fixo 50%</p>
                          <span className="font-bold data-num text-[var(--orange)]">{quantResult.odds50Pct.toFixed(2).replace(".", ",")}%</span>
                        </div>
                        <ProgressBar pct={quantResult.odds50Pct} />
                        <p className="text-[14px] md:text-[15px] text-foreground/55">{quantResult.fixo50.txt}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border text-[14px] md:text-[15px] text-foreground/50">
                      <p>Sorteio geral: {quantResult.probSorteioGeral.toFixed(2).replace(".", ",")}% — {quantResult.probSorteioDetalhe}</p>
                    </div>
                  </div>

                  {/* PDF */}
                  <div className="flex flex-wrap items-center gap-3">
                    <PdfButton onClick={handlePdf} />
                    <span className="inline-flex items-center gap-1.5 text-[14px] md:text-[15px] text-foreground/45">
                      <ShieldCheck className="w-3.5 h-3.5" /> Relatório de Auditoria Independente
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA 3: LEITURA TÉCNICA ───────────────────────────────────────── */}
        {activeTab === "leitura" && (
          <div className="space-y-5 max-w-4xl mx-auto">
            <SectionTitle
              eyebrow="Leitura técnica"
              title="Interpretação dos dados"
              desc="Execute as análises das abas 1 e 2 para ver a leitura técnica consolidada."
            />

            {(!histResult && !quantResult) && <WaitingAnalysisScreen />}

            {histResult && (
              <div className="space-y-3">
                <p className="eyebrow text-foreground/50">Leitura técnica — Histórico de lances</p>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-secondary/40 p-4">
                      <p className="text-[14px] md:text-[15px] text-foreground/50 mb-1">Tendência dos lances</p>
                      <p className="font-bold">{histResult.trend.label}</p>
                      <p className="text-[14px] md:text-[15px] text-foreground/60 mt-0.5">{histResult.trend.detail}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/40 p-4">
                      <p className="text-[14px] md:text-[15px] text-foreground/50 mb-1">Posição do lance testado</p>
                      <p className="font-bold">{histResult.position.title}</p>
                      <p className="text-[14px] md:text-[15px] text-foreground/60 mt-0.5">{histResult.position.detail}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-4">
                    <p className="text-[14px] md:text-[15px] text-foreground/50 mb-1">Aviso educativo</p>
                    <p className="text-[14px] md:text-[15px] text-foreground/70">
                      Este histórico é informado pelo próprio usuário com base em dados públicos das assembleias. Não representa promessa ou garantia de contemplação futura. O comportamento dos lances pode mudar a qualquer momento conforme a dinâmica do grupo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {quantResult && (
              <div className="space-y-3">
                <p className="eyebrow text-foreground/50">Leitura técnica — Quantitativo</p>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="rounded-xl bg-secondary/40 p-4">
                    <p className="text-[14px] md:text-[15px] text-foreground/50 mb-1">Diagnóstico do grupo</p>
                    <p className="font-bold">{quantResult.hStatus.title}</p>
                    <p className="text-[14px] md:text-[15px] text-foreground/60 mt-0.5">{quantResult.hStatus.detail}</p>
                  </div>
                  <div className="text-[14px] md:text-[15px] text-foreground/60 space-y-1 px-1">
                    <p>{quantResult.distribText}</p>
                    <p>{quantResult.restanteText}</p>
                    <p>{quantResult.trendText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* METODOLOGIA */}
      <div className="container pb-16 space-y-6 max-w-5xl mx-auto">
        <VideoBlock title="Como ler a zona de contemplação" />
        <ConsultCTA context="a leitura da sua zona de contemplação" />
        <MethodologyBlock
          sources={[
            "Histórico de lances vencedores informado pelo próprio usuário com base em dados públicos das assembleias",
            "Estatística descritiva (média/mediana) e análise de tendência por janelas móveis de 3 assembleias",
            "Quantitativo de contemplações por modalidade: lance livre, limitado, fixo 30%, fixo 50%, sorteio geral",
            "Cálculos executados no servidor e reproduzíveis pela memória de cálculo",
          ]}
        >
          <p>
            A zona de contemplação é estimada a partir da distribuição histórica dos lances vencedores.
            A leitura da tendência compara as três assembleias mais recentes com as três anteriores.
            O quantitativo analisa o ritmo de contemplação versus a média necessária para o prazo restante.
            Compare sempre dados da mesma modalidade de lance.
          </p>
        </MethodologyBlock>
      </div>
    </div>
  );
}
