import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Search, Loader2, Gauge, ShieldCheck, Calculator, Check, AlertTriangle } from "lucide-react";
import {
  AuditSeal,
  SectionTitle,
  KpiCard,
  DiagnosticCard,
  MeaningBlock,
  PointsList,
  CalcMemory,
  formatBRL,
  formatPct,
  type Verdict,
} from "@/components/cdv/SimuladorUI";

function mapVerdict(v: "positivo" | "atencao" | "critico"): Verdict {
  if (v === "positivo") return "positive";
  if (v === "critico") return "negative";
  return "neutral";
}

export default function SimuladorLanceCartaXCategoria() {
  const [credit, setCredit] = useState("300000");
  const [adminRate, setAdminRate] = useState("25");
  const [bidPct, setBidPct] = useState("30");

  const calc = trpc.simuladores.lanceCartaXCategoria.useMutation({
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
      adminRate: parseFloat(adminRate.replace(",", ".")) || 0,
      bidPct: parseFloat(bidPct.replace(",", ".")) || 0,
    });
    setTimeout(() => {
      document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  return (
    <div className="min-h-screen theme-yellow bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="container py-12 md:py-16">
          <Link to="/simuladores" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Central de Simuladores
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
               <AuditSeal className="bg-foreground/10 text-foreground border-foreground/20" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 px-2 py-0.5 border border-foreground/20 rounded">Simulador #07</span>
            </div>
            <p className="eyebrow text-foreground mb-3">Matemática do Lance · Base de Cálculo</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              Lance sobre Carta <span className="text-foreground/40">vs</span> Categoria
            </h1>
            <p className="text-lg text-foreground/70 mt-5 leading-relaxed">
              O mesmo percentual de lance pode representar valores muito diferentes dependendo da base de cálculo. 
              Entenda a diferença matemática entre ofertar sobre o crédito ou sobre a categoria (crédito + taxas).
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
          {/* Inputs */}
          <div className="lg:sticky lg:top-24">
            <SectionTitle 
              eyebrow="Dados da Simulação" 
              title="Configure o cenário" 
              desc="Informe os valores do seu contrato para comparar o impacto real no lance." 
            />
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <Field label="Valor da carta atualizada (R$)" value={credit} onChange={setCredit} big />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Taxa de adm. (%)" value={adminRate} onChange={setAdminRate} />
                <Field label="Lance ofertado (%)" value={bidPct} onChange={setBidPct} />
              </div>
              
              <button 
                onClick={runAudit} 
                disabled={calc.isPending} 
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-bold transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
              >
                {calc.isPending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Calculando…</>) : (<><Calculator className="w-4 h-4" /> Comparar Bases</>)}
              </button>

              <div className="p-4 rounded-xl bg-foreground/5 border border-border">
                <p className="text-[11px] leading-relaxed text-foreground/60 italic">
                  <strong>Nota técnica:</strong> Este simulador utiliza uma "categoria simplificada" (Carta + Taxa Adm). 
                  Consulte seu regulamento para verificar se há fundo de reserva ou outras taxas na base de cálculo.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div id="resultado" className="scroll-mt-24">
            {!result && !calc.isPending && (
              <div className="rounded-2xl border border-dashed border-border bg-foreground/5 p-10 text-center">
                <Gauge className="w-10 h-10 text-foreground/20 mx-auto mb-4" />
                <p className="font-bold text-lg text-foreground/80">Aguardando dados</p>
                <p className="text-sm text-foreground/50 mt-1 max-w-sm mx-auto">Preencha os campos ao lado e clique em comparar bases.</p>
              </div>
            )}
            
            {calc.isPending && (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-foreground/60 font-mono text-sm uppercase tracking-widest">Processando Inteligência...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <KpiCard label="Carta (Base)" value={formatBRL(result.inputs.credit)} hint="Base simples" />
                  <KpiCard label="Taxa Adm" value={formatBRL(result.adminValue)} hint={`${formatPct(result.inputs.adminRate)} sobre carta`} />
                  <KpiCard label="Categoria" value={formatBRL(result.categoryBase)} hint={`${formatPct(result.categoryBasePct, 1)} da carta`} highlight />
                </div>

                {/* Comparison Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Check className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-positive mb-2">Ideal / Transparente</p>
                    <h3 className="text-lg font-bold mb-1">Lance sobre Carta</h3>
                    <p className="data-num text-2xl font-black text-foreground">{formatBRL(result.lanceOnCredit)}</p>
                    <p className="text-xs text-foreground/50 mt-2 font-mono uppercase tracking-tighter">
                      {formatBRL(result.inputs.credit)} × {formatPct(result.inputs.bidPct)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
                      <AlertTriangle className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Base Majorada</p>
                    <h3 className="text-lg font-bold mb-1">Lance sobre Categoria</h3>
                    <p className="data-num text-2xl font-black text-primary">{formatBRL(result.lanceOnCategory)}</p>
                    <p className="text-xs text-foreground/50 mt-2 font-mono uppercase tracking-tighter">
                      {formatBRL(result.categoryBase)} × {formatPct(result.inputs.bidPct)}
                    </p>
                  </div>
                </div>

                {/* Impact Highlight */}
                <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1">Impacto no Desembolso</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter">{formatBRL(result.diff)}</span>
                    <span className="text-lg font-bold opacity-80">adicionais</span>
                  </div>
                  <p className="text-sm mt-3 leading-relaxed font-medium">
                    Para o mesmo lance de <strong>{formatPct(result.inputs.bidPct)}</strong>, você precisa desembolsar 
                    <strong> {formatPct(result.diffPctVsCreditLance)}</strong> a mais do que se a base fosse apenas a carta.
                  </p>
                </div>

                <DiagnosticCard
                  verdict={mapVerdict(result.verdict)}
                  headline={result.diff === 0 ? "Bases Equivalentes" : "Distorção Matemática Identificada"}
                  narrative={<p>{result.decisionText}</p>}
                />

                <MeaningBlock label="Lance sobre Categoria">
                  <p>
                    Muitas administradoras anunciam o lance como um percentual (ex: 30%). No entanto, se a base for a <strong>categoria</strong>, 
                    esse percentual incide sobre a <strong>Carta + Taxa de Administração</strong>.
                  </p>
                  <p>
                    Na prática, isso significa que um lance de {formatPct(result.inputs.bidPct)} sobre a categoria equivale a 
                    <strong> {formatPct(result.effectiveCategoryPct)}</strong> sobre o valor que você realmente vai receber (a carta). 
                    Isso aumenta o esforço de capital próprio necessário para contemplar.
                  </p>
                </MeaningBlock>

                <PointsList positives={result.positives} attentions={result.attentions} />

                <CalcMemory rows={result.audit.map((a) => ({ label: a.item, value: a.valor, formula: a.racional }))} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Methodology */}
      <section className="container pb-16">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
           <h3 className="text-xl font-bold mb-4">Por que isso importa?</h3>
           <p className="text-foreground/70 max-w-2xl mx-auto leading-relaxed">
             No mercado de consórcios, a transparência na base de cálculo é fundamental. 
             Grupos que utilizam a carta de crédito como base facilitam o planejamento do cliente, 
             enquanto a base categoria pode "esconder" a necessidade de um aporte maior de capital próprio.
           </p>
           <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-mono">
                © 2026 Raio-X do Consórcio · Inteligência Independente
              </p>
              <div className="flex gap-6">
                <Link to="/simuladores" className="text-xs font-bold hover:text-primary transition-colors">Ver outros simuladores</Link>
                <Link to="/" className="text-xs font-bold hover:text-primary transition-colors">Voltar ao início</Link>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, big }: { label: string; value: string; onChange: (v: string) => void; big?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/60 mb-1.5 block">{label}</label>
      <input 
        inputMode="decimal" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className={`w-full rounded-xl border border-border bg-background px-4 ${big ? "py-3 text-lg font-bold" : "py-2.5"} data-num focus:outline-none focus:border-primary transition-colors text-foreground`} 
      />
    </div>
  );
}
