import { Link } from "wouter";
import { BRAND } from "@/lib/brand";

// ─── Seção 1: Hero ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="hero" className="bg-white py-10 md:py-12 border-b border-[var(--ink)]/10 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Coluna de texto */}
          <div className="flex-1">
            <span className="inline-block text-[14px] md:text-[15px] font-semibold tracking-widest uppercase text-[var(--orange)] border border-[var(--orange)] rounded-full px-3 py-1 mb-2">
              Consórcio não é para todo mundo
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--ink)] leading-tight mb-3">
              Antes de contratar um consórcio,{" "}
              <span className="text-[var(--orange)] text-[inherit] font-[inherit]">faça a conta.</span>
            </h1>
            <p className="text-[14px] md:text-[15px] text-gray-800 leading-relaxed mb-2.5 max-w-xl">
              <strong>Os simuladores mostram os números. A análise individual responde uma pergunta ainda mais importante: o consórcio é realmente a melhor estratégia para o seu caso?</strong>
            </p>
            <p className="text-[14px] md:text-[15px] text-gray-800 leading-relaxed mb-2 max-w-xl">
              Aqui você simula custos, lance, contemplação, correções e capacidade real de pagamento — antes de assinar o contrato.
            </p>
            <div className="flex flex-wrap gap-2.5 mb-3">
              <a href="/simuladores">
                <button className="bg-[var(--orange)] text-white text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all">
                  Usar simuladores gratuitamente →
                </button>
              </a>
              <a
                href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="border border-[var(--ink)] text-[var(--ink)] text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:bg-[var(--ink)] hover:text-white active:scale-95 transition-all">
                  Pedir análise individual
                </button>
              </a>
            </div>
            <p className="text-[14px] md:text-[15px] text-gray-700 font-medium">
              Simulações gratuitas. Dados claros. Decisão com mais consciência.
            </p>
          </div>


        </div>
      </div>
    </section>
  );
}

// ─── Seção 2: Bloco de Consciência ───────────────────────────────────────────
function ConscienciaSection() {
  return (
    <section id="consciencia" className="bg-[var(--orange)] py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-white/70 mb-2 font-semibold">
          Por que simular antes de contratar
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight">
          Consórcio não é golpe. Mas também não é mágica.
        </h2>

        <div className="flex flex-col md:flex-row gap-6 mb-2">
          <div className="flex-1">
            <p className="text-[14px] md:text-[15px] leading-relaxed text-white/90 max-w-2xl">
              Antes de contratar: existem quatro pontos que mudam completamente a decisão.
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-white mr-3 font-bold text-lg leading-none">•</span>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-white font-medium">
              Sem juros não significa sem custo.
            </p>
          </li>
          <li className="flex items-start">
            <span className="text-white mr-3 font-bold text-lg leading-none">•</span>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-white font-medium">
              Parcela baixa pode esconder esforço futuro.
            </p>
          </li>
          <li className="flex items-start">
            <span className="text-white mr-3 font-bold text-lg leading-none">•</span>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-white font-medium">
              Lance não é garantia. É disputa.
            </p>
          </li>
          <li className="flex items-start">
            <span className="text-white mr-3 font-bold text-lg leading-none">•</span>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-white font-medium">
              Contemplação não resolve tudo.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

// ─── Seção 3: Raio-X ────────────────────────────────────────────────────────────
function RaioXSection() {
  const cards = [
    {
      name: "NUNCA UM CONSÓRCIO FOI EXPLICADO ASSIM",
      call: "Raio-X do Consórcio",
      text: "Explore a memória completa de cálculo do seu plano, mês a mês. Custos, correções e indicadores.",
      href: "/simuladores#cat-01",
    },
    {
      name: "CARTA OU CATEGORIA?",
      call: "Raio-X do Lance",
      text: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria.",
      href: "/simuladores#cat-02",
    },
    {
      name: "DESCUBRA QUANTO VOCÊ REALMENTE PERDE AO CANCELAR",
      call: "Raio-X da Exclusão",
      text: "Simule saldo, taxas e o custo de oportunidade do dinheiro parado ao desistir.",
      href: "/simuladores#cat-03",
    },
    {
      name: "AVALIAÇÃO DE ATIVO E MERCADO SECUNDÁRIO",
      call: "Raio-X da Alavancagem",
      text: "Simula o valor de venda de uma carta contemplada no mercado secundário com ágio.",
      href: "/simuladores#cat-04",
    },
  ];

  return (
    <section id="raio-x" className="bg-[var(--paper)] py-12 md:py-14 border-t border-[var(--ink)]/10 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          Raio-X
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-3 leading-tight">
          A proposta cabe no bolso. <br className="hidden md:block" /> Mas o contrato cabe na vida?
        </h2>
        <p className="text-[14px] md:text-[15px] text-gray-800 mb-8 max-w-2xl">
          Cada simulador responde uma pergunta que normalmente só aparece depois da assinatura do contrato. Descubra essas respostas antes de decidir.
        </p>

        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          O QUE VOCÊ PRECISA SABER
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {cards.map((c) => (
            <Link key={c.name} href={c.href}>
              <div className="group bg-white border border-[var(--ink)]/10 rounded-lg p-5 hover:border-[var(--orange)] hover:shadow-md hover:scale-105 transition-all cursor-pointer h-full flex flex-col min-h-[180px]">
                <p className="text-[14px] md:text-[15px] font-bold text-[var(--ink)] mb-2 leading-tight uppercase">{c.name}</p>
                <p className="text-[10px] text-[var(--orange)] font-bold uppercase tracking-tighter mb-2">
                  {c.call}
                </p>
                <p className="text-[13px] md:text-[14px] text-gray-700 leading-snug font-normal mt-auto">{c.text}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/simuladores#hero">
          <button className="border border-[var(--ink)] text-[var(--ink)] text-[14px] md:text-[15px] font-semibold px-6 py-3 rounded-full hover:bg-[var(--ink)] hover:text-white active:scale-95 transition-all">
            Ver todos os simuladores →
          </button>
        </Link>
      </div>
    </section>
  );
}

// ─── Seção 4: Zona de Contemplação ───────────────────────────────────────────
function ZonaSection() {
  const cards = [
    { 
      title: "Quanto normalmente foi preciso para contemplar?", 
      call: "O grupo tem memória. Use isso antes de ofertar.",
      href: "/zona-contemplacao#parametros"
    },
    { 
      title: "Quantas pessoas realmente disputam a contemplação?", 
      call: "Seu lance não concorre com a tabela. Concorre com pessoas.",
      href: "/zona-contemplacao#parametros-quant"
    },
    { 
      title: "Seu lance está dentro da faixa competitiva?", 
      call: "Às vezes o lance está alto. Às vezes só parece.",
      href: "/zona-contemplacao#parametros"
    },
    { 
      title: "Vale a pena ofertar agora ou esperar?", 
      call: "Dado histórico não garante contemplação. Mas é melhor que achismo.",
      href: "/zona-contemplacao#leitura"
    },
  ];

  return (
    <section className="bg-[var(--ink)] py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-2 font-semibold">
          Zona de Contemplação
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight">
          Lance não é palpite. É disputa.
        </h2>
        <p className="text-[14px] md:text-[15px] text-white/60 mb-2 max-w-2xl">
          Antes de ofertar um lance, veja como esse grupo realmente se comporta. A Zona de Contemplação transforma histórico em contexto para você decidir melhor.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
          {cards.map((c) => (
            <Link key={c.title} href={c.href}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[var(--orange)]/50 transition-all cursor-pointer h-full">
                <p className="text-[14px] md:text-[15px] font-bold text-white mb-1 leading-tight">{c.title}</p>
                <p className="text-[13px] md:text-[14px] leading-snug font-medium" style={{ color: "color-mix(in oklch, var(--orange) 70%, white)" }}>{c.call}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/zona-contemplacao#parametros">
          <button className="border text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:text-white active:scale-95 transition-all" style={{ borderColor: "color-mix(in oklch, var(--orange) 70%, white)", color: "color-mix(in oklch, var(--orange) 70%, white)" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "color-mix(in oklch, var(--orange) 70%, white)"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            Testar meu lance →
          </button>
        </Link>
      </div>
    </section>
  );
}

// ─── Seção 5: Panorama — Dados Oficiais ──────────────────────────────────────
function PanoramaSection() {
  const cards = [
    {
      title: "Vender mais significa entregar melhores resultados?",
      call: "Mas venda não é posse.",
      text: "Entre a venda e a contemplação existe fila, lance, sorteio, correção e permanência no grupo.",
      href: "/panorama#vendas",
    },
    {
      title: "Quantos clientes desistem antes do fim?",
      call: "Quem sai da fila também conta a história.",
      text: "O índice de exclusão ajuda a entender quantas pessoas não seguem até o fim do contrato.",
      href: "/panorama#exclusao",
    },
    {
      title: "O que os consumidores mais reclamam?",
      call: "Quando o consumidor reclama, o dado deixa de ser detalhe.",
      text: "Reclamações ajudam a mostrar atritos reais entre promessa, contrato e experiência do cliente.",
      href: "/panorama#reclamacoes",
    },
    {
      title: "A contemplação depende mais da sorte ou do lance?",
      call: "Sorteio existe. Mas a realidade costuma ter boleto e disputa.",
      text: "A contemplação por lance tem peso relevante e precisa ser considerada antes de contratar.",
      href: "/panorama#sorte",
    },
  ];

  return (
    <section className="bg-[var(--paper)] py-8 md:py-10 border-t border-[var(--ink)]/10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] font-semibold">
            Panorama: Dados Oficiais
          </p>
          <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Dados consolidados de 2025
          </span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-1.5 leading-tight">
          Não é opinião. São os dados oficiais.
        </h2>
        <p className="text-[14px] md:text-[15px] text-[var(--ink)]/60 mb-1.5 max-w-2xl">
          </p>
        <p className="text-[14px] md:text-[15px] text-[var(--ink)]/60 mb-2 max-w-2xl">
          Os dados ajudam a entender a complexidade real do sistema de consórcios.
        </p>

        <div className="flex flex-col md:flex-row gap-6 mb-2">
          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cards.map((c) => (
              <Link key={c.title} href={c.href}>
                <div className="bg-white border border-[var(--ink)]/10 rounded-lg p-4 hover:border-[var(--orange)] hover:shadow-sm transition-all cursor-pointer h-full">
                  <p className="text-[14px] md:text-[15px] font-bold text-[var(--ink)] mb-0.5">{c.title}</p>
                  <p className="text-[14px] md:text-[15px] text-[var(--orange)] font-medium mb-2 leading-snug">
                    {c.call}
                  </p>
                  <p className="text-[14px] md:text-[15px] text-gray-700 leading-snug font-medium">{c.text}</p>
                </div>
              </Link>
            ))}
          </div>


        </div>

        <Link href="/panorama">
          <button className="bg-[var(--ink)] text-white text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all">
            Acessar painel completo →
          </button>
        </Link>
      </div>
    </section>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="bg-[var(--paper)]">
      <HeroSection />
      <RaioXSection />
      <ConscienciaSection />
      <ZonaSection />
      <PanoramaSection />
    </main>
  );
}
