/**
 * Zona de Contemplação 2026
 * Layout 100% fiel ao HTML original: ZONADECONTEMPLAÇÃO.2026_.renatto.html
 * Matemática no backend (tRPC). Frontend: interface + Canvas + localStorage.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { trpc } from "@/lib/trpc";
import { gerarPdfZonaContemplacao } from "@/lib/pdfZonaContemplacao";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface HistoricoRow {
  ass: number;
  low: number | string;
  mid: number | string;
  high: number | string;
}

interface QuantitativoRow {
  ass: number;
  sg: number | string;
  p30: number | string;
  p50: number | string;
  clivre: number | string;
  clim: number | string;
  c30: number | string;
  c50: number | string;
  csort: number | string;
  outras: number | string;
  total?: number;
  invalid?: boolean;
}

interface ZonaResult {
  low: number;
  mid: number;
  high: number;
  trend: { label: string; detail: string; cls: string };
  position: { title: string; detail: string; pos: number };
  pressao: { label: string; detail: string };
  chips: { text: string; cls: string }[];
  simulationId: string;
  generatedAt: string;
}

interface QuantResult {
  totalCont: number;
  indice: number;
  nec: number;
  cob: number;
  probSorteioGeral: number;
  probSorteioDetalhe: string;
  hStatus: { title: string; detail: string; chip: string; pin: number };
  chips: { text: string; cls: string }[];
  fixo30: { pct: number; txt: string };
  fixo50: { pct: number; txt: string };
  odds30Pct: number;
  odds50Pct: number;
  distribText: string;
  restanteText: string;
  trendText: string;
  simulationId: string;
  generatedAt: string;
}

// ─── Dados de exemplo do HTML original ───────────────────────────────────────

const SAMPLE_ROWS: HistoricoRow[] = [
  { ass: 36, low: 48, mid: 56, high: 72 },
  { ass: 35, low: 45, mid: 54, high: 69 },
  { ass: 34, low: 50, mid: 58, high: 74 },
  { ass: 33, low: 43, mid: 52, high: 68 },
  { ass: 32, low: 46, mid: 55, high: 71 },
  { ass: 31, low: 44, mid: 53, high: 70 },
];

const SAMPLE_HEALTH: QuantitativoRow[] = [
  { ass: 36, sg: 220, p30: 18, p50: 9,  clivre: 2, clim: 1, c30: 1, c50: 1, csort: 1, outras: 0 },
  { ass: 35, sg: 217, p30: 20, p50: 10, clivre: 3, clim: 1, c30: 1, c50: 0, csort: 1, outras: 0 },
  { ass: 34, sg: 214, p30: 19, p50: 11, clivre: 2, clim: 1, c30: 1, c50: 1, csort: 1, outras: 0 },
];

const LS_KEY = "renatto.zona.v8";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const num = (v: number | string | undefined): number => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n: number): string =>
  (Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0,00") + "%";

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

const MODALIDADE_LABELS: Record<string, string> = {
  Livre: "Lance Livre (Embutido + Recurso próprio)",
  Limitado: "Lance limitado - Recurso próprio",
  Fixo30: "Lance fixo 30% - sorteio entre cotas participantes",
  Fixo50: "Lance fixo 50% - sorteio entre cotas participantes",
};

// ─── Gráfico Canvas (fiel ao drawChart() do HTML original) ───────────────────

function drawZoneChart(
  canvas: HTMLCanvasElement,
  data: HistoricoRow[],
  meulance: number,
  grupoNome: string
) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(900, rect.width || 980);
  const h = 480;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  canvas.style.height = h + "px";
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const colors = {
    low: "#27c07d",
    mid: "#f4d34f",
    high: "#000",
    me: "#e54848",
    grid: "#d8d1c2",
    text: "#111",
  };

  function roundRect(
    c: CanvasRenderingContext2D,
    x: number, y: number, rw: number, rh: number, r: number
  ) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + rw, y, x + rw, y + rh, r);
    c.arcTo(x + rw, y + rh, x, y + rh, r);
    c.arcTo(x, y + rh, x, y, r);
    c.arcTo(x, y, x + rw, y, r);
    c.closePath();
  }

  roundRect(ctx, 0, 0, w, h, 14);
  ctx.fillStyle = "#f7f3ea";
  ctx.fill();

  const m = { l: 58, r: 30, t: 36, b: 60 };
  const cw = w - m.l - m.r;
  const ch = h - m.t - m.b;

  const vals: number[] = [];
  const me = meulance;
  data.forEach((r) => {
    ["low", "mid", "high"].forEach((k) => {
      const v = num(r[k as keyof HistoricoRow]);
      if (v > 0) vals.push(v);
    });
  });
  if (me > 0) vals.push(me);

  if (!vals.length) {
    ctx.fillStyle = "#111";
    ctx.font = "700 16px Arial";
    ctx.fillText("Preencha o histórico mensal.", m.l, m.t + 40);
    return;
  }

  const maxV = Math.ceil((Math.max(...vals) + 8) / 5) * 5;
  const minV = Math.max(0, Math.floor((Math.min(...vals) - 8) / 5) * 5);

  ctx.strokeStyle = colors.grid;
  ctx.fillStyle = "#333";
  ctx.font = "11px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 5; i++) {
    const yy = m.t + (ch * i) / 5;
    const val = maxV - ((maxV - minV) * i) / 5;
    ctx.beginPath();
    ctx.moveTo(m.l, yy);
    ctx.lineTo(w - m.r, yy);
    ctx.stroke();
    ctx.fillText(val.toFixed(0) + "%", m.l - 8, yy);
  }

  ctx.strokeStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(m.l, m.t);
  ctx.lineTo(m.l, m.t + ch);
  ctx.lineTo(w - m.r, m.t + ch);
  ctx.stroke();

  const xPos = (i: number) =>
    data.length === 1 ? m.l + cw / 2 : m.l + (cw * i) / (data.length - 1);
  const yPos = (v: number) =>
    m.t + ch * (1 - (v - minV) / (maxV - minV || 1));

  if (me) {
    const yy = yPos(me);
    const bandH = Math.max(24, ch * 0.055);
    ctx.fillStyle = "rgba(229,72,72,.20)";
    roundRect(ctx, m.l, yy - bandH / 2, cw, bandH, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(229,72,72,.95)";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(m.l, yy);
    ctx.lineTo(w - m.r, yy);
    ctx.stroke();
  }

  function drawLine(
    key: "low" | "mid" | "high",
    color: string,
    off: number
  ) {
    const pts = data
      .map((r, i) => ({ x: xPos(i), y: yPos(num(r[key])), v: num(r[key]) }))
      .filter((p) => p.v > 0);
    if (!pts.length) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    pts.forEach((p) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = key === "high" ? "#fff" : "#111";
      ctx.lineWidth = 1;
      ctx.stroke();
      const text = p.v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
      ctx.font = "800 10px Arial";
      const tw = ctx.measureText(text).width + 9;
      const th = 17;
      let ly = p.y + off;
      if (ly < 12) ly = p.y + 18;
      if (ly > h - m.b - 4) ly = p.y - 18;
      if (key === "high") {
        ctx.fillStyle = "#000";
        roundRect(ctx, p.x - tw / 2, ly - th / 2, tw, th, 6);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.fillStyle = "#fff";
      } else {
        ctx.fillStyle = key === "mid" ? "#fff6a8" : "#e9fff5";
        roundRect(ctx, p.x - tw / 2, ly - th / 2, tw, th, 6);
        ctx.fill();
        ctx.fillStyle = "#111";
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, p.x, ly);
    });
  }

  drawLine("low", colors.low, 22);
  drawLine("mid", colors.mid, -22);
  drawLine("high", colors.high, -42);

  if (me) {
    const yy = yPos(me);
    ctx.font = "950 24px Arial";
    const text = me.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "%";
    const tw = ctx.measureText(text).width + 26;
    const th = 38;
    let tx = w - m.r - tw - 10;
    let ty = yy - th / 2;
    if (ty < m.t) ty = m.t + 4;
    if (ty + th > m.t + ch) ty = m.t + ch - th - 4;
    ctx.fillStyle = colors.me;
    roundRect(ctx, tx, ty, tw, th, 10);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, tx + tw / 2, ty + th / 2);
  }

  ctx.fillStyle = "#111";
  ctx.font = "800 10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  data.forEach((r, i) =>
    ctx.fillText("Ass. " + (r.ass || ""), xPos(i), m.t + ch + 14)
  );

  ctx.fillStyle = "#111";
  ctx.font = "900 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText(grupoNome || "Zona de contemplação", m.l, m.t - 24);
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function TipBox({
  text,
  visible,
  x,
  y,
}: {
  text: string;
  visible: boolean;
  x: number;
  y: number;
}) {
  if (!visible || !text) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 99999,
        maxWidth: 390,
        minWidth: 240,
        background: "#07110f",
        color: "#fff",
        border: "1px solid rgba(255,255,255,.2)",
        borderLeft: "5px solid #f26a21",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 16px 34px rgba(0,0,0,.45)",
        fontSize: 12,
        lineHeight: 1.38,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "#f26a21",
          fontWeight: 950,
          marginBottom: 4,
        }}
      >
        Ajuda
      </div>
      <div>{text}</div>
    </div>
  );
}

function HelpBtn({ tip }: { tip: string }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const show = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const pad = 10;
    const w = 300;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad));
    let top = r.bottom + 8;
    if (top + 120 > window.innerHeight - pad) top = r.top - 120 - 8;
    setPos({ x: left, y: Math.max(pad, top) });
    setVisible(true);
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="help-btn"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((v) => !v);
        }}
        style={{
          width: 16,
          height: 16,
          border: 0,
          borderRadius: "50%",
          background: "transparent",
          color: "#f26a21",
          fontSize: 12,
          fontWeight: 950,
          lineHeight: 1,
          cursor: "help",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
        }}
      >
        ?
      </button>
      <TipBox text={tip} visible={visible} x={pos.x} y={pos.y} />
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ZonaContemplacao() {
  // ── Aba ativa
  const [activeTab, setActiveTab] = useState<"dados" | "quant" | "leitura">("dados");

  // ── Parâmetros do histórico
  const [grupoNome, setGrupoNome] = useState("Grupo XYZ");
  const [segmento, setSegmento] = useState("Imóvel");
  const [modalidade, setModalidade] = useState("Livre");
  const [periodo, setPeriodo] = useState("6");
  const [metodoZona, setMetodoZona] = useState<"media" | "mediana">("media");
  const [meulance, setMeulance] = useState("50");
  const [historicoRows, setHistoricoRows] = useState<HistoricoRow[]>(
    SAMPLE_ROWS.slice(0, 6)
  );

  // ── Parâmetros do quantitativo
  const [quantRows, setQuantRows] = useState<QuantitativoRow[]>(SAMPLE_HEALTH);
  const [hPrazo, setHPrazo] = useState("120");
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([0]);

  // ── Resultados do backend
  const [zonaResult, setZonaResult] = useState<ZonaResult | null>(null);
  const [quantResult, setQuantResult] = useState<QuantResult | null>(null);

  // ── Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Mutations tRPC
  const calcHistorico = trpc.zonaContemplacao.calcHistorico.useMutation();
  const calcQuantitativo = trpc.zonaContemplacao.calcQuantitativo.useMutation();

  // ── Redraw canvas
  const redrawCanvas = useCallback(() => {
    if (canvasRef.current) {
      drawZoneChart(canvasRef.current, historicoRows, num(meulance), grupoNome);
    }
  }, [historicoRows, meulance, grupoNome]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const handler = () => setTimeout(redrawCanvas, 80);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [redrawCanvas]);

  // ── Calcular histórico
  const handleCalcHistorico = useCallback(async () => {
    const validRows = historicoRows
      .filter((r) => num(r.low) || num(r.mid) || num(r.high))
      .map((r) => ({
        ass: num(r.ass) || 1,
        low: num(r.low),
        mid: num(r.mid),
        high: num(r.high),
      }));
    if (!validRows.length) return;
    const result = await calcHistorico.mutateAsync({
      rows: validRows,
      meulance: num(meulance),
      metodoZona,
      modalidade: MODALIDADE_LABELS[modalidade] || modalidade,
      grupoNome,
    });
    setZonaResult(result);
    setTimeout(redrawCanvas, 60);
  }, [historicoRows, meulance, metodoZona, modalidade, grupoNome, calcHistorico, redrawCanvas]);

  // ── Calcular quantitativo
  const handleCalcQuantitativo = useCallback(async () => {
    const validRows = quantRows.map((r) => ({
      ass: num(r.ass) || 1,
      sg: num(r.sg),
      p30: num(r.p30),
      p50: num(r.p50),
      clivre: num(r.clivre),
      clim: num(r.clim),
      c30: num(r.c30),
      c50: num(r.c50),
      csort: num(r.csort),
      outras: num(r.outras),
    }));
    if (!validRows.length) return;
    const result = await calcQuantitativo.mutateAsync({
      rows: validRows,
      selectedIndexes,
      hPrazo: num(hPrazo) || 120,
    });
    setQuantResult(result);
  }, [quantRows, selectedIndexes, hPrazo, calcQuantitativo]);

  // ── Cálculo automático ao mudar aba
  useEffect(() => {
    if (activeTab === "dados") handleCalcHistorico();
    if (activeTab === "quant") handleCalcQuantitativo();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cálculo inicial
  useEffect(() => {
    handleCalcHistorico();
    handleCalcQuantitativo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Gerenciar linhas do histórico
  const buildRows = (qtd: number) => {
    const rows: HistoricoRow[] = [];
    for (let i = 0; i < qtd; i++) {
      const s = SAMPLE_ROWS[i] || { ass: Math.max(1, 36 - i), low: "", mid: "", high: "" };
      rows.push({ ...s });
    }
    setHistoricoRows(rows);
  };

  const clearRows = () => {
    setHistoricoRows(historicoRows.map((r) => ({ ...r, low: "", mid: "", high: "" })));
  };

  const updateHistoricoRow = (
    idx: number,
    key: keyof HistoricoRow,
    value: string
  ) => {
    setHistoricoRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  // ── Gerenciar linhas do quantitativo
  const addHealthRow = () => {
    const idx = quantRows.length;
    setQuantRows((prev) => [
      ...prev,
      {
        ass: Math.max(1, 36 - idx),
        sg: "", p30: "", p50: "",
        clivre: "", clim: "", c30: "", c50: "", csort: "", outras: "",
      },
    ]);
  };

  const removeHealthRow = (idx: number) => {
    setQuantRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIndexes((prev) => prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)));
  };

  const updateQuantRow = (
    idx: number,
    key: keyof QuantitativoRow,
    value: string
  ) => {
    setQuantRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  // ── Validação de linha do quantitativo
  const isRowInvalid = (r: QuantitativoRow): boolean => {
    const total =
      num(r.clivre) + num(r.clim) + num(r.c30) + num(r.c50) + num(r.csort) + num(r.outras);
    const sg = num(r.sg);
    return (
      (sg > 0 && total > sg) ||
      (sg > 0 && num(r.p30) > sg) ||
      (sg > 0 && num(r.p50) > sg) ||
      num(r.c30) > num(r.p30) ||
      num(r.c50) > num(r.p50)
    );
  };

  const rowTotal = (r: QuantitativoRow): number =>
    num(r.clivre) + num(r.clim) + num(r.c30) + num(r.c50) + num(r.csort) + num(r.outras);

  // ── localStorage
  const collect = () => ({
    grupoNome, segmento, modalidade, periodo, metodoZona, meulance, hPrazo,
    rows: historicoRows, health: quantRows,
  });

  const apply = (st: ReturnType<typeof collect>) => {
    setGrupoNome(st.grupoNome || "");
    setSegmento(st.segmento || "Imóvel");
    setModalidade(st.modalidade || "Livre");
    setPeriodo(st.periodo || "6");
    setMetodoZona((st.metodoZona as "media" | "mediana") || "media");
    setMeulance(st.meulance || "50");
    setHPrazo(st.hPrazo || "120");
    setHistoricoRows(st.rows || SAMPLE_ROWS.slice(0, 6));
    setQuantRows(st.health || SAMPLE_HEALTH);
  };

  const savedAll = (): Record<string, ReturnType<typeof collect>> => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
  };

  const [savedNames, setSavedNames] = useState<string[]>(() => Object.keys(savedAll()).sort());
  const [selectedSaved, setSelectedSaved] = useState("");

  const refreshSaved = () => {
    const names = Object.keys(savedAll()).sort();
    setSavedNames(names);
    if (names.length) setSelectedSaved(names[0]);
  };

  // ── Download gráfico
  const downloadChart = () => {
    if (!canvasRef.current) return;
    drawZoneChart(canvasRef.current, historicoRows, num(meulance), grupoNome);
    const a = document.createElement("a");
    a.download = "zona_de_contemplacao.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  // ── Chip color helper
  const chipStyle = (cls: string): React.CSSProperties => {
    if (cls === "green") return { background: "rgba(39,192,125,.18)", color: "#7ef5bc", border: "1px solid rgba(39,192,125,.38)" };
    if (cls === "red") return { background: "rgba(229,72,72,.18)", color: "#ffaaaa", border: "1px solid rgba(229,72,72,.42)" };
    return { background: "rgba(244,211,79,.16)", color: "#ffe879", border: "1px solid rgba(244,211,79,.45)" };
  };

  // ── Trend class → border color
  const trendBorderColor = (cls: string) => {
    if (cls === "trend-up") return "#e54848";
    if (cls === "trend-down") return "#00c875";
    return "#ffb37d";
  };

  // ── KPI border color
  const kpiBorder = (color: "green" | "yellow" | "blackline" | "orange" | "red") => {
    const map = { green: "#27c07d", yellow: "#f4d34f", blackline: "#050505", orange: "#f26a21", red: "#e54848" };
    return map[color];
  };

  // ─── Estilos CSS inline (fiel ao HTML original) ────────────────────────────

  const S = {
    bg: "#0b0f0e",
    panel: "#111715",
    panel2: "#151d1a",
    green: "#0f2e2a",
    green2: "#183f38",
    orange: "#f26a21",
    off: "#f7f3ea",
    white: "#ffffff",
    black: "#050505",
    muted: "#aeb8b4",
    line: "rgba(247,243,234,.14)",
    danger: "#e54848",
    yellow: "#f4d34f",
    good: "#27c07d",
  };

  const card: React.CSSProperties = {
    background: `linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.015)),${S.panel}`,
    border: `1px solid ${S.line}`,
    borderRadius: 18,
    boxShadow: "0 18px 44px rgba(0,0,0,.28)",
  };

  const kpi = (color: "green" | "yellow" | "blackline" | "orange" | "red"): React.CSSProperties => ({
    background: color === "blackline" ? S.off : "#0c1210",
    border: `1px solid ${S.line}`,
    borderLeft: `5px solid ${kpiBorder(color)}`,
    borderRadius: 15,
    padding: 10,
    minHeight: 74,
    color: color === "blackline" ? "#111" : S.off,
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 36,
    background: "#090d0c",
    border: `1px solid rgba(247,243,234,.18)`,
    borderRadius: 10,
    color: S.off,
    padding: "8px 9px",
    fontSize: 13,
    outline: "none",
  };

  const selectStyle: React.CSSProperties = { ...inputStyle };

  const btn = (variant?: "primary" | "danger"): React.CSSProperties => ({
    border: variant === "primary" ? `1px solid ${S.orange}` : variant === "danger" ? "1px solid rgba(229,72,72,.35)" : `1px solid ${S.line}`,
    borderRadius: 11,
    padding: "9px 11px",
    fontWeight: 950,
    fontSize: 12,
    cursor: "pointer",
    background: variant === "primary" ? S.orange : variant === "danger" ? "#3a1010" : S.green2,
    color: variant === "primary" ? "#070707" : variant === "danger" ? "#ffb1b1" : S.off,
  });

  const label: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    margin: "0 0 4px",
    color: "#c3cbc7",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    fontWeight: 850,
  };

  const sectionTitle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  };

  const pill = (green?: boolean): React.CSSProperties => ({
    background: green ? "rgba(39,192,125,.15)" : S.orange,
    color: green ? "#7ef5bc" : "#080808",
    border: green ? "1px solid rgba(39,192,125,.35)" : "none",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 10,
    fontWeight: 950,
    whiteSpace: "nowrap",
  });

  const tableWrap: React.CSSProperties = {
    border: `1px solid ${S.line}`,
    borderRadius: 16,
    background: "#0b100e",
    overflow: "auto",
  };

  const thStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    background: "#07100e",
    color: "#fff",
    zIndex: 2,
    textTransform: "uppercase",
    fontSize: 9,
    letterSpacing: ".06em",
    lineHeight: 1.15,
    padding: "7px 6px",
    textAlign: "center",
    borderBottom: "1px solid rgba(247,243,234,.09)",
  };

  const tdStyle: React.CSSProperties = {
    borderBottom: "1px solid rgba(247,243,234,.09)",
    padding: "7px 6px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 10.5,
  };

  const healthThStyle: React.CSSProperties = {
    ...thStyle,
    fontSize: 7.2,
    padding: "3px 2px",
  };

  const healthTdStyle: React.CSSProperties = {
    ...tdStyle,
    fontSize: 8.8,
    padding: "3px 2px",
  };

  const notice = (danger?: boolean): React.CSSProperties => ({
    background: danger ? "rgba(229,72,72,.09)" : "rgba(242,106,33,.08)",
    border: `1px solid ${danger ? "rgba(229,72,72,.26)" : "rgba(242,106,33,.25)"}`,
    borderRadius: 13,
    padding: 10,
    color: "#e8eee9",
    fontSize: 11.5,
    marginTop: 9,
  });

  const radar: React.CSSProperties = {
    background: "#0c1210",
    border: `1px solid ${S.line}`,
    borderRadius: 16,
    padding: 11,
  };

  const meter: React.CSSProperties = {
    height: 15,
    borderRadius: 999,
    background: `linear-gradient(90deg,${S.good} 0%,${S.good} 32%,${S.yellow} 32%,${S.yellow} 58%,${S.orange} 58%,${S.orange} 77%,${S.danger} 77%,${S.danger} 100%)`,
    position: "relative",
    margin: "12px 0 8px",
  };

  const healthMeter: React.CSSProperties = {
    height: 17,
    borderRadius: 999,
    background: `linear-gradient(90deg,${S.danger} 0%,${S.danger} 35%,${S.orange} 35%,${S.orange} 62%,${S.yellow} 62%,${S.yellow} 82%,${S.good} 82%,${S.good} 100%)`,
    position: "relative",
    margin: "12px 0",
  };

  const pin = (left: number): React.CSSProperties => ({
    position: "absolute",
    top: -6,
    width: 4,
    height: 27,
    background: "#fff",
    borderRadius: 4,
    boxShadow: "0 0 0 2px #000",
    left: `${clamp(left, 0, 100)}%`,
  });

  const healthPin = (left: number): React.CSSProperties => ({
    position: "absolute",
    top: -6,
    width: 4,
    height: 29,
    background: "#fff",
    borderRadius: 4,
    boxShadow: "0 0 0 2px #000",
    left: `${clamp(left, 0, 100)}%`,
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: `radial-gradient(circle at top right,rgba(242,106,33,.13),transparent 28%),${S.bg}`,
        color: S.off,
        fontFamily: "Inter,Arial,Helvetica,sans-serif",
        lineHeight: 1.32,
        fontSize: 13,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: 14 }}>

        {/* Hero */}
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 14,
            alignItems: "center",
            background: "linear-gradient(135deg,#0f2e2a,#06100e)",
            border: `1px solid ${S.line}`,
            borderBottom: `4px solid ${S.orange}`,
            borderRadius: 22,
            padding: "15px 18px",
            boxShadow: "0 18px 44px rgba(0,0,0,.28)",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "-.045em",
                fontSize: 30,
                lineHeight: 1,
                color: S.white,
              }}
            >
              ZONA DE CONTEMPLAÇÃO.2026
            </h1>
            <p style={{ margin: "5px 0 0", color: "#d7ddd9", fontSize: 12.5, maxWidth: 930 }}>
              Leitura histórica de lances e quantitativo de contemplações. Ferramenta educativa para entender pressão, faixa de entrada e ritmo do grupo.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 28, fontWeight: 350, letterSpacing: "-.07em" }}>
              <span style={{ width: 13, height: 13, borderRadius: 3, background: S.orange, display: "inline-block" }} />
              renatto
            </div>
            <div style={{ fontSize: 8.5, letterSpacing: ".18em", textTransform: "uppercase", color: "#cfd6d2", marginTop: 3 }}>
              Consórcio de verdade
            </div>
          </div>
        </header>

        {/* Abas */}
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
          {(["dados", "quant", "leitura"] as const).map((tab, i) => {
            const labels = ["1. Histórico", "2. Estatística", "3. Leitura técnica"];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: `1px solid ${active ? S.orange : S.line}`,
                  background: active ? S.orange : "#131a18",
                  color: active ? "#0b0b0b" : "#dce3df",
                  borderRadius: 999,
                  padding: "9px 13px",
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {labels[i]}
              </button>
            );
          })}
        </nav>

        {/* ── ABA 1: Histórico de Contemplações ── */}
        {activeTab === "dados" && (
          <section>
            {/* PDF row */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button
                style={btn("primary")}
                onClick={async () => zonaResult && await gerarPdfZonaContemplacao({ tab: "dados", grupoNome, zonaResult, historicoRows: historicoRows.map(r => ({ ass: num(r.ass), low: num(r.low), mid: num(r.mid), high: num(r.high) })), canvasRef })}
              >
                Gerar PDF
              </button>
            </div>

            {/* Grid 2 colunas — responsivo: empilha no mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "min(360px, 100%) 1fr", gap: 12, alignItems: "start" }} className="!grid-cols-1 lg:!grid-cols-[360px_1fr]">
              {/* Coluna esquerda: Parâmetros */}
              <div style={{ ...card, padding: 13 }}>
                <div style={sectionTitle}>
                  <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Parâmetros do histórico</h2>
                  <span style={pill()}>base</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={label}>Nome do grupo <HelpBtn tip="Dê um nome identificável para salvar e recuperar esta análise. Ex.: Consórcio Ibituruna · grupo 0001 · imóvel." /></label>
                    <input style={inputStyle} type="text" value={grupoNome} onChange={(e) => setGrupoNome(e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>Tipo <HelpBtn tip="Segmento do consórcio. Auto, imóvel, moto e outros podem ter dinâmicas diferentes de lance." /></label>
                    <select style={selectStyle} value={segmento} onChange={(e) => setSegmento(e.target.value)}>
                      <option>Auto</option>
                      <option>Imóvel</option>
                      <option>Moto</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div>
                    <label style={label}>Modalidade <HelpBtn tip="Use apenas dados da mesma modalidade. Lance livre, limitado e fixo não devem ser misturados." /></label>
                    <select style={selectStyle} value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
                      <option value="Livre">Lance Livre (Embutido + Recurso próprio)</option>
                      <option value="Limitado">Lance limitado - Recurso próprio</option>
                      <option value="Fixo30">Lance fixo 30% - sorteio entre cotas participantes</option>
                      <option value="Fixo50">Lance fixo 50% - sorteio entre cotas participantes</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={label}>Período analisado <HelpBtn tip="Selecione quantas assembleias recentes serão analisadas no histórico de lances." /></label>
                    <select style={selectStyle} value={periodo} onChange={(e) => { setPeriodo(e.target.value); buildRows(parseInt(e.target.value, 10)); }}>
                      <option value="3">3 assembleias</option>
                      <option value="6">6 assembleias</option>
                      <option value="9">9 assembleias</option>
                      <option value="12">12 assembleias</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={label}>Método da zona <HelpBtn tip="Média simples usa todos os dados. Mediana reduz o peso de lances fora da curva e pode dar uma leitura mais conservadora da faixa histórica." /></label>
                    <select style={selectStyle} value={metodoZona} onChange={(e) => setMetodoZona(e.target.value as "media" | "mediana")}>
                      <option value="media">Média simples</option>
                      <option value="mediana">Mediana</option>
                    </select>
                    <div style={{ fontSize: 10, color: "#9aa8a1", marginTop: 5 }}>Use mediana quando houver lances claramente fora da curva.</div>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={label}>Grupos salvos <HelpBtn tip="Salva os dados no navegador. Não envia informações para servidor." /></label>
                    <select style={selectStyle} value={selectedSaved} onChange={(e) => setSelectedSaved(e.target.value)}>
                      {savedNames.length ? savedNames.map((n) => <option key={n} value={n}>{n}</option>) : <option value="">Nenhum grupo salvo</option>}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <button style={btn("primary")} onClick={() => { handleCalcHistorico(); handleCalcQuantitativo(); }}>Atualizar</button>
                  <button style={btn()} onClick={() => {
                    const name = grupoNome.trim();
                    if (!name) { alert("Informe o nome do grupo."); return; }
                    const all = savedAll(); all[name] = collect();
                    localStorage.setItem(LS_KEY, JSON.stringify(all)); refreshSaved();
                    alert("Grupo salvo neste navegador.");
                  }}>Salvar grupo</button>
                  <button style={btn()} onClick={() => { const all = savedAll(); const st = all[selectedSaved]; if (!st) { alert("Nenhum grupo selecionado ou grupo não encontrado."); return; } apply(st); }}>Carregar</button>
                  <button style={btn("danger")} onClick={() => {
                    const all = savedAll(); delete all[selectedSaved];
                    localStorage.setItem(LS_KEY, JSON.stringify(all)); refreshSaved();
                  }}>Excluir salvo</button>
                  <button style={btn()} onClick={() => { buildRows(parseInt(periodo, 10)); }}>Exemplo</button>
                  <button style={btn()} onClick={clearRows}>Limpar</button>
                </div>
                <div style={notice()}>
                  <b>Proteção técnica:</b> a leitura depende dos dados informados pelo usuário e não garante contemplação futura.
                </div>
              </div>

              {/* Coluna direita: Tabela histórico */}
              <div style={{ ...card, padding: 13 }}>
                <div style={sectionTitle}>
                  <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Histórico mensal</h2>
                  <span style={pill()}>última assembleia → anteriores</span>
                </div>
                <div style={{ ...tableWrap, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 10.5, tableLayout: "fixed", minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: "20%" }}>Assembleia <HelpBtn tip="Comece pela última assembleia realizada e siga para as anteriores. O campo é editável." /></th>
                        <th style={{ ...thStyle, width: "12%" }}>Menor lance (%)</th>
                        <th style={{ ...thStyle, width: "12%" }}>Lance médio (%)</th>
                        <th style={{ ...thStyle, width: "12%" }}>Maior lance (%)</th>
                        <th style={{ ...thStyle, width: "44%" }}>Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoRows.map((row, idx) => (
                        <tr key={idx}>
                          <td style={tdStyle}>
                            <input style={{ ...inputStyle, minHeight: 30, padding: "5px 4px", fontSize: 11, textAlign: "center", borderRadius: 8 }}
                              type="number" min="1" value={row.ass}
                              onChange={(e) => updateHistoricoRow(idx, "ass", e.target.value)} />
                          </td>
                          <td style={tdStyle}>
                            <input style={{ ...inputStyle, minHeight: 30, padding: "5px 4px", fontSize: 11, textAlign: "center", borderRadius: 8 }}
                              type="number" step="0.01" min="0" value={row.low}
                              onChange={(e) => updateHistoricoRow(idx, "low", e.target.value)} />
                          </td>
                          <td style={tdStyle}>
                            <input style={{ ...inputStyle, minHeight: 30, padding: "5px 4px", fontSize: 11, textAlign: "center", borderRadius: 8 }}
                              type="number" step="0.01" min="0" value={row.mid}
                              onChange={(e) => updateHistoricoRow(idx, "mid", e.target.value)} />
                          </td>
                          <td style={tdStyle}>
                            <input style={{ ...inputStyle, minHeight: 30, padding: "5px 4px", fontSize: 11, textAlign: "center", borderRadius: 8 }}
                              type="number" step="0.01" min="0" value={row.high}
                              onChange={(e) => updateHistoricoRow(idx, "high", e.target.value)} />
                          </td>
                          <td style={{ ...tdStyle, color: "#aeb8b4", fontSize: 10 }}>Use sempre a mesma modalidade</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: "center", color: "#a8b2ad", fontSize: 10.5, marginTop: 6 }}>
                  As colunas de lance foram reduzidas e centralizadas para leitura rápida.
                </div>
              </div>
            </div>

            {/* Zona de Contemplação integrada */}
            <div style={{ marginTop: 14 }}>
              <div style={{ ...sectionTitle, marginTop: 16 }}>
                <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Zona de Contemplação</h2>
                <span style={{ ...pill(), background: S.orange }}>integrada ao histórico</span>
              </div>
              <div style={notice()}>
                <b>Leitura da zona:</b> a análise abaixo usa o histórico informado acima. Ela mostra onde os lances têm transitado e onde o lance pretendido se posiciona, mas não garante contemplação futura.
              </div>

              {/* Resumo da zona + Zona de entrada */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12, marginTop: 10 }} className="!grid-cols-1 md:!grid-cols-2">
                {/* Resumo da zona */}
                <div style={{ ...card, padding: 13 }}>
                  <div style={sectionTitle}>
                    <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Resumo da zona</h2>
                    <span style={pill()}>histórico</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    <div style={kpi("green")}>
                      <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#b6c0bc", fontWeight: 900 }}>Piso histórico</div>
                      <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{zonaResult ? fmt(zonaResult.low) : "—"}</div>
                      <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>média dos menores lances</div>
                    </div>
                    <div style={kpi("yellow")}>
                      <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#b6c0bc", fontWeight: 900 }}>Zona média</div>
                      <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{zonaResult ? fmt(zonaResult.mid) : "—"}</div>
                      <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>média dos lances médios</div>
                    </div>
                    <div style={kpi("blackline")}>
                      <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 900 }}>Teto histórico</div>
                      <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{zonaResult ? fmt(zonaResult.high) : "—"}</div>
                      <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>média dos maiores lances</div>
                    </div>
                    {zonaResult && (
                      <div style={{ ...kpi("orange"), borderLeftColor: trendBorderColor(zonaResult.trend.cls), gridColumn: "1/-1" }}>
                        <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#d4d4d4", fontWeight: 900 }}>Tendência</div>
                        <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{zonaResult.trend.label}</div>
                        <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>{zonaResult.trend.detail}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zona de entrada */}
                <div style={{ ...card, padding: 13 }}>
                  <div style={sectionTitle}>
                    <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Zona de entrada</h2>
                    <span style={pill()}>posição</span>
                  </div>
                  <div style={radar}>
                    <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 950, letterSpacing: "-.04em" }}>
                      {zonaResult ? zonaResult.position.title : "Sem dados suficientes"}
                      <small style={{ display: "block", fontSize: 11, color: "#b6c0bc", marginTop: 6, fontWeight: 650, letterSpacing: 0 }}>
                        {zonaResult ? zonaResult.position.detail : "Preencha menor, médio e maior lance."}
                      </small>
                    </div>
                    <div style={meter}>
                      <div style={pin(zonaResult ? zonaResult.position.pos : 0)} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#aab4b0", fontSize: 9.5 }}>
                      <span>abaixo</span><span>piso</span><span>média</span><span>teto</span><span>acima</span>
                    </div>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 9 }}>
                      {zonaResult?.chips.map((c, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "6px 8px", borderRadius: 999, fontWeight: 950, ...chipStyle(c.cls) }}>
                          {c.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pressão competitiva */}
              <div style={{ ...card, padding: 13, marginBottom: 12 }}>
                <div style={sectionTitle}>
                  <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Pressão competitiva</h2>
                  <span style={pill()}>amplitude</span>
                </div>
                <div style={radar}>
                  <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 950, letterSpacing: "-.04em" }}>
                    {zonaResult ? zonaResult.pressao.label : "—"}
                    <small style={{ display: "block", fontSize: 11, color: "#b6c0bc", marginTop: 6, fontWeight: 650, letterSpacing: 0 }}>
                      {zonaResult ? zonaResult.pressao.detail : "Amplitude entre menor e maior lance."}
                    </small>
                  </div>
                  <div style={notice()}>
                    <b>Modalidade:</b> {MODALIDADE_LABELS[modalidade] || modalidade}. Compare apenas dados da mesma modalidade.
                  </div>
                </div>
              </div>

              {/* Gráfico + Lance pretendido */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 250px", gap: 12, alignItems: "stretch" }} className="!grid-cols-1 md:!grid-cols-[1fr_250px]">
                <div style={{ ...card, padding: 13 }}>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 16, padding: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                      <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Gráfico da zona</h2>
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", color: "#b8c2bd", fontSize: 10 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#27c07d" }} /> menor</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#f4d34f" }} /> médio</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#000", border: "1px solid #fff" }} /> maior</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#e54848" }} /> lance pretendido</span>
                      </div>
                    </div>
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: 14 }}>
                      <div style={{ background: S.off, border: "1px solid #ded9cc", borderRadius: 14, padding: 10, minWidth: 700 }}>
                        <canvas ref={canvasRef} width={980} height={480} style={{ display: "block", width: "100%", height: 480 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 10.5, color: "#aab4b0", marginTop: 6 }}>
                      A faixa vermelha e a etiqueta destacam o lance pretendido do usuário sobre o histórico informado.
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      <button style={btn()} onClick={downloadChart}>Baixar gráfico PNG</button>
                    </div>
                  </div>
                </div>

                {/* Lance pretendido */}
                <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={sectionTitle}>
                    <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Lance pretendido</h2>
                    <span style={pill()}>%</span>
                  </div>
                  <div>
                    <label style={label}>Lance pretendido em % <HelpBtn tip="Informe o percentual que o cliente pretende ofertar. Esse valor alimenta a faixa vermelha no gráfico." /></label>
                    <input
                      style={inputStyle}
                      type="number"
                      step="0.01"
                      min="0"
                      value={meulance}
                      onChange={(e) => setMeulance(e.target.value)}
                      onBlur={handleCalcHistorico}
                    />
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 950, color: "#ff8c8c", letterSpacing: "-.05em" }}>
                    {fmt(num(meulance))}
                  </div>
                  <div style={notice(true)}>
                    <b>Atenção:</b> estar dentro da zona histórica não garante contemplação.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── ABA 2: Quantitativo das Contemplações ── */}
        {activeTab === "quant" && (
          <section>
            {/* PDF row */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button
                style={btn("primary")}
                onClick={async () => quantResult && await gerarPdfZonaContemplacao({ tab: "quant", grupoNome, quantResult, quantRows: quantRows.map(r => ({ ass: num(r.ass), sg: num(r.sg), p30: num(r.p30), p50: num(r.p50), clivre: num(r.clivre), clim: num(r.clim), c30: num(r.c30), c50: num(r.c50), csort: num(r.csort), outras: num(r.outras) })) })}
              >
                Gerar PDF
              </button>
            </div>

            {/* Tabela quantitativo */}
            <div style={{ ...card, padding: 13 }}>
              <div style={sectionTitle}>
                <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Estatística</h2>
                <span style={pill()}>base mensal</span>
              </div>
              <div style={{ ...tableWrap, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 8.8, tableLayout: "fixed", minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th style={{ ...healthThStyle, background: "#07100e" }}>Assembleia <HelpBtn tip="Comece pela última assembleia realizada. Este campo é editável." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(7,63,47,.96),rgba(8,43,35,.96))", borderTop: "2px solid rgba(0,200,117,.75)" }}>Base geral <HelpBtn tip="Quantidade de cotas aptas a participar do sorteio geral naquela assembleia." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(7,63,47,.96),rgba(8,43,35,.96))", borderTop: "2px solid rgba(0,200,117,.75)" }}>Part. fixo 30% <HelpBtn tip="Quantidade de cotas que participaram do lance fixo de 30% naquela assembleia." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(7,63,47,.96),rgba(8,43,35,.96))", borderTop: "2px solid rgba(0,200,117,.75)" }}>Part. fixo 50% <HelpBtn tip="Quantidade de cotas que participaram do lance fixo de 50% naquela assembleia." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(255,106,0,.28),rgba(7,16,14,.96))", borderTop: "2px solid rgba(255,106,0,.85)" }}>Cont. livre <HelpBtn tip="Quantidade de contemplações por lance livre naquela assembleia." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(255,106,0,.28),rgba(7,16,14,.96))", borderTop: "2px solid rgba(255,106,0,.85)" }}>Cont. limitado <HelpBtn tip="Quantidade de contemplações por lance limitado naquela assembleia." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(255,106,0,.28),rgba(7,16,14,.96))", borderTop: "2px solid rgba(255,106,0,.85)" }}>Cont. fixo 30% <HelpBtn tip="Quantidade de contemplações dentro do lance fixo 30%." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(255,106,0,.28),rgba(7,16,14,.96))", borderTop: "2px solid rgba(255,106,0,.85)" }}>Cont. fixo 50% <HelpBtn tip="Quantidade de contemplações dentro do lance fixo 50%." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(255,106,0,.28),rgba(7,16,14,.96))", borderTop: "2px solid rgba(255,106,0,.85)" }}>Sorteio geral <HelpBtn tip="Quantidade de cotas contempladas pelo sorteio geral." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(255,106,0,.28),rgba(7,16,14,.96))", borderTop: "2px solid rgba(255,106,0,.85)" }}>Outras <HelpBtn tip="Use esta coluna para contemplações que não se encaixam nas modalidades anteriores." /></th>
                      <th style={{ ...healthThStyle, background: "linear-gradient(180deg,rgba(247,243,234,.18),rgba(7,16,14,.96))", borderTop: "2px solid rgba(247,243,234,.75)" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quantRows.map((row, idx) => {
                      const invalid = isRowInvalid(row);
                      const total = rowTotal(row);
                      const isSelected = selectedIndexes.includes(idx);
                      return (
                        <tr
                          key={idx}
                          style={{
                            background: invalid
                              ? (isSelected ? "rgba(229,72,72,.18)" : "rgba(229,72,72,.13)")
                              : isSelected
                              ? "rgba(255,106,0,.18)"
                              : "transparent",
                          }}
                          title={invalid ? "Valores incompatíveis. Esta linha não entra no diagnóstico." : ""}
                        >
                          <td style={healthTdStyle}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 26px", gap: 4, alignItems: "center" }}>
                              <input style={{ ...inputStyle, width: "100%", minWidth: 0, minHeight: 25, padding: 2, fontSize: 9.5, textAlign: "center" }}
                                type="number" min="1" value={row.ass}
                                onChange={(e) => updateQuantRow(idx, "ass", e.target.value)} />
                              <button
                                onClick={() => removeHealthRow(idx)}
                                style={{ border: "1px solid rgba(229,72,72,.35)", background: "#2b0c0c", color: "#ffaaaa", borderRadius: 8, height: 25, cursor: "pointer", fontWeight: 950, fontSize: 11 }}
                              >×</button>
                            </div>
                          </td>
                          {(["sg", "p30", "p50", "clivre", "clim", "c30", "c50", "csort", "outras"] as const).map((k) => (
                            <td key={k} style={healthTdStyle}>
                              <input style={{ ...inputStyle, width: "100%", minWidth: 0, minHeight: 25, padding: 2, fontSize: 9.5, textAlign: "center" }}
                                type="number" min="0" value={row[k]}
                                onChange={(e) => updateQuantRow(idx, k, e.target.value)} />
                            </td>
                          ))}
                          <td style={{ ...healthTdStyle, color: invalid ? "#ffaaaa" : S.off }}>
                            {invalid ? "Revisar" : total.toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <button style={btn("primary")} onClick={addHealthRow}>+ Incluir assembleia</button>
              </div>
            </div>

            {/* Diagnóstico + Lance fixo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }} className="!grid-cols-1 md:!grid-cols-2">
              {/* Diagnóstico */}
              <div style={{ ...card, padding: 13 }}>
                <div style={sectionTitle}>
                  <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Diagnóstico</h2>
                  <span style={pill(true)}>seleção</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="!grid-cols-1 sm:!grid-cols-2">
                  <div>
                    <label style={label}>Prazo total do grupo <HelpBtn tip="Prazo original do plano. A média necessária usa: prazo restante = prazo total - última assembleia selecionada." /></label>
                    <input style={inputStyle} type="number" min="1" value={hPrazo} onChange={(e) => setHPrazo(e.target.value)} onBlur={handleCalcQuantitativo} />
                  </div>
                  <div>
                    <label style={label}>Analisar assembleias <HelpBtn tip="Selecione uma ou várias assembleias cadastradas na tabela acima. Segure Ctrl para escolher múltiplas no computador." /></label>
                    <select
                      multiple
                      size={4}
                      style={{ ...selectStyle, border: "1px solid rgba(255,106,0,.55)", background: "#07100e" }}
                      value={selectedIndexes.map(String)}
                      onChange={(e) => {
                        const sel = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10));
                        setSelectedIndexes(sel.length ? sel : [0]);
                      }}
                    >
                      {quantRows.map((r, i) => (
                        <option key={i} value={String(i)}>
                          Assembleia {r.ass || "sem nº"} · total {isRowInvalid(r) ? "revisar" : rowTotal(r)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5 KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginTop: 10 }} className="!grid-cols-2 sm:!grid-cols-3 lg:!grid-cols-5">
                  <div style={kpi("green")}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#b6c0bc", fontWeight: 900 }}>Total selecionado</div>
                    <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{quantResult?.totalCont ?? "—"}</div>
                    <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>contemplações somadas</div>
                  </div>
                  <div style={kpi("yellow")}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#b6c0bc", fontWeight: 900 }}>Taxa hist. do recorte <HelpBtn tip="Razão entre as contemplações totais selecionadas e a soma das bases gerais do período." /></div>
                    <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{quantResult ? fmt(quantResult.indice) : "—"}</div>
                    <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>contemplações / base acumulada</div>
                  </div>
                  <div style={kpi("orange")}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#d4d4d4", fontWeight: 900 }}>Média necessária</div>
                    <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>
                      {quantResult ? quantResult.nec.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>participantes / prazo restante</div>
                  </div>
                  <div style={kpi("red")}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#b6c0bc", fontWeight: 900 }}>Cobertura</div>
                    <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>
                      {quantResult ? (quantResult.cob || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "%" : "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>média realizada / necessária</div>
                  </div>
                  <div style={kpi("orange")}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#d4d4d4", fontWeight: 900 }}>Taxa sorteio geral <HelpBtn tip="Taxa histórica observada: contemplações por sorteio geral divididas pela base geral do recorte selecionado." /></div>
                    <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-.04em", marginTop: 3 }}>{quantResult ? fmt(quantResult.probSorteioGeral) : "—"}</div>
                    <div style={{ fontSize: 10, color: "#92a09a", marginTop: 4 }}>{quantResult?.probSorteioDetalhe ?? "sorteio geral / base geral"}</div>
                  </div>
                </div>

                {/* Pulso do grupo */}
                <div style={{ ...radar, marginTop: 10 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 12, color: S.white }}>Pulso do grupo</h3>
                  <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 950, letterSpacing: "-.04em" }}>
                    {quantResult ? quantResult.hStatus.title : "Sem base suficiente"}
                    <small style={{ display: "block", fontSize: 11, color: "#b6c0bc", marginTop: 6, fontWeight: 650, letterSpacing: 0 }}>
                      {quantResult ? quantResult.hStatus.detail : "Selecione assembleias para analisar."}
                    </small>
                  </div>
                  <div style={healthMeter}>
                    <div style={healthPin(quantResult?.hStatus.pin ?? 0)} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#aab4b0", fontSize: 9.5 }}>
                    <span>fraco</span><span>pressionado</span><span>compatível</span><span>forte</span>
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 9 }}>
                    {quantResult?.chips.map((c, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "6px 8px", borderRadius: 999, fontWeight: 950, ...chipStyle(c.cls) }}>
                        {c.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botão calcular */}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button style={btn("primary")} onClick={handleCalcQuantitativo}>Calcular</button>
                </div>
              </div>

              {/* Lance fixo */}
              <div style={{ ...card, padding: 13 }}>
                <div style={sectionTitle}>
                  <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: "#ffb1b1" }}>Lance fixo</h2>
                  <span style={pill()}>taxa histórica</span>
                </div>
                <div style={{ display: "grid", gap: 7, fontSize: 12, color: "#ddd" }}>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 10, padding: 8 }}>
                    <b>Fixo 30%:</b> {quantResult ? quantResult.fixo30.txt : "sem dados"}
                  </div>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 10, padding: 8 }}>
                    <b>Fixo 50%:</b> {quantResult ? quantResult.fixo50.txt : "sem dados"}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "10px 0" }}>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 14, padding: 10 }}>
                    <strong style={{ color: S.off }}>Taxa hist. 30%</strong>
                    <div style={{ fontSize: 24, fontWeight: 950, color: "#ffb37d", margin: "4px 0" }}>
                      {quantResult ? (quantResult.odds30Pct || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%" : "—"}
                    </div>
                    <small style={{ color: "#aeb8b4" }}>{quantResult?.fixo30.txt.includes("1 para") ? quantResult.fixo30.txt.split("Taxa")[0].trim() : "preencha participantes e contemplações"}</small>
                    <div style={{ height: 9, background: "#202825", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                      <i style={{ display: "block", height: "100%", background: S.orange, width: `${clamp(quantResult?.odds30Pct ?? 0, 0, 100)}%` }} />
                    </div>
                  </div>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 14, padding: 10 }}>
                    <strong style={{ color: S.off }}>Taxa hist. 50%</strong>
                    <div style={{ fontSize: 24, fontWeight: 950, color: "#ffb37d", margin: "4px 0" }}>
                      {quantResult ? (quantResult.odds50Pct || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%" : "—"}
                    </div>
                    <small style={{ color: "#aeb8b4" }}>{quantResult?.fixo50.txt.includes("1 para") ? quantResult.fixo50.txt.split("Taxa")[0].trim() : "preencha participantes e contemplações"}</small>
                    <div style={{ height: 9, background: "#202825", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                      <i style={{ display: "block", height: "100%", background: S.orange, width: `${clamp(quantResult?.odds50Pct ?? 0, 0, 100)}%` }} />
                    </div>
                  </div>
                </div>
                <div style={notice(true)}>
                  <b>Leitura franca:</b> lance fixo vira sorteio/desempate entre cotas participantes quando todos ofertam o mesmo percentual.
                </div>
                <div style={{ display: "grid", gap: 7, fontSize: 12, color: "#ddd", marginTop: 10 }}>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 10, padding: 8 }}>
                    <b>Distribuição:</b> {quantResult?.distribText ?? "—"}
                  </div>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 10, padding: 8 }}>
                    <b>Prazo restante:</b> {quantResult?.restanteText ?? "—"}
                  </div>
                  <div style={{ background: "#0c1210", border: `1px solid ${S.line}`, borderRadius: 10, padding: 8 }}>
                    <b>Leitura:</b> {quantResult?.trendText ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── ABA 3: Leitura Técnica ── */}
        {activeTab === "leitura" && (
          <section>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button style={btn("primary")} onClick={async () => await gerarPdfZonaContemplacao({ tab: "leitura", grupoNome })}>
                Gerar PDF
              </button>
            </div>
            <div style={{ ...card, padding: 13 }}>
              <div style={sectionTitle}>
                <h2 style={{ margin: 0, fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".12em", color: S.white }}>Leitura técnica</h2>
                <span style={pill()}>sem promessa</span>
              </div>
              <div style={notice()}>
                <b>Importante:</b> o simulador é educativo. Histórico de lance, quantidade de contemplações e taxa histórica observada não garantem contemplação futura. Consulte sempre contrato, regulamento, regras da administradora, caixa do grupo e critérios de desempate.
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#aeb8b4", fontSize: 11, padding: 18 }}>
          consorciodeverdade.com.br · Simulação educativa, sem garantia de contemplação.
        </div>
      </div>
    </div>
  );
}
