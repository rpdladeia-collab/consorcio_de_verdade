// Catálogo central dos simuladores do Consórcio de Verdade.
// Fonte oficial: HTML Raio-x do Consórcio (6 módulos).
// Não adicionar simuladores que não estejam no HTML original.

export type Complexity = "Simples" | "Intermediário" | "Avançado";

export interface SimuladorMeta {
  slug: string;
  title: string;
  moduleNumber: number;      // número do módulo no HTML original (1–6)
  question: string;          // a dúvida real do usuário
  shortDesc: string;
  category: CategoryKey;
  complexity: Complexity;
  timeMin: number;           // tempo estimado em minutos
  status: "ativo" | "disponivel" | "em_breve";
  tags: string[];
}

export type CategoryKey =
  | "plano"
  | "contemplacao"
  | "custo"
  | "eficiencia"
  | "correcoes"
  | "autopagavel";

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; pain: string; desc: string }
> = {
  plano: {
    label: "Raio-X da Parcela",
    pain: "Como será o fluxo real de parcelas do meu consórcio?",
    desc: "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.",
  },
  contemplacao: {
    label: "Contemplação",
    pain: "Quanto de lance eu preciso e o que acontece depois que sou contemplado?",
    desc: "Analisa a força do lance, a carta líquida e projeta o fluxo pós-contemplação.",
  },
  custo: {
    label: "Custo da operação",
    pain: "Qual é o custo real do meu consórcio?",
    desc: "Separa taxa de administração, seguro, fundo reserva e correção monetária.",
  },
  eficiencia: {
    label: "Proporção da taxa",
    pain: "A taxa de administração está pesando quanto sobre o dinheiro que realmente recebi?",
    desc: "Mede a eficiência da taxa sobre o crédito líquido e o dinheiro novo efetivo.",
  },
  correcoes: {
    label: "Histórico de correções",
    pain: "Como as correções anuais afetam meu saldo e minhas parcelas ao longo do tempo?",
    desc: "Projeta a evolução anual da carta, do saldo e das parcelas com o índice de reajuste.",
  },
  autopagavel: {
    label: "Auto pagável?",
    pain: "Consórcio pode se pagar com o rendimento do imóvel ou investimento?",
    desc: "Compara o custo do consórcio com o retorno do ativo adquirido ou de um investimento equivalente.",
  },
};

export const SIMULADORES: SimuladorMeta[] = [
  {
    slug: "simule-seu-plano",
    moduleNumber: 1,
    title: "Raio-X da Parcela",
    question: "Como será o fluxo real de parcelas do meu consórcio?",
    shortDesc:
      "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.",
    category: "plano",
    complexity: "Simples",
    timeMin: 2,
    status: "ativo",
    tags: ["fluxo", "parcelas", "reajuste"],
  },
  {
    slug: "contemplacao",
    moduleNumber: 2,
    title: "Contemplação",
    question: "Quanto de lance eu preciso e o que acontece depois que sou contemplado?",
    shortDesc:
      "Analisa a força do lance (próprio, FGTS e embutido), a carta líquida e projeta o fluxo pós-contemplação.",
    category: "contemplacao",
    complexity: "Intermediário",
    timeMin: 3,
    status: "disponivel",
    tags: ["lance", "carta líquida", "pós-contemplação"],
  },
  {
    slug: "custo-operacao",
    moduleNumber: 3,
    title: "Custo da operação",
    question: "Qual é o custo real do meu consórcio?",
    shortDesc:
      "Separa taxa de administração, seguro, fundo reserva e correção monetária para uma leitura honesta do custo.",
    category: "custo",
    complexity: "Intermediário",
    timeMin: 2,
    status: "disponivel",
    tags: ["taxa de adm", "seguro", "fundo reserva"],
  },
  {
    slug: "proporcao-taxa",
    moduleNumber: 4,
    title: "Proporção da taxa",
    question: "A taxa de administração está pesando quanto sobre o dinheiro que realmente recebi?",
    shortDesc:
      "Mede a eficiência da taxa sobre o crédito líquido e o dinheiro novo efetivo.",
    category: "eficiencia",
    complexity: "Avançado",
    timeMin: 2,
    status: "disponivel",
    tags: ["eficiência", "dinheiro novo", "crédito líquido"],
  },
  {
    slug: "historico-correcoes",
    moduleNumber: 5,
    title: "Histórico de correções",
    question: "Como as correções anuais afetam meu saldo e minhas parcelas ao longo do tempo?",
    shortDesc:
      "Projeta a evolução anual da carta, do saldo e das parcelas com o índice de reajuste.",
    category: "correcoes",
    complexity: "Simples",
    timeMin: 2,
    status: "disponivel",
    tags: ["reajuste", "saldo", "evolução"],
  },
  {
    slug: "auto-pagavel",
    moduleNumber: 6,
    title: "Auto pagável?",
    question: "Consórcio pode se pagar com o rendimento do ativo ou de um investimento equivalente?",
    shortDesc:
      "Compara o custo do consórcio com o retorno do ativo adquirido ou de um investimento equivalente.",
    category: "autopagavel",
    complexity: "Avançado",
    timeMin: 3,
    status: "disponivel",
    tags: ["auto pagável", "rendimento", "investimento"],
  },
];

export function getSimulador(slug: string) {
  return SIMULADORES.find((s) => s.slug === slug);
}

export function simuladoresByCategory(cat: CategoryKey) {
  return SIMULADORES.filter((s) => s.category === cat);
}
