/**
 * Panorama: Dados Oficiais — Reescrita nativa React + Tailwind + Recharts
 * 4 submenus em scroll infinito com sticky nav
 */
import { useState, useEffect } from "react";
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

// ─── Paleta alinhada ao design system ────────────────────────────────────────
const C = {
  orange: "#f97316",
  ink: "#15140f",
  terra: "#c2410c",
  olive: "#2f5233",
  muted: "#9e9890",
  grid: "#e5e0d8",
};
const SEG_COLORS: Record<string, string> = {
  "Imóveis": "#c2410c",
  "Automóveis": "#2f5233",
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
    <div className="rounded-lg border-l-4 border-[#c2410c] bg-white border border-[#e5e0d8] p-5 mb-6 shadow-sm">
      <span className="block text-[11px] uppercase tracking-widest font-bold text-[#c2410c] mb-2 font-mono">{tag}</span>
      <p className="m-0 text-base leading-relaxed font-medium text-[#15140f]">{children}</p>
    </div>
  );
}

function KpiCard({ num, label, note, accent = false }: { num: string; label: string; note?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-5 border shadow-sm ${accent ? "bg-orange-50 border-orange-200" : "bg-white border-[#e5e0d8]"}`}>
      <span className="block text-[11px] uppercase tracking-wider font-bold text-[#9e9890] mb-2">{label}</span>
      <div className={`font-mono text-3xl font-semibold tracking-tight ${accent ? "text-[#c2410c]" : "text-[#15140f]"}`}>{num}</div>
      {note && <p className="mt-2 text-sm text-[#9e9890] leading-snug">{note}</p>}
    </div>
  );
}

function SectionHead({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <span className="inline-block text-[11px] uppercase tracking-widest font-bold text-[#c2410c] font-mono mb-2">{kicker}</span>
      <h2 className="text-3xl md:text-4xl font-bold text-[#15140f] leading-tight mb-3">{title}</h2>
      {desc && <p className="text-[#716b60] text-base leading-relaxed max-w-2xl">{desc}</p>}
    </div>
  );
}

function ChartBox({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm mb-6">
      <h3 className="text-base font-bold text-[#15140f] mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-[#9e9890] mb-4">{subtitle}</p>}
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
          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
            active === s ? "bg-[#15140f] text-white border-[#15140f]" : "bg-transparent text-[#9e9890] border-[#e5e0d8] hover:border-[#15140f]"
          }`}
        >{s}</button>
      ))}
    </div>
  );
}

// ─── Seção 1: Vendas ──────────────────────────────────────────────────────────
function SecaoVendas() {
  const SEGS = ["Imóveis", "Automóveis", "Motocicletas", "Outros bens e serviços"];
  const [seg, setSeg] = useState(SEGS[0]);

  const totalData = annualData.map((d) => ({ ano: String(d.ano), vendidas: d.vendidas }));
  const segData = annualData.map((d) => {
    const r = segmentData.find((s) => s.ano === d.ano && s.segmento === seg);
    return { ano: String(d.ano), vendidas: r?.vendidas ?? 0 };
  });

  return (
    <div id="vendas" className="scroll-mt-24">
      <SectionHead kicker="01 — Vendas · Recordes Históricos"
        title="O mercado bate recordes. Mas o que isso significa?"
        desc="Cota comercializada é adesão vendida no ano. Não é contemplação, não é aquisição do bem — é apenas o início do contrato." />
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
          <ResponsiveContainer width="100%" height={280}>
            <RBarChart data={totalData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} mi`, "Vendidas"]} />
              <Bar dataKey="vendidas" name="Vendidas" fill={C.terra} radius={[3, 3, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Cotas comercializadas — por produto" subtitle="Selecione o segmento">
        <SegButtons segs={SEGS} active={seg} onChange={setSeg} />
        <ScrollChart>
          <ResponsiveContainer width="100%" height={260}>
            <RBarChart data={segData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(3)} mi`, "Vendidas"]} />
              <Bar dataKey="vendidas" name="Vendidas" fill={SEG_COLORS[seg] ?? C.terra} radius={[3, 3, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
    </div>
  );
}

// ─── Seção 2: Exclusão ────────────────────────────────────────────────────────
function SecaoExclusao() {
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
    <div id="exclusao" className="scroll-mt-24">
      <SectionHead kicker="02 — Índice de Exclusão · Isso é Grave"
        title="Quase metade não chega ao fim."
        desc="O índice de exclusão mede a proporção de cotas excluídas em relação às ativas. Acima de 40% é alto. O consórcio brasileiro opera nessa faixa há quase uma década." />
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
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={ieGeral} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number, name: string) => name === "ie" ? [`${v}%`, "IE"] : [`${v.toFixed(2)} mi`, "Excluídas"]} />
              <ReferenceLine yAxisId="left" y={50} stroke={C.terra} strokeDasharray="4 4" label={{ value: "50%", fill: C.terra, fontSize: 11 }} />
              <Bar yAxisId="right" dataKey="excluidas" name="excluidas" fill={C.grid} radius={[2, 2, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="ie" name="ie" stroke={C.terra} strokeWidth={2.5} dot={{ r: 4, fill: C.terra }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Índice de exclusão — por produto" subtitle="Selecione o segmento">
        <SegButtons segs={SEGS} active={seg} onChange={setSeg} />
        <ScrollChart>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={ieSeg} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number, name: string) => name === "ie" ? [`${v}%`, "IE"] : [`${v.toFixed(3)} mi`, "Excluídas"]} />
              <ReferenceLine yAxisId="left" y={50} stroke={C.terra} strokeDasharray="4 4" />
              <Bar yAxisId="right" dataKey="excluidas" name="excluidas" fill={C.grid} radius={[2, 2, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="ie" name="ie" stroke={SEG_COLORS[seg] ?? C.terra} strokeWidth={2.5} dot={{ r: 4, fill: SEG_COLORS[seg] ?? C.terra }} />
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
              <div className="mt-2 text-sm text-[#9e9890]">
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
function SecaoReclamacoes() {
  const bcbData = complaintsBCB.map((d) => ({
    ano: String(d.ano), total: d.total, procedentes: d.procedentes,
  }));
  const govData = consumerGovComplaints.map((d) => ({
    ano: String(d.ano), reclamacoes: d.reclamacoes,
  }));

  return (
    <div id="reclamacoes" className="scroll-mt-24">
      <SectionHead kicker="03 — Reclamações · Crescem"
        title="As reclamações cresceram mais rápido que as vendas."
        desc="Dois bancos de dados independentes mostram a mesma tendência: o volume de reclamações no setor de consórcios aumentou de forma consistente." />
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
          <ResponsiveContainer width="100%" height={280}>
            <RBarChart data={bcbData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtN} />
              <Tooltip formatter={(v: number) => [fmtN(v), ""]} />
              <Legend />
              <Bar dataKey="total" name="Total" fill={C.muted} radius={[2, 2, 0, 0]} />
              <Bar dataKey="procedentes" name="Procedentes" fill={C.terra} radius={[2, 2, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Reclamações — Consumidor.gov.br" subtitle="Administradoras de consórcios (2016–2025)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={260}>
            <RLineChart data={govData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtN} />
              <Tooltip formatter={(v: number) => [fmtN(v), "Reclamações"]} />
              <Line type="monotone" dataKey="reclamacoes" name="Reclamações" stroke={C.orange} strokeWidth={2.5} dot={{ r: 4, fill: C.orange }} />
            </RLineChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#15140f] mb-4">Principais motivos de reclamação — Consumidor.gov.br 2025</h3>
        <div className="space-y-3">
          {consumerGovTopReasons2025.map((r) => (
            <div key={r.rank}>
              <div className="flex justify-between text-sm mb-1">
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

// ─── Seção 4: Sorte ───────────────────────────────────────────────────────────
function SecaoSorte() {
  const lanceData = annualData.map((d) => ({
    ano: String(d.ano),
    lance: parseFloat((d.lance * 100).toFixed(1)),
    sorteio: parseFloat(((1 - d.lance) * 100).toFixed(1)),
  }));
  const macroChartData = macroData.map((d) => ({
    ano: String(d.ano),
    selic: parseFloat((d.selic * 100).toFixed(2)),
    fin: parseFloat((d.financiamento_imob * 100).toFixed(2)),
    vendidas: d.vendidas,
    evento: d.evento,
  }));

  return (
    <div id="sorte" className="scroll-mt-24">
      <SectionHead kicker="04 — Sorte · Não conte com ela"
        title="Quem contempla por sorteio é minoria. Quem paga lance, maioria."
        desc="A contemplação por lance cresceu de forma consistente. Em 2024, mais de 78% das contemplações ocorreram por lance — não por sorteio." />
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
          <ResponsiveContainer width="100%" height={280}>
            <RBarChart data={lanceData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
              <Legend />
              <Bar dataKey="lance" name="Lance" fill={C.terra} stackId="a" />
              <Bar dataKey="sorteio" name="Sorteio" fill={C.muted} stackId="a" radius={[3, 3, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </ScrollChart>
      </ChartBox>
      <ChartBox title="Juros, vendas e exclusão lado a lado" subtitle="Selic e financiamento imobiliário vs. crescimento do consórcio (2016–2024)">
        <ScrollChart>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={macroChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="pct" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 20]} />
              <YAxis yAxisId="mi" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} mi`} />
              <Tooltip formatter={(v: number, name: string) => {
                if (name === "vendidas") return [`${v.toFixed(2)} mi`, "Vendidas"];
                return [`${v}%`, name];
              }} />
              <Legend />
              <Line yAxisId="pct" type="monotone" dataKey="selic" name="Selic" stroke={C.terra} strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="pct" type="monotone" dataKey="fin" name="Financiamento imob." stroke={C.olive} strokeWidth={2} dot={{ r: 3 }} />
              <Bar yAxisId="mi" dataKey="vendidas" name="vendidas" fill={C.muted} opacity={0.5} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </ScrollChart>
        <div className="mt-4 space-y-2">
          {macroChartData.map((d) => (
            <div key={d.ano} className="flex items-start gap-3 text-sm">
              <span className="font-mono font-bold text-[#c2410c] w-10 shrink-0">{d.ano}</span>
              <span className="text-[#9e9890]">{d.evento}</span>
            </div>
          ))}
        </div>
      </ChartBox>

      {/* Tabela base */}
      <div id="base" className="mt-8">
        <h3 className="text-xl font-bold text-[#15140f] mb-4">Base de dados completa</h3>
        <div className="w-full overflow-x-auto rounded-xl border border-[#e5e0d8] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#15140f] text-white">
                {["Ano", "Segmento", "Vendidas", "Ativas", "Excluídas", "IE", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segmentData.map((row, i) => (
                <tr key={`${row.ano}-${row.segmento}`} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f4]"}>
                  <td className="px-4 py-2.5 font-mono font-bold text-[#15140f]">{row.ano}</td>
                  <td className="px-4 py-2.5 text-[#15140f]">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: SEG_COLORS[row.segmento] }} />
                    {row.segmento}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-right">{mi(row.vendidas)}</td>
                  <td className="px-4 py-2.5 font-mono text-right">{mi(row.ativas)}</td>
                  <td className="px-4 py-2.5 font-mono text-right">{mi(row.excluidas)}</td>
                  <td className="px-4 py-2.5 font-mono text-right font-bold text-[#c2410c]">{pct(row.ie)}</td>
                  <td className="px-4 py-2.5 text-[#9e9890] text-xs">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs de navegação ────────────────────────────────────────────────────────
const TABS = [
  { id: "vendas",      label: "Vendas — recordes históricos" },
  { id: "exclusao",    label: "Índice de exclusão — isso é grave" },
  { id: "reclamacoes", label: "Reclamações — crescem" },
  { id: "sorte",       label: "Sorte — não conte com ela" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Panorama() {
  const [activeTab, setActiveTab] = useState<TabId>("vendas");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    TABS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(id); },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id: TabId) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab(id);
  }

  return (
    <div className="min-h-screen" style={{ background: "#f6f3ec" }}>
      {/* Hero */}
      <header className="bg-[#15140f] text-white pt-16 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-block text-[11px] uppercase tracking-widest font-bold text-[#f97316] font-mono">
              Panorama: Dados Oficiais BCB 2016–2024
            </span>
            <img src={LOGO.light} alt="r.enatto Consórcio de Verdade" className="h-9 object-contain" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 tracking-tight">
            Não é opinião.{" "}
            <em className="not-italic text-[#f97316]">É o dado oficial.</em>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            Este painel organiza, sem arredondar a favor de ninguém, os números que o próprio Banco
            Central publica sobre vendas, cotas ativas, exclusão e reclamações no sistema de
            consórcios brasileiro.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden">
            {[
              { num: "4,53 mi", label: "cotas comercializadas em 2024" },
              { num: "11,4 mi", label: "cotas ativas em dez/2024" },
              { num: "48,6%",   label: "índice de exclusão geral em 2024" },
              { num: "78,3%",   label: "contemplações por lance em 2024" },
            ].map((c) => (
              <div key={c.label} className="bg-[#1c1b15] px-5 py-4">
                <b className="block font-mono text-2xl font-semibold tracking-tight text-white">{c.num}</b>
                <span className="block text-white/55 text-xs font-medium mt-1 leading-snug">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-[#e5e0d8] shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto -mb-px">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => scrollTo(tab.id)}
                className={`shrink-0 px-4 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#f97316] text-[#c2410c]"
                    : "border-transparent text-[#9e9890] hover:text-[#15140f]"
                }`}
              >{tab.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* Conteúdo em scroll infinito */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-20">
        <SecaoVendas />
        <hr className="border-[#e5e0d8]" />
        <SecaoExclusao />
        <hr className="border-[#e5e0d8]" />
        <SecaoReclamacoes />
        <hr className="border-[#e5e0d8]" />
        <SecaoSorte />

        {/* Fontes */}
        <div id="fontes" className="pt-4">
          <details className="group">
            <summary className="cursor-pointer flex items-center gap-2 font-bold text-lg text-[#15140f] py-3 list-none">
              <span className="text-[#c2410c] group-open:rotate-90 transition-transform">▶</span>
              De onde vêm os dados deste painel
            </summary>
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Panorama BCB 2016–2024", body: "Cotas vendidas, ativas, excluídas, índice de exclusão, contemplações, recursos e taxa média de administração.", note: "Nota: As análises anuais de 2025 do Banco Central ainda não foram incorporadas ao painel." },
                { title: "Consumidor.gov.br", body: "Base pública de indicadores. Registros de administradoras de consórcios consolidados por ano, volume de reclamações e principais motivos." },
                { title: "Macro (Selic / financiamento imobiliário)", body: "Mantidos em seção separada para não misturar dado macroeconômico com dado operacional do consórcio." },
              ].map((s) => (
                <div key={s.title} className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-[#15140f] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#9e9890] leading-relaxed">{s.body}</p>
                  {"note" in s && s.note && <p className="mt-2 text-xs text-[#9e9890] italic">{s.note}</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 bg-white border border-[#e5e0d8] rounded-xl p-5 text-sm text-[#9e9890] leading-relaxed">
              <strong className="text-[#15140f]">Metodologia:</strong> A base principal é oficial, do Banco Central. A ABAC não foi usada como fonte primária — apenas o BCB, que divulga os dados a partir do Cosif, Documento 4010, Documento 2080 e Unicad. Este painel usa os Panoramas BCB de 2016 a 2024 e, na seção de reclamações, os dados consolidados a partir do painel público do Consumidor.gov.br. Onde o dado foi derivado por diferença ou cálculo a partir de número arredondado, isso aparece na coluna "status" da tabela-base. Nenhum gráfico de percentual usa escala cortada: o índice de exclusão é sempre exibido de 0% a 100%.
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}
