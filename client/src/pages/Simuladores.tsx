import React from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  HelpCircle, 
  TrendingUp, 
  BarChart3, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  PieChart, 
  Scale, 
  DollarSign 
} from 'lucide-react';
import { BRAND } from '../lib/brand';

const CATEGORIAS = [
  {
    pergunta: "Essa operação cabe no meu planejamento?",
    modulos: [
      { num: 1, slug: "simule-seu-plano", title: "Essa parcela continua cabendo daqui a alguns anos?", desc: "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.", icon: <Clock />, btn: "Responder essa dúvida", destaque: true },
      { num: 6, slug: "auto-pagavel", title: "Essa operação realmente se paga?", desc: "Verifica se a carta de crédito é capaz de se pagar com rendimento após a contemplação.", icon: <ShieldCheck />, btn: "Descobrir resposta" }
    ]
  },
  {
    pergunta: "Quanto essa operação realmente vai custar?",
    modulos: [
      { num: 3, slug: "custo-operacao", title: "Quanto esse consórcio realmente vai me custar?", desc: "Calcula o custo real do consórcio: taxa de administração, seguro e fundo de reserva.", icon: <Calculator />, btn: "Fazer esta análise", destaque: true },
      { num: 4, slug: "proporcao-taxa", title: "Quanto do crédito contratado realmente chega até você?", desc: "Mostra quanto da parcela é taxa e como isso degrada a eficiência ao longo do tempo.", icon: <PieChart />, btn: "Descobrir resposta" },
      { num: 5, slug: "historico-correcoes", title: "Quanto a correção pode aumentar sua dívida?", desc: "Analisa o impacto dos reajustes históricos sobre o saldo devedor e a carta de crédito.", icon: <TrendingUp />, btn: "Fazer esta análise" }
    ]
  },
  {
    pergunta: "Qual é minha chance real de contemplação?",
    modulos: [
      { num: 2, slug: "raio-x-do-lance", title: "Esse lance realmente aumenta minhas chances?", desc: "Projeta o impacto financeiro da contemplação em diferentes momentos do plano.", icon: <BarChart3 />, btn: "Fazer esta análise", destaque: true },
      { num: 7, slug: "lance-carta-x-categoria", title: "Lance sobre Carta vs Categoria", desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria (crédito + taxas).", icon: <Scale />, btn: "Descobrir resposta" }
    ]
  },
  {
    pergunta: "Mercado secundário",
    modulos: [
      { num: 8, slug: "venda-carta-contemplada", title: "Venda de Carta Contemplada", desc: "Simule o valor de venda de uma carta de crédito contemplada, considerando o saldo devedor, taxa de repasse e outros fatores.", icon: <DollarSign />, btn: "Fazer esta análise" },
      { num: 9, slug: "custo-cancelamento", title: "Custo de Cancelamento", desc: "Descubra quanto você realmente perde ao desistir da sua cota e o custo de oportunidade do dinheiro parado.", icon: <TrendingUp />, btn: "Fazer esta análise" }
    ]
  }
];

export default function Simuladores() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[var(--ink)]">
      {/* ── HERO ULTRA COMPACTO ────────────────────────────────────── */}
      <header className="pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] text-[9px] font-bold uppercase tracking-widest mb-3 border border-[var(--orange)]/20">
            8 perguntas fundamentais
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-bold tracking-tight mb-2 leading-tight">
            As decisões mais caras normalmente começam com <br className="hidden md:block" />
            <span className="text-[var(--orange)]">perguntas que ninguém fez.</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--ink)]/60 max-w-xl mx-auto font-medium">
            Antes de assinar, descubra o que pode dar errado. Cada análise abaixo responde uma dúvida real.
          </p>
        </div>
      </header>



      {/* ── GRUPOS DE ANÁLISE ULTRA COMPACTOS ───────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-8 space-y-8">
        {CATEGORIAS.map((cat, idx) => (
          <section key={idx} className="animate-fade-in">
            <h3 className="font-serif text-lg md:text-xl font-bold text-[var(--ink)] mb-4 pl-3 border-l-4 border-[var(--orange)] flex items-center min-h-[30px]">
              {cat.pergunta}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.modulos.map((m) => (
                <Link
                  key={m.slug}
                  href={`/simulador/${m.slug}`}
                  id={`simulador-${m.num}`}
                  className={`group flex flex-col rounded-xl border border-[var(--orange)]/30 transition-all p-4 ${
                    m.destaque 
                    ? "bg-white shadow-md z-10 border-[var(--orange)]/50" 
                    : "bg-white/50 hover:bg-white hover:border-[var(--orange)]/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${m.destaque ? "bg-[var(--orange)] text-white" : "bg-[var(--orange)]/5 text-[var(--orange)]"}`}>
                      {React.cloneElement(m.icon as React.ReactElement, { className: "w-4 h-4" })}
                    </div>
                    <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/30">
                      Análise {m.num < 10 ? `0${m.num}` : m.num}
                    </span>
                  </div>

                  <h4 className="font-serif text-sm md:text-base font-bold leading-tight mb-2 text-[var(--ink)]">
                    {m.title}
                  </h4>

                  <p className="text-[11px] text-[var(--ink)]/60 leading-relaxed mb-4 flex-1 font-medium">
                    {m.desc}
                  </p>

                  <div className="mt-auto inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--orange)]">
                    {m.btn}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── CTA FINAL EDITORIAL OFF-WHITE ────────────────────────────── */}
      <section className="w-full bg-[var(--paper)] py-12 px-4 text-center text-[var(--ink)] mt-10 border-t border-[var(--ink)]/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Ainda ficou em dúvida?</h2>
          <p className="text-[var(--ink)]/60 text-sm md:text-base mb-8 max-w-2xl mx-auto font-medium">
            Os simuladores ajudam a entender a operação. Uma análise individual independente ajuda a decidir se ela realmente faz sentido para o seu caso.
          </p>
          <a
            href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg"
          >
            Solicitar análise estratégica
          </a>
          
          <div className="mt-12 pt-8 border-t border-[var(--ink)]/10">
            <p className="text-[var(--ink)]/40 font-serif italic text-sm md:text-base leading-relaxed font-medium">
              "O melhor produto financeiro não é aquele que vende mais.<br />
              É aquele que faz mais sentido para você."
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
