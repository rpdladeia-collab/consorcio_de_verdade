/**
 * Módulo 6 — Auto Pagável?
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: fiel ao HTML original (runAutoPayable)
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { ImportToggle } from "@/components/cdv/ImportToggle";
import {
  KpiCard, TransparencyBlock, ConsultCTA, PdfButton,
  CalcMemory, MethodologyBlock, MeaningBlock, Collapsible,
  formatBRL,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";

function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }
function brl(v: number) { return formatBRL(v); }
function pct2(v: number) {
  return `${(Number.isFinite(v) ? v : 0).toFixed(2).replace(".", ",")}%`;
}

type Mode = "linear" | "nonlinear";

interface FormState {
  credit: string; term: string; adminRate: string; reserveRate: string;
  appreciation: string; annualReturn: string;
  initial: string; budget: string; contMonth: string;
  own: string; embedded: string; rent: string;
  mode: Mode; ranges: string;
}

const DEFAULT: FormState = {
  credit: "300000", term: "120", adminRate: "16", reserveRate: "2",
  appreciation: "5", annualReturn: "10",
  initial: "60000", budget: "0", contMonth: "18",
  own: "60000", embedded: "60000", rent: "2200",
  mode: "linear", ranges: "",
};

export default function SimuladorAutoPagavel() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { baseParams, hasData } = useSimuladorStore();
  const [importEnabled, setImportEnabled] = useState(hasData);

  useEffect(() => {
    if (importEnabled && baseParams) {
      setForm((prev) => ({
        ...prev,
        credit: String(baseParams.credit),
        term: String(baseParams.term),
        adminRate: String(baseParams.adminRate),
        reserveRate: String(baseParams.reserveRate),
      }));
    } else if (!importEnabled) {
      setForm(DEFAULT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importEnabled]);

  const mutation = trpc.raiox.autoPagavel.useMutation();
  const result = mutation.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      credit: num(form.credit),
      term: parseInt(form.term) || 120,
      adminRate: num(form.adminRate),
      reserveRate: num(form.reserveRate),
      appreciation: num(form.appreciation),
      annualReturn: num(form.annualReturn),
      initial: num(form.initial),
      budget: num(form.budget),
      contMonth: parseInt(form.contMonth) || 18,
      own: num(form.own),
      embedded: num(form.embedded),
      rent: num(form.rent),
      mode: form.mode,
      ranges: form.ranges,
    });
  }

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfAutoPagavel } = await import("@/lib/pdfAutoPagavel");
      await generatePdfAutoPagavel({ ...result, form });
    } catch (err) { console.error("PDF error", err); }
    finally { setPdfLoading(false); }
  }

  // ── Painel esquerdo: formulário ──────────────────────────────────────────
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      <p className="font-semibold text-[13px] sm:text-sm text-foreground/70 uppercase tracking-wider mb-2 sm:mb-3">
        Dados do plano
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <label className="block col-span-2">
          <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Carta de crédito (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-1 w-full text-sm sm:text-base"
            value={form.credit} onChange={(e) => set("credit", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Prazo (meses)</span>
          <input type="number" min="1" max="240" className="input mt-1 w-full text-sm sm:text-base"
            value={form.term} onChange={(e) => set("term", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Taxa adm. (%)</span>
          <input type="number" min="0" step="0.01" className="input mt-1 w-full text-sm sm:text-base"
            value={form.adminRate} onChange={(e) => set("adminRate", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Fundo reserva (%)</span>
          <input type="number" min="0" step="0.01" className="input mt-1 w-full text-sm sm:text-base"
            value={form.reserveRate} onChange={(e) => set("reserveRate", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Mês de contemplação</span>
          <input type="number" min="1" max="240" className="input mt-1 w-full text-sm sm:text-base"
            value={form.contMonth} onChange={(e) => set("contMonth", e.target.value)} />
        </label>
      </div>

      <div className="border-t border-[#DDD6C8] pt-2 sm:pt-3">
        <p className="font-semibold text-[13px] sm:text-sm text-foreground/70 uppercase tracking-wider mb-2 sm:mb-3">
          Lance e renda do bem
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Lance próprio (R$)</span>
            <input type="number" min="0" step="1000" className="input mt-1 w-full text-sm sm:text-base"
              value={form.own} onChange={(e) => set("own", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Lance embutido (R$)</span>
            <input type="number" min="0" step="1000" className="input mt-1 w-full text-sm sm:text-base"
              value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
          </label>
          <label className="block col-span-2">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Renda mensal do bem (R$)</span>
            <input type="number" min="0" step="100" className="input mt-1 w-full text-sm sm:text-base"
              value={form.rent} onChange={(e) => set("rent", e.target.value)} />
            <span className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5 block">Aluguel ou renda gerada pelo bem após contemplação</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[#DDD6C8] pt-2 sm:pt-3">
        <p className="font-semibold text-[13px] sm:text-sm text-foreground/70 uppercase tracking-wider mb-2 sm:mb-3">
          Cenário de investimento
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Capital inicial (R$)</span>
            <input type="number" min="0" step="1000" className="input mt-1 w-full text-sm sm:text-base"
              value={form.initial} onChange={(e) => set("initial", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Aporte mensal (R$)</span>
            <input type="number" min="0" step="100" className="input mt-1 w-full text-sm sm:text-base"
              value={form.budget} onChange={(e) => set("budget", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Rentabilidade (% a.a.)</span>
            <input type="number" min="0" step="0.1" className="input mt-1 w-full text-sm sm:text-base"
              value={form.annualReturn} onChange={(e) => set("annualReturn", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Valorização do bem (% a.a.)</span>
            <input type="number" min="0" step="0.1" className="input mt-1 w-full text-sm sm:text-base"
              value={form.appreciation} onChange={(e) => set("appreciation", e.target.value)} />
          </label>
        </div>
      </div>

      <Collapsible title="Parâmetros avançados" subtitle="Modelo de parcela"
        open={advancedOpen} onToggle={() => setAdvancedOpen(!advancedOpen)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="block col-span-2">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Modelo de parcela</span>
            <select className="input mt-1 w-full text-sm sm:text-base" value={form.mode}
              onChange={(e) => set("mode", e.target.value as Mode)}>
              <option value="linear">Linear (padrão)</option>
              <option value="nonlinear">Não linear (faixas)</option>
            </select>
          </label>
          {form.mode === "nonlinear" && (
            <label className="block col-span-2">
              <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Faixas</span>
              <textarea className="input mt-1 w-full h-20 font-mono text-xs"
                placeholder={"1-12: 2500\n13-60: 3200"} value={form.ranges}
                onChange={(e) => set("ranges", e.target.value)} />
            </label>
          )}
        </div>
      </Collapsible>

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Analisar auto pagável"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <KpiCard label="Cobertura da parcela" value={pct2(result.kpis.coverage)}
          hint="Renda do bem / parcela média pós-contemplação"
          tone={result.kpis.coverageCls === "green" ? "positive" : result.kpis.coverageCls === "yellow" ? "orange" : "negative"} />
        <KpiCard label="Compra via investimento"
          value={result.kpis.investedPurchaseMonth !== null
            ? `Mês ${result.kpis.investedPurchaseMonth}`
            : "Não alcança"}
          hint="Mês em que o capital acumulado alcança o bem"
          tone={result.kpis.investedPurchaseMonth !== null ? "positive" : "negative"} />
        <KpiCard label="Patrimônio final consórcio" value={brl(result.kpis.finalCons)}
          hint="Bem − extras acumulados ao final do prazo" tone="positive" />
        <KpiCard label="Patrimônio final investimento" value={brl(result.kpis.finalInv)}
          hint="Capital investido + bem comprado no futuro" tone="orange" />
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="rounded-lg sm:rounded-xl border border-orange-200 bg-orange-50 p-2 sm:p-3 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            Avisos do motor de cálculo
          </p>
          {result.warnings.map((w, i) => (
            <p key={i} className="text-[10px] sm:text-xs text-orange-800">⚠ {w}</p>
          ))}
        </div>
      )}

      {/* Readboxes */}
      <div className="space-y-2 sm:space-y-3">
        {result.readboxes.map((rb, i) => (
          <MeaningBlock key={i} label={rb.title}>
            <p className="whitespace-pre-line">{rb.body}</p>
          </MeaningBlock>
        ))}
      </div>

      {/* Tabela de comparação de patrimônio */}
      <div className="rounded-lg sm:rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setTableOpen(!tableOpen)}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-card hover:bg-secondary/30 transition-colors text-[13px] sm:text-sm font-semibold"
        >
          <span>Ver tabela de patrimônio ({result.table.length} meses)</span>
          <span className={`transition-transform duration-200 ${tableOpen ? "rotate-180" : ""}`}>▼</span>
        </button>
        {tableOpen && (
          <div className="w-full overflow-x-auto -mx-3 px-3">
            <div className="max-h-[480px] overflow-y-auto -mx-3 px-3">
            <table className="w-full text-[8px] sm:text-xs min-w-[900px]">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-1 sm:px-1.5 py-1 text-left font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Mês</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Objetivo</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Parcela</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Renda bem</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Reserva cons.</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Extra acum.</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Bem (inv.)</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Patrim. inv.</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right font-semibold uppercase tracking-wider text-white/70 text-[8px] sm:text-[9px]">Patrim. cons.</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 font-mono text-[10px] sm:text-xs">{row.month}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[10px] sm:text-xs">{row.objective}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[10px] sm:text-xs">{row.parcel}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[10px] sm:text-xs">{row.income}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[10px] sm:text-xs">{row.consReserve}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[10px] sm:text-xs">{row.extras}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[10px] sm:text-xs">{row.invAsset}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono font-bold text-[10px] sm:text-xs">{row.patrimonioInv}</td>
                    <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono font-bold text-[10px] sm:text-xs">{row.patrimonioCons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Memória de cálculo */}
      <CalcMemory rows={[
        { label: "Cobertura da parcela", value: pct2(result.kpis.coverage),
          formula: "renda mensal do bem / parcela média pós-contemplação × 100" },
        { label: "Patrimônio consórcio", value: brl(result.kpis.finalCons),
          formula: "reserva + bem valorizado − extras acumulados" },
        { label: "Patrimônio investimento", value: brl(result.kpis.finalInv),
          formula: "capital composto + bem comprado no futuro" },
        { label: "Diferença patrimonial", value: brl(result.diff),
          formula: "patrimônio consórcio − patrimônio investimento" },
      ]} />

      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (runAutoPayable).",
        "Cenário consórcio: bem contemplado com lance, renda cobre parcelas, extras acumulados.",
        "Cenário investimento: capital aplicado a juros compostos, bem comprado quando o montante alcança o objetivo.",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC).",
      ]} />

      <TransparencyBlock />

      <div className="flex flex-wrap gap-3">
        <PdfButton onClick={handlePdf} loading={pdfLoading} />
      </div>
      <ConsultCTA context="a análise de auto pagável" />
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={6}
      title="Auto Pagável?"
      description="A projeção matemática demonstra se a renda gerada pelo bem contemplado é capaz de cobrir as parcelas restantes do consórcio."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
