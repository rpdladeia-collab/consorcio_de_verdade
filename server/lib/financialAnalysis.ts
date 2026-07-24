/**
 * Análise Financeira como Laudo Técnico Interativo
 * Arquitetura: 9 blocos com rastreabilidade matemática completa
 * Sem opiniões, apenas fatos matemáticos verificáveis
 */

import { ScheduleResult } from './raiox';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface TechnicalReportAnalysis {
  // Bloco 1: Visão Executiva
  executiveSummary: {
    parameters: {
      credit: number;
      term: number;
      adminRate: number;
      correctionRate: number;
      periodicity: string;
      model: string;
    };
    projectedResults: {
      creditFinal: number;
      creditGrowth: number;
      creditGrowthPct: number;
      firstInstallment: number;
      maxInstallment: number;
      totalPaid: number;
    };
  };

  // Bloco 2: Como o Dinheiro Evolui (4 fluxos independentes)
  moneyEvolution: {
    patrimonialFlow: {
      label: string;
      initial: number;
      corrections: number;
      final: number;
      explanation: string;
    };
    remunerationFlow: {
      label: string;
      initial: number;
      corrections: number;
      final: number;
      explanation: string;
    };
    protectionFlow: {
      label: string;
      total: number;
      explanation: string;
    };
    financialFlow: {
      label: string;
      totalPaid: number;
      explanation: string;
    };
  };

  // Bloco 3: Custo Efetivo da Operação
  effectiveCost: {
    definition: string;
    components: {
      adminFee: number;
      insurance: number;
      total: number;
    };
    representations: {
      pctOfInitialCredit: {
        value: number;
        base: string;
      };
      pctOfUpdatedCredit: {
        value: number;
        base: string;
      };
      pctOfTotalPaid: {
        value: number;
        base: string;
      };
    };
  };

  // Bloco 4: Onde está o Dinheiro
  moneyLocation: {
    patrimony: {
      label: string;
      value: number;
      percentage: number;
      base: string;
      explanation: string;
    };
    adminRemuneration: {
      label: string;
      value: number;
      percentage: number;
      base: string;
      explanation: string;
    };
    insurance: {
      label: string;
      value: number;
      percentage: number;
      base: string;
      explanation: string;
    };
    monetaryUpdate: {
      label: string;
      value: number;
      percentage: number;
      base: string;
      explanation: string;
    };
  };

  // Bloco 5: Evolução da Parcela
  installmentEvolution: {
    first: number;
    max: number;
    last: number;
    adjustmentCount: number;
    growthPct: number;
    growthNominal: number;
    intuitiveRatio: string; // "Cada R$100 → R$241"
  };

  // Bloco 6: Evolução da Carta
  creditEvolution: {
    initial: number;
    monetaryUpdatesAccum: number;
    final: number;
    growthNominal: number;
    growthPct: number;
  };

  // Bloco 7: Evolução da Taxa
  adminFeeEvolution: {
    contractedRate: number;
    initialFinancialValue: number;
    financialCorrections: number;
    finalFinancialValue: number;
    financialIncrease: number;
    financialIncreasePct: number;
    explanation: string;
  };

  // Bloco 8: Indicadores Técnicos
  technicalIndicators: {
    term: string;
    correctionContracted: string;
    insuranceContracted: string;
    adminRate: string;
    periodicity: string;
    model: string;
  };

  // Bloco 9: Evidências Matemáticas
  mathematicalEvidences: Array<{
    fact: string;
    reason: string;
    consequence: string;
    origin: string;
  }>;

  // Motor de Tags
  indicatorTags: {
    [key: string]: string;
  };

  // Glossário
  glossary: Array<{
    term: string;
    definition: string;
    howCalculated: string;
    whereAppears: string;
  }>;
}

// ─── IMPLEMENTAÇÃO ────────────────────────────────────────────────────────────

// Função de compatibilidade com código existente
export function analyzeFinancials(schedule: ScheduleResult, adjEvery: number): any {
  // Retorna um objeto vazio para compatibilidade
  return {};
}

export function analyzeTechnicalReport(
  schedule: ScheduleResult,
  adminRate: number,
  adjRate: number,
  adjEvery: number = 12,
  mode: string = 'linear',
  insuranceRate: number = 0
): TechnicalReportAnalysis {
  const rows = schedule.rows;
  const term = schedule.term;
  const credit = schedule.credit;
  const finalCredit = schedule.finalCredit;
  const paidTotal = schedule.paidTotal;
  const insuranceTotal = schedule.insuranceTotal;
  const adminCorrection = schedule.adminCorrection;
  const fcCorrection = schedule.fcCorrection;
  const correctionNominal = schedule.correctionNominal;

  const firstInstallment = rows[0]?.installment ?? 0;
  const maxInstallment = Math.max(...rows.map(r => r.installment));
  const lastInstallment = rows[rows.length - 1]?.installment ?? 0;
  const adjustmentMonths = rows.filter(r => r.tags.includes('Reajuste'));

  // ─── BLOCO 1: VISÃO EXECUTIVA ──────────────────────────────────────────────
  const periodicity = adjEvery === 0 ? 'Sem reajustes' : adjEvery === 6 ? 'Semestral (a cada 6 meses)' : 'Anual (a cada 12 meses)';
  const modelName = mode === 'linear' ? 'Linear com reajustes periódicos' : 'Não-linear com reajustes periódicos';

  const executiveSummary = {
    parameters: {
      credit,
      term,
      adminRate,
      correctionRate: adjRate,
      periodicity,
      model: modelName,
    },
    projectedResults: {
      creditFinal: finalCredit,
      creditGrowth: finalCredit - credit,
      creditGrowthPct: ((finalCredit - credit) / credit) * 100,
      firstInstallment,
      maxInstallment,
      totalPaid: paidTotal,
    },
  };

  // ─── BLOCO 2: COMO O DINHEIRO EVOLUI ────────────────────────────────────────
  const adminInitial = credit * (adminRate / 100);
  const adminFinal = adminInitial + adminCorrection;

  const moneyEvolution = {
    patrimonialFlow: {
      label: 'Fluxo Patrimonial',
      initial: credit,
      corrections: fcCorrection,
      final: finalCredit,
      explanation: 'Evolução do patrimônio (carta) ao longo do contrato, incluindo atualizações monetárias.',
    },
    remunerationFlow: {
      label: 'Fluxo de Remuneração',
      initial: adminInitial,
      corrections: adminCorrection,
      final: adminFinal,
      explanation: 'Remuneração da administradora pela gestão do contrato, corrigida conforme o índice.',
    },
    protectionFlow: {
      label: 'Fluxo de Proteção',
      total: insuranceTotal,
      explanation: 'Proteção mensal do mutuário e da administradora contra sinistros.',
    },
    financialFlow: {
      label: 'Fluxo Financeiro',
      totalPaid: paidTotal,
      explanation: 'Soma nominal de todas as parcelas pagas durante o contrato.',
    },
  };

  // ─── BLOCO 3: CUSTO EFETIVO DA OPERAÇÃO ────────────────────────────────────
  const adminFeeTotal = adminInitial + adminCorrection;
  const explicitCost = adminFeeTotal + insuranceTotal;
  const pctOfInitialCredit = (explicitCost / credit) * 100;
  const pctOfUpdatedCredit = (explicitCost / finalCredit) * 100;
  const pctOfTotalPaid = (explicitCost / paidTotal) * 100;

  const effectiveCost = {
    definition: 'Custo Explícito = Taxa Administrativa Total + Seguro Total (sem incluir correção monetária)',
    components: {
      adminFee: adminFeeTotal,
      insurance: insuranceTotal,
      total: explicitCost,
    },
    representations: {
      pctOfInitialCredit: {
        value: pctOfInitialCredit,
        base: `Sobre Carta Inicial (R$ ${credit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      },
      pctOfUpdatedCredit: {
        value: pctOfUpdatedCredit,
        base: `Sobre Carta Atualizada (R$ ${finalCredit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      },
      pctOfTotalPaid: {
        value: pctOfTotalPaid,
        base: `Sobre Total Pago (R$ ${paidTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      },
    },
  };

  // ─── BLOCO 4: ONDE ESTÁ O DINHEIRO ─────────────────────────────────────────
  const amortization = credit - finalCredit + fcCorrection;
  const totalDistribution = paidTotal;

  const moneyLocation = {
    patrimony: {
      label: 'Patrimônio',
      value: Math.abs(amortization),
      percentage: (Math.abs(amortization) / totalDistribution) * 100,
      base: `Sobre Total Pago (R$ ${totalDistribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      explanation: 'Redução real da dívida através da amortização.',
    },
    adminRemuneration: {
      label: 'Remuneração da Administradora',
      value: adminFeeTotal,
      percentage: (adminFeeTotal / totalDistribution) * 100,
      base: `Sobre Total Pago (R$ ${totalDistribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      explanation: 'Taxa cobrada pela gestão do contrato (inicial + correções).',
    },
    insurance: {
      label: 'Seguro',
      value: insuranceTotal,
      percentage: (insuranceTotal / totalDistribution) * 100,
      base: `Sobre Total Pago (R$ ${totalDistribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      explanation: 'Proteção mensal contratada.',
    },
    monetaryUpdate: {
      label: 'Atualização Monetária',
      value: correctionNominal,
      percentage: (correctionNominal / totalDistribution) * 100,
      base: `Sobre Total Pago (R$ ${totalDistribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      explanation: 'Correção do patrimônio pelo índice contratado. Não remunera a administradora.',
    },
  };

  // ─── BLOCO 5: EVOLUÇÃO DA PARCELA ───────────────────────────────────────────
  const growthPct = ((maxInstallment - firstInstallment) / firstInstallment) * 100;
  const intuitiveRatio = `Cada R$ 100 da primeira parcela tornam-se R$ ${((maxInstallment / firstInstallment) * 100).toFixed(0)}`;

  const installmentEvolution = {
    first: firstInstallment,
    max: maxInstallment,
    last: lastInstallment,
    adjustmentCount: adjustmentMonths.length,
    growthPct,
    growthNominal: maxInstallment - firstInstallment,
    intuitiveRatio,
  };

  // ─── BLOCO 6: EVOLUÇÃO DA CARTA ─────────────────────────────────────────────
  const creditEvolution = {
    initial: credit,
    monetaryUpdatesAccum: fcCorrection,
    final: finalCredit,
    growthNominal: finalCredit - credit,
    growthPct: ((finalCredit - credit) / credit) * 100,
  };

  // ─── BLOCO 7: EVOLUÇÃO DA TAXA ──────────────────────────────────────────────
  const adminFeeEvolution = {
    contractedRate: adminRate,
    initialFinancialValue: adminInitial,
    financialCorrections: adminCorrection,
    finalFinancialValue: adminFinal,
    financialIncrease: adminFinal - adminInitial,
    financialIncreasePct: ((adminFinal - adminInitial) / adminInitial) * 100,
    explanation: `A taxa percentual permanece ${adminRate}% sobre o saldo devedor. O valor financeiro aumenta de R$ ${adminInitial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para R$ ${adminFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} porque acompanha a atualização monetária da carta.`,
  };

  // ─── BLOCO 8: INDICADORES TÉCNICOS ──────────────────────────────────────────
  const insuranceContractedPct = insuranceRate > 0 ? insuranceRate : ((insuranceTotal / paidTotal) * 100);

  const technicalIndicators = {
    term: `${term} meses (${(term / 12).toFixed(1)} anos)`,
    correctionContracted: `${adjRate}% ao ano`,
    insuranceContracted: `${insuranceContractedPct.toFixed(2)}% ${insuranceRate > 0 ? 'do saldo devedor' : 'do total pago'}`,
    adminRate: `${adminRate}% sobre saldo devedor`,
    periodicity,
    model: modelName,
  };

  // ─── BLOCO 9: EVIDÊNCIAS MATEMÁTICAS ───────────────────────────────────────
  const mathematicalEvidences = [
    {
      fact: `A parcela cresce ${growthPct.toFixed(1)}%`,
      reason: `Correção anual de ${adjRate}% aplicada a cada reajuste`,
      consequence: `Maior comprometimento financeiro ao longo do contrato`,
      origin: `Comparação entre primeira parcela (R$ ${firstInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) e maior parcela (R$ ${maxInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
    },
    {
      fact: `A carta cresce ${(((finalCredit - credit) / credit) * 100).toFixed(1)}%`,
      reason: `Atualização monetária de ${adjRate}% a.a.`,
      consequence: `Preservação do poder de compra do patrimônio`,
      origin: `Carta inicial (R$ ${credit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) versus carta final (R$ ${finalCredit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
    },
    {
      fact: `A taxa cresce de R$ ${adminInitial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para R$ ${adminFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      reason: `Percentual ${adminRate}% mantém-se constante, mas a base (saldo devedor) aumenta com correções`,
      consequence: `Remuneração da administradora acompanha a evolução do patrimônio`,
      origin: `Cálculo: Taxa Inicial (${adminRate}% de R$ ${credit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) + Correções (R$ ${adminCorrection.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
    },
    {
      fact: `O custo explícito é R$ ${explicitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      reason: `Soma de Taxa Administrativa (R$ ${adminCorrection.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) + Seguro (R$ ${insuranceTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      consequence: `Representa ${pctOfInitialCredit.toFixed(1)}% da carta inicial ou ${pctOfTotalPaid.toFixed(1)}% do total pago`,
      origin: `Soma dos fluxos de remuneração e proteção ao longo de ${term} meses`,
    },
    {
      fact: `Total pago é R$ ${paidTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      reason: `Soma nominal de todas as ${term} parcelas mensais`,
      consequence: `Inclui patrimônio, remuneração, seguro e atualização monetária`,
      origin: `Agregação do fluxo financeiro mensal do contrato`,
    },
    {
      fact: `${adjustmentMonths.length} reajustes ocorrem durante o contrato`,
      reason: `Periodicidade de ${adjRate}% a cada 12 meses conforme contrato`,
      consequence: `Parcelas e taxa aumentam nos meses de reajuste`,
      origin: `Meses: ${adjustmentMonths.map(r => r.month).join(', ')}`,
    },
  ];

  // ─── MOTOR DE TAGS ──────────────────────────────────────────────────────────
  const indicatorTags = {
    'Carta Atualizada': 'Valor projetado após todas as atualizações monetárias.',
    'Correção': 'Atualiza o patrimônio. Não remunera a administradora.',
    'Total Pago': 'Soma nominal das parcelas previstas.',
    'Taxa': 'Remuneração contratual da administradora.',
    'Seguro': 'Proteção mensal contratada.',
    'Amortização': 'Redução real da dívida através do pagamento.',
    'Custo Explícito': 'Taxa Administrativa + Seguro (sem correção monetária).',
  };

  // ─── GLOSSÁRIO ──────────────────────────────────────────────────────────────
  const glossary = [
    {
      term: 'Saldo Devedor',
      definition: 'Valor da carta que ainda não foi amortizado (pago).',
      howCalculated: 'Começa em R$ ' + credit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' e diminui com cada parcela.',
      whereAppears: 'Bloco 1, Bloco 4, Bloco 6',
    },
    {
      term: 'Amortização',
      definition: 'Redução real da dívida.',
      howCalculated: 'Parte da parcela que efetivamente diminui o saldo devedor.',
      whereAppears: 'Bloco 4, Bloco 5',
    },
    {
      term: 'Atualização Monetária',
      definition: 'Correção do saldo devedor pelo índice contratado.',
      howCalculated: adjRate + '% a.a. aplicado ao saldo devedor atualizado.',
      whereAppears: 'Bloco 2, Bloco 4, Bloco 6',
    },
    {
      term: 'Taxa de Administração',
      definition: 'Percentual cobrado sobre o saldo devedor.',
      howCalculated: adminRate + '% do saldo devedor, corrigida conforme o índice.',
      whereAppears: 'Bloco 1, Bloco 3, Bloco 7',
    },
    {
      term: 'Seguro',
      definition: 'Proteção mensal contratada.',
      howCalculated: 'Geralmente um percentual do saldo devedor.',
      whereAppears: 'Bloco 2, Bloco 3, Bloco 4',
    },
    {
      term: 'Parcela',
      definition: 'Valor mensal pago.',
      howCalculated: 'Amortização + Taxa + Seguro. Aumenta nos meses de reajuste.',
      whereAppears: 'Bloco 1, Bloco 5, Tabela de Fluxo',
    },
  ];

  return {
    executiveSummary,
    moneyEvolution,
    effectiveCost,
    moneyLocation,
    installmentEvolution,
    creditEvolution,
    adminFeeEvolution,
    technicalIndicators,
    mathematicalEvidences,
    indicatorTags,
    glossary,
  };
}
