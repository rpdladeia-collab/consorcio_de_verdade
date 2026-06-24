export interface HistoryRow {
  ass: number;
  low: number;
  mid: number;
  high: number;
  label?: string;
}

export interface HealthRow {
  idx?: number;
  ass: number;
  sg: number;
  p30: number;
  p50: number;
  clivre: number;
  clim: number;
  c30: number;
  c50: number;
  csort: number;
  outras: number;
  total?: number;
  invalid?: boolean;
}

export function avg(arr: any[], key: string): number {
  const v = arr.map(r => r[key]).filter(x => x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

export function median(arr: any[], key: string): number {
  const v = arr.map(r => r[key]).filter(x => x > 0).sort((a, b) => a - b);
  if (!v.length) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

export function calculateTrend(data: HistoryRow[]): { label: string; detail: string; cls: string } {
  if (data.length < 6) return { label: '—', detail: 'mínimo 6 assembleias', cls: 'trend-flat' };
  
  const meanVals = (vals: number[]) => {
    const v = vals.filter(x => x > 0);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };
  
  const last3 = meanVals(data.slice(0, 3).map(r => r.mid));
  const prev3 = meanVals(data.slice(3, 6).map(r => r.mid));
  const diff = last3 - prev3;
  
  if (Math.abs(diff) < 1) return { label: '→ Estável', detail: `variação de ${diff.toFixed(2)}% nas médias`, cls: 'trend-flat' };
  if (diff > 0) return { label: '↑ Alta', detail: `3 últimas acima das 3 anteriores em ${diff.toFixed(2)}%`, cls: 'trend-up' };
  return { label: '↓ Queda', detail: `3 últimas abaixo das 3 anteriores em ${Math.abs(diff).toFixed(2)}%`, cls: 'trend-down' };
}

export function calculateHealth(rows: HealthRow[], term: number = 120) {
  const validRows = rows.filter(r => !r.invalid);
  if (!validRows.length) return null;
  
  const latest = Math.max(...validRows.map(r => r.ass || 0));
  const baseRow = validRows.find(r => r.ass === latest) || validRows[0];
  const baseGeral = baseRow ? baseRow.sg : 0;
  const rest = Math.max(1, term - latest);
  
  const sum = (k: keyof HealthRow) => validRows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  
  const sLivre = sum('clivre'), sLim = sum('clim'), s30 = sum('c30'), s50 = sum('c50'), sSort = sum('csort'), sOut = sum('outras');
  const totalCont = sLivre + sLim + s30 + s50 + sSort + sOut;
  const avgCont = totalCont / validRows.length;
  const needed = baseGeral / avgCont;
  
  const sGeral = sum('sg'), sP30 = sum('p30'), sP50 = sum('p50');
  
  return {
    totalCont,
    avgCont,
    needed,
    rest,
    isPossible: needed <= rest,
    rates: {
      sorteio: sGeral > 0 ? (sSort / sGeral) * 100 : 0,
      fixo30: sP30 > 0 ? (s30 / sP30) * 100 : 0,
      fixo50: sP50 > 0 ? (s50 / sP50) * 100 : 0
    }
  };
}
