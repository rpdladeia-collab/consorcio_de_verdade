
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
    <div className="space-y-1.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Carta (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.credit} onChange={(e) => set("credit", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Atualizada</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Prazo</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.totalMonths} onChange={(e) => set("totalMonths", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Meses total</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Mês Canc.</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.canceledMonth} onChange={(e) => set("canceledMonth", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">No mês</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Seguro (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.insurancePct} onChange={(e) => set("insurancePct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">s/ saldo</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Taxa Adm (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.adminRatePct} onChange={(e) => set("adminRatePct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total plano</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Reserva (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.reserveRatePct} onChange={(e) => set("reserveRatePct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total plano</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Reajuste (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.reajustPct} onChange={(e) => set("reajustPct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Anual</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Multa (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.penaltyRatePct} onChange={(e) => set("penaltyRatePct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Cancelamento</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Dev. Reserva?</label>
          <div className="mt-auto flex items-center h-[34px]">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-[var(--orange)] focus:ring-[var(--orange)] cursor-pointer"
              checked={form.reserveReturnable} 
              onChange={(e) => set("reserveReturnable", e.target.checked)} 
            />
            <span className="ml-2 text-[12px] font-bold text-gray-700">Sim</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleAnalyze}
        className="w-full bg-[var(--orange)] text-white font-bold py-2 rounded-full shadow-md hover:opacity-90 transition-opacity uppercase text-[13px] md:text-[14px] tracking-widest mt-1"
      >
        Analisar Cancelamento
      </button>
    </div>
  );

  const resultsPanel = result && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard 
          label="Total Pago" 
          value={formatBRL(result.kpis.totalPaidByClient)} 
          hint="Somatório de todas as parcelas pagas"
          tone="negative" 
        />
        <KpiCard 
          label="Crédito a Receber" 
          value={formatBRL(result.kpis.baseAposMulta)} 
          hint="Valor líquido do fundo comum - multa contratual"
          tone="positive" 
        />
        <KpiCard 
          label="Prejuízo Direto" 
          value={formatBRL(result.kpis.prejuizoDireto)} 
          hint="Diferença entre o pago e o devolvido"
          tone="negative" 
        />
        <KpiCard 
          label="Prejuízo Indireto" 
          value={formatBRL(result.kpis.prejuizoIndireto)} 
          hint="Custo de oportunidade (capitalizado CDI)"
          tone="negative" 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard 
          label="Perda Patrimonial Total" 
          value={formatBRL(result.kpis.perdaPatrimonialTotal)} 
          highlight
        />
        <KpiCard 
          label="Prejuízo Total em %" 
          value={`${result.kpis.prejuizoTotalPct.toFixed(2)}%`} 
          highlight
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-[14px] md:text-[15px] uppercase tracking-widest">
          <AlertCircle className="w-4 h-4" /> Destaques sobre o Cancelamento
        </div>
        <div className="space-y-3 text-[14px] md:text-[15px] text-amber-900 leading-relaxed font-medium">
          <p><strong>Atenção:</strong> O cancelamento de uma cota não contemplada não gera devolução imediata do dinheiro. Você continuará participando dos sorteios mensais na categoria de "excluídos" ou receberá ao final do grupo.</p>
          <p><strong>Fundo de Reserva:</strong> {form.reserveReturnable ? 'Você indicou que seu contrato devolve o fundo de reserva.' : 'Você indicou que NÃO devolve o fundo de reserva. Vale conferir se há jurisprudência no seu estado para contestar esta retenção.'}</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-[14px] md:text-[15px] font-bold uppercase tracking-widest text-gray-800 border-b border-border pb-2">O que você pagou</h3>
        <div className="space-y-2 text-[14px] md:text-[15px]">
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
        <h3 className="text-[14px] md:text-[15px] font-bold uppercase tracking-widest text-gray-800 border-b border-border pb-2">Cálculo da Devolução Líquida</h3>
        <div className="space-y-2 text-[14px] md:text-[15px]">
          <div className="flex justify-between text-gray-800 font-bold">
            <span>Total Investido (Pago)</span>
            <span className="">{formatBRL(result.breakdown.paid.total)}</span>
          </div>
          <div className="flex justify-between text-red-700 font-medium">
            <span>Taxa adm. (serviço prestado)</span>
            <span className="font-bold">− {formatBRL(result.breakdown.return.adminRetained)}</span>
          </div>
          <div className="flex justify-between text-red-700 font-medium">
            <span>Seguro (proteção utilizada)</span>
            <span className="font-bold">− {formatBRL(result.breakdown.return.insuranceRetained)}</span>
          </div>
          {!result.breakdown.return.reserveReturnable && (
            <div className="flex justify-between text-red-700 font-medium">
              <span>Fundo reserva (retido)</span>
              <span className="font-bold">− {formatBRL(result.breakdown.return.reserve)}</span>
            </div>
          )}
          <div className="flex justify-between text-red-700 font-medium">
            <span>Multa de cancelamento ({result.breakdown.return.penaltyPct}%)</span>
            <span className="font-bold">− {formatBRL(result.breakdown.return.penaltyValue)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-dashed border-border font-bold text-[var(--orange)] text-base">
            <span>Valor Líquido a Receber</span>
            <span>{formatBRL(result.breakdown.return.baseAposMulta)}</span>
          </div>
          <p className="text-[10px] text-gray-500 italic mt-2">
            * O valor líquido é calculado subtraindo as taxas retidas e multas do total que você pagou.
          </p>
        </div>
      </div>

      <div className="bg-[#0A0A08] text-white border border-border rounded-xl p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-2 text-[var(--orange)] font-bold text-[14px] md:text-[15px] uppercase tracking-widest">
          <Scale className="w-4 h-4" /> Base Legal e Estratégias de Saída
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-[13px] md:text-[14px] font-bold text-[var(--orange)] uppercase tracking-wider mb-2">Direitos do Consumidor</h4>
              <ul className="space-y-2 text-[13px] md:text-[14px] text-gray-300 leading-relaxed">
                <li><strong className="text-white">Arrependimento:</strong> Até 7 dias após a assinatura, o cancelamento deve ser integral e sem custos (Art. 49 CDC).</li>
                <li><strong className="text-white">Lei 11.795/08:</strong> A devolução ocorre por sorteio mensal ou em até 30 dias após o encerramento do grupo.</li>
                <li><strong className="text-white">Súmula 35 STJ:</strong> A correção monetária sobre os valores devolvidos é obrigatória e inquestionável.</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] md:text-[14px] font-bold text-[var(--orange)] uppercase tracking-wider mb-2">Jurisprudência sobre Multas</h4>
              <p className="text-[13px] md:text-[14px] text-gray-300 leading-relaxed">
                Tribunais frequentemente consideram abusivas multas que somadas (cláusula penal + prejuízo ao grupo) ultrapassam <strong className="text-white">10% a 15%</strong> do valor pago. Se sua retenção for maior, há espaço para contestação judicial.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h4 className="text-[13px] md:text-[14px] font-bold text-[var(--orange)] uppercase tracking-wider mb-2">Estratégia: Mercado Secundário</h4>
              <p className="text-[13px] md:text-[14px] text-gray-300 leading-relaxed mb-3">
                Antes de cancelar, considere <strong className="text-white">vender sua cota</strong> para investidores. No mercado secundário, você pode recuperar uma porcentagem maior do que a devolução da administradora, pois o comprador assume o plano.
              </p>
              <div className="flex items-center gap-3">
                <button className="text-[10px] font-bold text-white bg-white/10 px-3 py-2 rounded uppercase tracking-tighter hover:bg-white/20 transition-colors opacity-50 cursor-not-allowed">
                  Simular venda de cota
                </button>
                <span className="bg-[#FFD700] text-black text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                  Em Breve
                </span>
              </div>
            </div>
            <div className="p-1">
              <p className="text-[10px] text-gray-400 leading-tight italic">
                * Importante: Cada administradora possui um contrato específico. Este simulador utiliza os parâmetros mais comuns do mercado. Consulte sempre o seu regulamento oficial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const scheduleTable = result && (
    <div className="w-full mt-8 print:mt-4">
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setTableOpen(!tableOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-left bg-[#0A0A08] text-white transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-[14px] md:text-[15px] font-bold uppercase tracking-[0.15em]">Memória de Cálculo</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${tableOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {tableOpen && (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-[13px] md:text-[14px] text-left border-collapse">
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
                      ${row.isReajust ? "bg-amber-100/60 border-y-2 border-amber-300/40" : ""}
                      ${row.mes === parseInt(form.canceledMonth) ? "bg-red-100/60 border-y-2 border-red-300/40" : ""}
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
                      {row.isReajust && <span className="text-amber-800">⭐ Reajuste</span>}
                      {row.mes === parseInt(form.canceledMonth) && <span className="text-red-800 ml-2">🛑 Cancelado</span>}
                    </td>
                  </tr>
                ))}
                {/* Linha de Totais */}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td className="px-4 py-3 uppercase text-[10px] tracking-widest" colSpan={2}>Totais Acumulados</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px]">{formatBRL(result.table.reduce((acc: number, r: any) => acc + r.fundoComum, 0))}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px]">{formatBRL(result.table.reduce((acc: number, r: any) => acc + r.taxaAdm, 0))}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px]">{formatBRL(result.table.reduce((acc: number, r: any) => acc + r.fundoReserva, 0))}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px]">{formatBRL(result.table.reduce((acc: number, r: any) => acc + r.seguro, 0))}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-[var(--orange)]">{formatBRL(result.table.reduce((acc: number, r: any) => acc + r.parcela, 0))}</td>
                  <td className="px-4 py-3" colSpan={2}></td>
                </tr>
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
      title="ANTES DE CANCELAR, DESCUBRA QUANTO ESSA DECISÃO VAI CUSTAR."
      description={<span className="text-white">Nem sempre o valor devolvido representa o impacto financeiro da desistência. Esta análise calcula quanto você recupera e quanto patrimônio deixa pelo caminho.</span>}
      descriptionSupport="Simule o impacto real do cancelamento e descubra se a conta fecha antes de desistir."
      formPanel={formPanel}
      hasResult={!!result}
      resultsPanel={resultsPanel}
      scheduleTable={scheduleTable}
    />
  );
}
