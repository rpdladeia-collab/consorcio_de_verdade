/**
 * Módulo 6 — Auto Pagável?
 * Lógica extraída fielmente de runAutoPayable() do HTML original.
 * Fonte: Raio-xdoConsórcioSITE_.renatto.html, linhas 555-627
 */

import { buildSchedule } from './raiox';

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function moneyStr(v: number): string {
  return (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function pctStr(v: number): string {
  return (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '%';
}

export interface AutoPagavelInput {
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  appreciation: number;   // % a.a. valorização do bem
  annualReturn: number;   // % a.a. rentabilidade investimento
  initial: number;        // Capital inicial disponível
  budget: number;         // Orçamento mensal
  contMonth: number;      // Mês hipotético da contemplação
  own: number;            // Lance próprio
  embedded: number;       // Lance embutido
  rent: number;           // Renda mensal líquida do bem
  mode: 'linear' | 'nonlinear';
  ranges?: string;
}

export interface AutoPagavelKpis {
  coverage: number;                    // Cobertura da parcela (%)
  coverageCls: 'green' | 'yellow' | 'red';
  investedPurchaseMonth: number | null; // Mês de compra via investimento
  finalInv: number;                    // Patrimônio final investimento
  finalCons: number;                   // Patrimônio final consórcio
}

export interface AutoPagavelTableRow {
  month: number;
  objective: string;
  parcel: string;
  income: string;
  consReserve: string;
  extras: string;
  invAsset: string;
  patrimonioInv: string;
  patrimonioCons: string;
}

export interface AutoPagavelResult {
  kpis: AutoPagavelKpis;
  // Textos exatos das <div class="readbox"> do HTML original
  readboxes: { title: string; body: string }[];
  // Tabela de comparação de patrimônio (9 colunas)
  table: AutoPagavelTableRow[];
  warnings: string[];
  diff: number;  // finalCons - finalInv
  simulationId: string;
  generatedAt: string;
}

function generateSimulationId(input: AutoPagavelInput, finalCons: number): string {
  const raw = JSON.stringify(input) + finalCons.toFixed(2);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0').slice(0, 12);
}

export function runAutoPayable(input: AutoPagavelInput): AutoPagavelResult {
  // Fiel ao HTML: linhas 556-563
  const credit = Math.max(0, input.credit);
  const term = clamp(Math.round(input.term || 1), 1, 240);
  const admin = input.adminRate;
  const reserve = input.reserveRate;
  const appreciation = input.appreciation / 100;
  const monthlyApp = Math.pow(1 + appreciation, 1 / 12) - 1;
  const annualReturn = input.annualReturn / 100;
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const initial = Math.max(0, input.initial);
  const budget = Math.max(0, input.budget);
  const contMonth = clamp(Math.round(input.contMonth || 1), 1, term);
  const own = Math.max(0, input.own);
  const embedded = Math.max(0, input.embedded);
  const rent = Math.max(0, input.rent);

  // buildSchedule com appreciation como adjRate (fiel ao HTML linha 563)
  const schedule = buildSchedule({
    credit,
    term,
    adminRate: admin,
    reserveRate: reserve,
    insuranceRate: 0,
    adjRate: appreciation * 100,
    adjEvery: 12,
    firstAdj: 13,
    mode: input.mode,
    ranges: input.ranges,
  });

  // Loop principal — fiel ao HTML linhas 564-601
  let inv = initial;
  let consReserve = initial;
  let extras = 0;
  let investedPurchaseMonth: number | null = null;
  let objective = credit;
  let consBought = false;
  let consAsset = 0;
  let invAsset = 0;
  let invBought = false;

  const rawRows: {
    m: number;
    objective: number;
    inv: number;
    invAsset: number;
    parcel: number;
    income: number;
    consReserve: number;
    extras: number;
    consAsset: number;
  }[] = [];

  for (let m = 1; m <= term; m++) {
    if (m > 1 && (m - 1) % 12 === 0) objective *= 1 + appreciation;

    if (invBought) {
      invAsset *= 1 + monthlyApp;
      inv += rent;
    }
    inv = inv * (1 + monthlyReturn) + budget;
    if (!investedPurchaseMonth && inv >= objective * 1.02) {
      investedPurchaseMonth = m;
      inv -= objective;
      invAsset = objective;
      invBought = true;
      inv += rent;
    }

    const parcel = schedule.rows[m - 1]?.installment || 0;
    consReserve *= 1 + monthlyReturn;
    let income = 0;

    if (m === contMonth) {
      const creditNow = schedule.rows[m - 1]?.credit || objective;
      const liquid = Math.max(0, creditNow - embedded);
      const complement = Math.max(0, objective - liquid);
      const required = own + complement;
      if (consReserve >= required) {
        consReserve -= required;
      } else {
        extras += required - consReserve;
        consReserve = 0;
      }
      consBought = true;
      consAsset = objective;
    }

    if (consBought) {
      income = rent;
      if (m > contMonth) consAsset *= 1 + monthlyApp;
    }

    const netMonthly = budget + income - parcel;
    if (netMonthly >= 0) {
      consReserve += netMonthly;
    } else {
      const need = -netMonthly;
      if (consReserve >= need) {
        consReserve -= need;
      } else {
        extras += need - consReserve;
        consReserve = 0;
      }
    }

    rawRows.push({ m, objective, inv, invAsset, parcel, income, consReserve, extras, consAsset });
  }

  // Fiel ao HTML: linhas 603-606
  const finalInv = inv + invAsset;
  const finalCons = consReserve + (consAsset || 0) - extras;
  const avgParcelAfter = schedule.rows
    .slice(contMonth - 1)
    .reduce((a, r) => a + r.installment, 0) / Math.max(1, term - contMonth + 1);
  const coverage = avgParcelAfter > 0 ? rent / avgParcelAfter * 100 : 0;

  // KPIs — fiel ao HTML linhas 607-611
  const coverageCls: 'green' | 'yellow' | 'red' =
    coverage >= 100 ? 'green' : coverage >= 70 ? 'yellow' : 'red';

  const kpis: AutoPagavelKpis = {
    coverage,
    coverageCls,
    investedPurchaseMonth,
    finalInv,
    finalCons,
  };

  const diff = finalCons - finalInv;

  // Textos exatos das <div class="readbox"> — HTML linhas 613-617
  const readboxes = [
    {
      title: 'Auto pagável?',
      body: coverage >= 100
        ? 'Neste cenário, a renda líquida do bem cobre a parcela média pós-contemplação. A diferença precisa sair do orçamento, da reserva ou de recurso extra.'
        : 'Neste cenário, a renda líquida do bem não cobre integralmente a parcela média pós-contemplação. A diferença precisa sair do orçamento, da reserva ou de recurso extra.',
    },
    {
      title: 'Metodologia da comparação',
      body: 'Os dois caminhos buscam o mesmo bem. O dinheiro rende enquanto está em aplicação financeira; depois que vira imóvel/ativo, passa a ser medido como bem valorizado. A renda líquida do bem só entra depois da compra em cada cenário.',
    },
    {
      title: 'Por que o resultado pode parecer contraintuitivo?',
      body: 'O consórcio pode aparecer melhor quando a contemplação antecipa a aquisição e a renda do bem começa cedo. Já o investimento pode aparecer melhor quando a rentabilidade financeira compensa esperar para comprar. O resultado depende principalmente do mês de contemplação, da renda do bem, da valorização e da rentabilidade informada.',
    },
    {
      title: 'Consórcio × investir',
      body: `Diferença patrimonial estimada: ${moneyStr(diff)}. Resultado positivo favorece o consórcio no cenário; negativo favorece investir, considerando as premissas informadas.`,
    },
  ];

  // Warnings — fiel ao HTML linhas 618-623
  const warnings = [...schedule.warnings];
  if (own > initial) {
    warnings.push('O lance próprio é maior que o capital inicial. O simulador cobrirá a diferença com recursos extras se necessário.');
  }
  if (embedded >= credit) {
    warnings.push('Lance embutido muito alto: a carta líquida pode não ser suficiente para comprar o bem.');
  }
  if (!investedPurchaseMonth) {
    warnings.push('No cenário de investimento, o capital acumulado não alcançou o preço do bem dentro do prazo informado.');
  }
  if (annualReturn > 0.25) {
    warnings.push(`Rentabilidade financeira de ${pctStr(annualReturn * 100)} ao ano é um cenário extremo. Use este resultado mais como teste de sensibilidade do que como premissa provável.`);
  }
  if (annualReturn > appreciation * 2 && diff > 0) {
    warnings.push('Resultado contraintuitivo detectado: mesmo com rentabilidade financeira muito acima da valorização do bem, o consórcio ficou à frente. Isso normalmente ocorre pela antecipação da compra, início mais cedo da renda do bem ou mês de contemplação muito favorável. Revise essas premissas antes de concluir.');
  }

  // Tabela de comparação de patrimônio — fiel ao HTML linhas 625-626
  const table: AutoPagavelTableRow[] = rawRows.map(r => ({
    month: r.m,
    objective: moneyStr(r.objective),
    parcel: moneyStr(r.parcel),
    income: moneyStr(r.income),
    consReserve: moneyStr(r.consReserve),
    extras: moneyStr(r.extras),
    invAsset: moneyStr(r.invAsset || 0),
    patrimonioInv: moneyStr(r.inv + (r.invAsset || 0)),
    patrimonioCons: moneyStr((r.consAsset || 0) + r.consReserve - r.extras),
  }));

  const simulationId = generateSimulationId(input, finalCons);
  const generatedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return {
    kpis,
    readboxes,
    table,
    warnings,
    diff,
    simulationId,
    generatedAt,
  };
}
