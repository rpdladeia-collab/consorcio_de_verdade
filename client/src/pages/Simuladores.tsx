
import React from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const CATEGORIAS = [
  {
    num: "01",
    title: "Cabe no seu planejamento?",
    desc: "O primeiro filtro, antes de olhar preço.",
    modulos: [
      { slug: "simule-seu-plano", title: "A PARCELA CABE HOJE. E AMANHÃ?", desc: "O valor que cabe no seu orçamento hoje pode não ser o mesmo daqui a alguns anos. Simule reajustes, seguros e evolução da parcela antes de assumir um compromisso de longo prazo.", cta: "VER A EVOLUÇÃO" },
      { slug: "auto-pagavel", title: "O CONSÓRCIO SE PAGA... OU O SEU DINHEIRO FARIA MAIS EM OUTRO LUGAR?", desc: "O custo de oportunidade revela quanto patrimônio pode deixar de ser construído ao escolher um consórcio.", cta: "COMPARAR CENÁRIOS" },
      { slug: "#", title: "Meia parcela, será?", desc: "A promessa da meia parcela esconde um custo futuro que poucos calculam. Em breve, a análise completa.", cta: "EM BREVE", isFuture: true }
    ]
  },
  {
    num: "02",
    title: "Quanto isso custa, de verdade?",
    desc: "Taxa de administração, seguro, correção — juntos.",
    modulos: [
      { slug: "custo-operacao", title: "Não tem juros, mas tem correção !!", desc: "Calcula taxa de administração, seguro e fundo de reserva juntos — o custo real que o anúncio costuma separar.", cta: "Fazer esta análise" },
      { slug: "proporcao-taxa", title: "Quanto do seu crédito vira taxa?", desc: "Mostra quanto da parcela é efetivamente taxa, e como isso corrói a eficiência do plano ao longo do tempo.", cta: "Descobrir resposta" },
    ]
  },
  {
    num: "03",
    title: "Lance: estratégia ou aposta?",
    desc: "A matemática por trás de ofertar mais.",
    modulos: [
      { slug: "raio-x-do-lance", title: "Seu lance aumenta a chance — ou só queima caixa?", desc: "Projeta o impacto financeiro real da contemplação em diferentes momentos do plano, antes de você ofertar.", cta: "Fazer esta análise" },
      { slug: "lance-carta-x-categoria", title: "Lance na carta ou na categoria? A conta decide", desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria (crédito + taxas).", cta: "Descobrir resposta" },
      { slug: "#", title: "Lance embutido: todos ganham menos você", desc: "O lance embutido pode parecer um facilitador, mas ele altera drasticamente o custo final do seu crédito.", cta: "EM BREVE", isFuture: true }
    ]
  },
  {
    num: "04",
    title: "E se você precisar sair?",
    desc: "O mercado secundário tem preço próprio.",
    modulos: [
      { slug: "custo-cancelamento", title: "Desistir custa mais do que parece", desc: "Descubra quanto você realmente perde ao cancelar a cota: saldo, taxas e o custo de oportunidade do dinheiro parado.", cta: "Fazer esta análise" },
      { slug: "#", title: "Venda de carta não contemplada", desc: "Entenda o deságio real e as regras para transferir uma cota cancelada ou ativa sem contemplação.", cta: "EM BREVE", isFuture: true }
    ]
  },
  {
    num: "05",
    title: "Aqui você ganha",
    desc: "Estratégias de alavancagem e lucro real.",
    modulos: [
      { slug: "venda-carta-contemplada", title: "Quanto vale sua carta contemplada hoje?", desc: "Nesta área vamos tratar de todas as estratégias que geram ganho: alavancagem, venda de carta com ágio, compra de carta, etc.", cta: "Fazer esta análise" }
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
      <section className="bg-[#0A0A08] text-white pt-12 pb-8 px-8">
        <div className="max-w-[1180px] mx-auto">
          <span className="inline-flex items-center gap-2.5 text-[12px] tracking-[0.16em] uppercase text-[#FF4E1F] mb-5 before:content-[''] before:w-[22px] before:h-[2px] before:bg-[#FF4E1F]">
            Raio-X do consórcio · 8 análises sem filtro
          </span>
          <h1 className="font-display text-[clamp(1.8rem,4.2vw,3.2rem)] leading-[1.05] max-w-[800px] uppercase">
            48,6% desistem. Apenas 1 em cada 5 cotas é contemplada por sorteio.
          </h1>
          <p className="mt-4 max-w-[500px] text-[15px] leading-[1.6] text-[#C9C4B8]">
            Assinar primeiro. Entender depois. É assim que começam os erros mais caros. Faça as análises antes de decidir.
          </p>
          <div className="flex flex-wrap gap-3.5 mt-6">
            <a href="#cat-02" className="inline-flex items-center gap-2.5 px-6 py-4 bg-[#FF4E1F] text-[#0A0A08] text-[13px] font-bold tracking-[0.06em] uppercase rounded-[2px] hover:bg-[#FFC93C] transition-all group">
              Começar pelo custo real
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#analises" className="inline-flex items-center gap-2.5 px-6 py-4 border-1.5 border-[#3A362C] text-white text-[13px] font-bold tracking-[0.06em] uppercase rounded-[2px] hover:border-[#FF4E1F] hover:text-[#FF4E1F] transition-all">
              Ver as 8 análises
            </a>
          </div>
        </div>
      </section>

      {/* TICKER / SIGNATURE STAT STRIP - Já reduzido anteriormente */}
      <section className="bg-[#141210] border-y border-[#2A271F]">
        <div className="grid grid-cols-1 md:grid-cols-3 max-w-[1180px] mx-auto">
          <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-[#2A271F]">
            <div className="font-mono text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold text-[#FFC93C]">56,9%</div>
            <div className="text-[14px] font-bold text-white uppercase tracking-tight mb-1">Imóveis</div>
            <div className="text-[13px] text-[#C9C4B8] leading-[1.5] max-w-[340px]">Índice de Exclusão (IE 2024): 2,85 milhões de cotas excluídas.</div>
            <div className="text-[10.5px] text-[#79746A] mt-2.5 tracking-[0.03em]">Fonte: Banco Central · Panorama do Consórcio 2024</div>
          </div>
          <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-[#2A271F]">
            <div className="font-mono text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold text-[#FFC93C]">46,8%</div>
            <div className="text-[14px] font-bold text-white uppercase tracking-tight mb-1">Automóveis</div>
            <div className="text-[13px] text-[#C9C4B8] leading-[1.5] max-w-[340px]">Índice de Exclusão (IE 2024): 4,27 milhões de cotas excluídas.</div>
            <div className="text-[10.5px] text-[#79746A] mt-2.5 tracking-[0.03em]">Fonte: Banco Central · Panorama do Consórcio 2024</div>
          </div>
          <div className="p-5 md:p-6">
            <div className="font-mono text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold text-[#FFC93C]">48,1%</div>
            <div className="text-[14px] font-bold text-white uppercase tracking-tight mb-1">Motocicletas</div>
            <div className="text-[13px] text-[#C9C4B8] leading-[1.5] max-w-[340px]">Índice de Exclusão (IE 2024): 2,84 milhões de cotas excluídas.</div>
            <div className="text-[10.5px] text-[#79746A] mt-2.5 tracking-[0.03em]">Fonte: Banco Central · Panorama do Consórcio 2024</div>
          </div>
        </div>
        <div className="text-center text-[10px] text-[#79746A] tracking-[0.03em] py-2 border-t border-[#2A271F]">
          Dados públicos e citados do Banco Central. Comportamento passado não garante resultado futuro.
        </div>
      </section>

      <main id="analises" className="max-w-[1180px] mx-auto px-8">
        {CATEGORIAS.map((cat) => (
          <section key={cat.num} id={`cat-${cat.num}`} className="pt-10 pb-2">
            <div className="flex items-baseline gap-5 border-b-2 border-[#0A0A08] pb-4 mb-6">
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
            <div className={`grid gap-px bg-[#E4DCC9] border border-[#E4DCC9] mb-8 ${cat.modulos.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {cat.modulos.map((m) => (
                <Link key={m.title} href={m.slug === "#" ? "#" : `/simulador/${m.slug}`}>
                  <div className={`p-6 md:p-7 flex flex-col h-full transition-colors group ${m.isFuture ? 'bg-[#F5F5F5] cursor-default opacity-70' : 'bg-white cursor-pointer hover:bg-[#FFFDF8]'}`}>
                    <div className="flex justify-between items-start mb-3.5">
                      <h3 className={`text-[19px] font-[800] uppercase leading-[1.22] max-w-[32ch] ${m.isFuture ? 'text-gray-500' : 'text-[#0A0A08]'}`}>
                        {m.title}
                      </h3>
                      {m.isFuture && (
                        <span className="bg-[#FFD700] text-black text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                          Em Breve
                        </span>
                      )}
                    </div>
                    <p className={`text-[14.5px] leading-[1.6] mb-4.5 ${m.isFuture ? 'text-gray-400' : 'text-[#726C60]'}`}>
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
      <section className="bg-[#0A0A08] text-white py-12 text-center border-t-[4px] border-[#FF4E1F]">
        <div className="max-w-[1180px] mx-auto px-8">
          <blockquote className="font-display text-[15px] tracking-[0.02em] text-[#8A8578] mb-7">
            "O melhor produto financeiro não é aquele que vende mais."
          </blockquote>
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] max-w-[720px] mx-auto mb-3 uppercase">
            Ainda ficou em dúvida?
          </h2>
          <p className="text-[#C9C4B8] max-w-[520px] mx-auto mb-7 text-[15.5px] leading-[1.6]">
            Às vezes o caso é específico demais pra uma régua padrão. Peça uma leitura independente do seu cenário e tome sua decisão com total clareza.
          </p>
          <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 px-6 py-4 bg-[#FF4E1F] text-[#0A0A08] text-[13px] font-bold tracking-[0.06em] uppercase rounded-[2px] hover:bg-[#FFC93C] transition-all group">
            Solicitar análise estratégica
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* LEGAL / FOOTER - Removido pb e mb excessivos */}
      <footer className="pt-10 pb-0 bg-[#FAF5EA]">
        <div className="max-w-[1180px] mx-auto px-8">
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
