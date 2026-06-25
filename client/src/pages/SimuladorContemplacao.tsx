/**
 * Módulo 2 — Contemplação
 * Página fiel ao HTML original: runContemplation + buildContemplationProjection
 * Campos: 13 (incluindo modo de parcela e faixas não lineares)
 * KPIs: Força de lance | Lance total | Carta líquida | Parcela pós-lance
 * Tabelas: Resumo (7 linhas) + Projeção mensal completa
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  KpiCard,
  TransparencyBlock,
  ConsultCTA,
  PdfButton,
  CalcMemory,
  MethodologyBlock,
  MeaningBlock,
  Collapsible,
  AuditSeal,
  formatBRL,
  formatBRLCents,
  formatPct,
} from "@/components/cdv/SimuladorUI";
import { BRAND } from "@/lib/brand";
// PDF: importado dinamicamente

// ─── Helpers ────────────────────────────────────────────────────────────────
function brl(v: number) { return formatBRL(v); }
function brlc(v: number) { return formatBRLCents(v); }

// ─── Tipos locais ────────────────────────────────────────────────────────────
type AdjEvery = "0" | "6" | "12";
type Mode = "linear" | "nonlinear";
type Base = "credit" | "category";

interface FormState {
  credit: string;
  term: string;
  adminRate: string;
  reserveRate: string;
  adjRate: string;
  adjEvery: AdjEvery;
  mode: Mode;
  ranges: string;
  paidMonths: string;
  base: Base;
  own: string;
  fgts: string;
  embedded: string;
}

const DEFAULT: FormState = {
  credit: "300000",
  term: "120",
  adminRate: "16",
  reserveRate: "2",
  adjRate: "5",
  adjEvery: "12",
  mode: "linear",
  ranges: "",
  paidMonths: "12",
  base: "credit",
  own: "60000",
  fgts: "0",
  embedded: "60000",
};

// ─── Componente ──────────────────────────────────────────────────────────────
export default function SimuladorContemplacao() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const mutation = trpc.raiox.contemplacao.useMutation();
  const result = mutation.data;

  function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      credit: num(form.credit),
      term: parseInt(form.term) || 120,
      adminRate: num(form.adminRate),
      reserveRate: num(form.reserveRate),
      adjRate: num(form.adjRate),
      adjEvery: form.adjEvery,
      mode: form.mode,
      ranges: form.ranges,
      paidMonths: parseInt(form.paidMonths) || 0,
      base: form.base,
      own: num(form.own),
      fgts: num(form.fgts),
      embedded: num(form.embedded),
    });
  }

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfContemplacao } = await import("@/lib/pdfContemplacao");
      await generatePdfContemplacao({ ...result, form });
    } catch (err) {
      console.error("PDF error", err);
    } finally {
      setPdfLoading(false);
    }
  }

  // KPI tone helpers
  function forceTone(pct: number) {
    if (pct >= 35) return "positive" as const;
    if (pct >= 20) return "orange" as const;
    return "negative" as const;
  }

  function liquidTone(liquid: number, credit: number) {
    const ratio = credit > 0 ? liquid / credit : 1;
    if (ratio >= 0.85) return "positive" as const;
    if (ratio >= 0.70) return "orange" as const;
    return "negative" as const;
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* ── HERO ── */}
      <section className="bg-[var(--ink)] text-[var(--paper)] py-16 md:py-20">
        <div className="container max-w-4xl">
          <AuditSeal className="mb-4" />
          <p className="eyebrow text-[var(--orange)] mb-3">
            MÓDULO 2 · RAIO-X DO CONSÓRCIO
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Contemplação
          </h1>
          <p className="text-lg text-white/65 max-w-2xl leading-relaxed">
            Calcule a força do seu lance, o impacto do embutido na carta líquida
            e projete as parcelas restantes após a contemplação.
          </p>
        </div>
      </section>

      {/* ── FORMULÁRIO ── */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos principais */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="font-semibold text-lg mb-5">Dados do plano</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="label-text">Carta de crédito (R$)</span>
                  <input
                    type="number" min="0" step="1000"
                    className="input mt-1 w-full"
                    value={form.credit}
                    onChange={(e) => set("credit", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">Prazo total (meses)</span>
                  <input
                    type="number" min="1" max="240"
                    className="input mt-1 w-full"
                    value={form.term}
                    onChange={(e) => set("term", e.target.value)}
                  />
                  <span className="text-xs text-foreground/45 mt-1 block">Máximo: 240 meses</span>
                </label>
                <label className="block">
                  <span className="label-text">Taxa de administração total (%)</span>
                  <input
                    type="number" min="0" max="1000" step="0.01"
                    className="input mt-1 w-full"
                    value={form.adminRate}
                    onChange={(e) => set("adminRate", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">Fundo de reserva total (%)</span>
                  <input
                    type="number" min="0" max="1000" step="0.01"
                    className="input mt-1 w-full"
                    value={form.reserveRate}
                    onChange={(e) => set("reserveRate", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">Parcelas pagas até a contemplação</span>
                  <input
                    type="number" min="0"
                    className="input mt-1 w-full"
                    value={form.paidMonths}
                    onChange={(e) => set("paidMonths", e.target.value)}
                  />
                  <span className="text-xs text-foreground/45 mt-1 block">0 = contemplação no 1º mês</span>
                </label>
                <label className="block">
                  <span className="label-text">Base do lance</span>
                  <select
                    className="input mt-1 w-full"
                    value={form.base}
                    onChange={(e) => set("base", e.target.value as Base)}
                  >
                    <option value="credit">Carta de crédito</option>
                    <option value="category">Categoria (carta + taxa adm)</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Campos de lance */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="font-semibold text-lg mb-5">Composição do lance</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <label className="block">
                  <span className="label-text">Lance próprio (R$)</span>
                  <input
                    type="number" min="0" step="1000"
                    className="input mt-1 w-full"
                    value={form.own}
                    onChange={(e) => set("own", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">FGTS (R$)</span>
                  <input
                    type="number" min="0" step="1000"
                    className="input mt-1 w-full"
                    value={form.fgts}
                    onChange={(e) => set("fgts", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">Lance embutido (R$)</span>
                  <input
                    type="number" min="0" step="1000"
                    className="input mt-1 w-full"
                    value={form.embedded}
                    onChange={(e) => set("embedded", e.target.value)}
                  />
                  <span className="text-xs text-foreground/45 mt-1 block">Reduz a carta líquida</span>
                </label>
              </div>
            </div>

            {/* Modo avançado */}
            <Collapsible
              title="Parâmetros avançados"
              subtitle="Correção, modelo de parcela e faixas não lineares"
              open={advancedOpen}
              onToggle={() => setAdvancedOpen(!advancedOpen)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <label className="block">
                  <span className="label-text">Correção estimada (% a.a.)</span>
                  <input
                    type="number" min="0" step="0.1"
                    className="input mt-1 w-full"
                    value={form.adjRate}
                    onChange={(e) => set("adjRate", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">Periodicidade da correção</span>
                  <select
                    className="input mt-1 w-full"
                    value={form.adjEvery}
                    onChange={(e) => set("adjEvery", e.target.value as AdjEvery)}
                  >
                    <option value="0">Sem correção</option>
                    <option value="6">Semestral (a partir do mês 7)</option>
                    <option value="12">Anual (a partir do mês 13)</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label-text">Modelo de parcela</span>
                  <select
                    className="input mt-1 w-full"
                    value={form.mode}
                    onChange={(e) => set("mode", e.target.value as Mode)}
                  >
                    <option value="linear">Linear (padrão)</option>
                    <option value="nonlinear">Não linear (faixas)</option>
                  </select>
                </label>
                {form.mode === "nonlinear" && (
                  <label className="block md:col-span-2">
                    <span className="label-text">Faixas de parcela (não linear)</span>
                    <textarea
                      className="input mt-1 w-full h-28 font-mono text-sm"
                      placeholder={"1-12: 2500\n13-60: 3200\n61-120: 3800"}
                      value={form.ranges}
                      onChange={(e) => set("ranges", e.target.value)}
                    />
                    <span className="text-xs text-foreground/45 mt-1 block">
                      Formato: mês-início a mês-fim: valor. Ex: 1-12: 2500
                    </span>
                  </label>
                )}
              </div>
            </Collapsible>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-[var(--orange)] text-white py-4 text-base font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {mutation.isPending ? "Calculando…" : "Analisar contemplação"}
            </button>
          </form>
        </div>
      </section>

      {/* ── RESULTADO ── */}
      {result && (
        <section className="py-12 border-t border-border">
          <div className="container max-w-4xl space-y-10">

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-2xl border border-[color-mix(in_oklch,var(--orange)_35%,transparent)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)] p-5 space-y-2">
                <p className="eyebrow text-[var(--orange)] mb-2">Avisos do motor de cálculo</p>
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-foreground/80">⚠ {w}</p>
                ))}
              </div>
            )}

            {/* KPIs */}
            <div>
              <p className="eyebrow text-foreground/50 mb-4">Resultado da análise</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  label="Força de lance"
                  value={formatPct(result.forcePct)}
                  hint={`Base: ${result.baseLabel}`}
                  tone={forceTone(result.forcePct)}
                />
                <KpiCard
                  label="Lance total"
                  value={brl(result.totalLance)}
                  hint="Próprio + FGTS + embutido"
                  tone="orange"
                />
                <KpiCard
                  label="Carta líquida"
                  value={brl(result.creditLiquid)}
                  hint="Carta menos lance embutido"
                  tone={liquidTone(result.creditLiquid, result.credit)}
                />
                <KpiCard
                  label="Parcela pós-lance"
                  value={brlc(result.postLanceInstallment)}
                  hint="1ª parcela projetada após o lance"
                  tone="default"
                />
              </div>
            </div>

            {/* Leitura técnica */}
            <MeaningBlock>
              <p>
                O lance embutido aumenta a força para contemplar, mas não coloca
                dinheiro novo no grupo. Os cálculos demonstram que ele reduz o
                crédito disponível para compra em{" "}
                <strong>{brl(result.embedded)}</strong>.
              </p>
              <p>
                A tabela abaixo continua o fluxo do plano, marca o mês do lance e
                projeta as parcelas restantes com as correções futuras do índice.
                Trata-se de uma estimativa de manutenção de prazo; a administradora
                pode aplicar regras próprias de redução de parcela ou prazo.
              </p>
            </MeaningBlock>

            {/* Memória de cálculo */}
            <CalcMemory
              rows={[
                {
                  label: "Lance total",
                  value: brl(result.totalLance),
                  formula: `próprio ${brl(result.own)} + FGTS ${brl(result.fgts)} + embutido ${brl(result.embedded)}`,
                },
                {
                  label: "Base do lance",
                  value: brl(result.baseLabel === "categoria"
                    ? result.credit * (1 + num(form.adminRate) / 100)
                    : result.credit),
                  formula: result.baseLabel === "categoria"
                    ? `carta × (1 + taxa adm)`
                    : "carta de crédito",
                },
                {
                  label: "Força de lance",
                  value: formatPct(result.forcePct),
                  formula: `${brl(result.totalLance)} ÷ base × 100`,
                },
                {
                  label: "Carta líquida",
                  value: brl(result.creditLiquid),
                  formula: `carta − embutido = ${brl(result.credit)} − ${brl(result.embedded)}`,
                },
                {
                  label: "Amortização aplicada",
                  value: brl(result.applied),
                  formula: `min(lance total, capacidade amortizável)`,
                },
                {
                  label: "Parcela pós-lance",
                  value: brlc(result.postLanceInstallment),
                  formula: "1ª parcela projetada após o lance",
                },
              ]}
            />

            {/* Tabela de resumo */}
            <div>
              <p className="eyebrow text-foreground/50 mb-4">Resumo da operação</p>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--ink)] text-[var(--paper)]">
                      <th className="px-4 py-3 text-left font-semibold">Item</th>
                      <th className="px-4 py-3 text-right font-semibold">Valor</th>
                      <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Leitura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.summaryRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                        <td className="px-4 py-3 font-medium">{row.item}</td>
                        <td className="px-4 py-3 text-right data-num font-semibold">{row.value}</td>
                        <td className="px-4 py-3 text-foreground/55 hidden md:table-cell">{row.read}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela de projeção */}
            <div>
              <p className="eyebrow text-foreground/50 mb-4">Projeção mensal completa</p>
              <div className="rounded-2xl border border-border overflow-auto">
                <table className="w-full text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[var(--ink)] text-[var(--paper)]">
                      <th className="px-3 py-2.5 text-left">Mês</th>
                      <th className="px-3 py-2.5 text-right">Carta corrigida</th>
                      <th className="px-3 py-2.5 text-left">Evento</th>
                      <th className="px-3 py-2.5 text-right">Lance aplicado</th>
                      <th className="px-3 py-2.5 text-right font-bold">Parcela / projeção</th>
                      <th className="px-3 py-2.5 text-right">Saldo estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.projection.rows.map((row, i) => {
                      const isAdj = row.tags?.includes("Reajuste");
                      const isLance = row.event === "Lance aplicado";
                      return (
                        <tr
                          key={i}
                          className={
                            isLance
                              ? "bg-[color-mix(in_oklch,var(--orange)_12%,transparent)] font-semibold"
                              : isAdj
                              ? "bg-[color-mix(in_oklch,var(--orange)_6%,transparent)]"
                              : i % 2 === 0
                              ? "bg-card"
                              : "bg-secondary/20"
                          }
                        >
                          <td className="px-3 py-2 data-num">{row.month}</td>
                          <td className="px-3 py-2 text-right data-num">{brl(row.credit)}</td>
                          <td className="px-3 py-2 text-foreground/70">{row.event}</td>
                          <td className="px-3 py-2 text-right data-num">
                            {row.lance > 0 ? brl(row.lance) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right data-num font-bold">
                            {row.projected > 0 ? brlc(row.projected) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right data-num">{brl(row.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Metodologia */}
            <MethodologyBlock
              sources={[
                "Lógica extraída do HTML original Raio-X do Consórcio (runContemplation + buildContemplationProjection).",
                "Lance: amortização prioritária no fundo comum; excedente distribuído proporcionalmente em taxa adm e fundo reserva.",
                "Parcela pós-lance: saldo residual ÷ meses restantes, recalculada a cada reajuste.",
                "Reajuste: aplicado sobre fundo comum, taxa adm e fundo reserva simultaneamente.",
                "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC), não acessível ao navegador.",
              ]}
            />

            {/* Transparência */}
            <TransparencyBlock />

            {/* PDF */}
            <div className="flex flex-wrap gap-3">
              <PdfButton onClick={handlePdf} loading={pdfLoading} />
            </div>

            {/* CTA */}
            <ConsultCTA context="a análise de contemplação" />
          </div>
        </section>
      )}
    </div>
  );
}

// Helper local para cálculo de base no CalcMemory
function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }
