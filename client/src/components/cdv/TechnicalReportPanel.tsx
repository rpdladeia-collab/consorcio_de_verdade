/**
 * Painel de Laudo Técnico Interativo
 * Renderiza os 9 blocos com rastreabilidade matemática completa
 */

import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { TechnicalReportAnalysis } from '../../types/technicalAnalysis';

interface TechnicalReportPanelProps {
  analysis: TechnicalReportAnalysis | null;
  isLoading?: boolean;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const CollapsibleBlock: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-900"
      >
        {title}
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-6 py-4 bg-white">{children}</div>}
    </div>
  );
};

const InfoTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="group relative inline-flex items-center gap-1">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <Info className="w-4 h-4 text-gray-400 cursor-help" />
    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
      {value}
    </div>
  </div>
);

export const TechnicalReportPanel: React.FC<TechnicalReportPanelProps> = ({
  analysis,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhuma análise disponível. Execute o simulador para gerar o laudo.
      </div>
    );
  }

  const {
    executiveSummary,
    moneyEvolution,
    effectiveCost,
    moneyLocation,
    installmentEvolution,
    creditEvolution,
    adminFeeEvolution,
    technicalIndicators,
    mathematicalEvidences,
    indicatorTags,
    glossary,
  } = analysis;

  return (
    <div className="space-y-6 p-6">
      {/* BLOCO 1: VISÃO EXECUTIVA */}
      <CollapsibleBlock title="1. Visão Executiva" defaultOpen>
        <div className="space-y-6">
          {/* Parâmetros */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Parâmetros do Contrato</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Carta de Crédito</p>
                <p className="text-lg font-semibold">{formatCurrency(executiveSummary.parameters.credit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prazo</p>
                <p className="text-lg font-semibold">{executiveSummary.parameters.term} meses</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa Administrativa</p>
                <p className="text-lg font-semibold">{executiveSummary.parameters.adminRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Correção Contratada</p>
                <p className="text-lg font-semibold">{executiveSummary.parameters.correctionRate}% a.a.</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Periodicidade</p>
                <p className="text-lg font-semibold">{executiveSummary.parameters.periodicity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modelo</p>
                <p className="text-lg font-semibold">{executiveSummary.parameters.model}</p>
              </div>
            </div>
          </div>

          {/* Resultados Projetados */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Resultados Projetados</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Carta Final</p>
                <p className="text-lg font-semibold">{formatCurrency(executiveSummary.projectedResults.creditFinal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Crescimento</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(executiveSummary.projectedResults.creditGrowth)}
                  <span className="text-sm text-gray-600 ml-2">
                    ({formatPercent(executiveSummary.projectedResults.creditGrowthPct)})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Primeira Parcela</p>
                <p className="text-lg font-semibold">{formatCurrency(executiveSummary.projectedResults.firstInstallment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Maior Parcela</p>
                <p className="text-lg font-semibold">{formatCurrency(executiveSummary.projectedResults.maxInstallment)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Total Pago</p>
                <p className="text-lg font-semibold">{formatCurrency(executiveSummary.projectedResults.totalPaid)}</p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleBlock>

      {/* BLOCO 2: COMO O DINHEIRO EVOLUI */}
      <CollapsibleBlock title="2. Como o Dinheiro Evolui">
        <div className="space-y-4">
          {[
            moneyEvolution.patrimonialFlow,
            moneyEvolution.remunerationFlow,
            moneyEvolution.protectionFlow,
            moneyEvolution.financialFlow,
          ].map((flow, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">{flow.label}</h5>
              <p className="text-sm text-gray-600 mb-3">{flow.explanation}</p>
              {flow.label !== 'Fluxo de Proteção' && flow.label !== 'Fluxo Financeiro' ? (
                <div className="flex justify-between text-sm">
                  <span>Inicial: {formatCurrency(flow.initial)}</span>
                  <span>→ +{formatCurrency(flow.corrections)}</span>
                  <span>→ Final: {formatCurrency(flow.final)}</span>
                </div>
              ) : (
                <div className="text-sm">
                  {flow.label === 'Fluxo de Proteção' ? (
                    <span>Total: {formatCurrency(flow.total)}</span>
                  ) : (
                    <span>Total: {formatCurrency(flow.totalPaid)}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleBlock>

      {/* BLOCO 3: CUSTO EFETIVO */}
      <CollapsibleBlock title="3. Custo Efetivo da Operação">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 italic">{effectiveCost.definition}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Taxa Administrativa</p>
              <p className="text-lg font-semibold">{formatCurrency(effectiveCost.components.adminFee)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seguro</p>
              <p className="text-lg font-semibold">{formatCurrency(effectiveCost.components.insurance)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Custo Explícito Total</p>
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(effectiveCost.components.total)}</p>
            </div>
          </div>
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Representações:</p>
            <div className="text-sm">
              <p>{formatPercent(effectiveCost.representations.pctOfInitialCredit.value)} {effectiveCost.representations.pctOfInitialCredit.base}</p>
              <p>{formatPercent(effectiveCost.representations.pctOfUpdatedCredit.value)} {effectiveCost.representations.pctOfUpdatedCredit.base}</p>
              <p>{formatPercent(effectiveCost.representations.pctOfTotalPaid.value)} {effectiveCost.representations.pctOfTotalPaid.base}</p>
            </div>
          </div>
        </div>
      </CollapsibleBlock>

      {/* BLOCO 4: ONDE ESTÁ O DINHEIRO */}
      <CollapsibleBlock title="4. Onde está o Dinheiro">
        <div className="space-y-4">
          {[
            moneyLocation.patrimony,
            moneyLocation.adminRemuneration,
            moneyLocation.insurance,
            moneyLocation.monetaryUpdate,
          ].map((component, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-gray-900">{component.label}</h5>
                <span className="text-sm font-semibold text-orange-600">{formatPercent(component.percentage)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{component.explanation}</p>
              <p className="text-sm">
                <span className="font-semibold">{formatCurrency(component.value)}</span>
                <span className="text-gray-600 ml-2">({component.base})</span>
              </p>
            </div>
          ))}
        </div>
      </CollapsibleBlock>

      {/* BLOCO 5: EVOLUÇÃO DA PARCELA */}
      <CollapsibleBlock title="5. Evolução da Parcela">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Primeira Parcela</p>
              <p className="text-lg font-semibold">{formatCurrency(installmentEvolution.first)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maior Parcela</p>
              <p className="text-lg font-semibold">{formatCurrency(installmentEvolution.max)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Parcela</p>
              <p className="text-lg font-semibold">{formatCurrency(installmentEvolution.last)}</p>
            </div>
              <div>
                <p className="text-sm text-gray-600">Crescimento %</p>
                <p className="text-lg font-semibold">{formatPercent(installmentEvolution.growthPct)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Crescimento Absoluto</p>
                <p className="text-lg font-semibold">{formatCurrency(installmentEvolution.growthNominal)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Reajustes</p>
                <p className="text-lg font-semibold">{installmentEvolution.adjustmentCount}</p>
              </div>
            <div className="col-span-2 p-3 bg-blue-50 rounded">
              <p className="text-sm font-semibold text-blue-900">{installmentEvolution.intuitiveRatio}</p>
            </div>
          </div>
        </div>
      </CollapsibleBlock>

      {/* BLOCO 6: EVOLUÇÃO DA CARTA */}
      <CollapsibleBlock title="6. Evolução da Carta">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Carta Inicial</p>
              <p className="text-lg font-semibold">{formatCurrency(creditEvolution.initial)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Atualizações Acumuladas</p>
              <p className="text-lg font-semibold">{formatCurrency(creditEvolution.monetaryUpdatesAccum)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carta Final</p>
              <p className="text-lg font-semibold">{formatCurrency(creditEvolution.final)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Crescimento %</p>
              <p className="text-lg font-semibold">{formatPercent(creditEvolution.growthPct)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Crescimento Nominal</p>
              <p className="text-lg font-semibold">{formatCurrency(creditEvolution.growthNominal)}</p>
            </div>
          </div>
        </div>
      </CollapsibleBlock>

      {/* BLOCO 7: EVOLUÇÃO DA TAXA */}
      <CollapsibleBlock title="7. Evolução da Taxa">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 italic">{adminFeeEvolution.explanation}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Taxa Contratada</p>
              <p className="text-lg font-semibold">{adminFeeEvolution.contractedRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Inicial</p>
              <p className="text-lg font-semibold">{formatCurrency(adminFeeEvolution.initialFinancialValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correções</p>
              <p className="text-lg font-semibold">{formatCurrency(adminFeeEvolution.financialCorrections)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Final</p>
              <p className="text-lg font-semibold">{formatCurrency(adminFeeEvolution.finalFinancialValue)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Aumento Financeiro</p>
              <p className="text-lg font-semibold">
                {formatCurrency(adminFeeEvolution.financialIncrease)}
                <span className="text-sm text-gray-600 ml-2">({formatPercent(adminFeeEvolution.financialIncreasePct)})</span>
              </p>
            </div>
          </div>
        </div>
      </CollapsibleBlock>

      {/* BLOCO 8: INDICADORES TÉCNICOS */}
      <CollapsibleBlock title="8. Indicadores Técnicos">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Prazo</p>
            <p className="text-lg font-semibold">{technicalIndicators.term}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Correção Contratada</p>
            <p className="text-lg font-semibold">{technicalIndicators.correctionContracted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Seguro Contratado</p>
            <p className="text-lg font-semibold">{technicalIndicators.insuranceContracted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taxa Administrativa</p>
            <p className="text-lg font-semibold">{technicalIndicators.adminRate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Periodicidade</p>
            <p className="text-lg font-semibold">{technicalIndicators.periodicity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Modelo</p>
            <p className="text-lg font-semibold">{technicalIndicators.model}</p>
          </div>
        </div>
      </CollapsibleBlock>

      {/* BLOCO 9: EVIDÊNCIAS MATEMÁTICAS */}
      <CollapsibleBlock title="9. Evidências Matemáticas">
        <div className="space-y-4">
          {mathematicalEvidences.map((evidence, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Fato</p>
                  <p className="text-sm font-semibold text-gray-900">{evidence.fact}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Motivo</p>
                  <p className="text-sm text-gray-700">{evidence.reason}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Consequência</p>
                  <p className="text-sm text-gray-700">{evidence.consequence}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Origem</p>
                  <p className="text-sm text-gray-600 italic">{evidence.origin}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleBlock>

      {/* GLOSSÁRIO */}
      <CollapsibleBlock title="Glossário de Termos Técnicos">
        <div className="space-y-4">
          {glossary.map((term, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">{term.term}</h5>
              <p className="text-sm text-gray-700 mb-2">{term.definition}</p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Como é calculado:</span> {term.howCalculated}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Onde aparece:</span> {term.whereAppears}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleBlock>
    </div>
  );
};
