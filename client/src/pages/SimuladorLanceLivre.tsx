import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Search, Loader2, ShieldCheck } from "lucide-react";
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
  formatBRL,
  formatPct,
  type Verdict,
} from "@/components/cdv/SimuladorUI";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

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
      <section className="bg-[#0A0A08] text-white pt-8 pb-16 w-full px-4 md:px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/simuladores"
            className="inline-flex items-center gap-2 text-[#FF4E1F] font-['IBM_Plex_Mono'] text-[14px] md:text-[15px] font-semibold uppercase tracking-widest hover:text-[#FFC93C] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="max-w-3xl">
            <h1 className="font-['Archivo_Black'] text-2xl md:text-3xl lg:text-4xl mb-4 leading-tight text-white uppercase">
              Quanto de lance livre você precisa para competir?
            </h1>
            <p className="text-[#C9C4B8] text-[14px] md:text-[15px] md:text-base max-w-3xl leading-relaxed">
              O lance livre usa recurso próprio para antecipar a contemplação.
              Veja quanto você desembolsa, o quão competitivo é frente ao histórico
              e o efeito do lance sobre suas parcelas ou prazo.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-start">
          <div className="lg:sticky lg:top-20 px-2 sm:px-0">
            <SectionTitle eyebrow="Diagnóstico rápido" title="Informe os dados do lance" desc="Comece pelo essencial e abra o modo avançado para o efeito no fluxo." />
            <div className="rounded-xl border border-border bg-card p-2 sm:p-3 space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                <div className="flex flex-col h-full">
                  <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Carta (R$)</label>
                  <div className="mt-auto">
                    <input type="text" inputMode="decimal" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={credit} onChange={(e) => setCredit(e.target.value)} />
                    <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Valor nominal</p>
                  </div>
                </div>
                <div className="flex flex-col h-full">
                  <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Lance (%)</label>
                  <div className="mt-auto">
                    <input type="text" inputMode="decimal" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={bidPct} onChange={(e) => setBidPct(e.target.value)} />
                    <input type="range" min={0} max={80} step={1} value={parseFloat(bidPct) || 0} onChange={(e) => setBidPct(e.target.value)} className="w-full mt-1 h-1 accent-[var(--orange)]" />
                  </div>
                </div>
                <div className="flex flex-col h-full">
                  <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Ref. Hist.</label>
                  <div className="mt-auto">
                    <input type="text" inputMode="decimal" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={referenceBidPct} onChange={(e) => setReferenceBidPct(e.target.value)} />
                    <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Lance médio (%)</p>
                  </div>
                </div>
              </div>

              <button onClick={runAudit} disabled={calc.isPending} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-4 py-2 text-[13px] md:text-[14px] font-bold uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 shadow-md">
                {calc.isPending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Analisando…</>) : (<><Search className="w-4 h-4" /> Analisar lance livre</>)}
              </button>

              <div className="border-t border-[#DDD6C8] pt-1.5">
                <p className="font-bold text-[13px] md:text-[14px] text-gray-800 uppercase tracking-wider mb-1">Modo avançado</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  <div className="flex flex-col h-full">
                    <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Taxa Adm (%)</label>
                    <div className="mt-auto">
                      <input type="text" inputMode="decimal" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={adminRate} onChange={(e) => setAdminRate(e.target.value)} />
                      <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Taxa de administração</p>
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Prazo (meses)</label>
                    <div className="mt-auto">
                      <input type="text" inputMode="decimal" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={term} onChange={(e) => setTerm(e.target.value)} />
                      <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total do plano</p>
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Pagas</label>
                    <div className="mt-auto">
                      <input type="text" inputMode="decimal" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} />
                      <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Parcelas</p>
                    </div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <label className="text-[12px] md:text-[13px] font-bold text-gray-800 mb-1 block">Destino do lance</label>
                  <div className="flex gap-1">
                    {(["abater_parcela", "reduzir_prazo"] as const).map((m) => (
                      <button key={m} onClick={() => setLanceUse(m)} className={`flex-1 rounded-lg border px-2 py-1.5 text-[12px] md:text-[13px] font-bold transition-colors ${lanceUse === m ? "bg-[var(--orange)] text-white border-transparent" : "bg-background text-foreground/60 border-border"}`}>
                        {m === "abater_parcela" ? "Abater parcela" : "Reduzir prazo"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="resultado" className="scroll-mt-24">
            {!result && !calc.isPending && <WaitingAnalysisScreen />}
            {calc.isPending && (
              <div className="rounded-xl border border-border bg-card p-3 sm:p-6 text-center">
                <Loader2 className="w-8 h-8 text-[var(--orange)] mx-auto mb-3 animate-spin" />
                <p className="text-foreground/60 text-[14px] md:text-[15px] sm:text-[14px] md:text-[15px]">Processando no servidor…</p>
              </div>
            )}
            {result && (
              <div className="space-y-4 animate-[fadeIn_0.4s_ease-out] px-2 sm:px-0">
                {result.warnings.length > 0 && (
                  <div className="rounded-lg border border-[color-mix(in_oklch,var(--orange)_35%,transparent)] bg-[color-mix(in_oklch,var(--orange)_10%,transparent)] p-2 sm:p-3 space-y-1">
                    {result.warnings.map((w, i) => (<p key={i} className="text-[10px] sm:text-[14px] md:text-[15px] text-foreground/75">{w}</p>))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  narrative={<p className="text-[10px] sm:text-[14px] md:text-[15px]">{result.decisionText}</p>}
                />

                <MeaningBlock label="Lance Livre">
                  <p className="text-[10px] sm:text-[14px] md:text-[15px]">
                    Para uma carta de <strong>{formatBRL(result.inputs.credit)}</strong>, um lance livre de{" "}
                    <strong>{formatPct(result.inputs.bidPct)}</strong> exige{" "}
                    <strong>{formatBRL(result.bidValue)}</strong> em recurso próprio. Frente à referência de{" "}
                    <strong>{formatPct(result.inputs.referenceBidPct)}</strong>, isso representa uma competitividade de{" "}
                    <strong>{formatPct(result.competitiveness)}</strong>.
                  </p>
                  <p className="text-[10px] sm:text-[14px] md:text-[15px]">
                    Diferente do lance embutido, o lance livre não reduz o crédito que você recebe — mas exige dinheiro à vista no momento da oferta.
                  </p>
                </MeaningBlock>

                <PointsList positives={result.positives} attentions={result.attentions} />

                <div className="flex flex-wrap items-center gap-2">
                  <PdfButton onClick={() => toast.info("Geração de PDF de Auditoria em implementação.")} />
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[14px] md:text-[15px] text-foreground/45">
                    <ShieldCheck className="w-3 h-3" /> Relatório de Auditoria Independente
                  </span>
                </div>

                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-4 bg-card hover:bg-card/80 rounded-lg border border-border">
                    <div>
                      <h3 className="font-semibold text-foreground">Sensibilidade e memória de cálculo</h3>
                      <p className="text-sm text-foreground/60">Como diferentes lances se comparam à referência</p>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-[8px] sm:text-[14px] md:text-[15px] border-collapse min-w-[400px]">
                        <thead>
                          <tr className="text-left text-foreground/50 text-[7px] sm:text-[14px] md:text-[15px] uppercase tracking-wide">
                            <th className="py-1.5 pr-2 font-medium">% Lance</th>
                            <th className="py-1.5 px-2 font-medium text-right">Desembolso</th>
                            <th className="py-1.5 px-2 font-medium text-right">Competitividade</th>
                            <th className="py-1.5 pl-2 font-medium text-right">Leitura</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.sensitivity.map((row, i) => (
                            <tr key={i} className={Math.abs(row.bidPct - result.inputs.bidPct) < 5 ? "bg-[color-mix(in_oklch,var(--orange)_6%,transparent)]" : ""}>
                              <td className="py-2 pr-2 data-num font-medium">{formatPct(row.bidPct, 0)}</td>
                              <td className="py-2 px-2 text-right data-num">{formatBRL(row.bidValue)}</td>
                              <td className="py-2 px-2 text-right data-num">{formatPct(row.competitiveness)}</td>
                              <td className={`py-2 pl-2 text-right font-medium ${toneClass[row.tone]}`}>{row.classificacao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <CalcMemory rows={result.audit.map((a) => ({ label: a.item, value: a.valor, formula: a.racional }))} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </div>
      </section>

            <section className="container pb-8 space-y-4 px-2 sm:px-0">
        <VideoBlock title="Lance livre: quanto ofertar?" />
        <ConsultCTA context="a sua estratégia de lance livre" />
        <MethodologyBlock
          sources={[
            "Mecânica de lance livre conforme contrato e regulação de consórcios",
            "Comparação com referência histórica informada pelo usuário",
            "Cálculos executados no servidor e reproduzíveis pela memória de cálculo",
          ]}
        >
                  <p className="text-[10px] sm:text-[14px] md:text-[15px]">
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
      <label className="text-[13px] md:text-[14px] sm:text-[14px] md:text-[15px] font-medium text-foreground/70 mb-1">{label}</label>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-lg border border-border bg-background px-3 ${big ? "py-2 text-base font-semibold" : "py-2"} data-num focus:outline-none focus:border-[var(--orange)] transition-colors`} />
    </div>
  );
}
