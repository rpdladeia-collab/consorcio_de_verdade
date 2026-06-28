/**
 * Módulo 1 — Raio-X da Parcela
 * Layout: RaioXLayout (grid 2 colunas — inputs esquerda / KPIs+resultados direita)
 * Matemática: fiel ao HTML original (buildSchedule)
 */

import { useState } from "react";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
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
import RaioXLayout from "@/components/cdv/RaioXLayout";

/* ─── Tipos ─────────────────────────────────────────────────────────────────── */
type AdjEvery = "0" | "6" | "12";
type Mode = "linear" | "nonlinear";

interface FormState {
  credit: string; term: string; adminRate: string; reserveRate: string;
  insuranceRate: string; adjRate: string; adjEvery: AdjEvery; mode: Mode; ranges: string;
}

type ScheduleRow = {
  month: number; credit: number; opening: number; fc: number; ta: number;
  fr: number; insurance: number; installment: number; paidTotal: number;
  balance: number; tags: string[];
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function num(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}

function FieldRow({ label, hint, children }: { label: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/60 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-foreground/40 mt-0.5">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, suffix }: {
  value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string;
}) {
  return (
    <div className="relative">
      <input type="text" inputMode="decimal" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] pr-9"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/40 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ─── Tabela de fluxo ────────────────────────────────────────────────────────── */
function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, 24);

  return (
    <div className="rounded-xl border border-border">
      <div className="w-full overflow-x-auto">
        <div className="max-h-[480px] overflow-y-auto">
        <table className="w-full text-xs min-w-[760px]">
          <thead className="sticky top-0 bg-[var(--ink)] text-white">
            <tr>
              {["Mês","Carta","Saldo inicial","F. Comum","T. Adm.","F. Reserva","Seguro","Parcela","Pago acum.","Saldo final","Eventos"].map((h) => (
                <th key={h} className="px-2.5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap text-white/70">
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
                <tr key={r.month} className={`border-t border-border transition-colors ${
                  isAdj ? "bg-amber-50/70" : "hover:bg-secondary/40"
                }`}>
                  <td className="px-2.5 py-2 font-mono font-medium">{r.month}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRL(r.credit)}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRL(r.opening)}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRLCents(r.fc)}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRLCents(r.ta)}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRLCents(r.fr)}</td>
                  <td className="px-2.5 py-2 font-mono">{r.insurance > 0.005 ? formatBRLCents(r.insurance) : "—"}</td>
                  <td className="px-2.5 py-2 font-mono font-bold text-[var(--orange)]">{formatBRLCents(r.installment)}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRL(r.paidTotal)}</td>
                  <td className="px-2.5 py-2 font-mono">{formatBRL(r.balance)}</td>
                  <td className="px-2.5 py-2">
                    {isAdj && <span className="text-[var(--orange)] font-medium">● Reajuste</span>}
                    {isExcess && <span className="text-destructive font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Excesso</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
      {rows.length > 24 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-foreground/50 hover:text-[var(--orange)] border-t border-border transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Recolher" : `Ver todos os ${rows.length} meses`}
        </button>
      )}
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────────── */
export default function SimuladorSimulePlano() {
  const [form, setForm] = useState<FormState>({
    credit: "300000", term: "120", adminRate: "16", reserveRate: "2",
    insuranceRate: "0", adjRate: "5", adjEvery: "12", mode: "linear", ranges: "",
  });

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const saveBaseParams = useSimuladorStore((s) => s.saveBaseParams);

  const mutation = trpc.raiox.simulePlano.useMutation({
    onSuccess: () => {
      saveBaseParams({
        credit: num(form.credit),
        term: Math.round(num(form.term)),
        adminRate: num(form.adminRate),
        reserveRate: num(form.reserveRate),
        insuranceRate: num(form.insuranceRate),
        adjRate: num(form.adjRate),
        adjEvery: Number(form.adjEvery),
        mode: form.mode,
      });
    },
    onError: (err) => toast.error(err.message || "Erro ao calcular. Tente novamente."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const credit = num(form.credit);
    const term = Math.round(num(form.term));
    if (credit <= 0) return toast.error("Informe um valor de carta maior que zero.");
    if (term < 1 || term > 240) return toast.error("Prazo deve estar entre 1 e 240 meses.");
    mutation.mutate({
      credit, term, adminRate: num(form.adminRate), reserveRate: num(form.reserveRate),
      insuranceRate: num(form.insuranceRate), adjRate: num(form.adjRate),
      adjEvery: form.adjEvery, mode: form.mode, ranges: form.ranges,
    });
  }

  const result = mutation.data;
  const first = result?.rows[0]?.installment ?? 0;
  const maxInstallment = result ? Math.max(...result.rows.map((r) => r.installment)) : 0;

  // ── Painel esquerdo: formulário ──────────────────────────────────────────
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <p className="font-semibold text-sm text-foreground/70 uppercase tracking-wider mb-3">
        Parâmetros do plano
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldRow label="Carta de crédito (R$)" hint="Valor nominal contratado">
          <TextInput value={form.credit} onChange={set("credit")} placeholder="300000" suffix="R$" />
        </FieldRow>
        <FieldRow label="Prazo (meses)" hint="1 a 240 meses">
          <TextInput value={form.term} onChange={set("term")} placeholder="120" suffix="meses" />
        </FieldRow>
        <FieldRow label="Taxa adm. (%)" hint="Total sobre a carta">
          <TextInput value={form.adminRate} onChange={set("adminRate")} placeholder="16" suffix="%" />
        </FieldRow>
        <FieldRow label="Fundo reserva (%)" hint="Total sobre a carta">
          <TextInput value={form.reserveRate} onChange={set("reserveRate")} placeholder="2" suffix="%" />
        </FieldRow>
        <FieldRow label="Seguro mensal (%)" hint="0 se já embutido">
          <TextInput value={form.insuranceRate} onChange={set("insuranceRate")} placeholder="0" suffix="%" />
        </FieldRow>
        <FieldRow
          label={
            <span className="flex items-center gap-1.5">
              Correção anual (%)
              <a
                href="https://www.melhorcambio.com/incc"
                target="_blank"
                rel="noreferrer"
                title="Ver índice INCC atualizado"
                className="inline-flex items-center text-[var(--orange)] hover:opacity-70 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </a>
            </span>
          }
          hint="INCC, IPCA etc."
        >
          <TextInput value={form.adjRate} onChange={set("adjRate")} placeholder="5" suffix="%" />
        </FieldRow>
      </div>

      <FieldRow label="Periodicidade do reajuste">
        <select value={form.adjEvery} onChange={(e) => set("adjEvery")(e.target.value as AdjEvery)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]">
          <option value="12">Anual (1º reajuste no mês 13)</option>
          <option value="6">Semestral (1º reajuste no mês 7)</option>
          <option value="0">Sem reajuste</option>
        </select>
      </FieldRow>

      <FieldRow label="Modelo de parcela">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(["linear", "nonlinear"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => set("mode")(m)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                form.mode === m ? "bg-[var(--orange)] text-white" : "bg-background hover:bg-secondary/60"
              }`}>
              {m === "linear" ? "Linear" : "Não linear"}
            </button>
          ))}
        </div>
      </FieldRow>

      {form.mode === "nonlinear" && (
        <FieldRow label="Faixas não lineares" hint='Ex: "1-12: 2500". Uma por linha.'>
          <textarea value={form.ranges} onChange={(e) => set("ranges")(e.target.value)} rows={4}
            placeholder={"1-12: 2500\n13-24: 2800\n25-120: 3200"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--orange)] resize-y" />
        </FieldRow>
      )}

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-3 text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Simular plano"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-6">
      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {result.warnings.length === 1 ? "Aviso" : "Avisos"}
          </p>
          {result.warnings.map((w, i) => (
            <p key={i} className="text-sm text-orange-800">· {w}</p>
          ))}
        </div>
      )}

      {/* KPIs — grid 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiCard label="1ª parcela" value={formatBRLCents(first)}
          hint="Parcela estimada no mês 1" tone="positive" />
        <KpiCard label="Maior parcela" value={formatBRLCents(maxInstallment)}
          hint="Pressão máxima de caixa" tone="orange" />
        <KpiCard label="Total pago projetado" value={formatBRL(result.paidTotal)}
          hint="Inclui seguro, se informado" highlight />
        <KpiCard label="Saldo final" value={formatBRLCents(result.residual)}
          hint={result.residual > 1 ? "Ajustar faixas não lineares" : "Plano fecha no prazo"}
          tone={result.residual > 1 ? "negative" : "positive"} />
      </div>

      {/* Leitura interpretativa */}
      <MeaningBlock>
        <p>
          A <strong>1ª parcela</strong> é calculada dividindo a obrigação contratual total
          (fundo comum + taxa de administração + fundo de reserva) pelo prazo. Nos meses
          de reajuste, a carta e os saldos são corrigidos pelo índice informado.
        </p>
        {result.insuranceTotal > 0 && (
          <p>O <strong>seguro</strong> é calculado mensalmente sobre o saldo residual após
          o pagamento da parcela. Total projetado: <strong>{formatBRL(result.insuranceTotal)}</strong>.</p>
        )}
      </MeaningBlock>

      {/* Memória de cálculo */}
      <CalcMemory rows={[
        { label: "Carta de crédito", value: formatBRL(result.credit), formula: "Valor nominal contratado" },
        { label: "Obrigação inicial total", value: formatBRL(result.initialObligation),
          formula: `Carta + ${result.adminRate.toFixed(1)}% adm + ${result.reserveRate.toFixed(1)}% reserva` },
        { label: "Parcela linear base (mês 1)", value: formatBRLCents(result.initialObligation / result.term),
          formula: `${formatBRL(result.initialObligation)} ÷ ${result.term} meses` },
        { label: "Carta final corrigida", value: formatBRL(result.finalCredit),
          formula: `Após ${result.rows.filter((r) => r.tags.includes("Reajuste")).length} reajuste(s)` },
        { label: "Total pago projetado", value: formatBRL(result.paidTotal),
          formula: "Σ parcelas mensais (componentes + seguro)" },
        { label: "Saldo final (residual)", value: formatBRLCents(result.residual),
          formula: result.residual < 1 ? "Plano fecha no prazo ✓" : "Revisar faixas não lineares" },
      ]} />

      {/* Tabela de fluxo com scroll interno */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Fluxo mensal completo
        </p>
        <ScheduleTable rows={result.rows} />
      </div>

      {/* Metodologia */}
      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (buildSchedule).",
        "Parcela linear: obrigação total ÷ meses restantes, recalculada a cada reajuste.",
        "Parcela não linear: valor da faixa × fator de correção acumulado.",
        "Seguro: calculado sobre o saldo residual após o pagamento da parcela.",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC), não acessível ao navegador.",
      ]} />

      {/* Transparência */}
      <TransparencyBlock />

      {/* PDF */}
      <PdfButton onClick={() => {
        if (!result) return;
        import("@/lib/pdfSimulePlano").then(({ generatePdfSimulePlano }) => {
          generatePdfSimulePlano({
            credit: num(form.credit), term: Math.round(num(form.term)),
            adminRate: num(form.adminRate), reserveRate: num(form.reserveRate),
            insuranceRate: num(form.insuranceRate), adjRate: num(form.adjRate),
            adjEvery: form.adjEvery, mode: form.mode, ranges: form.ranges,
            rows: result.rows, paidTotal: result.paidTotal, residual: result.residual,
            finalCredit: result.finalCredit, initialObligation: result.initialObligation,
            insuranceTotal: result.insuranceTotal, correctionNominal: result.correctionNominal,
            warnings: result.warnings, simulationId: result.simulationId, generatedAt: result.generatedAt,
          }).catch((e) => { toast.error("Erro ao gerar PDF."); console.error(e); });
        });
      }} />

      {/* CTA */}
      <ConsultCTA context="o fluxo do seu plano" />
    </div>
  ) : null;

  return (
    <RaioXLayout
      moduleNumber={1}
      title="Raio-X da Parcela"
      description="Parcela baixa vende fácil. Conta mal feita cobra caro. Antes de olhar só o valor do boleto, veja como essa parcela se comporta mês a mês: taxa, correção, seguro, reajustes e custo acumulado. A pergunta não é só se cabe hoje. É se continua fazendo sentido até o fim."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
    />
  );
}
