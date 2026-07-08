/**
 * Módulo 4 — Proporção da Taxa
 * Layout: RaioXLayout (grid 2 colunas)
 * Matemática: Substituição total do motor matemático conforme auditoria.
 * Ajustes: Tabela de auditoria abaixo da metodologia, PDF atualizado.
 */

import { useState, useEffect } from "react";
import { useSimuladorStore } from "@/stores/simuladorStore";
import { ImportToggle } from "@/components/cdv/ImportToggle";
import {
  KpiCard, TransparencyBlock, ConsultCTA, PdfButton,
  CalcMemory, MethodologyBlock,
  formatBRL,
} from "@/components/cdv/SimuladorUI";
import RaioXLayout from "@/components/cdv/RaioXLayout";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  correcaoAnualPct: string;
}

const DEFAULT: FormState = {
  credit: "300000", adminPct: "16", paid: "12",
  own: "60000", fgts: "0", embedded: "60000", basis: "newMoney",
  totalParcelas: "120",
  correcaoAnualPct: "6",
};

export default function SimuladorProporcaoTaxa() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);

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
  }, [importEnabled, baseParams]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasCalculated(true);
  }

  // --- MOTOR MATEMÁTICO ---
  const parcelasPagasNum = Number(form.paid) || 1;
  const lanceProprioNum = Number(form.own) || 0;
  const fgtsNum = Number(form.fgts) || 0;
  const lanceEmbutidoNum = Number(form.embedded) || 0;
  const cartaNum = Number(form.credit) || 0;
  const taxaAdmNum = Number(form.adminPct) || 0;
  const prazoNum = Number(form.totalParcelas) || 1;
  const correcaoAnualNum = Number(form.correcaoAnualPct) || 0;

  let cartaAtualizada = cartaNum;
  let parcelaAtualizada = (cartaNum + (cartaNum * (taxaAdmNum / 100))) / prazoNum;
  let desembolsoAcumulado = lanceProprioNum + fgtsNum;
  let taxaAdmAtualizada = cartaNum * (taxaAdmNum / 100);

  const progressao = [];

  for (let mes = 1; mes <= prazoNum; mes++) {
    if (mes > 1 && (mes - 1) % 12 === 0) {
      cartaAtualizada *= (1 + (correcaoAnualNum / 100));
      parcelaAtualizada *= (1 + (correcaoAnualNum / 100));
      taxaAdmAtualizada = cartaAtualizada * (taxaAdmNum / 100);
    }

    desembolsoAcumulado += parcelaAtualizada;
    const cartaLiquidaMes = cartaAtualizada - lanceEmbutidoNum;
    const custoTotalMes = cartaLiquidaMes + taxaAdmAtualizada + desembolsoAcumulado;
    const eficienciaMes = (cartaLiquidaMes / custoTotalMes) * 100;

    progressao.push({
      mes,
      cartaAtualizada,
      parcelaAtualizada,
      desembolsoAcumulado,
      eficiencia: eficienciaMes
    });
  }

  const mesAtualIndex = Math.max(1, Math.min(parcelasPagasNum, prazoNum)) - 1;
  const dadosMesAtual = progressao[mesAtualIndex];

  const cartaLiquidaAtual = dadosMesAtual.cartaAtualizada - lanceEmbutidoNum;
  const taxaAdmAtual = dadosMesAtual.cartaAtualizada * (taxaAdmNum / 100);
  const desembolsoTotalAtual = dadosMesAtual.desembolsoAcumulado;
  const dinheiroNovo = cartaLiquidaAtual - desembolsoTotalAtual;
  const taxaSobreDinheiroNovo = dinheiroNovo > 0 ? (taxaAdmAtual / dinheiroNovo) * 100 : 0;
  const pesoAdicional = taxaSobreDinheiroNovo - taxaAdmNum;

  async function handlePdf() {
    if (!hasCalculated) return;
    setPdfLoading(true);
    try {
      const { generatePdfProporcaoTaxa } = await import("@/lib/pdfProporcaoTaxa");
      await generatePdfProporcaoTaxa({
        kpis: {
          nominal: taxaAdmNum,
          onLiquid: (taxaAdmAtual / cartaLiquidaAtual) * 100,
          onNew: taxaSobreDinheiroNovo,
          penalty: pesoAdicional
        },
        adminValue: taxaAdmAtual,
        liquidCredit: cartaLiquidaAtual,
        newMoney: dinheiroNovo,
        meter: {
          widthPct: Math.min(100, (taxaSobreDinheiroNovo / 50) * 100),
          label: taxaSobreDinheiroNovo > 40 ? "Crítico" : taxaSobreDinheiroNovo > 25 ? "Alto" : "Moderado",
          cls: taxaSobreDinheiroNovo > 40 ? "bg-red-500" : taxaSobreDinheiroNovo > 25 ? "bg-orange-500" : "bg-blue-500",
          text: "Análise baseada no custo real sobre o dinheiro novo."
        },
        readboxes: [
          { title: "Valor da administração", body: `R$ ${brl0(taxaAdmAtual)}`, formula: "carta atualizada × taxa nominal" },
          { title: "Carta líquida", body: `R$ ${brl0(cartaLiquidaAtual)}`, formula: "carta atualizada − embutido" },
          { title: "Dinheiro novo", body: `R$ ${brl0(dinheiroNovo)}`, formula: "carta líquida − desembolso total" }
        ],
        table: [
          { indicator: "Taxa adm. em R$ (Atual)", value: brl0(taxaAdmAtual), reading: "Taxa nominal sobre a carta atualizada." },
          { indicator: "Carta líquida", value: brl0(cartaLiquidaAtual), reading: "Crédito disponível para compra." },
          { indicator: "Desembolso Total", value: brl0(desembolsoTotalAtual), reading: "Parcelas pagas + recursos próprios." },
          { indicator: "Dinheiro Novo", value: brl0(dinheiroNovo), reading: "Base real de eficiência." }
        ],
        simulationId: Math.random().toString(36).substring(7).toUpperCase(),
        generatedAt: new Date().toISOString(),
        form: {
          credit: form.credit,
          adminPct: form.adminPct,
          paid: form.paid,
          own: form.own,
          fgts: form.fgts,
          embedded: form.embedded,
          basis: form.basis
        }
      });
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setPdfLoading(false);
    }
  }

  const formPanel = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ImportToggle hasData={hasData} enabled={importEnabled} onChange={setImportEnabled} />
      <p className="font-semibold text-xs text-foreground/70 uppercase tracking-wider mb-2">
        Dados do plano
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Carta de crédito (R$)</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.credit} onChange={(e) => set("credit", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Taxa adm. (%)</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.adminPct} onChange={(e) => set("adminPct", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Correção Anual (%)</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.correcaoAnualPct} onChange={(e) => set("correcaoAnualPct", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Parcelas pagas</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.paid} onChange={(e) => set("paid", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">Lance próprio (R$)</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.own} onChange={(e) => set("own", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/60">FGTS (R$)</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.fgts} onChange={(e) => set("fgts", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Lance embutido (R$)</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.embedded} onChange={(e) => set("embedded", e.target.value)} />
        </label>
        <label className="block col-span-2">
          <span className="text-xs font-medium text-foreground/60">Total de parcelas do grupo</span>
          <input type="number" className="input mt-0.5 w-full"
            value={form.totalParcelas} onChange={(e) => set("totalParcelas", e.target.value)} />
        </label>
      </div>

      <button type="submit" className="w-full rounded-full bg-[var(--orange)] text-white py-2.5 text-sm font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all">
        Calcular proporção da taxa
      </button>
    </form>
  );

  const resultsPanel = hasCalculated ? (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <KpiCard label="Taxa nominal (contratual)" value={pct2(taxaAdmNum)}
          hint="Taxa de administração contratual" tone="default" />
        <KpiCard label="Taxa sobre carta líquida" value={pct2((taxaAdmAtual / cartaLiquidaAtual) * 100)}
          hint="Proporção sobre a carta após embutido" tone="orange" />
        <KpiCard label="Taxa sobre dinheiro novo" value={pct2(taxaSobreDinheiroNovo)}
          hint="O indicador que mostra o custo real da operação." highlight={true} />
        <KpiCard label="Peso adicional da taxa" value={pct2(pesoAdicional)}
          hint="Diferença entre taxa real e nominal"
          tone={pesoAdicional > 5 ? "negative" : pesoAdicional > 2 ? "orange" : "positive"} />
      </div>

      <div>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
          Tabela de indicadores
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--ink)] text-white text-[10px] uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Indicador</th>
                <th className="px-3 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="bg-white">
                <td className="px-3 py-2 text-foreground/70">Taxa adm. em R$ (Atual)</td>
                <td className="px-3 py-2 text-right font-mono font-bold">{brl0(taxaAdmAtual)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-foreground/70">Carta líquida após embutido</td>
                <td className="px-3 py-2 text-right font-mono font-bold">{brl0(cartaLiquidaAtual)}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-3 py-2 text-foreground/70">Parcelas pagas + recursos próprios</td>
                <td className="px-3 py-2 text-right font-mono font-bold">{brl0(desembolsoTotalAtual)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-foreground/70">Dinheiro novo efetivo</td>
                <td className="px-3 py-2 text-right font-mono font-bold">{brl0(dinheiroNovo)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <CalcMemory rows={[
        { label: "Valor da administração", value: brl0(taxaAdmAtual), formula: "carta atualizada × taxa nominal" },
        { label: "Carta líquida", value: brl0(cartaLiquidaAtual), formula: "carta atualizada − embutido" },
        { label: "Dinheiro novo", value: brl0(dinheiroNovo), formula: "carta líquida − desembolso total" },
      ]} />

      <MethodologyBlock sources={[
        "Motor Matemático v2.0 · Substituição total conforme auditoria técnica.",
        "Cálculo de eficiência dinâmica com reajuste e recálculo sincronizado.",
      ]} />

      {/* Tabela de Auditoria (Recolhida por padrão, abaixo da metodologia) */}
      <div className="mt-4">
        <button 
          onClick={() => setIsTableOpen(!isTableOpen)}
          className="flex items-center justify-between w-full p-4 bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground/60">
            PROGRESSÃO POR PARCELA (AUDITORIA)
          </span>
          {isTableOpen ? <ChevronUp className="w-4 h-4 text-foreground/40" /> : <ChevronDown className="w-4 h-4 text-foreground/40" />}
        </button>
        
        {isTableOpen && (
          <div className="mt-2 rounded-xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <table className="w-full text-[10px] sm:text-xs">
              <thead className="bg-[var(--ink)] text-white">
                <tr>
                  <th className="px-2 py-3 text-center font-semibold">Mês</th>
                  <th className="px-2 py-3 text-right font-semibold">Carta Atu.</th>
                  <th className="px-2 py-3 text-right font-semibold">Parcela</th>
                  <th className="px-2 py-3 text-right font-semibold">Desembolso</th>
                  <th className="px-2 py-3 text-right font-semibold">Eficiência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {progressao.filter((_, i) => [0, 11, 12, 23, 24, 35, 47, 59, 71, 83, 95, 107, progressao.length - 1].includes(i)).map((row, i) => {
                  const isReajuste = row.mes > 1 && (row.mes - 1) % 12 === 0;
                  return (
                    <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${isReajuste ? "bg-amber-50" : ""}`}>
                      <td className="px-2 py-2.5 text-center font-mono font-bold text-gray-700">
                        {row.mes}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono text-gray-600">{brl0(row.cartaAtualizada)}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-gray-600">{brl0(row.parcelaAtualizada)}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-gray-600">{brl0(row.desembolsoAcumulado)}</td>
                      <td className="px-2 py-2.5 text-right font-mono font-bold text-[var(--orange)]">{row.eficiencia.toFixed(2).replace(".", ",")}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
        hasResult={hasCalculated}
      />
    </div>
  );
}
