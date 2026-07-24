/**
 * Lógica matemática do Simulador de Zona de Contemplação.
 * PROTEGIDA NO BACKEND — nunca exposta ao frontend.
 * Fiel ao HTML original (renatto.com.br · Consórcio de Verdade).
 *
 * Analisa o histórico de lances vencedores (menor / médio / maior por assembleia)
 * e posiciona o "meu lance" testado na faixa provável de contemplação.
 */

export type ZonaMethod = "media" | "mediana";

export interface ZonaHistoryRow {
  ass: number; // número da assembleia
  low: number; // menor lance vencedor (%)
  mid: number; // lance médio / referência central (%)
  high: number; // maior lance vencedor (%)
}

export interface ZonaContemplacaoInput {
  rows: ZonaHistoryRow[];
  myBid: number; // meu lance testado (%)
  method?: ZonaMethod;
  modalidade?: string;
}

export interface ZonaResult {
  inputs: Required<ZonaContemplacaoInput>;
  // Estatísticas
  low: number;
  mid: number;
  high: number;
  myBid: number;
  amplitude: number;
  // Posicionamento
  position: number; // 0..100 (para barra visual)
  zone: "abaixo" | "entrada" | "competitiva" | "agressiva" | "sem_dados";
  zoneTitle: string;
  zoneDetail: string;
  distanceToRef: number; // pp acima/abaixo da referência central
  // Tendência
  trendLabel: string;
  trendDetail: string;
  trendDir: "up" | "down" | "flat" | "na";
  // Pressão / dispersão
  pressureLabel: string;
  pressureDetail: string;
  pressureLevel: "baixa" | "media" | "alta" | "na";
  // Veredito
  verdict: "positivo" | "atencao" | "critico";
  decisionText: string;
  warnings: string[];
  positives: string[];
  attentions: string[];
  // Dados para gráfico (série temporal)
  chartSeries: { label: string; ass: number; low: number; mid: number; high: number }[];
  // Memória
  audit: { item: string; valor: string; racional: string }[];
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isFinite(n) ? n : 0;
}

function avg(arr: ZonaHistoryRow[], key: keyof ZonaHistoryRow): number {
  const v = arr.map((r) => num(r[key])).filter((x) => x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

function median(arr: ZonaHistoryRow[], key: keyof ZonaHistoryRow): number {
  const v = arr
    .map((r) => num(r[key]))
    .filter((x) => x > 0)
    .sort((a, b) => a - b);
  if (!v.length) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

function pp(v: number): string {
  return `${v.toFixed(2).replace(".", ",")} p.p.`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1).replace(".", ",")}%`;
}

export function calcZonaContemplacao(raw: ZonaContemplacaoInput): ZonaResult {
  const warnings: string[] = [];
  const method: ZonaMethod = raw.method === "mediana" ? "mediana" : "media";
  const modalidade = raw.modalidade || "Lance livre";

  // Normaliza e ordena por assembleia desc (mais recente primeiro)
  const rows = (raw.rows || [])
    .map((r) => ({
      ass: num(r.ass),
      low: num(r.low),
      mid: num(r.mid),
      high: num(r.high),
    }))
    .filter((r) => r.low > 0 || r.mid > 0 || r.high > 0)
    .sort((a, b) => b.ass - a.ass);

  const myBid = clamp(num(raw.myBid), 0, 200);

  const stat = (key: keyof ZonaHistoryRow) =>
    method === "mediana" ? median(rows, key) : avg(rows, key);

  const low = stat("low");
  const mid = stat("mid");
  const high = stat("high");
  const amplitude = high && low ? high - low : 0;

  if (rows.length < 3) {
    warnings.push(
      "Com menos de 3 assembleias o histórico é frágil. Os resultados servem apenas como referência inicial."
    );
  }

  // Posicionamento na zona
  let zone: ZonaResult["zone"] = "sem_dados";
  let zoneTitle = "Sem dados suficientes";
  let zoneDetail = "Preencha menor, médio e maior lance de pelo menos uma assembleia.";
  let position = 0;

  if (rows.length && low && mid && high) {
    const minScale = Math.max(0, low - 10);
    const maxScale = Math.max(high + 10, myBid + 5, 100);
    position = clamp(((myBid - minScale) / (maxScale - minScale)) * 100, 0, 100);

    if (myBid < low) {
      zone = "abaixo";
      zoneTitle = "Abaixo da zona";
      zoneDetail = "O lance testado está abaixo do piso histórico. A chance de contemplação por lance é baixa.";
    } else if (myBid < mid) {
      zone = "entrada";
      zoneTitle = "Zona de entrada";
      zoneDetail = "Passou do piso histórico, mas ainda está abaixo da referência central. Competitividade parcial.";
    } else if (myBid <= high) {
      zone = "competitiva";
      zoneTitle = "Zona competitiva";
      zoneDetail = "Está dentro da faixa central/teto do histórico. Boa chance relativa de contemplação por lance.";
    } else {
      zone = "agressiva";
      zoneTitle = "Zona agressiva";
      zoneDetail = "Acima do teto histórico. Pode contemplar, mas reduz a eficiência do lance.";
    }
  }

  const distanceToRef = mid ? myBid - mid : 0;

  // Tendência (3 últimas vs 3 anteriores na referência central)
  let trendLabel = "—";
  let trendDetail = "Mínimo de 6 assembleias para medir tendência.";
  let trendDir: ZonaResult["trendDir"] = "na";
  if (rows.length >= 6) {
    const meanVals = (vals: number[]) => {
      const v = vals.filter((x) => x > 0);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
    };
    const last3 = meanVals(rows.slice(0, 3).map((r) => r.mid));
    const prev3 = meanVals(rows.slice(3, 6).map((r) => r.mid));
    const diff = last3 - prev3;
    if (Math.abs(diff) < 1) {
      trendLabel = "Estável";
      trendDetail = `Variação de ${pp(diff)} entre as médias recentes.`;
      trendDir = "flat";
    } else if (diff > 0) {
      trendLabel = "Em alta";
      trendDetail = `As 3 assembleias recentes estão ${pp(diff)} acima das 3 anteriores. Lances tendem a subir.`;
      trendDir = "up";
    } else {
      trendLabel = "Em queda";
      trendDetail = `As 3 assembleias recentes estão ${pp(Math.abs(diff))} abaixo das 3 anteriores. Lances tendem a cair.`;
      trendDir = "down";
    }
  }

  // Pressão / dispersão
  let pressureLabel = "—";
  let pressureDetail = "Amplitude entre menor e maior lance.";
  let pressureLevel: ZonaResult["pressureLevel"] = "na";
  if (amplitude) {
    if (amplitude <= 10) {
      pressureLabel = "Baixa";
      pressureDetail = "Disputa concentrada. A faixa de lances é previsível.";
      pressureLevel = "baixa";
    } else if (amplitude <= 22) {
      pressureLabel = "Média";
      pressureDetail = "Existe dispersão relevante. Leia a faixa com margem de segurança.";
      pressureLevel = "media";
    } else {
      pressureLabel = "Alta";
      pressureDetail = "Disputa muito aberta. Um lance isolado pode distorcer a leitura.";
      pressureLevel = "alta";
    }
  }

  // Veredito
  let verdict: ZonaResult["verdict"] = "atencao";
  let decisionText = "";
  if (zone === "sem_dados") {
    verdict = "critico";
    decisionText = "Sem histórico suficiente não é possível posicionar o lance. Reúna ao menos algumas assembleias da mesma modalidade.";
  } else if (zone === "abaixo") {
    verdict = "critico";
    decisionText = "Seu lance está abaixo do piso histórico. Dificilmente vence por lance — considere elevar a oferta ou contar com sorteio.";
  } else if (zone === "entrada") {
    verdict = "atencao";
    decisionText = "Seu lance ultrapassa o piso, mas fica abaixo da referência central. É um lance defensável, porém arriscado em assembleias disputadas.";
  } else if (zone === "competitiva") {
    verdict = "positivo";
    decisionText = "Seu lance está na faixa central/teto do histórico. É uma posição competitiva — boa relação entre chance e eficiência.";
  } else {
    verdict = "atencao";
    decisionText = "Seu lance está acima do teto histórico. A chance é alta, mas você pode estar gastando mais do que o necessário para contemplar.";
  }

  if (trendDir === "up" && (zone === "entrada" || zone === "competitiva")) {
    decisionText += " Atenção: a tendência recente é de alta nos lances, o que pode encarecer a contemplação nas próximas assembleias.";
  }

  // Pontos
  const positives: string[] = [];
  const attentions: string[] = [];
  if (zone === "competitiva" || zone === "agressiva") positives.push("Lance dentro ou acima da faixa que historicamente contempla.");
  if (pressureLevel === "baixa") positives.push("Baixa dispersão: a leitura do histórico é mais confiável.");
  if (trendDir === "down") positives.push("Tendência de queda nos lances pode reduzir o esforço necessário.");
  if (rows.length >= 6) positives.push(`Base histórica robusta (${rows.length} assembleias analisadas).`);
  if (!positives.length) positives.push("O simulador organiza o histórico para uma decisão mais informada.");

  if (zone === "abaixo" || zone === "entrada") attentions.push("Lance abaixo da referência central reduz a chance de vencer por lance.");
  if (pressureLevel === "alta") attentions.push("Alta dispersão: trate a faixa histórica com margem de segurança.");
  if (trendDir === "up") attentions.push("Tendência de alta pode exigir lances maiores no futuro.");
  if (rows.length < 6) attentions.push("Histórico curto: a tendência ainda não pode ser medida com segurança.");
  if (zone === "agressiva") attentions.push("Lance acima do teto pode significar gasto desnecessário.");
  if (!attentions.length) attentions.push("Compare apenas dados da mesma modalidade de lance.");

  const chartSeries = [...rows]
    .sort((a, b) => a.ass - b.ass)
    .map((r) => ({ label: `Ass. ${r.ass}`, ass: r.ass, low: r.low, mid: r.mid, high: r.high }));

  const audit = [
    { item: "Método estatístico", valor: method === "mediana" ? "Mediana" : "Média simples", racional: "Aplicado às colunas menor/médio/maior lance." },
    { item: "Piso histórico (menor lance)", valor: fmtPct(low), racional: `${method} da coluna 'menor lance' em ${rows.length} assembleia(s).` },
    { item: "Referência central (lance médio)", valor: fmtPct(mid), racional: `${method} da coluna 'lance médio'.` },
    { item: "Teto histórico (maior lance)", valor: fmtPct(high), racional: `${method} da coluna 'maior lance'.` },
    { item: "Amplitude", valor: fmtPct(amplitude), racional: "Maior lance − menor lance (medida de dispersão)." },
    { item: "Meu lance testado", valor: fmtPct(myBid), racional: "Valor informado pelo usuário." },
    { item: "Distância p/ referência", valor: pp(distanceToRef), racional: "Meu lance − referência central." },
  ];

  return {
    inputs: { rows, myBid, method, modalidade },
    low,
    mid,
    high,
    myBid,
    amplitude,
    position,
    zone,
    zoneTitle,
    zoneDetail,
    distanceToRef,
    trendLabel,
    trendDetail,
    trendDir,
    pressureLabel,
    pressureDetail,
    pressureLevel,
    verdict,
    decisionText,
    warnings,
    positives,
    attentions,
    chartSeries,
    audit,
  };
}
