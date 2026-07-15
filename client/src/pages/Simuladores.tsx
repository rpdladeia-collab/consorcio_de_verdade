
import React from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const CATEGORIAS = [
  {
    num: "01",
    title: "Raio-X do Consórcio",
    desc: "O primeiro filtro, antes de olhar preço.",
    modulos: [
      { slug: "estrutura-do-plano", title: "NUNCA UM CONSÓRCIO FOI EXPLICADO ASSIM", desc: "Explore a memória completa de cálculo do seu plano, mês a mês. Custos, correções, evolução da carta e indicadores que normalmente permanecem escondidos do consumidor.", cta: "EXPLORAR ESTRUTURA" }
    ]
  },
  {
    num: "02",
    title: "Quanto do seu crédito vira taxa?",
    desc: "Mostra quanto da parcela é efetivamente taxa, e como isso corrói a eficiência do plano ao longo do tempo.",
    modulos: [
      { slug: "proporcao-taxa", title: "EFICIÊNCIA DA TAXA", desc: "Mostra quanto da parcela é efetivamente taxa, e como isso corrói a eficiência do plano ao longo do tempo.", cta: "Descobrir resposta" },
    ]
  },
  {
    num: "03",
    title: "Lance na carta ou na categoria? A conta decide",
    desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria.",
    modulos: [
      { slug: "lance-carta-x-categoria", title: "ESTRATÉGIA DE LANCE", desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria (crédito + taxas).", cta: "Descobrir resposta" },
    ]
  },
  {
    num: "04",
    title: "Desistir custa mais do que parece",
    desc: "Descubra quanto você realmente perde ao cancelar a cota: saldo, taxas e multas.",
    modulos: [
      { slug: "custo-cancelamento", title: "CUSTO DE CANCELAMENTO", desc: "Descubra quanto você realmente perde ao cancelar a cota: saldo, taxas e o custo de oportunidade do dinheiro parado.", cta: "Fazer esta análise" },
      { slug: "#", title: "Venda de carta não contemplada", desc: "Entenda o deságio real e as regras para transferir uma cota cancelada ou ativa sem contemplação.", cta: "EM BREVE", isFuture: true }
    ]
  },
  {
    num: "05",
    title: "Quanto vale sua carta contemplada hoje?",
    desc: "Simula o valor de venda de uma carta contemplada no mercado secundário com ágio.",
    modulos: [
      { slug: "venda-carta-contemplada", title: "AVALIAÇÃO DE ATIVO", desc: "Simula o valor de venda de uma carta contemplada no mercado secundário com ágio.", cta: "Fazer esta análise" }
    ]
  }
];

export default function Simuladores() {
  return (
    <div className="min-h-screen bg-[#FAF5EA] text-[#1C1A16] font-sans selection:bg-[#FF4E1F] selection:text-white">
      {/* Google Fonts Import via style tag for React */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@500;600&display=swap');
          .font-display { font-family: 'Archivo Black', sans-serif; }
          .font-mono { font-family: 'IBM Plex Mono', monospace; }
        `}
      </style>

      {/* HERO - Reduzido py de 24 para 12 */}
      <section id="hero" className="bg-[#0A0A08] text-white pt-10 pb-6 px-6 scroll-mt-20">
        <div className="max-w-[1180px] mx-auto">
          <span className="inline-flex items-center gap-2.5 text-[12px] tracking-[0.16em] uppercase text-[#FF4E1F] mb-4 before:content-[''] before:w-[22px] before:h-[2px] before:bg-[#FF4E1F]">
            Raio-X · 7 análises sem filtro
          </span>
          <h1 className="font-display text-[clamp(1.8rem,4.2vw,3.2rem)] leading-[1.05] max-w-[800px] uppercase">
            48,6% desistem. Apenas 1 em cada 5 cotas é contemplada por sorteio.
          </h1>
          <p className="mt-3 max-w-[500px] text-[15px] leading-[1.6] text-[#C9C4B8]">
            Assinar primeiro. Entender depois. É assim que começam os erros mais caros. Faça as análises antes de decidir.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a href="#cat-02" className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#FF4E1F] text-[#0A0A08] text-[13px] font-bold tracking-[0.06em] uppercase rounded-[2px] hover:bg-[#FFC93C] transition-all group">
              Começar pelo custo real
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#analises" className="inline-flex items-center gap-2.5 px-5 py-3 border-1.5 border-[#3A362C] text-white text-[13px] font-bold tracking-[0.06em] uppercase rounded-[2px] hover:border-[#FF4E1F] hover:text-[#FF4E1F] transition-all">
              Ver as 7 análises
            </a>
          </div>
        </div>
      </section>

      {/* STAT STRIP - ÍNDICE DE EXCLUSÃO (Horizontal & Clean) */}
      <section className="bg-[#0A0A08] border-y border-[#2A271F] py-6 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
            {/* Título / Selo */}
            <div className="shrink-0 border-l-2 border-[#FF4E1F] pl-4">
              <span className="block text-[10px] font-bold text-[#FF4E1F] uppercase tracking-[0.25em] mb-0.5">
                Índice de Exclusão
              </span>
              <h3 className="text-white text-[14px] font-semibold uppercase tracking-tight">
                IE 2024 · Banco Central
              </h3>
            </div>

            {/* Valores Horizontais */}
            <div className="flex flex-1 flex-wrap items-center justify-between md:justify-end gap-x-10 gap-y-6">
              {[
                { label: "Imóveis", value: "56,9%", total: "2,85 mi" },
                { label: "Automóveis", value: "46,8%", total: "4,27 mi" },
                { label: "Motocicletas", value: "48,1%", total: "2,84 mi" }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="font-mono text-[28px] font-semibold text-[#FFC93C] leading-none">
                    {item.value}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[12px] font-bold text-white uppercase tracking-wider leading-none mb-1">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-[#79746A] font-bold uppercase tracking-widest leading-none">
                      {item.total} cotas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fonte única em baixo */}
          <div className="mt-8 pt-3 border-t border-white/5 text-center md:text-left">
            <span className="text-[10px] text-[#79746A] tracking-[0.05em] uppercase font-bold opacity-80">
              Fonte: Banco Central do Brasil · Panorama do Consórcio 2024 · Dados públicos citados. O comportamento passado não garante resultado futuro.
            </span>
          </div>
        </div>
      </section>

      <main id="analises" className="max-w-[1180px] mx-auto px-6">
        {CATEGORIAS.map((cat) => (
          <section key={cat.num} id={`cat-${cat.num}`} className="pt-8 pb-2">
            <div className="flex items-baseline gap-5 border-b-2 border-[#0A0A08] pb-3 mb-4">
              <span className="font-mono font-semibold text-[15px] text-white bg-[#0A0A08] px-2.5 py-1 rounded-[2px]">
                {cat.num}
              </span>
              <h2 className="font-display text-[clamp(1.3rem,2.6vw,1.85rem)] leading-[1.1] uppercase">
                {cat.title}
              </h2>
              <span className="hidden md:block ml-auto text-[14px] text-[#726C60] max-w-[260px] text-right">
                {cat.desc}
              </span>
            </div>
            <div className={`grid gap-px bg-[#E4DCC9] border border-[#E4DCC9] mb-6 ${cat.modulos.length === 1 ? 'grid-cols-1' : cat.modulos.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {cat.modulos.map((m) => (
                <Link key={m.title} href={m.slug === "#" ? "#" : `/simulador/${m.slug}#parametros`}>
                  <div className={`p-5 md:p-6 flex flex-col h-full transition-colors group relative ${m.isFuture ? 'bg-[#F5F5F5] cursor-default opacity-70' : 'bg-white cursor-pointer hover:bg-[#FFFDF8]'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`text-[19px] font-[800] uppercase leading-[1.22] max-w-[32ch] ${m.isFuture ? 'text-gray-500' : 'text-[#0A0A08]'}`}>
                        {m.title}
                      </h3>
                      {m.isFuture && (
                        <span className="bg-[#FFD700] text-black text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                          Em Breve
                        </span>
                      )}
                    </div>
                    <p className={`text-[14.5px] leading-[1.6] mb-3.5 ${m.isFuture ? 'text-gray-400' : 'text-[#726C60]'}`}>
                      {m.desc}
                    </p>
                    <div className={`mt-auto flex items-center gap-2 font-mono text-[11.5px] font-semibold tracking-[0.05em] uppercase ${m.isFuture ? 'text-gray-400' : 'text-[#0A0A08] group-hover:text-[#D93E14]'}`}>
                      {m.cta}
                      {!m.isFuture && <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* FINAL CTA - Reduzido py de 24 para 12 */}
      <section className="bg-[#0A0A08] text-white py-10 text-center border-t-[4px] border-[#FF4E1F]">
        <div className="max-w-[1180px] mx-auto px-6">
          <blockquote className="font-display text-[15px] tracking-[0.02em] text-[#8A8578] mb-5">
            "O melhor produto financeiro não é aquele que vende mais."
          </blockquote>
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] max-w-[720px] mx-auto mb-3 uppercase">
            Ainda ficou em dúvida?
          </h2>
          <p className="text-[#C9C4B8] max-w-[520px] mx-auto mb-5 text-[15.5px] leading-[1.6]">
            Às vezes o caso é específico demais pra uma régua padrão. Peça uma leitura independente do seu cenário e tome sua decisão com total clareza.
          </p>
          <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#FF4E1F] text-[#0A0A08] text-[13px] font-bold tracking-[0.06em] uppercase rounded-[2px] hover:bg-[#FFC93C] transition-all group">
            Solicitar análise estratégica
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* LEGAL / FOOTER - Removido pb e mb excessivos */}
      <footer className="pt-8 pb-0 bg-[#FAF5EA]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="border border-[#E4DCC9] border-l-[4px] border-l-[#FF4E1F] p-6 bg-white shadow-sm mb-0">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[#D93E14] uppercase mb-2.5 block">
              Aviso legal
            </span>
            <p className="text-[12.5px] leading-[1.7] text-[#726C60] max-w-[820px]">
              As ferramentas, análises e conteúdos disponibilizados nesta página têm caráter exclusivamente educacional e informativo. Os cálculos são baseados nos dados informados pelo usuário e não constituem recomendação de investimento, consultoria financeira, oferta ou garantia de contemplação futura. Cada administradora tem suas próprias regras — consulte sempre o contrato e o regulamento oficial do grupo antes de decidir.
            </p>
          </div>
          <div className="flex justify-between items-center mt-4 pb-8 border-t border-[#E4DCC9] text-[12px] text-[#726C60] flex-wrap gap-3">
            <span className="font-bold">r. Consórcio de verdade.</span>
            <div className="flex gap-4">
              <Link href="/termos" className="hover:text-[#FF4E1F]">Termos</Link>
              <Link href="/privacidade" className="hover:text-[#FF4E1F]">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
