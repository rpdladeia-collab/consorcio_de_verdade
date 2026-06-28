import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft,
  Search,
  Loader2,
  LineChart as LineChartIcon,
  Plus,
  Trash2,
  ShieldCheck,
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
} from "recharts";
import {
  AuditSeal,
  SectionTitle,
  KpiCard,
  DiagnosticCard,
  MeaningBlock,
  PointsList,
  CalcMemory,
  Collapsible,
  VideoBlock,
  MethodologyBlock,
  ConsultCTA,
  PdfButton,
  formatPct,
  type Verdict,
} from "@/components/cdv/SimuladorUI";

function mapVerdict(v: "positivo" | "atencao" | "critico"): Verdict {
  if (v === "positivo") return "positive";
  if (v === "critico") return "negative";
  return "neutral";
}

interface Row {
  ass: string;
  low: string;
  mid: string;
  high: string;
}

const SEED: Row[] = [
  { ass: "36", low: "42", mid: "48", high: "55" },
  { ass: "35", low: "40", mid: "47", high: "54" },
  { ass: "34", low: "41", mid: "46", high: "52" },
  { ass: "33", low: "38", mid: "45", high: "51" },
  { ass: "32", low: "39", mid: "44", high: "50" },
  { ass: "31", low: "37", mid: "43", high: "49" },
];

export default function SimuladorZonaContemplacao() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [myBid, setMyBid] = useState<string>("46");
  const [method, setMethod] = useState<"media" | "mediana">("media");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const calc = trpc.simuladores.zonaContemplacao.useMutation({
    onError: (err) => toast.error(err.message || "Não foi possível calcular."),
  });
  const result = calc.data;

  function updateRow(i: number, key: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }
  function addRow() {
    const nextAss = rows.length ? Math.max(...rows.map((r) => parseInt(r.ass) || 0)) + 1 : 1;
    setRows((prev) => [{ ass: String(nextAss), low: "", mid: "", high: "" }, ...prev]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function runAudit() {
    const parsed = rows
      .map((r) => ({
        ass: parseFloat(r.ass.replace(",", ".")) || 0,
        low: parseFloat(r.low.replace(",", ".")) || 0,
        mid: parseFloat(r.mid.replace(",", ".")) || 0,
        high: parseFloat(r.high.replace(",", ".")) || 0,
      }))
      .filter((r) => r.low > 0 || r.mid > 0 || r.high > 0);
    if (!parsed.length) {
      toast.error("Preencha ao menos uma assembleia com lances.");
      return;
    }
    calc.mutate({
      rows: parsed,
      myBid: parseFloat(myBid.replace(",", ".")) || 0,
      method,
      modalidade: "Lance livre",
    });
    setTimeout(() => {
      document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="dark bg-[var(--ink)] text-[var(--paper)]">
        <div className="container py-12 md:py-16">
          <Link
            to="/simuladores"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Central de Simuladores
          </Link>
          <div className="max-w-3xl">
            <AuditSeal className="mb-5" />
            <p className="eyebrow text-[var(--orange)] mb-3">Saúde do grupo · Análise independente</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">
              Quando você tem chance real de ser contemplado?
            </h1>
            <p className="text-lg text-white/65 mt-5 leading-relaxed">
              Reúna o histórico de lances vencedores do seu grupo e descubra
              em que faixa o seu lance precisa estar para competir. A análise
              posiciona o seu lance dentro da zona provável de contemplação.
            </p>
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <section className="w-full bg-[var(--paper)] py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <SectionTitle
            eyebrow="Diagnóstico rápido"
            title="Histórico de lances vencedores"
            desc="Informe, por assembleia, o menor, o médio e o maior lance vencedor (em % da carta). Quanto mais assembleias, melhor a leitura."
          />

          {/* Tabela editável */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-foreground/55 text-xs uppercase tracking-wide">
                    <th className="text-left font-medium px-4 py-3">Assembleia</th>
                    <th className="text-left font-medium px-4 py-3">Menor lance (%)</th>
                    <th className="text-left font-medium px-4 py-3">Lance médio (%)</th>
                    <th className="text-left font-medium px-4 py-3">Maior lance (%)</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        <CellInput value={r.ass} onChange={(v) => updateRow(i, "ass", v)} />
                      </td>
                      <td className="px-4 py-2">
                        <CellInput value={r.low} onChange={(v) => updateRow(i, "low", v)} />
                      </td>
                      <td className="px-4 py-2">
                        <CellInput value={r.mid} onChange={(v) => updateRow(i, "mid", v)} />
                      </td>
                      <td className="px-4 py-2">
                        <CellInput value={r.high} onChange={(v) => updateRow(i, "high", v)} />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-foreground/35 hover:text-[var(--destructive)] transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--orange)] hover:underline"
              >
                <Plus className="w-4 h-4" /> Adicionar assembleia
              </button>
            </div>
          </div>

          {/* Controles */}
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-4 mt-6 items-end">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1.5 block">
                Meu lance a testar (% da carta)
              </label>
              <input
                inputMode="decimal"
                value={myBid}
                onChange={(e) => setMyBid(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg data-num font-semibold focus:outline-none focus:border-[var(--orange)] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Método</label>
              <div className="flex gap-2">
                {(["media", "mediana"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      method === m
                        ? "border-[var(--orange)] text-[var(--orange)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)]"
                        : "border-border text-foreground/60"
                    }`}
                  >
                    {m === "media" ? "Média" : "Mediana"}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={runAudit}
              disabled={calc.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
            >
              {calc.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analisando…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Analisar zona
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTADO */}
        <div id="resultado" className="scroll-mt-24">
          {!result && !calc.isPending && (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
              <LineChartIcon className="w-10 h-10 text-foreground/30 mx-auto mb-4" />
              <p className="font-semibold text-lg">Sua zona de contemplação aparece aqui</p>
              <p className="text-sm text-foreground/55 mt-1 max-w-sm mx-auto">
                Preencha o histórico, informe seu lance e clique em analisar.
              </p>
            </div>
          )}

          {calc.isPending && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Loader2 className="w-10 h-10 text-[var(--orange)] mx-auto mb-4 animate-spin" />
              <p className="text-foreground/60">Processando o histórico no servidor…</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              {result.warnings.length > 0 && (
                <div className="rounded-xl border border-[color-mix(in_oklch,var(--orange)_35%,transparent)] bg-[color-mix(in_oklch,var(--orange)_10%,transparent)] p-4 space-y-1.5">
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-foreground/75">{w}</p>
                  ))}
                </div>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Piso histórico" value={formatPct(result.low)} hint="Menor lance vencedor" />
                <KpiCard label="Referência central" value={formatPct(result.mid)} hint="Lance médio" tone="orange" />
                <KpiCard label="Teto histórico" value={formatPct(result.high)} hint="Maior lance vencedor" />
                <KpiCard label="Meu lance" value={formatPct(result.myBid)} hint={result.zoneTitle} highlight />
              </div>

              {/* Barra de posição na zona */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="eyebrow text-foreground/50 mb-4">Posição do seu lance na zona</p>
                <div className="relative h-10 rounded-full bg-gradient-to-r from-[var(--destructive)]/30 via-[var(--positive)]/30 to-[var(--destructive)]/30 overflow-visible">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700"
                    style={{ left: `${result.position}%`, transitionTimingFunction: "var(--ease-out)" }}
                  >
                    <div className="w-1 h-12 bg-[var(--ink)] rounded-full" />
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold data-num bg-[var(--ink)] text-white px-2 py-0.5 rounded-full">
                      {formatPct(result.myBid)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-foreground/45 mt-2 data-num">
                  <span>Piso {formatPct(result.low)}</span>
                  <span>Ref. {formatPct(result.mid)}</span>
                  <span>Teto {formatPct(result.high)}</span>
                </div>
              </div>

              {/* Diagnóstico */}
              <DiagnosticCard
                verdict={mapVerdict(result.verdict)}
                headline={result.zoneTitle}
                narrative={<p>{result.decisionText}</p>}
              />

              {/* O que significa */}
              <MeaningBlock label="Zona de Contemplação">
                <p>
                  Com base no histórico, os lances vencedores variam de{" "}
                  <strong>{formatPct(result.low)}</strong> (piso) a{" "}
                  <strong>{formatPct(result.high)}</strong> (teto), com
                  referência central em <strong>{formatPct(result.mid)}</strong>.
                  Seu lance de <strong>{formatPct(result.myBid)}</strong> está{" "}
                  {result.distanceToRef >= 0 ? "acima" : "abaixo"} da referência
                  central, o que o posiciona na <strong>{result.zoneTitle.toLowerCase()}</strong>.
                </p>
                <p>
                  Lembre-se: histórico não é garantia. A zona indica a faixa
                  provável, mas cada assembleia tem sua própria disputa.
                </p>
              </MeaningBlock>

              <PointsList positives={result.positives} attentions={result.attentions} />

              {/* PDF */}
              <div className="flex flex-wrap items-center gap-3">
                <PdfButton onClick={() => toast.info("Geração de PDF de Auditoria em implementação.")} />
                <span className="inline-flex items-center gap-1.5 text-xs text-foreground/45">
                  <ShieldCheck className="w-3.5 h-3.5" /> Relatório de Auditoria Independente
                </span>
              </div>

              {/* Avançado: gráfico + memória */}
              <Collapsible
                title="Evolução histórica e memória de cálculo"
                subtitle="Série temporal dos lances e racional auditável"
                open={advancedOpen}
                onToggle={() => setAdvancedOpen((o) => !o)}
              >
                <div className="space-y-8 pt-2">
                  {result.chartSeries.length > 1 && (
                    <div className="h-72 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.chartSeries} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--border)" />
                          <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" unit="%" />
                          <RechartsTooltip formatter={(v: number) => `${v}%`} />
                          <Legend />
                          <ReferenceLine y={result.myBid} stroke="var(--ink)" strokeDasharray="4 4" label={{ value: "Meu lance", fontSize: 10, position: "insideTopRight" }} />
                          <Line type="monotone" dataKey="low" name="Menor" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="mid" name="Médio" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="high" name="Maior" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <CalcMemory rows={result.audit.map((a) => ({ label: a.item, value: a.valor, formula: a.racional }))} />
                </div>
              </Collapsible>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* VÍDEO + CONSULTORIA + METODOLOGIA */}
      <section className="container pb-16 space-y-6">
        <VideoBlock title="Como ler a zona de contemplação" />
        <ConsultCTA context="a leitura da sua zona de contemplação" />
        <MethodologyBlock
          sources={[
            "Histórico de lances vencedores informado pelo próprio usuário",
            "Estatística descritiva (média/mediana) e análise de tendência por janelas móveis",
            "Cálculos executados no servidor e reproduzíveis pela memória de cálculo",
          ]}
        >
          <p>
            A zona de contemplação é estimada a partir da distribuição histórica
            dos lances vencedores. A leitura da tendência compara as três
            assembleias mais recentes com as três anteriores. Compare sempre
            dados da mesma modalidade de lance.
          </p>
        </MethodologyBlock>
      </section>
    </div>
  );
}

function CellInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 data-num text-sm focus:outline-none focus:border-[var(--orange)] transition-colors"
    />
  );
}
