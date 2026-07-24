
export function calcVendaCartaContemplada(
  valorInicial: number,
  parcelaInicial: number,
  indiceAnualPct: number,
  parcelaContemplacao: number,
  prazoTotal: number,
  taxaRepasseMensalRaw: string,
  taxaFormato: string,
  lanceEmbutido: number,
  lanceRealizado: number
) {
  const parseFloatSafeString = (s: string | number | null | undefined) => {
    if (s === null || s === undefined) return 0;
    s = String(s).trim().replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  let trm: number;
  let trmFactor: number;
  const taxaNum = parseFloatSafeString(taxaRepasseMensalRaw);

  if (taxaNum <= 0) {
    trm = 0;
    trmFactor = 1;
  } else {
    if (taxaFormato === 'factor') {
      trmFactor = taxaNum;
      trm = taxaNum - 1;
    } else if (taxaFormato === 'percent') {
      trm = taxaNum / 100;
      trmFactor = 1 + trm;
    } else {
      const s = String(taxaRepasseMensalRaw).trim().replace(",", ".");
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
  for (let m = 1; m <= parcelaContemplacao; m++) {
    const yearsPassed = Math.floor((m - 1) / 12);
    const cartaAtThisMonth = valorInicial * Math.pow(1 + indiceAnualPct, yearsPassed);
    const parcelaAtThisMonth = parcelaInicial * Math.pow(1 + indiceAnualPct, yearsPassed);
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
  const refYears = Math.floor((parcelaContemplacao - 1) / 12);
  const parcelaReferencia = parcelaInicial * Math.pow(1 + indiceAnualPct, refYears);
  const cartaReferencia = valorInicial * Math.pow(1 + indiceAnualPct, refYears);

  // Parcelas restantes
  const nRemaining = Math.max(0, prazoTotal - parcelaContemplacao);

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
  const totalPagoAteContem = (evolutionRows.length ? evolutionRows[evolutionRows.length - 1].acumulado : 0) + lanceRealizado;

  // Retorno líquido
  const retornoLiquido = valorBruto - totalPagoAteContem;

  // Ganho %
  const ganhoPerc = totalPagoAteContem > 0 ? (retornoLiquido / totalPagoAteContem) : NaN;

  // Fluxo para IRR
  const cashflows = [];
  for (let i = 1; i <= parcelaContemplacao; i++) {
    cashflows.push(-evolutionRows[i - 1].parcela);
  }
  cashflows.push(valorBruto);
  const irrMonthly = computeIRRMonthly(cashflows);

  const cartaDisponivel = cartaReferencia - lanceEmbutido;

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
}

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

export function calculateFixedTermContemplation(
  valorInicial: number,
  parcelaInicial: number,
  indiceAnualPct: number,
  prazoTotal: number,
  lanceRealizado: number,
  taxaRepasseMensalRaw: string,
  taxaFormato: string
) {
  const prazosFixos = [12, 24, 36, 48, 60, 72];
  interface FixedTermContemplationResult {
    prazo: number;
    ganhoBruto: number;
    ganhoLiquido: number;
    ganhoTotalPct: number;
    ganhoMensalPct: number;
  }
  const results: FixedTermContemplationResult[] = [];

  const parseFloatSafeString = (s: string | number | null | undefined) => {
    if (s === null || s === undefined) return 0;
    s = String(s).trim().replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const taxaNum = parseFloatSafeString(taxaRepasseMensalRaw);
  let trm: number;
  if (taxaNum <= 0) {
    trm = 0;
  } else {
    if (taxaFormato === 'factor') {
      trm = taxaNum - 1;
    } else if (taxaFormato === 'percent') {
      trm = taxaNum / 100;
    } else {
      const s = String(taxaRepasseMensalRaw).trim().replace(",", ".");
      if (s.startsWith('1.') && !s.startsWith('1.0e')) {
        trm = taxaNum - 1;
      } else {
        trm = taxaNum / 100;
      }
    }
  }

  prazosFixos.forEach(prazoFixo => {
    if (prazoFixo > prazoTotal) return;

    const refYears = Math.floor((prazoFixo - 1) / 12);
    const parcelaRef = parcelaInicial * Math.pow(1 + indiceAnualPct, refYears);
    const cartaRef = valorInicial * Math.pow(1 + indiceAnualPct, refYears);

    const nRem = Math.max(0, prazoTotal - prazoFixo);

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
      const parcela = parcelaInicial * Math.pow(1 + indiceAnualPct, years);
      totalPagoFixo += parcela;
    }
    totalPagoFixo += lanceRealizado;

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
}
