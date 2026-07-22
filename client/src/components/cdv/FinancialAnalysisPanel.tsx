/**
 * Painel de Análise Financeira Automática
 * Renderiza todos os 12 blocos de análise do simulador
 */

import React from 'react';
import { ChevronDown, TrendingUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatBRL, formatBRLCents, formatPct } from './SimuladorUI';
import type { FinancialAnalysis } from '@/types/financialAnalysis';

interface Props {
  analysis: FinancialAnalysis;
}

export function FinancialAnalysisPanel({ analysis }: Props) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    executive: true,
    distribution: true,
    cost: true,
    flow: true,
    installments: true,
    credit: true,
    admin: true,
    indicators: true,
    interpretation: true,
  });

  const toggle = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between bg-card hover:bg-secondary px-4 py-3 text-left transition-colors"
      >
        <h3 className="font-bold text-[14px] md:text-[15px] text-foreground uppercase tracking-wide">{title}</h3>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSections[id] ? 'rotate-180' : ''}`} />
      </button>
      {openSections[id] && (
        <div className="px-4 py-4 bg-background border-t border-border space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* 1. VISÃO EXECUTIVA */}
      <Section id="executive" title="1. Visão Executiva">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-1">Carta</p>
            <p className="font-mono text-[14px] font-bold">{formatBRL(analysis.executiveSummary.credit)}</p>
          </div>
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-1">Prazo</p>
            <p className="font-mono text-[14px] font-bold">{analysis.executiveSummary.term} meses</p>
          </div>
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-1">Taxa</p>
            <p className="font-mono text-[14px] font-bold">{analysis.executiveSummary.adminRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-1">Correção</p>
            <p className="font-mono text-[14px] font-bold">{analysis.executiveSummary.correction.toFixed(1)}%</p>
          </div>
        </div>
        <div className={`rounded-lg p-3 text-[13px] ${
          analysis.executiveSummary.riskLevel === 'low' ? 'bg-green-100 text-green-900' :
          analysis.executiveSummary.riskLevel === 'medium' ? 'bg-amber-100 text-amber-900' :
          'bg-red-100 text-red-900'
        }`}>
          <p className="font-bold mb-1">
            Risco: {analysis.executiveSummary.riskLevel === 'low' ? 'Baixo' : analysis.executiveSummary.riskLevel === 'medium' ? 'Médio' : 'Alto'}
          </p>
          <p>{analysis.executiveSummary.riskReason}</p>
        </div>
      </Section>

      {/* 2. COMO O DINHEIRO SE DISTRIBUI */}
      <Section id="distribution" title="2. Como o Dinheiro se Distribui">
        <div className="space-y-4">
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-2">Carta de Crédito</p>
            <div className="space-y-1 text-[13px]">
              <div className="flex justify-between"><span>Inicial:</span><span className="font-mono">{formatBRL(analysis.moneyDistribution.creditInitial)}</span></div>
              <div className="flex justify-between"><span>Final:</span><span className="font-mono">{formatBRL(analysis.moneyDistribution.creditFinal)}</span></div>
              <div className="flex justify-between text-[var(--orange)] font-bold">
                <span>Crescimento:</span>
                <span className="font-mono">{formatBRL(analysis.moneyDistribution.creditGrowth)} ({analysis.moneyDistribution.creditGrowthPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-2">Taxa de Administração</p>
            <div className="space-y-1 text-[13px]">
              <div className="flex justify-between"><span>Inicial:</span><span className="font-mono">{formatBRL(analysis.moneyDistribution.adminInitial)}</span></div>
              <div className="flex justify-between"><span>Final:</span><span className="font-mono">{formatBRL(analysis.moneyDistribution.adminFinal)}</span></div>
              <div className="flex justify-between text-[var(--orange)] font-bold">
                <span>Crescimento:</span>
                <span className="font-mono">{formatBRL(analysis.moneyDistribution.adminGrowth)} ({analysis.moneyDistribution.adminGrowthPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[12px] text-foreground/60 uppercase font-bold mb-2">Seguro</p>
            <div className="flex justify-between text-[13px]">
              <span>Total:</span>
              <span className="font-mono font-bold">{formatBRL(analysis.moneyDistribution.insuranceTotal)} ({analysis.moneyDistribution.insurancePct.toFixed(3)}%)</span>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. CUSTO EFETIVO DA OPERAÇÃO */}
      <Section id="cost" title="3. Custo Efetivo da Operação">
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between"><span>Custo Explícito:</span><span className="font-mono font-bold">{formatBRL(analysis.effectiveCost.explicit)}</span></div>
          <div className="flex justify-between"><span>% da Carta Inicial:</span><span className="font-mono font-bold">{analysis.effectiveCost.pctOfInitial.toFixed(2)}%</span></div>
          <div className="flex justify-between"><span>% da Carta Atualizada:</span><span className="font-mono font-bold">{analysis.effectiveCost.pctOfFinal.toFixed(2)}%</span></div>
          <div className="flex justify-between"><span>% do Total Pago:</span><span className="font-mono font-bold">{analysis.effectiveCost.pctOfTotalPaid.toFixed(2)}%</span></div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-[12px] text-blue-900">
            {analysis.effectiveCost.interpretation}
          </div>
        </div>
      </Section>

      {/* 4. ONDE ESTÁ O DINHEIRO */}
      <Section id="flow" title="4. Onde Está o Dinheiro">
        <div className="space-y-2">
          {[
            { label: 'Amortização', pct: analysis.moneyFlow.amortizationPct, value: analysis.moneyFlow.amortizationValue },
            { label: 'Taxa Admin', pct: analysis.moneyFlow.adminPct, value: analysis.moneyFlow.adminValue },
            { label: 'Seguro', pct: analysis.moneyFlow.insurancePct, value: analysis.moneyFlow.insuranceValue },
            { label: 'Correção', pct: analysis.moneyFlow.correctionPct, value: analysis.moneyFlow.correctionValue },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-[13px] mb-1">
                <span>{item.label}</span>
                <span className="font-mono font-bold">{item.pct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--orange)] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, item.pct))}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground/60 mt-0.5">{formatBRL(item.value)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. EVOLUÇÃO DE PARCELAS */}
      <Section id="installments" title="5. Evolução de Parcelas">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px]">
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Primeira</p>
            <p className="font-mono font-bold">{formatBRLCents(analysis.installmentEvolution.first)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Última</p>
            <p className="font-mono font-bold">{formatBRLCents(analysis.installmentEvolution.last)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Máxima</p>
            <p className="font-mono font-bold text-[var(--orange)]">{formatBRLCents(analysis.installmentEvolution.max)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Crescimento %</p>
            <p className="font-mono font-bold">{analysis.installmentEvolution.growthPct.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Crescimento R$</p>
            <p className="font-mono font-bold">{formatBRL(analysis.installmentEvolution.growthNominal)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Reajustes</p>
            <p className="font-mono font-bold">{analysis.installmentEvolution.adjustmentCount}</p>
          </div>
        </div>
      </Section>

      {/* 6. EVOLUÇÃO DA CARTA */}
      <Section id="credit" title="6. Evolução da Carta">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px]">
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Inicial</p>
            <p className="font-mono font-bold">{formatBRL(analysis.creditEvolution.initial)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Final</p>
            <p className="font-mono font-bold">{formatBRL(analysis.creditEvolution.final)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Correções</p>
            <p className="font-mono font-bold text-[var(--orange)]">{formatBRL(analysis.creditEvolution.correctionAccum)}</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Crescimento %</p>
            <p className="font-mono font-bold">{analysis.creditEvolution.growthPct.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Crescimento Anual</p>
            <p className="font-mono font-bold">{analysis.creditEvolution.avgAnnualGrowth.toFixed(2)}%</p>
          </div>
        </div>
      </Section>

      {/* 7. EVOLUÇÃO DA TAXA */}
      <Section id="admin" title="7. Evolução da Taxa de Administração">
        <div className="space-y-3 text-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Contratada</p>
              <p className="font-mono font-bold">{analysis.adminEvolution.contracted.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-foreground/60 uppercase text-[11px] font-bold mb-1">Efetiva Projetada</p>
              <p className="font-mono font-bold text-[var(--orange)]">{analysis.adminEvolution.effective.toFixed(2)}%</p>
            </div>
          </div>
          <p className="p-2 bg-blue-50 rounded text-[12px] text-blue-900">
            {analysis.adminEvolution.explanation}
          </p>
        </div>
      </Section>

      {/* 8. INDICADORES TÉCNICOS */}
      <Section id="indicators" title="8. Indicadores Técnicos">
        <div className="space-y-2 text-[13px]">
          {Object.entries(analysis.technicalIndicators).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-foreground/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
              <span className="font-mono font-bold">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 9. INTERPRETAÇÃO AUTOMÁTICA */}
      <Section id="interpretation" title="9. Interpretação Automática">
        <div className="space-y-4">
          {analysis.autoInterpretation.positives.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-[13px] font-bold text-green-700 mb-2">
                <CheckCircle className="w-4 h-4" /> Pontos Positivos
              </p>
              <ul className="space-y-1 text-[12px] ml-6">
                {analysis.autoInterpretation.positives.map((p, i) => (
                  <li key={i} className="list-disc">{p}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.autoInterpretation.attentions.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-[13px] font-bold text-amber-700 mb-2">
                <AlertCircle className="w-4 h-4" /> Pontos de Atenção
              </p>
              <ul className="space-y-1 text-[12px] ml-6">
                {analysis.autoInterpretation.attentions.map((a, i) => (
                  <li key={i} className="list-disc">{a}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.autoInterpretation.risks.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-[13px] font-bold text-red-700 mb-2">
                <AlertTriangle className="w-4 h-4" /> Principais Riscos
              </p>
              <ul className="space-y-1 text-[12px] ml-6">
                {analysis.autoInterpretation.risks.map((r, i) => (
                  <li key={i} className="list-disc">{r}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.autoInterpretation.profile.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-[13px] font-bold text-blue-700 mb-2">
                <TrendingUp className="w-4 h-4" /> Perfil Indicado
              </p>
              <ul className="space-y-1 text-[12px] ml-6">
                {analysis.autoInterpretation.profile.map((p, i) => (
                  <li key={i} className="list-disc">{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
