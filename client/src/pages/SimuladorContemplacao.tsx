/*
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
  formatBRL,
  formatBRLCents,
  formatPct,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { ChevronDown, ArrowUpRight, Instagram, Download, HelpCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="scale-90 origin-left -mb-2">
        <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      </div>
      <p className="font-bold text-[13px] md:text-[14px] text-gray-800 uppercase tracking-wider mb-1">
        Dados do plano
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Carta (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.credit} onChange={(e) => set("credit", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Valor nominal</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Prazo (meses)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.term} onChange={(e) => set("term", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total plano</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Pagas</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.paidMonths} onChange={(e) => set("paidMonths", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Parcelas</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Taxa Adm (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.adminRate} onChange={(e) => set("adminRate", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total plano</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Reserva (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.reserveRate} onChange={(e) => set("reserveRate", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total plano</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Base Lance</label>
          <div className="mt-auto">
            <select className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.base} onChange={(e) => set("base", e.target.value as Base)}>
              <option value="credit">Carta</option>
              <option value="category">Categoria</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDD6C8] pt-1.5">
        <p className="font-bold text-[13px] md:text-[14px] text-gray-800 uppercase tracking-wider mb-1">
          Composição do lance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          <div className="flex flex-col h-full">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Próprio (R$)</label>
            <div className="mt-auto">
              <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.own} onChange={(e) => set("own", e.target.value)} />
              <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Recurso livre</p>
            </div>
          </div>
          <div className="flex flex-col h-full">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">FGTS (R$)</label>
            <div className="mt-auto">
              <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
              <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Uso imobiliário</p>
            </div>
          </div>
          <div className="flex flex-col h-full">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Embutido (R$)</label>
            <div className="mt-auto">
              <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
              <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Reduz a carta</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDD6C8] pt-1.5">
        <p className="font-bold text-[13px] md:text-[14px] text-gray-800 uppercase tracking-wider mb-1">
          Parâmetros avançados
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          <div className="flex flex-col h-full">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Correção (% a.a.)</label>
            <div className="mt-auto">
              <input type="number" min="0" step="0.1" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.adjRate} onChange={(e) => set("adjRate", e.target.value)} />
              <p className="text-[9px] text-foreground/60 mt-0.5 leading-tight truncate">Índice anual. <a href="https://www.bcb.gov.br" target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] hover:underline">Conferir índice</a></p>
            </div>
          </div>
          <div className="flex flex-col h-full">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Periodicidade</label>
            <div className="mt-auto">
              <select className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.adjEvery} onChange={(e) => set("adjEvery", e.target.value as AdjEvery)}>
                <option value="0">Sem correção</option>
                <option value="6">Semestral</option>
                <option value="12">Anual</option>
              </select>
              <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Do reajuste</p>
            </div>
          </div>
          <div className="flex flex-col h-full">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Modelo de parcela</label>
            <div className="mt-auto">
              <select className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.mode} onChange={(e) => set("mode", e.target.value as Mode)}>
                <option value="linear">Linear (padrão)</option>
                <option value="nonlinear">Não linear (faixas)</option>
              </select>
              <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Evolução</p>
            </div>
          </div>
        </div>
        {form.mode === "nonlinear" && (
          <div className="mt-1.5">
            <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Faixas não lineares</label>
            <textarea className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--orange)] resize-y" rows={4}
              placeholder={"1-12: 2500\n13-60: 3200"} value={form.ranges}
              onChange={(e) => set("ranges", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight">Uma faixa por linha</p>
          </div>
        )}
      </div>

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-2 sm:py-2.5 text-[13px] md:text-[14px] sm:text-[14px] md:text-[15px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Analisar contemplação"}
      </button>


    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* KPIs — grid 2×3 (6 quadrantes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        <KpiCard label="Carta atualizada" value={brl(result.credit)}
          hint="Valor nominal atualizado." tone="default" />
        <KpiCard label="Carta líquida" value={brl(result.creditLiquid)}
          hint="Carta menos embutido." tone={liquidTone(result.creditLiquid, result.credit)} />
        <KpiCard label="Lance total" value={brl(result.totalLance)}
          hint="Próprio + FGTS + embutido." tone="orange" />
        <KpiCard label="Força do lance" value={formatPct(result.forcePct)}
          hint="Em relação à carta." tone={forceTone(result.forcePct)} />
        <KpiCard label="Parcela antes" value={brlc(result.postLanceInstallment)}
          hint="Último mês antes da contemplação." tone="default" />
        <KpiCard label="Parcela pós-lance" value={brlc(result.postLanceInstallment)}
          hint="1ª parcela após o lance." tone="default" />
      </div>

      {/* Card Diagnóstico do Lance — ACIMA DA TABELA */}
      <div className="rounded-lg sm:rounded-xl border border-[var(--orange)]/30 bg-[var(--orange)]/5 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[13px] md:text-[14px] sm:text-[14px] md:text-[15px] mb-1">Diagnóstico do lance.</h3>
            <p className="text-[12px] md:text-[13px] sm:text-[13px] md:text-[14px] leading-relaxed text-foreground/70">
              Seu lance representa {formatPct(result.forcePct)} da carta. Desse total, {brl(result.own + result.fgts)} saem do seu patrimônio e {brl(result.embedded)} serão abatidos diretamente do crédito. Após a contemplação, sua parcela cai para aproximadamente {brlc(result.postLanceInstallment)}. Antes de decidir, compare esse esforço financeiro com outras alternativas disponíveis.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Evolução — COM BOTOES PDF E RACIONAL */}
      {result && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[13px] md:text-[14px] font-bold text-foreground/60 uppercase tracking-widest">Evolução das parcelas</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC93C] text-[#0A0A08] text-[10px] font-bold uppercase rounded-full hover:bg-[#FFD700] transition-colors shadow-sm"
              >
                <HelpCircle className="w-3 h-3" />
                Racional
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePdf(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-black text-[10px] font-bold uppercase rounded-full hover:bg-white/20 transition-colors shadow-sm border border-white/10"
              >
                <Download className="w-3 h-3" />
                PDF
              </button>
            </div>
          </div>
          <div className="rounded-lg sm:rounded-xl border border-border overflow-hidden bg-white shadow-sm">
            <div className="w-full">
              <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <table className="w-full text-[10px] md:text-[11px] min-w-[560px]">
                <thead className="bg-[var(--ink)] text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-wider text-white/80 text-[9px]">Mês</th>
                    <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-wider text-white/80 text-[9px]">Carta</th>
                    <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-wider text-white/80 text-[9px]">Evento</th>
                    <th className="px-2 py-1.5 text-right font-semibold uppercase tracking-wider text-white/80 text-[9px]">Lance</th>
                    <th className="px-2 py-1.5 text-right font-semibold uppercase tracking-wider text-white/80 text-[9px]">Parcela</th>
                    <th className="px-2 py-1.5 text-right font-semibold uppercase tracking-wider text-white/80 text-[9px]">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(expanded ? result.projection.rows : []).map((r) => (
                    <tr key={r.month} className={`transition-colors bg-white`}>
                      <td className="px-2 py-1 font-mono text-foreground/70 text-[9px]">{r.month}</td>
                      <td className="px-2 py-1 font-mono text-[9px] font-semibold">{brl(r.credit)}</td>
                      <td className="px-2 py-1 font-medium text-[9px]">
                        {r.event === "Lance aplicado" ? (
                          <span className="text-[var(--orange)] flex items-center gap-0.5 font-bold">
                            <ArrowUpRight className="w-2 h-2" />
                            {r.event}
                          </span>
                        ) : r.event}
                      </td>
                      <td className="px-2 py-1 text-right font-mono text-[9px] text-foreground/80">{r.lance > 0 ? brl(r.lance) : "—"}</td>
                      <td className={`px-2 py-1 text-right font-mono font-bold text-[9px] ${r.event === "Lance aplicado" ? "text-[var(--orange)]" : "text-foreground"}`}>
                        {r.projected > 0 ? brl(r.projected) : "—"}
                      </td>
                      <td className="px-2 py-1 text-right font-mono text-foreground/70 text-[9px]">{brl(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {result.projection.rows.length > 0 && (
              <button onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-[var(--orange)] bg-secondary/5 hover:bg-secondary/20 border-t border-border transition-all">
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                {expanded ? "Recolher" : `Ver todas (${result.projection.rows.length})`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card de interpretação — NA COLUNA DIREITA */}
      <div className="rounded-xl border border-border bg-card py-3 px-4 overflow-x-auto">
        <p className="font-semibold text-[14px] md:text-[15px]">Quer interpretar esses números?</p>
        <p className="text-[13px] md:text-[14px] text-foreground/60 mt-0.5">Eu posso analisar sua proposta com você e mostrar onde estão os principais impactos.</p>
        <button className="mt-3 w-full rounded-full bg-[var(--orange)] text-white py-2 text-[14px] md:text-[15px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all">
          Pedir uma análise individual
        </button>
      </div>

      {/* Botão PDF — NA COLUNA DIREITA */}
      <button 
        onClick={handlePdf}
        disabled={pdfLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-full border border-border bg-white hover:bg-secondary/20 text-[12px] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
      >
        <ArrowUpRight className="w-4 h-4" />
        {pdfLoading ? "Gerando..." : "Baixar Relatório de Auditoria (PDF)"}
      </button>

      {/* Leitura técnica */}
      <div className="space-y-3">
        <TransparencyBlock />
      </div>
    </div>
  ) : null;

  // ── Tabela de Evolução — MOVIDA PARA COLUNA DIREITA ──
  const scheduleTable = null;

  return (
    <RaioXLayout
      moduleNumber={2}
      title="O LANCE PODE COMPRAR UMA CONTEMPLAÇÃO OU UMA DECISÃO CARA."
      description={<span className="text-white">Compare o ganho real de probabilidade com o impacto financeiro da oferta e descubra se vale a pena colocar mais dinheiro na mesa.</span>}
      descriptionSupport="Simule o impacto real do seu lance e descubra se a conta fecha antes de ofertar."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
      scheduleTable={scheduleTable}
    />
  );
}

function Field({ label, value, onChange, big }: { label: string; value: string; onChange: (v: string) => void; big?: boolean }) {
  return (
    <label className="block">
      <span className={`font-medium text-foreground/70 mb-1.5 block ${big ? "text-[14px] md:text-[15px]" : "text-[14px] md:text-[15px]"}`}>{label}</span>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-[var(--orange)] transition-colors ${big ? "text-lg font-semibold" : "text-[14px] md:text-[15px]"}`} />
    </label>
  );
}
