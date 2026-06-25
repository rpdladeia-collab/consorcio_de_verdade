/**
 * Módulo 3 — Custo da Operação
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: fiel ao HTML original (runOperationCost)
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
          <span className="text-xs font-medium text-foreground/60">Prazo (meses)</span>
          <input type="number" min="1" max="240" className="input mt-1 w-full"
            value={form.term} onChange={(e) => set("term", e.target.value)} />
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
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Seguro (% saldo/mês)</span>
          <input type="number" min="0" step="0.001" className="input mt-1 w-full"
            value={form.insuranceRate} onChange={(e) => set("insuranceRate", e.target.value)} />
          <span className="text-[10px] text-foreground/40 mt-0.5 block">Use 0 se já embutido na parcela</span>
        </label>
      </div>

      <Collapsible title="Parâmetros avançados" subtitle="Correção e modelo de parcela"
        open={advancedOpen} onToggle={() => setAdvancedOpen(!advancedOpen)}>
        <div className="grid grid-cols-2 gap-3 pt-2">
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
        {mutation.isPending ? "Calculando…" : "Analisar custo da operação"}
      </button>
    </form>
  );

  const resultsPanel = result ? (
    <div className="space-y-6">
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
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Taxa adm. contratual" value={brl(result.kpis.contractualAdmin)}
          hint="16% sobre a carta inicial" tone="default" />
        <KpiCard label="Adm. sobre correções" value={brl(result.kpis.adminCorrection)}
          hint="Custo adicional projetado" tone="orange" />
        <KpiCard label="Seguro projetado" value={brl(result.kpis.projectedInsurance)}
          hint="Total ao longo do prazo" tone="default" />
        <KpiCard label="Custo explícito total" value={brl(result.kpis.explicitCost)}
          hint="Adm. projetada + seguro" highlight={true} />
      </div>

      {/* Leitura técnica — readboxes do HTML */}
      <div className="space-y-3">
        {result.readboxes.map((rb, i) => (
          <MeaningBlock key={i}>
            <p className="font-semibold text-sm mb-1">{rb.title}</p>
            <p className="whitespace-pre-line">{rb.body}</p>
          </MeaningBlock>
        ))}
      </div>

      {/* Tabela de classificação econômica */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Classificação econômica dos componentes
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--ink)] text-white">
                <th className="px-3 py-2.5 text-left font-semibold">Componente</th>
                <th className="px-3 py-2.5 text-right font-semibold">Valor</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden lg:table-cell">Classificação</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden xl:table-cell">Leitura</th>
              </tr>
            </thead>
            <tbody>
              {result.classificationTable.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                  <td className="px-3 py-2 font-medium text-sm">{row.item}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-semibold">{row.value}</td>
                  <td className="px-3 py-2 text-foreground/55 text-xs hidden lg:table-cell">{row.classification}</td>
                  <td className="px-3 py-2 text-foreground/45 text-xs hidden xl:table-cell">{row.reading}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de fluxo mensal — accordion com scroll interno */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setTableOpen(!tableOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors text-sm font-semibold"
        >
          <span>Ver fluxo mensal completo</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${tableOpen ? "rotate-180" : ""}`} />
        </button>
        {tableOpen && (
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-3 py-2.5 text-left">Mês</th>
                  <th className="px-3 py-2.5 text-right">Carta</th>
                  <th className="px-3 py-2.5 text-right">Parcela</th>
                  <th className="px-3 py-2.5 text-right">Seguro</th>
                  <th className="px-3 py-2.5 text-right">Saldo</th>
                  <th className="px-3 py-2.5 text-left">Evento</th>
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
                      <td className="px-3 py-1.5 font-mono">{row.month}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{brl(row.credit)}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">{brlc(row.installment)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{brlc(row.insurance)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{brl(row.balance)}</td>
                      <td className="px-3 py-1.5 text-foreground/55">{row.tags?.join(", ") || ""}</td>
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
        { label: "Taxa adm. contratual", value: brl(result.kpis.contractualAdmin),
          formula: `${brl(result.rows[0]?.credit ?? 0)} × taxa adm.` },
        { label: "Adm. sobre correções", value: brl(result.kpis.adminCorrection),
          formula: "taxa adm. aplicada sobre o delta de correção acumulado" },
        { label: "Seguro projetado", value: brl(result.kpis.projectedInsurance),
          formula: "% seguro × saldo pós-parcela, acumulado no prazo" },
        { label: "Custo explícito total", value: brl(result.kpis.explicitCost),
          formula: "adm. projetada + seguro projetado" },
        { label: "Total pago nominal", value: brl(result.totalPaidNominal),
          formula: "soma de todas as parcelas projetadas" },
      ]} />

      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (runOperationCost).",
        "Custo explícito: taxa de administração projetada + seguro informado separadamente.",
        "Correção do fundo comum não é tratada como custo isolado (atualiza carta e obrigação).",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC), não acessível ao navegador.",
      ]} />

      <TransparencyBlock />

      <div className="flex flex-wrap gap-3">
        <PdfButton onClick={handlePdf} loading={pdfLoading} />
      </div>
      <ConsultCTA context="a análise de custo da operação" />
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={3}
      title="Custo da Operação"
      description="Identifique o custo explícito da operação: taxa de administração projetada e seguro. Entenda o que é custo real e o que é atualização monetária."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
