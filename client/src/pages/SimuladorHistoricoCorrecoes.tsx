/**
 * Módulo 5 — Histórico de Correções
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: fiel ao HTML original (runCorrections)
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { ImportToggle } from "@/components/cdv/ImportToggle";
import {
  KpiCard, TransparencyBlock, ConsultCTA, PdfButton,
  CalcMemory, MethodologyBlock, Collapsible,
  formatBRL, formatBRLCents,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";

function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }
function brl(v: number) { return formatBRL(v); }

type AdjEvery = "0" | "6" | "12";
type Mode = "linear" | "nonlinear";

interface FormState {
  credit: string; term: string; adminRate: string; reserveRate: string;
  insuranceRate: string; adjRate: string; adjEvery: AdjEvery; mode: Mode; ranges: string;
}

const DEFAULT: FormState = {
  credit: "300000", term: "120", adminRate: "16", reserveRate: "2",
  insuranceRate: "0.035", adjRate: "5", adjEvery: "12", mode: "linear", ranges: "",
};

export default function SimuladorHistoricoCorrecoes() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [advancedOpen, setAdvancedOpen] = useState(false);
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

  const mutation = trpc.raiox.historicoCorrecoes.useMutation();
  const result = mutation.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      credit: num(form.credit), term: parseInt(form.term) || 120,
      adminRate: num(form.adminRate), reserveRate: num(form.reserveRate),
      insuranceRate: num(form.insuranceRate), adjRate: num(form.adjRate),
      adjEvery: form.adjEvery, mode: form.mode, ranges: form.ranges,
    });
  }

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfHistoricoCorrecoes } = await import("@/lib/pdfHistoricoCorrecoes");
      await generatePdfHistoricoCorrecoes({ ...result, form });
    } catch (err) { console.error("PDF error", err); }
    finally { setPdfLoading(false); }
  }

  // ── Painel esquerdo: formulário ──────────────────────────────────────────
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      <p className="font-semibold text-sm text-foreground/70 uppercase tracking-wider mb-3">
        Dados do plano
      </p>
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
        </label>
      </div>

      <Collapsible title="Parâmetros de correção" subtitle="Índice e periodicidade"
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
        {mutation.isPending ? "Calculando…" : "Projetar histórico de correções"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiCard label="Carta inicial" value={brl(result.kpis.creditInicial)}
          hint="Carta de crédito no início do plano" tone="default" />
        <KpiCard label="Carta final projetada" value={brl(result.kpis.creditFinal)}
          hint="Carta após todos os reajustes projetados" tone="positive" />
        <KpiCard label="Correção acumulada" value={brl(result.kpis.correcaoAcumulada)}
          hint="Total de reajuste monetário projetado" tone="orange" />
        <KpiCard label="Total pago projetado" value={brl(result.kpis.totalPago)}
          hint="Soma de todas as parcelas no prazo" tone="default" />
      </div>

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

      {/* Tabela anual */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Tabela anual de correções
        </p>
        <div className="rounded-xl border border-border">
          <div className="w-full overflow-x-auto">
            <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-3 py-2.5 text-left">Ano</th>
                  <th className="px-3 py-2.5 text-right">Carta final</th>
                  <th className="px-3 py-2.5 text-right">Saldo final</th>
                  <th className="px-3 py-2.5 text-right">Correção no ano</th>
                  <th className="px-3 py-2.5 text-right">Correção acum.</th>
                  <th className="px-3 py-2.5 text-right">Pago no ano</th>
                  <th className="px-3 py-2.5 text-right">Parcela média</th>
                  <th className="px-3 py-2.5 text-left">Eventos</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyTable.map((row, i) => (
                  <tr key={i} className={
                    row.events ? "bg-amber-50/60" : i % 2 === 0 ? "bg-card" : "bg-secondary/20"
                  }>
                    <td className="px-3 py-1.5 font-mono font-bold">{row.year}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.creditEndOfYear}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.balanceEndOfYear}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.correctionInYear}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.correctionAccum}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.paidInYear}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.avgInstallment}</td>
                    <td className="px-3 py-1.5 text-foreground/55">{row.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {/* Memória de cálculo */}
      <CalcMemory rows={[
        { label: "Carta inicial", value: brl(result.kpis.creditInicial),
          formula: "carta de crédito informada" },
        { label: "Carta final projetada", value: brl(result.kpis.creditFinal),
          formula: `carta × (1 + ${form.adjRate}%)^n_reajustes` },
        { label: "Correção acumulada", value: brl(result.kpis.correcaoAcumulada),
          formula: "carta final − carta inicial" },
        { label: "Total pago projetado", value: brl(result.kpis.totalPago),
          formula: "soma de todas as parcelas no prazo" },
      ]} />

      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (runCorrections).",
        "Correção aplicada no mês 13 e a cada periodicidade informada (6 ou 12 meses).",
        "Tabela agrupa os dados mensais por ano civil do plano.",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC).",
      ]} />

      <TransparencyBlock />

      <div className="flex flex-wrap gap-3">
        <PdfButton onClick={handlePdf} loading={pdfLoading} />
      </div>
      <ConsultCTA context="a projeção de correções" />
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={5}
      title="Histórico de Correções"
      description="A projeção matemática demonstra como a carta de crédito e as parcelas evoluem ao longo do prazo com os reajustes contratuais."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
