import React from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const CATEGORIAS = [
  {
    num: "01",
    title: "Raio-X da Proposta",
    desc: "O primeiro filtro, antes de olhar preço.",
    modulos: [
      { slug: "estrutura-do-plano", title: "NUNCA UM CONSÓRCIO FOI EXPLICADO ASSIM", desc: "Explore a memória completa de cálculo do seu plano, mês a mês. Custos, correções, evolução da carta e os números que realmente determinam quanto o seu consórcio custa ao longo do tempo.", cta: "EXPLORAR ESTRUTURA" }
    ]
  },
  {
    num: "02",
    title: "Raio-X do Lance",
    desc: "A matemática por trás da contemplação.",
    modulos: [
      { slug: "estrategia-lance", title: "CARTA OU CATEGORIA?", desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria (crédito + taxas).", cta: "Descobrir resposta" },
      { slug: "#", title: "LANCE EMBUTIDO", desc: "Entenda como o lance embutido funciona, seus limites e quando vale a pena utilizar essa modalidade.", cta: "EM BREVE", isFuture: true },
      { slug: "#", title: "LANCE FIXO - SORTE", desc: "Simule o lance fixo combinado com sorteio para entender as probabilidades de contemplação e quando essa estratégia faz sentido.", cta: "EM BREVE", isFuture: true }
    ]
  },
  {
    num: "03",
    title: "Raio-X da Contemplação",
    desc: "Onde seu lance se encaixa no grupo.",
    modulos: [
      { slug: "zona-contemplacao", title: "ZONA DE CONTEMPLAÇÃO", desc: "O lance não é apenas um valor. É uma posição frente à concorrência. Analise o histórico, o quantitativo de vagas e a pressão do grupo para identificar a sua real zona de contemplação.", cta: "Descobrir minha zona" }
    ]
  },
  {
    num: "04",
    title: "Raio-X da Exclusão",
    desc: "Descubra quanto você realmente perde ao cancelar a cota.",
    modulos: [
      { slug: "custo-cancelamento", title: "CUSTO DE CANCELAMENTO", desc: "Descubra quanto você realmente perde ao cancelar a cota: saldo, taxas e o custo de oportunidade do dinheiro parado.", cta: "Fazer esta análise" },
      { slug: "#", title: "Venda de carta não contemplada", desc: "Entenda o deságio real e as regras para transferir uma cota cancelada ou ativa sem contemplação.", cta: "EM BREVE", isFuture: true }
    ]
  },
  {
    num: "05",
    title: "Raio-X da Alavancagem",
    desc: "Avaliação de ativos e mercado secundário.",
    modulos: [
      { slug: "venda-carta-contemplada", title: "QUANTO VALE SUA CARTA CONTEMPLADA HOJE?", desc: "Simula o valor de venda de uma carta contemplada no mercado secundário com ágio.", cta: "Fazer esta análise" }
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

      {/* HERO */}
      <section id="hero" className="bg-[#0A0A08] text-white pt-6 pb-3 px-6 scroll-mt-20">
        <div className="max-w-[1180px] mx-auto">
          <span className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.16em] uppercase text-[#FF4E1F] mb-2.5 before:content-[''] before:w-[22px] before:h-[2px] before:bg-[#FF4E1F]">
            Raio-X
          </span>
          <h1 className="font-display text-[clamp(1.4rem,3.2vw,2.3rem)] leading-[1.05] max-w-[800px] uppercase">
            48,4% DESISTEM. E A MAIORIA DAS CONTEMPLAÇÕES OCORREM POR LANCE.
          </h1>
          <p className="mt-2 max-w-[500px] text-[13px] leading-[1.5] text-[#C9C4B8]">
            Assinar primeiro. Entender depois. É assim que começam os erros mais caros. Faça as análises antes de decidir.
          </p>
          {/* Botões removidos conforme solicitação */}
        </div>
      </section>

      {/* STAT STRIP - ÍNDICE DE EXCLUSÃO */}
      <section className="bg-[#0A0A08] border-y border-[#2A271F] py-5 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-12">
            <div className="shrink-0 border-l-3 border-[#FF4E1F] pl-4">
              <span className="block text-[9px] font-bold text-[#FF4E1F] uppercase tracking-[0.3em] mb-1">
                Índice de Exclusão
              </span>
              <h3 className="text-white text-[15px] font-semibold uppercase tracking-tight">
                IE 2025 · Banco Central
              </h3>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-between md:justify-end gap-x-12 gap-y-6">
              {[
                { label: "Imóveis", value: "54,5%", total: "3,4 mi" },
                { label: "Automóveis", value: "46,2%", total: "4,6 mi" },
                { label: "Motocicletas", value: "48,2%", total: "3,0 mi" }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="font-mono text-[32px] font-semibold text-[#FFC93C] leading-none">
                    {item.value}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[12px] font-bold text-white uppercase tracking-wider leading-none mb-1.5">
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
          
          <div className="mt-6 pt-4 border-t border-white/5 text-center md:text-left">
            <span className="text-[10px] text-[#79746A] tracking-[0.05em] uppercase font-bold opacity-80">
              Fonte: Banco Central do Brasil · Panorama do Consórcio 2025 · Dados públicos citados. O comportamento passado não garante resultado futuro.
            </span>
          </div>
        </div>
      </section>

      <main id="analises" className="max-w-[1180px] mx-auto px-6">
        {CATEGORIAS.map((cat) => (
          <section key={cat.num} id={`cat-${cat.num}`} className="pt-10 pb-4">
            <div className="flex flex-col gap-4 mb-5">
              <div className="flex items-baseline gap-5">
                <div className="relative shrink-0">
                  <span className="font-mono font-black text-[64px] text-[#FF4E1F] opacity-10 leading-none absolute -left-2 -top-4 select-none">
                    {cat.num}
                  </span>
                  <span className="font-mono font-bold text-[18px] text-white bg-[#0A0A08] px-3.5 py-2 rounded-[2px] relative z-10 shadow-sm">
                    {cat.num}
                  </span>
                </div>
                <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] leading-[1.1] uppercase tracking-tight text-[#0A0A08]">
                  {cat.title}
                </h2>
              </div>
            </div>

            <div className={`grid gap-6 ${cat.modulos.length === 1 ? 'grid-cols-1' : cat.modulos.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {cat.modulos.map((m) => (
                <Link key={m.title} href={m.slug === "#" ? "#" : `/simulador/${m.slug}#parametros`}>
                  <div className={`p-6 md:p-8 flex flex-col h-full transition-all duration-500 group relative min-h-[240px] border border-[#E4DCC9]/40 rounded-sm ${m.isFuture ? 'bg-[#F8F8F6] cursor-default opacity-60' : 'bg-white cursor-pointer hover:bg-[#FFFDF8] hover:border-[#FF4E1F]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-2'}`}>
                    <div className="flex justify-between items-start mb-5">
                      <h3 className={`text-[20px] font-[800] uppercase leading-[1.2] max-w-[28ch] transition-colors ${m.isFuture ? 'text-gray-500' : 'text-[#0A0A08] group-hover:text-[#FF4E1F]'}`}>
                        {m.title}
                      </h3>
                      {m.isFuture && (
                        <span className="bg-[#FFD700] text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                          Em Breve
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-[14px] leading-[1.7] mb-8 flex-grow font-medium ${m.isFuture ? 'text-gray-400' : 'text-[#726C60]/80'}`}>
                      {m.desc}
                    </p>

                    <div className={`mt-auto flex items-center gap-3 font-mono text-[12px] font-bold tracking-[0.08em] uppercase transition-all ${m.isFuture ? 'text-gray-400' : 'text-[#0A0A08] group-hover:text-[#FF4E1F] group-hover:gap-4'}`}>
                      {m.cta}
                      {!m.isFuture && <ArrowRight className="w-4 h-4 transition-all" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* FINAL CTA */}
      <section className="bg-[#0A0A08] text-white py-12 text-center border-t-[4px] border-[#FF4E1F]">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-col items-center">
          <blockquote className="font-display text-[17px] tracking-[0.04em] text-[#8A8578] mb-7 italic opacity-80">
            "O melhor produto financeiro não é aquele que vende mais."
          </blockquote>
          <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] max-w-[720px] mx-auto mb-5 uppercase leading-[1.1] tracking-tight">
            Ainda ficou em dúvida?
          </h2>
          <p className="text-[#C9C4B8] max-w-[560px] mx-auto mb-8 text-[16px] leading-[1.8] font-medium">
            Às vezes o caso é específico demais pra uma régua padrão. Peça uma leitura independente do seu cenário e tome sua decisão com total clareza.
          </p>
          <a href="https://wa.me/5531996952204" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3.5 px-9 py-5 bg-[#FF4E1F] text-[#0A0A08] text-[14px] font-black tracking-[0.08em] uppercase rounded-[2px] hover:bg-[#FFC93C] transition-all duration-300 group shadow-[0_10px_30px_rgba(255,78,31,0.2)] hover:shadow-[0_15px_40px_rgba(255,78,31,0.3)] hover:scale-[1.05]">
            Solicitar análise estratégica
            <ArrowRight className="w-5 h-5 transition-all group-hover:translate-x-2" />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-10 pb-0 bg-[#FAF5EA]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="border border-[#E4DCC9]/60 border-l-[3px] border-l-[#FF4E1F]/60 p-5 bg-white/50 shadow-sm mb-0 rounded-sm">
            <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#FF4E1F]/80 uppercase mb-2 block">
              Aviso legal
            </span>
            <p className="text-[11.5px] leading-[1.6] text-[#726C60]/70 max-w-[850px] font-medium">
              As ferramentas, análises e conteúdos disponibilizados nesta página têm caráter exclusivamente educacional e informativo. Os cálculos são baseados nos dados informados pelo usuário e não constituem recomendação de investimento, consultoria financeira, oferta ou garantia de contemplação futura. Cada administradora tem suas próprias regras — consulte sempre o contrato e o regulamento oficial do grupo antes de decidir.
            </p>
          </div>
          <div className="flex justify-between items-center mt-5 pb-8 border-t border-[#E4DCC9]/40 text-[11px] text-[#726C60]/60 flex-wrap gap-3">
            <span className="font-bold text-[#0A0A08]/40 uppercase tracking-widest">r. Consórcio de verdade.</span>
            <div className="flex gap-6">
              <Link href="/termos" className="transition-colors hover:text-[#FF4E1F]">Termos</Link>
              <Link href="/privacidade" className="transition-colors hover:text-[#FF4E1F]">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
