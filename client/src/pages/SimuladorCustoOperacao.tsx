/**
 * Módulo 3 — Custo da Operação
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: fiel ao HTML original (runOperationCost)
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

function brl(v: number) { return formatBRL(v); }
function brlc(v: number) { return formatBRLCents(v); }
function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }

type AdjEvery = "0" | "6" | "12";
type Mode = "linear" | "nonlinear";

interface FormState {
  credit: string; term: string; adminRate: string; reserveRate: string;
  insuranceRate: string; adjRate: string; adjEvery: AdjEvery; mode: Mode; ranges: string;
}

const DEFAULT: FormState = {
  credit: "300000", term: "120", adminRate: "16", reserveRate: "2",
  insuranceRate: "0", adjRate: "5", adjEvery: "12", mode: "linear", ranges: "",
};

export default function SimuladorCustoOperacao() {
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
        insuranceRate: String(baseParams.insuranceRate),
        adjRate: String(baseParams.adjRate),
        adjEvery: (String(baseParams.adjEvery) as "0" | "6" | "12"),
        mode: baseParams.mode as "linear" | "nonlinear",
      }));
    } else if (!importEnabled) {
      setForm(DEFAULT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importEnabled]);

  const mutation = trpc.raiox.custoOperacao.useMutation();
  const result = mutation.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      credit: num(form.credit), term: parseInt(form.term) || 120,
      adminRate: num(form.adminRate), reserveRate: num(form.reserveRate),
      insuranceRate: num(form.insuranceRate),
      adjRate: num(form.adjRate), adjEvery: form.adjEvery,
      mode: form.mode, ranges: form.ranges,
    });
  }

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfCustoOperacao } = await import("@/lib/pdfCustoOperacao");
      await generatePdfCustoOperacao({ ...result, form });
    } catch (err) { console.error("PDF error", err); }
    finally { setPdfLoading(false); }
  }

  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
      <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      <p className="font-semibold text-xs text-foreground/70 uppercase tracking-wider mb-2">
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
          <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Seguro (% saldo/mês)</span>
          <input type="number" min="0" step="0.001" className="input mt-1 w-full text-sm sm:text-base"
            value={form.insuranceRate} onChange={(e) => set("insuranceRate", e.target.value)} />
          <span className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5 block">Use 0 se já embutido na parcela</span>
        </label>
      </div>

      <Collapsible title="Parâmetros avançados" subtitle="Correção e modelo de parcela"
        open={advancedOpen} onToggle={() => setAdvancedOpen(!advancedOpen)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Correção (% a.a.)</span>
            <input type="number" min="0" step="0.1" className="input mt-1 w-full text-sm sm:text-base"
              value={form.adjRate} onChange={(e) => set("adjRate", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] sm:text-xs font-medium text-foreground/60">Periodicidade</span>
            <select className="input mt-1 w-full text-sm sm:text-base" value={form.adjEvery}
              onChange={(e) => set("adjEvery", e.target.value as AdjEvery)}>
              <option value="0">Sem correção</option>
              <option value="6">Semestral</option>
              <option value="12">Anual</option>
            </select>
          </label>
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
        className="w-full rounded-full bg-[var(--orange)] text-white py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Analisar custo da operação"}
      </button>

      {/* Botões explicativos — aparecem após análise */}
      {result && (
        <div className="space-y-2 sm:space-y-2.5 pt-2 border-t border-border/50">
          {result.readboxes.map((rb, i) => (
            <div key={i} className="rounded-lg sm:rounded-xl overflow-hidden border border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const content = e.currentTarget.nextElementSibling;
                  if (content) {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="w-full flex items-center justify-between bg-[var(--ink)] px-5 py-3.5 text-left hover:bg-[var(--ink)]/90 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-yellow-400 shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-yellow-400">{rb.title}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/40 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div style={{display: 'none'}} className="bg-[var(--ink)] px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-white/70 leading-relaxed text-[13px] space-y-2 border-t border-white/10">
                <p className="whitespace-pre-line">{rb.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card de interpretação — aparece após análise */}
      {result && (
        <div className="space-y-2 pt-2">
          <div className="rounded-lg sm:rounded-xl border border-border bg-card py-2 sm:py-3 px-3 sm:px-4">
            <p className="font-semibold text-[11px] sm:text-xs">Quer interpretar esses números?</p>
            <p className="text-[10px] sm:text-[11px] text-foreground/60 mt-0.5">Eu posso analisar sua proposta com você e mostrar onde estão os principais impactos.</p>
            <button className="mt-2 sm:mt-3 w-full rounded-full bg-[var(--orange)] text-white py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all">
              Pedir uma análise individual
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <PdfButton onClick={handlePdf} loading={pdfLoading} />
          </div>
        </div>
      )}
    </form>
  );

  const resultsPanel = result ? (
    <div className="space-y-3 sm:space-y-6">
      {result.warnings.length > 0 && (
        <div className="rounded-lg sm:rounded-xl border border-orange-200 bg-orange-50 p-3 sm:p-4 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            Avisos do motor de cálculo
          </p>
          {result.warnings.map((w, i) => (
            <p key={i} className="text-[13px] sm:text-sm text-orange-800">⚠ {w}</p>
          ))}
        </div>
      )}

      {/* KPIs — grid 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <KpiCard label="Taxa adm. contratual" value={brl(result.kpis.contractualAdmin)}
          hint="16% sobre a carta inicial" tone="default" />
        <KpiCard label="Adm. sobre correções" value={brl(result.kpis.adminCorrection)}
          hint="Custo adicional projetado" tone="orange" />
        <KpiCard label="Seguro projetado" value={brl(result.kpis.projectedInsurance)}
          hint="Total ao longo do prazo" tone="default" />
        <KpiCard label="Quanto custa contratar o crédito" value={brl(result.kpis.explicitCost)}
          hint="Adm. projetada + seguro" highlight={true} />
      </div>

      {/* Frase de impacto */}
      <div className="mb-1.5 sm:mb-2">
        <h3 className="text-[13px] sm:text-sm font-bold text-foreground mb-1">O número que quase ninguém mostra</h3>
        <p className="text-[11px] sm:text-xs text-foreground/70">A parcela mensal pode parecer simples. O custo acumulado conta outra história.</p>
      </div>

      {/* Tabela de classificação econômica */}
      <div>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1.5 sm:mb-2">
          Classificação econômica dos componentes
        </p>
        <div className="rounded-lg sm:rounded-xl border border-border">
          <div className="w-full overflow-x-auto">
          <table className="w-full text-[8px] sm:text-[10px] min-w-[480px]">
            <thead>
              <tr className="bg-[var(--ink)] text-white">
                <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-left font-semibold whitespace-nowrap text-[7px] sm:text-[10px]">Componente</th>
                <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-semibold text-[7px] sm:text-[10px]">Valor</th>
                <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-left font-semibold hidden lg:table-cell text-[7px] sm:text-[10px]">Classificação</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden xl:table-cell text-[7px] sm:text-[10px]">Leitura</th>
              </tr>
            </thead>
            <tbody>
              {result.classificationTable.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                  <td className="px-1 sm:px-2 py-1 sm:py-1.5 font-medium text-[8px] sm:text-xs">{row.item}</td>
                  <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right font-mono text-[8px] sm:text-xs font-semibold">{row.value}</td>
                  <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-foreground/55 text-[8px] sm:text-[10px] hidden lg:table-cell">{row.classification}</td>
                  <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-foreground/45 text-[8px] sm:text-[10px] hidden xl:table-cell">{row.reading}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Tabela de fluxo mensal — accordion com scroll interno */}
      <div className="rounded-lg sm:rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setTableOpen(!tableOpen)}
          className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 bg-card hover:bg-secondary/30 transition-colors text-[11px] sm:text-xs font-semibold"
        >
          <span>Ver fluxo mensal completo</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${tableOpen ? "rotate-180" : ""}`} />
        </button>
        {tableOpen && (
          <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
            <table className="w-full text-[8px] sm:text-[10px] min-w-[700px]">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-1 sm:px-1.5 py-1 text-left text-[7px] sm:text-[9px]">Mês</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right text-[7px] sm:text-[9px]">Carta</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right text-[7px] sm:text-[9px]">Parcela</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right text-[7px] sm:text-[9px]">Seguro</th>
                  <th className="px-1 sm:px-1.5 py-1 text-right text-[7px] sm:text-[9px]">Saldo</th>
                  <th className="px-1 sm:px-1.5 py-1 text-left text-[7px] sm:text-[9px]">Evento</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => {
                  const isAdj = row.tags?.includes("Reajuste");
                  return (
                    <tr key={i} className={
                      isAdj ? "bg-amber-50/60"
                        : i % 2 === 0 ? "bg-card" : "bg-secondary/20"
                    }>
                      <td className="px-1 sm:px-1.5 py-1 font-mono text-[7px] sm:text-[9px]">{row.month}</td>
                      <td className="px-1 sm:px-1.5 py-1 text-right font-mono text-[7px] sm:text-[9px]">{brl(row.credit)}</td>
                      <td className="px-1 sm:px-1.5 py-1 text-right font-mono font-bold text-[7px] sm:text-[9px]">{brlc(row.installment)}</td>
                      <td className="px-1 sm:px-1.5 py-1 text-right font-mono text-[7px] sm:text-[9px]">{brlc(row.insurance)}</td>
                      <td className="px-1 sm:px-1.5 py-1 text-right font-mono text-[7px] sm:text-[9px]">{brl(row.balance)}</td>
                      <td className="px-1 sm:px-1.5 py-1 text-left text-[7px] sm:text-[9px] text-foreground/55">{row.tags?.join(", ") || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="w-full">
        <TransparencyBlock />
      </div>
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={3}
      title="Raio-X do Custo Total"
      description={<span className="text-[var(--orange)]">Consórcio não tem juros, mas tem correção e isso muda tudo !!</span>}
      descriptionSupport="Veja o custo real da operação, separando taxa, seguro, fundo de reserva e correções para entender o que você está pagando e o que é apenas atualização monetária."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
