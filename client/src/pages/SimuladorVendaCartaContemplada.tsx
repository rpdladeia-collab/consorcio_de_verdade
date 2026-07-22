
import { useState, useEffect, useMemo } from 'react';
import RaioXLayout from '@/components/cdv/RaioXLayout';
import { ConsultCTA, MethodologyBlock } from '@/components/cdv/SimuladorUI';
import { Download } from 'lucide-react';

// Funções de formatação e utilidade
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toBRL = (v: number) => brl.format(Number.isFinite(Number(v)) ? Number(v) : 0);
const toPct = (v: number) => (Number.isFinite(v) ? numFormat.format(Number(v) * 100) + '%' : '—');

const parseFloatSafe = (v: string | number | null | undefined) => {
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

// Função para calcular a TIR (Taxa Interna de Retorno) mensal
function computeIRRMonthly(cashflows: number[]): number {
  const m = cashflows.length;
  if (m === 0) return NaN;
  function npv(r: number): number {
    let s = 0;
    for (let t = 0; t < m; t++) s += cashflows[t] / Math.pow(1 + r, t + 1);
    return s;
  }
  let low = -0.999999, high = 10;
  let npvLow = npv(low), npvHigh = npv(high);
  if (!Number.isFinite(npvLow) || !Number.isFinite(npvHigh)) return NaN;
  if (npvLow * npvHigh > 0) {
    for (let h = 10; h <= 1e6; h *= 2) {
      high = h;
      npvHigh = npv(high);
      if (!Number.isFinite(npvHigh)) break;
      if (npvLow * npvHigh < 0) break;
    }
    if (npvLow * npvHigh > 0) return NaN;
  }
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);
    if (!Number.isFinite(npvMid) || Math.abs(npvMid) < 1e-10) return mid;
    if (npvLow * npvMid < 0) { high = mid; npvHigh = npvMid; }
    else { low = mid; npvLow = npvMid; }
  }
  return (low + high) / 2;
}

export default function SimuladorVendaCartaContemplada() {
  const [valorInicial, setValorInicial] = useState<string>('105960');
  const [parcelaInicial, setParcelaInicial] = useState<string>('661.80');
  const [prazoTotal, setPrazoTotal] = useState<string>('225');
  const [indiceAnual, setIndiceAnual] = useState<string>('6');
  const [parcelaContemplacao, setParcelaContemplacao] = useState<string>('4');
  const [taxaRepasseMensal, setTaxaRepasseMensal] = useState<string>('0.65');
  const [lanceEmbutido, setLanceEmbutido] = useState<string>('0');
  const [lanceRealizado, setLanceRealizado] = useState<string>('0');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const scenarioResult = useMemo(() => {
    const vi = parseFloatSafe(valorInicial);
    const pi = parseFloatSafe(parcelaInicial);
    const iaPct = parseFloatSafe(indiceAnual) / 100;
    const pt = Math.max(1, parseInt(prazoTotal) || 1);
    const pc = Math.min(Math.max(1, parseInt(parcelaContemplacao) || 1), pt);
    const le = parseFloatSafe(lanceEmbutido);
    const lr = parseFloatSafe(lanceRealizado);
    const trm = parseFloatSafe(taxaRepasseMensal) / 100;

    // Tabela de evolução até a contemplação
    let acumulado = 0;
    const evolutionRows = [];
    for (let m = 1; m <= pc; m++) {
      const yearsPassed = Math.floor((m - 1) / 12);
      const cartaAtThisMonth = vi * Math.pow(1 + iaPct, yearsPassed);
      const parcelaAtThisMonth = pi * Math.pow(1 + iaPct, yearsPassed);
      acumulado += parcelaAtThisMonth;
      evolutionRows.push({
        mes: m,
        corrAno: yearsPassed,
        carta: cartaAtThisMonth,
        parcela: parcelaAtThisMonth,
        acumulado: acumulado,
      });
    }

    const refYears = Math.floor((pc - 1) / 12);
    const cartaBaseCorrigida = vi * Math.pow(1 + iaPct, refYears);
    const parcelaBaseCorrigida = pi * Math.pow(1 + iaPct, refYears);
    
    // RACIONAL CORRETO: O Lance Embutido reduz a carta E a parcela proporcionalmente.
    const fatorReducao = cartaBaseCorrigida > 0 ? (cartaBaseCorrigida - le) / cartaBaseCorrigida : 1;
    const cartaReferenciaReal = Math.max(0, cartaBaseCorrigida - le);
    const parcelaReferenciaReal = parcelaBaseCorrigida * fatorReducao;
    const nRemaining = Math.max(0, pt - pc);

    let pv = 0;
    if (nRemaining > 0 && trm > 0) {
      pv = parcelaReferenciaReal * (1 - Math.pow(1 + trm, -nRemaining)) / trm;
    } else if (nRemaining > 0 && trm === 0) {
      pv = parcelaReferenciaReal * nRemaining;
    }

    const valorBruto = Math.max(0, cartaReferenciaReal - pv);
    const totalPagoAteContem = acumulado + lr;
    const retornoLiquido = valorBruto - totalPagoAteContem;
    const ganhoPerc = totalPagoAteContem > 0 ? (retornoLiquido / totalPagoAteContem) : 0;

    // Fluxo para IRR
    const cashflows = [];
    for (let i = 1; i <= pc; i++) cashflows.push(-evolutionRows[i - 1].parcela);
    cashflows.push(valorBruto);
    const irrMonthly = computeIRRMonthly(cashflows);

    return {
      evolutionRows,
      cartaReferencia: cartaReferenciaReal,
      parcelaReferencia: parcelaReferenciaReal,
      nRemaining,
      pv,
      valorBruto,
      totalPagoAteContem,
      retornoLiquido,
      ganhoPerc,
      irrMonthly,
      trm
    };
  }, [valorInicial, parcelaInicial, prazoTotal, indiceAnual, parcelaContemplacao, taxaRepasseMensal, lanceEmbutido, lanceRealizado]);

  const fixedTermResults = useMemo(() => {
    const prazosFixos = [12, 24, 36, 48, 60, 72];
    const vi = parseFloatSafe(valorInicial);
    const pi = parseFloatSafe(parcelaInicial);
    const iaPct = parseFloatSafe(indiceAnual) / 100;
    const pt = Math.max(1, parseInt(prazoTotal) || 1);
    const lr = parseFloatSafe(lanceRealizado);
    const trm = scenarioResult.trm;

    return prazosFixos.filter(p => p <= pt).map(prazoFixo => {
      const refYears = Math.floor((prazoFixo - 1) / 12);
      const cartaRef = vi * Math.pow(1 + iaPct, refYears);
      const parcelaRef = pi * Math.pow(1 + iaPct, refYears);
      const nRem = Math.max(0, pt - prazoFixo);
      let pvRem = 0;
      if (nRem > 0 && trm > 0) pvRem = parcelaRef * (1 - Math.pow(1 + trm, -nRem)) / trm;
      else if (nRem > 0 && trm === 0) pvRem = parcelaRef * nRem;
      const valorBrutoFixo = Math.max(0, cartaRef - pvRem);
      let totalPagoFixo = 0;
      for (let m = 1; m <= prazoFixo; m++) totalPagoFixo += pi * Math.pow(1 + iaPct, Math.floor((m - 1) / 12));
      totalPagoFixo += lr;
      const ganhoLiquido = valorBrutoFixo - totalPagoFixo;
      const ganhoPercFixo = totalPagoFixo > 0 ? (ganhoLiquido / totalPagoFixo) : 0;
      return {
        prazo: prazoFixo,
        ganhoBruto: valorBrutoFixo,
        ganhoLiquido: ganhoLiquido,
        ganhoTotalPct: ganhoPercFixo,
        ganhoMensalPct: prazoFixo > 0 ? Math.pow(1 + ganhoPercFixo, 1 / prazoFixo) - 1 : 0,
      };
    });
  }, [valorInicial, parcelaInicial, prazoTotal, indiceAnual, lanceRealizado, scenarioResult.trm]);

  const handlePdf = async () => {
    if (!hasCalculated) return;
    setPdfLoading(true);
    try {
      const { generatePdfVendaCarta } = await import("@/lib/pdfVendaCarta");
      await generatePdfVendaCarta({
        cartaDisponivel: toBRL(scenarioResult.cartaReferencia),
        retornoLiquido: toBRL(scenarioResult.retornoLiquido),
        valorBruto: toBRL(scenarioResult.valorBruto),
        pv: toBRL(scenarioResult.pv),
        parcelaReferencia: toBRL(scenarioResult.parcelaReferencia),
        simulationId: Math.random().toString(36).substring(7).toUpperCase(),
        generatedAt: new Date().toISOString(),
        form: { valorInicial, parcelaInicial, prazoTotal, parcelaContemplacao, taxaRepasseMensal, lanceEmbutido, lanceRealizado }
      });
    } finally { setPdfLoading(false); }
  };

  const formPanel = (
    <form onSubmit={(e) => { e.preventDefault(); setHasCalculated(true); }} className="space-y-3">
      <div className="text-[14px] md:text-[15px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">Parâmetros</div>
      <div>
        <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">1) Carta de crédito inicial (R$)</label>
        <input type="number" className="input w-full" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">2) Parcela inicial (R$)</label>
          <input type="number" className="input w-full" value={parcelaInicial} onChange={(e) => setParcelaInicial(e.target.value)} />
        </div>
        <div>
          <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">3) Prazo total (meses)</label>
          <input type="number" className="input w-full" value={prazoTotal} onChange={(e) => setPrazoTotal(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">4) Taxa de correção (anual %)</label>
          <input type="number" className="input w-full" value={indiceAnual} onChange={(e) => setIndiceAnual(e.target.value)} />
        </div>
        <div>
          <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">5) Parcela da contemplação (mês)</label>
          <input type="number" className="input w-full" value={parcelaContemplacao} onChange={(e) => setParcelaContemplacao(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">6) Taxa de repasse (mensal)</label>
        <input type="number" className="input w-full" value={taxaRepasseMensal} onChange={(e) => setTaxaRepasseMensal(e.target.value)} />
      </div>
      <div>
        <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">7) Lance embutido (R$)</label>
        <input type="number" className="input w-full" value={lanceEmbutido} onChange={(e) => setLanceEmbutido(e.target.value)} />
      </div>
      <div>
        <label className="block text-[13px] md:text-[14px] font-medium text-foreground/60 mb-1">8) Lance Realizado (R$)</label>
        <input type="number" className="input w-full" value={lanceRealizado} onChange={(e) => setLanceRealizado(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 rounded-lg bg-[var(--orange)] text-white py-2.5 text-[14px] md:text-[15px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">Calcular</button>
        <button type="button" onClick={() => setHasCalculated(false)} className="flex-1 rounded-lg bg-gray-200 text-foreground py-2.5 text-[14px] md:text-[15px] font-bold uppercase tracking-widest hover:bg-gray-300 transition-all">Reset</button>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl border border-border mt-4">
        <p className="text-[10px] font-bold uppercase mb-2">Resumo da lógica</p>
        <ul className="space-y-1 text-[9px] text-foreground/70 list-disc pl-3">
          <li>Tabela de evolução: mostra mês a mês até a contemplação com correções a cada 12 meses.</li>
          <li>Cálculos usam valores de referência NO MÊS DA CONTEMPLAÇÃO.</li>
          <li>PV das parcelas = soma da parcela descontada pela taxa de repasse.</li>
          <li>Valor bruto = (carta referência) − PV.</li>
          <li>Retorno líquido = valor bruto − total pago até a contemplação.</li>
          <li>Ganho (%) = retorno líquido ÷ total pago até contemplação.</li>
        </ul>
      </div>
    </form>
  );

  const resultsPanel = (
    <div className="space-y-4">
      <div className="text-[14px] md:text-[15px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">Projeção de venda - carta contemplada</div>
      {hasCalculated ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
              <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">PV DAS PARCELAS RESTANTES</p>
              <p className="text-lg font-bold">{toBRL(scenarioResult.pv)}</p>
            </div>
            <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
              <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">VALOR BRUTO ESTIMADO</p>
              <p className="text-lg font-bold text-[var(--orange)]">{toBRL(scenarioResult.valorBruto)}</p>
            </div>
            <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
              <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">RETORNO LÍQUIDO</p>
              <p className="text-lg font-bold">{toBRL(scenarioResult.retornoLiquido)}</p>
            </div>
            <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
              <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">GANHO (%)</p>
              <p className="text-lg font-bold">{toPct(scenarioResult.ganhoPerc)}</p>
            </div>
            <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
              <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">RETORNO MENSAL (IRR)</p>
              <p className="text-lg font-bold">{toPct(scenarioResult.irrMonthly)}</p>
            </div>
            <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
              <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">PARCELA (REFERÊNCIA)</p>
              <p className="text-lg font-bold">{toBRL(scenarioResult.parcelaReferencia)}</p>
            </div>
          </div>
          <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
            <p className="text-[9px] font-bold uppercase text-foreground/40 mb-1">CARTA DE CRÉDITO (REFERÊNCIA)</p>
            <p className="text-lg font-bold">{toBRL(scenarioResult.cartaReferencia)}</p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-3 py-2 border-b border-border">
              <p className="text-[10px] font-bold uppercase">CONTEMPLAÇÃO POR SORTEIO (PRAZOS FIXOS)</p>
            </div>
            <table className="w-full text-[10px]">
              <thead className="bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-2 py-2 text-left">Prazo</th>
                  <th className="px-2 py-2 text-right">Ganho Bruto</th>
                  <th className="px-2 py-2 text-right">Ganho Líquido</th>
                  <th className="px-2 py-2 text-right">Ganho Total</th>
                  <th className="px-2 py-2 text-right">Ganho a.m.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fixedTermResults.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-2">{row.prazo}</td>
                    <td className="px-2 py-2 text-right">{toBRL(row.ganhoBruto)}</td>
                    <td className="px-2 py-2 text-right">{toBRL(row.ganhoLiquido)}</td>
                    <td className="px-2 py-2 text-right">{toPct(row.ganhoTotalPct)}</td>
                    <td className="px-2 py-2 text-right">{toPct(row.ganhoMensalPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-3 py-2 border-b border-border">
              <p className="text-[10px] font-bold uppercase">EVOLUÇÃO DO CONSÓRCIO</p>
            </div>
            <table className="w-full text-[10px]">
              <thead className="bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-2 py-2 text-left">Mês</th>
                  <th className="px-2 py-2 text-left">Corr.</th>
                  <th className="px-2 py-2 text-right">Carta</th>
                  <th className="px-2 py-2 text-right">Parcela</th>
                  <th className="px-2 py-2 text-right">Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scenarioResult.evolutionRows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-2">{row.mes}</td>
                    <td className="px-2 py-2">{row.corrAno}</td>
                    <td className="px-2 py-2 text-right">{toBRL(row.carta)}</td>
                    <td className="px-2 py-2 text-right">{toBRL(row.parcela)}</td>
                    <td className="px-2 py-2 text-right">{toBRL(row.acumulado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button onClick={handlePdf} disabled={pdfLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border font-bold text-[14px] md:text-[15px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4 text-[var(--orange)]" />
            {pdfLoading ? "Gerando..." : "Baixar Relatório (PDF)"}
          </button>
        </div>
      ) : (
        <div className="p-8 text-center text-foreground/40 border-2 border-dashed border-border rounded-2xl">
          Aguardando cálculo...
        </div>
      )}
    </div>
  );

  return (
    <RaioXLayout
      moduleNumber={8}
      title="Venda de Carta Contemplada"
      description={<span className="text-white">Simule o valor de venda de uma carta de crédito contemplada, considerando o saldo devedor, taxa de repasse e outros fatores.</span>}
      descriptionSupport="Este simulador ajuda a estimar o valor justo de uma carta contemplada para venda, considerando a matemática financeira."
      formPanel={formPanel}
      resultsPanel={resultsPanel}
      hasResult={hasCalculated}
    />
  );
}
