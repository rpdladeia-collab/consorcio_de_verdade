import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft,
  Search,
  Loader2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import {
  AuditSeal,
  SectionTitle,
  KpiCard,
  DiagnosticCard,
  BeforeAfterBar,
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

/* Mapeia o veredito do backend para o tom visual */
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

export default function SimuladorLanceEmbutido() {
  // Modo simples
  const [credit, setCredit] = useState<string>("500000");
  const [embeddedPct, setEmbeddedPct] = useState<string>("30");

  // Modo avançado
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [adminRate, setAdminRate] = useState<string>("25");
  const [reserveRate, setReserveRate] = useState<string>("0");
  const [term, setTerm] = useState<string>("180");
  const [lanceBase, setLanceBase] = useState<"carta" | "category">("carta");
  const [embeddedLimitPct, setEmbeddedLimitPct] = useState<string>("30");
  const [ownBid, setOwnBid] = useState<string>("0");
  const [targetPrice, setTargetPrice] = useState<string>("0");

  const calc = trpc.simuladores.lanceEmbutido.useMutation({
    onError: (err) => toast.error(err.message || "Não foi possível calcular."),
  });

  const result = calc.data;

  function runAudit() {
    const creditNum = parseFloat(credit.replace(/\./g, "").replace(",", "."));
    const embeddedNum = parseFloat(embeddedPct.replace(",", "."));
    if (!creditNum || creditNum <= 0) {
      toast.error("Informe um valor de carta válido.");
      return;
    }
    calc.mutate({
      credit: creditNum,
      embeddedPct: isNaN(embeddedNum) ? 0 : embeddedNum,
      adminRate: parseFloat(adminRate.replace(",", ".")) || 0,
      reserveRate: parseFloat(reserveRate.replace(",", ".")) || 0,
      term: parseInt(term) || 180,
      lanceBase,
      embeddedLimitPct: parseFloat(embeddedLimitPct.replace(",", ".")) || 30,
      ownBid: parseFloat(ownBid.replace(/\./g, "").replace(",", ".")) || 0,
      targetPrice: parseFloat(targetPrice.replace(/\./g, "").replace(",", ".")) || 0,
    });
    setTimeout(() => {
      document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  return (
    <div className="min-h-screen">
      {/* HERO — pergunta central */}
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
            <p className="eyebrow text-[var(--orange)] mb-3">Lances · Análise independente</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">
              Lance embutido: vale a pena no seu caso?
            </h1>
            <p className="text-lg text-white/65 mt-5 leading-relaxed">
              O lance embutido aumenta sua força de contemplação, mas reduz o
              crédito que você realmente recebe. Esta auditoria mostra, em
              números, quanto você ganha em ranking e quanto custa em crédito
              útil e taxa efetiva.
            </p>
          </div>
        </div>
      </section>

      {/* SIMULADOR SIMPLES */}
      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
          {/* Formulário */}
          <div className="lg:sticky lg:top-24">
            <SectionTitle
              eyebrow="Diagnóstico rápido"
              title="Informe dois dados e audite"
              desc="Comece pelo essencial. Para cenários completos, abra o modo avançado depois."
            />
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1.5 block">
                  Carta de crédito contratada (R$)
                </label>
                <input
                  inputMode="numeric"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg data-num font-semibold focus:outline-none focus:border-[var(--orange)] transition-colors"
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1.5 block">
                  Percentual de lance embutido (%)
                </label>
                <input
                  inputMode="decimal"
                  value={embeddedPct}
                  onChange={(e) => setEmbeddedPct(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg data-num font-semibold focus:outline-none focus:border-[var(--orange)] transition-colors"
                  placeholder="30"
                />
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={1}
                  value={parseFloat(embeddedPct) || 0}
                  onChange={(e) => setEmbeddedPct(e.target.value)}
                  className="w-full mt-3 accent-[var(--orange)]"
                />
              </div>
              <button
                onClick={runAudit}
                disabled={calc.isPending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
              >
                {calc.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Auditando…
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Auditar lance embutido
                  </>
                )}
              </button>

              {/* Modo avançado recolhido */}
              <Collapsible
                title="Modo avançado"
                subtitle="Taxa de administração, base de lance, capital próprio, limite e preço-alvo"
                open={advancedOpen}
                onToggle={() => setAdvancedOpen((o) => !o)}
              >
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <Field label="Taxa de administração (%)" value={adminRate} onChange={setAdminRate} />
                  <Field label="Fundo de reserva (%)" value={reserveRate} onChange={setReserveRate} />
                  <Field label="Prazo (meses)" value={term} onChange={setTerm} />
                  <Field label="Limite do embutido (% da carta)" value={embeddedLimitPct} onChange={setEmbeddedLimitPct} />
                  <Field label="Capital próprio / FGTS (R$)" value={ownBid} onChange={setOwnBid} />
                  <Field label="Preço-alvo do bem (R$)" value={targetPrice} onChange={setTargetPrice} />
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground/70 mb-1.5 block">
                      Base de aplicação do lance
                    </label>
                    <div className="flex gap-2">
                      {(["carta", "category"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setLanceBase(m)}
                          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                            lanceBase === m
                              ? "border-[var(--orange)] text-[var(--orange)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)]"
                              : "border-border text-foreground/60"
                          }`}
                        >
                          {m === "carta" ? "Sobre a carta" : "Sobre a categoria"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>
          </div>

          {/* Resultado */}
          <div id="resultado" className="scroll-mt-24">
            {!result && !calc.isPending && (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center">
                <TrendingUp className="w-10 h-10 text-foreground/30 mx-auto mb-4" />
                <p className="font-semibold text-lg">Sua auditoria aparece aqui</p>
                <p className="text-sm text-foreground/55 mt-1 max-w-sm mx-auto">
                  Preencha a carta e o percentual de lance embutido e clique em
                  auditar para ver o resultado interpretado.
                </p>
              </div>
            )}

            {calc.isPending && (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <Loader2 className="w-10 h-10 text-[var(--orange)] mx-auto mb-4 animate-spin" />
                <p className="text-foreground/60">Processando a auditoria no servidor…</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                {/* Avisos */}
                {result.warnings.length > 0 && (
                  <div className="rounded-xl border border-[color-mix(in_oklch,var(--orange)_35%,transparent)] bg-[color-mix(in_oklch,var(--orange)_10%,transparent)] p-4 space-y-1.5">
                    {result.warnings.map((w, i) => (
                      <p key={i} className="text-sm text-foreground/75">{w}</p>
                    ))}
                  </div>
                )}

                {/* KPIs principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <KpiCard label="Crédito líquido disponível" value={formatBRL(result.liquidCredit)} hint="O que você realmente recebe" highlight />
                  <KpiCard label="Lance embutido efetivo" value={formatBRL(result.embeddedValue)} hint={`${formatPct(result.inputs.embeddedPct)} da base`} tone="orange" />
                  <KpiCard label="Crédito preservado" value={formatPct(result.creditPreserved)} hint={result.credLabel} tone={result.creditPreserved >= 80 ? "positive" : "negative"} />
                  <KpiCard label="Taxa efetiva s/ crédito líquido" value={result.effAdminRate !== null ? formatPct(result.effAdminRate) : "—"} hint={`Nominal: ${formatPct(result.inputs.adminRate)}`} tone={result.effClass === "green" ? "positive" : result.effClass === "red" ? "negative" : "orange"} />
                </div>

                {/* Barras antes/depois */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <p className="eyebrow text-foreground/50">Carta contratada vs. crédito útil</p>
                  <BeforeAfterBar label="Carta contratada" total={result.credit} value={result.credit} />
                  <BeforeAfterBar label="Crédito líquido (após embutido)" total={result.credit} value={result.liquidCredit} caption={`Você abre mão de ${formatBRL(result.embeddedValue)} de crédito útil para ganhar força de contemplação.`} />
                  {result.financedCapital !== result.liquidCredit && (
                    <BeforeAfterBar label="Capital financiado pelo grupo" total={result.credit} value={result.financedCapital} caption="Crédito líquido menos seu capital próprio aportado." />
                  )}
                </div>

                {/* Diagnóstico executivo narrativo */}
                <DiagnosticCard
                  verdict={mapVerdict(result.verdict)}
                  headline={
                    result.verdict === "positivo"
                      ? "Operação em zona controlada"
                      : result.verdict === "critico"
                      ? "Operação exige reavaliação"
                      : "Vale a pena, mas com atenção"
                  }
                  narrative={<p>{result.decisionText}</p>}
                />

                {/* O que isso significa */}
                <MeaningBlock label="Lance Embutido">
                  <p>
                    O lance embutido aumenta sua força para contemplar, mas sai da sua própria carta.
                  </p>
                  <p>
                    Aqui, ele reduz em{" "}
                    <strong>{formatBRL(result.embeddedValue)}</strong> o crédito disponível para compra.
                    Ou seja: você melhora o lance, mas fica com menos dinheiro líquido para usar —
                    e isso pode deixar a operação menos eficiente em custo.
                  </p>
                  <p>
                    A tabela mostra as parcelas restantes após o lance, considerando as correções futuras do índice.
                  </p>
                </MeaningBlock>

                {/* Pontos positivos e de atenção */}
                <PointsList
                  positives={[
                    `Aumenta a força de contemplação para ${formatPct(result.rankingPctCredit)} da carta`,
                    "Permite ofertar lance sem desembolsar todo o valor em dinheiro",
                    result.inputs.ownBid > 0
                      ? `Seu capital próprio de ${formatBRL(result.inputs.ownBid)} preserva crédito útil`
                      : "Não exige, necessariamente, capital próprio para ofertar lance",
                  ]}
                  attentions={[
                    `Reduz o crédito disponível em ${formatBRL(result.embeddedValue)}`,
                    result.effAdminRate !== null
                      ? `Taxa efetiva sobe para ${formatPct(result.effAdminRate)} sobre o crédito que você de fato usa`
                      : "Sem crédito líquido, a taxa perde base de cálculo",
                    result.complementNeeded > 0
                      ? `Faltam ${formatBRL(result.complementNeeded)} para atingir o preço-alvo informado`
                      : "Você paga taxa de administração sobre a carta cheia, não sobre o crédito líquido",
                  ]}
                />

                {/* PDF + vídeo */}
                <div className="flex flex-wrap items-center gap-3">
                  <PdfButton onClick={() => toast.info("Geração de PDF de Auditoria em implementação.")} />
                  <span className="inline-flex items-center gap-1.5 text-xs text-foreground/45">
                    <ShieldCheck className="w-3.5 h-3.5" /> Relatório de Auditoria Independente
                  </span>
                </div>

                {/* Modo avançado: comparação, sensibilidade e memória */}
                <Collapsible
                  title="Análise avançada e memória de cálculo"
                  subtitle="Comparação de cenários, tabela de sensibilidade e racional auditável"
                  open={true}
                  onToggle={() => {}}
                >
                  <div className="space-y-8 pt-2">
                    {/* Comparação de cenários */}
                    <div>
                      <p className="eyebrow text-foreground/50 mb-3">Comparação de cenários</p>
                      <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="text-left text-foreground/50 text-xs uppercase tracking-wide">
                              <th className="py-2 pr-3 font-medium">Cenário</th>
                              <th className="py-2 px-3 font-medium text-right">Crédito líquido</th>
                              <th className="py-2 px-3 font-medium text-right">Cap. financiado</th>
                              <th className="py-2 px-3 font-medium text-right">Taxa s/ líquido</th>
                              <th className="py-2 pl-3 font-medium text-right">Taxa s/ financiado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {result.comparison.map((row, i) => (
                              <tr key={i} className={row.tone === "highlight" ? "bg-[color-mix(in_oklch,var(--orange)_6%,transparent)]" : ""}>
                                <td className="py-3 pr-3 font-medium">{row.cenario}</td>
                                <td className="py-3 px-3 text-right data-num">{formatBRL(row.creditoLiquido)}</td>
                                <td className="py-3 px-3 text-right data-num">{formatBRL(row.capitalFinanciado)}</td>
                                <td className="py-3 px-3 text-right data-num">{row.taxaSobreCreditoLiquido !== null ? formatPct(row.taxaSobreCreditoLiquido) : "—"}</td>
                                <td className="py-3 pl-3 text-right data-num">{row.taxaSobreCapitalFinanciado !== null ? formatPct(row.taxaSobreCapitalFinanciado) : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sensibilidade */}
                    <div>
                      <p className="eyebrow text-foreground/50 mb-3">Sensibilidade ao percentual de lance</p>
                      <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="text-left text-foreground/50 text-xs uppercase tracking-wide">
                              <th className="py-2 pr-3 font-medium">% Lance</th>
                              <th className="py-2 px-3 font-medium text-right">Crédito líquido</th>
                              <th className="py-2 px-3 font-medium text-right">Taxa s/ financiado</th>
                              <th className="py-2 pl-3 font-medium text-right">Leitura</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {result.sensitivity.map((row, i) => (
                              <tr key={i} className={Math.abs(row.percentualEmbutido - result.inputs.embeddedPct) < 5 ? "bg-[color-mix(in_oklch,var(--orange)_6%,transparent)]" : ""}>
                                <td className="py-2.5 pr-3 data-num font-medium">{formatPct(row.percentualEmbutido, 0)}</td>
                                <td className="py-2.5 px-3 text-right data-num">{formatBRL(row.creditoLiquido)}</td>
                                <td className="py-2.5 px-3 text-right data-num">{row.taxaSobreCapitalFinanciado !== null ? formatPct(row.taxaSobreCapitalFinanciado) : "—"}</td>
                                <td className={`py-2.5 pl-3 text-right font-medium ${toneClass[row.tone]}`}>{row.classificacao}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Memória de cálculo */}
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
        <VideoBlock title="Lance embutido na prática" />
        <ConsultCTA context="esta análise de lance embutido" />
        <MethodologyBlock
          sources={[
            "Resolução CMN/BCB sobre administração de consórcios",
            "Metodologia própria de taxa efetiva sobre crédito líquido e capital financiado",
            "Cálculos auditáveis e reproduzíveis a partir dos dados informados",
          ]}
        >
          <p>
            A auditoria compara a taxa de administração nominal com a taxa
            efetiva medida sobre o crédito que você realmente utiliza e sobre o
            capital de fato financiado pelo grupo. Todos os cálculos são
            executados no servidor e podem ser reproduzidos a partir da memória
            de cálculo acima.
          </p>
        </MethodologyBlock>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/70 mb-1.5 block">{label}</label>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 data-num focus:outline-none focus:border-[var(--orange)] transition-colors"
      />
    </div>
  );
}
