export interface TechnicalReportAnalysis {
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

  installmentEvolution: {
    first: number;
    max: number;
    last: number;
    adjustmentCount: number;
    growthPct: number;
    growthNominal: number;
    intuitiveRatio: string;
  };

  creditEvolution: {
    initial: number;
    monetaryUpdatesAccum: number;
    final: number;
    growthNominal: number;
    growthPct: number;
  };

  adminFeeEvolution: {
    contractedRate: number;
    initialFinancialValue: number;
    financialCorrections: number;
    finalFinancialValue: number;
    financialIncrease: number;
    financialIncreasePct: number;
    explanation: string;
  };

  technicalIndicators: {
    term: string;
    correctionContracted: string;
    insuranceContracted: string;
    adminRate: string;
    periodicity: string;
    model: string;
  };

  mathematicalEvidences: Array<{
    fact: string;
    reason: string;
    consequence: string;
    origin: string;
  }>;

  indicatorTags: {
    [key: string]: string;
  };

  glossary: Array<{
    term: string;
    definition: string;
    howCalculated: string;
    whereAppears: string;
  }>;
}
