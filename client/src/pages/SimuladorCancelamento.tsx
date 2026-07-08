
import { useState, useEffect } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { trpc } from "@/lib/trpc";
import { 
  KpiCard, 
  TransparencyBlock, 
  formatBRL 
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { ChevronDown, Scale, AlertCircle } from "lucide-react";

interface FormState {
  credit: string;
  totalMonths: string;
  canceledMonth: string;
  insurancePct: string;
  adminRatePct: string;
  reserveRatePct: string;
  reajustPct: string;
  reajustPeriod: string;
  reserveReturnable: boolean;
  penaltyRatePct: string;
  correctionPct: string;
  cdiAnnualPct: string;
}

const DEFAULT: FormState = {
  credit: "300000",
  totalMonths: "180",
  canceledMonth: "24",
  insurancePct: "0.038",
  adminRatePct: "25",
  reserveRatePct: "0",
  reajustPct: "5",
  reajustPeriod: "12",
  reserveReturnable: false,
  penaltyRatePct: "10",
  correctionPct: "8",
  cdiAnnualPct: "14.75",
};

export default function SimuladorCancelamento() {
  const [form, setForm] = useSessionStorage<FormState>("simulador-cancelamento", DEFAULT);
  const [tableOpen, setTableOpen] = useState(false);

  const set = (k: keyof FormState, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const mutation = trpc.raiox.cancelamento.useMutation();

  const handleAnalyze = () => {
    mutation.mutate({
      credit: parseFloat(form.credit) || 0,
      totalMonths: parseInt(form.totalMonths) || 1,
      canceledMonth: parseInt(form.canceledMonth) || 1,
      insurancePct: parseFloat(form.insurancePct) || 0,
      adminRatePct: parseFloat(form.adminRatePct) || 0,
      reserveRatePct: parseFloat(form.reserveRatePct) || 0,
      reajustPct: parseFloat(form.reajustPct) || 0,
      reajustPeriod: parseInt(form.reajustPeriod) || 12,
      reserveReturnable: form.reserveReturnable,
      penaltyRatePct: parseFloat(form.penaltyRatePct) || 0,
      correctionPct: parseFloat(form.correctionPct) || 0,
      cdiAnnualPct: parseFloat(form.cdiAnnualPct) || 0,
    });
  };

  // Auto-calculate on change
  useEffect(() => {
    const timer = setTimeout(handleAnalyze, 300);
    return () => clearTimeout(timer);
  }, [form]);

  const result = mutation.data;

  const formPanel = (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500 border-b border-border pb-2">Seu Plano</p>
        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Carta atualizada (R$)</span>
            <input type="number" className="input mt-1 w-full" value={form.credit} onChange={(e) => set("credit", e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-bold text-gray-800 uppercase">Prazo total</span>
              <input type="number" className="input mt-1 w-full" value={form.totalMonths} onChange={(e) => set("totalMonths", e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-gray-800 uppercase">Mês cancelamento</span>
              <input type="number" className="input mt-1 w-full" value={form.canceledMonth} onChange={(e) => set("canceledMonth", e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Seguro (% s/ saldo)</span>
            <input type="number" className="input mt-1 w-full" value={form.insurancePct} onChange={(e) => set("insurancePct", e.target.value)} />
            <span className="text-[9px] text-gray-500 mt-1 block font-medium">Ex: 0.038 = 0,038% ao mês</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500 border-b border-border pb-2">Taxas e Reajuste</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Taxa adm. (%)</span>
            <input type="number" className="input mt-1 w-full" value={form.adminRatePct} onChange={(e) => set("adminRatePct", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Fundo reserva (%)</span>
            <input type="number" className="input mt-1 w-full" value={form.reserveRatePct} onChange={(e) => set("reserveRatePct", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Reajuste (%)</span>
            <input type="number" className="input mt-1 w-full" value={form.reajustPct} onChange={(e) => set("reajustPct", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Período</span>
            <select className="input mt-1 w-full" value={form.reajustPeriod} onChange={(e) => set("reajustPeriod", e.target.value)}>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3 py-1">
          <input 
            type="checkbox" 
            id="reserveReturnable" 
            className="w-4 h-4 rounded border-gray-300 text-[var(--orange)] focus:ring-[var(--orange)] cursor-pointer"
            checked={form.reserveReturnable} 
            onChange={(e) => set("reserveReturnable", e.target.checked)} 
          />
          <label htmlFor="reserveReturnable" className="text-xs font-bold text-gray-800 cursor-pointer">
            Devolve fundo reserva?
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500 border-b border-border pb-2">Multa e Correção</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">Multa (%)</span>
            <input type="number" className="input mt-1 w-full" value={form.penaltyRatePct} onChange={(e) => set("penaltyRatePct", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-gray-800 uppercase">CDI (% a.a.)</span>
            <input type="number" className="input mt-1 w-full" value={form.cdiAnnualPct} onChange={(e) => set("cdiAnnualPct", e.target.value)} />
          </label>
        </div>
      </div>

      <div className="bg-gray-50 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-[var(--orange)] font-bold text-[10px] uppercase tracking-widest">
          <Scale className="w-3 h-3" /> Base Legal e Súmulas
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-bold text-gray-800 uppercase">Lei 11.795/2008</p>
            <p className="text-[10px] text-gray-600 leading-tight">Art. 30 — Garante a devolução ao desistente mediante sorteio ou encerramento do grupo.</p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-[10px] font-bold text-gray-800 uppercase">STJ — Temas e Súmulas</p>
            <ul className="list-disc pl-3 space-y-1 text-[10px] text-gray-600">
              <li><strong>Tema 312:</strong> Devolução em até 30 dias após o encerramento do grupo.</li>
              <li><strong>Súmula 35:</strong> A correção monetária das parcelas devolvidas é obrigatória.</li>
            </ul>
          </div>
        </div>
      </div>

      <button 
        onClick={handleAnalyze}
        className="w-full bg-[var(--orange)] text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity uppercase text-xs tracking-widest"
      >
        Analisar Cancelamento
      </button>
    </div>
  );

  const resultsPanel = result && (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total Pago" value={formatBRL(result.kpis.totalPaidByClient)} highlight />
        <KpiCard label="Base a Receber" value={formatBRL(result.kpis.baseAposMulta)} highlight />
        <KpiCard label="Prejuízo Direto" value={formatBRL(result.kpis.prejuizo)} />
        <KpiCard label="Perda Percentual" value={`${result.kpis.prejuizoPct.toFixed(2)}%`} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest">
          <AlertCircle className="w-4 h-4" /> Destaques sobre o Cancelamento
        </div>
        <div className="space-y-3 text-xs text-amber-900 leading-relaxed font-medium">
          <p><strong>Atenção:</strong> O cancelamento de uma cota não contemplada não gera devolução imediata do dinheiro. Você continuará participando dos sorteios mensais na categoria de "excluídos" ou receberá ao final do grupo.</p>
          <p><strong>Fundo de Reserva:</strong> {form.reserveReturnable ? 'Você indicou que seu contrato devolve o fundo de reserva.' : 'Você indicou que NÃO devolve o fundo de reserva. Vale conferir se há jurisprudência no seu estado para contestar esta retenção.'}</p>
          <p><strong>Taxas Retidas:</strong> A administradora tem o direito legal de reter a taxa de administração e o seguro proporcional ao tempo em que você esteve ativo, pois o serviço de gestão foi prestado.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-border pb-2">O que você pagou</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Fundo comum</span>
            <span className="font-bold text-gray-800">{formatBRL(result.breakdown.paid.common)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxa de administração</span>
            <span className="font-bold text-gray-800">{formatBRL(result.breakdown.paid.admin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fundo de reserva</span>
            <span className="font-bold text-gray-800">{formatBRL(result.breakdown.paid.reserve)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seguro</span>
            <span className="font-bold text-gray-800">{formatBRL(result.breakdown.paid.insurance)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-dashed border-border font-bold text-[var(--orange)]">
            <span>Total pago</span>
            <span>{formatBRL(result.breakdown.paid.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-border pb-2">Sua perda direta</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-green-700 font-medium">
            <span>Fundo comum (devolução base)</span>
            <span className="font-bold">+ {formatBRL(result.breakdown.return.common)}</span>
          </div>
          <div className="flex justify-between text-red-700 font-medium">
            <span>Taxa adm. (retida)</span>
            <span className="font-bold">− {formatBRL(result.breakdown.return.adminRetained)}</span>
          </div>
          <div className="flex justify-between text-red-700 font-medium">
            <span>Seguro (não devolvido)</span>
            <span className="font-bold">− {formatBRL(result.breakdown.return.insuranceRetained)}</span>
          </div>
          <div className="flex justify-between text-red-700 font-medium">
            <span>Fundo reserva ({result.breakdown.return.reserveReturnable ? 'devolvido' : 'retido'})</span>
            <span className="font-bold">{result.breakdown.return.reserveReturnable ? '+' : '−'} {formatBRL(result.breakdown.return.reserve)}</span>
          </div>
          <div className="flex justify-between text-red-700 font-medium">
            <span>Multa de cancelamento ({result.breakdown.return.penaltyPct}%)</span>
            <span className="font-bold">− {formatBRL(result.breakdown.return.penaltyValue)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-dashed border-border font-bold text-gray-900">
            <span>Base líquida a receber</span>
            <span>{formatBRL(result.breakdown.return.baseAposMulta)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-border pb-2">Custo de oportunidade</h3>
        <div className="space-y-3">
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            Seu dinheiro fica parado na administradora enquanto aguarda sorteio ou encerramento do grupo. Esse é o custo financeiro real.
          </p>
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-red-800 uppercase">Perda vs CDI ({form.cdiAnnualPct}%)</span>
              <span className="text-lg font-black text-red-700">{formatBRL(result.kpis.custoOportunidade)}</span>
            </div>
          </div>
        </div>
      </div>

      <TransparencyBlock 
        headline="O que diz a regra do jogo?"
        narrative={
          <>
            <p>A devolução não contempla o valor total pago porque o consórcio é uma prestação de serviço. A taxa de administração remunera a gestão do grupo, e o seguro protege a coletividade.</p>
            <p>O simulador utiliza a <strong>Súmula 35 do STJ</strong> como premissa para a correção monetária, garantindo que o seu fundo comum não perca poder de compra até o recebimento.</p>
          </>
        }
      />
    </div>
  );

  const scheduleTable = result && (
    <div className="w-full mt-8 print:mt-4">
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setTableOpen(!tableOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-800">Racional mês a mês (Memória de Cálculo)</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter font-medium">Visualização da evolução do saldo devedor e reajustes periódicos</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${tableOpen ? "rotate-180" : ""}`} />
        </button>
        
        {tableOpen && (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[9px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-b border-border">Mês</th>
                  <th className="px-4 py-3 border-b border-border text-right">Saldo Inicial</th>
                  <th className="px-4 py-3 border-b border-border text-right">Fundo Comum</th>
                  <th className="px-4 py-3 border-b border-border text-right">Taxa Adm</th>
                  <th className="px-4 py-3 border-b border-border text-right">Reserva</th>
                  <th className="px-4 py-3 border-b border-border text-right">Seguro</th>
                  <th className="px-4 py-3 border-b border-border text-right">Parcela</th>
                  <th className="px-4 py-3 border-b border-border text-right">Saldo Final</th>
                  <th className="px-4 py-3 border-b border-border">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((row: any) => (
                  <tr 
                    key={row.mes} 
                    className={`
                      border-b border-border transition-colors hover:bg-gray-50
                      ${row.isReajust ? "bg-amber-50" : ""}
                      ${row.mes === parseInt(form.canceledMonth) ? "bg-red-50" : ""}
                    `}
                  >
                    <td className="px-4 py-2 font-bold">{row.mes}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatBRL(row.saldoDevedorInicial)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatBRL(row.fundoComum)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatBRL(row.taxaAdm)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatBRL(row.fundoReserva)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatBRL(row.seguro)}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-[var(--orange)]">{formatBRL(row.parcela)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatBRL(row.saldoDevedorFinal)}</td>
                    <td className="px-4 py-2 text-[9px] font-bold uppercase">
                      {row.isReajust && <span className="text-amber-700">⭐ Reajuste</span>}
                      {row.mes === parseInt(form.canceledMonth) && <span className="text-red-700 ml-2">🛑 Cancelado</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <RaioXLayout
      moduleNumber={9}
      title="Custo de Cancelamento"
      description="Descubra quanto você realmente recebe de volta e qual o seu prejuízo real ao cancelar a cota."
      descriptionSupport="Cálculo preciso considerando reajustes periódicos do contrato e custo de oportunidade."
      formPanel={formPanel}
      hasResult={true} // Forçado para garantir que os cards apareçam
      scheduleTable={scheduleTable}
    >
      {resultsPanel}
    </RaioXLayout>
  );
}
