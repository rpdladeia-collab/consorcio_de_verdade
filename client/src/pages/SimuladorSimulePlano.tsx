/**
 * Módulo 1 — Raio-X da Parcela
 * Layout: RaioXLayout (grid 2 colunas — inputs esquerda / KPIs+resultados direita)
 * Matemática: fiel ao HTML original (buildSchedule)
 */

import { useState } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { AlertTriangle, ChevronDown, Download, HelpCircle } from "lucide-react";
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

function FieldRow({ label, hint, children }: { label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-800 mb-1">{label}</label>
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
function ScheduleTable({ rows, onOpenRacional }: { rows: ScheduleRow[], onOpenRacional: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-[var(--ink)] text-[var(--paper)] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <Download className="w-4 h-4 text-[var(--orange)]" />
          <span className="eyebrow text-white/50">Evolução das parcelas (mês a mês)</span>
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenRacional(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC93C] text-[#0A0A08] text-[10px] font-bold uppercase rounded-full hover:bg-[#FFD700] transition-colors shadow-sm"
        >
          <HelpCircle className="w-3 h-3" />
          Racional
        </button>
      </div>
      {open && (
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 bg-white border-t border-white/10">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-[var(--ink)] text-white">
              <tr>
                {["Mês","Carta","Saldo inicial","F. Comum","T. Adm.","F. Reserva","Seguro","Parcela","Pago acum.","Saldo final","Eventos"].map((h) => (
                  <th key={h} className="px-2 py-3 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-white/80">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] sm:text-[13px]">
              {rows.map((r) => {
                const isAdj = r.tags.includes("Reajuste");
                const isExcess = r.tags.includes("Excesso");
                return (
                  <tr key={r.month} className={`border-t border-border transition-colors ${
                    isAdj ? "bg-amber-100" : "hover:bg-gray-50 text-gray-900"
                  }`}>
                    <td className="px-2 py-2 font-bold">{r.month}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRL(r.credit)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRL(r.opening)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.fc)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.ta)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.fr)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{r.insurance > 0.005 ? formatBRLCents(r.insurance) : "—"}</td>
                    <td className="px-2 py-2 font-mono font-bold text-[var(--orange)]">{formatBRLCents(r.installment)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRL(r.paidTotal)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRL(r.balance)}</td>
                    <td className="px-2 py-2">
                      {isAdj && <span className="text-[var(--orange)] font-bold text-[10px] uppercase">● Reajuste</span>}
                      {isExcess && <span className="text-destructive font-bold text-[10px] uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Excesso</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────────── */
export default function SimuladorSimulePlano() {
  const [showRacional, setShowRacional] = useState(false);
  const [form, setForm] = useSessionStorage<FormState>("simulador-plano", {
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-2">
        Parâmetros do plano
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
          label="Correção anual (%)"
          hint={<span className="flex items-center gap-1">INCC, IPCA etc. <a href="https://www.melhorcambio.com/incc" target="_blank" rel="noreferrer" title="Ver índice INCC atualizado" className="inline-flex items-center text-[var(--orange)] hover:opacity-70 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></a></span>}
        >
          <TextInput value={form.adjRate} onChange={set("adjRate")} placeholder="5" suffix="%" />
        </FieldRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
      </div>

      {form.mode === "nonlinear" && (
        <FieldRow label="Faixas não lineares" hint='Ex: "1-12: 2500". Uma por linha.'>
          <textarea value={form.ranges} onChange={(e) => set("ranges")(e.target.value)} rows={4}
            placeholder={"1-12: 2500\n13-24: 2800\n25-120: 3200"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--orange)] resize-y" />
        </FieldRow>
      )}

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-2 text-xs font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-1">
        {mutation.isPending ? "Calculando…" : "Abrir análise"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <KpiCard label="Primeira parcela" value={formatBRLCents(first)}
          hint="Valor sem reajustes" color="orange" />
        <KpiCard label="Maior parcela projetada" value={formatBRLCents(maxInstallment)}
          hint="Considerando reajustes" />
        <KpiCard label="Total pago" value={formatBRL(result.paidTotal)}
          hint="Ao final do prazo" />
        <KpiCard label="Carta final" value={formatBRL(result.finalCredit)}
          hint="Valor atualizado" />
      </div>

      <ConsultCTA />

      <CalcMemory items={[
        { label: "Obrigação inicial", value: formatBRL(result.initialObligation) },
        { label: "Seguro total (est.)", value: formatBRL(result.insuranceTotal) },
        { label: "Custo nominal", value: formatBRL(result.correctionNominal), isRed: true },
      ]} />

      <MeaningBlock />
      <TransparencyBlock />
    </div>
  ) : null;

  // ── Tabela de Evolução
  const scheduleTablePanel = result ? (
    <div className="space-y-8">
      <ScheduleTable rows={result.rows} onOpenRacional={() => setShowRacional(true)} />
      <MethodologyBlock />
      <div className="max-w-2xl mx-auto space-y-4 pb-12">
        <PdfButton loading={false} onClick={() => {
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
      </div>
    </div>
  ) : null;

  const racionalModal = showRacional && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#0A0A08] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-display text-lg uppercase tracking-tight">Racional do Cálculo</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Metodologia e Premissas Financeiras</p>
          </div>
          <button onClick={() => setShowRacional(false)} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6 text-sm text-[#1C1A16] leading-relaxed">
          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">1. Reajustes Periódicos</h4>
            <p>
              O simulador projeta a atualização da <strong>Carta de Crédito</strong> com base na taxa de correção anual informada. Quando ocorre o reajuste (ex: a cada 12 meses), o valor da carta sobe e, consequentemente, os componentes da parcela (Fundo Comum, Taxa Adm e Reserva) são recalculados proporcionalmente ao novo crédito.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">2. Seguro Prestamista</h4>
            <p>
              O seguro é calculado mensalmente sobre o <strong>Saldo Devedor Atualizado</strong>. À medida que você paga as parcelas, o saldo devedor diminui (amortização), mas quando ocorre o reajuste anual, o saldo devedor também é corrigido pelo índice, o que pode elevar o custo do seguro naquele período.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">3. Composição da Parcela</h4>
            <p>
              Cada linha da tabela representa o custo real total, somando:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Fundo Comum:</strong> Destinado à compra do bem.</li>
                <li><strong>Taxa de Administração:</strong> Remuneração da administradora.</li>
                <li><strong>Fundo de Reserva:</strong> Garantia para a saúde financeira do grupo.</li>
                <li><strong>Seguro:</strong> Proteção para o grupo e para o consorciado.</li>
              </ul>
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">4. Saldo Final</h4>
            <p>
              Representa quanto você ainda deve à administradora em termos nominais. Este valor é crucial para entender o impacto dos reajustes: você verá que, em alguns meses, mesmo pagando a parcela, o saldo devedor pode subir devido à correção monetária da carta.
            </p>
          </section>
        </div>

        <div className="p-6 bg-gray-50 border-t border-border flex justify-end">
          <button 
            onClick={() => setShowRacional(false)}
            className="px-8 py-3 bg-[#0A0A08] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#1C1A16] transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    {racionalModal}
    <RaioXLayout
      moduleNumber={1}
      title="A pergunta não é só se cabe hoje. É se continua fazendo sentido até o fim."
      description={<span className="text-white">Antes de olhar só o valor do boleto, veja como essa parcela se comporta mês a mês: taxa, correção, seguro, reajustes e custo acumulado.</span>}
      descriptionSupport="Simule o comportamento real do seu plano e descubra o custo acumulado invisível."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={!!result}
      scheduleTable={scheduleTablePanel}
    />
    </>
  );
}
