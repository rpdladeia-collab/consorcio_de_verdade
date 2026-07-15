/**
 * Painel de Glossário
 * Define 14 termos técnicos de consórcio com definição, cálculo e localização
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

const GLOSSARY_TERMS = [
  {
    term: 'Carta de Crédito',
    definition: 'O valor máximo que você pode financiar através do consórcio. É o bem que você deseja adquirir.',
    calculation: 'Valor inicial informado no simulador',
    location: 'Bloco 1 (Visão Executiva)',
  },
  {
    term: 'Saldo Devedor',
    definition: 'O valor que você ainda deve pagar ao consórcio. Diminui conforme você paga as parcelas (amortização).',
    calculation: 'Carta Inicial - Amortizações Acumuladas',
    location: 'Bloco 2 (Como o Dinheiro Evolui)',
  },
  {
    term: 'Correção (INCC)',
    definition: 'Atualização do valor da carta de crédito conforme um índice de inflação (ex: INCC). Não é taxa, apenas atualiza o patrimônio.',
    calculation: 'Carta × (1 + Taxa Anual)^(Anos)',
    location: 'Bloco 2 (Fluxo Patrimonial)',
  },
  {
    term: 'Taxa de Administração',
    definition: 'Valor cobrado pela administradora pela gestão do consórcio. Calculado como percentual sobre a carta e atualizado conforme correções.',
    calculation: 'Carta Inicial × Taxa % + Correções Anuais',
    location: 'Bloco 3 (Custo Efetivo)',
  },
  {
    term: 'Amortização',
    definition: 'A redução real da dívida. É a parte da parcela que efetivamente diminui o saldo devedor.',
    calculation: 'Parcela - Taxa - Seguro - Atualização',
    location: 'Bloco 4 (Onde está o Dinheiro)',
  },
  {
    term: 'Fundo Comum',
    definition: 'Parcela da mensalidade destinada à compra do bem (amortização). Acumula-se até contemplação ou resgate.',
    calculation: 'Soma das Amortizações Mensais',
    location: 'Bloco 4 (Patrimônio)',
  },
  {
    term: 'Fundo de Reserva',
    definition: 'Contribuição para manutenção da saúde financeira do grupo. Serve como garantia em caso de inadimplência de membros.',
    calculation: 'Reserva % × Carta Inicial',
    location: 'Bloco 3 (Custo Efetivo)',
  },
  {
    term: 'Seguro',
    definition: 'Proteção mensal que cobre o consorciado em caso de morte ou invalidez, protegendo também a administradora.',
    calculation: 'Seguro % × Saldo Devedor (mensal)',
    location: 'Bloco 4 (Seguro)',
  },
  {
    term: 'Correção Anual',
    definition: 'Percentual de reajuste aplicado anualmente à carta de crédito e seus componentes (taxa, fundo, reserva).',
    calculation: 'Informado no simulador (ex: 5% a.a.)',
    location: 'Bloco 1 (Parâmetros)',
  },
  {
    term: 'Atualização Monetária',
    definition: 'Processo de ajuste de valores conforme inflação. Diferencia-se de taxa porque apenas atualiza o patrimônio.',
    calculation: 'Carta × (1 + INCC)^(Período)',
    location: 'Bloco 6 (Evolução da Carta)',
  },
  {
    term: 'Indexação',
    definition: 'Vinculação de um valor a um índice econômico (INCC, IPCA, etc). A carta é indexada ao índice de correção.',
    calculation: 'Aplicação periódica da taxa de correção',
    location: 'Bloco 1 (Parâmetros)',
  },
  {
    term: 'Total Pago',
    definition: 'Soma nominal de todas as parcelas pagas ao longo de todo o contrato.',
    calculation: 'Soma de Parcelas Mensais (120 meses)',
    location: 'Bloco 1 (Resultados)',
  },
  {
    term: 'Carta Atualizada',
    definition: 'Valor estimado da carta após todas as correções monetárias aplicadas até o final do contrato.',
    calculation: 'Carta Inicial × (1 + INCC)^(Prazo em Anos)',
    location: 'Bloco 6 (Evolução da Carta)',
  },
  {
    term: 'Custo Explícito',
    definition: 'Soma de todos os custos efetivamente pagos: taxa de administração + seguro. Não inclui correção monetária.',
    calculation: 'Taxa Total + Seguro Total',
    location: 'Bloco 3 (Custo Efetivo)',
  },
];

interface Props {
  isOpen?: boolean;
}

export function GlossaryPanel({ isOpen = false }: Props) {
  const [expandedTerms, setExpandedTerms] = React.useState<Record<string, boolean>>({});
  const [allOpen, setAllOpen] = React.useState(isOpen);

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => ({ ...prev, [term]: !prev[term] }));
  };

  const toggleAll = () => {
    const newState = !allOpen;
    setAllOpen(newState);
    const newTerms: Record<string, boolean> = {};
    GLOSSARY_TERMS.forEach(t => {
      newTerms[t.term] = newState;
    });
    setExpandedTerms(newTerms);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-[14px] md:text-[15px] text-foreground uppercase tracking-wide">
          Glossário de Termos Técnicos
        </h3>
        <button
          onClick={toggleAll}
          className="text-[12px] font-bold text-[var(--orange)] hover:opacity-70 transition-opacity"
        >
          {allOpen ? 'Fechar tudo' : 'Abrir tudo'}
        </button>
      </div>

      <div className="bg-background border-t border-border divide-y divide-border">
        {GLOSSARY_TERMS.map((item, idx) => (
          <div key={idx}>
            <button
              onClick={() => toggleTerm(item.term)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary transition-colors text-left"
            >
              <span className="font-bold text-[13px] md:text-[14px] text-foreground">{item.term}</span>
              <ChevronDown
                className={`w-4 h-4 text-foreground/40 transition-transform flex-shrink-0 ${
                  expandedTerms[item.term] ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedTerms[item.term] && (
              <div className="px-4 py-3 bg-secondary/30 border-t border-border/50 space-y-2">
                <div>
                  <p className="text-[11px] md:text-[12px] font-semibold text-foreground/60 uppercase tracking-wider">Definição</p>
                  <p className="text-[12px] md:text-[13px] text-foreground/80 leading-relaxed">{item.definition}</p>
                </div>
                <div>
                  <p className="text-[11px] md:text-[12px] font-semibold text-foreground/60 uppercase tracking-wider">Como é Calculado</p>
                  <p className="text-[12px] md:text-[13px] font-mono text-foreground/80 leading-relaxed">{item.calculation}</p>
                </div>
                <div>
                  <p className="text-[11px] md:text-[12px] font-semibold text-foreground/60 uppercase tracking-wider">Localização</p>
                  <p className="text-[12px] md:text-[13px] text-[var(--orange)] font-semibold">{item.location}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
