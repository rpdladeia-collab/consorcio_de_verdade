/**
 * Lógica matemática do Simulador: Lance sobre Carta x Categoria.
 * PROTEGIDA NO BACKEND.
 * 
 * Este simulador compara a diferença matemática entre ofertar um lance
 * calculado sobre o valor da carta de crédito vs. calculado sobre a categoria
 * (carta + taxa de administração).
 */

const EPS = 1e-9;

export interface LanceCartaXCategoriaInput {
  credit: number;      // Valor da carta atualizada (R$)
  adminRate: number;   // Taxa de administração (%)
  bidPct: number;      // Percentual de lance (%)
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

function money(v: number): string {
  return new Intl.NumberFormat("pt-BR", { 
    style: "currency", 
    currency: "BRL", 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(isFinite(v) ? v : 0);
}

function pct(v: number): string {
  return `${(isFinite(v) ? v : 0).toFixed(2).replace(".", ",")}%`;
}

export interface LanceCartaXCategoriaResult {
  inputs: Required<LanceCartaXCategoriaInput>;
  adminValue: number;        // Taxa adm em R$
  categoryBase: number;      // Categoria simplificada (Carta + Taxa)
  categoryBasePct: number;   // Categoria em % da carta
  lanceOnCredit: number;     // Lance sobre a carta (R$)
  lanceOnCategory: number;   // Lance sobre a categoria (R$)
  diff: number;              // Diferença (R$)
  diffPctVsCreditLance: number; // Aumento sobre o lance simples (%)
  effectiveCategoryPct: number; // Lance sobre categoria equivale a X% da carta
  verdict: "positivo" | "atencao" | "critico";
  decisionText: string;
  positives: string[];
  attentions: string[];
  audit: { item: string; valor: string; racional: string }[];
}

export function calcLanceCartaXCategoria(raw: LanceCartaXCategoriaInput): LanceCartaXCategoriaResult {
  const credit = clamp(raw.credit || 0, 0, 1e12);
  const adminRate = clamp(raw.adminRate || 0, 0, 100);
  const bidPct = clamp(raw.bidPct || 0, 0, 100);

  const adminValue = (credit * adminRate) / 100;
  const categoryBase = credit + adminValue;
  const categoryBasePct = credit > EPS ? (categoryBase / credit) * 100 : 0;

  const lanceOnCredit = (credit * bidPct) / 100;
  const lanceOnCategory = (categoryBase * bidPct) / 100;
  
  const diff = lanceOnCategory - lanceOnCredit;
  const diffPctVsCreditLance = lanceOnCredit > EPS ? (diff / lanceOnCredit) * 100 : 0;
  const effectiveCategoryPct = credit > EPS ? (lanceOnCategory / credit) * 100 : 0;

  // Veredito e Textos
  const positives: string[] = [
    "O lance sobre a carta é mais transparente e exige menos capital próprio.",
    "Regras de lance sobre a carta facilitam a comparação entre diferentes administradoras."
  ];
  
  const attentions: string[] = [
    `Ao usar a base 'categoria', seu lance de ${pct(bidPct)} na verdade representa ${pct(effectiveCategoryPct)} do valor do crédito.`,
    `Neste exemplo, você precisa de ${money(diff)} a mais para ofertar o mesmo percentual.`
  ];

  let verdict: "positivo" | "atencao" | "critico" = "atencao";
  let decisionText = "";

  if (diff === 0) {
    verdict = "positivo";
    decisionText = "Não há diferença entre as bases de cálculo (taxa adm zero).";
  } else {
    verdict = "atencao";
    decisionText = `O lance sobre categoria exige um desembolso ${pct(diffPctVsCreditLance)} maior do que o lance sobre a carta para o mesmo percentual anunciado.`;
  }

  const audit = [
    { 
      item: "Base: Carta de Crédito", 
      valor: money(credit), 
      racional: "Valor nominal da carta atualizada." 
    },
    { 
      item: "Taxa Adm. em R$", 
      valor: money(adminValue), 
      racional: `Carta × Taxa Adm = ${money(credit)} × ${pct(adminRate)}` 
    },
    { 
      item: "Base: Categoria", 
      valor: money(categoryBase), 
      racional: `Carta + Taxa Adm = ${money(credit)} + ${money(adminValue)}` 
    },
    { 
      item: "Lance sobre Carta", 
      valor: money(lanceOnCredit), 
      racional: `Carta × % Lance = ${money(credit)} × ${pct(bidPct)}` 
    },
    { 
      item: "Lance sobre Categoria", 
      valor: money(lanceOnCategory), 
      racional: `Categoria × % Lance = ${money(categoryBase)} × ${pct(bidPct)}` 
    },
    { 
      item: "Diferença Real", 
      valor: money(diff), 
      racional: "Lance Categoria - Lance Carta" 
    }
  ];

  return {
    inputs: { credit, adminRate, bidPct },
    adminValue,
    categoryBase,
    categoryBasePct,
    lanceOnCredit,
    lanceOnCategory,
    diff,
    diffPctVsCreditLance,
    effectiveCategoryPct,
    verdict,
    decisionText,
    positives,
    attentions,
    audit
  };
}
