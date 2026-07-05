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
import { ChevronDown, ArrowUpRight } from "lucide-react";

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="scale-75 origin-left -mb-4">
        <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      </div>
      <p className="font-semibold text-[9px] text-foreground/50 uppercase tracking-wider mb-0.5">
        Dados do plano
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5">
        <label className="block col-span-2">
          <span className="text-[9px] font-medium text-foreground/50">Carta de crédito (R$)</span>
          <input type="number" min="0" step="1000" className="input py-0.5 mt-0 w-full text-xs h-7"
            value={form.credit} onChange={(e) => set("credit", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[9px] font-medium text-foreground/50">Prazo (meses)</span>
          <input type="number" min="1" max="240" className="input py-0.5 mt-0 w-full text-xs h-7"
            value={form.term} onChange={(e) => set("term", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[9px] font-medium text-foreground/50">Parcelas pagas</span>
          <input type="number" min="0" className="input py-0.5 mt-0 w-full text-xs h-7"
            value={form.paidMonths} onChange={(e) => set("paidMonths", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[9px] font-medium text-foreground/50">Taxa adm. (%)</span>
          <input type="number" min="0" step="0.01" className="input py-0.5 mt-0 w-full text-xs h-7"
            value={form.adminRate} onChange={(e) => set("adminRate", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[9px] font-medium text-foreground/50">Fundo reserva (%)</span>
          <input type="number" min="0" step="0.01" className="input py-0.5 mt-0 w-full text-xs h-7"
            value={form.reserveRate} onChange={(e) => set("reserveRate", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-[10px] font-medium text-foreground/60 flex items-center gap-1.5">
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

      <div className="border-t border-[#DDD6C8] pt-1.5">
        <p className="font-semibold text-[9px] text-foreground/50 uppercase tracking-wider mb-1">
          Composição do lance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5">
          <label className="block">
            <span className="text-[9px] font-medium text-foreground/50">Lance próprio (R$)</span>
            <input type="number" min="0" step="1000" className="input py-0.5 mt-0 w-full text-xs h-7"
              value={form.own} onChange={(e) => set("own", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[9px] font-medium text-foreground/50 flex items-center gap-1">
              FGTS (R$)
              <span className="relative group">
                <span className="cursor-help text-[var(--orange)] text-[9px] font-bold">?</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-[var(--ink)] text-white text-[11px] leading-relaxed p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  As regras para uso do FGTS variam. Consulte sua administradora para confirmar se o seu grupo permite essa modalidade.
                </span>
              </span>
            </span>
            <input type="number" min="0" step="1000" className="input py-0.5 mt-0 w-full text-xs h-7"
              value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
          </label>
          <label className="block col-span-2">
            <span className="text-[9px] font-medium text-foreground/50">Lance embutido (R$)</span>
            <input type="number" min="0" step="1000" className="input py-0.5 mt-0 w-full text-xs h-7"
              value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
            <span className="text-[8px] text-foreground/30 mt-0 block leading-none">Reduz a carta líquida</span>
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
        className="w-full rounded-full bg-[var(--orange)] text-white py-2 text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Analisar contemplação"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-4">
      {/* KPIs — grid 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiCard label="Força de lance" value={formatPct(result.forcePct)}
          hint="Base: carta atualizada" tone={forceTone(result.forcePct)} />
        <KpiCard label="Lance total" value={brl(result.totalLance)}
          hint="Próprio + FGTS + embutido" tone="orange" />
        <KpiCard label="Carta líquida" value={brl(result.creditLiquid)}
          hint="Carta menos lance embutido" tone={liquidTone(result.creditLiquid, result.credit)} />
        <KpiCard label="Parcela pós-lance" value={brlc(result.postLanceInstallment)}
          hint="1ª parcela aproximada após o lance" tone="default" />
      </div>

      {/* Diagnóstico do Lance */}
      <div className="rounded-xl border border-[var(--orange)]/30 bg-[var(--orange)]/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs mb-1">Diagnóstico do lance</h3>
            <p className="text-[11px] leading-relaxed text-foreground/70">
              Seu lance representa {formatPct(result.forcePct)} da carta. Desse total, {brl(result.own + result.fgts)} saem do seu patrimônio e {brl(result.embedded)} serão abatidos diretamente do crédito. Após a contemplação, sua parcela cai para aproximadamente {brlc(result.postLanceInstallment)}. Antes de decidir, compare esse esforço financeiro com outras alternativas disponíveis.
            </p>
          </div>
        </div>
      </div>

      {/* Leitura técnica */}
      <div className="space-y-3">
        <MeaningBlock title="ESTRUTURA DA OPERAÇÃO">
          <CalcMemory title="RESUMO DA OPERAÇÃO">
            <table className="w-full text-[10px]">
              <thead className="text-foreground/40 border-b border-border">
                <tr>
                  <th className="pb-1 text-left font-semibold uppercase tracking-wider">Item</th>
                  <th className="pb-1 text-right font-semibold uppercase tracking-wider">Valor</th>
                  <th className="pb-1 text-left font-semibold uppercase tracking-wider pl-4">Leitura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {result.summaryRows.map((r, i) => (
                  <tr key={i}>
                    <td className="py-1.5 font-bold text-foreground/80">{r.item}</td>
                    <td className="py-1.5 text-right font-mono font-bold">{r.value}</td>
                    <td className="py-1.5 pl-4 text-foreground/50 leading-snug">{r.read}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CalcMemory>
        </MeaningBlock>

        <Collapsible title="Como essa projeção foi construída" open={false}>
          <MethodologyBlock title="METODOLOGIA">
            <p className="text-[11px] text-foreground/70 leading-relaxed">
              Esta simulação considera o lance aplicado exatamente no mês {form.paidMonths}, com reajuste de {form.adjRate}% {form.adjEvery === "6" ? "semestral" : "anual"}. O saldo devedor é recalculado imediatamente após o abatimento do lance, e a nova parcela é projetada com base no prazo remanescente.
            </p>
          </MethodologyBlock>
        </Collapsible>

        <TransparencyBlock />

        {/* CTAs Lado a Lado - Alinhados à Direita */}
        <div className="flex flex-col sm:flex-row-reverse items-center justify-start gap-3 pt-2">
          {/* CTA Especialista */}
          <div className="w-full sm:w-[280px] bg-white rounded-xl border border-border p-3 flex flex-col gap-2 shadow-sm">
            <div className="flex flex-col gap-1">
              <h4 className="text-[11px] font-bold text-foreground leading-tight">Quer interpretar esses números?</h4>
              <p className="text-[10px] text-foreground/50 leading-tight">Eu posso analisar sua proposta com você e mostrar onde estão os principais impactos.</p>
            </div>
            <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" 
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[var(--orange)] text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-md active:scale-95">
              <Instagram className="w-3 h-3" />
              Pedir uma análise individual
            </a>
          </div>

          {/* Botão PDF */}
          <button 
            onClick={handlePdf}
            disabled={pdfLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-border bg-white hover:bg-secondary/20 text-[11px] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            {pdfLoading ? "Gerando..." : "Baixar Relatório de Auditoria (PDF)"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ── Tabela de Evolução Centralizada ──
  const scheduleTable = result ? (
    <div className="space-y-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Evolução das parcelas</h3>
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead className="bg-[var(--ink)] text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-white/70 w-16">Mês</th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-white/70">Carta</th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-white/70">Evento</th>
                <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-white/70 w-24">Lance</th>
                <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-white/70">Parcela</th>
                <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-white/70">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {(expanded ? result.projection.rows : result.projection.rows.slice(0, 13)).map((r) => (
                <tr key={r.month} className={`transition-colors hover:bg-secondary/20 ${r.event === "Lance aplicado" ? "bg-orange-100/90 font-bold border-y-2 border-[var(--orange)]/30" : ""}`}>
                  <td className="px-3 py-2 font-mono">{r.month}</td>
                  <td className="px-3 py-2 font-mono">{brl(r.credit)}</td>
                  <td className="px-3 py-2 font-medium">
                    {r.event === "Lance aplicado" ? (
                      <span className="text-[var(--orange)] flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        {r.event}
                      </span>
                    ) : r.event}
                  </td>
                  <td className="px-3 py-2 text-right font-mono w-24">{r.lance > 0 ? brl(r.lance) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-[var(--orange)]">{r.projected > 0 ? brl(r.projected) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono">{brl(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.projection.rows.length > 13 && (
          <button onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[var(--orange)] bg-secondary/10 hover:bg-secondary/30 border-t border-border transition-all">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Recolher parcelas" : `Ver todas as ${result.projection.rows.length} parcelas`}
          </button>
        )}
      </div>
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={2}
      title="Raio-X do Lance"
      description="Seu lance compra contemplação. Ou compra frustração."
      descriptionSupport="Antes de colocar dinheiro na mesa, descubra quanto ele realmente aumenta sua chance de contemplação, quanto reduz seu crédito e qual será o impacto financeiro depois da assembleia."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
      scheduleTable={scheduleTable}
    />
  );
}
