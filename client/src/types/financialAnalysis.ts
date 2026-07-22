export interface FinancialAnalysis {
  cardTags: {
    firstInstallment: string;
    maxInstallment: string;
    totalPaid: string;
    finalCredit: string;
  };
  executiveSummary: {
    credit: number;
    term: number;
    adminRate: number;
    correction: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskReason: string;
  };
  moneyDistribution: {
    creditInitial: number;
    creditFinal: number;
    creditGrowth: number;
    creditGrowthPct: number;
    adminInitial: number;
    adminFinal: number;
    adminGrowth: number;
    adminGrowthPct: number;
    insuranceTotal: number;
    insurancePct: number;
  };
  effectiveCost: {
    explicit: number;
    pctOfInitial: number;
    pctOfFinal: number;
    pctOfTotalPaid: number;
    interpretation: string;
  };
  moneyFlow: {
    amortizationPct: number;
    adminPct: number;
    insurancePct: number;
    correctionPct: number;
    amortizationValue: number;
    adminValue: number;
    insuranceValue: number;
    correctionValue: number;
  };
  installmentEvolution: {
    first: number;
    last: number;
    max: number;
    growthPct: number;
    growthNominal: number;
    adjustmentCount: number;
    maxAnnualAdjustment: number;
  };
  creditEvolution: {
    initial: number;
    final: number;
    correctionAccum: number;
    growthPct: number;
    avgAnnualGrowth: number;
  };
  adminEvolution: {
    contracted: number;
    effective: number;
    growthPct: number;
    explanation: string;
  };
  technicalIndicators: {
    term: string;
    correction: string;
    insurance: string;
    adminRate: string;
    model: string;
  };
  autoInterpretation: {
    positives: string[];
    attentions: string[];
    risks: string[];
    profile: string[];
  };
}
