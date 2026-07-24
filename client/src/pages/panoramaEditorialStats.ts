export const PANORAMA_EDITORIAL_COVERAGE_LABEL = "2016–2025";

export const PANORAMA_EDITORIAL_HERO_STATS = [
  { num: "5,3 mi", label: "cotas comercializadas em 2025" },
  { num: "12,8 mi", label: "cotas ativas em dez/2025" },
  { num: "48,4%", label: "índice de exclusão geral em 2025" },
  { num: "77,8%", label: "contemplações por lance em 2025" },
] as const;

export const PANORAMA_EDITORIAL_CHAPTER_ONE_KPIS = [
  { num: "5,3 mi", label: "Cotas vendidas em 2025", accent: true },
  { num: "12,8 mi", label: "Cotas ativas em dez/2025" },
  {
    num: "+132,46%",
    label: "Crescimento 2016→2025",
    note: "de 2,28 mi para 5,3 mi",
  },
  { num: "9 anos", label: "de crescimento ininterrupto" },
] as const;

export const PANORAMA_EDITORIAL_TOTAL_SALES_2025 = {
  ano: "2025",
  vendidas: 5.32,
} as const;

export const PANORAMA_EDITORIAL_SEGMENT_SALES_2025: Readonly<
  Record<string, number>
> = {
  Imóveis: 1.39,
  Automóveis: 1.92,
  Motocicletas: 1.44,
  "Outros bens e serviços": 0.48,
};
