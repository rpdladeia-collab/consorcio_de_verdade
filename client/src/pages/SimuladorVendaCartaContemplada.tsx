
import { useState, useMemo, useEffect } from 'react';
import RaioXLayout from '@/components/cdv/RaioXLayout';
import { ConsultCTA, MethodologyBlock } from '@/components/cdv/SimuladorUI';

// Funções de formatação e utilidade
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toBRL = (v: number) => brl.format(Number.isFinite(Number(v)) ? Number(v) : 0);
const toPct = (v: number) => (Number.isFinite(v) ? numFormat.format(Number(v) * 100) + '%' : '—');

const parseFloatSafeString = (s: string | number | null | undefined) => {
  if (s === null || s === undefined) return 0;
  s = String(s).trim().replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
const parseFloatSafe = (v: string | number | null | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Função para calcular a TIR (Taxa Interna de Retorno) mensal
function computeIRRMonthly(cashflows: number[]): number {
  const m = cashflows.length;
  if (m === 0) return NaN;

  function npv(r: number): number {
    let s = 0;
    for (let t = 0; t < m; t++) {
      s += cashflows[t] / Math.pow(1 + r, t + 1);
    }
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
    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }
  return (low + high) / 2;
}

export default function SimuladorVendaCartaContemplada() {
  const [valorInicial, setValorInicial] = useState<string>('105960');
  const [parcelaInicial, setParcelaInicial] = useState<string>('661.80');
  const [prazoTotal, setPrazoTotal] = useState<string>('225');
  const [indiceAnual, setIndiceAnual] = useState<string>('0');
  const [parcelaContemplacao, setParcelaContemplacao] = useState<string>('4');
  const [taxaRepasseMensal, setTaxaRepasseMensal] = useState<string>('0.65');
  const [taxaFormato, setTaxaFormato] = useState<string>('auto');
  const [lanceEmbutido, setLanceEmbutido] = useState<string>('0');
  const [lanceRealizado, setLanceRealizado] = useState<string>('0');
  const [hasCalculated, setHasCalculated] = useState(false);

  const scenarioResult = useMemo(() => {
    const vi = parseFloatSafe(valorInicial);
    const pi = parseFloatSafe(parcelaInicial);
    const iaPct = parseFloatSafe(indiceAnual) / 100;
    let pc = Math.max(1, parseInt(parcelaContemplacao) || 1);
    const pt = Math.max(1, parseInt(prazoTotal) || 1);
    pc = Math.min(pc, pt); // segurança: não pode ser maior que prazo
    const le = parseFloatSafe(lanceEmbutido);
    const lr = parseFloatSafe(lanceRealizado);

    const taxaInputRaw = taxaRepasseMensal || '';
    const tf = taxaFormato || 'auto';
    const taxaNum = parseFloatSafeString(taxaInputRaw);

    let trm: number;
    let trmFactor: number;
    if (taxaNum <= 0) {
      trm = 0;
      trmFactor = 1;
    } else {
      if (tf === 'factor') {
        trmFactor = taxaNum;
        trm = taxaNum - 1;
      } else if (tf === 'percent') {
        trm = taxaNum / 100;
        trmFactor = 1 + trm;
      } else {
        const s = String(taxaInputRaw).trim().replace(',', '.');
        if (s.startsWith('1.') && !s.startsWith('1.0e')) {
          trmFactor = taxaNum;
          trm = taxaNum - 1;
        } else {
          trm = taxaNum / 100;
          trmFactor = 1 + trm;
        }
      }
    }

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

    // Valores de referência NO MÊS DA CONTEMPLAÇÃO
    const refYears = Math.floor((pc - 1) / 12);
    const parcelaReferencia = pi * Math.pow(1 + iaPct, refYears);
    const cartaReferencia = vi * Math.pow(1 + iaPct, refYears);

    // Parcelas restantes
    const nRemaining = Math.max(0, pt - pc);

    // PV das parcelas restantes
    let pv = 0;
    if (nRemaining > 0 && trm > 0) {
      pv = parcelaReferencia * (1 - Math.pow(1 + trm, -nRemaining)) / trm;
    } else if (nRemaining > 0 && trm === 0) {
      pv = parcelaReferencia * nRemaining;
    }

    // Valor bruto
    const valorBruto = Math.max(0, cartaReferencia - pv);

    // Total pago até contemplação
    const totalPagoAteContem = (evolutionRows.length ? evolutionRows[evolutionRows.length - 1].acumulado : 0) + lr;

    // Retorno líquido
    const retornoLiquido = valorBruto - totalPagoAteContem;

    // Ganho %
    const ganhoPerc = totalPagoAteContem > 0 ? (retornoLiquido / totalPagoAteContem) : NaN;

    // Fluxo para IRR
    const cashflows = [];
    for (let i = 1; i <= pc; i++) {
      cashflows.push(-evolutionRows[i - 1].parcela);
    }
    cashflows.push(valorBruto);
    const irrMonthly = computeIRRMonthly(cashflows);

    const cartaDisponivel = cartaReferencia - le;

    return {
      evolutionRows,
      cartaReferencia,
      parcelaReferencia,
      nRemaining,
      pv,
      valorBruto,
      totalPagoAteContem,
      retornoLiquido,
      ganhoPerc,
      irrMonthly,
      taxaRepasseMensalFactor: trmFactor,
      cartaDisponivel,
      trm
    };
  }, [valorInicial, parcelaInicial, prazoTotal, indiceAnual, parcelaContemplacao, taxaRepasseMensal, taxaFormato, lanceEmbutido, lanceRealizado]);

  const fixedTermResults = useMemo(() => {
    const prazosFixos = [12, 24, 36, 48, 60, 72];
    const results = [];

    const vi = parseFloatSafe(valorInicial);
    const pi = parseFloatSafe(parcelaInicial);
    const iaPct = parseFloatSafe(indiceAnual) / 100;
    const pt = Math.max(1, parseInt(prazoTotal) || 1);
    const lr = parseFloatSafe(lanceRealizado);
    const trm = scenarioResult.trm;

    prazosFixos.forEach(prazoFixo => {
      if (prazoFixo > pt) return; // não simula prazos maiores que o total

      const refYears = Math.floor((prazoFixo - 1) / 12);
      const parcelaRef = pi * Math.pow(1 + iaPct, refYears);
      const cartaRef = vi * Math.pow(1 + iaPct, refYears);

      const nRem = Math.max(0, pt - prazoFixo);

      let pvRem = 0;
      if (nRem > 0 && trm > 0) {
        pvRem = parcelaRef * (1 - Math.pow(1 + trm, -nRem)) / trm;
      } else if (nRem > 0 && trm === 0) {
        pvRem = parcelaRef * nRem;
      }

      const valorBrutoFixo = Math.max(0, cartaRef - pvRem);

      let totalPagoFixo = 0;
      for (let m = 1; m <= prazoFixo; m++) {
        const years = Math.floor((m - 1) / 12);
        const parcela = pi * Math.pow(1 + iaPct, years);
        totalPagoFixo += parcela;
      }
      totalPagoFixo += lr;

      const ganhoLiquido = valorBrutoFixo - totalPagoFixo;
      const ganhoPercFixo = totalPagoFixo > 0 ? (ganhoLiquido / totalPagoFixo) : 0;
      const ganhoMensal = prazoFixo > 0 ? Math.pow(1 + ganhoPercFixo, 1 / prazoFixo) - 1 : 0;

      results.push({
        prazo: prazoFixo,
        ganhoBruto: valorBrutoFixo,
        ganhoLiquido: ganhoLiquido,
        ganhoTotalPct: ganhoPercFixo,
        ganhoMensalPct: ganhoMensal,
      });
    });
    return results;
  }, [valorInicial, parcelaInicial, prazoTotal, indiceAnual, lanceRealizado, scenarioResult.trm]);

  const handleCalculate = () => {
    setHasCalculated(true);
  };

  const handleReset = () => {
    setValorInicial('105960');
    setParcelaInicial('661.80');
    setPrazoTotal('225');
    setIndiceAnual('0');
    setParcelaContemplacao('4');
    setTaxaRepasseMensal('0.65');
    setTaxaFormato('auto');
    setLanceEmbutido('0');
    setLanceRealizado('0');
    setHasCalculated(false);
  };

  // ─── FORM PANEL (Esquerda) ───
  const formPanel = (
    <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-2 sm:space-y-3">
      <div className="text-sm font-bold text-foreground/80 mb-2">Parâmetros</div>
      <div>
        <label htmlFor="valorInicial" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
          1) Carta de crédito inicial (R$)
        </label>
        <input
          id="valorInicial"
          type="number"
          min="0"
          step="0.01"
          className="input w-full text-sm sm:text-base"
          value={valorInicial}
          onChange={(e) => setValorInicial(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <div>
          <label htmlFor="parcelaInicial" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
            2) Parcela inicial (R$)
          </label>
          <input
            id="parcelaInicial"
            type="number"
            min="0"
            step="0.01"
            className="input w-full text-sm sm:text-base"
            value={parcelaInicial}
            onChange={(e) => setParcelaInicial(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="prazoTotal" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
            3) Prazo total (meses)
          </label>
          <input
            id="prazoTotal"
            type="number"
            min="1"
            className="input w-full text-sm sm:text-base"
            value={prazoTotal}
            onChange={(e) => setPrazoTotal(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <div>
          <label htmlFor="indiceAnual" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
            4) Taxa de correção (anual %)
          </label>
          <input
            id="indiceAnual"
            type="number"
            min="0"
            step="0.01"
            className="input w-full text-sm sm:text-base"
            value={indiceAnual}
            onChange={(e) => setIndiceAnual(e.target.value)}
          />
          <p className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5">Aplicada a cada 12 meses sobre parcela e carta (ex.: 5 = 5% a.a.).</p>
        </div>
        <div>
          <label htmlFor="parcelaContemplacao" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
            5) Parcela da contemplação (mês)
          </label>
          <input
            id="parcelaContemplacao"
            type="number"
            min="1"
            className="input w-full text-sm sm:text-base"
            value={parcelaContemplacao}
            onChange={(e) => setParcelaContemplacao(e.target.value)}
          />
          <p className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5">Indica em qual mês ocorreu a contemplação (aparece na tabela).</p>
        </div>
      </div>

      <div>
        <label htmlFor="taxaRepasseMensal" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
          6) Taxa de repasse (mensal)
        </label>
        <input
          id="taxaRepasseMensal"
          type="text"
          className="input w-full text-sm sm:text-base"
          value={taxaRepasseMensal}
          onChange={(e) => setTaxaRepasseMensal(e.target.value)}
        />
        <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
          <select
            id="taxaFormato"
            className="input w-[60%] text-sm sm:text-base"
            value={taxaFormato}
            onChange={(e) => setTaxaFormato(e.target.value)}
          >
            <option value="auto">Formato: Auto (recomendado)</option>
            <option value="percent">Percentual (ex: 0.65 = 0.65% a.m.)</option>
            <option value="factor">Fator (ex: 1.0065 ou 1.0275)</option>
          </select>
          <div className="flex-1 text-foreground/40 text-[9px] sm:text-[10px]">Auto detecta 1.0275 como fator; se digitar 0.65 será interpretado como 0.65%.</div>
        </div>
      </div>

      <div>
        <label htmlFor="lanceEmbutido" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
          7) Lance embutido (R$)
        </label>
        <input
          id="lanceEmbutido"
          type="number"
          min="0"
          step="0.01"
          className="input w-full text-sm sm:text-base"
          value={lanceEmbutido}
          onChange={(e) => setLanceEmbutido(e.target.value)}
        />
        <p className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5">Valor que será abatido do crédito (-) na venda.</p>
      </div>

      <div>
        <label htmlFor="lanceRealizado" className="block text-[11px] sm:text-xs font-medium text-foreground/60 mb-1">
          8) Lance Realizado (R$)
        </label>
        <input
          id="lanceRealizado"
          type="number"
          min="0"
          step="0.01"
          className="input w-full text-sm sm:text-base"
          value={lanceRealizado}
          onChange={(e) => setLanceRealizado(e.target.value)}
        />
        <p className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5">Valor do lance efetivamente pago pelo usuário.</p>
      </div>

      <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
        <button
          type="submit"
          className="flex-1 rounded-full bg-[var(--orange)] text-white py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Calcular
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 rounded-full border border-border bg-secondary text-foreground py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wide hover:opacity-90 transition-all"
        >
          Reset
        </button>
      </div>

      <div className="rounded-lg sm:rounded-xl border border-border bg-card py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px]">
        <b>Resumo da lógica</b>
        <ul className="list-disc list-inside text-[9px] sm:text-[10px] text-foreground/70 mt-1">
          <li>Tabela de evolução: mostra mês a mês até a contemplação com correções a cada 12 meses (13º, 25º...).</li>
          <li>Cálculos do cenário usam os valores de referência NO MÊS DA CONTEMPLAÇÃO (parcela e carta), sem projetar correções futuras.</li>
          <li>PV das parcelas = soma da <em>parcela de referência</em> descontada pela taxa de repasse composta.</li>
          <li>Valor bruto = (carta referência) − PV.</li>
          <li>Retorno líquido = valor bruto − total pago até a contemplação.</li>
          <li>Ganho (%) = retorno líquido ÷ total pago até contemplação.</li>
        </ul>
      </div>
    </form>
  );

  // ─── RESULTS PANEL (Direita) ───
  const resultsPanel = (
    <div className="space-y-2 sm:space-y-3">
      <div className="text-sm font-bold text-foreground/80 mb-2">Projeção de venda - carta contemplada</div>
      {hasCalculated ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">PV das parcelas restantes</p>
              <p className="text-base sm:text-lg font-bold text-foreground break-words">{toBRL(scenarioResult.pv)}</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">Valor bruto estimado</p>
              <p className="text-base sm:text-lg font-bold text-[var(--orange)] break-words">{toBRL(scenarioResult.valorBruto)}</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">Retorno líquido</p>
              <p className="text-base sm:text-lg font-bold text-foreground break-words">{toBRL(scenarioResult.retornoLiquido)}</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">Ganho (%)</p>
              <p className="text-base sm:text-lg font-bold text-foreground break-words">{toPct(scenarioResult.ganhoPerc)}</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">Retorno mensal (IRR)</p>
              <p className="text-base sm:text-lg font-bold text-foreground break-words">{toPct(scenarioResult.irrMonthly)}</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">Parcela (referência)</p>
              <p className="text-base sm:text-lg font-bold text-foreground break-words">{toBRL(scenarioResult.parcelaReferencia)}</p>
            </div>
          </div>

          <div className="rounded-lg sm:rounded-xl border border-border bg-card p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-1">Carta de crédito (referência)</p>
            <p className="text-base sm:text-lg font-bold text-foreground break-words">{toBRL(scenarioResult.cartaReferencia)}</p>
            <p className="text-[9px] sm:text-[10px] text-foreground/40 mt-1">Carta disponível: {toBRL(scenarioResult.cartaDisponivel)}</p>
            <div className="flex gap-3 mt-1.5 sm:mt-2">
              <div className="text-[9px] sm:text-[10px] text-foreground/60">Qtd. restantes: <span className="font-bold text-foreground">{scenarioResult.nRemaining}</span></div>
              <div className="text-[9px] sm:text-[10px] text-foreground/60">Total pago até contem.: <span className="font-bold text-foreground">{toBRL(scenarioResult.totalPagoAteContem)}</span></div>
            </div>
          </div>

          {/* Tabela de Simulação por Sorteio */}
          <div className="rounded-lg sm:rounded-xl border border-border overflow-hidden">
            <div className="bg-card px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Contemplação por Sorteio (Prazos Fixos)</p>
              <p className="text-[9px] sm:text-[10px] text-foreground/70 mt-0.5">Projeção de ganhos para contemplação em prazos fixos (12, 24, 36, 48, 60, 72), independente do mês de contemplação informado.</p>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-[8px] sm:text-[10px]">
                <thead className="bg-[var(--ink)] text-white">
                  <tr>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-left">Prazo (meses)</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Ganho Bruto (R$)</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Ganho Líquido (R$)</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Ganho Total (%)</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Ganho (% a.m.)</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedTermResults.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-left font-medium">{row.prazo}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toBRL(row.ganhoBruto)}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toBRL(row.ganhoLiquido)}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toPct(row.ganhoTotalPct)}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toPct(row.ganhoMensalPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Evolução do Consórcio */}
          <div className="rounded-lg sm:rounded-xl border border-border overflow-hidden">
            <div className="bg-card px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Evolução do consórcio</p>
              <p className="text-[9px] sm:text-[10px] text-foreground/70 mt-0.5">Tabela: mês → corr./ano → carta → parcela → total acumulado pago</p>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-[8px] sm:text-[10px]">
                <thead className="bg-[var(--ink)] text-white">
                  <tr>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-left">Mês</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-left">Corr./Ano</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Carta</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Parcela</th>
                    <th className="px-1 sm:px-2 py-1 sm:py-1.5 text-right">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioResult.evolutionRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-left font-medium">{row.mes}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-left">{row.corrAno}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toBRL(row.carta)}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toBRL(row.parcela)}</td>
                      <td className="px-1 sm:px-2 py-1 sm:py-1.5 text-right whitespace-nowrap">{toBRL(row.acumulado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg sm:rounded-xl border border-border bg-card p-4 text-center text-foreground/70">
          Preencha os parâmetros e clique em "Calcular" para ver os resultados.
        </div>
      )}
    </div>
  );

  return (
    <>
      <RaioXLayout
        moduleNumber={8}
        title="Venda de Carta Contemplada"
        description="Simule o valor de venda de uma carta de crédito contemplada, considerando o saldo devedor, taxa de repasse e outros fatores."
        descriptionSupport="Este simulador ajuda a estimar o valor justo de uma carta contemplada para venda, considerando a matemática financeira."
        formPanel={formPanel}
        resultsPanel={resultsPanel}
        hasResult={hasCalculated}
      />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <ConsultCTA />
        
        <MethodologyBlock
          title="Metodologia"
          description="A metodologia de cálculo considera o valor presente das parcelas restantes descontadas por uma taxa de repasse mensal, o valor da carta de crédito na data da contemplação, e o total pago até a contemplação, incluindo lances realizados. A Taxa Interna de Retorno (IRR) é calculada com base nos fluxos de caixa."
          sources={["Matemática Financeira Aplicada", "Regulamento do Banco Central para Consórcios"]}
        />
      </div>
    </>
  );
}
