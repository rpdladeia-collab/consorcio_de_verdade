/**
 * Simulador: Estrutura do Plano
 * Replicação fiel do HTML original (SimuladordeConsórcioCliente_.renatto.html)
 * 4 abas: Dados da proposta, Custos da operação, Histórico de correções, Consórcio x investimentos
 * Com gráfico de degraus das correções e histórico anual responsivo.
 */

import { useState, useMemo } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { ChevronDown, Download, Plus, Trash2, Printer, ExternalLink, HelpCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  KpiCard,
  ConsultCTA,
  TransparencyBlock,
  formatBRL,
  formatBRLCents,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

/* ─── Tipos ─────────────────────────────────────────────────────────────────── */
type AdjPeriod = "12" | "6" | "0";
type PolicyMode = "standard" | "ranges";
type RangeType = "value" | "percent";

interface PaymentRange {
  start: number;
  end: number;
  type: RangeType;
  value: number;
}

interface FormState {
  credit: string;
  term: string;
  adminRate: string;
  reserveRate: string;
  insuranceRate: string;
  adjustmentRate: string;
  adjustmentPeriod: AdjPeriod;
  firstAdjustmentMonth: string;
  paymentPolicyMode: PolicyMode;
  savingsRate: string;
  cdbRate: string;
  // Lance
  lanceProprio: string;
  lanceFgts: string;
  lanceEmbutido: string;
  baseDoLance: 'carta' | 'categoria';
  parcelasPagas: string;
  estrategiaPos: 'abater_parcela' | 'reduzir_prazo';
}

type TabId = "proposta" | "custos" | "correcoes" | "investimentos" | "lance";

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function num(s: string): number {
  const raw = String(s).trim().replace(/\s/g, "");
  if (!raw) return 0;

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;

  return parseFloat(normalized) || 0;
}

function fmtPct(v: number, digits = 2): string {
  return `${(isFinite(v) ? v : 0).toFixed(digits).replace(".", ",")}%`;
}

function FieldRow({ label, hint, children }: { label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <label className="block text-[13px] md:text-[14px] font-bold text-gray-800 mb-0.5 leading-tight">{label}</label>
      <div className="mt-auto">
        {children}
        {hint && <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{hint}</p>}
      </div>
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
        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-[14px] md:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF4E1F] pr-8"
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none font-bold">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ─── Aba: Dados da proposta — Tabela mensal ─────────────────────────────────── */
function ProposalTable({ rows }: { rows: any[] }) {
  const [open, setOpen] = useState(false);
  if (!rows?.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-left">
          <Download className="w-4 h-4 text-[#FF4E1F]" />
          <span className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Memória de cálculo da proposta</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        <span className="text-[11px] text-gray-500 hidden sm:block">Componentes mês a mês, com destaque apenas nos meses de correção.</span>
      </div>
      {open && (
        <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {["Mês", "Crédito atualizado", "Saldo antes", "Correção", "Fundo comum", "Taxa adm.", "Fundo reserva", "Seguro", "Ajuste política", "Parcela", "Saldo final", "Evento"].map((h) => (
                  <th key={h} className="px-2 py-3 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {rows.map((r, idx) => {
                const isCorrection = r.tags?.includes("CORREÇÃO");
                const eventText = r.tags?.length ? r.tags.join(" · ") : "—";
                return (
                  <tr key={`row-${idx}`} className={`border-t border-gray-100 ${isCorrection ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                    <td className="px-2 py-2 font-bold text-gray-900">{r.month}</td>
                    <td className="px-2 py-2 font-mono font-bold text-green-700">{formatBRLCents(r.credit)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.saldoAntes)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.reajuste)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.fc)}</td>
                    <td className="px-2 py-2 font-mono font-bold text-red-600">{formatBRLCents(r.ta)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.fr)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{r.insurance > 0.005 ? formatBRLCents(r.insurance) : "—"}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{Math.abs(r.policyAdjustment) > 0.005 ? formatBRLCents(r.policyAdjustment) : "—"}</td>
                    <td className="px-2 py-2 font-mono font-bold text-red-600">{formatBRLCents(r.payment)}</td>
                    <td className="px-2 py-2 font-mono text-gray-700">{formatBRLCents(r.saldoFinal)}</td>
                    <td className="px-2 py-2">
                      {eventText !== "—" ? (
                        <span className="text-[#FF4E1F] font-bold text-[10px] uppercase">{eventText}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
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

/* ─── HelpDot: botão "?" com tooltip ──────────────────────────────────────── */
function HelpDot({ text }: { text: string }) {
  return (
    <span className="relative inline-flex align-middle group">
      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-[#FF4E1F] cursor-help transition-colors" />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-lg bg-gray-900 text-white text-[11px] leading-relaxed p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-lg">
        {text}
      </span>
    </span>
  );
}

/* ─── Aba: Custos da operação ────────────────────────────────────────────────── */
function CostsTab({ result }: { result: any }) {
  if (!result) return null;
  const c = result.costs;

  const cartaCorrigidaFinal = result.last?.credit ?? 0;
  const custoTotal = c.custoOperacional; // taxa adm. projetada + fundo reserva + seguro
  const pctSobreCartaCorrigida = cartaCorrigidaFinal > 0 ? (custoTotal / cartaCorrigidaFinal) * 100 : 0;

  const kpis = [
    { label: "Taxa adm. contratual", value: c.contractualAdmin, sub: `${fmtPct(result.adminRate)} sobre a carta inicial`, color: "orange" },
    { label: "Adm. sobre correções", value: c.correcaoAdm, sub: "Atualização projetada da taxa administrativa", color: "yellow" },
    { label: "Fundo reserva projetado", value: c.fundoReservaProjetado, sub: `${fmtPct(result.reserveRate)} sobre a carta, corrigido`, color: "blue" },
    { label: "Seguro projetado", value: c.projectedInsurance, sub: "Somente quando informado separadamente", color: "black" },
    { label: "Custo total da operação", value: custoTotal, sub: "Taxa adm. + fundo reserva + seguro", color: "red" },
  ];

  const kpiColors: Record<string, string> = {
    orange: "border-l-[#FF4E1F]",
    yellow: "border-l-amber-400",
    blue: "border-l-blue-500",
    black: "border-l-gray-800",
    red: "border-l-red-500",
  };

  return (
    <div className="space-y-5 min-w-0">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5">
        {kpis.map((k) => (
          <div key={k.label} className={`min-w-0 rounded-xl border border-gray-200 border-l-4 ${kpiColors[k.color]} bg-white p-2.5 sm:p-3 min-h-[116px] flex flex-col justify-between`}>
            <span className="block text-[9px] sm:text-[10px] leading-snug text-gray-500 uppercase tracking-[0.05em] font-bold break-words">{k.label}</span>
            <strong className="block text-gray-900 text-[12px] min-[1180px]:text-[13px] mt-1.5 font-mono leading-tight tabular-nums whitespace-nowrap">{formatBRLCents(k.value)}</strong>
            <span className="block text-gray-500 text-[10px] sm:text-[11px] mt-1.5 leading-snug break-words">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 overflow-hidden">
          <h4 className="text-[13px] font-bold text-gray-800 mb-2">O que compõe o custo da operação</h4>
          <p className="text-[12px] sm:text-[12.5px] text-gray-700 leading-relaxed">A taxa de administração (contratual + correções), o fundo de reserva e o seguro informado separadamente. A correção da carta e o fundo comum não são custo — são o próprio crédito sendo atualizado.</p>
        </div>
        <div className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 overflow-hidden">
          <h4 className="text-[13px] font-bold text-gray-800 mb-2">Composição do custo da operação</h4>
          <div className="space-y-2 text-[12px] sm:text-[12.5px] text-gray-700">
            <div className="flex items-center justify-between gap-2"><span className="min-w-0 break-words">Taxa adm. contratual</span><b className="font-mono break-words text-right">{formatBRLCents(c.contractualAdmin)}</b></div>
            <div className="flex items-center justify-between gap-2"><span className="min-w-0 break-words">Adm. sobre correções</span><b className="font-mono break-words text-right">{formatBRLCents(c.correcaoAdm)}</b></div>
            <div className="flex items-center justify-between gap-2"><span className="min-w-0 break-words">Fundo reserva projetado</span><b className="font-mono break-words text-right">{formatBRLCents(c.fundoReservaProjetado)}</b></div>
            <div className="flex items-center justify-between gap-2"><span className="min-w-0 break-words">Seguro projetado</span><b className="font-mono break-words text-right">{formatBRLCents(c.projectedInsurance)}</b></div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-300"><span className="font-bold min-w-0 break-words">Custo total da operação</span><b className="font-mono text-red-600 break-words text-right">{formatBRLCents(custoTotal)}</b></div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Composição do custo da operação</h3>
          <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">Encargos que remuneram ou oneram diretamente a operação</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] table-fixed">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="w-[28%] px-2 sm:px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider">Item</th>
                  <th className="w-[20%] px-2 sm:px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider">Valor projetado</th>
                  <th className="w-[18%] px-2 sm:px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider">Classificação</th>
                  <th className="w-[34%] px-2 sm:px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider">Leitura correta</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                <tr className="border-t border-gray-100"><td className="px-2 sm:px-3 py-2.5 text-gray-800 break-words">Taxa de administração contratual</td><td className="px-2 sm:px-3 py-2.5 font-mono font-bold text-red-600 break-words">{formatBRLCents(c.contractualAdmin)}</td><td className="px-2 sm:px-3 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 uppercase">Custo explícito</span></td><td className="px-2 sm:px-3 py-2.5 text-gray-600 break-words">Remuneração contratual calculada sobre a carta inicial.</td></tr>
                <tr className="border-t border-gray-100"><td className="px-2 sm:px-3 py-2.5 text-gray-800 break-words">Atualização da taxa administrativa</td><td className="px-2 sm:px-3 py-2.5 font-mono font-bold text-red-600 break-words">{formatBRLCents(c.correcaoAdm)}</td><td className="px-2 sm:px-3 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-700 uppercase">Custo projetado</span></td><td className="px-2 sm:px-3 py-2.5 text-gray-600 break-words">Acréscimo projetado da taxa decorrente das correções do saldo.</td></tr>
                <tr className="border-t border-gray-100"><td className="px-2 sm:px-3 py-2.5 text-gray-800 break-words">Fundo reserva projetado</td><td className="px-2 sm:px-3 py-2.5 font-mono font-bold text-red-600 break-words">{formatBRLCents(c.fundoReservaProjetado)}</td><td className="px-2 sm:px-3 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 uppercase">Custo contratual</span></td><td className="px-2 sm:px-3 py-2.5 text-gray-600 break-words">Fundo de reserva contratual corrigido pelas atualizações do saldo.</td></tr>
                <tr className="border-t border-gray-100"><td className="px-2 sm:px-3 py-2.5 text-gray-800 break-words">Seguro informado à parte</td><td className="px-2 sm:px-3 py-2.5 font-mono font-bold text-red-600 break-words">{formatBRLCents(c.projectedInsurance)}</td><td className="px-2 sm:px-3 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-700 uppercase">Custo explícito</span></td><td className="px-2 sm:px-3 py-2.5 text-gray-600 break-words">Considerado somente quando o seguro é informado separadamente.</td></tr>
                <tr className="border-t-2 border-gray-200 bg-red-50/40"><td className="px-2 sm:px-3 py-3 font-bold text-gray-900">Custo total da operação</td><td className="px-2 sm:px-3 py-3 font-mono font-bold text-red-700 break-words">{formatBRLCents(custoTotal)}</td><td className="px-2 sm:px-3 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 uppercase">Total</span></td><td className="px-2 sm:px-3 py-3 text-gray-700">Taxa administrativa total projetada + fundo reserva + seguro.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Destaque: custo total vs carta corrigida */}
      <div className="rounded-xl border-2 border-[#FF4E1F] bg-gradient-to-r from-orange-50 to-amber-50 p-5 text-center">
        <p className="text-[12px] text-gray-600 uppercase tracking-wider font-bold">Custo total sobre a carta corrigida</p>
        <p className="text-2xl md:text-3xl font-bold text-[#FF4E1F] mt-2 font-mono">{pctSobreCartaCorrigida.toFixed(2)}%</p>
        <p className="text-[12.5px] text-gray-700 mt-2 leading-relaxed max-w-2xl mx-auto">
          Considerando o valor da carta corrigida até o final do plano ({formatBRLCents(cartaCorrigidaFinal)}),
          o custo total da operação de {formatBRLCents(custoTotal)} equivale a{" "}
          <b className="text-[#FF4E1F]">{pctSobreCartaCorrigida.toFixed(2)}%</b> da carta de crédito projetada.
        </p>
      </div>
    </div>
  );
}

/* ─── Aba: Histórico de correções ────────────────────────────────────────────── */

/* Tooltip funcional: totais e aumentos exatos no ponto selecionado */
function CorrectionChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const increaseLabel = (value: number) =>
    value > 0 ? `+ ${formatBRLCents(value)}` : "sem aumento neste mês";

  return (
    <div className="min-w-[210px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Mês {point.month}</p>
      <div className="mt-2 space-y-2">
        <div className="rounded-lg bg-green-50 px-2.5 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-green-800">Carta de crédito</span>
            <span className="font-mono text-[12px] font-bold text-green-900">{formatBRLCents(point.credit)}</span>
          </div>
          <p className="mt-0.5 text-[10px] font-semibold text-green-700">Degrau: {increaseLabel(point.creditIncrease)}</p>
        </div>
        <div className="rounded-lg bg-orange-50 px-2.5 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-orange-800">Parcela</span>
            <span className="font-mono text-[12px] font-bold text-orange-900">{formatBRLCents(point.payment)}</span>
          </div>
          <p className="mt-0.5 text-[10px] font-semibold text-orange-700">Degrau: {increaseLabel(point.paymentIncrease)}</p>
        </div>
      </div>
    </div>
  );
}

/* Gráfico de degraus: parcela vs carta ao longo dos meses */
function CorrectionStepChart({ result }: { result: any }) {
  const rows = result.rows || [];
  if (!rows.length) return null;

  // Amostrar para no máximo ~120 pontos para performance e clareza visual
  const step = Math.max(1, Math.ceil(rows.length / 120));
  const chartData = rows
    .filter((r: any, i: number) => i % step === 0 || (r.tags || []).includes("CORREÇÃO") || i === rows.length - 1)
    .map((r: any) => {
      const previous = rows[Math.max(0, r.month - 2)] || r;
      return {
        month: r.month,
        payment: r.payment,
        credit: r.credit,
        paymentIncrease: r.month === 1 ? 0 : Math.max(0, r.payment - previous.payment),
        creditIncrease: r.month === 1 ? 0 : Math.max(0, r.credit - previous.credit),
        isCorrection: (r.tags || []).includes("CORREÇÃO"),
      };
    });

  const correctionMonths = chartData.filter((d: any) => d.isCorrection).map((d: any) => d.month);

  const chartConfig = {
    payment: { label: "Parcela", color: "#FF4E1F" },
    credit: { label: "Carta de crédito", color: "#16a34a" },
  } as any;

  const formatAxisBRL = (v: number) => {
    if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
    return `R$ ${v.toFixed(0)}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-700 uppercase tracking-wider">Evolução da parcela vs carta de crédito</h3>
        <p className="text-[11px] sm:text-[12px] text-gray-500 mt-0.5">A cada degrau de correção, a parcela sobe pouco — mas a carta de crédito sobe muito. Passe o cursor ou toque no gráfico para ver os valores exatos.</p>
      </div>
      <div className="p-2 sm:p-4">
        <ChartContainer
          config={chartConfig}
          className="h-[280px] sm:h-[340px] w-full"
        >
          <ComposedChart data={chartData} margin={{ top: 10, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              interval="preserveStartEnd"
              minTickGap={28}
              label={{ value: "Mês", position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "#9ca3af" } }}
            />
            <YAxis
              yAxisId="credit"
              orientation="left"
              tickFormatter={formatAxisBRL}
              tick={{ fontSize: 10, fill: "#16a34a" }}
              tickLine={false}
              axisLine={{ stroke: "#16a34a", strokeOpacity: 0.45 }}
              width={58}
              domain={["dataMin - 20000", "dataMax + 20000"]}
            />
            <YAxis
              yAxisId="payment"
              orientation="right"
              tickFormatter={formatAxisBRL}
              tick={{ fontSize: 10, fill: "#FF4E1F" }}
              tickLine={false}
              axisLine={{ stroke: "#FF4E1F", strokeOpacity: 0.45 }}
              width={48}
              domain={["dataMin - 300", "dataMax + 300"]}
            />
            <ChartTooltip content={<CorrectionChartTooltip />} cursor={{ stroke: "#9ca3af", strokeDasharray: "3 3" }} />
            {/* Linhas verticais tracejadas nos meses de correção */}
            {correctionMonths.map((m: number) => (
              <ReferenceLine
                yAxisId="credit"
                key={m}
                x={m}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            ))}
            {/* Carta de crédito — linha verde com step */}
            <Line
              yAxisId="credit"
              type="stepAfter"
              dataKey="credit"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={false}
              name="Carta de crédito"
            />
            {/* Parcela — linha laranja com step */}
            <Line
              yAxisId="payment"
              type="stepAfter"
              dataKey="payment"
              stroke="#FF4E1F"
              strokeWidth={2}
              dot={false}
              name="Parcela"
            />
          </ComposedChart>
        </ChartContainer>
      </div>
      {/* Legenda explicativa abaixo do gráfico */}
      <div className="px-4 sm:px-5 pb-3 pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-[#16a34a] rounded-full" />
          Carta de crédito
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-[#FF4E1F] rounded-full" />
          Parcela
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-[#f59e0b] rounded-full" style={{ borderTop: "2px dashed #f59e0b", background: "transparent" }} />
          Mês de correção
        </span>
      </div>
    </div>
  );
}

/* Accordion: tabela de histórico de correções fechada por padrão */
function CorrectionsHistoryAccordion({ yearly }: { yearly: any[] }) {
  const [open, setOpen] = useState(false);
  const correctionsCount = yearly.filter((y) => y.events > 0).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Cabeçalho clicável */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 text-left"
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-700 uppercase tracking-wider">Histórico de correções ano a ano</h3>
          <p className="text-[11px] sm:text-[12px] text-gray-500 mt-0.5">{yearly.length} anos · {correctionsCount} com correções · toque para {open ? "recolher" : "expandir"}</p>
        </div>
        {/* Seta animada */}
        <svg
          className={`shrink-0 w-5 h-5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Conteúdo expansível */}
      {open && (
        <div className="border-t border-gray-100">
          {/* Desktop: tabela completa */}
          <div className="hidden 2xl:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-100">
                <tr>
                  {["Ano", "Correções", "Pago no ano", "Correção da carta", "Correção do saldo", "Carta no fim", "Saldo no fim", "Leitura"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {yearly.map((y: any, i: number) => (
                  <tr key={i} className={`border-t border-gray-100 ${y.events > 0 ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                    <td className="px-3 py-2 font-bold text-gray-900">{y.year}</td>
                    <td className="px-3 py-2 text-gray-700">{y.events}</td>
                    <td className="px-3 py-2 font-mono font-bold text-gray-900">{formatBRLCents(y.paidYear)}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{formatBRLCents(y.corrCarta)}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{formatBRLCents(y.corrSaldo)}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{formatBRLCents(y.cartaFim)}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{formatBRLCents(y.saldoFim)}</td>
                    <td className="px-3 py-2">
                      <span className={y.events > 0 ? "text-[#FF4E1F] font-bold text-[11px] uppercase" : "text-gray-300"}>{y.leitura}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile/Tablet: cards empilhados */}
          <div className="2xl:hidden divide-y divide-gray-100">
            {yearly.map((y: any, i: number) => (
              <div key={i} className={`px-4 py-3 ${y.events > 0 ? "bg-amber-50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-bold text-gray-900">Ano {y.year}</span>
                  <span className={`text-[11px] font-bold uppercase ${y.events > 0 ? "text-[#FF4E1F]" : "text-gray-300"}`}>{y.leitura}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                  <div>
                    <span className="text-gray-500">Correções</span>
                    <p className="font-bold text-gray-900">{y.events}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Pago no ano</span>
                    <p className="font-mono font-bold text-gray-900">{formatBRLCents(y.paidYear)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Correção da carta</span>
                    <p className="font-mono text-gray-700">{formatBRLCents(y.corrCarta)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Correção do saldo</span>
                    <p className="font-mono text-gray-700">{formatBRLCents(y.corrSaldo)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Carta no fim</span>
                    <p className="font-mono text-gray-700">{formatBRLCents(y.cartaFim)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Saldo no fim</span>
                    <p className="font-mono text-gray-700">{formatBRLCents(y.saldoFim)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CorrectionsTab({ result }: { result: any }) {
  if (!result) return null;
  const yearly = result.yearlyCorrections || [];

  return (
    <div className="space-y-4">
      {/* Destaques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-center">
          <p className="text-[12px] text-gray-600 uppercase tracking-wider">Carta final atualizada</p>
          <p className="text-xl md:text-2xl font-bold text-green-800 mt-1">{formatBRLCents(result.last.credit)}</p>
          <p className="text-[12px] text-gray-500 mt-1">crédito projetado ao fim do plano</p>
        </div>
        <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 text-center">
          <p className="text-[12px] text-gray-600 uppercase tracking-wider">Total desembolsado pelo cliente</p>
          <p className="text-xl md:text-2xl font-bold text-orange-800 mt-1">{formatBRLCents(result.sums.payment)}</p>
          <p className="text-[12px] text-gray-500 mt-1">principal + taxas + seguro + correções</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-[13px] text-gray-800"><b>Leitura rápida:</b> o verde mostra a carta final atualizada. O laranja mostra o total desembolsado pelo cliente: principal, taxas, seguro e correções projetadas. A projeção não representa promessa de índice futuro.</p>
      </div>

      {/* Gráfico de degraus: parcela vs carta */}
      <CorrectionStepChart result={result} />

      {/* Racional + Ponto-chave (acima da tabela) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[14px] font-bold text-gray-800 mb-2">Racional</p>
          <p className="text-[13px] text-gray-700 leading-relaxed">Quando existe correção, a carta é atualizada e o saldo devedor remanescente também é recalculado. A parcela futura nasce desse novo saldo dividido pelo prazo restante.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[14px] font-bold text-gray-800 mb-2">Ponto-chave</p>
          <p className="text-[13px] text-gray-700 leading-relaxed">A correção não é uma parcela extra isolada. Ela aumenta a base que ainda falta pagar e, por isso, altera as parcelas dali para frente.</p>
        </div>
      </div>

      {/* Destaque: critérios de correção da administradora */}
      <div className="rounded-xl border-2 border-[#FF4E1F]/40 bg-[#FFF5F0] p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-[#FF4E1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#FF4E1F] mb-1">Importante: critérios de correção</p>
            <p className="text-[13px] text-gray-800 leading-relaxed">As correções seguem as regras da administradora e do contrato. Em geral, <b>antes da contemplação</b>, atualizam a carta e o saldo devedor; <b>depois da contemplação</b>, somente o saldo continua corrigido para preservar o equilíbrio do grupo até o encerramento.</p>
          </div>
        </div>
      </div>

      {/* Tabela ano a ano — accordion fechado por padrão */}
      <CorrectionsHistoryAccordion yearly={yearly} />

    </div>
  );
}

/* ─── Aba: Consórcio x investimentos ─────────────────────────────────────────── */
function InvestmentsTab({ result, inv }: { result: any; inv: any }) {
  if (!result || !inv) return null;
  const x = inv;

  const savingsClass = x.savingsVsCredit > 0.02 ? "negative" : "positive";
  const cdbClass = x.cdbNetVsCredit > 0.02 ? "negative" : "positive";
  const nominalClass = x.nominalSpread > 0.02 ? "orange" : "positive";

  return (
    <div className="space-y-4">
      {/* Seção 1: Fluxo importado */}
      <div>
        <p className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-1">1. Fluxo importado da proposta</p>
        <p className="text-[12px] text-gray-500 mb-3">Nenhum fluxo é digitado nesta aba. O motor usa a memória da aba 1: parcela por parcela, do mês 1 ao mês {result.term}.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard label="Total desembolsado no consórcio" value={formatBRLCents(x.totalPaid)} hint="soma das parcelas da aba 1" tone="orange" />
          <KpiCard label="Carta final corrigida" value={formatBRLCents(x.finalCredit)} hint="referência de comparação" tone="positive" />
          <KpiCard label="Diferença nominal" value={formatBRLCents(x.nominalSpread)} hint="carta final - desembolso" tone={nominalClass as any} />
        </div>
      </div>

      {/* Destaque: A Ilusão Nominal vs. Realidade */}
      <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-orange-900 uppercase tracking-wider mb-1">A Ilusão Nominal vs. Realidade</p>
            <p className="text-[13px] text-orange-800 leading-relaxed">
              Muitas pessoas comparam apenas o Total Pago com a Carta de Crédito. Isso é um erro grave de matemática financeira. O verdadeiro custo de um consórcio não é apenas a taxa de administração, mas o <strong>Custo de Oportunidade</strong>: o patrimônio que você teria acumulado se tivesse aplicado o capital inicial e os aportes mensais (parcelas) em um investimento conservador.
            </p>
          </div>
        </div>
      </div>

      {/* Seção 2: Mesmo esforço em renda fixa */}
      <div>
        <p className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-1">2. Mesmo esforço em renda fixa</p>
        <p className="text-[12px] text-gray-500 mb-3">Cada parcela projetada no consórcio é aplicada em investimentos até o fim do mesmo prazo.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <KpiCard label="Poupança · mesmo fluxo" value={formatBRLCents(x.savings.net)} hint={`${formatBRLCents(x.savingsVsCredit)} contra a carta final`} tone={savingsClass as any} />
          <KpiCard label="CDB 100% CDI líquido" value={formatBRLCents(x.cdb.net)} hint={`${formatBRLCents(x.cdbNetVsCredit)} contra a carta final`} tone={cdbClass as any} />
        </div>
      </div>

      {/* Seção 3: Custo de oportunidade */}
      <div>
        <p className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-1">3. Custo de oportunidade</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <KpiCard label="Diferença CDB líquido x carta" value={formatBRLCents(x.cdbNetVsCredit)} hint="principal teste contra o autopagável" tone={cdbClass as any} />
          <KpiCard label="Diferença poupança x carta" value={formatBRLCents(x.savingsVsCredit)} hint="comparação conservadora" tone={savingsClass as any} />
        </div>
      </div>

      {/* Auditoria de Fluxo de Caixa (Igualado) */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-900">
          <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Auditoria de Fluxo de Caixa (Igualado)</h3>
        </div>
        <div className="sm:hidden divide-y divide-gray-100">
          {(x.auditRows || []).map((r: any, i: number) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[14px] font-bold text-gray-900">Mês {r.month}</span>
                <span className="text-[15px] font-mono font-bold text-gray-900">{formatBRLCents(r.saldoInvestimento)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <span className="block text-gray-500 mb-0.5">Parcela (aporte)</span>
                  <span className="font-mono font-semibold text-gray-800">{formatBRLCents(r.aporte)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-gray-500 mb-0.5">Carta atualizada</span>
                  <span className="font-mono font-semibold text-gray-800">{formatBRLCents(r.cartaAtualizada)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[620px] table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-700 w-1/4">Mês</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-700 w-1/4">Parcela (Aporte)</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-700 w-1/4">Carta Atualizada</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-700 w-1/4">Saldo Investimento</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {(x.auditRows || []).map((r: any, i: number) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-left font-bold text-gray-900">Mês {r.month}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700">{formatBRLCents(r.aporte)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700">{formatBRLCents(r.cartaAtualizada)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900">{formatBRLCents(r.saldoInvestimento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela comparativa */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-[14px] font-bold text-gray-700 uppercase tracking-wider">Comparativo completo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                {['Camada', 'Cenário', 'Valor', 'Diferença', 'Como interpretar'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {(x.rows || []).map((r: any, i: number) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-left font-bold text-gray-900">{r.layer}</td>
                  <td className="px-3 py-2 text-left text-gray-700">{r.scenario}</td>
                  <td className="px-3 py-2 font-mono font-bold text-gray-900">{formatBRLCents(r.value)}</td>
                  <td className="px-3 py-2 font-mono font-bold text-gray-900">{formatBRLCents(r.diff)}</td>
                  <td className="px-3 py-2 text-gray-600 text-[12px]">{r.leitura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────────── */
export default function EstruturaDoPlano() {
  const [activeTab, setActiveTab] = useState<TabId>("proposta");
  const [expandedLance, setExpandedLance] = useState(false);
  const [ranges, setRanges] = useState<PaymentRange[]>([]);
  const [form, setForm] = useSessionStorage<FormState>("simulador-estrutura", {
    credit: "500000", term: "180", adminRate: "15", reserveRate: "0",
    insuranceRate: "0", adjustmentRate: "5", adjustmentPeriod: "12",
    firstAdjustmentMonth: "13", paymentPolicyMode: "standard",
    savingsRate: "0.515", cdbRate: "0.795",
    lanceProprio: "0", lanceFgts: "0", lanceEmbutido: "0",
    baseDoLance: "carta", parcelasPagas: "0", estrategiaPos: "abater_parcela",
  });

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = trpc.estruturaDoPlano.simulate.useMutation({
    onError: (err) => toast.error(err.message || "Erro ao calcular. Tente novamente."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const credit = num(form.credit);
    const term = Math.round(num(form.term));
    if (credit <= 0) return toast.error("Informe um valor de carta maior que zero.");
    if (term < 1 || term > 300) return toast.error("Prazo deve estar entre 1 e 300 meses.");

    const adjPeriod = parseInt(form.adjustmentPeriod);
    const firstAdj = adjPeriod === 0 ? 13 : parseInt(form.firstAdjustmentMonth) || (adjPeriod === 6 ? 7 : 13);

    mutation.mutate({
      credit,
      term,
      adminRate: num(form.adminRate),
      reserveRate: num(form.reserveRate),
      insuranceRate: num(form.insuranceRate),
      adjustmentRate: num(form.adjustmentRate),
      adjustmentPeriod: adjPeriod,
      firstAdjustmentMonth: firstAdj,
      paymentPolicyMode: form.paymentPolicyMode,
      paymentRanges: form.paymentPolicyMode === "ranges" ? ranges.map(r => ({
        start: Math.max(1, Math.round(r.start)),
        end: Math.max(Math.round(r.start), Math.round(r.end)),
        type: r.type,
        value: Math.max(0, r.value),
      })) : [],
      savingsRate: num(form.savingsRate),
      cdbRate: num(form.cdbRate),
      lanceProprio: num(form.lanceProprio),
      lanceFgts: num(form.lanceFgts),
      lanceEmbutido: num(form.lanceEmbutido),
      baseDoLance: form.baseDoLance,
      parcelasPagas: Math.round(num(form.parcelasPagas)),
      estrategiaPos: form.estrategiaPos,
    });
  }

  const data = mutation.data;
  const result = data?.result;
  const hasResult = !!result;

  function addRange() {
    const term = Math.round(num(form.term)) || 180;
    setRanges((r) => [...r, { start: 1, end: term, type: "percent" as RangeType, value: 100 }]);
  }

  function removeRange(idx: number) {
    setRanges((r) => r.filter((_, i) => i !== idx));
  }

  function updateRange(idx: number, field: keyof PaymentRange, value: any) {
    setRanges((r) => r.map((range, i) => i === idx ? { ...range, [field]: value } : range));
  }

  /* ── Painel esquerdo: formulário ────────────────────────────────────────── */
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-bold text-[14px] text-gray-800 uppercase tracking-wider mb-1">Dados do contrato</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FieldRow label="Valor da carta" hint="Valor do crédito contratado">
          <TextInput value={form.credit} onChange={set("credit")} placeholder="500000" suffix="R$" />
        </FieldRow>
        <FieldRow label="Prazo total" hint="Quantidade total de parcelas">
          <TextInput value={form.term} onChange={set("term")} placeholder="180" suffix="meses" />
        </FieldRow>
        <FieldRow label="Taxa adm. total (%)" hint="Percentual total de taxa de administração">
          <TextInput value={form.adminRate} onChange={set("adminRate")} placeholder="15" suffix="%" />
        </FieldRow>
        <FieldRow label="Fundo reserva (%)" hint="Se não houver, mantenha 0%">
          <TextInput value={form.reserveRate} onChange={set("reserveRate")} placeholder="0" suffix="%" />
        </FieldRow>
        <FieldRow label="Seguro mensal (%)" hint="Se não houver seguro, use 0%">
          <TextInput value={form.insuranceRate} onChange={set("insuranceRate")} placeholder="0" suffix="%" />
        </FieldRow>
        <FieldRow label={<span>Correções (INCC, IPCA) <a href="https://portalibre.fgv.br/ultima-divulgacao/70?origem=pagind-incc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[#FF4E1F] hover:opacity-80 align-middle"><ExternalLink className="w-3.5 h-3.5" /></a></span>} hint="Projeção de correção aplicada a cada período">
          <TextInput value={form.adjustmentRate} onChange={set("adjustmentRate")} placeholder="5" suffix="%" />
        </FieldRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FieldRow label="Periodicidade da correção" hint="Anual, semestral ou sem correção">
          <select value={form.adjustmentPeriod} onChange={(e) => {
            const v = e.target.value as AdjPeriod;
            set("adjustmentPeriod")(v);
            if (v === "12") set("firstAdjustmentMonth")("13");
            if (v === "6") set("firstAdjustmentMonth")("7");
          }} className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF4E1F]">
            <option value="12">Anual</option>
            <option value="6">Semestral</option>
            <option value="0">Sem correção</option>
          </select>
        </FieldRow>
        <FieldRow label="Primeira correção no mês" hint="Padrão: mês 13 para anual e 7 para semestral">
          <TextInput value={form.firstAdjustmentMonth} onChange={set("firstAdjustmentMonth")} placeholder="13" suffix="mês" />
        </FieldRow>
      </div>

      <FieldRow label="Política de parcelas — Linear e não linear" hint="Use padrão para parcela cheia. Use faixas quando houver parcela reduzida, degrau ou valores diferentes por período.">
        <select value={form.paymentPolicyMode} onChange={(e) => set("paymentPolicyMode")(e.target.value as PolicyMode)}
          className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF4E1F]">
          <option value="standard">Linear — Parcela cheia calculada pelo contrato</option>
          <option value="ranges">Não linear — Parcelas por faixa personalizada</option>
        </select>
      </FieldRow>

      {form.paymentPolicyMode === "ranges" && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <b className="text-[13px] text-gray-800">Faixas de parcelas</b>
            <button type="button" onClick={addRange} className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase rounded-full bg-[#FF4E1F] text-white hover:opacity-90 transition-opacity">
              <Plus className="w-3 h-3" /> Adicionar faixa
            </button>
          </div>
          {ranges.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1 items-end">
              <div><label className="text-[10px] text-gray-500">Início</label><input type="number" min={1} value={r.start} onChange={(e) => updateRange(i, "start", parseInt(e.target.value) || 1)} className="w-full rounded border border-gray-300 px-1.5 py-1 text-[13px]" /></div>
              <div><label className="text-[10px] text-gray-500">Fim</label><input type="number" min={1} value={r.end} onChange={(e) => updateRange(i, "end", parseInt(e.target.value) || 1)} className="w-full rounded border border-gray-300 px-1.5 py-1 text-[13px]" /></div>
              <div><label className="text-[10px] text-gray-500">Tipo</label><select value={r.type} onChange={(e) => updateRange(i, "type", e.target.value as RangeType)} className="w-full rounded border border-gray-300 px-1.5 py-1 text-[13px]"><option value="value">Valor</option><option value="percent">% cheia</option></select></div>
              <div><label className="text-[10px] text-gray-500">Valor</label><input type="number" min={0} step="0.01" value={r.value} onChange={(e) => updateRange(i, "value", parseFloat(e.target.value) || 0)} className="w-full rounded border border-gray-300 px-1.5 py-1 text-[13px]" /></div>
              <button type="button" onClick={() => removeRange(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <p className="text-[11px] text-gray-500 leading-tight">Cada faixa pode ser informada como valor de parcela ou percentual da parcela cheia. O valor informado considera a parcela total do mês. Se houver seguro, ele é preservado e o restante amortiza o saldo proporcionalmente.</p>
        </div>
      )}

      {/* Estrutura do Lance — só visível na aba Lance */}
      {activeTab === "lance" && (
        <div className="pt-2 border-t border-gray-100">
          <p className="font-bold text-[13px] text-gray-700 uppercase tracking-wider mb-2">Composição do Lance</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FieldRow label="Base do lance" hint="Carta ou categoria (carta + taxa)">
              <select value={form.baseDoLance} onChange={(e) => set("baseDoLance")(e.target.value as any)} className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF4E1F]">
                <option value="carta">Carta</option>
                <option value="categoria">Categoria</option>
              </select>
            </FieldRow>
            <FieldRow label="Parcelas já pagas" hint="Quantidade de parcelas já quitadas">
              <TextInput value={form.parcelasPagas} onChange={set("parcelasPagas")} placeholder="0" suffix="parcelas" />
            </FieldRow>
            <FieldRow label="Lance próprio (R$)" hint="Recurso próprio para o lance">
              <TextInput value={form.lanceProprio} onChange={set("lanceProprio")} placeholder="0" suffix="R$" />
            </FieldRow>
            <FieldRow label="Lance FGTS (R$)" hint="Recurso FGTS para o lance">
              <TextInput value={form.lanceFgts} onChange={set("lanceFgts")} placeholder="0" suffix="R$" />
            </FieldRow>
            <FieldRow label="Lance embutido (R$)" hint="Valor já embutido nas parcelas">
              <TextInput value={form.lanceEmbutido} onChange={set("lanceEmbutido")} placeholder="0" suffix="R$" />
            </FieldRow>
            <FieldRow label="Estratégia pós-contemplação" hint="Como aplicar o lance após contemplação">
              <select value={form.estrategiaPos} onChange={(e) => set("estrategiaPos")(e.target.value as any)} className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF4E1F]">
                <option value="abater_parcela">Abater parcela</option>
                <option value="reduzir_prazo">Reduzir prazo</option>
              </select>
            </FieldRow>
          </div>
        </div>
      )}

      {/* Premissas de investimento — só visíveis na aba Consórcio x investimentos */}
      {activeTab === "investimentos" && (
        <div className="pt-2 border-t border-gray-100">
          <p className="font-bold text-[13px] text-gray-700 uppercase tracking-wider mb-2">Premissas de investimento</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FieldRow label="Poupança estimada (% a.m.)" hint="Rentabilidade mensal da poupança">
              <TextInput value={form.savingsRate} onChange={set("savingsRate")} placeholder="0.515" suffix="% a.m." />
            </FieldRow>
            <FieldRow label="CDB 100% CDI líquido (% a.m.)" hint="Rentabilidade mensal líquida do CDB (após IR)">
              <TextInput value={form.cdbRate} onChange={set("cdbRate")} placeholder="0.795" suffix="% a.m." />
            </FieldRow>
          </div>
        </div>
      )}

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[#FF4E1F] text-white py-2.5 text-[15px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
        {mutation.isPending ? "Calculando…" : "Calcular proposta"}
      </button>

      <p className="text-[11px] text-gray-500 leading-relaxed"><b>Proteção técnica:</b> a memória é uma projeção matemática com base nos dados informados. O contrato, a assembleia, o índice efetivo e as regras da administradora sempre prevalecem.</p>
    </form>
  );

  /* ── Painel direito: resultados com abas ────────────────────────────────── */
  const tabs: { id: TabId; label: string }[] = [
    { id: "proposta", label: "1. Dados da proposta" },
    { id: "custos", label: "2. Custos da operação" },
    { id: "correcoes", label: "3. Histórico de correções" },
    { id: "investimentos", label: "4. Consórcio x investimentos" },
    { id: "lance", label: "5. Estrutura do Lance" },
  ];

  const resultsPanel = hasResult ? (
    <div className="space-y-4">
      {/* Navegação por abas */}
      <div className="flex flex-nowrap overflow-x-auto gap-1 border-b border-gray-200 scrollbar-thin">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 text-[12px] md:text-[13px] font-bold transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === t.id ? "border-[#FF4E1F] text-[#FF4E1F]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === "proposta" && (
        <div className="space-y-4">
          {/* KPIs consolidados — linha 1: inicial | linha 2: final */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KpiCard label="Parcela inicial" value={formatBRLCents(result.first.payment)} hint="conforme política de parcelas" tone="negative" />
            <KpiCard label="Carta inicial" value={formatBRLCents(result.credit)} hint="valor informado na proposta" tone="positive" />
            <KpiCard label="Custo da taxa de adm. inicial" value={formatBRLCents(result.costs.taxaContratada)} hint="taxa de administração contratada" tone="negative" />
            <KpiCard label="Parcela final" value={formatBRLCents(result.last.payment)} hint="última parcela projetada" tone="negative" />
            <KpiCard label="Carta final" value={formatBRLCents(result.last.credit)} hint="crédito projetado no último mês" tone="positive" />
            <KpiCard label="Custo da taxa de adm. final" value={formatBRLCents(result.costs.taxaAdmProjetada)} hint="taxa de administração projetada com correções" tone="negative" />
          </div>

          {/* Tabela mensal */}
          <ProposalTable rows={result.rows} />
        </div>
      )}

      {activeTab === "custos" && <CostsTab result={result} />}

      {activeTab === "correcoes" && <CorrectionsTab result={result} />}

      {activeTab === "investimentos" && <InvestmentsTab result={result} inv={result.investments} />}

      {activeTab === "lance" && result.contemplation ? (() => {
        return (
        <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
          {/* KPIs — grid 2×3 (6 quadrantes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <KpiCard label="Carta atualizada" value={formatBRL(result.credit || 0)}
              hint="Valor nominal atualizado." tone="default" />
            <KpiCard label="Carta líquida" value={formatBRL(result.contemplation?.event.creditAvailable || 0)}
              hint="Carta menos embutido." tone="orange" />
            <KpiCard label="Lance total" value={formatBRL(result.contemplation?.event.total || 0)}
              hint="Próprio + FGTS + embutido." tone="orange" />
            <KpiCard label="Força do lance" value={`${((result.contemplation?.event.total || 0) / (result.contemplation?.event.base || 1) * 100).toFixed(1)}%`}
              hint={form.baseDoLance === 'categoria' ? "Em relação à carta + taxas." : "Em relação à carta."} tone={((result.contemplation?.event.total || 0) / (result.contemplation?.event.base || 1) * 100) >= 35 ? "positive" : ((result.contemplation?.event.total || 0) / (result.contemplation?.event.base || 1) * 100) >= 20 ? "orange" : "negative"} />
            <KpiCard label="Parcela antes" value={formatBRLCents((result.contemplation?.rows.find(r => r.month === result.contemplation!.eventMonth - 1)?.payment || 0))}
              hint="Último mês antes da contemplação." tone="default" />
            <KpiCard label="Parcela pós-lance" value={formatBRLCents(result.contemplation?.firstPostPayment || 0)}
              hint="1ª parcela após o lance." tone="default" />
          </div>

          {/* Card Diagnóstico do Lance */}
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
                  Seu lance representa {((result.contemplation?.event.total || 0) / (result.contemplation?.event.base || 1) * 100).toFixed(1)}% da carta. Desse total, {formatBRL((result.contemplation?.event.own || 0) + (result.contemplation?.event.fgts || 0))} saem do seu patrimônio e {formatBRL(result.contemplation?.event.embedded || 0)} serão abatidos diretamente do crédito. Após a contemplação, sua parcela cai para aproximadamente {formatBRLCents(result.contemplation?.firstPostPayment || 0)}. Antes de decidir, compare esse esforço financeiro com outras alternativas disponíveis.
                </p>
              </div>
            </div>
          </div>

          {/* Tabela de Evolução das Parcelas */}
          {result.contemplation?.rows && (
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
                    onClick={(e) => { e.stopPropagation(); }}
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
                      {(result.contemplation?.rows || []).slice(0, expandedLance ? undefined : 10).map((r: any) => (
                        <tr key={r.month} className={`transition-colors ${r.event === "Lance aplicado" ? "bg-yellow-50" : "bg-white"}`}>
                          <td className="px-2 py-1 font-mono text-foreground/70 text-[10.35px]">{r.month}</td>
                          <td className="px-2 py-1 font-mono text-[10.35px] font-semibold">{formatBRL(r.credit)}</td>
                          <td className="px-2 py-1 font-medium text-[10.35px]">
                            {r.tags?.includes('LANCE APÓS PARCELA') ? (
                              <span className="text-[var(--orange)] flex items-center gap-0.5 font-bold">
                                <ArrowUpRight className="w-2 h-2" />
                                Lance aplicado
                              </span>
                            ) : r.phase}
                          </td>
                          <td className="px-2 py-1 text-right font-mono text-[10.35px] text-foreground/80">{r.totalLance > 0 ? formatBRL(r.totalLance) : "—"}</td>
                          <td className={`px-2 py-1 text-right font-mono font-bold text-[10.35px] ${r.tags?.includes('LANCE APÓS PARCELA') ? "text-[var(--orange)]" : "text-foreground"}`}>
                            {r.payment > 0 ? formatBRLCents(r.payment) : "—"}
                          </td>
                          <td className="px-2 py-1 text-right font-mono text-foreground/70 text-[10.35px]">{formatBRL(r.saldoFinal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                {(result.contemplation?.rows?.length || 0) > 10 && (
                  <button onClick={() => setExpandedLance(!expandedLance)} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-[var(--orange)] bg-secondary/5 hover:bg-secondary/20 border-t border-border transition-all">
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedLance ? 'rotate-180' : ''}`} />
                    {expandedLance ? 'Recolher' : 'Ver todas'} ({result.contemplation?.rows?.length || 0})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        );
      })() : null}

      {/* CTA + Transparência */}
      <div className="pt-4 space-y-4">
        <ConsultCTA context="esta análise" />
        <TransparencyBlock />
      </div>
    </div>
  ) : null;

  /* ── Tabela full-width (apenas para aba proposta) ───────────────────────── */
  const scheduleTable = null; // Não usar — a tabela já está dentro da aba

  return (
    <RaioXLayout
      moduleNumber={7}
      title="Estrutura do Plano"
      description="Memória de cálculo detalhada com componentes mês a mês, custos da operação, histórico de correções e comparativo com investimentos."
      descriptionSupport="O simulador replica o racional do contrato: fundo comum, taxa de administração, fundo de reserva, seguro e correções periódicas."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={hasResult}
      scheduleTable={scheduleTable}
    />
  );
}
