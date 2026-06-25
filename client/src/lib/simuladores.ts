// Catálogo central dos simuladores do Consórcio de Verdade.
// Usado pela Central de Simuladores e pela navegação.

export type Complexity = "Simples" | "Intermediário" | "Avançado";

export interface SimuladorMeta {
  slug: string;
  title: string;
  question: string;        // a dúvida real do usuário
  shortDesc: string;
  category: CategoryKey;
  complexity: Complexity;
  timeMin: number;         // tempo estimado em minutos
  status: "ativo" | "em_breve";
  tags: string[];
}

export type CategoryKey =
  | "lances"
  | "decisao"
  | "saude"
  | "proposta";

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; pain: string; desc: string }
> = {
  lances: {
    label: "Entender meu lance",
    pain: "Quanto eu realmente ganho ou perco com cada tipo de lance?",
    desc: "Compare lance embutido, livre e fixo e descubra o custo e a força real de cada estratégia.",
  },
  decisao: {
    label: "Decidir se vale a pena",
    pain: "Consórcio é melhor que financiamento ou investir o dinheiro?",
    desc: "Compare consórcio com outras formas de adquirir ou rentabilizar seu dinheiro.",
  },
  saude: {
    label: "Avaliar o grupo",
    pain: "Esse grupo é saudável? Quando devo esperar ser contemplado?",
    desc: "Analise a saúde do grupo, a zona de contemplação e o risco de exclusão.",
  },
  proposta: {
    label: "Auditar uma proposta",
    pain: "Essa proposta que me ofereceram é boa ou tem pegadinha?",
    desc: "Faça um raio-x completo de qualquer proposta de consórcio.",
  },
};

export const SIMULADORES: SimuladorMeta[] = [
  {
    slug: "lance-embutido",
    title: "Lance Embutido",
    question: "Lance embutido: vale a pena no seu caso?",
    shortDesc:
      "Descubra quanto crédito você realmente recebe e qual o custo econômico de usar parte da carta como lance.",
    category: "lances",
    complexity: "Simples",
    timeMin: 1,
    status: "ativo",
    tags: ["crédito líquido", "eficiência"],
  },
  {
    slug: "lance-livre",
    title: "Lance Livre",
    question: "Quanto de lance livre você precisa para ser competitivo?",
    shortDesc:
      "Simule diferentes percentuais de lance livre e entenda o impacto no seu fluxo e na chance de contemplação.",
    category: "lances",
    complexity: "Intermediário",
    timeMin: 2,
    status: "ativo",
    tags: ["competitividade", "fluxo"],
  },
  {
    slug: "lance-fixo",
    title: "Lance Fixo",
    question: "O lance fixo do seu grupo é vantajoso?",
    shortDesc:
      "Avalie o percentual de lance fixo, o capital exigido e o efeito sobre o saldo e o prazo.",
    category: "lances",
    complexity: "Intermediário",
    timeMin: 2,
    status: "ativo",
    tags: ["lance fixo", "saldo devedor"],
  },
  {
    slug: "consorcio-financiamento",
    title: "Consórcio x Financiamento",
    question: "Consórcio sai mais barato que financiamento?",
    shortDesc:
      "Compare o custo total, os juros e a lógica de cada caminho para o mesmo objetivo.",
    category: "decisao",
    complexity: "Intermediário",
    timeMin: 3,
    status: "ativo",
    tags: ["custo total", "juros"],
  },
  {
    slug: "consorcio-investimentos",
    title: "Consórcio x Investimentos",
    question: "Vale mais a pena investir o dinheiro do que fazer consórcio?",
    shortDesc:
      "Confronte o consórcio com um cenário de investimento equivalente ao longo do tempo.",
    category: "decisao",
    complexity: "Avançado",
    timeMin: 3,
    status: "ativo",
    tags: ["rendimento", "custo de oportunidade"],
  },
  {
    slug: "eficiencia-economica",
    title: "Eficiência Econômica",
    question: "Qual é a eficiência econômica real do seu consórcio?",
    shortDesc:
      "Mensure o custo efetivo sobre o capital novo e descubra o quanto cada real trabalha por você.",
    category: "decisao",
    complexity: "Avançado",
    timeMin: 2,
    status: "ativo",
    tags: ["custo efetivo", "capital novo"],
  },
  {
    slug: "zona-contemplacao",
    title: "Zona de Contemplação",
    question: "Quando você tem chance real de ser contemplado?",
    shortDesc:
      "Projete a faixa provável de contemplação com base no comportamento histórico do grupo.",
    category: "saude",
    complexity: "Intermediário",
    timeMin: 2,
    status: "ativo",
    tags: ["contemplação", "projeção"],
  },
  {
    slug: "saude-grupo",
    title: "Saúde do Grupo",
    question: "O seu grupo de consórcio é saudável?",
    shortDesc:
      "Avalie inadimplência, contemplações e tendência para entender o risco do grupo.",
    category: "saude",
    complexity: "Intermediário",
    timeMin: 2,
    status: "ativo",
    tags: ["inadimplência", "tendência"],
  },
  {
    slug: "exclusao",
    title: "Risco de Exclusão",
    question: "Qual o seu risco de ficar de fora do grupo?",
    shortDesc:
      "Entenda os cenários de exclusão, atraso e suas consequências financeiras.",
    category: "saude",
    complexity: "Simples",
    timeMin: 1,
    status: "ativo",
    tags: ["exclusão", "atraso"],
  },
  {
    slug: "diagnostico-proposta",
    title: "Diagnóstico de Propostas",
    question: "Essa proposta de consórcio é boa ou tem pegadinha?",
    shortDesc:
      "Faça um raio-x completo: taxa de administração, fundo de reserva, seguro, lance e custo real.",
    category: "proposta",
    complexity: "Avançado",
    timeMin: 4,
    status: "ativo",
    tags: ["raio-x", "taxa de adm", "custo real"],
  },
];

export function getSimulador(slug: string) {
  return SIMULADORES.find((s) => s.slug === slug);
}

export function simuladoresByCategory(cat: CategoryKey) {
  return SIMULADORES.filter((s) => s.category === cat);
}
