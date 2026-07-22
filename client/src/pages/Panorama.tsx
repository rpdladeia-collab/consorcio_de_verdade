/**
 * Panorama: Dados Oficiais — Reestruturado conforme prompt editorial
 * 7 capítulos + resumo executivo + rótulos fixos + tabela colapsável + PDFs por bloco
 */
import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  LineChart as RLineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
} from "recharts";
import {
  annualData,
  segmentData,
  complaintsBCB,
  consumerGovComplaints,
  consumerGovTopReasons2025,
  macroData,
} from "@/lib/panoramaData";
import { LOGO } from "@/lib/brand";
import { gerarPdfPanorama } from "@/lib/pdfPanorama";

// ─── Paleta alinhada ao design system ────────────────────────────────────────
const C = {
  orange: "#f97316",
  yellow: "#fbbf24", // Amarelo solicitado
  ink: "#15140f",
  terra: "#c2410c",
  olive: "#2f5233",
  muted: "#4b4843", // Escurecido em mais 30% para contraste máximo
  grid: "#bfb8af",  // Escurecido para maior nitidez das linhas
};
const SEG_COLORS: Record<string, string> = {
  "Imóveis": "#c2410c",
  "Automóveis": "#716b60",
  "Motocicletas": "#15140f",
  "Outros bens e serviços": "#9e9890",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pct(v: number) { return (v * 100).toFixed(1) + "%"; }
function mi(v: number) { return v >= 1 ? v.toFixed(2) + " mi" : (v * 1000).toFixed(0) + " mil"; }
function fmtN(v: number) { return v.toLocaleString("pt-BR"); }

// ─── Componentes base ─────────────────────────────────────────────────────────
function Verdict({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-[#c2410c] bg-white border border-[#d1ccc5] p-3 mb-4 shadow-sm">
      <span className="block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] mb-1 font-mono">{tag}</span>
      <p className="m-0 text-[14px] md:text-[15px] leading-relaxed font-bold text-[#15140f]">{children}</p>
    </div>
  );
}

function KpiCard({ num, label, note, accent = false }: { num: string; label: string; note?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3 border shadow-sm ${accent ? "bg-orange-50 border-orange-200" : "bg-white border-[#d1ccc5]"}`}>
      <span className="block text-[9px] uppercase tracking-wider font-bold text-[#4b4843] mb-1">{label}</span>
      <div className={`font-mono text-xl font-bold tracking-tight ${accent ? "text-[#c2410c]" : "text-[#15140f]"}`}>{num}</div>
      {note && <p className="mt-1 text-[10px] text-[#4b4843] leading-snug font-bold">{note}</p>}
    </div>
  );
}

function SectionHead({ kicker, title, desc, id }: { kicker: string; title: string; desc?: string; id?: string }) {
  return (
    <div className="mb-4" id={id}>
      <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1">{kicker}</span>
      <h2 className="text-xl md:text-2xl font-bold text-[#15140f] leading-tight mb-2 tracking-tight">{title}</h2>
      {desc && <p className="text-[#2d2b27] text-[14px] md:text-[15px] leading-relaxed max-w-2xl font-bold">{desc}</p>}
    </div>
  );
}

function ChapterDivider({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-4 py-2 mb-1">
      <span className="font-mono text-[10px] font-bold text-[#c2410c] shrink-0">{num}</span>
      <div className="flex-1 h-px bg-[#bfb8af]" />
      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#f97316] bg-[#15140f] px-3 py-1 rounded shrink-0">{title}</span>
    </div>
  );
}

function ChartBox({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm mb-6">
      <h3 className="text-base font-bold text-[#15140f] mb-1">{title}</h3>
      {subtitle && <p className="text-[14px] md:text-[15px] text-[#9e9890] mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

function ScrollChart({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[560px]">{children}</div>
    </div>
  );
}

function SegButtons({ segs, active, onChange }: { segs: string[]; active: string; onChange: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {segs.map((s) => (
        <button key={s} onClick={() => onChange(s)}
          className={`px-3 py-1.5 text-[14px] md:text-[15px] font-semibold rounded-full border transition-colors ${
            active === s ? "bg-[#15140f] text-white border-[#15140f]" : "bg-transparent text-[#9e9890] border-[#e5e0d8] hover:border-[#15140f]"
          }`}
        >{s}</button>
      ))}
    </div>
  );
}

function PdfButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[14px] md:text-[15px] font-semibold text-[#9e9890] border border-[#e5e0d8] rounded-full px-3 py-1.5 hover:text-[#c2410c] hover:border-[#c2410c] transition-colors bg-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      {label}
    </button>
  );
}

// ─── Resumo executivo ─────────────────────────────────────────────────────────
const EXEC_CARDS = [
  {
    id: "vendas",
    num: "01",
    title: "Mercado de consórcios",
    desc: "Vendas, crescimento histórico e estoque ativo de cotas.",
  },
  {
    id: "exclusao",
    num: "02",
    title: "Exclusões e permanência",
    desc: "Índice de exclusão por segmento e evolução histórica.",
  },
  {
    id: "reclamacoes",
    num: "03",
    title: "Reclamações e atendimento",
    desc: "Volume de reclamações no BCB e Consumidor.gov.br.",
  },
  {
    id: "sorte",
    num: "04",
    title: "Contemplações: lance e sorteio",
    desc: "Proporção histórica entre contemplação por lance e por sorteio.",
  },
  {
    id: "macro",
    num: "05",
    title: "Consórcio em diferentes cenários econômicos",
    desc: "Comportamento do mercado em diferentes ciclos da economia.",
  },
];

function ResumoExecutivo({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  return (
    <section className="mb-8">
      <div className="mb-3 border-b border-[#e5e0d8] pb-2">
        <span className="inline-block text-[9px] uppercase tracking-[0.2em] font-bold text-[#c2410c] font-mono mb-0.5">
          Leitura rápida
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-[#15140f] tracking-tight">O que você vai encontrar neste painel</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#e5e0d8] border border-[#e5e0d8] overflow-hidden">
        {EXEC_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => onScrollTo(card.id)}
            className="text-left bg-white p-3 hover:bg-[#f6f3ec] transition-all group"
          >
            <span className="block text-[10px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-1.5">
              Cap. {card.num}
            </span>
            <h3 className="font-bold text-[#15140f] text-[16px] md:text-[18px] mb-1 group-hover:text-[#c2410c] transition-colors leading-tight">
              {card.title}
            </h3>
            <p className="text-[12px] text-[#4b4843] leading-snug mb-2 font-bold">{card.desc}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c2410c] border-b border-[#c2410c]/20 pb-0.5">
              Acessar →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Seção 1: Vendas ──────────────────────────────────────────────────────────
function SecaoVendas({ onPdf }: { onPdf: () => void }) {
  const SEGS = ["Imóveis", "Automóveis", "Motocicletas", "Outros bens e serviços"];
  const [seg, setSeg] = useState(SEGS[0]);

  const totalData = annualData.map((d) => ({ ano: String(d.ano), vendidas: d.vendidas }));
  const segData = annualData.map((d) => {
    const r = segmentData.find((s) => s.ano === d.ano && s.segmento === seg);
    return { ano: String(d.ano), vendidas: r?.vendidas ?? 0 };
  });

  return (
    <div id="vendas" className="scroll-mt-28">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <SectionHead kicker="01 — Mercado de consórcios"
          title="O mercado bate recordes. Mas o que isso significa?"
          desc="Cota comercializada é adesão vendida no ano. Não é contemplação, não é aquisição do bem — é apenas o início do contrato." />
        <PdfButton label="Gerar PDF deste bloco" onClick={onPdf} />
      </div>
      <Verdict tag="Leitura direta">
        Em 2024, foram comercializadas <strong>4,53 milhões de cotas</strong> — o maior volume da série histórica.
        O estoque ativo chegou a <strong>11,35 milhões</strong>. O crescimento é real, mas o índice de exclusão permanece acima de 48% há quase uma década.
      </Verdict>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard num="4,53 mi" label="Cotas vendidas em 2024" accent />
        <KpiCard num="11,35 mi" label="Cotas ativas em dez/2024" />
        <KpiCard num="+98%" label="Crescimento 2016→2024" note="de 2,28 mi para 4,53 mi" />
        <KpiCard num="9 anos" label="de crescimento ininterrupto" />
      </div>
      <ChartBox title="Cotas comercializadas — total" subtitle="Milhões de cotas vendidas por ano (2016–2024)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={300}>
            <RBarChart data={totalData} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} mi`, "Vendidas"]} />
              <Bar dataKey="vendidas" name="Vendidas" fill={C.terra} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="vendidas" position="top" formatter={(v: number) => `${v.toFixed(2)}`} style={{ fontSize: 10, fill: C.ink, fontWeight: 600 }} />
              </Bar>
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Cotas comercializadas — por produto" subtitle="Selecione o segmento">
        <SegButtons segs={SEGS} active={seg} onChange={setSeg} />
        <ScrollChart>
          <ResponsiveContainer width="100%" height={280}>
            <RBarChart data={segData} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(3)} mi`, "Vendidas"]} />
              <Bar dataKey="vendidas" name="Vendidas" fill={SEG_COLORS[seg] ?? C.terra} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="vendidas" position="top" formatter={(v: number) => `${v.toFixed(2)}`} style={{ fontSize: 10, fill: C.ink, fontWeight: 600 }} />
              </Bar>
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
    </div>
  );
}

// ─── Seção 2: Exclusão ────────────────────────────────────────────────────────
function SecaoExclusao({ onPdf }: { onPdf: () => void }) {
  const SEGS = ["Imóveis", "Automóveis", "Motocicletas", "Outros bens e serviços"];
  const [seg, setSeg] = useState(SEGS[0]);

  const ieGeral = annualData.map((d) => ({
    ano: String(d.ano),
    ie: parseFloat((d.ie * 100).toFixed(1)),
    excluidas: d.excluidas,
  }));
  const ieSeg = annualData.map((d) => {
    const r = segmentData.find((s) => s.ano === d.ano && s.segmento === seg);
    return { ano: String(d.ano), ie: r ? parseFloat((r.ie * 100).toFixed(1)) : 0, excluidas: r?.excluidas ?? 0 };
  });

  return (
    <div id="exclusao" className="scroll-mt-28">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <SectionHead kicker="02 — Exclusões e permanência"
          title="Quase metade não chega ao fim."
          desc="O índice de exclusão mede a proporção de cotas excluídas em relação às ativas. Acima de 40% é alto. O consórcio brasileiro opera nessa faixa há quase uma década." />
        <PdfButton label="Gerar PDF deste bloco" onClick={onPdf} />
      </div>
      <Verdict tag="Leitura direta">
        Em 2024, o índice de exclusão geral foi de <strong>48,6%</strong>. Isso significa que, para cada 100 cotas ativas,
        quase 49 foram canceladas naquele ano. O dado não é novo: a série histórica mostra que esse patamar se mantém desde 2016.
      </Verdict>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard num="48,6%" label="Índice de exclusão geral 2024" accent />
        <KpiCard num="10,75 mi" label="Cotas excluídas em 2024" />
        <KpiCard num="50,7%" label="Pico histórico (2017)" note="Imóveis chegaram a 62,4%" />
        <KpiCard num="9 anos" label="acima de 48% consecutivos" />
      </div>
      <ChartBox title="Índice de exclusão — geral" subtitle="% de cotas excluídas sobre ativas (2016–2024)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={ieGeral} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number, name: string) => name === "ie" ? [`${v}%`, "IE"] : [`${v.toFixed(2)} mi`, "Excluídas"]} />
              <ReferenceLine yAxisId="left" y={50} stroke={C.terra} strokeDasharray="4 4" label={{ value: "50%", fill: C.terra, fontSize: 11 }} />
              <Bar yAxisId="right" dataKey="excluidas" name="excluidas" fill={C.grid} radius={[2, 2, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="ie" name="ie" stroke={C.terra} strokeWidth={2.5} dot={{ r: 4, fill: C.terra }}>
                <LabelList dataKey="ie" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: C.terra, fontWeight: 700 }} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Índice de exclusão — por produto" subtitle="Selecione o segmento">
        <SegButtons segs={SEGS} active={seg} onChange={setSeg} />
        <ScrollChart>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={ieSeg} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number, name: string) => name === "ie" ? [`${v}%`, "IE"] : [`${v.toFixed(3)} mi`, "Excluídas"]} />
              <ReferenceLine yAxisId="left" y={50} stroke={C.terra} strokeDasharray="4 4" />
              <Bar yAxisId="right" dataKey="excluidas" name="excluidas" fill={C.grid} radius={[2, 2, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="ie" name="ie" stroke={SEG_COLORS[seg] ?? C.terra} strokeWidth={2.5} dot={{ r: 4, fill: SEG_COLORS[seg] ?? C.terra }}>
                <LabelList dataKey="ie" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: SEG_COLORS[seg] ?? C.terra, fontWeight: 700 }} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {(["Imóveis", "Automóveis", "Motocicletas", "Outros bens e serviços"]).map((s) => {
          const last = segmentData.filter((d) => d.segmento === s).at(-1);
          return last ? (
            <div key={s} className="bg-white border border-[#e5e0d8] rounded-xl p-4 shadow-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: SEG_COLORS[s] }} />
              <span className="font-bold text-[#15140f]">{s}</span>
              <div className="mt-2 text-[14px] md:text-[15px] text-[#9e9890]">
                IE 2024: <strong className="text-[#15140f]">{pct(last.ie)}</strong> · {mi(last.excluidas)} excluídas
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ─── Seção 3: Reclamações ─────────────────────────────────────────────────────
function SecaoReclamacoes({ onPdf }: { onPdf: () => void }) {
  const bcbData = complaintsBCB.map((d) => ({
    ano: String(d.ano), total: d.total, procedentes: d.procedentes,
  }));
  const govData = consumerGovComplaints.map((d) => ({
    ano: String(d.ano), reclamacoes: d.reclamacoes,
  }));

  return (
    <div id="reclamacoes" className="scroll-mt-28">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <SectionHead kicker="03 — Reclamações e atendimento"
          title="As reclamações cresceram mais rápido que as vendas."
          desc="Dois bancos de dados independentes mostram a mesma tendência: o volume de reclamações no setor de consórcios aumentou de forma consistente." />
        <PdfButton label="Gerar PDF deste bloco" onClick={onPdf} />
      </div>
      <Verdict tag="Banco Central — reclamações procedentes">
        Entre 2017 e 2023, as reclamações procedentes no BCB cresceram <strong>+1.224%</strong> (de 240 para 3.179).
        Em 2025, já são <strong>2.955 reclamações procedentes</strong> registradas.
      </Verdict>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard num="6.400" label="Total de reclamações BCB em 2025" accent />
        <KpiCard num="2.955" label="Reclamações procedentes em 2025" />
        <KpiCard num="6.986" label="Reclamações Consumidor.gov em 2025" accent />
        <KpiCard num="+998%" label="Crescimento Consumidor.gov 2016→2025" />
      </div>
      <ChartBox title="Reclamações BCB — total e procedentes" subtitle="Volume de reclamações registradas no Banco Central (2017–2025)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={300}>
            <RBarChart data={bcbData} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtN} />
              <Tooltip formatter={(v: number) => [fmtN(v), ""]} />
              <Legend />
              <Bar dataKey="total" name="Total" fill={C.muted} radius={[2, 2, 0, 0]}>
                <LabelList dataKey="total" position="top" formatter={fmtN} style={{ fontSize: 9, fill: C.muted, fontWeight: 600 }} />
              </Bar>
              <Bar dataKey="procedentes" name="Procedentes" fill={C.terra} radius={[2, 2, 0, 0]}>
                <LabelList dataKey="procedentes" position="top" formatter={fmtN} style={{ fontSize: 9, fill: C.terra, fontWeight: 700 }} />
              </Bar>
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Reclamações — Consumidor.gov.br" subtitle="Administradoras de consórcios (2016–2025)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={280}>
            <RLineChart data={govData} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtN} />
              <Tooltip formatter={(v: number) => [fmtN(v), "Reclamações"]} />
              <Line type="monotone" dataKey="reclamacoes" name="Reclamações" stroke={C.orange} strokeWidth={2.5} dot={{ r: 4, fill: C.orange }}>
                <LabelList dataKey="reclamacoes" position="top" formatter={fmtN} style={{ fontSize: 10, fill: C.orange, fontWeight: 700 }} />
              </Line>
            </RLineChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#15140f] mb-4">Principais motivos de reclamação — Consumidor.gov.br 2025</h3>
        <div className="space-y-3">
          {consumerGovTopReasons2025.map((r) => (
            <div key={r.rank}>
              <div className="flex justify-between text-[14px] md:text-[15px] mb-1">
                <span className="text-[#15140f]">
                  <span className="font-mono font-bold text-[#c2410c] mr-2">#{r.rank}</span>
                  {r.motivo}
                </span>
                <span className="font-mono font-bold text-[#15140f] ml-4 whitespace-nowrap">{pct(r.pct)}</span>
              </div>
              <div className="h-2 bg-[#e5e0d8] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#c2410c]" style={{ width: `${r.pct * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Seção 4: Contemplações (lance e sorteio) ─────────────────────────────────
function SecaoSorte({ onPdf }: { onPdf: () => void }) {
  const lanceData = annualData.map((d) => ({
    ano: String(d.ano),
    lance: parseFloat((d.lance * 100).toFixed(1)),
    sorteio: parseFloat(((1 - d.lance) * 100).toFixed(1)),
  }));

  return (
    <div id="sorte" className="scroll-mt-28">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <SectionHead kicker="04 — Contemplações: lance e sorteio"
          title="Quem contempla por sorteio é minoria. Quem paga lance, maioria."
          desc="A contemplação por lance cresceu de forma consistente. Em 2024, mais de 78% das contemplações ocorreram por lance — não por sorteio." />
        <PdfButton label="Gerar PDF deste bloco" onClick={onPdf} />
      </div>
      <Verdict tag="O dado que o mercado não destaca">
        Em 2024, <strong>78,3%</strong> das contemplações foram por lance. Apenas <strong>21,7%</strong> ocorreram por sorteio.
        Quem planeja contar com a sorte para contemplar está apostando contra a probabilidade histórica.
      </Verdict>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard num="78,3%" label="Contemplações por lance em 2024" accent />
        <KpiCard num="21,7%" label="Contemplações por sorteio em 2024" />
        <KpiCard num="69,8%" label="Lance em 2016 (era menor)" note="Cresceu 8,5 p.p. em 9 anos" />
        <KpiCard num="1,68 mi" label="Contemplações totais em 2024" />
      </div>
      <ChartBox title="Contemplações: lance vs. sorteio" subtitle="% de contemplações por modalidade (2016–2024)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={300}>
            <RBarChart data={lanceData} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
              <Legend />
              <Bar dataKey="lance" name="Lance" fill={C.terra} stackId="a">
                <LabelList dataKey="lance" position="insideTop" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: "#fff", fontWeight: 700 }} />
              </Bar>
              <Bar dataKey="sorteio" name="Sorteio" fill={C.muted} stackId="a" radius={[3, 3, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
    </div>
  );
}

// ─── Seção 5: Macroeconomia ───────────────────────────────────────────────────
function SecaoMacro({ onPdf }: { onPdf: () => void }) {
  const macroChartData = macroData.map((d) => ({
    ano: String(d.ano),
    selic: parseFloat((d.selic * 100).toFixed(2)),
    fin: parseFloat((d.financiamento_imob * 100).toFixed(2)),
    vendidas: d.vendidas,
    evento: d.evento,
  }));

  return (
    <div id="macro" className="scroll-mt-28">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <SectionHead kicker="05 — Consórcio em diferentes cenários econômicos"
          title="Consórcio em diferentes cenários econômicos"
          desc="O comportamento do consórcio também pode ser observado em diferentes ciclos da economia. Esta leitura ajuda a comparar o desempenho do mercado em períodos de juros, inflação, crédito e atividade econômica distintos, sempre a partir dos dados utilizados na base." />
        <PdfButton label="Gerar PDF deste bloco" onClick={onPdf} />
      </div>
      <ChartBox title="Juros, vendas e exclusão lado a lado" subtitle="Selic e financiamento imobiliário vs. crescimento do consórcio (2016–2024)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={macroChartData} margin={{ top: 24, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="pct" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 20]} />
              <YAxis yAxisId="mi" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number, name: string) => {
                if (name === "vendidas") return [`${v.toFixed(2)} mi`, "Vendidas"];
                return [`${v}%`, name];
              }} />
              <Legend />
              <Bar yAxisId="mi" dataKey="vendidas" name="vendidas" fill={C.muted} opacity={0.5} radius={[2, 2, 0, 0]} />
              <Line yAxisId="pct" type="monotone" dataKey="selic" name="Selic" stroke={C.terra} strokeWidth={2} dot={{ r: 3 }}>
                <LabelList dataKey="selic" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: C.terra, fontWeight: 700 }} />
              </Line>
              <Line yAxisId="pct" type="monotone" dataKey="fin" name="Financiamento imob." stroke={C.ink} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2">
                <LabelList dataKey="fin" position="bottom" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: C.ink, fontWeight: 700 }} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </ScrollChart>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3 border-t border-[#d1ccc5] pt-4">
          {macroChartData.map((d) => (
            <div key={d.ano} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#c2410c] font-mono">{d.ano}</span>
              <span className="text-[10px] text-[#4b4843] leading-tight font-bold">{d.evento}</span>
            </div>
          ))}
        </div>
      </ChartBox>
    </div>
  );
}

// ─── Encerramento: Base e Fontes ─────────────────────────────────────────────
function SecaoFinal({ onPdf }: { onPdf: () => void }) {
  const [showBase, setShowBase] = useState(false);
  const [showSources, setShowSources] = useState(false);

  return (
    <div id="base" className="scroll-mt-28">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => { setShowBase(!showBase); setShowSources(false); }}
          className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border rounded-full px-5 py-2.5 transition-all ${
            showBase ? "bg-[#15140f] text-white border-[#15140f]" : "bg-white text-[#15140f] border-[#d1ccc5] hover:border-[#15140f]"
          }`}
        >
          <span>{showBase ? "▼" : "▶"}</span>
          Base de dados completa
        </button>

        <button
          onClick={() => { setShowSources(!showSources); setShowBase(false); }}
          className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border rounded-full px-5 py-2.5 transition-all ${
            showSources ? "bg-[#15140f] text-white border-[#15140f]" : "bg-white text-[#15140f] border-[#d1ccc5] hover:border-[#15140f]"
          }`}
        >
          <span>{showSources ? "▼" : "▶"}</span>
          Fontes e métodos de análise
        </button>
        
        {showBase && <PdfButton label="Gerar PDF da base" onClick={onPdf} />}
      </div>

      {showBase && (
        <div className="w-full overflow-x-auto rounded-xl border border-[#d1ccc5] shadow-sm mb-8">
          <table className="w-full text-[14px] md:text-[15px]">
            <thead>
              <tr className="bg-[#15140f] text-white">
                {["Ano", "Segmento", "Vendidas", "Ativas", "Excluídas", "IE", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segmentData.map((row, i) => (
                <tr key={`${row.ano}-${row.segmento}`} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f4]"}>
                  <td className="px-4 py-2 font-mono font-bold text-[#15140f]">{row.ano}</td>
                  <td className="px-4 py-2 text-[#15140f] text-[14px] md:text-[15px]">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: SEG_COLORS[row.segmento] }} />
                    {row.segmento}
                  </td>
                  <td className="px-4 py-2 font-mono text-right text-[14px] md:text-[15px]">{mi(row.vendidas)}</td>
                  <td className="px-4 py-2 font-mono text-right text-[14px] md:text-[15px]">{mi(row.ativas)}</td>
                  <td className="px-4 py-2 font-mono text-right text-[14px] md:text-[15px]">{mi(row.excluidas)}</td>
                  <td className="px-4 py-2 font-mono text-right font-bold text-[#c2410c] text-[14px] md:text-[15px]">{pct(row.ie)}</td>
                  <td className="px-4 py-2 text-[#4b4843] text-[10px] font-bold">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSources && (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "Panorama BCB 2016–2024", body: "Cotas vendidas, ativas, excluídas, índice de exclusão, contemplações, recursos e taxa média de administração.", note: "Nota: As análises anuais de 2025 do Banco Central ainda não foram incorporadas ao painel." },
              { title: "Consumidor.gov.br", body: "Base pública de indicadores. Registros de administradoras de consórcios consolidados por ano, volume de reclamações e principais motivos." },
              { title: "Macro (Selic / financiamento imobiliário)", body: "Mantidos em seção separada para não misturar dado macroeconômico com dado operacional do consórcio." },
            ].map((s) => (
              <div key={s.title} className="bg-white border border-[#d1ccc5] rounded-xl p-4 shadow-sm">
                <h3 className="text-[14px] md:text-[15px] font-bold text-[#15140f] mb-2 uppercase tracking-tight">{s.title}</h3>
                <p className="text-[13px] md:text-[14px] text-[#4b4843] leading-relaxed font-bold">{s.body}</p>
                {"note" in s && s.note && <p className="mt-2 text-[10px] text-[#4b4843] italic font-bold">{s.note}</p>}
              </div>
            ))}
          </div>
          <div className="bg-[#fff8f5] border border-[#fcd9c9] rounded-xl p-4 flex items-start gap-3">
            <span className="text-[#c2410c] text-base shrink-0">ℹ</span>
            <p className="text-[14px] md:text-[15px] text-[#c2410c] font-bold leading-relaxed">
              O Consórcio de Verdade não tem a ABAC como fonte de dados.
            </p>
          </div>
          <div className="bg-white border border-[#d1ccc5] rounded-xl p-4 text-[13px] md:text-[14px] text-[#4b4843] leading-relaxed font-bold">
            <strong className="text-[#15140f] uppercase text-[10px]">Metodologia:</strong> A base principal é oficial, do Banco Central. Os dados são divulgados a partir do Cosif, Documento 4010, Documento 2080 e Unicad. Este painel usa os Panoramas BCB de 2016 a 2024 e, na seção de reclamações, os dados consolidados a partir do painel público do Consumidor.gov.br. Onde o dado foi derivado por diferença ou cálculo a partir de número arredondado, isso aparece na coluna "status" da tabela-base. Nenhum gráfico de percentual usa escala cortada: o índice de exclusão é sempre exibido de 0% a 100%.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabs de navegação ────────────────────────────────────────────────────────
const TABS = [
  { id: "vendas",      label: "Mercado de consórcios", parent: "editorial" },
  { id: "exclusao",    label: "Exclusões e permanência", parent: "editorial" },
  { id: "reclamacoes", label: "Reclamações e atendimento", parent: "editorial" },
  { id: "sorte",       label: "Contemplações: lance e sorteio", parent: "editorial" },
  { id: "macro",       label: "Cenários econômicos", parent: "editorial" },
  { id: "data-lab",    label: "Panorama oficial", href: "/data-lab" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Panorama() {
  const [activeTab, setActiveTab] = useState<TabId>("vendas");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const allIds = [...TABS.map((t) => t.id), "base"];
    const observers: IntersectionObserver[] = [];
    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(id as TabId); },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    // Scroll para o hash inicial se existir
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (TABS.some((t) => t.id === id)) setActiveTab(id as TabId);
  }, []);

  const handlePdf = useCallback((bloco: string) => {
    gerarPdfPanorama(bloco);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#f6f3ec" }}>
      {/* ── Hero ── */}
      <header id="hero" className="bg-[#15140f] text-white pt-10 pb-6 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-3">
            <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-[#f97316] font-mono">
              Panorama: Dados Oficiais BCB 2016–2024
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] mb-3 tracking-tight">
            Não é opinião.{" "}
            <em className="not-italic text-[#f97316]">São os dados oficiais.</em>
          </h1>
          <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6 font-medium">
            Este painel organiza, sem arredondar a favor de ninguém, os números que o próprio Banco
            Central publica sobre vendas, cotas ativas, exclusão e reclamações no sistema de
            consórcios brasileiro.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
            {[
              { num: "4,53 mi", label: "cotas comercializadas em 2024" },
              { num: "11,4 mi", label: "cotas ativas em dez/2024" },
              { num: "48,6%",   label: "índice de exclusão geral em 2024" },
              { num: "78,3%",   label: "contemplações por lance em 2024" },
            ].map((c) => (
              <div key={c.label} className="bg-[#1c1b15]/50 px-4 py-3">
                <b className="block font-mono text-xl font-bold tracking-tight text-white">{c.num}</b>
                <span className="block text-white/45 text-[10px] font-medium mt-0.5 leading-snug">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-30 bg-white border-b border-[#e5e0d8] shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto md:overflow-x-visible md:flex-wrap -mb-px">
            {/* Panorama editorial dropdown */}
            <div className="relative group">
              <button
                className={`shrink-0 px-4 py-4 text-[14px] md:text-[15px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  TABS.some((t) => (t as any).parent === "editorial" && activeTab === t.id)
                    ? "border-[#f97316] text-[#c2410c]"
                    : "border-transparent text-[#4b4843] hover:text-[#15140f]"
                }`}
              >
                Panorama editorial
              </button>
              {/* Submenu */}
              <div className="absolute left-0 mt-0 w-max bg-white border border-[#e5e0d8] rounded-b-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
                {TABS.filter((t) => (t as any).parent === "editorial").map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollTo(tab.id)}
                    className={`block w-full text-left px-4 py-3 text-[14px] md:text-[15px] font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-orange-50 text-[#c2410c]"
                        : "text-[#4b4843] hover:bg-[#f6f3ec] hover:text-[#15140f]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panorama oficial */}
            {TABS.filter((t) => !(t as any).parent).map((tab) => {
              const href = (tab as any).href;
              if (href) {
                return (
                  <a key={tab.id} href={href}
                    className="shrink-0 px-4 py-4 text-[14px] md:text-[15px] font-semibold border-b-2 transition-colors whitespace-nowrap border-transparent text-[#4b4843] hover:text-[#15140f]"
                  >{tab.label}</a>
                );
              }
              return null;
            })}
          </div>
        </div>
      </nav>

      {/* ── Conteúdo ── */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Resumo executivo */}
        <ResumoExecutivo onScrollTo={scrollTo} />

        <div className="space-y-12">
          {/* Cap 1 */}
          <div>
            <ChapterDivider num="01" title="Mercado de consórcios" />
            <SecaoVendas onPdf={() => handlePdf("vendas")} />
          </div>

          <hr className="border-[#e5e0d8]" />

          {/* Cap 2 */}
          <div>
            <ChapterDivider num="02" title="Exclusões e permanência" />
            <SecaoExclusao onPdf={() => handlePdf("exclusao")} />
          </div>

          <hr className="border-[#e5e0d8]" />

          {/* Cap 3 */}
          <div>
            <ChapterDivider num="03" title="Reclamações e atendimento" />
            <SecaoReclamacoes onPdf={() => handlePdf("reclamacoes")} />
          </div>

          <hr className="border-[#e5e0d8]" />

          {/* Cap 4 */}
          <div>
            <ChapterDivider num="04" title="Contemplações: lance e sorteio" />
            <SecaoSorte onPdf={() => handlePdf("sorte")} />
          </div>

          <hr className="border-[#e5e0d8]" />

          {/* Cap 5 — Novo bloco macro */}
          <div>
            <ChapterDivider num="05" title="Consórcio em diferentes cenários econômicos" />
            <SecaoMacro onPdf={() => handlePdf("macro")} />
          </div>

          {/* Encerramento Simplificado */}
          <div className="pt-4 border-t border-[#bfb8af]">
            <SecaoFinal onPdf={() => handlePdf("base")} />
          </div>
        </div>
      </main>
    </div>
  );
}
