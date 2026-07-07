/**
 * Módulo 4 — Proporção da Taxa
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: fiel ao HTML original (runEfficiency)
 */

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { ImportToggle } from "@/components/cdv/ImportToggle";
import {
  KpiCard, TransparencyBlock, ConsultCTA, PdfButton,
  CalcMemory, MethodologyBlock, MeaningBlock,
  formatBRL, formatBRLCents, formatPct,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";

function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }
function brl(v: number) { return formatBRL(v); }
function brl0(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(isFinite(v) ? v : 0);
}
function pct2(v: number) {
  return `${(isFinite(v) ? v : 0).toFixed(2).replace(".", ",")}%`;
}

type Basis = "newMoney" | "liquidCredit";

interface FormState {
  credit: string; adminPct: string; paid: string;
  own: string; fgts: string; embedded: string; basis: Basis;
  totalParcelas: string;
}

const DEFAULT: FormState = {
  credit: "300000", adminPct: "16", paid: "12",
  own: "60000", fgts: "0", embedded: "60000", basis: "newMoney",
  totalParcelas: "120",
};

const METER_COLOR: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

export default function SimuladorProporcaoTaxa() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { baseParams, hasData } = useSimuladorStore();
  const [importEnabled, setImportEnabled] = useState(hasData);

  useEffect(() => {
    if (importEnabled && baseParams) {
      setForm((prev) => ({
        ...prev,
        credit: String(baseParams.credit),
        adminPct: String(baseParams.adminRate),
        totalParcelas: String(baseParams.term),
      }));
    } else if (!importEnabled) {
      setForm(DEFAULT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importEnabled]);

  const mutation = trpc.raiox.proporcaoTaxa.useMutation();
  const result = mutation.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tp = parseInt(form.totalParcelas) || 0;
    mutation.mutate({
      credit: num(form.credit), adminPct: num(form.adminPct),
      paid: num(form.paid), own: num(form.own),
      fgts: num(form.fgts), embedded: num(form.embedded),
      basis: form.basis,
      totalParcelas: tp > 0 ? tp : undefined,
    });
  }

  // Desenhar gráfico Canvas de degradação
  useEffect(() => {
    const deg = result?.degradacao;
    const canvas = canvasRef.current;
    if (!deg || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 24, right: 20, bottom: 36, left: 52 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // Fundo
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, H);

    const rows = deg.rows.filter((r) => isFinite(r.eficiencia));
    if (rows.length < 2) return;

    const maxParcela = rows[rows.length - 1].parcela;
    const minEf = Math.min(...rows.map((r) => r.eficiencia));
    const maxEf = Math.max(...rows.map((r) => r.eficiencia));
    const efRange = maxEf - minEf || 1;
    const efMin = Math.max(0, minEf - 5);
    const efMax = maxEf + 5;

    function xOf(parcela: number) {
      return PAD.left + (parcela / maxParcela) * chartW;
    }
    function yOf(ef: number) {
      return PAD.top + chartH - ((ef - efMin) / (efMax - efMin)) * chartH;
    }

    // Linhas de grade horizontais
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let ef = Math.ceil(efMin / 10) * 10; ef <= efMax; ef += 10) {
      const y = yOf(ef);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(ef.toFixed(0) + "%", PAD.left - 6, y + 4);
    }

    // Eixo X — rótulos de parcelas
    ctx.fillStyle = "#888";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    rows.forEach((r) => {
      const x = xOf(r.parcela);
      ctx.fillText(String(r.parcela), x, H - 8);
    });

    // Gradiente de preenchimento
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    grad.addColorStop(0, "rgba(242,106,33,0.35)");
    grad.addColorStop(1, "rgba(242,106,33,0.02)");
    ctx.beginPath();
    ctx.moveTo(xOf(rows[0].parcela), yOf(rows[0].eficiencia));
    rows.forEach((r) => ctx.lineTo(xOf(r.parcela), yOf(r.eficiencia)));
    ctx.lineTo(xOf(rows[rows.length - 1].parcela), PAD.top + chartH);
    ctx.lineTo(xOf(rows[0].parcela), PAD.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Linha principal
    ctx.beginPath();
    ctx.strokeStyle = "#F26A21";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    rows.forEach((r, i) => {
      const x = xOf(r.parcela);
      const y = yOf(r.eficiencia);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Pontos
    rows.forEach((r) => {
      const x = xOf(r.parcela);
      const y = yOf(r.eficiencia);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#F26A21";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Rótulo do eixo Y
    ctx.save();
    ctx.translate(14, PAD.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#888";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Eficiência (%)", 0, 0);
    ctx.restore();
  }, [result]);

  async function handlePdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePdfProporcaoTaxa } = await import("@/lib/pdfProporcaoTaxa");
      await generatePdfProporcaoTaxa({ ...result, form });
    } catch (err) { console.error("PDF error", err); }
    finally { setPdfLoading(false); }
  }

  // ── Painel esquerdo: formulário ──────────────────────────────────────────
  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      <p className="font-semibold text-xs text-foreground/70 uppercase tracking-wider mb-2">
        Dados do plano
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Carta de crédito (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-0.5 w-full"
            value={form.credit} onChange={(e) => set("credit", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Taxa adm. (%)</span>
          <input type="number" min="0" step="0.01" className="input mt-0.5 w-full"
            value={form.adminPct} onChange={(e) => set("adminPct", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Parcelas pagas</span>
          <input type="number" min="0" className="input mt-0.5 w-full"
            value={form.paid} onChange={(e) => set("paid", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Lance próprio (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-0.5 w-full"
            value={form.own} onChange={(e) => set("own", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">FGTS (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-0.5 w-full"
            value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Lance embutido (R$)</span>
          <input type="number" min="0" step="1000" className="input mt-0.5 w-full"
            value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Base de cálculo da taxa</span>
          <select className="input mt-0.5 w-full" value={form.basis}
            onChange={(e) => set("basis", e.target.value as Basis)}>
            <option value="newMoney">Dinheiro novo (padrão)</option>
            <option value="liquidCredit">Carta líquida</option>
          </select>
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Total de parcelas do grupo</span>
          <input type="number" min="1" max="360" step="1" className="input mt-0.5 w-full"
            placeholder="Ex: 120"
            value={form.totalParcelas} onChange={(e) => set("totalParcelas", e.target.value)} />
          <span className="text-xs text-foreground/40 mt-0.5 block">Necessário para análise de degradação progressiva</span>
        </label>
      </div>

      <button type="submit" disabled={mutation.isPending}
        className="w-full rounded-full bg-[var(--orange)] text-white py-2.5 text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {mutation.isPending ? "Calculando…" : "Calcular proporção da taxa"}
      </button>
    </form>
  );

  // ── Painel direito: resultados ───────────────────────────────────────────
  const resultsPanel = result ? (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <KpiCard label="Taxa nominal (contratual)" value={pct2(result.kpis.nominal)}
          hint="Taxa de administração contratual" tone="default" />
        <KpiCard label="Taxa sobre carta líquida" value={pct2(result.kpis.onLiquid)}
          hint="Proporção sobre a carta após embutido" tone="orange" />
        <KpiCard label="Taxa sobre dinheiro novo" value={pct2(result.kpis.onNew)}
          hint="O indicador que mostra o custo real da operação." highlight={true} />
        <KpiCard label="Peso adicional da taxa" value={pct2(result.kpis.penalty)}
          hint="Diferença entre taxa real e nominal"
          tone={result.kpis.penalty > 5 ? "negative" : result.kpis.penalty > 2 ? "orange" : "positive"} />
      </div>

      {/* Termômetro visual */}
      <div className="bg-[#F5F0E8] rounded-lg sm:rounded-xl border border-[#DDD6C8] p-2 sm:p-3">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Termômetro de proporção
        </p>
        <div className="relative h-4 rounded-full bg-gray-200 overflow-hidden mb-2">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${METER_COLOR[result.meter.cls] || "bg-gray-400"}`}
            style={{ width: `${Math.min(100, result.meter.widthPct)}%` }}
          />
        </div>
        <p className="font-bold text-xs sm:text-sm text-foreground mb-1">{result.meter.label}</p>
        <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">{result.meter.text}</p>
      </div>

      {/* Readboxes */}
      <div className="space-y-2 sm:space-y-3">
        {result.readboxes.map((rb, i) => (
          <MeaningBlock key={i} label="Eficiência da Taxa">
            <p className="font-semibold text-sm mb-1">{rb.title}</p>
            <p className="whitespace-pre-line">{rb.body}</p>
            {rb.formula && (
              <p className="mt-2 text-xs font-mono text-foreground/50 bg-white/60 rounded px-2 py-1">
                {rb.formula}
              </p>
            )}
          </MeaningBlock>
        ))}
      </div>

      {/* Tabela de indicadores */}
      <div>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Tabela de indicadores
        </p>
        <div className="rounded-xl border border-border">
          <div className="w-full overflow-x-auto">
            <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="sticky top-0 bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-1.5 py-1.5 text-left font-semibold whitespace-nowrap text-[8px] sm:text-[10px]">Indicador</th>
                  <th className="px-1.5 py-1.5 text-right font-semibold text-[8px] sm:text-[10px]">Valor</th>
                  <th className="px-1.5 py-1.5 text-left font-semibold text-[8px] sm:text-[10px]">Leitura</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                    <td className="px-1.5 py-1 text-medium text-[8px] sm:text-xs">{row.indicator}</td>
                    <td className="px-1.5 py-1 text-right font-mono font-semibold text-[8px] sm:text-xs">{row.value}</td>
                    <td className="px-1.5 py-1 text-foreground/55 text-[8px] sm:text-xs">{row.reading}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {/* Memória de cálculo */}
      <CalcMemory rows={[
        { label: "Valor da administração", value: brl(result.adminValue),
          formula: `${brl0(result.kpis.nominal / 100 * num(form.credit))} = carta × taxa nominal` },
        { label: "Carta líquida", value: brl0(result.liquidCredit),
          formula: "carta − embutido" },
        { label: "Dinheiro novo", value: brl0(result.newMoney),
          formula: "carta líquida − parcelas pagas − lance próprio − FGTS" },
        { label: "Taxa sobre dinheiro novo", value: pct2(result.kpis.onNew),
          formula: "adm. / dinheiro novo × 100" },
        { label: "Peso adicional", value: pct2(result.kpis.penalty),
          formula: "taxa sobre dinheiro novo − taxa nominal" },
      ]} />

      {/* ── DEGRADAÇÃO PROGRESSIVA ─────────────────────────────────────── */}
      {result.degradacao && (() => {
        const deg = result.degradacao!;
        const alertColors: Record<string, string> = {
          ok: "border-green-500 bg-green-500/10 text-green-400",
          atencao: "border-amber-400 bg-amber-400/10 text-amber-300",
          alerta: "border-orange-500 bg-orange-500/10 text-orange-300",
          critico: "border-red-500 bg-red-500/10 text-red-400",
        };
        const alertCls = alertColors[deg.alerta.nivel] ?? alertColors.ok;
        return (
          <div className="space-y-5">
            {/* Título da seção */}
            <div className="border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">Análise de Degradação Progressiva</p>
              <p className="text-xs text-foreground/50">Impacto real da taxa sobre o dinheiro novo a cada parcela paga sem contemplação.</p>
            </div>

            {/* Alerta */}
            <div className={`rounded-xl border-2 p-4 ${alertCls}`}>
              <p className="font-bold text-sm mb-1">{deg.alerta.titulo}</p>
              <p className="text-sm opacity-90">{deg.alerta.mensagem}</p>
            </div>

            {/* Gráfico Canvas */}
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">Gráfico de Degradação Progressiva</p>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[560px]">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={220}
                    className="w-full rounded-xl"
                    style={{ display: "block" }}
                  />
                </div>
              </div>
            </div>

            {/* Tabela progressiva */}
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">Progressão por Parcela</p>
              <div className="rounded-xl border border-border">
                <div className="w-full overflow-x-auto">
                  <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs min-w-[560px]">
                    <thead className="sticky top-0 bg-[var(--ink)] text-white">
                      <tr>
                        <th className="px-3 py-2.5 text-center font-semibold">Parcela</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Desembolso acum.</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Dinheiro novo</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Taxa efetiva</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Eficiência</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Degradação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deg.rows.map((row, i) => {
                        const isLast = i === deg.rows.length - 1;
                        const degCls = row.degradacao > 35 ? "text-red-400 font-bold" :
                          row.degradacao > 20 ? "text-orange-400 font-semibold" :
                          row.degradacao > 10 ? "text-amber-400" : "text-foreground/70";
                        return (
                          <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} ${isLast ? "border-t-2 border-[var(--orange)]" : ""}`}>
                            <td className="px-3 py-2 text-center font-mono font-semibold">{row.parcela}</td>
                            <td className="px-3 py-2 text-right font-mono">
                              {row.desembolsoAcumulado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {row.dinheiroNovo > 0
                                ? row.dinheiroNovo.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                                : <span className="text-red-400">Sem base</span>}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {isFinite(row.taxaEfetiva) ? pct2(row.taxaEfetiva) : <span className="text-red-400">∞</span>}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {isFinite(row.eficiencia) ? pct2(row.eficiencia) : "—"}
                            </td>
                            <td className={`px-3 py-2 text-right font-mono ${degCls}`}>
                              {pct2(row.degradacao)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Relatório final — Cenário Sem Contemplação */}
            <div className="bg-[#F5F0E8] rounded-xl border border-[#DDD6C8] p-4 space-y-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">Relatório Final — Cenário Sem Contemplação</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white/70 rounded-md p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-foreground/50 mb-0.5">Eficiência inicial</p>
                  <p className="font-bold text-base sm:text-lg text-green-600">{pct2(deg.eficienciaInicial)}</p>
                </div>
                <div className="bg-white/70 rounded-md p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-foreground/50 mb-0.5">Eficiência na parcela {deg.rows[deg.rows.length-1]?.parcela}</p>
                  <p className={`font-bold text-lg ${deg.eficienciaFinal < 50 ? "text-red-500" : deg.eficienciaFinal < 70 ? "text-amber-500" : "text-green-600"}`}>{pct2(deg.eficienciaFinal)}</p>
                </div>
                <div className="bg-white/70 rounded-md p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-foreground/50 mb-0.5">Perda total de eficiência</p>
                  <p className="font-bold text-base sm:text-lg text-red-600">{pct2(deg.perdaTotal)}</p>
                </div>
                <div className="bg-white/70 rounded-md p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-foreground/50 mb-0.5">Impacto em R$</p>
                  <p className="font-bold text-lg text-foreground">
                    {deg.impactoReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-foreground/40 mt-0.5">a mais em taxa sobre dinheiro novo</p>
                </div>
              </div>
              <p className="text-xs text-foreground/40 mt-2">⚠️ Este simulador assume parcelas regulares e taxa de administração distribuída linearmente.</p>
            </div>
          </div>
        );
      })()}

      <MethodologyBlock sources={[
        "Lógica extraída do HTML original Raio-X do Consórcio (runEfficiency).",
        "Dinheiro novo = carta líquida − parcelas pagas − lances próprios.",
        "Termômetro: verde ≤ 20%, amarelo ≤ 35%, vermelho > 35% sobre dinheiro novo.",
        "Degradação progressiva: calculada por parcela conforme especificação técnica aprovada.",
        "Motor Matemático v1.0 · Cálculo executado no servidor (tRPC).",
      ]} />

      <TransparencyBlock />

      <div className="flex flex-wrap gap-3">
        <PdfButton onClick={handlePdf} loading={pdfLoading} />
      </div>
      <ConsultCTA context="esse resultado" variant="new" />
    </div>
  ) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <RaioXLayout
        moduleNumber={4}
        title="Raio-X da Eficiência da Taxa"
        description={<span className="text-[var(--orange)]">A taxa parece pequena no contrato. Mas quanto ela pesa no dinheiro que você realmente usa?</span>}
        descriptionSupport="Analise quanto da operação representa custo e quanto realmente vira crédito disponível."
        formPanel={formPanel}
        resultsPanel={resultsPanel}
        hasResult={!!result}
      />
    </div>
  );
}
