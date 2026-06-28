/**
 * Módulo 2 — Contemplação
 * Layout: RaioXLayout (grid 2 colunas — inputs esquerda / KPIs+resultados direita)
 * Matemática: fiel ao HTML original (runContemplation + buildContemplationProjection)
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { ImportToggle } from "@/components/cdv/ImportToggle";
import {
  KpiCard,
  TransparencyBlock,
  ConsultCTA,
  PdfButton,
  CalcMemory,
  MethodologyBlock,
  MeaningBlock,
  Collapsible,
  formatBRL,
  formatBRLCents,
  formatPct,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { ChevronDown } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
function brl(v: number) { return formatBRL(v); }
function brlc(v: number) { return formatBRLCents(v); }
function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }

// ─── Tipos ──────────────────────────────────────────────────────────────────
type AdjEvery = "0" | "6" | "12";
type Mode = "linear" | "nonlinear";
type Base = "credit" | "category";

interface FormState {
  credit: string; term: string; adminRate: string; reserveRate: string;
  adjRate: string; adjEvery: AdjEvery; mode: Mode; ranges: string;
  paidMonths: string; base: Base; own: string; fgts: string; embedded: string;
}

const DEFAULT: FormState = {
  credit: "300000", term: "120", adminRate: "16", reserveRate: "2",
  adjRate: "5", adjEvery: "12", mode: "linear", ranges: "",
  paidMonths: "12", base: "credit", own: "60000", fgts: "0", embedded: "60000",
};

// ─── Componente ──────────────────────────────────────────────────────────────
export default function SimuladorContemplacao() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { baseParams, hasData } = useSimuladorStore();
  const [importEnabled, setImportEnabled] = useState(hasData);

  // Preenche campos ao ligar o toggle ou ao montar (se já há dados)
  useEffect(() => {
    if (importEnabled && baseParams) {
      setForm((prev) => ({
        ...prev,
        credit: String(baseParams.credit),
        term: String(baseParams.term),
        adminRate: String(baseParams.adminRate),
        reserveRate: String(baseParams.reserveRate),
        adjRate: String(baseParams.adjRate),
        adjEvery: (String(baseParams.adjEvery) as "0" | "6" | "12"),
        mode: baseParams.mode as "linear" | "nonlinear",
      }));
    } else if (!importEnabled) {
      setForm(DEFAULT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importEnabled]);

  const mutation = trpc.raiox.contemplacao.useMutation();
  const result = mutation.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      credit: num(form.credit), term: parseInt(form.term) || 120,
      adminRate: num(form.adminRate), reserveRate: num(form.reserveRate),
      adjRate: num(form.adjRate), adjEvery: form.adjEvery,
      mode: form.mode, ranges: form.ranges,
      paidMonths: parseInt(form.paidMonths) || 0,
      base: form.base, own: num(form.own),
      fgts: num(form.fgts), embedded: num(form.embedded),
    });
  }

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfContemplacao } = await import("@/lib/pdfContemplacao");
      await generatePdfContemplacao({ ...result, form });
    } catch (err) { console.error("PDF error", err); }
    finally { setPdfLoading(false); }
  }

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

  // ── Painel esquerdo: formulário ──────────────────────────────────────────
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      <p className="font-semibold text-sm text-foreground/70 uppercase tracking-wider mb-3">
        Dados do plano
      </p>

      {/* Grid 2 colunas dentro do card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Carta de crédito (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-1 w-full"
            value={form.credit} onChange={(e) => set("credit", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Prazo (meses)</span>
          <input type="number" min="1" max="240" className="input mt-1 w-full"
            value={form.term} onChange={(e) => set("term", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Parcelas pagas</span>
          <input type="number" min="0" className="input mt-1 w-full"
            value={form.paidMonths} onChange={(e) => set("paidMonths", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Taxa adm. (%)</span>
          <input type="number" min="0" step="0.01" className="input mt-1 w-full"
            value={form.adminRate} onChange={(e) => set("adminRate", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Fundo reserva (%)</span>
          <input type="number" min="0" step="0.01" className="input mt-1 w-full"
            value={form.reserveRate} onChange={(e) => set("reserveRate", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60 flex items-center gap-1.5">
            Base do lance
            <span className="relative group">
              <span className="cursor-help text-[var(--orange)] text-[11px] font-bold">?</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-[var(--ink)] text-white text-[11px] leading-relaxed p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                <strong>Sobre a carta:</strong> o % é calculado apenas sobre o crédito.<br/>
                <strong>Sobre a categoria:</strong> o % é calculado sobre crédito + taxa de administração.
              </span>
            </span>
          </span>
          <select className="input mt-1 w-full" value={form.base}
            onChange={(e) => set("base", e.target.value as Base)}>
            <option value="credit">Carta de crédito</option>
            <option value="category">Categoria (carta + adm)</option>
          </select>
        </label>
      </div>

      <div className="border-t border-[#DDD6C8] pt-3">
        <p className="font-semibold text-sm text-foreground/70 uppercase tracking-wider mb-3">
          Composição do lance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-foreground/60">Lance próprio (R$)</span>
            <input type="number" min="0" step="1000" className="input mt-1 w-full"
              value={form.own} onChange={(e) => set("own", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground/60 flex items-center gap-1.5">
              FGTS (R$)
              <span className="relative group">
                <span className="cursor-help text-[var(--orange)] text-[11px] font-bold">?</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-[var(--ink)] text-white text-[11px] leading-relaxed p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  As regras para uso do FGTS variam. Consulte sua administradora para confirmar se o seu grupo permite essa modalidade.
                </span>
              </span>
            </span>
            <input type="number" min="0" step="1000" className="input mt-1 w-full"
              value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
          </label>
          <label className="block col-span-2">
            <span className="text-xs font-medium text-foreground/60">Lance embutido (R$)</span>
            <input type="number" min="0" step="1000" className="input mt-1 w-full"
              value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
            <span className="text-[10px] text-foreground/40 mt-0.5 block">Reduz a carta líquida</span>
          </label>
        </div>
      </div>

      {/* Avançado colapsável */}
      <Collapsible title="Parâmetros avançados" subtitle="Correção e modelo de parcela"
        open={advancedOpen} onToggle={() => setAdvancedOpen(!advancedOpen)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="block">
            <span className="text-xs font-medium text-foreground/60">Correção (% a.a.)</span>
            <input type="number" min="0" step="0.1" className="input mt-1 w-full"
              value={form.adjRate} onChange={(e) => set("adjRate", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground/60">Periodicidade</span>
            <select className="input mt-1 w-full" value={form.adjEvery}
              onChange={(e) => set("adjEvery", e.target.value as AdjEvery)}>
              <option value="0">Sem correção</option>
              <option value="6">Semestral</option>
              <option value="12">Anual</option>
            </select>
          </label>
          <label className="block col-span-2">
            <span className="text-xs font-medium text-foreground/60">Modelo de parcela</span>
            <select className="input mt-1 w-full" value={form.mode}
              onChange={(e) => set("mode", e.target.value as Mode)}>
              <option value="linear">Linear (padrão)</option>
              <option value="nonlinear">Não linear (faixas)</option>
            </select>
          </label>
          {form.mode === "nonlinear" && (
            <label className="block col-span-2">
              <span className="text-xs font-medium text-foreground/60">Faixas</span>
              <textarea className="input mt-1 w-full h-20 font-mono text-xs"
                placeholder={"1-12: 2500\n13-60: 3200"} value={form.ranges}
                onChange={(e) => set("ranges", e.target.value)} />
            </label>
          )}
        </div>
      </Collapsible>

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-3 text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Analisar contemplação"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-6">
      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            Avisos do motor de cálculo
          </p>
          {result.warnings.map((w, i) => (
            <p key={i} className="text-sm text-orange-800">⚠ {w}</p>
          ))}
        </div>
      )}

      {/* KPIs — grid 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiCard label="Força de lance" value={formatPct(result.forcePct)}
          hint={`Base: ${result.baseLabel}`} tone={forceTone(result.forcePct)} />
        <KpiCard label="Lance total" value={brl(result.totalLance)}
          hint="Próprio + FGTS + embutido" tone="orange" />
        <KpiCard label="Carta líquida" value={brl(result.creditLiquid)}
          hint="Carta menos lance embutido" tone={liquidTone(result.creditLiquid, result.credit)} />
        <KpiCard label="Parcela pós-lance" value={brlc(result.postLanceInstallment)}
          hint="1ª parcela projetada após o lance" tone="default" />
      </div>

      {/* Leitura técnica */}
      <MeaningBlock label="Contemplação e Lance">
        <p>
          O lance embutido aumenta a força para contemplar, mas reduz o crédito
          disponível para compra em <strong>{brl(result.embedded)}</strong>.
          A tabela projeta as parcelas restantes com as correções futuras do índice.
        </p>
      </MeaningBlock>

      {/* Tabela de resumo */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Resumo da operação
        </p>
        <div className="rounded-xl border border-border">
          <div className="w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-[var(--ink)] text-white">
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Item</th>
                <th className="px-3 py-2.5 text-right font-semibold">Valor</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden lg:table-cell">Leitura</th>
              </tr>
            </thead>
            <tbody>
              {result.summaryRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                  <td className="px-3 py-2 font-medium text-sm">{row.item}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-semibold">{row.value}</td>
                  <td className="px-3 py-2 text-foreground/55 text-xs hidden lg:table-cell">{row.read}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabela de projeção — accordion com scroll interno */}
      <div className="rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setProjOpen(!projOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors text-sm font-semibold"
        >
          <span>Ver projeção mensal completa</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${projOpen ? "rotate-180" : ""}`} />
        </button>
        {projOpen && (
          <div className="max-h-[480px] overflow-x-auto overflow-y-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-3 py-2.5 text-left">Mês</th>
                  <th className="px-3 py-2.5 text-right">Carta</th>
                  <th className="px-3 py-2.5 text-left">Evento</th>
                  <th className="px-3 py-2.5 text-right">Lance</th>
                  <th className="px-3 py-2.5 text-right font-bold">Parcela</th>
                  <th className="px-3 py-2.5 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {result.projection.rows.map((row, i) => {
                  const isLance = row.event === "Lance aplicado";
                  const isAdj = row.tags?.includes("Reajuste");
                  return (
                    <tr key={i} className={
                      isLance ? "bg-orange-50 font-semibold"
                        : isAdj ? "bg-amber-50/60"
                        : i % 2 === 0 ? "bg-card" : "bg-secondary/20"
                    }>
                      <td className="px-3 py-1.5 font-mono">{row.month}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{brl(row.credit)}</td>
                      <td className="px-3 py-1.5 text-foreground/60">{row.event}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{row.lance > 0 ? brl(row.lance) : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">{row.projected > 0 ? brlc(row.projected) : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{brl(row.balance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Memória de cálculo */}
      <CalcMemory rows={[
        { label: "Lance total", value: brl(result.totalLance),
          formula: `próprio ${brl(result.own)} + FGTS ${brl(result.fgts)} + embutido ${brl(result.embedded)}` },
        { label: "Força de lance", value: formatPct(result.forcePct),
          formula: `${brl(result.totalLance)} ÷ base × 100` },
        { label: "Carta líquida", value: brl(result.creditLiquid),
          formula: `carta − embutido = ${brl(result.credit)} − ${brl(result.embedded)}` },
        { label: "Amortização aplicada", value: brl(result.applied),
          formula: "min(lance total, capacidade amortizável)" },
        { label: "Parcela pós-lance", value: brlc(result.postLanceInstallment),
          formula: "1ª parcela projetada após o lance" },
      ]} />

      {/* Metodologia */}
      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (runContemplation + buildContemplationProjection).",
        "Lance: amortização prioritária no fundo comum; excedente distribuído proporcionalmente.",
        "Parcela pós-lance: saldo residual ÷ meses restantes, recalculada a cada reajuste.",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC), não acessível ao navegador.",
      ]} />

      {/* Transparência */}
      <TransparencyBlock />

      {/* PDF + CTA */}
      <div className="flex flex-wrap gap-3">
        <PdfButton onClick={handlePdf} loading={pdfLoading} />
      </div>
      <ConsultCTA context="a análise de contemplação" />
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={2}
      title="Raio-X do Lance"
      description="Lance não é mágica. É dinheiro seu na mesa. Calcule a força do lance, o impacto na carta líquida e a parcela depois da contemplação antes de assumir que essa estratégia faz sentido."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
