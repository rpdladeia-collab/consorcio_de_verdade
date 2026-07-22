/**
 * Módulo 4 — Raio-X da Eficiência da Taxa
 * Layout: RaioXLayout
 * Matemática: Degradação Progressiva e Dinheiro Novo
 */

import { useState, useEffect, useMemo } from "react";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { ImportToggle } from "@/components/cdv/ImportToggle";
import {
  KpiCard, ConsultCTA, PdfButton,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { AlertCircle, Info, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

function brl0(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(isFinite(v) ? v : 0);
}
function pct2(v: number) {
  return `${(isFinite(v) ? v : 0).toFixed(2).replace(".", ",")}%`;
}

interface FormState {
  credit: string;
  adminPct: string;
  paid: string;
  own: string;
  fgts: string;
  embedded: string;
  correcaoAnualPct: string;
}

const DEFAULT: FormState = {
  credit: "300000",
  adminPct: "16",
  paid: "12",
  own: "60000",
  fgts: "0",
  embedded: "60000",
  correcaoAnualPct: "6",
};

export default function SimuladorProporcaoTaxa() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showRacional, setShowRacional] = useState(false);

  const { baseParams, hasData } = useSimuladorStore();
  const [importEnabled, setImportEnabled] = useState(hasData);

  useEffect(() => {
    if (importEnabled && baseParams) {
      setForm((prev) => ({
        ...prev,
        credit: String(baseParams.credit),
        adminPct: String(baseParams.adminRate),
        totalParcelas: String(baseParams.term),
      }));
    } else if (!importEnabled) {
      setForm(DEFAULT);
    }
  }, [importEnabled, baseParams]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // --- MOTOR MATEMÁTICO: EFICIÊNCIA E DEGRADAÇÃO ---
  const { 
    progressao, 
    selectedMonth, 
    currentCreditAtMonth, 
    currentAdminAtMonth, 
    liquidAtMonth, 
    totalPaidAtMonth, 
    newMoneyAtMonth, 
    taxOnNewMoney, 
    weightIncrease,
    adminPctNum,
    embeddedNum
  } = useMemo(() => {
    const creditNum = Number(form.credit) || 0;
    const adminPctNum = Number(form.adminPct) || 0;
    const paidNum = Number(form.paid) || 0;
    const ownNum = Number(form.own) || 0;
    const fgtsNum = Number(form.fgts) || 0;
    const embeddedNum = Number(form.embedded) || 0;
    const termNum = 120; // prazo padrão em meses
    const correctionPctNum = Number(form.correcaoAnualPct) || 0;

    const adminTotalValue = creditNum * (adminPctNum / 100);
    
    const progressao = [];
    let currentCredit = creditNum;
    let totalDisbursed = ownNum + fgtsNum;
    let currentAdminValue = adminTotalValue;

    for (let m = 0; m <= termNum; m += 5) {
      if (m > 0 && m % 12 === 0) {
        currentCredit *= (1 + correctionPctNum / 100);
        currentAdminValue = currentCredit * (adminPctNum / 100);
      }

      const currentLiquidCredit = currentCredit - embeddedNum;
      const avgParcela = (currentCredit * (1 + adminPctNum / 100)) / termNum;
      if (m > 0) totalDisbursed += avgParcela * 5;

      const currentNewMoney = Math.max(0, currentLiquidCredit - totalDisbursed);
      const effectiveTax = currentNewMoney > 0 ? (currentAdminValue / currentNewMoney) * 100 : 0;
      const efficiency = currentNewMoney > 0 ? (currentNewMoney / currentLiquidCredit) * 100 : 0;

      progressao.push({
        mes: m,
        disbursed: totalDisbursed,
        newMoney: currentNewMoney,
        effectiveTax: effectiveTax,
        efficiency: efficiency,
        degradation: 100 - efficiency
      });
    }

    const selectedMonth = Math.min(paidNum, termNum);
    const currentCreditAtMonth = creditNum * Math.pow(1 + correctionPctNum / 100, Math.floor(selectedMonth / 12));
    const currentAdminAtMonth = currentCreditAtMonth * (adminPctNum / 100);
    const liquidAtMonth = currentCreditAtMonth - embeddedNum;
    
    let calculatedTotalPaidAtMonth = ownNum + fgtsNum;
    let currentCreditForPaidCalc = creditNum;
    let currentInstallmentValue = (currentCreditForPaidCalc * (1 + adminPctNum / 100)) / termNum;

    for (let i = 1; i <= selectedMonth; i++) {
      if (i > 0 && i % 12 === 0) {
        currentCreditForPaidCalc *= (1 + correctionPctNum / 100);
        currentInstallmentValue = (currentCreditForPaidCalc * (1 + adminPctNum / 100)) / termNum;
      }
      calculatedTotalPaidAtMonth += currentInstallmentValue;
    }

    const totalPaidAtMonth = calculatedTotalPaidAtMonth;
    const newMoneyAtMonth = Math.max(0, liquidAtMonth - totalPaidAtMonth);
    const taxOnNewMoney = newMoneyAtMonth > 0 ? (currentAdminAtMonth / newMoneyAtMonth) * 100 : 0;
    const weightIncrease = adminPctNum > 0 ? ((taxOnNewMoney / adminPctNum) - 1) * 100 : 0;

    return { 
      progressao, 
      selectedMonth, 
      currentCreditAtMonth, 
      currentAdminAtMonth, 
      liquidAtMonth, 
      totalPaidAtMonth, 
      newMoneyAtMonth, 
      taxOnNewMoney, 
      weightIncrease,
      adminPctNum,
      embeddedNum
    };
  }, [form.credit, form.adminPct, form.paid, form.own, form.fgts, form.embedded, form.correcaoAnualPct]);

  async function handlePdf() {
    if (!hasCalculated) return;
    setPdfLoading(true);
    try {
      const { generatePdfProporcaoTaxa } = await import("@/lib/pdfProporcaoTaxa");
      await generatePdfProporcaoTaxa({
        kpis: {
          nominal: adminPctNum,
          onLiquid: (currentAdminAtMonth / liquidAtMonth) * 100,
          onNew: taxOnNewMoney,
          penalty: weightIncrease
        },
        adminValue: currentAdminAtMonth,
        liquidCredit: liquidAtMonth,
        newMoney: newMoneyAtMonth,
        meter: {
          widthPct: Math.min(100, (taxOnNewMoney / 50) * 100),
          label: taxOnNewMoney > 40 ? "Crítico" : taxOnNewMoney > 25 ? "Alto" : "Moderado",
          cls: taxOnNewMoney > 40 ? "bg-red-500" : taxOnNewMoney > 25 ? "bg-orange-500" : "bg-blue-500",
          text: "Análise baseada no custo real sobre o dinheiro novo."
        },
        readboxes: [
          { title: "Valor da administração", body: `R$ ${brl0(currentAdminAtMonth)}`, formula: "carta atualizada × taxa nominal" },
          { title: "Carta líquida", body: `R$ ${brl0(liquidAtMonth)}`, formula: "carta atualizada − embutido" },
          { title: "Dinheiro novo", body: `R$ ${brl0(newMoneyAtMonth)}`, formula: "carta líquida − desembolso total" }
        ],
        table: [
          { indicator: "Taxa adm. em R$ (Atual)", value: brl0(currentAdminAtMonth), reading: "Taxa nominal sobre a carta atualizada." },
          { indicator: "Carta líquida", value: brl0(liquidAtMonth), reading: "Crédito disponível para compra." },
          { indicator: "Desembolso Total", value: brl0(totalPaidAtMonth), reading: "Parcelas pagas + recursos próprios." },
          { indicator: "Dinheiro Novo", value: brl0(newMoneyAtMonth), reading: "Base real de eficiência." }
        ],
        simulationId: Math.random().toString(36).substring(7).toUpperCase(),
        generatedAt: new Date().toISOString(),
        form: {
          credit: form.credit,
          adminPct: form.adminPct,
          paid: form.paid,
          own: form.own,
          fgts: form.fgts,
          embedded: form.embedded,
          basis: 'newMoney'
        }
      });
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setPdfLoading(false);
    }
  }

  const formPanel = (
    <div className="space-y-1.5">
      <div className="scale-90 origin-left -mb-2">
        <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      </div>
      <p className="font-bold text-[13px] md:text-[14px] text-gray-800 uppercase tracking-wider mb-1">
        Dados do plano
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Carta (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.credit} onChange={(e) => set("credit", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Valor nominal</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Taxa Adm (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.adminPct} onChange={(e) => set("adminPct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total plano</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Pagas</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.paid} onChange={(e) => set("paid", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Parcelas</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Próprio (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.own} onChange={(e) => set("own", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Recurso livre</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">FGTS (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Uso imobiliário</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Embutido (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Reduz a carta</p>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate uppercase">Correção (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={form.correcaoAnualPct} onChange={(e) => set("correcaoAnualPct", e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Anual projetada</p>
          </div>
        </div>
      </div>
      <button onClick={() => setHasCalculated(true)} className="w-full rounded-full bg-[var(--orange)] text-white py-2 text-[13px] md:text-[14px] font-bold uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98] mt-2 shadow-md">
        Calcular proporção da taxa
      </button>
    </div>
  );

  const resultsPanel = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard label="Taxa Nominal (Contratual)" value={pct2(adminPctNum)} hint="Taxa de administração contratual" />
        <KpiCard label="Taxa sobre Carta Líquida" value={pct2((currentAdminAtMonth / liquidAtMonth) * 100)} hint="Proporção sobre a carta após embutido" />
        <KpiCard label="Taxa sobre Dinheiro Novo" value={pct2(taxOnNewMoney)} highlight={true} hint="O indicador que mostra o custo real da operação." />
        <KpiCard label="Peso Adicional da Taxa" value={pct2(weightIncrease)} tone="negative" hint="Diferença entre taxa real e nominal" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase text-amber-800 mb-2">Termômetro de Proporção</p>
        <div className="h-3 w-full bg-amber-200 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, (taxOnNewMoney / 50) * 100)}%` }}></div>
        </div>
        <p className="text-[14px] md:text-[15px] text-amber-900 mt-2 font-medium">
          {taxOnNewMoney > 40 ? "Crítico: O custo real da taxa está extremamente alto sobre o dinheiro novo." : 
           taxOnNewMoney > 25 ? "Atenção: A taxa efetiva subiu de forma relevante quando medida sobre o valor líquido recebido." : 
           "Moderado: A proporção da taxa está dentro dos parâmetros esperados para este nível de lance."}
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="bg-ink p-3 text-white flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase">Tabela de Indicadores</span>
          <button 
            onClick={() => setShowRacional(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#FFC93C] text-black rounded text-[10px] font-bold uppercase hover:bg-white transition-colors"
          >
            <Info className="w-3 h-3" />
            Racional
          </button>
        </div>
        <table className="w-full text-[14px] md:text-[15px]">
          <tbody className="divide-y divide-border">
            {[
              { label: "Taxa adm. em R$", value: brl0(currentAdminAtMonth), desc: "Taxa nominal multiplicada pela carta cheia." },
              { label: "Carta cheia", value: brl0(currentCreditAtMonth), desc: "Base comercial do contrato." },
              { label: "Lance embutido", value: brl0(embeddedNum), desc: "Reduz crédito disponível; não é dinheiro novo." },
              { label: "Carta líquida após embutido", value: brl0(liquidAtMonth), desc: "Carta disponível para compra." },
              { label: "Parcelas pagas + recursos próprios", value: brl0(totalPaidAtMonth), desc: "Desembolsos que reduzem a leitura de dinheiro novo." },
              { label: "Dinheiro novo efetivo", value: brl0(newMoneyAtMonth), desc: "Base econômica mais rigorosa." },
              { label: "Taxa sobre dinheiro novo", value: pct2(taxOnNewMoney), desc: "Indicador principal de eficiência.", bold: true }
            ].map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-3 font-medium text-foreground/70">{row.label}</td>
                <td className={`p-3 text-right font-mono ${row.bold ? 'font-bold text-orange-600' : ''}`}>{row.value}</td>
                <td className="p-3 text-foreground/40 hidden sm:table-cell">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-[14px] md:text-[15px] font-bold text-red-900 uppercase">Alerta de eficiência</p>
            <p className="text-[14px] md:text-[15px] text-red-800 mt-1">A eficiência projetada caiu ao longo do prazo. Isso significa que o custo da operação aumenta proporcionalmente quando comparado ao dinheiro novo utilizado.</p>
          </div>
        </div>

      </div>

      <PdfButton onClick={handlePdf} loading={pdfLoading} />
      <ConsultCTA />

      {/* MODAL RACIONAL */}
      {showRacional && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF5EA] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#DDD6C8] animate-in zoom-in-95 duration-200">
            <div className="bg-[#0A0A08] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Archivo_Black'] text-xl uppercase tracking-tight">Racional do Cálculo</h3>
                <p className="text-[#C9C4B8] text-[14px] md:text-[15px] mt-1 font-['IBM_Plex_Mono'] uppercase tracking-widest">Entenda a Eficiência do seu Crédito</p>
              </div>
              <button onClick={() => setShowRacional(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <section>
                <h4 className="text-[#0A0A08] font-bold text-[14px] md:text-[15px] uppercase mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#FF4E1F]"></div>
                  O Conceito de "Dinheiro Novo"
                </h4>
                <p className="text-[#726C60] text-[14px] md:text-[15px] leading-relaxed">
                  A taxa de administração nominal (ex: 16%) é calculada sobre o <strong>crédito total</strong>. No entanto, quando você dá um lance (embutido ou próprio) e paga parcelas, você não está "usando" todo esse dinheiro. 
                  O <strong>Dinheiro Novo</strong> é o que realmente sobra na sua mão para comprar o bem após subtrair tudo o que você já desembolsou ou abateu do crédito.
                </p>
              </section>

              <section className="bg-white/50 border border-[#DDD6C8] rounded-xl p-4">
                <h4 className="text-[#0A0A08] font-bold text-[14px] md:text-[15px] uppercase mb-3">Como a eficiência é medida:</h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-[14px] md:text-[15px]">
                    <span className="font-bold text-[#FF4E1F]">01.</span>
                    <p className="text-[#726C60]"><strong>Carta Líquida:</strong> É o valor da carta atualizada menos o lance embutido.</p>
                  </li>
                  <li className="flex gap-3 text-[14px] md:text-[15px]">
                    <span className="font-bold text-[#FF4E1F]">02.</span>
                    <p className="text-[#726C60]"><strong>Dinheiro Novo:</strong> É a Carta Líquida menos o que você já pagou (lance próprio + FGTS + parcelas acumuladas).</p>
                  </li>
                  <li className="flex gap-3 text-[14px] md:text-[15px]">
                    <span className="font-bold text-[#FF4E1F]">03.</span>
                    <p className="text-[#726C60]"><strong>Taxa Real:</strong> Dividimos o valor total da taxa de administração pelo "Dinheiro Novo". Isso revela quanto você realmente paga pelo capital que está utilizando.</p>
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="text-[#0A0A08] font-bold text-[14px] md:text-[15px] uppercase mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#FF4E1F]"></div>
                  Degradação Progressiva
                </h4>
                <p className="text-[#726C60] text-[14px] md:text-[15px] leading-relaxed">
                  Conforme o tempo passa e você paga mais parcelas, o seu "Dinheiro Novo" diminui (pois você está devolvendo o capital). Como a taxa de administração já foi definida sobre o montante total inicial, o <strong>custo proporcional</strong> dessa taxa aumenta a cada mês, reduzindo a eficiência financeira do plano.
                </p>
              </section>

              <div className="pt-4 border-t border-[#DDD6C8] flex justify-end">
                <button 
                  onClick={() => setShowRacional(false)}
                  className="px-6 py-2 bg-[#0A0A08] text-white text-[14px] md:text-[15px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#FF4E1F] transition-colors"
                >
                  Entendi o Racional
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <RaioXLayout
      moduleNumber={4}
      title="Raio-X da Eficiência da Taxa"
      description="A taxa parece pequena no contrato. Mas quanto ela pesa no dinheiro que você realmente usa?"
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={hasCalculated}
    />
  );
}
