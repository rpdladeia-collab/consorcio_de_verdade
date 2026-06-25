import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { generatePdfSimulePlano } from "@/lib/pdfSimulePlano";
import {
  AuditSeal,
  KpiCard,
  CalcMemory,
  ConsultCTA,
  PdfButton,
  MeaningBlock,
  MethodologyBlock,
  TransparencyBlock,
  formatBRLCents,
  formatBRL,
} from "@/components/cdv/SimuladorUI";

/* ─────────────────────────────────────────────────────────────────────────────
   Tipos locais
───────────────────────────────────────────────────────────────────────────── */
type AdjEvery = "0" | "6" | "12";
type Mode = "linear" | "nonlinear";

interface FormState {
  credit: string;
  term: string;
  adminRate: string;
  reserveRate: string;
  insuranceRate: string;
  adjRate: string;
  adjEvery: AdjEvery;
  mode: Mode;
  ranges: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
function num(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-foreground/45 mt-1">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] pr-10"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tabela de fluxo mensal
───────────────────────────────────────────────────────────────────────────── */
type ScheduleRow = {
  month: number;
  credit: number;
  opening: number;
  fc: number;
  ta: number;
  fr: number;
  insurance: number;
  installment: number;
  paidTotal: number;
  balance: number;
  tags: string[];
};

function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, 24);

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--ink)] text-[var(--paper)]">
              {[
                "Mês",
                "Carta corrigida",
                "Saldo inicial",
                "Fundo comum",
                "Taxa adm.",
                "Fundo reserva",
                "Seguro",
                "Parcela total",
                "Pago acumulado",
                "Saldo final",
                "Eventos",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap text-white/70"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const isAdj = r.tags.includes("Reajuste");
              const isExcess = r.tags.includes("Excesso");
              return (
                <tr
                  key={r.month}
                  className={`border-t border-border transition-colors ${
                    isAdj
                      ? "bg-[color-mix(in_oklch,var(--orange)_8%,transparent)]"
                      : "hover:bg-secondary/40"
                  }`}
                >
                  <td className="px-3 py-2.5 mono text-xs font-medium">{r.month}</td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRL(r.credit)}</td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRL(r.opening)}</td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRLCents(r.fc)}</td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRLCents(r.ta)}</td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRLCents(r.fr)}</td>
                  <td className="px-3 py-2.5 mono text-xs">
                    {r.insurance > 0.005 ? formatBRLCents(r.insurance) : "—"}
                  </td>
                  <td className="px-3 py-2.5 mono text-xs font-bold text-[var(--orange)]">
                    {formatBRLCents(r.installment)}
                  </td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRL(r.paidTotal)}</td>
                  <td className="px-3 py-2.5 mono text-xs">{formatBRL(r.balance)}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {isAdj && (
                      <span className="inline-flex items-center gap-1 text-[var(--orange)] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)]" />
                        Reajuste
                      </span>
                    )}
                    {isExcess && (
                      <span className="inline-flex items-center gap-1 text-[var(--destructive)] font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Excesso
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > 24 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground/60 hover:text-[var(--orange)] border-t border-border transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Recolher tabela
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Ver todos os {rows.length} meses
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Página principal
───────────────────────────────────────────────────────────────────────────── */
export default function SimuladorSimulePlano() {
  const [form, setForm] = useState<FormState>({
    credit: "300000",
    term: "120",
    adminRate: "16",
    reserveRate: "2",
    insuranceRate: "0",
    adjRate: "5",
    adjEvery: "12",
    mode: "linear",
    ranges: "",
  });

  const set = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mutation = trpc.raiox.simulePlano.useMutation({
    onError: (err) => toast.error(err.message || "Erro ao calcular. Tente novamente."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const credit = num(form.credit);
    const term = Math.round(num(form.term));
    const adminRate = num(form.adminRate);
    const reserveRate = num(form.reserveRate);
    const insuranceRate = num(form.insuranceRate);
    const adjRate = num(form.adjRate);

    if (credit <= 0) return toast.error("Informe um valor de carta maior que zero.");
    if (term < 1 || term > 360) return toast.error("Prazo deve estar entre 1 e 360 meses.");
    if (adminRate < 0) return toast.error("Taxa de administração não pode ser negativa.");
    if (reserveRate < 0) return toast.error("Fundo de reserva não pode ser negativo.");

    mutation.mutate({
      credit,
      term,
      adminRate,
      reserveRate,
      insuranceRate,
      adjRate,
      adjEvery: form.adjEvery,
      mode: form.mode,
      ranges: form.ranges,
    });
  }

  const result = mutation.data;

  const first = result?.rows[0]?.installment ?? 0;
  const maxInstallment = result
    ? Math.max(...result.rows.map((r) => r.installment))
    : 0;

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="dark bg-[var(--ink)] text-[var(--paper)] py-12 md:py-16">
        <div className="container-wide px-5 lg:px-8">
          <Link
            href="/simuladores"
            className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Central de Simuladores
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="mono text-[11px] uppercase tracking-widest text-[var(--orange)] mb-2">
                Módulo 1 · Raio-X do Consórcio
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.05]">
                Simule seu plano
              </h1>
              <p className="text-white/60 mt-4 text-lg">
                Gera o fluxo mensal completo do consórcio com parcela linear ou não
                linear, reajustes periódicos e seguro. Cada centavo calculado no
                servidor com a lógica original do Raio-X.
              </p>
            </div>
            <AuditSeal className="shrink-0" />
          </div>
        </div>
      </section>

      {/* ─── CORPO ─── */}
      <div className="container-wide px-5 lg:px-8 py-10 md:py-14">
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* ─── FORMULÁRIO ─── */}
          <div className="lg:sticky lg:top-24">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-6 space-y-5"
            >
              <p className="font-semibold text-lg">Parâmetros do plano</p>

              <Field label="Carta de crédito (R$)" hint="Valor nominal da carta contratada.">
                <Input
                  value={form.credit}
                  onChange={set("credit")}
                  placeholder="300000"
                  suffix="R$"
                />
              </Field>

              <Field label="Prazo total (meses)" hint="Entre 1 e 360 meses.">
                <Input
                  value={form.term}
                  onChange={set("term")}
                  placeholder="120"
                  suffix="meses"
                />
              </Field>

              <Field
                label="Taxa de administração total (%)"
                hint="Percentual total sobre a carta, conforme contrato."
              >
                <Input
                  value={form.adminRate}
                  onChange={set("adminRate")}
                  placeholder="16"
                  suffix="%"
                />
              </Field>

              <Field
                label="Fundo de reserva total (%)"
                hint="Percentual total do fundo de reserva."
              >
                <Input
                  value={form.reserveRate}
                  onChange={set("reserveRate")}
                  placeholder="2"
                  suffix="%"
                />
              </Field>

              <Field
                label="Seguro mensal (% do saldo)"
                hint="Use apenas se o seguro não estiver embutido na parcela. Deixe 0 se já incluído."
              >
                <Input
                  value={form.insuranceRate}
                  onChange={set("insuranceRate")}
                  placeholder="0"
                  suffix="%"
                />
              </Field>

              <Field
                label="Correção anual estimada (%)"
                hint="Índice de reajuste projetado (ex.: INCC, IPCA)."
              >
                <Input
                  value={form.adjRate}
                  onChange={set("adjRate")}
                  placeholder="5"
                  suffix="%"
                />
              </Field>

              <Field label="Periodicidade do reajuste">
                <select
                  value={form.adjEvery}
                  onChange={(e) => set("adjEvery")(e.target.value as AdjEvery)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                >
                  <option value="12">Anual (1º reajuste no mês 13)</option>
                  <option value="6">Semestral (1º reajuste no mês 7)</option>
                  <option value="0">Sem reajuste</option>
                </select>
              </Field>

              <Field label="Modelo de parcela">
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {(["linear", "nonlinear"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("mode")(m)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                        form.mode === m
                          ? "bg-[var(--orange)] text-white"
                          : "bg-background hover:bg-secondary/60"
                      }`}
                    >
                      {m === "linear" ? "Linear" : "Não linear"}
                    </button>
                  ))}
                </div>
              </Field>

              {form.mode === "nonlinear" && (
                <Field
                  label="Faixas não lineares"
                  hint='Formato: "1-12: 2500" ou "13: 3000". Uma faixa por linha. Meses sem faixa usam a parcela linear.'
                >
                  <textarea
                    value={form.ranges}
                    onChange={(e) => set("ranges")(e.target.value)}
                    rows={5}
                    placeholder={"1-12: 2500\n13-24: 2800\n25-120: 3200"}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm mono focus:outline-none focus:ring-2 focus:ring-[var(--orange)] resize-y"
                  />
                </Field>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-full bg-[var(--orange)] text-white py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {mutation.isPending ? "Calculando…" : "Simular plano"}
              </button>
            </form>
          </div>

          {/* ─── RESULTADO ─── */}
          <div className="space-y-6">
            {!result && !mutation.isPending && (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                <p className="text-foreground/40 text-sm">
                  Preencha os parâmetros e clique em{" "}
                  <strong className="text-foreground/60">Simular plano</strong> para
                  gerar o fluxo completo.
                </p>
              </div>
            )}

            {mutation.isPending && (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-foreground/50">Calculando fluxo…</p>
              </div>
            )}

            {result && (
              <>
                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="rounded-2xl border border-[color-mix(in_oklch,var(--orange)_35%,transparent)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)] p-5 space-y-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[var(--orange)]">
                      <AlertTriangle className="w-4 h-4" />
                      {result.warnings.length === 1 ? "Aviso" : "Avisos"}
                    </p>
                    <ul className="space-y-1.5">
                      {result.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-foreground/75 leading-relaxed">
                          · {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-4">
                  <KpiCard
                    label="1ª parcela"
                    value={formatBRLCents(first)}
                    hint="Parcela estimada no mês 1"
                    tone="positive"
                  />
                  <KpiCard
                    label="Maior parcela"
                    value={formatBRLCents(maxInstallment)}
                    hint="Pressão máxima de caixa"
                    tone="orange"
                  />
                  <KpiCard
                    label="Total pago projetado"
                    value={formatBRL(result.paidTotal)}
                    hint="Inclui seguro, se informado"
                    highlight
                  />
                  <KpiCard
                    label="Saldo final"
                    value={formatBRLCents(result.residual)}
                    hint={
                      result.residual > 1
                        ? "Ajustar faixas não lineares"
                        : "Plano fecha no prazo"
                    }
                    tone={result.residual > 1 ? "negative" : "positive"}
                  />
                </div>

                {/* Leitura interpretativa */}
                <MeaningBlock>
                  <p>
                    A <strong>1ª parcela</strong> é calculada dividindo a obrigação
                    contratual total (fundo comum + taxa de administração + fundo de
                    reserva) pelo prazo. Nos meses de reajuste, a carta e os saldos
                    são corrigidos pelo índice informado — e a parcela sobe
                    proporcionalmente.
                  </p>
                  {result.insuranceTotal > 0 && (
                    <p>
                      O <strong>seguro</strong> é calculado mensalmente sobre o saldo
                      residual após o pagamento da parcela. No total, o seguro
                      representa{" "}
                      <strong>{formatBRL(result.insuranceTotal)}</strong> ao longo do
                      prazo.
                    </p>
                  )}
                  {result.residual > 1 && (
                    <p className="text-[var(--destructive)]">
                      O <strong>saldo final positivo</strong> indica que as faixas
                      não lineares informadas não cobrem a obrigação total. Revise as
                      faixas ou use o modo linear como referência.
                    </p>
                  )}
                </MeaningBlock>

                {/* Memória de cálculo */}
                <CalcMemory
                  rows={[
                    {
                      label: "Carta de crédito",
                      value: formatBRL(result.credit),
                      formula: "Valor nominal contratado",
                    },
                    {
                      label: "Obrigação inicial total",
                      value: formatBRL(result.initialObligation),
                      formula: `Carta + ${result.adminRate.toFixed(1)}% adm + ${result.reserveRate.toFixed(1)}% reserva`,
                    },
                    {
                      label: "Parcela linear base (mês 1)",
                      value: formatBRLCents(result.initialObligation / result.term),
                      formula: `${formatBRL(result.initialObligation)} ÷ ${result.term} meses`,
                    },
                    {
                      label: "Carta final corrigida",
                      value: formatBRL(result.finalCredit),
                      formula: `Após ${result.rows.filter((r) => r.tags.includes("Reajuste")).length} reajuste(s) de ${result.rows.find((r) => r.tags.includes("Reajuste")) ? form.adjRate + "%" : "0%"}`,
                    },
                    {
                      label: "Correção nominal acumulada",
                      value: formatBRL(result.correctionNominal),
                      formula: "Δ fundo comum + Δ taxa adm + Δ fundo reserva",
                    },
                    ...(result.insuranceTotal > 0
                      ? [
                          {
                            label: "Seguro total projetado",
                            value: formatBRL(result.insuranceTotal),
                            formula: `${form.insuranceRate}% × saldo residual mensal`,
                          },
                        ]
                      : []),
                    {
                      label: "Total pago projetado",
                      value: formatBRL(result.paidTotal),
                      formula: "Σ parcelas mensais (componentes + seguro)",
                    },
                    {
                      label: "Saldo final (residual)",
                      value: formatBRLCents(result.residual),
                      formula: result.residual < 1 ? "Plano fecha no prazo ✓" : "Revisar faixas não lineares",
                    },
                  ]}
                />

                {/* Tabela de fluxo */}
                <div>
                  <p className="font-semibold text-lg mb-3">Fluxo mensal completo</p>
                  <ScheduleTable rows={result.rows} />
                </div>

                {/* Metodologia */}
                <MethodologyBlock
                  sources={[
                    "Lógica extraída do HTML original Raio-X do Consórcio (buildSchedule)",
                    "Parcela linear: obrigação total ÷ meses restantes, recalculada a cada reajuste",
                    "Parcela não linear: valor da faixa × fator de correção acumulado",
                    "Seguro: calculado sobre o saldo residual após o pagamento da parcela",
                    "Reajuste: aplicado sobre fundo comum, taxa adm e fundo reserva simultaneamente",
                  ]}
                >
                  <p>
                    O motor de cálculo é idêntico ao HTML original do Raio-X do
                    Consórcio. Nenhuma fórmula foi alterada ou simplificada. O
                    cálculo roda no servidor (tRPC) e não é acessível ao navegador.
                  </p>
                </MethodologyBlock>

                {/* Transparência */}
                <TransparencyBlock />

                {/* PDF */}
                <PdfButton
                  onClick={() => {
                    if (!result) return;
                    try {
                      generatePdfSimulePlano({
                        credit: num(form.credit),
                        term: Math.round(num(form.term)),
                        adminRate: num(form.adminRate),
                        reserveRate: num(form.reserveRate),
                        insuranceRate: num(form.insuranceRate),
                        adjRate: num(form.adjRate),
                        adjEvery: form.adjEvery,
                        mode: form.mode,
                        ranges: form.ranges,
                        rows: result.rows,
                        paidTotal: result.paidTotal,
                        residual: result.residual,
                        finalCredit: result.finalCredit,
                        initialObligation: result.initialObligation,
                        insuranceTotal: result.insuranceTotal,
                        correctionNominal: result.correctionNominal,
                        warnings: result.warnings,
                        simulationId: result.simulationId,
                        generatedAt: result.generatedAt,
                      });
                    } catch (e) {
                      toast.error("Erro ao gerar PDF. Tente novamente.");
                      console.error(e);
                    }
                  }}
                />

                {/* CTA */}
                <ConsultCTA context="o fluxo do seu plano" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
