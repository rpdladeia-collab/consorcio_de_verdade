
import { useState, useMemo } from "react";
import { Download, HelpCircle } from "lucide-react";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { formatBRL } from "@/components/cdv/SimuladorUI";

// Estilos e utilitários
const toBRL = (v: number) => formatBRL(v);
const toPct = (v: number) => `${v.toFixed(2).replace(".", ",")}%`;

const parseFloatSafe = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v.replace(",", ".")) : v;
  return Number.isFinite(n) ? n : 0;
};

export default function SimuladorCustoOportunidade() {
  // 1. Hooks de Estado sempre no topo
  const [credit, setCredit] = useState("300000");
  const [term, setTerm] = useState("120");
  const [adminRate, setAdminRate] = useState("16");
  const [reserveRate, setReserveRate] = useState("2");
  const [initialCapital, setInitialCapital] = useState("60000");
  const [annualReturn, setAnnualReturn] = useState("10");
  const [appreciation, setAppreciation] = useState("5");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showRacional, setShowRacional] = useState(false);

  // 2. Cálculos Memorizados
  const results = useMemo(() => {
    const vi = parseFloatSafe(credit);
    const pt = Math.max(1, parseInt(term) || 1);
    const ta = parseFloatSafe(adminRate) / 100;
    const fr = parseFloatSafe(reserveRate) / 100;
    const ci = parseFloatSafe(initialCapital);
    const rent = parseFloatSafe(annualReturn) / 100;
    const correcao = parseFloatSafe(appreciation) / 100;
    const taxaSeguro = 0.00038; // 0,038%

    const monthlyRent = Math.pow(1 + rent, 1 / 12) - 1;

    let totalPagoConsorcio = 0;
    let saldoInvestimento = ci;
    let cartaAtualizada = vi;
    let saldoDevedor = vi * (1 + ta + fr);
    
    const progressao = [];

    for (let m = 1; m <= pt; m++) {
      if (m > 1 && (m - 1) % 12 === 0) {
        const fator = (1 + correcao);
        cartaAtualizada *= fator;
        saldoDevedor *= fator;
      }

      const parcelaBase = (vi * (1 + ta + fr)) / pt;
      const parcelaComum = parcelaBase * Math.pow(1 + correcao, Math.floor((m - 1) / 12));
      const valorSeguro = saldoDevedor * taxaSeguro;
      const parcelaTotal = parcelaComum + valorSeguro;
      
      totalPagoConsorcio += parcelaTotal;
      saldoDevedor -= (parcelaComum);

      saldoInvestimento = (saldoInvestimento * (1 + monthlyRent)) + parcelaTotal;

      progressao.push({
        mes: m,
        parcela: parcelaTotal,
        carta: cartaAtualizada,
        investimento: saldoInvestimento
      });
    }

    const custoOportunidade = saldoInvestimento - cartaAtualizada;

    return {
      totalPagoConsorcio,
      cartaFinal: cartaAtualizada,
      patrimonioInvestimento: saldoInvestimento,
      custoOportunidade,
      progressao
    };
  }, [credit, term, adminRate, reserveRate, initialCapital, annualReturn, appreciation]);

  // 3. Funções de Ação
  async function handlePdf() {
    if (!results) return;
    setPdfLoading(true);
    try {
      const { generatePdfCustoOportunidade } = await import("@/lib/pdfCustoOportunidade");
      await generatePdfCustoOportunidade({ 
        ...results, 
        form: { credit, term, adminRate, reserveRate, initialCapital, annualReturn, appreciation } 
      });
    } catch (err) { 
      console.error("PDF error", err); 
    }
    finally { setPdfLoading(false); }
  }

  const formPanel = (
    <form onSubmit={(e) => { e.preventDefault(); setHasCalculated(true); }} className="space-y-4">
      <div className="text-sm font-bold text-foreground/80 mb-2 uppercase tracking-wider">Parâmetros da Comparação</div>
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-foreground/60 mb-1">Carta de Crédito (R$)</label>
          <input type="number" className="input w-full" value={credit} onChange={(e) => setCredit(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-foreground/60 mb-1">Prazo (meses)</label>
            <input type="number" className="input w-full" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-foreground/60 mb-1">Taxa Adm. Total (%)</label>
            <input type="number" className="input w-full" value={adminRate} onChange={(e) => setAdminRate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-foreground/60 mb-1">Fundo Reserva (%)</label>
            <input type="number" className="input w-full" value={reserveRate} onChange={(e) => setReserveRate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-foreground/60 mb-1">Correção Monetária (% a.a.)</label>
            <input type="number" className="input w-full" value={appreciation} onChange={(e) => setAppreciation(e.target.value)} />
            <span className="text-[9px] text-foreground/40 mt-0.5 block">INCC, IPCA, IGPM, etc.</span>
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <label className="block text-[11px] font-medium text-foreground/60 mb-1">Capital Inicial p/ Investimento (R$)</label>
          <input type="number" className="input w-full" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-foreground/60 mb-1">Rentabilidade Esperada (% a.a.)</label>
          <input type="number" className="input w-full" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} />
          <span className="text-[9px] text-foreground/40 mt-0.5 block">CDB, SELIC, Tesouro, etc.</span>
        </div>
      </div>
      <button type="submit" className="w-full rounded-full bg-[#FF4E1F] text-white py-3 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg mt-4">
        Analisar Custo de Oportunidade
      </button>
    </form>
  );

  const resultsPanel = (
    <div className="space-y-6">
      <div className="text-sm font-bold text-foreground/80 mb-2 uppercase tracking-wider">A Realidade Matemática</div>
      {hasCalculated ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-foreground/40">TOTAL PAGO NO CONSÓRCIO</p>
                <HelpCircle className="w-3 h-3 text-foreground/20" />
              </div>
              <p className="text-xl font-bold">{toBRL(results.totalPagoConsorcio)}</p>
            </div>
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-foreground/40">CARTA DE CRÉDITO FINAL</p>
                <HelpCircle className="w-3 h-3 text-foreground/20" />
              </div>
              <p className="text-xl font-bold">{toBRL(results.cartaFinal)}</p>
            </div>
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm border-l-4 border-l-[#FFC93C]">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-foreground/40">PATRIMÔNIO NO INVESTIMENTO</p>
                <HelpCircle className="w-3 h-3 text-foreground/20" />
              </div>
              <p className="text-xl font-bold text-[#0A0A08]">{toBRL(results.patrimonioInvestimento)}</p>
              <p className="text-[10px] text-foreground/40 mt-1">Aportes mensais = Parcelas do consórcio</p>
            </div>
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm border-l-4 border-l-[#FF4E1F]">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-[#FF4E1F]">CUSTO DE OPORTUNIDADE</p>
                <HelpCircle className="w-3 h-3 text-[#FF4E1F]/30" />
              </div>
              <p className="text-2xl font-bold text-[#FF4E1F]">{toBRL(results.custoOportunidade)}</p>
              <p className="text-[10px] text-[#FF4E1F]/60 mt-1">O que você deixou de ganhar ao não investir</p>
            </div>
          </div>
          <div className="p-5 bg-[#FAF5EA] border border-[#E4DCC9] rounded-2xl">
            <h4 className="font-display text-sm uppercase mb-3">A Ilusão Nominal vs. Realidade</h4>
            <p className="text-xs text-[#726C60] leading-relaxed">
              Muitas pessoas comparam apenas o <strong>Total Pago</strong> com a <strong>Carta de Crédito</strong>. 
              Isso é um erro grave de matemática financeira. O verdadeiro custo de um consórcio não é apenas a taxa de administração, 
              mas o <strong>Custo de Oportunidade</strong>: o patrimônio que você teria acumulado se tivesse aplicado 
              o capital inicial e os aportes mensais (parcelas) em um investimento conservador.
            </p>
          </div>
          <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm relative">
            <div className="bg-gray-50 px-4 py-3 border-b border-border flex justify-between items-center">
              <p className="text-[11px] font-bold uppercase">Auditoria de Fluxo de Caixa (Igualado)</p>
              <button 
                onClick={() => setShowRacional(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC93C] text-[#0A0A08] text-[10px] font-bold uppercase rounded-full hover:bg-[#FFD700] transition-colors shadow-sm"
              >
                <HelpCircle className="w-3 h-3" />
                Racional
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[#0A0A08] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Mês</th>
                    <th className="px-3 py-2 text-right">Parcela (Aporte)</th>
                    <th className="px-3 py-2 text-right">Carta Atualizada</th>
                    <th className="px-3 py-2 text-right">Saldo Investimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.progressao.filter((_, i) => i === 0 || (i + 1) % 12 === 0 || i === results.progressao.length - 1).map((row) => (
                    <tr key={row.mes} className={row.mes % 12 === 0 ? "bg-orange-50/30" : ""}>
                      <td className="px-3 py-2 font-mono">Mês {row.mes}</td>
                      <td className="px-3 py-2 text-right">{toBRL(row.parcela)}</td>
                      <td className="px-3 py-2 text-right">{toBRL(row.carta)}</td>
                      <td className="px-3 py-2 text-right font-bold text-[#0A0A08]">{toBRL(row.investimento)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button onClick={handlePdf} disabled={pdfLoading} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white border border-border font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm group disabled:opacity-50">
            <Download className={`w-4 h-4 text-[#FF4E1F] ${pdfLoading ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
            {pdfLoading ? "Gerando PDF..." : "Baixar Relatório de Auditoria (PDF)"}
          </button>
          <p className="text-[12px] text-center text-foreground/60 font-medium italic mt-6 border-t border-border pt-4">
            * Este simulador possui caráter exclusivamente educativo e informativo, não constituindo recomendação financeira ou oferta de investimento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-border bg-gray-50/50 text-center px-10">
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-foreground/30 mb-3">Aguardando Parâmetros</p>
          <p className="text-foreground/50 text-sm max-w-[280px]">
            Preencha os dados ao lado para desmascarar o custo real do consórcio vs. investimento.
          </p>
        </div>
      )}
    </div>
  );

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
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">1. Fluxo de Caixa Igualado</h4>
            <p>
              Para uma comparação justa, o simulador utiliza o conceito de <strong>fluxo de caixa igualado</strong>. Isso significa que cada centavo que você pagaria de parcela no consórcio é, no cenário alternativo, destinado integralmente ao investimento.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">2. Rentabilidade do Investimento</h4>
            <p>
              A taxa informada no campo "Rentabilidade Esperada" é aplicada como <strong>taxa nominal mensal equivalente</strong>. 
              <br />
              <span className="inline-block mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs italic">
                <strong>Nota Importante:</strong> O cálculo considera a rentabilidade informada pelo usuário. Recomenda-se informar a <strong>taxa líquida</strong> (já descontado o Imposto de Renda), pois o saldo final do investimento é apresentado como o montante acumulado bruto com base nessa taxa.
              </span>
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">3. Evolução do Saldo</h4>
            <p>
              O saldo do investimento cresce de forma composta:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Mês 0:</strong> Inicia com o "Capital Inicial" informado.</li>
                <li><strong>Mensalmente:</strong> O saldo anterior rende a taxa mensal e recebe o aporte equivalente à parcela do consórcio daquele mês.</li>
              </ul>
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-xs mb-2">4. Correção e Seguros</h4>
            <p>
              Diferente de simulações simplistas, este motor de cálculo projeta a <strong>correção anual da carta de crédito</strong> e recalcula o <strong>seguro prestamista</strong> mensalmente sobre o saldo devedor atualizado, garantindo que o valor do aporte no investimento seja exatamente igual ao custo real que você teria no consórcio.
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
      moduleNumber={6}
      title={'CONSÓRCIO "AUTOPAGÁVEL"? FAÇA A CONTA PRIMEIRO.'}
      description={<span className="text-white">O custo de oportunidade revela quanto patrimônio você deixa de construir ao direcionar o mesmo fluxo de caixa para um consórcio em vez de uma aplicação de renda fixa.</span>}
      descriptionSupport="Compare os dois cenários e descubra o impacto real da sua decisão."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={hasCalculated}
    />
    </>
  );
}
