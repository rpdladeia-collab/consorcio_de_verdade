
/**
 * Motor de Cálculo: Custo de Cancelamento
 * Transplante direto da lógica do arquivo HTML fornecido pelo usuário.
 */

export interface CancelamentoInput {
  credit: number;
  totalMonths: number;
  canceledMonth: number;
  insurancePct: number;
  adminRatePct: number;
  reserveRatePct: number;
  reajustPct: number;
  reajustPeriod: number;
  reserveReturnable: boolean;
  penaltyRatePct: number;
  correctionPct: number;
  cdiAnnualPct: number;
}

export interface MonthlyRow {
  mes: number;
  saldoDevedorInicial: number;
  fundoComum: number;
  fundoReserva: number;
  taxaAdm: number;
  seguro: number;
  parcela: number;
  saldoDevedorFinal: number;
  isReajust: boolean;
}

export function runCancelamento(input: CancelamentoInput) {
  const {
    credit,
    totalMonths,
    canceledMonth,
    insurancePct,
    adminRatePct,
    reserveRatePct,
    reajustPct,
    reajustPeriod,
    reserveReturnable,
    penaltyRatePct,
    correctionPct,
    cdiAnnualPct,
  } = input;

  // --- Valores Iniciais de Crédito e Taxas ---
  let currentCredit = credit;
  let currentAdminAmount = credit * adminRatePct / 100;
  let currentReserveAmount = credit * reserveRatePct / 100;

  // --- Saldo devedor inicial ---
  let saldoDevedor = currentCredit + currentAdminAmount + currentReserveAmount;

  const monthlyData: MonthlyRow[] = [];
  let totalPaidByClient = 0;
  let totalPaidCommonFund = 0;
  let totalPaidAdmin = 0;
  let totalPaidReserve = 0;
  let totalPaidInsurance = 0;

  for (let m = 1; m <= canceledMonth; m++) {
    const isReajust = m > 1 && (m - 1) % reajustPeriod === 0;
    
    if (isReajust) {
      const factor = (1 + reajustPct / 100);
      currentCredit *= factor;
      currentAdminAmount *= factor;
      currentReserveAmount *= factor;
      saldoDevedor *= factor;
    }

    // A parcela é calculada sobre o valor atualizado (diluído pelo prazo total)
    const monthlyCommonFund = currentCredit / totalMonths;
    const monthlyAdminDiluted = currentAdminAmount / totalMonths;
    const monthlyReserveDiluted = currentReserveAmount / totalMonths;
    const seguroMes = saldoDevedor * insurancePct / 100;
    
    const parcelaMes = monthlyCommonFund + monthlyReserveDiluted + monthlyAdminDiluted + seguroMes;
    const novoSaldo = saldoDevedor - parcelaMes;

    totalPaidByClient += parcelaMes;
    totalPaidCommonFund += monthlyCommonFund;
    totalPaidAdmin += monthlyAdminDiluted;
    totalPaidReserve += monthlyReserveDiluted;
    totalPaidInsurance += seguroMes;

    monthlyData.push({
      mes: m,
      saldoDevedorInicial: saldoDevedor,
      fundoComum: monthlyCommonFund,
      fundoReserva: monthlyReserveDiluted,
      taxaAdm: monthlyAdminDiluted,
      seguro: seguroMes,
      parcela: parcelaMes,
      saldoDevedorFinal: novoSaldo,
      isReajust: isReajust
    });

    saldoDevedor = novoSaldo;
  }

  // --- Base de devolução ---
  const baseDevolucao = totalPaidCommonFund + (reserveReturnable ? totalPaidReserve : 0);
  const multaValor = totalPaidCommonFund * penaltyRatePct / 100;
  const baseAposMulta = Math.max(0, baseDevolucao - multaValor);

  // --- Valor final (com reajustes e correção) ---
  const remainingMonthsToEnd = totalMonths - canceledMonth;
  const remainingReajustsAfterCancel = Math.floor(remainingMonthsToEnd / reajustPeriod);
  let valorComReajustes = baseAposMulta;
  
  for (let r = 0; r < remainingReajustsAfterCancel; r++) {
    valorComReajustes = valorComReajustes * (1 + reajustPct / 100);
  }

  const valorCorrigido = valorComReajustes * (1 + correctionPct / 100);

  // --- Custo de oportunidade ---
  const waitMonths = remainingMonthsToEnd + 1;
  const cdiMonthly = Math.pow(1 + cdiAnnualPct/100, 1/12) - 1;
  const valorComCDI = valorCorrigido * Math.pow(1 + cdiMonthly, waitMonths);
  const custoOportunidade = valorComCDI - valorCorrigido;

  // --- Resumo ---
  const prejuizo = totalPaidByClient - baseAposMulta;
  const prejuizoPct = totalPaidByClient > 0 ? (prejuizo / totalPaidByClient) * 100 : 0;

  return {
    kpis: {
      totalPaidByClient,
      totalPaidCommonFund,
      totalPaidAdmin,
      totalPaidReserve,
      totalPaidInsurance,
      baseAposMulta,
      valorCorrigido,
      valorComCDI,
      custoOportunidade,
      prejuizo,
      prejuizoPct,
      waitMonths
    },
    table: monthlyData,
    breakdown: {
      paid: {
        common: totalPaidCommonFund,
        reserve: totalPaidReserve,
        admin: totalPaidAdmin,
        insurance: totalPaidInsurance,
        total: totalPaidByClient
      },
      return: {
        common: totalPaidCommonFund,
        adminRetained: totalPaidAdmin,
        insuranceRetained: totalPaidInsurance,
        reserve: totalPaidReserve,
        reserveReturnable,
        penaltyPct: penaltyRatePct,
        penaltyValue: multaValor,
        baseAposMulta
      }
    }
  };
}
