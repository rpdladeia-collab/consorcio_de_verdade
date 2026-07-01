/**
 * Módulo 4 — Proporção da Taxa
 * Lógica extraída fielmente de runEfficiency() do HTML original.
 * Fonte: Raio-xdoConsórcioSITE_.renatto.html, linhas 502-532
 */

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
  if (!Number.isFinite(v)) return 'Sem base';
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '%';
}

export interface ProporcaoTaxaInput {
  credit: number;
  adminPct: number;
  paid: number;
  own: number;
  fgts: number;
  embedded: number;
  basis: 'newMoney' | 'liquidCredit';
  totalParcelas?: number;  // Para cálculo de degradação progressiva
}

export interface ProporcaoTaxaKpis {
  nominal: number;           // Taxa nominal (%)
  onLiquid: number;          // Taxa sobre carta líquida (%)
  onNew: number;             // Taxa sobre dinheiro novo (%)
  penalty: number;           // Peso adicional da taxa (%)
}

export interface ProporcaoTaxaMeter {
  widthPct: number;          // Largura da barra (0-100)
  label: string;             // Ex: "Eficiente", "Atenção", "Muito caro proporcionalmente"
  cls: 'green' | 'yellow' | 'red';
  text: string;              // Texto explicativo do termômetro
}

export interface ProporcaoTaxaTableRow {
  indicator: string;
  value: string;
  reading: string;
}

export interface DegradacaoRow {
  parcela: number;          // Número da parcela (0, 5, 10, ...)
  desembolsoAcumulado: number; // Lance próprio + FGTS + (parcela × valor parcela)
  dinheiroNovo: number;     // Carta - desembolso - embutido
  taxaEfetiva: number;      // (taxaNominal × carta) / dinheiroNovo
  eficiencia: number;       // (taxaNominal / taxaEfetiva) × 100
  degradacao: number;       // eficienciaInicial - eficienciaAtual
}

export type AlertaNivel = 'ok' | 'atencao' | 'alerta' | 'critico';

export interface DegradacaoAlerta {
  nivel: AlertaNivel;
  titulo: string;
  mensagem: string;
}

export interface DegradacaoResult {
  rows: DegradacaoRow[];
  alerta: DegradacaoAlerta;
  eficienciaInicial: number;
  eficienciaFinal: number;
  perdaTotal: number;
  impactoReais: number;     // Quanto a mais em taxa pelo dinheiro novo vs. nominal
  valorParcela: number;     // Parcela calculada = (carta × adminPct/100) / totalParcelas
}

export interface ProporcaoTaxaResult {
  kpis: ProporcaoTaxaKpis;
  // Valores derivados para exibição
  adminValue: number;
  liquidCredit: number;
  newMoney: number;
  meter: ProporcaoTaxaMeter;
  // Textos exatos das <div class="readbox"> do HTML original
  readboxes: { title: string; body: string; formula?: string }[];
  // Tabela de indicadores (7 linhas)
  table: ProporcaoTaxaTableRow[];
  simulationId: string;
  generatedAt: string;
  degradacao?: DegradacaoResult;
}

/**
 * Calcula a degradação progressiva de eficiência por parcela.
 * Fórmulas exatas conforme especificação:
 *   Dinheiro novo (i) = Carta - Lance próprio - (Parcela × i) - Embutido - FGTS
 *   Taxa efetiva (i)  = (Taxa nominal × Carta) / Dinheiro novo (i)
 *   Eficiência (i)    = (Taxa nominal / Taxa efetiva (i)) × 100
 *   Degradação (i)   = Eficiência inicial - Eficiência (i)
 */
export function calcDegradacaoProgressiva(
  credit: number,
  adminPct: number,
  own: number,
  fgts: number,
  embedded: number,
  totalParcelas: number,
): DegradacaoResult {
  /**
   * Especificação exata do anexo:
   *   Parcela 0: desembolso = R$ 0,00, dinheiro novo = carta cheia, eficiência = 100%
   *   Parcela i: desembolso = lance próprio + FGTS + (valor_parcela × i)
   *              dinheiro novo = carta - lance próprio - (valor_parcela × i) - embutido - FGTS
   *   Taxa efetiva (i) = (taxa_nominal × carta) / dinheiro_novo(i)
   *   Eficiência (i)   = (taxa_nominal / taxa_efetiva(i)) × 100
   *   Degradação (i)  = eficiência_inicial - eficiência(i)
   *
   * Nota: na parcela 0, o desembolso é R$0 (nenhuma parcela paga ainda, lance/FGTS
   * ainda não foram desembolsados no contexto da degradação progressiva).
   * Isso produz eficiência inicial = 100% conforme tabela obrigatória do anexo.
   */
  const taxaNominal = adminPct; // já em %
  const adminValue = credit * adminPct / 100;
  // Valor de cada parcela = taxa total / número de parcelas
  const valorParcela = totalParcelas > 0 ? adminValue / totalParcelas : 0;

  // Pontos de análise: 0, 5, 10, 15, 20, 25, 30, e o último (totalParcelas)
  const checkpoints = new Set<number>([0]);
  for (let i = 5; i < totalParcelas; i += 5) checkpoints.add(i);
  checkpoints.add(totalParcelas);
  const pontos = Array.from(checkpoints).sort((a, b) => a - b);

  const rows: DegradacaoRow[] = [];
  const eficienciaInicial = 100; // Parcela 0: desembolso R$0, dinheiro novo = carta, eficiência = 100%

  for (const i of pontos) {
    let desembolsoAcumulado: number;
    let dinheiroNovo: number;

    if (i === 0) {
      // Parcela 0: conforme tabela obrigatória do anexo — desembolso R$0, dinheiro novo = carta
      desembolsoAcumulado = 0;
      dinheiroNovo = credit;
    } else {
      // Parcela i: desembolso = lance próprio + FGTS + (valor_parcela × i)
      desembolsoAcumulado = own + fgts + (valorParcela * i);
      dinheiroNovo = Math.max(0, credit - own - (valorParcela * i) - embedded - fgts);
    }

    let taxaEfetiva: number;
    let eficiencia: number;
    if (dinheiroNovo <= 0) {
      taxaEfetiva = Infinity;
      eficiencia = 0;
    } else {
      taxaEfetiva = (taxaNominal * credit) / dinheiroNovo;
      eficiencia = taxaEfetiva > 0 ? (taxaNominal / taxaEfetiva) * 100 : 100;
    }

    const degradacao = eficienciaInicial - eficiencia;
    rows.push({ parcela: i, desembolsoAcumulado, dinheiroNovo, taxaEfetiva, eficiencia, degradacao });
  }

  const eficienciaFinal = rows[rows.length - 1]?.eficiencia ?? 0;
  const perdaTotal = eficienciaInicial - eficienciaFinal;

  // Impacto em R$: diferenca entre taxa efetiva final e nominal sobre dinheiro novo final
  const ultimaRow = rows[rows.length - 1];
  const dinheiroNovoFinal = ultimaRow?.dinheiroNovo ?? 0;
  const taxaEfetivaFinal = ultimaRow?.taxaEfetiva ?? taxaNominal;
  const impactoReais = dinheiroNovoFinal > 0 && isFinite(taxaEfetivaFinal)
    ? (taxaEfetivaFinal - taxaNominal) / 100 * dinheiroNovoFinal
    : 0;

  // Alerta baseado na degradação final
  let alerta: DegradacaoAlerta;
  if (perdaTotal > 35) {
    alerta = {
      nivel: 'critico',
      titulo: `Alerta de eficiência`,
      mensagem: `A eficiência projetada caiu ao longo do prazo. Isso significa que o custo da operação aumenta proporcionalmente quando comparado ao dinheiro novo utilizado.`,
    };
  } else if (perdaTotal > 20) {
    alerta = {
      nivel: 'alerta',
      titulo: `Alerta de eficiência`,
      mensagem: `A eficiência projetada caiu ao longo do prazo. Isso significa que o custo da operação aumenta proporcionalmente quando comparado ao dinheiro novo utilizado.`,
    };
  } else if (perdaTotal > 10) {
    alerta = {
      nivel: 'atencao',
      titulo: `Alerta de eficiência`,
      mensagem: `A eficiência projetada caiu ao longo do prazo. Isso significa que o custo da operação aumenta proporcionalmente quando comparado ao dinheiro novo utilizado.`,
    };
  } else {
    alerta = {
      nivel: 'ok',
      titulo: 'Eficiência preservada',
      mensagem: `A degradação acumulada até a parcela ${totalParcelas} é de ${perdaTotal.toFixed(1)}%. Operação dentro do esperado.`,
    };
  }

  return { rows, alerta, eficienciaInicial, eficienciaFinal, perdaTotal, impactoReais, valorParcela };
}

function generateSimulationId(input: ProporcaoTaxaInput, penalty: number): string {
  const raw = JSON.stringify(input) + penalty.toFixed(2);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0').slice(0, 12);
}

export function runEfficiency(input: ProporcaoTaxaInput): ProporcaoTaxaResult {
  // Fiel ao HTML: linhas 503-514
  const credit = Math.max(0, input.credit);
  const adminPct = clamp(input.adminPct, 0, 1000);
  const adminValue = credit * adminPct / 100;
  const paid = Math.max(0, input.paid);
  const own = Math.max(0, input.own);
  const fgts = Math.max(0, input.fgts);
  const embedded = Math.max(0, input.embedded);
  const liquidCredit = Math.max(0, credit - embedded);
  const newMoney = Math.max(0, credit - embedded - own - fgts - paid);
  const nominal = credit > 0 ? adminValue / credit * 100 : 0;
  const onLiquid = liquidCredit > 0 ? adminValue / liquidCredit * 100 : Infinity;
  const onNew = newMoney > 0 ? adminValue / newMoney * 100 : Infinity;
  const selected = input.basis === 'liquidCredit' ? onLiquid : onNew;
  const penalty = Number.isFinite(selected) && nominal > 0 ? (selected / nominal - 1) * 100 : Infinity;
  const meterWidth = Number.isFinite(penalty) ? clamp(penalty, 0, 160) / 160 * 100 : 100;

  // Fiel ao HTML: linhas 515-518
  let label = 'Eficiente';
  let cls: 'green' | 'yellow' | 'red' = 'green';
  let text = 'A taxa proporcional ficou próxima da taxa nominal.';
  if (!Number.isFinite(selected)) {
    label = 'Sem base líquida';
    cls = 'red';
    text = 'Não há dinheiro novo suficiente para calcular a eficiência. A operação está consumindo o crédito com lances, embutido e parcelas já pagas.';
  } else if (penalty > 70) {
    label = 'Muito caro proporcionalmente';
    cls = 'red';
    text = 'A taxa pesa muito mais sobre o dinheiro novo efetivo do que parece na carta cheia.';
  } else if (penalty > 35) {
    label = 'Atenção';
    cls = 'yellow';
    text = 'A taxa efetiva subiu de forma relevante quando medida sobre o valor líquido recebido.';
  }

  const kpis: ProporcaoTaxaKpis = {
    nominal,
    onLiquid: Number.isFinite(onLiquid) ? onLiquid : -1,
    onNew: Number.isFinite(onNew) ? onNew : -1,
    penalty: Number.isFinite(penalty) ? penalty : -1,
  };

  const meter: ProporcaoTaxaMeter = {
    widthPct: meterWidth,
    label,
    cls,
    text,
  };

  // Textos exatos das <div class="readbox"> — HTML linhas 527-529
  const readboxes = [
    {
      title: 'Base correta',
      body: 'Para avaliar eficiência, não basta olhar a carta. O mais técnico é perguntar: quanto de taxa estou pagando pelo dinheiro novo que realmente entrou na operação?',
    },
    {
      title: 'Fórmula rigorosa',
      body: 'Carta − embutido − lance próprio − FGTS − parcelas pagas = dinheiro novo efetivo.',
      formula: `${moneyStr(credit)} − ${moneyStr(embedded)} − ${moneyStr(own)} − ${moneyStr(fgts)} − ${moneyStr(paid)} = ${moneyStr(newMoney)}`,
    },
  ];

  // Tabela de indicadores — fiel ao HTML linha 530
  const table: ProporcaoTaxaTableRow[] = [
    { indicator: 'Taxa adm. em R$', value: moneyStr(adminValue), reading: 'Taxa nominal multiplicada pela carta cheia.' },
    { indicator: 'Carta cheia', value: moneyStr(credit), reading: 'Base comercial do contrato.' },
    { indicator: 'Lance embutido', value: moneyStr(embedded), reading: 'Reduz crédito disponível; não é dinheiro novo.' },
    { indicator: 'Carta líquida após embutido', value: moneyStr(liquidCredit), reading: 'Carta disponível para compra.' },
    { indicator: 'Parcelas pagas + recursos próprios', value: moneyStr(paid + own + fgts), reading: 'Desembolsos que reduzem a leitura de dinheiro novo.' },
    { indicator: 'Dinheiro novo efetivo', value: moneyStr(newMoney), reading: 'Base econômica mais rigorosa.' },
    { indicator: 'Taxa sobre dinheiro novo', value: Number.isFinite(onNew) ? pctStr(onNew) : 'Sem base', reading: 'Indicador principal de eficiência.' },
  ];

  const simulationId = generateSimulationId(input, Number.isFinite(penalty) ? penalty : 999);
  const generatedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Degradação progressiva (opcional — só quando totalParcelas é informado)
  let degradacao: DegradacaoResult | undefined;
  if (input.totalParcelas && input.totalParcelas > 0) {
    degradacao = calcDegradacaoProgressiva(
      credit, adminPct, own, fgts, embedded, input.totalParcelas,
    );
  }

  return {
    kpis,
    adminValue,
    liquidCredit,
    newMoney,
    meter,
    readboxes,
    table,
    simulationId,
    generatedAt,
    degradacao,
  };
}
