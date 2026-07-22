// ============================================================
// DADOS OFICIAIS DO BANCO CENTRAL DO BRASIL (BCB)
// Fonte: Panorama de Consórcio BCB 2016–2024
// ATENÇÃO: Estes dados são imutáveis. Não altere nenhum valor.
// ============================================================

export interface SegmentRow {
  ano: number;
  segmento: string;
  vendidas: number;
  ativas: number;
  excluidas: number;
  ie: number;
  status: string;
}

export interface AnnualRow {
  ano: number;
  vendidas: number;
  ativas: number;
  excluidas: number;
  ie: number;
  contemplacoes: number;
  lance: number;
}

export interface ComplaintBCB {
  ano: number;
  procedentes: number;
  outras: number;
  nao_reguladas: number;
  total: number;
  indice_proc_milhao: number;
  indice_total_milhao: number;
  valor_maior_indice: number;
}

export interface ConsumerGovRow {
  ano: number;
  reclamacoes: number;
}

export interface ConsumerGovReason {
  rank: number;
  motivo: string;
  pct: number;
}

export interface MacroRow {
  ano: number;
  selic: number;
  financiamento_imob: number;
  vendidas: number;
  ativas: number;
  ie: number;
  evento: string;
}

// Paleta de cores exata do HTML original
export const COLORS = {
  terra: '#c2410c',
  terraDark: '#8a2f0a',
  olive: '#2f5233',
  oliveDark: '#1f3922',
  black: '#15140f',
  muted: '#716b60',
  line: '#ddd5c5',
  grey: '#8a8275',
};

export const SEGMENT_COLORS: Record<string, string> = {
  'Imóveis': COLORS.terra,
  'Automóveis': COLORS.olive,
  'Motocicletas': COLORS.black,
  'Outros bens e serviços': COLORS.grey,
  'Geral': COLORS.terra,
};

// ── segmentData ──────────────────────────────────────────────
export const segmentData: SegmentRow[] = [
  {"ano": 2016, "segmento": "Imóveis", "vendidas": 0.218, "ativas": 0.857, "excluidas": 1.35, "ie": 0.612, "status": "publicado/derivado"},
  {"ano": 2016, "segmento": "Automóveis", "vendidas": 1.08, "ativas": 3.37, "excluidas": 2.73, "ie": 0.447, "status": "publicado/derivado"},
  {"ano": 2016, "segmento": "Motocicletas", "vendidas": 0.887, "ativas": 2.44, "excluidas": 2.72, "ie": 0.528, "status": "publicado/derivado"},
  {"ano": 2016, "segmento": "Outros bens e serviços", "vendidas": 0.084, "ativas": 0.345, "excluidas": 0.19, "ie": 0.355, "status": "derivado"},
  {"ano": 2017, "segmento": "Imóveis", "vendidas": 0.277, "ativas": 0.851, "excluidas": 1.42, "ie": 0.624, "status": "publicado/derivado"},
  {"ano": 2017, "segmento": "Automóveis", "vendidas": 1.11, "ativas": 3.51, "excluidas": 2.94, "ie": 0.456, "status": "publicado/derivado"},
  {"ano": 2017, "segmento": "Motocicletas", "vendidas": 0.868, "ativas": 2.20, "excluidas": 2.56, "ie": 0.538, "status": "publicado/derivado"},
  {"ano": 2017, "segmento": "Outros bens e serviços", "vendidas": 0.112, "ativas": 0.369, "excluidas": 0.18, "ie": 0.328, "status": "derivado"},
  {"ano": 2018, "segmento": "Imóveis", "vendidas": 0.269, "ativas": 0.900, "excluidas": 1.51, "ie": 0.627, "status": "publicado"},
  {"ano": 2018, "segmento": "Automóveis", "vendidas": 1.15, "ativas": 3.66, "excluidas": 3.07, "ie": 0.456, "status": "publicado"},
  {"ano": 2018, "segmento": "Motocicletas", "vendidas": 1.01, "ativas": 2.18, "excluidas": 2.46, "ie": 0.530, "status": "publicado"},
  {"ano": 2018, "segmento": "Outros bens e serviços", "vendidas": 0.149, "ativas": 0.438, "excluidas": 0.196, "ie": 0.309, "status": "derivado"},
  {"ano": 2019, "segmento": "Imóveis", "vendidas": 0.335, "ativas": 0.995, "excluidas": 1.65, "ie": 0.623, "status": "publicado"},
  {"ano": 2019, "segmento": "Automóveis", "vendidas": 1.38, "ativas": 3.83, "excluidas": 3.17, "ie": 0.452, "status": "publicado"},
  {"ano": 2019, "segmento": "Motocicletas", "vendidas": 1.03, "ativas": 2.17, "excluidas": 2.45, "ie": 0.531, "status": "publicado"},
  {"ano": 2019, "segmento": "Outros bens e serviços", "vendidas": 0.233, "ativas": 0.551, "excluidas": 0.246, "ie": 0.308, "status": "publicado"},
  {"ano": 2020, "segmento": "Imóveis", "vendidas": 0.371, "ativas": 1.06, "excluidas": 1.71, "ie": 0.617, "status": "publicado"},
  {"ano": 2020, "segmento": "Automóveis", "vendidas": 1.35, "ativas": 3.91, "excluidas": 3.23, "ie": 0.453, "status": "publicado"},
  {"ano": 2020, "segmento": "Motocicletas", "vendidas": 1.10, "ativas": 2.29, "excluidas": 2.42, "ie": 0.514, "status": "publicado"},
  {"ano": 2020, "segmento": "Outros bens e serviços", "vendidas": 0.298, "ativas": 0.678, "excluidas": 0.290, "ie": 0.299, "status": "publicado"},
  {"ano": 2021, "segmento": "Imóveis", "vendidas": 0.490, "ativas": 1.21, "excluidas": 1.87, "ie": 0.607, "status": "publicado"},
  {"ano": 2021, "segmento": "Automóveis", "vendidas": 1.1, "ativas": 2.38, "excluidas": 2.48, "ie": 0.51, "status": "publicado"},
  {"ano": 2021, "segmento": "Motocicletas", "vendidas": 1.1, "ativas": 2.38, "excluidas": 2.48, "ie": 0.51, "status": "publicado"},
  {"ano": 2021, "segmento": "Outros bens e serviços", "vendidas": 0.397, "ativas": 0.867, "excluidas": 0.387, "ie": 0.308, "status": "publicado"},
  {"ano": 2022, "segmento": "Imóveis", "vendidas": 0.619, "ativas": 1.43, "excluidas": 2.19, "ie": 0.606, "status": "publicado"},
  {"ano": 2022, "segmento": "Automóveis", "vendidas": 1.49, "ativas": 4.25, "excluidas": 3.7, "ie": 0.465, "status": "publicado"},
  {"ano": 2022, "segmento": "Motocicletas", "vendidas": 1.21, "ativas": 2.62, "excluidas": 2.63, "ie": 0.501, "status": "publicado"},
  {"ano": 2022, "segmento": "Outros bens e serviços", "vendidas": 0.5474, "ativas": 1.13, "excluidas": 0.508, "ie": 0.31, "status": "publicado"},
  {"ano": 2023, "segmento": "Imóveis", "vendidas": 0.768, "ativas": 1.73, "excluidas": 2.5, "ie": 0.591, "status": "publicado"},
  {"ano": 2023, "segmento": "Automóveis", "vendidas": 1.68, "ativas": 4.5, "excluidas": 3.96, "ie": 0.468, "status": "publicado"},
  {"ano": 2023, "segmento": "Motocicletas", "vendidas": 1.26, "ativas": 2.87, "excluidas": 2.76, "ie": 0.49, "status": "publicado"},
  {"ano": 2023, "segmento": "Outros bens e serviços", "vendidas": 0.429, "ativas": 1.25, "excluidas": 0.676, "ie": 0.351, "status": "publicado"},
  {"ano": 2024, "segmento": "Imóveis", "vendidas": 0.998, "ativas": 2.16, "excluidas": 2.85, "ie": 0.569, "status": "publicado"},
  {"ano": 2024, "segmento": "Automóveis", "vendidas": 1.76, "ativas": 4.87, "excluidas": 4.27, "ie": 0.468, "status": "publicado"},
  {"ano": 2024, "segmento": "Motocicletas", "vendidas": 1.35, "ativas": 3.07, "excluidas": 2.84, "ie": 0.481, "status": "publicado"},
  {"ano": 2024, "segmento": "Outros bens e serviços", "vendidas": 0.424, "ativas": 1.26, "excluidas": 0.789, "ie": 0.385, "status": "publicado"},
];

// ── annualData ───────────────────────────────────────────────
export const annualData: AnnualRow[] = [
  {"ano": 2016, "vendidas": 2.28, "ativas": 6.95, "excluidas": 7.0, "ie": 0.502, "contemplacoes": 1.18, "lance": 0.698},
  {"ano": 2017, "vendidas": 2.36, "ativas": 6.93, "excluidas": 7.1, "ie": 0.507, "contemplacoes": 1.15, "lance": 0.719},
  {"ano": 2018, "vendidas": 2.58, "ativas": 7.18, "excluidas": 7.2, "ie": 0.503, "contemplacoes": 1.14, "lance": 0.724},
  {"ano": 2019, "vendidas": 2.98, "ativas": 7.55, "excluidas": 7.51, "ie": 0.499, "contemplacoes": 1.17, "lance": 0.739},
  {"ano": 2020, "vendidas": 3.12, "ativas": 7.93, "excluidas": 7.65, "ie": 0.491, "contemplacoes": 1.24, "lance": 0.732},
  {"ano": 2021, "vendidas": 3.41, "ativas": 8.48, "excluidas": 8.13, "ie": 0.490, "contemplacoes": 1.34, "lance": 0.734},
  {"ano": 2022, "vendidas": 3.86, "ativas": 9.44, "excluidas": 9.04, "ie": 0.489, "contemplacoes": 1.44, "lance": 0.757},
  {"ano": 2023, "vendidas": 4.14, "ativas": 10.34, "excluidas": 9.89, "ie": 0.489, "contemplacoes": 1.58, "lance": 0.766},
  {"ano": 2024, "vendidas": 4.53, "ativas": 11.35, "excluidas": 10.75, "ie": 0.486, "contemplacoes": 1.68, "lance": 0.783},
];

// ── complaintsBCB ────────────────────────────────────────────
export const complaintsBCB: ComplaintBCB[] = [
  {"ano":2017,"procedentes":240,"outras":2428,"nao_reguladas":2240,"total":4908,"indice_proc_milhao":38.8,"indice_total_milhao":793.48,"valor_maior_indice":1341.08},
  {"ano":2018,"procedentes":176,"outras":2030,"nao_reguladas":1798,"total":4004,"indice_proc_milhao":37.52,"indice_total_milhao":853.6,"valor_maior_indice":1080.88},
  {"ano":2019,"procedentes":436,"outras":2200,"nao_reguladas":1586,"total":4222,"indice_proc_milhao":83.3,"indice_total_milhao":806.59,"valor_maior_indice":1186.23},
  {"ano":2020,"procedentes":869,"outras":3088,"nao_reguladas":1403,"total":5360,"indice_proc_milhao":145.48,"indice_total_milhao":897.34,"valor_maior_indice":5035.24},
  {"ano":2021,"procedentes":1905,"outras":3869,"nao_reguladas":586,"total":6360,"indice_proc_milhao":277.66,"indice_total_milhao":926.98,"valor_maior_indice":7765.31},
  {"ano":2022,"procedentes":2653,"outras":3593,"nao_reguladas":354,"total":6600,"indice_proc_milhao":352.38,"indice_total_milhao":876.63,"valor_maior_indice":10968.92},
  {"ano":2023,"procedentes":3179,"outras":2974,"nao_reguladas":397,"total":6550,"indice_proc_milhao":380.69,"indice_total_milhao":784.37,"valor_maior_indice":6168.75},
  {"ano":2024,"procedentes":2715,"outras":2616,"nao_reguladas":287,"total":5618,"indice_proc_milhao":296.49,"indice_total_milhao":613.52,"valor_maior_indice":3782.34},
  {"ano":2025,"procedentes":2955,"outras":2889,"nao_reguladas":556,"total":6400,"indice_proc_milhao":270.21,"indice_total_milhao":585.23,"valor_maior_indice":5151.45},
];

// ── consumerGovComplaints ────────────────────────────────────
export const consumerGovComplaints: ConsumerGovRow[] = [
  {ano:2016, reclamacoes:636},
  {ano:2017, reclamacoes:878},
  {ano:2018, reclamacoes:1020},
  {ano:2019, reclamacoes:1168},
  {ano:2020, reclamacoes:2252},
  {ano:2021, reclamacoes:3854},
  {ano:2022, reclamacoes:4119},
  {ano:2023, reclamacoes:4134},
  {ano:2024, reclamacoes:3853},
  {ano:2025, reclamacoes:6986},
];

// ── consumerGovTopReasons2025 ────────────────────────────────
export const consumerGovTopReasons2025: ConsumerGovReason[] = [
  {rank:1, motivo:'Dificuldade ou atraso na devolução de valores', pct:0.1589},
  {rank:2, motivo:'Oferta não cumprida ou serviço não fornecido', pct:0.0908},
  {rank:3, motivo:'Não entrega ou demora na entrega do serviço', pct:0.0792},
];

// ── macroData ────────────────────────────────────────────────
export const macroData: MacroRow[] = [
  {"ano": 2016, "selic": 0.1375, "financiamento_imob": 0.154,   "vendidas": 2.28, "ativas": 6.95,  "ie": 0.502, "evento": "Recessão Brasil"},
  {"ano": 2017, "selic": 0.07,   "financiamento_imob": 0.132,   "vendidas": 2.36, "ativas": 6.93,  "ie": 0.507, "evento": "Pós-recessão"},
  {"ano": 2018, "selic": 0.065,  "financiamento_imob": 0.1018,  "vendidas": 2.58, "ativas": 7.18,  "ie": 0.503, "evento": "Juros baixos"},
  {"ano": 2019, "selic": 0.045,  "financiamento_imob": 0.0895,  "vendidas": 2.98, "ativas": 7.55,  "ie": 0.499, "evento": "Selic baixa"},
  {"ano": 2020, "selic": 0.02,   "financiamento_imob": 0.0781,  "vendidas": 3.12, "ativas": 7.93,  "ie": 0.491, "evento": "Pandemia Covid-19"},
  {"ano": 2021, "selic": 0.0925, "financiamento_imob": 0.0793,  "vendidas": 3.41, "ativas": 8.48,  "ie": 0.490, "evento": "Inflação + alta Selic"},
  {"ano": 2022, "selic": 0.1375, "financiamento_imob": 0.1092,  "vendidas": 3.86, "ativas": 9.44,  "ie": 0.489, "evento": "Choque Selic"},
  {"ano": 2023, "selic": 0.1175, "financiamento_imob": 0.121,   "vendidas": 4.14, "ativas": 10.34, "ie": 0.489, "evento": "Juros altos"},
  {"ano": 2024, "selic": 0.1225, "financiamento_imob": 0.1155,  "vendidas": 4.53, "ativas": 11.35, "ie": 0.486, "evento": "Juros altos / imóveis acelera"},
];
