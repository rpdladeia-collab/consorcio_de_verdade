'use client';

import { useState, useEffect, useMemo } from 'react';
import RaioXLayout from '@/components/cdv/RaioXLayout';
import { ConsultCTA, MethodologyBlock } from '@/components/cdv/SimuladorUI';

// Funções de formatação idênticas ao script original
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (v: number) => brl.format(Number.isFinite(Number(v)) ? Number(v) : 0);
const pct = (v: number) => `${numFormat.format(Number.isFinite(Number(v)) ? Number(v) : 0)}%`;
const safe = (v: string | number, d = 0) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
};

export default function SimuladorEstrategiaLance() {
  const [credit, setCredit] = useState<string>("300000");
  const [adminRate, setAdminRate] = useState<string>("25");
  const [lanceRate, setLanceRate] = useState<string>("30");
  const [hasCalculated, setHasCalculated] = useState(true);

  // Lógica matemática idêntica à função calculate() do script
  const result = useMemo(() => {
    const c = Math.max(0, safe(credit));
    const a = Math.max(0, safe(adminRate));
    const l = Math.max(0, safe(lanceRate));
    
    const adminValue = c * a / 100;
    const categoryBase = c + adminValue;
    const lanceOnCredit = c * l / 100;
    const lanceOnCategory = categoryBase * l / 100;
    const diff = lanceOnCategory - lanceOnCredit;
    const diffPctVsCreditLance = lanceOnCredit > 0 ? diff / lanceOnCredit * 100 : 0;
    const effectiveCategoryPct = c > 0 ? lanceOnCategory / c * 100 : 0;
    const categoryBasePct = c > 0 ? categoryBase / c * 100 : 0;

    return {
      c, a, l,
      adminValue,
      categoryBase,
      lanceOnCredit,
      lanceOnCategory,
      diff,
      diffPctVsCreditLance,
      effectiveCategoryPct,
      categoryBasePct
    };
  }, [credit, adminRate, lanceRate]);

  const lastRows = [
    {
      modalidade: 'Lance sobre carta de crédito',
      base: result.c,
      formula: `Carta atualizada × ${pct(result.l)}`,
      lance: result.lanceOnCredit,
      equivalente: result.c > 0 ? result.lanceOnCredit / result.c * 100 : 0,
      diferenca: 0,
      leitura: 'Percentual incide apenas sobre a carta. Mais simples e normalmente exige menor desembolso.'
    },
    {
      modalidade: 'Lance sobre categoria',
      base: result.categoryBase,
      formula: `(Carta + taxa adm.) × ${pct(result.l)}`,
      lance: result.lanceOnCategory,
      equivalente: result.effectiveCategoryPct,
      diferenca: result.diff,
      leitura: 'Percentual incide sobre base maior. O lance fica mais alto mesmo com o mesmo percentual.'
    }
  ];

  const handleCalculate = () => {
    setHasCalculated(true);
  };

  const handlePrint = () => window.print();

  const downloadCsv = () => {
    const header = ['Modalidade', 'Base de cálculo', 'Fórmula', 'Lance em R$', 'Equivalente sobre a carta', 'Diferença vs lance sobre carta', 'Leitura'];
    const lines = [header, ...lastRows.map(r => [r.modalidade, r.base.toFixed(2), r.formula, r.lance.toFixed(2), r.equivalente.toFixed(2) + '%', r.diferenca.toFixed(2), r.leitura])];
    const csv = lines.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memoria_lance_sobre_carta_vs_categoria.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ─── FORM PANEL (Esquerda) ───
  const formPanel = (
    <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-1.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Carta (R$)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={credit} onChange={(e) => setCredit(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Atualizada</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Taxa Adm (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={adminRate} onChange={(e) => setAdminRate(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Sobre carta</p>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <label className="block text-[12px] md:text-[13px] font-bold text-gray-800 mb-0.5 truncate">Lance (%)</label>
          <div className="mt-auto">
            <input type="number" className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] md:text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" value={lanceRate} onChange={(e) => setLanceRate(e.target.value)} />
            <p className="text-[9px] text-foreground/40 mt-0.5 leading-tight truncate">Ofertado</p>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full rounded-full bg-[var(--orange)] text-white py-2 text-[13px] md:text-[14px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all mt-1"
      >
        Analisar diferença
      </button>

      <div className="rounded-lg sm:rounded-xl border border-border bg-card py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[13px] md:text-[14px]">
        <b>Importante:</b> este simulador usa uma categoria simplificada: <b>carta + taxa de administração</b>. Cada contrato pode ter regra própria. A simulação é educativa.
      </div>

      <div className="flex gap-1.5 sm:gap-2">
        <button 
          type="button"
          onClick={handlePrint}
          className="flex-1 rounded-full border border-border bg-secondary text-foreground py-1.5 sm:py-2 text-[10px] sm:text-[14px] md:text-[15px] font-bold tracking-wide hover:opacity-90 transition-all"
        >
          Imprimir
        </button>
        {hasCalculated && (
          <button 
            type="button"
            onClick={downloadCsv}
            className="flex-1 rounded-full border border-border bg-secondary text-foreground py-1.5 sm:py-2 text-[10px] sm:text-[14px] md:text-[15px] font-bold tracking-wide hover:opacity-90 transition-all"
          >
            Baixar CSV
          </button>
        )}
      </div>
    </form>
  );

  // ─── RESULTS PANEL (Direita) ───
  const resultsPanel = (
    <div className="space-y-2 sm:space-y-3 px-2 sm:px-0">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
        <div className="rounded-lg sm:rounded-xl border border-green-200 bg-green-50 p-2 sm:p-3">
          <p className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-green-600 mb-1">Carta atualizada</p>
          <p className="text-base sm:text-lg font-bold text-green-900 break-words">{money(result.c)}</p>
          <p className="text-[11px] sm:text-[12px] md:text-[13px] text-green-700 mt-1">base simples da carta</p>
        </div>
        <div className="rounded-lg sm:rounded-xl border border-yellow-200 bg-yellow-50 p-2 sm:p-3">
          <p className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-yellow-600 mb-1">Taxa adm. em R$</p>
          <p className="text-base sm:text-lg font-bold text-yellow-900 break-words">{money(result.adminValue)}</p>
          <p className="text-[11px] sm:text-[12px] md:text-[13px] text-yellow-700 mt-1">{pct(result.a)} sobre a carta</p>
        </div>
        <div className="rounded-lg sm:rounded-xl border border-red-200 bg-red-50 p-2 sm:p-3">
          <p className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold uppercase tracking-wider text-red-600 mb-1">Categoria simplificada</p>
          <p className="text-base sm:text-lg font-bold text-red-900 break-words">{money(result.categoryBase)}</p>
          <p className="text-[11px] sm:text-[12px] md:text-[13px] text-red-700 mt-1">equivale a {pct(result.categoryBasePct)} da carta</p>
        </div>
      </div>

      {/* Comparação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
        <div className="rounded-lg sm:rounded-xl border border-green-300 bg-green-50 p-2.5 sm:p-4">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-green-700 mb-1.5 sm:mb-2">
            ✓ Mais simples
          </span>
          <h3 className="font-bold text-[14px] md:text-[15px] mb-1 sm:mb-2">Lance sobre carta de crédito</h3>
          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-foreground/70 mb-1.5 sm:mb-2">O percentual incide diretamente sobre a carta atualizada.</p>
          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-green-200 font-mono text-[11px] sm:text-[12px] md:text-[13px] mb-1.5 sm:mb-2 overflow-x-auto">
            <span className="whitespace-nowrap inline-block">{money(result.c)} × {pct(result.l)} = <strong className="text-green-700">{money(result.lanceOnCredit)}</strong></span>
          </div>
          <p className="text-[14px] md:text-[15px] font-bold text-green-700 break-words">{money(result.lanceOnCredit)}</p>
        </div>

        <div className="rounded-lg sm:rounded-xl border border-yellow-300 bg-yellow-50 p-2.5 sm:p-4">
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-yellow-700 mb-1.5 sm:mb-2">
            ⚠ Base maior
          </span>
          <h3 className="font-bold text-[14px] md:text-[15px] mb-1 sm:mb-2">Lance sobre categoria</h3>
          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-foreground/70 mb-1.5 sm:mb-2">O percentual incide sobre carta + taxa adm.; por isso, o valor exigido sobe.</p>
          <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-yellow-200 font-mono text-[11px] sm:text-[12px] md:text-[13px] mb-1.5 sm:mb-2 overflow-x-auto">
            <span className="whitespace-nowrap inline-block">({money(result.c)} + {money(result.adminValue)}) × {pct(result.l)} = <strong className="text-yellow-700">{money(result.lanceOnCategory)}</strong></span>
          </div>
          <p className="text-[14px] md:text-[15px] font-bold text-yellow-700 break-words">{money(result.lanceOnCategory)}</p>
        </div>
      </div>

      {/* Impacto */}
      <div className="rounded-lg sm:rounded-xl border-2 border-yellow-400 bg-yellow-50 p-2.5 sm:p-4">
        <p className="text-[11px] sm:text-[12px] md:text-[13px] font-bold uppercase tracking-wider text-yellow-600 mb-1">Diferença gerada pela base de cálculo</p>
        <p className="text-xl sm:text-2xl font-black text-yellow-900 break-words">{money(result.diff)}</p>
        <p className="text-[13px] md:text-[14px] text-yellow-800 mt-1.5 sm:mt-2">Esse é o valor adicional exigido quando o mesmo lance de {pct(result.l)} é calculado sobre categoria.</p>
      </div>

      {/* Insights */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-2 sm:p-3">
          <p className="text-[13px] md:text-[14px] font-bold text-green-700 mb-0.5 sm:mb-1">✓ Leitura prática:</p>
          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-green-800">quando o contrato usa lance sobre carta, o cliente sabe exatamente quanto precisa ofertar em relação ao crédito contratado.</p>
        </div>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-2 sm:p-3">
          <p className="text-[13px] md:text-[14px] font-bold text-yellow-700 mb-0.5 sm:mb-1">⚠ Atenção:</p>
          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-yellow-800">quando a base é categoria, o mesmo percentual pode exigir mais dinheiro do cliente. No exemplo, 30% deixa de ser {money(result.lanceOnCredit)} e passa a ser {money(result.lanceOnCategory)}.</p>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-2 sm:p-3">
          <p className="text-[13px] md:text-[14px] font-bold text-red-700 mb-0.5 sm:mb-1">🔒 Proteção técnica:</p>
          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-red-800">a regra válida é sempre a do contrato e do regulamento do grupo. Este simulador apenas compara a matemática das bases de cálculo.</p>
        </div>
      </div>

      {/* Tabela de memória */}
      <div className="rounded-lg sm:rounded-lg border border-border overflow-hidden">
        <div className="bg-card px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border">
          <p className="text-[14px] md:text-[15px] font-bold uppercase tracking-wider">Memória de cálculo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] sm:text-[13px] md:text-[14px]">
            <thead className="bg-[var(--ink)] text-white">
              <tr>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left">Modalidade</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">Base</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">Lance (R$)</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">% carta</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">Dif.</th>
              </tr>
            </thead>
            <tbody>
              {lastRows.map((r, i) => (
                <tr key={i} className={i === 1 ? "bg-yellow-50" : "bg-white"}>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-medium text-[12px] sm:text-[13px] md:text-[14px]">{r.modalidade}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right whitespace-nowrap">{money(r.base)}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right font-bold whitespace-nowrap">{money(r.lance)}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right whitespace-nowrap">{pct(r.equivalente)}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right whitespace-nowrap">{money(r.diferenca)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <RaioXLayout
        moduleNumber={7}
        title="Lance sobre Carta vs Categoria"
        description="O mesmo percentual de lance pode representar valores muito diferentes dependendo da base de cálculo. Entenda a diferença matemática entre ofertar sobre o crédito ou sobre a categoria (crédito + taxas)."
        descriptionSupport="Simulação educativa baseada em dados incluídos pelo usuário — apenas com finalidade de conhecer a dinâmica do mercado de consórcio."
        formPanel={formPanel}
        resultsPanel={resultsPanel}
        hasResult={hasCalculated}
      />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <ConsultCTA />
        
        <MethodologyBlock
          sources={["Regulamento Geral de Consórcios", "Matemática Financeira Aplicada"]}
        />
      </div>
    </>
  );
}
