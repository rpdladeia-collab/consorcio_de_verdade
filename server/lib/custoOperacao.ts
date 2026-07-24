/**
 * Módulo 3 — Custo da Operação
 * Lógica extraída fielmente de runOperationCost() do HTML original.
 * Fonte: Raio-xdoConsórcioSITE_.renatto.html, linhas 464-500
 */

import { buildSchedule, ScheduleRow } from './raiox';

export interface CustoOperacaoInput {
  credit: number;
  term: number;
  adminRate: number;
  reserveRate: number;
  insuranceRate: number;
  adjRate: number;
  adjEvery: number;
  mode: 'linear' | 'nonlinear';
  ranges?: string;
}

export interface CustoOperacaoKpis {
  contractualAdmin: number;       // Taxa adm. contratual
  adminCorrection: number;        // Adm. sobre correções
  projectedInsurance: number;     // Seguro projetado
  fcCorrection: number;           // Correção fundo comum
  explicitCost: number;           // Custo explícito da operação
}

export interface CustoOperacaoClassRow {
  item: string;
  value: string;
  classification: string;
  reading: string;
}

export interface CustoOperacaoResult {
  kpis: CustoOperacaoKpis;
  // Textos exatos das <div class="readbox"> do HTML original
  readboxes: { title: string; body: string }[];
  // Tabela de classificação econômica (7 linhas)
  classificationTable: CustoOperacaoClassRow[];
  // Tabela de fluxo mensal (rows do buildSchedule)
  rows: ScheduleRow[];
  warnings: string[];
  // Para o PDF
  creditIncrease: number;
  totalPaidNominal: number;
  contractualReserve: number;
  reserveCorrection: number;
  simulationId: string;
  generatedAt: string;
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

function generateSimulationId(input: CustoOperacaoInput, explicitCost: number): string {
  const raw = JSON.stringify(input) + explicitCost.toFixed(2);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0').slice(0, 12);
}

export function runOperationCost(input: CustoOperacaoInput): CustoOperacaoResult {
  const s = buildSchedule({
    credit: input.credit,
    term: input.term,
    adminRate: input.adminRate,
    reserveRate: input.reserveRate,
    insuranceRate: input.insuranceRate,
    adjRate: input.adjRate,
    adjEvery: input.adjEvery,
    mode: input.mode,
    ranges: input.ranges,
  });

  // Fiel ao HTML: linhas 466-473
  const contractualAdmin = s.credit * input.adminRate / 100;
  const contractualReserve = s.credit * input.reserveRate / 100;
  const projectedAdmin = Math.max(0, contractualAdmin + s.adminCorrection);
  const projectedInsurance = Math.max(0, s.insuranceTotal);
  const explicitCost = projectedAdmin + projectedInsurance;
  const creditIncrease = s.finalCredit - s.credit;
  const totalPaidNominal = s.paidTotal;
  const oldMisleadingSpread = totalPaidNominal - s.finalCredit;

  // KPIs — fiel ao HTML linhas 474-479
  const kpis: CustoOperacaoKpis = {
    contractualAdmin,
    adminCorrection: s.adminCorrection,
    projectedInsurance,
    fcCorrection: s.fcCorrection,
    explicitCost,
  };

  // Textos exatos das <div class="readbox"> — HTML linhas 481-484
  const readboxes = [
    {
      title: 'ONDE ESTÁ O CUSTO?',
      body: 'Custo explícito é somente aquilo que remunera a operação ou sai como encargo: taxa de administração projetada e seguro informado separadamente. A correção do fundo comum não entra como custo isolado.',
    },
    {
      title: 'O QUE PARECE LUCRO, MAS NÃO É',
      body: 'Não usamos "total pago − carta final corrigida" como KPI de custo, porque isso mistura desembolsos nominais ao longo do tempo com crédito corrigido no futuro. Essa leitura pode gerar número negativo e parecer lucro, o que é tecnicamente enganoso.',
    },
    {
      title: 'CORREÇÃO NÃO É TAXA. MAS AUMENTA A CONTA',
      body: `O fundo comum residual aumentou ${moneyStr(s.fcCorrection)} pelas correções. Isso não deve ser tratado como custo isolado: a carta de crédito também aumentou ${moneyStr(creditIncrease)}. A correção atualiza poder de compra e obrigação restante. Atenção: Embora a carta também seja atualizada, a correção expõe o cliente a um índice fora de seu controle (risco de indexação), o que deve ser considerado como um custo de oportunidade e risco na operação.`,
    },
    {
      title: 'COMPOSIÇÃO FINAL DA OPERAÇÃO',
      body: `Taxa adm. total projetada: ${moneyStr(projectedAdmin)}\nSeguro projetado: ${moneyStr(projectedInsurance)}\nFundo reserva projetado: ${moneyStr(contractualReserve + s.reserveCorrection)}\nTotal pago nominal no fluxo: ${moneyStr(totalPaidNominal)}`,
    },
  ];

  // Warnings — fiel ao HTML linhas 485-489
  const warnings = [...s.warnings];
  if (oldMisleadingSpread < 0) {
    warnings.push(
      `Leitura protegida: a comparação simplista "total pago nominal − carta final corrigida" daria ${moneyStr(oldMisleadingSpread)}. O simulador não trata esse número como custo nem como ganho, porque ele mistura valores em momentos diferentes.`
    );
  }

  // Tabela de classificação econômica — fiel ao HTML linhas 490-498
  const classificationTable: CustoOperacaoClassRow[] = [
    {
      item: 'Taxa de administração contratual',
      value: moneyStr(contractualAdmin),
      classification: 'Custo explícito',
      reading: 'Remuneração contratual sobre a carta inicial.',
    },
    {
      item: 'Taxa de administração sobre correções',
      value: moneyStr(s.adminCorrection),
      classification: 'Custo explícito projetado',
      reading: 'A taxa acompanha a atualização do saldo/carta quando há correção.',
    },
    {
      item: 'Seguro informado à parte',
      value: moneyStr(projectedInsurance),
      classification: 'Custo explícito',
      reading: 'Use apenas se o seguro não estiver embutido na parcela.',
    },
    {
      item: 'Fundo reserva projetado',
      value: moneyStr(contractualReserve + s.reserveCorrection),
      classification: 'Reserva contratual',
      reading: 'Pode ter regra própria de uso/devolução; não deve ser lido automaticamente como custo perdido.',
    },
    {
      item: 'Correção do fundo comum',
      value: moneyStr(s.fcCorrection),
      classification: 'Atualização monetária',
      reading: 'Aumenta a obrigação, mas também atualiza a carta de crédito.',
    },
    {
      item: 'Aumento da carta de crédito',
      value: moneyStr(creditIncrease),
      classification: 'Atualização do poder de compra',
      reading: 'Não é lucro: é o mesmo índice atualizando o crédito prometido.',
    },
    {
      item: 'Total pago nominal',
      value: moneyStr(totalPaidNominal),
      classification: 'Fluxo nominal',
      reading: 'Soma das parcelas projetadas, sem trazer a valor presente.',
    },
  ];

  const simulationId = generateSimulationId(input, explicitCost);
  const generatedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return {
    kpis,
    readboxes,
    classificationTable,
    rows: s.rows,
    warnings,
    creditIncrease,
    totalPaidNominal,
    contractualReserve,
    reserveCorrection: s.reserveCorrection,
    simulationId,
    generatedAt,
  };
}
