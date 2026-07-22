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
  | "custo"
  | "correcoes"
  | "autopagavel";

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; pain: string; desc: string }
> = {
  custo: {
    label: "Raio-X do Custo Total",
    pain: "Qual é o custo real do meu consórcio?",
    desc: "Separa taxa de administração, seguro, fundo reserva e correção monetária.",
  },
  correcoes: {
    label: "Raio-X das Correções",
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
    slug: "custo-operacao",
    moduleNumber: 3,
    title: "Raio-X do Custo Total",
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
    slug: "historico-correcoes",
    moduleNumber: 5,
    title: "Raio-X das Correções",
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
