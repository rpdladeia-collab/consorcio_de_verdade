/**
 * Módulo 4 — Proporção da Taxa
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: fiel ao HTML original (runEfficiency)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  KpiCard, TransparencyBlock, ConsultCTA, PdfButton,
  CalcMemory, MethodologyBlock, MeaningBlock,
  formatBRL, formatBRLCents, formatPct,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";

function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }
function brl(v: number) { return formatBRL(v); }
function brl0(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(isFinite(v) ? v : 0);
}
function pct2(v: number) {
  return `${(isFinite(v) ? v : 0).toFixed(2).replace(".", ",")}%`;
}

type Basis = "newMoney" | "liquidCredit";

interface FormState {
  credit: string; adminPct: string; paid: string;
  own: string; fgts: string; embedded: string; basis: Basis;
}

const DEFAULT: FormState = {
  credit: "300000", adminPct: "16", paid: "12",
  own: "60000", fgts: "0", embedded: "60000", basis: "newMoney",
};

const METER_COLOR: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

export default function SimuladorProporcaoTaxa() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [pdfLoading, setPdfLoading] = useState(false);

  const mutation = trpc.raiox.proporcaoTaxa.useMutation();
  const result = mutation.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      credit: num(form.credit), adminPct: num(form.adminPct),
      paid: num(form.paid), own: num(form.own),
      fgts: num(form.fgts), embedded: num(form.embedded),
      basis: form.basis,
    });
  }

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfProporcaoTaxa } = await import("@/lib/pdfProporcaoTaxa");
      await generatePdfProporcaoTaxa({ ...result, form });
    } catch (err) { console.error("PDF error", err); }
    finally { setPdfLoading(false); }
  }

  // ── Painel esquerdo: formulário ──────────────────────────────────────────
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="font-semibold text-sm text-foreground/70 uppercase tracking-wider mb-3">
        Dados do plano
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Carta de crédito (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-1 w-full"
            value={form.credit} onChange={(e) => set("credit", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Taxa adm. (%)</span>
          <input type="number" min="0" step="0.01" className="input mt-1 w-full"
            value={form.adminPct} onChange={(e) => set("adminPct", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Parcelas pagas</span>
          <input type="number" min="0" className="input mt-1 w-full"
            value={form.paid} onChange={(e) => set("paid", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Lance próprio (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-1 w-full"
            value={form.own} onChange={(e) => set("own", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">FGTS (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-1 w-full"
            value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Lance embutido (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-1 w-full"
            value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Base de cálculo da taxa</span>
          <select className="input mt-1 w-full" value={form.basis}
            onChange={(e) => set("basis", e.target.value as Basis)}>
            <option value="newMoney">Dinheiro novo (padrão)</option>
            <option value="liquidCredit">Carta líquida</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-3 text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Calcular proporção da taxa"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Taxa nominal (contratual)" value={pct2(result.kpis.nominal)}
          hint="Taxa de administração contratual" tone="default" />
        <KpiCard label="Taxa sobre carta líquida" value={pct2(result.kpis.onLiquid)}
          hint="Proporção sobre a carta após embutido" tone="orange" />
        <KpiCard label="Taxa sobre dinheiro novo" value={pct2(result.kpis.onNew)}
          hint="Proporção sobre o capital efetivamente novo" highlight={true} />
        <KpiCard label="Peso adicional da taxa" value={pct2(result.kpis.penalty)}
          hint="Diferença entre taxa real e nominal"
          tone={result.kpis.penalty > 5 ? "negative" : result.kpis.penalty > 2 ? "orange" : "positive"} />
      </div>

      {/* Termômetro visual */}
      <div className="bg-[#F5F0E8] rounded-xl border border-[#DDD6C8] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">
          Termômetro de proporção
        </p>
        <div className="relative h-4 rounded-full bg-gray-200 overflow-hidden mb-2">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${METER_COLOR[result.meter.cls] || "bg-gray-400"}`}
            style={{ width: `${Math.min(100, result.meter.widthPct)}%` }}
          />
        </div>
        <p className="font-bold text-sm text-foreground mb-1">{result.meter.label}</p>
        <p className="text-sm text-foreground/70 leading-relaxed">{result.meter.text}</p>
      </div>

      {/* Readboxes */}
      <div className="space-y-3">
        {result.readboxes.map((rb, i) => (
          <MeaningBlock key={i}>
            <p className="font-semibold text-sm mb-1">{rb.title}</p>
            <p className="whitespace-pre-line">{rb.body}</p>
            {rb.formula && (
              <p className="mt-2 text-xs font-mono text-foreground/50 bg-white/60 rounded px-2 py-1">
                {rb.formula}
              </p>
            )}
          </MeaningBlock>
        ))}
      </div>

      {/* Tabela de indicadores */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Tabela de indicadores
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold">Indicador</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Valor</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Leitura</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                    <td className="px-3 py-2 font-medium text-sm">{row.indicator}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{row.value}</td>
                    <td className="px-3 py-2 text-foreground/55 text-xs">{row.reading}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Memória de cálculo */}
      <CalcMemory rows={[
        { label: "Valor da administração", value: brl(result.adminValue),
          formula: `${brl0(result.kpis.nominal / 100 * num(form.credit))} = carta × taxa nominal` },
        { label: "Carta líquida", value: brl0(result.liquidCredit),
          formula: "carta − embutido" },
        { label: "Dinheiro novo", value: brl0(result.newMoney),
          formula: "carta líquida − parcelas pagas − lance próprio − FGTS" },
        { label: "Taxa sobre dinheiro novo", value: pct2(result.kpis.onNew),
          formula: "adm. / dinheiro novo × 100" },
        { label: "Peso adicional", value: pct2(result.kpis.penalty),
          formula: "taxa sobre dinheiro novo − taxa nominal" },
      ]} />

      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (runEfficiency).",
        "Dinheiro novo = carta líquida − parcelas pagas − lances próprios.",
        "Termômetro: verde ≤ 20%, amarelo ≤ 35%, vermelho > 35% sobre dinheiro novo.",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC).",
      ]} />

      <TransparencyBlock />

      <div className="flex flex-wrap gap-3">
        <PdfButton onClick={handlePdf} loading={pdfLoading} />
      </div>
      <ConsultCTA context="a análise de proporção da taxa" />
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={4}
      title="Proporção da Taxa"
      description="Os cálculos demonstram a proporção real da taxa de administração sobre o dinheiro efetivamente novo — não sobre a carta bruta."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
