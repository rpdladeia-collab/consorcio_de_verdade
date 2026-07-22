
import { useState, useEffect, useMemo } from "react";
import { Download, HelpCircle, ChevronDown } from "lucide-react";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { formatBRL } from "@/components/cdv/SimuladorUI";

// Estilos e utilitários
const toBRL = (v: number) => formatBRL(v);
const toPct = (v: number) => `${v.toFixed(2).replace(".", ",")}%`;

const parseFloatSafe = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v.replace(",", ".")) : v;
  return Number.isFinite(n) ? n : 0;
};

type Mode = "linear" | "nonlinear";

// Parser de faixas não lineares: "1-12: 2500\n13-60: 3200"
function parseRanges(input: string): Map<number, number> {
  const map = new Map<number, number>();
  if (!input.trim()) return map;
  for (const line of input.split("\n")) {
    const m = line.match(/^(\d+)\s*[-–]\s*(\d+)\s*[:=]\s*([\d.,]+)/);
    if (m) {
      const start = parseInt(m[1]);
      const end = parseInt(m[2]);
      const val = parseFloat(m[3].replace(".", "").replace(",", "."));
      for (let i = start; i <= end; i++) map.set(i, val);
    }
  }
  return map;
}

export default function SimuladorCustoOportunidade() {
  // 1. Hooks de Estado sempre no topo
  const [credit, setCredit] = useState("300000");
  const [term, setTerm] = useState("120");
  const [adminRate, setAdminRate] = useState("16");
  const [reserveRate, setReserveRate] = useState("2");
  const [initialCapital, setInitialCapital] = useState("60000");
  const [annualReturn, setAnnualReturn] = useState("10");
  const [appreciation, setAppreciation] = useState("5");
  const [mode, setMode] = useState<Mode>("linear");
  const [ranges, setRanges] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showRacional, setShowRacional] = useState(false);
  const [showTabela, setShowTabela] = useState(false);

  // 2. Cálculos Memorizados
  const results = useMemo(() => {
    const vi = parseFloatSafe(credit);
    const pt = Math.max(1, parseInt(term) || 1);
    const ta = parseFloatSafe(adminRate) / 100;
    const fr = parseFloatSafe(reserveRate) / 100;
    const ci = parseFloatSafe(initialCapital);
    const rentBruta = parseFloatSafe(annualReturn) / 100;
    const correcao = parseFloatSafe(appreciation) / 100;
    const taxaSeguro = 0.00038; // 0,038%

    // Rendimento bruto (sem desconto de IR)
    const monthlyRentBruto = Math.pow(1 + rentBruta, 1 / 12) - 1;

    // Faixas não lineares
    const rangeMap = mode === "nonlinear" ? parseRanges(ranges) : new Map<number, number>();

    let totalPagoConsorcio = 0;
    let saldoInvestimento = ci;
    let cartaAtualizada = vi;
    let saldoDevedor = vi * (1 + ta + fr);
    let correctionFactor = 1;
    
    const progressao = [];

    for (let m = 1; m <= pt; m++) {
      if (m > 1 && (m - 1) % 12 === 0) {
        const fator = (1 + correcao);
        cartaAtualizada *= fator;
        saldoDevedor *= fator;
        correctionFactor *= fator;
      }

      // Parcela base linear
      const parcelaBaseLinear = (vi * (1 + ta + fr)) / pt;
      let parcelaComum = parcelaBaseLinear * correctionFactor;

      // Modo não linear: usar faixa se definida
      if (mode === "nonlinear" && rangeMap.has(m)) {
        parcelaComum = rangeMap.get(m)! * correctionFactor;
      }

      const valorSeguro = saldoDevedor * taxaSeguro;
      const parcelaTotal = parcelaComum + valorSeguro;
      
      totalPagoConsorcio += parcelaTotal;
      saldoDevedor -= parcelaComum;

      // Investimento com rendimento BRUTO
      saldoInvestimento = (saldoInvestimento * (1 + monthlyRentBruto)) + parcelaTotal;

      progressao.push({
        mes: m,
        parcela: parcelaTotal,
        carta: cartaAtualizada,
        investimento: saldoInvestimento
      });
    }

    // Custo de oportunidade calculado sobre o investimento BRUTO
    const custoOportunidade = saldoInvestimento - cartaAtualizada;

    return {
      totalPagoConsorcio,
      cartaFinal: cartaAtualizada,
      patrimonioInvestimento: saldoInvestimento,
      custoOportunidade,
      rentBrutaPct: rentBruta * 100,
      progressao
    };
  }, [credit, term, adminRate, reserveRate, initialCapital, annualReturn, appreciation, mode, ranges]);

  // 3. Funções de Ação
  async function handlePdf() {
    if (!results) return;
    setPdfLoading(true);
    try {
      const { generatePdfCustoOportunidade } = await import("@/lib/pdfCustoOportunidade");
      await generatePdfCustoOportunidade({ 
        ...results, 
        form: { credit, term, adminRate, reserveRate, initialCapital, annualReturn, appreciation, mode, ranges } 
      });
    } catch (err) { 
      console.error("PDF error", err); 
    }
    finally { setPdfLoading(false); }
  }

  const formPanel = (
    <form onSubmit={(e) => { e.preventDefault(); setHasCalculated(true); }} className="space-y-1.5">
      <div className="text-[13px] md:text-[14px] font-bold text-gray-800 mb-1 uppercase tracking-wider">Parâmetros da Comparação</div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Carta de Crédito (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={credit} onChange={(e) => setCredit(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Valor nominal</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Prazo (meses)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={term} onChange={(e) => setTerm(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">1 a 240 meses</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Taxa Adm. (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={adminRate} onChange={(e) => setAdminRate(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total sobre a carta</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Fundo Reserva (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={reserveRate} onChange={(e) => setReserveRate(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Total sobre a carta</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Correção Monetária (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={appreciation} onChange={(e) => setAppreciation(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">INCC, IPCA, etc.</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Capital Inicial (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Para investimento</p>
          </div>
        </div>
        <div className="flex flex-col h-full lg:col-span-2">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Rentabilidade Esperada (% a.a.)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} />
            <p className="text-[10px] text-foreground/40 mt-0.5 leading-tight truncate">CDB, SELIC, Tesouro, etc. <span className="text-[#FF4E1F] font-bold">— Rendimento bruto</span></p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Modelo de parcela</label>
          <div className="mt-auto">
            <select className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="linear">Linear (padrão)</option>
              <option value="nonlinear">Não linear (faixas)</option>
            </select>
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Evolução das parcelas</p>
          </div>
        </div>
      </div>

      {mode === "nonlinear" && (
        <div>
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Faixas não lineares</label>
          <textarea className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--orange)] resize-y" rows={4}
            placeholder={"1-12: 2500\n13-60: 3200"} value={ranges}
            onChange={(e) => setRanges(e.target.value)} />
          <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight">Uma faixa por linha. Formato: início-fim: valor</p>
        </div>
      )}

      <button type="submit" className="w-full rounded-full bg-[#FF4E1F] text-white py-2 text-[13px] md:text-[14px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md mt-1">
        Analisar Custo de Oportunidade
      </button>
    </form>
  );

  const resultsPanel = (
    <div className="space-y-6">
      <div className="text-[14px] md:text-[15px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">A Realidade Matemática</div>
      {hasCalculated ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-foreground/40">TOTAL PAGO NO CONSÓRCIO</p>
              </div>
              <p className="text-xl font-bold">{toBRL(results.totalPagoConsorcio)}</p>
            </div>
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-foreground/40">CARTA DE CRÉDITO FINAL</p>
              </div>
              <p className="text-xl font-bold">{toBRL(results.cartaFinal)}</p>
            </div>
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm border-l-4 border-l-[#FFC93C]">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-foreground/40">PATRIMÔNIO NO INVESTIMENTO <span className="text-[#FF4E1F]">(Bruto)</span></p>
              </div>
              <p className="text-xl font-bold text-[#0A0A08]">{toBRL(results.patrimonioInvestimento)}</p>
              <p className="text-[10px] text-foreground/40 mt-1">Aportes mensais = Parcelas do consórcio</p>
            </div>
            <div className="p-4 bg-white border border-border rounded-xl shadow-sm border-l-4 border-l-[#FF4E1F]">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase text-[#FF4E1F]">CUSTO DE OPORTUNIDADE</p>
              </div>
              <p className="text-2xl font-bold text-[#FF4E1F]">{toBRL(results.custoOportunidade)}</p>
              <p className="text-[10px] text-[#FF4E1F]/60 mt-1">O que você deixou de ganhar ao não investir</p>
            </div>
          </div>
          <div className="p-5 bg-[#FAF5EA] border border-[#E4DCC9] rounded-2xl">
            <h4 className="font-display text-[14px] md:text-[15px] uppercase mb-3">A Ilusão Nominal vs. Realidade</h4>
            <p className="text-[14px] md:text-[15px] text-[#726C60] leading-relaxed">
              Muitas pessoas comparam apenas o <strong>Total Pago</strong> com a <strong>Carta de Crédito</strong>. 
              Isso é um erro grave de matemática financeira. O verdadeiro custo de um consórcio não é apenas a taxa de administração, 
              mas o <strong>Custo de Oportunidade</strong>: o patrimônio que você teria acumulado se tivesse aplicado 
              o capital inicial e os aportes mensais (parcelas) em um investimento conservador.
            </p>
          </div>
          <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setShowTabela(!showTabela)}
              className="w-full bg-[#0A0A08] px-4 py-3 border-b border-border flex justify-between items-center hover:bg-[#1a1a18] transition-colors"
            >
              <p className="text-[13px] md:text-[14px] font-bold uppercase text-white">Auditoria de Fluxo de Caixa (Igualado)</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowRacional(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC93C] text-[#0A0A08] text-[10px] font-bold uppercase rounded-full hover:bg-[#FFD700] transition-colors shadow-sm"
                >
                  <HelpCircle className="w-3 h-3" />
                  Racional
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePdf(); }}
                  disabled={pdfLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#FF4E1F] text-[10px] font-bold uppercase rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-border disabled:opacity-50"
                >
                  <Download className={`w-3 h-3 ${pdfLoading ? 'animate-pulse' : ''}`} />
                  {pdfLoading ? "Gerando..." : "PDF"}
                </button>
                <ChevronDown className={`w-4 h-4 text-[#FF4E1F] transition-transform duration-200 ${showTabela ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {showTabela && (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-[13px] md:text-[14px]">
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
            )}
          </div>
          <p className="text-[12px] text-center text-foreground/60 font-medium italic mt-6 border-t border-border pt-4">
            * Este simulador possui caráter exclusivamente educativo e informativo, não constituindo recomendação financeira ou oferta de investimento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-border bg-gray-50/50 text-center px-10">
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-foreground/30 mb-3">Aguardando Parâmetros</p>
          <p className="text-foreground/50 text-[14px] md:text-[15px] max-w-[280px]">
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
        
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6 text-[14px] md:text-[15px] text-[#1C1A16] leading-relaxed">
          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-[14px] md:text-[15px] mb-2">1. Fluxo de Caixa Igualado</h4>
            <p>
              Para uma comparação justa, o simulador utiliza o conceito de <strong>fluxo de caixa igualado</strong>. Isso significa que cada centavo que você pagaria de parcela no consórcio é, no cenário alternativo, destinado integralmente ao investimento.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-[14px] md:text-[15px] mb-2">2. Custo de Oportunidade</h4>
            <p>
              O custo de oportunidade é calculado como a diferença entre o <strong>patrimônio investido</strong> e o valor da <strong>carta de crédito atualizada</strong>. Isso garante que a comparação seja justa: ambos os cenários refletem o valor real que você teria em mãos.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-[14px] md:text-[15px] mb-2">3. Evolução do Saldo</h4>
            <p>
              O saldo do investimento cresce de forma composta:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Mês 0:</strong> Inicia com o "Capital Inicial" informado.</li>
                <li><strong>Mensalmente:</strong> O saldo anterior rende a taxa mensal e recebe o aporte equivalente à parcela do consórcio daquele mês.</li>
              </ul>
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#FF4E1F] uppercase text-[14px] md:text-[15px] mb-2">4. Correção, Seguros e Modelo de Parcela</h4>
            <p>
              Diferente de simulações simplistas, este motor de cálculo projeta a <strong>correção anual da carta de crédito</strong> e recalcula o <strong>seguro prestamista</strong> mensalmente sobre o saldo devedor atualizado. O modelo de parcela pode ser <strong>linear</strong> (parcelas iguais corrigidas anualmente) ou <strong>não linear</strong> (faixas personalizadas), garantindo flexibilidade para refletir diferentes planos de consórcio.
            </p>
          </section>
        </div>

        <div className="p-6 bg-gray-50 border-t border-border flex justify-end">
          <button 
            onClick={() => setShowRacional(false)}
            className="px-8 py-3 bg-[#0A0A08] text-white text-[14px] md:text-[15px] font-bold uppercase tracking-widest rounded-full hover:bg-[#1C1A16] transition-all"
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
