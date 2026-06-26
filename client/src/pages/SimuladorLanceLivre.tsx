import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Search, Loader2, Gauge, ShieldCheck } from "lucide-react";
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
  formatBRL,
  formatPct,
  type Verdict,
} from "@/components/cdv/SimuladorUI";

function mapVerdict(v: "positivo" | "atencao" | "critico"): Verdict {
  if (v === "positivo") return "positive";
  if (v === "critico") return "negative";
  return "neutral";
}
const toneClass: Record<string, string> = {
  good: "text-[var(--positive)]",
  highlight: "text-[var(--orange)]",
  danger: "text-[var(--destructive)]",
  neutral: "text-foreground/70",
};

export default function SimuladorLanceLivre() {
  const [credit, setCredit] = useState("400000");
  const [bidPct, setBidPct] = useState("45");
  const [referenceBidPct, setReferenceBidPct] = useState("45");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [adminRate, setAdminRate] = useState("20");
  const [term, setTerm] = useState("180");
  const [paidInstallments, setPaidInstallments] = useState("12");
  const [lanceUse, setLanceUse] = useState<"abater_parcela" | "reduzir_prazo">("abater_parcela");

  const calc = trpc.simuladores.lanceLivre.useMutation({
    onError: (err) => toast.error(err.message || "Não foi possível calcular."),
  });
  const result = calc.data;

  function n(v: string) {
    return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
  }

  function runAudit() {
    const creditNum = n(credit);
    if (creditNum <= 0) {
      toast.error("Informe um valor de carta válido.");
      return;
    }
    calc.mutate({
      credit: creditNum,
      bidPct: parseFloat(bidPct.replace(",", ".")) || 0,
      referenceBidPct: parseFloat(referenceBidPct.replace(",", ".")) || 45,
      adminRate: parseFloat(adminRate.replace(",", ".")) || 0,
      term: parseInt(term) || 180,
      paidInstallments: parseInt(paidInstallments) || 0,
      lanceUse,
    });
    setTimeout(() => {
      document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  return (
    <div className="min-h-screen">
      <section className="dark bg-[var(--ink)] text-[var(--paper)]">
        <div className="container py-12 md:py-16">
          <Link to="/simuladores" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Central de Simuladores
          </Link>
          <div className="max-w-3xl">
            <AuditSeal className="mb-5" />
            <p className="eyebrow text-[var(--orange)] mb-3">Lances · Análise independente</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">
              Quanto de lance livre você precisa para competir?
            </h1>
            <p className="text-lg text-white/65 mt-5 leading-relaxed">
              O lance livre usa recurso próprio para antecipar a contemplação.
              Veja quanto você desembolsa, o quão competitivo é frente ao histórico
              e o efeito do lance sobre suas parcelas ou prazo.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <SectionTitle eyebrow="Diagnóstico rápido" title="Informe os dados do lance" desc="Comece pelo essencial e abra o modo avançado para o efeito no fluxo." />
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <Field label="Carta de crédito (R$)" value={credit} onChange={setCredit} big />
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Lance livre ofertado (% da carta)</label>
                <input inputMode="decimal" value={bidPct} onChange={(e) => setBidPct(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg data-num font-semibold focus:outline-none focus:border-[var(--orange)] transition-colors" />
                <input type="range" min={0} max={80} step={1} value={parseFloat(bidPct) || 0} onChange={(e) => setBidPct(e.target.value)} className="w-full mt-3 accent-[var(--orange)]" />
              </div>
              <Field label="Lance médio histórico de referência (%)" value={referenceBidPct} onChange={setReferenceBidPct} />
              <button onClick={runAudit} disabled={calc.isPending} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60">
                {calc.isPending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Analisando…</>) : (<><Search className="w-4 h-4" /> Analisar lance livre</>)}
              </button>
              <Collapsible title="Modo avançado" subtitle="Taxa, prazo, parcelas pagas e destino do lance" open={advancedOpen} onToggle={() => setAdvancedOpen((o) => !o)}>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <Field label="Taxa de administração (%)" value={adminRate} onChange={setAdminRate} />
                  <Field label="Prazo (meses)" value={term} onChange={setTerm} />
                  <Field label="Parcelas já pagas" value={paidInstallments} onChange={setPaidInstallments} />
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Destino do lance ao contemplar</label>
                    <div className="flex gap-2">
                      {(["abater_parcela", "reduzir_prazo"] as const).map((m) => (
                        <button key={m} onClick={() => setLanceUse(m)} className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${lanceUse === m ? "border-[var(--orange)] text-[var(--orange)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)]" : "border-border text-foreground/60"}`}>
                          {m === "abater_parcela" ? "Abater parcela" : "Reduzir prazo"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>
          </div>

          <div id="resultado" className="scroll-mt-24">
            {!result && !calc.isPending && (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
                <Gauge className="w-10 h-10 text-foreground/30 mx-auto mb-4" />
                <p className="font-semibold text-lg">Sua análise aparece aqui</p>
                <p className="text-sm text-foreground/55 mt-1 max-w-sm mx-auto">Preencha os dados e clique em analisar.</p>
              </div>
            )}
            {calc.isPending && (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <Loader2 className="w-10 h-10 text-[var(--orange)] mx-auto mb-4 animate-spin" />
                <p className="text-foreground/60">Processando no servidor…</p>
              </div>
            )}
            {result && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                {result.warnings.length > 0 && (
                  <div className="rounded-xl border border-[color-mix(in_oklch,var(--orange)_35%,transparent)] bg-[color-mix(in_oklch,var(--orange)_10%,transparent)] p-4 space-y-1.5">
                    {result.warnings.map((w, i) => (<p key={i} className="text-sm text-foreground/75">{w}</p>))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <KpiCard label="Desembolso do lance" value={formatBRL(result.bidValue)} hint={`${formatPct(result.inputs.bidPct)} da carta`} highlight />
                  <KpiCard label="Competitividade" value={formatPct(result.competitiveness)} hint={result.competLabel} tone={result.competTone === "good" ? "positive" : result.competTone === "danger" ? "negative" : "orange"} />
                  {result.inputs.lanceUse === "abater_parcela" ? (
                    <>
                      <KpiCard label="Nova parcela" value={formatBRL(result.newInstallment ?? 0)} hint={`Antes: ${formatBRL(result.installmentBase)}`} tone="positive" />
                      <KpiCard label="Redução por parcela" value={formatBRL(result.installmentReduction ?? 0)} hint="Após contemplação" />
                    </>
                  ) : (
                    <>
                      <KpiCard label="Parcelas reduzidas" value={`${result.monthsReduced ?? 0}`} hint={`Novo prazo: ${result.newTerm} meses`} tone="positive" />
                      <KpiCard label="Saldo devedor estimado" value={formatBRL(result.remainingDebt)} hint="Após o lance" />
                    </>
                  )}
                </div>

                <DiagnosticCard
                  verdict={mapVerdict(result.verdict)}
                  headline={result.competLabel}
                  narrative={<p>{result.decisionText}</p>}
                />

                <MeaningBlock>
                  <p>
                    Para uma carta de <strong>{formatBRL(result.inputs.credit)}</strong>, um lance livre de{" "}
                    <strong>{formatPct(result.inputs.bidPct)}</strong> exige{" "}
                    <strong>{formatBRL(result.bidValue)}</strong> em recurso próprio. Frente à referência de{" "}
                    <strong>{formatPct(result.inputs.referenceBidPct)}</strong>, isso representa uma competitividade de{" "}
                    <strong>{formatPct(result.competitiveness)}</strong>.
                  </p>
                  <p>
                    Diferente do lance embutido, o lance livre não reduz o crédito que você recebe — mas exige dinheiro à vista no momento da oferta.
                  </p>
                </MeaningBlock>

                <PointsList positives={result.positives} attentions={result.attentions} />

                <div className="flex flex-wrap items-center gap-3">
                  <PdfButton onClick={() => toast.info("Geração de PDF de Auditoria em implementação.")} />
                  <span className="inline-flex items-center gap-1.5 text-xs text-foreground/45">
                    <ShieldCheck className="w-3.5 h-3.5" /> Relatório de Auditoria Independente
                  </span>
                </div>

                <Collapsible title="Sensibilidade e memória de cálculo" subtitle="Como diferentes lances se comparam à referência" open={true} onToggle={() => {}}>
                  <div className="space-y-8 pt-2">
                    <div className="overflow-x-auto -mx-2 px-2">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="text-left text-foreground/50 text-xs uppercase tracking-wide">
                            <th className="py-2 pr-3 font-medium">% Lance</th>
                            <th className="py-2 px-3 font-medium text-right">Desembolso</th>
                            <th className="py-2 px-3 font-medium text-right">Competitividade</th>
                            <th className="py-2 pl-3 font-medium text-right">Leitura</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.sensitivity.map((row, i) => (
                            <tr key={i} className={Math.abs(row.bidPct - result.inputs.bidPct) < 5 ? "bg-[color-mix(in_oklch,var(--orange)_6%,transparent)]" : ""}>
                              <td className="py-2.5 pr-3 data-num font-medium">{formatPct(row.bidPct, 0)}</td>
                              <td className="py-2.5 px-3 text-right data-num">{formatBRL(row.bidValue)}</td>
                              <td className="py-2.5 px-3 text-right data-num">{formatPct(row.competitiveness)}</td>
                              <td className={`py-2.5 pl-3 text-right font-medium ${toneClass[row.tone]}`}>{row.classificacao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <CalcMemory rows={result.audit.map((a) => ({ label: a.item, value: a.valor, formula: a.racional }))} />
                  </div>
                </Collapsible>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container pb-16 space-y-6">
        <VideoBlock title="Lance livre: quanto ofertar?" />
        <ConsultCTA context="a sua estratégia de lance livre" />
        <MethodologyBlock
          sources={[
            "Mecânica de lance livre conforme contrato e regulação de consórcios",
            "Comparação com referência histórica informada pelo usuário",
            "Cálculos executados no servidor e reproduzíveis pela memória de cálculo",
          ]}
        >
          <p>
            A competitividade é medida pela razão entre o seu lance e uma referência histórica. O efeito no fluxo é estimado a partir do saldo devedor projetado, sem considerar correções futuras do indexador.
          </p>
        </MethodologyBlock>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, big }: { label: string; value: string; onChange: (v: string) => void; big?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/70 mb-1.5 block">{label}</label>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-xl border border-border bg-background px-4 ${big ? "py-3 text-lg font-semibold" : "py-2.5"} data-num focus:outline-none focus:border-[var(--orange)] transition-colors`} />
    </div>
  );
}
