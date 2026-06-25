import { useState } from "react";
import {
  annualData,
  segmentData,
  complaintsBCB,
  consumerGovComplaints,
  consumerGovTopReasons2025,
  macroData,
  COLORS,
  SEGMENT_COLORS,
} from "@/lib/panoramaData";
import {
  BarChart,
  LineChart,
  GroupedBarChart,
  type BarRow,
  type LineSeries,
  type GroupedSeries,
} from "@/components/panorama/PanoramaCharts";

// ── helpers ──────────────────────────────────────────────────
function pct(v: number) {
  return (v * 100).toFixed(1) + "%";
}
function mi(v: number) {
  if (v >= 1) return v.toFixed(2) + " mi";
  return (v * 1000).toFixed(0) + " mil";
}

// ── Verdict ──────────────────────────────────────────────────
function Verdict({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fffdf8", border: "1px solid #ddd5c5",
      borderLeft: "4px solid #c2410c", borderRadius: 4,
      padding: "16px 20px", marginBottom: 22,
      boxShadow: "0 14px 38px rgba(26,26,23,.08)",
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        textTransform: "uppercase", letterSpacing: ".08em",
        color: "#8a2f0a", fontWeight: 700, display: "block", marginBottom: 6,
      }}>
        {tag}
      </span>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, fontWeight: 500 }}>{children}</p>
    </div>
  );
}

// ── MiniCard ─────────────────────────────────────────────────
function MiniCard({ num, label, note, variant }: {
  num: string; label: string; note?: string;
  variant?: "terra" | "olive" | "default";
}) {
  const v = variant ?? "default";
  const bg = v === "terra" ? "#fbe6da" : v === "olive" ? "#e3ebe1" : "#fffdf8";
  const bc = v === "terra" ? "rgba(194,65,12,.35)" : v === "olive" ? "rgba(47,82,51,.3)" : "#ddd5c5";
  const nc = v === "terra" ? "#8a2f0a" : v === "olive" ? "#1f3922" : "#15140f";
  return (
    <div style={{ border: `1px solid ${bc}`, borderRadius: 8, padding: 15, background: bg }}>
      <span style={{
        fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".06em",
        color: "#716b60", fontWeight: 700, marginBottom: 6, display: "block",
        fontFamily: "'Inter', sans-serif",
      }}>{label}</span>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 24,
        fontWeight: 600, letterSpacing: "-.01em", color: nc,
      }}>{num}</div>
      {note && <p style={{ margin: "6px 0 0", fontSize: 13, color: "#716b60", lineHeight: 1.45 }}>{note}</p>}
    </div>
  );
}

// ── ChartBox ─────────────────────────────────────────────────
function ChartBox({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fffdf8", border: "1px solid #ddd5c5", borderRadius: 10,
      padding: "18px 16px 8px", boxShadow: "0 14px 38px rgba(26,26,23,.08)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", paddingBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>{title}</h3>
        {subtitle && (
          <span style={{
            fontSize: 11.5, color: "#716b60", fontWeight: 600, textAlign: "right",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap", paddingTop: 2,
          }}>{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── SectionHead ──────────────────────────────────────────────
function SectionHead({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#c2410c",
        fontWeight: 600, letterSpacing: ".04em", display: "block", marginBottom: 6,
      }}>{kicker}</span>
      <h2 style={{
        fontSize: "clamp(26px, 3.2vw, 38px)", letterSpacing: "-.02em", lineHeight: 1.08,
        margin: "0 0 8px", fontWeight: 700, fontFamily: "'Source Serif 4', serif",
      }}>{title}</h2>
      <p style={{ color: "#716b60", fontWeight: 500, margin: 0, maxWidth: 680, fontSize: 15 }}>{desc}</p>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#ddd5c5", margin: "26px 0" }} />;
}

// ── Panorama ─────────────────────────────────────────────────
export default function Panorama() {
  const [selectedSegment, setSelectedSegment] = useState("Imóveis");

  const years = annualData.map((r) => r.ano);

  // Gráfico 1: cotas vendidas total (BarChart)
  const totalVendidasData: BarRow[] = annualData.map((r) => ({
    x: r.ano, y: r.vendidas, color: COLORS.terra,
  }));

  // Gráfico 2: cotas vendidas por produto (GroupedBarChart)
  const segmentos = ["Imóveis", "Automóveis", "Motocicletas"];
  const vendBySegSeries: GroupedSeries[] = segmentos.map((seg) => ({
    name: seg,
    color: SEGMENT_COLORS[seg],
    values: years.map((y) => {
      const row = segmentData.find((r) => r.ano === y && r.segmento === seg);
      return { x: y, y: row ? row.vendidas : 0 };
    }),
  }));

  // Gráfico IE geral (LineChart)
  const ieGeralSeries: LineSeries[] = [{
    name: "IE geral",
    color: COLORS.terra,
    values: annualData.map((r) => ({ x: r.ano, y: r.ie })),
  }];

  // Gráfico IE por segmento selecionado (LineChart)
  const selSegIESeries: LineSeries[] = [{
    name: `IE — ${selectedSegment}`,
    color: SEGMENT_COLORS[selectedSegment] ?? COLORS.terra,
    values: years.map((y) => {
      const row = segmentData.find((r) => r.ano === y && r.segmento === selectedSegment);
      return { x: y, y: row ? row.ie : 0 };
    }),
  }];

  // Gráfico vendas segmento selecionado (BarChart)
  const selSegVendData: BarRow[] = years.map((y) => {
    const row = segmentData.find((r) => r.ano === y && r.segmento === selectedSegment);
    return { x: y, y: row ? row.vendidas : 0, color: SEGMENT_COLORS[selectedSegment] ?? COLORS.terra };
  });

  // IE 2016 e 2024 por segmento
  const ie2024 = (seg: string) => segmentData.find((r) => r.ano === 2024 && r.segmento === seg)?.ie ?? 0;
  const ie2016 = (seg: string) => segmentData.find((r) => r.ano === 2016 && r.segmento === seg)?.ie ?? 0;

  // BCB complaints
  const bcbTotalData: BarRow[] = complaintsBCB.map((r) => ({ x: r.ano, y: r.total, color: COLORS.terra }));
  const bcbProcData: BarRow[] = complaintsBCB.map((r) => ({ x: r.ano, y: r.procedentes, color: COLORS.terraDark }));

  // Consumer.gov
  const cgData: BarRow[] = consumerGovComplaints.map((r) => ({ x: r.ano, y: r.reclamacoes, color: COLORS.olive }));

  // Macro: Selic + financiamento
  const macroSelicSeries: LineSeries[] = [
    {
      name: "Selic",
      color: COLORS.terra,
      values: macroData.map((r) => ({ x: r.ano, y: r.selic })),
    },
    {
      name: "Financiamento imob. PF",
      color: COLORS.olive,
      values: macroData.map((r) => ({ x: r.ano, y: r.financiamento_imob })),
    },
  ];

  // Macro: vendas (normalizado) + IE
  const maxVend = Math.max(...macroData.map((r) => r.vendidas));
  const macroVendIESeries: LineSeries[] = [
    {
      name: "Cotas vendidas (escala relativa)",
      color: COLORS.terra,
      values: macroData.map((r) => ({ x: r.ano, y: r.vendidas / maxVend })),
    },
    {
      name: "IE geral",
      color: COLORS.olive,
      values: macroData.map((r) => ({ x: r.ano, y: r.ie })),
    },
  ];

  const macroMarkers = [
    { ano: 2016, label: "Recessão Brasil", selic: "13,8%", financ: "15,4%", ie: "50,2%" },
    { ano: 2020, label: "Pandemia Covid-19", selic: "2,0%", financ: "7,8%", ie: "49,1%" },
    { ano: 2022, label: "Choque Selic", selic: "13,8%", financ: "10,9%", ie: "48,9%" },
  ];

  return (
    <div style={{ background: "#f6f3ec", minHeight: "100vh", color: "#1a1a17" }}>

      {/* ── Hero ── */}
      <header style={{
        background: "#15140f", color: "#f3efe6",
        padding: "52px 24px 44px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(194,65,12,.10) 0%, transparent 35%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1180, margin: "auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", gap: 7, alignItems: "center", color: "#e7b692",
              border: "1px solid rgba(194,65,12,.5)", padding: "6px 11px", borderRadius: 3,
              fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".11em",
              fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              Panorama do mercado de consórcios · BCB 2016–2024
            </div>
            <div style={{
              background: "rgba(255,230,109,.12)", border: "1px solid rgba(255,230,109,.3)",
              borderRadius: 6, padding: "8px 14px", fontSize: 12, color: "#ffe66d",
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            }}>
              ⚠ Panorama BCB 2025 não liberado pelo Banco Central
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(34px, 5.4vw, 60px)", lineHeight: 1.04,
            margin: "18px 0 14px", letterSpacing: "-.025em", maxWidth: 780,
            fontWeight: 700, fontFamily: "'Source Serif 4', serif",
          }}>
            Não é opinião.{" "}
            <em style={{ fontStyle: "normal", color: "#c2410c" }}>É o dado oficial.</em>
          </h1>
          <p style={{ maxWidth: 640, fontSize: 17, color: "#c9c2b4", fontWeight: 400 }}>
            Este painel organiza, sem arredondar a favor de ninguém, os números que o próprio Banco
            Central publica sobre vendas, cotas ativas, exclusão e reclamações no sistema de
            consórcios brasileiro.
          </p>

          {/* 4 hero cards */}
          <div style={{
            marginTop: 30,
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1, background: "rgba(255,255,255,.12)", borderRadius: 10, overflow: "hidden",
          }}>
            {[
              { num: "4,53 milhões", label: "cotas comercializadas em 2024" },
              { num: "11,4 milhões", label: "cotas ativas em dez/2024" },
              { num: "48,6%", label: "índice de exclusão geral em 2024" },
              { num: "78,3%", label: "contemplações por lance em 2024" },
            ].map((c) => (
              <div key={c.label} style={{ background: "#1c1b15", padding: "18px 16px" }}>
                <b style={{
                  display: "block", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 26, fontWeight: 600, letterSpacing: "-.01em", color: "#fff",
                }}>{c.num}</b>
                <span style={{
                  display: "block", color: "#a39c8c", fontSize: 12.5,
                  fontWeight: 500, marginTop: 5, lineHeight: 1.35,
                }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Seção 01 — Vendas ── */}
      <section style={{ padding: "40px 24px", background: "#f6f3ec" }}>
        <div style={{ maxWidth: 1180, margin: "auto" }}>
          <SectionHead
            kicker="01 — Vendas"
            title="Quantas cotas foram vendidas, e onde"
            desc="Cota comercializada é adesão vendida no ano. Não é contemplação, não é aquisição do bem — é apenas o início do contrato."
          />
          <Verdict tag="Leitura direta">
            De 2016 a 2024 a venda total de cotas quase dobrou (2,28 milhões → 4,53 milhões). O
            segmento que mais acelerou foi <strong>Imóveis</strong>, com crescimento de 333% nas
            vendas no período — bem acima da média do mercado.
          </Verdict>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <MiniCard num="2,28 milhões" label="2016" note="cotas comercializadas" />
            <MiniCard num="4,53 milhões" label="2024" note="cotas comercializadas" variant="terra" />
            <MiniCard num="2,25 milhões" label="Diferença absoluta" note="2024 menos 2016" />
            <MiniCard num="Auto 1,76 mi" label="Maior produto em 2024" note="vendidas" variant="olive" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <ChartBox title="Cotas comercializadas — total" subtitle="escala inicia em zero">
              <BarChart data={totalVendidasData} />
            </ChartBox>
            <ChartBox title="Cotas comercializadas — por produto" subtitle="em milhões de cotas">
              <GroupedBarChart series={vendBySegSeries} />
            </ChartBox>
          </div>
          <p style={{ marginTop: 16, fontSize: 13.5, color: "#716b60", fontStyle: "italic", fontWeight: 500 }}>
            Próximo passo: O crescimento da venda só tem sentido lido junto com o índice de
            exclusão, na seção seguinte.
          </p>
        </div>
      </section>

      {/* ── Seção 02 — Índice de Exclusão ── */}
      <section style={{ padding: "40px 24px", background: "#ece7dc" }}>
        <div style={{ maxWidth: 1180, margin: "auto" }}>
          <SectionHead
            kicker="02 — Índice de exclusão"
            title="De quem desiste, ou é excluído, no meio do caminho"
            desc="Índice de exclusão = cotas excluídas ÷ (cotas ativas + cotas excluídas). É a fração de quem entrou e não chegou à contemplação dentro do próprio grupo."
          />
          <Verdict tag="Leitura direta">
            O índice de exclusão geral caiu pouco em 8 anos (50,2% → 48,6%, -1,6 p.p.) — segue
            perto da metade de todas as cotas do sistema. Em <strong>Imóveis</strong>, mesmo caindo
            de 63,0% para 56,9%, o índice continua o mais alto entre os quatro produtos: mais de
            metade de quem entra nesse segmento sai sem ser contemplado.
          </Verdict>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <MiniCard num="50,2%" label="IE geral 2016" note="base BCB" />
            <MiniCard num="48,6%" label="IE geral 2024" note="base BCB" variant="terra" />
            <MiniCard num="-1,6 p.p." label="Variação" note="2024 menos 2016" />
            <MiniCard num="56,9%" label="Maior IE em 2024" note="Imóveis" variant="terra" />
          </div>
          <div style={{ marginBottom: 18 }}>
            <ChartBox title="Índice de exclusão — geral" subtitle="escala fixa: 0% a 100%">
              <LineChart series={ieGeralSeries} percent yMin={0} yMax={1} />
            </ChartBox>
          </div>

          {/* gráfico por produto com botões */}
          <div style={{
            background: "#fffdf8", border: "1px solid #ddd5c5", borderRadius: 10,
            padding: "18px 16px 8px", boxShadow: "0 14px 38px rgba(26,26,23,.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>
                Índice de exclusão — por produto
              </h3>
              <span style={{ fontSize: 11.5, color: "#716b60", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                selecione o produto
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {["Imóveis", "Automóveis", "Motocicletas", "Outros bens e serviços"].map((seg) => (
                <button
                  key={seg}
                  onClick={() => setSelectedSegment(seg)}
                  style={{
                    border: `1px solid ${selectedSegment === seg ? "#15140f" : "#ddd5c5"}`,
                    background: selectedSegment === seg ? "#15140f" : "#fffdf8",
                    color: selectedSegment === seg ? "#fff" : "#1a1a17",
                    fontWeight: 600, fontSize: 13, borderRadius: 6,
                    padding: "7px 13px", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {seg}
                </button>
              ))}
            </div>
            <LineChart series={selSegIESeries} percent yMin={0} yMax={1} />
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#716b60", fontFamily: "'IBM Plex Mono', monospace" }}>
                Produto selecionado: vendas — {selectedSegment}
              </p>
              <BarChart data={selSegVendData} />
            </div>
          </div>

          <Divider />
          <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>
            Leitura direta do dado, por produto
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {["Imóveis", "Automóveis", "Motocicletas", "Outros bens e serviços"].map((seg) => {
              const ie24 = ie2024(seg);
              const ie16 = ie2016(seg);
              const diff = ie24 - ie16;
              return (
                <MiniCard
                  key={seg}
                  num={pct(ie24)}
                  label={seg}
                  note={`2016: ${pct(ie16)} · 2024: ${pct(ie24)} · variação: ${diff >= 0 ? "+" : ""}${(diff * 100).toFixed(1)} p.p.`}
                  variant={ie24 > 0.5 ? "terra" : "default"}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Seção 03 — Reclamações ── */}
      <section style={{ padding: "40px 24px", background: "#f6f3ec" }}>
        <div style={{ maxWidth: 1180, margin: "auto" }}>
          <SectionHead
            kicker="03 — Reclamações"
            title="Reclamações: Banco Central primeiro, Consumidor.gov.br depois"
            desc="Duas bases oficiais, sem misturar metodologia: primeiro o ranking de reclamações do Banco Central; depois o recorte do Consumidor.gov.br para administradoras de consórcios."
          />

          <h3 style={{ margin: "0 0 10px", fontSize: 20, letterSpacing: "-.01em", fontFamily: "'Source Serif 4', serif" }}>
            Base Banco Central — reclamações no sistema de consórcios
          </h3>
          <Verdict tag="Leitura direta — BCB">
            As reclamações procedentes — aquelas em que o BCB já encontrou indício de descumprimento
            — saltaram de 240 em 2017 para 2.955 em 2025: um crescimento de <strong>1131%</strong>.
            Em 2022, o maior índice por milhão de clientes foi 31 vezes maior que a média do mercado
            naquele ano (352,38 por milhão), evidenciando forte dispersão entre administradoras.
          </Verdict>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <MiniCard num="6.400" label="Total 2025" note="reclamações BCB" variant="terra" />
            <MiniCard num="2.955" label="Procedentes 2025" note="reguladas procedentes" variant="terra" />
            <MiniCard num="5.618" label="Total 2024" note="reclamações BCB" />
            <MiniCard num="270,21" label="Índice 2025" note="procedentes por milhão de clientes" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
            <ChartBox title="Reclamações BCB — total" subtitle="procedentes + outras + não reguladas">
              <BarChart data={bcbTotalData} yMax={8000} />
            </ChartBox>
            <ChartBox title="Reclamações BCB — procedentes" subtitle="reclamações reguladas procedentes">
              <BarChart data={bcbProcData} yMax={4000} />
            </ChartBox>
          </div>
          <p style={{ margin: "0 0 20px", fontSize: 12.5, color: "#716b60", fontWeight: 600 }}>
            Fonte: Panorama de Consórcio — Banco Central do Brasil (BCB).
          </p>

          <Divider />

          <h3 style={{ margin: "0 0 10px", fontSize: 20, letterSpacing: "-.01em", fontFamily: "'Source Serif 4', serif" }}>
            Base Consumidor.gov.br — administradoras de consórcios
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 15, color: "#716b60", fontWeight: 500 }}>
            Recorte consolidado do painel público do Consumidor.gov.br, filtrado para o segmento
            "Administradoras de Consórcios". Aqui entram apenas ano, volume de reclamações e
            principais motivos reclamados.
          </p>
          <Verdict tag="Leitura direta — Consumidor.gov.br">
            De 2016 a 2025, as reclamações contra administradoras de consórcio no Consumidor.gov.br
            saíram de 636 para 6.986. Isso representa crescimento de <strong>998%</strong> no
            período — quase 10 vezes mais reclamações.
          </Verdict>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <MiniCard num="636" label="2016" note="reclamações registradas" />
            <MiniCard num="6.986" label="2025" note="reclamações registradas" variant="terra" />
            <MiniCard num="998%" label="Crescimento 2016–2025" note="quase 10 vezes mais reclamações" variant="terra" />
            <MiniCard num="15,89%" label="Principal motivo em 2025" note="dificuldade ou atraso na devolução de valores" />
          </div>
          <ChartBox title="Reclamações — Administradoras de Consórcios" subtitle="Consumidor.gov.br">
            <BarChart data={cgData} />
          </ChartBox>

          {/* Principais motivos 2025 */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>
              Principais motivos — 2025
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {consumerGovTopReasons2025.map((r) => (
                <div key={r.rank} style={{
                  background: "#15140f", color: "#f3efe6", borderRadius: 10,
                  padding: 18, minHeight: 168, display: "flex", flexDirection: "column",
                  justifyContent: "space-between", border: "1px solid rgba(255,255,255,.08)",
                }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                    textTransform: "uppercase", letterSpacing: ".08em",
                    color: "#e7b692", fontWeight: 700,
                  }}>#{r.rank}</span>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 34,
                    lineHeight: 1, fontWeight: 600, color: "#fff", margin: "10px 0",
                  }}>{pct(r.pct)}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.28, fontWeight: 700, letterSpacing: "-.01em" }}>
                    {r.motivo}
                  </div>
                  <div style={{
                    fontSize: 11.5, color: "#a39c8c", marginTop: 10,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>base: Consumidor.gov.br 2025</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Seção 04 — Macro ── */}
      <section style={{ padding: "40px 24px", background: "#ece7dc" }}>
        <div style={{ maxWidth: 1180, margin: "auto" }}>
          <SectionHead
            kicker="04 — Macro"
            title="Juros, vendas e exclusão lado a lado"
            desc="Bloco separado para comparar Selic, financiamento imobiliário, vendas e índice de exclusão sem misturar conceito macro com conceito operacional do consórcio."
          />
          <Verdict tag="Leitura direta">
            A venda de cotas cresceu em todos os cenários de juros do período — com Selic em baixa
            histórica (2,0% em 2020) ou em alta (12,3% em 2024). Isso sugere que o crescimento do
            consórcio não depende do nível de juros: ele compete com o financiamento bancário em
            qualquer cenário, o que reforça a leitura de que o produto se sustenta por
            características próprias — incluindo o índice de exclusão estrutural visto na seção 2.
          </Verdict>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <ChartBox title="Selic e financiamento imobiliário" subtitle="pontos marcados por ano">
              <LineChart series={macroSelicSeries} percent yMin={0} yMax={0.2} legend />
            </ChartBox>
            <ChartBox title="Vendas e índice de exclusão geral" subtitle="duas leituras, mesmo período">
              <LineChart series={macroVendIESeries} percent yMin={0} yMax={1} legend />
            </ChartBox>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
            {macroMarkers.map((m) => (
              <div key={m.ano} style={{
                background: "#15140f", color: "#f3efe6",
                borderLeft: "4px solid #ffe66d", borderRadius: 8,
                padding: "13px 16px", fontSize: 14, fontWeight: 600, letterSpacing: "-.01em",
              }}>
                <span style={{
                  color: "#ffe66d", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em",
                  display: "block", marginBottom: 4,
                }}>{m.ano}</span>
                <strong>{m.label}</strong><br />
                <span style={{ fontSize: 12, color: "#a39c8c", fontFamily: "'IBM Plex Mono', monospace" }}>
                  Selic: {m.selic} · Financiamento imob.: {m.financ} · IE geral: {m.ie}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Base de dados ── */}
      <section style={{ padding: "40px 24px", background: "#f6f3ec" }}>
        <div style={{ maxWidth: 1180, margin: "auto" }}>
          <details>
            <summary style={{
              cursor: "pointer", fontWeight: 700, fontSize: 16,
              fontFamily: "'Source Serif 4', serif", padding: "12px 0",
              borderTop: "1px solid #ddd5c5", listStyle: "none",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "#c2410c" }}>▶</span> Ver base de dados do painel
            </summary>
            <div style={{ paddingTop: 16 }}>
              <p style={{ fontSize: 13, color: "#716b60", marginBottom: 16 }}>
                Dados abertos dentro do próprio HTML. Percentuais armazenados como fração decimal e
                exibidos como porcentagem.
              </p>
              <div style={{ overflowX: "auto", border: "1px solid #ddd5c5", borderRadius: 8, background: "#fffdf8" }}>
                <table style={{
                  borderCollapse: "collapse", width: "100%", minWidth: 720,
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
                }}>
                  <thead>
                    <tr>
                      {["Ano", "Produto", "Cotas vendidas", "Cotas ativas", "Cotas excluídas", "Índice de exclusão", "Status"].map((h) => (
                        <th key={h} style={{
                          position: "sticky", top: 0, background: "#15140f", color: "#f3efe6",
                          fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em",
                          fontWeight: 600, fontFamily: "'Inter', sans-serif",
                          padding: "10px 13px",
                          textAlign: (h === "Ano" || h === "Produto" || h === "Status") ? "left" : "right",
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {segmentData.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #ece7dc" }}>
                        <td style={{ padding: "10px 13px", textAlign: "left" }}>{r.ano}</td>
                        <td style={{ padding: "10px 13px", textAlign: "left" }}>{r.segmento}</td>
                        <td style={{ padding: "10px 13px", textAlign: "right" }}>{mi(r.vendidas)}</td>
                        <td style={{ padding: "10px 13px", textAlign: "right" }}>{mi(r.ativas)}</td>
                        <td style={{ padding: "10px 13px", textAlign: "right" }}>{mi(r.excluidas)}</td>
                        <td style={{ padding: "10px 13px", textAlign: "right" }}>{pct(r.ie)}</td>
                        <td style={{ padding: "10px 13px", textAlign: "left", color: "#716b60" }}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <Divider />

          <details>
            <summary style={{
              cursor: "pointer", fontWeight: 700, fontSize: 16,
              fontFamily: "'Source Serif 4', serif", padding: "12px 0",
              listStyle: "none", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "#c2410c" }}>▶</span> De onde vêm os dados deste painel
            </summary>
            <div style={{ paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
              {[
                {
                  title: "Panorama BCB 2016–2024",
                  body: "Cotas vendidas, ativas, excluídas, índice de exclusão, contemplações, recursos e taxa média de administração.",
                  note: "Nota sobre BCB 2025: As análises anuais de 2025 do Banco Central ainda não foram incorporadas ao painel; a limitação aparece sinalizada no hero.",
                },
                {
                  title: "Consumidor.gov.br",
                  body: "Base pública de indicadores. Nesta versão, os registros de administradoras de consórcios foram consolidados por ano, volume de reclamações e principais motivos.",
                },
                {
                  title: "Macro (Selic / financiamento imobiliário)",
                  body: "Mantidos em seção separada para não misturar dado macroeconômico com dado operacional do consórcio.",
                },
              ].map((s) => (
                <div key={s.title} style={{
                  background: "#fffdf8", border: "1px solid #ddd5c5", borderRadius: 10,
                  padding: 22, boxShadow: "0 14px 38px rgba(26,26,23,.08)",
                }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>
                    {s.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: "#716b60", lineHeight: 1.55 }}>{s.body}</p>
                  {s.note && (
                    <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#8a8275", lineHeight: 1.45, fontStyle: "italic" }}>
                      {s.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, background: "#fffdf8", border: "1px solid #ddd5c5",
              borderRadius: 8, padding: "14px 18px", fontSize: 13.5, color: "#716b60", lineHeight: 1.55,
            }}>
              <strong style={{ color: "#15140f" }}>Metodologia:</strong> A base principal é oficial, do Banco Central. A ABAC não foi
              usada como fonte primária — apenas o BCB, que divulga os dados a partir do Cosif,
              Documento 4010, Documento 2080 e Unicad. Este painel usa os Panoramas BCB de 2016 a
              2024 e, na seção de reclamações, os dados consolidados a partir do painel público do
              Consumidor.gov.br. Regra desta versão: onde o dado foi derivado por diferença ou
              cálculo a partir de número arredondado, isso aparece na coluna "status" da
              tabela-base. Nenhum gráfico de percentual usa escala cortada: o índice de exclusão é
              sempre exibido de 0% a 100%.
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
