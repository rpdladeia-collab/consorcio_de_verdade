import { Link } from "wouter";
import { BRAND } from "@/lib/brand";

// ─── Seção 1: Hero ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="hero" className="bg-[var(--paper)] py-10 md:py-12 border-b border-[var(--ink)]/10 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Coluna de texto */}
          <div className="flex-1">
            <span className="inline-block text-[14px] md:text-[15px] font-semibold tracking-widest uppercase text-[var(--orange)] border border-[var(--orange)] rounded-full px-3 py-1 mb-4">
              Consórcio não é para todo mundo
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--ink)] leading-tight mb-3">
              Antes de contratar um consórcio,{" "}
              <span className="text-[var(--orange)] text-[inherit] font-[inherit]">faça a conta.</span>
            </h1>
            <p className="text-[14px] md:text-[15px] text-gray-800 leading-relaxed mb-2.5 max-w-xl">
              <strong>Os simuladores mostram os números. A análise individual responde uma pergunta ainda mais importante: o consórcio é realmente a melhor estratégia para o seu caso?</strong>
            </p>
            <p className="text-[14px] md:text-[15px] text-gray-800 leading-relaxed mb-4 max-w-xl">
              Aqui você simula custos, lance, contemplação, correções e capacidade real de pagamento — antes de assinar o contrato.
            </p>
            <div className="flex flex-wrap gap-2.5 mb-3">
              <a href="#raio-x">
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

        <div className="flex flex-col md:flex-row gap-6 mb-4">
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
      name: "Veja a estrutura completa do seu plano, mês a mês.",
      call: "Estrutura do Plano",
      text: "Memória de cálculo detalhada com evolução anual, tabela mensal completa e indicadores consolidados.",
      href: "/simulador/estrutura-do-plano#parametros",
    },
    {
      name: "Quanto do seu crédito vira taxa?",
      call: "Eficiência da Taxa",
      text: "Mostra quanto da parcela é efetivamente taxa, e como isso corrói a eficiência do plano ao longo do tempo.",
      href: "/simulador/proporcao-taxa#parametros",
    },
    {
      name: "Lance na carta ou na categoria? A conta decide",
      call: "Estratégia de Lance",
      text: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria.",
      href: "/simulador/estrategia-lance#parametros",
    },
    {
      name: "Desistir custa mais do que parece",
      call: "Custo de Cancelamento",
      text: "Descubra quanto você realmente perde ao cancelar a cota: saldo, taxas e multas.",
      href: "/simulador/custo-cancelamento#parametros",
    },
    {
      name: "Quanto vale sua carta contemplada hoje?",
      call: "Avaliação de Ativo",
      text: "Simula o valor de venda de uma carta contemplada no mercado secundário com ágio.",
      href: "/simulador/venda-carta-contemplada#parametros",
    },
  ];

  return (
    <section id="raio-x" className="bg-[var(--paper)] py-10 md:py-12 border-t border-[var(--ink)]/10 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-2 font-semibold">
          Raio-X
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-1.5 leading-tight">
          A proposta cabe no bolso. <br className="hidden md:block" /> Mas o contrato cabe na vida?
        </h2>
        <p className="text-[14px] md:text-[15px] text-gray-800 mb-6 max-w-2xl">
          Cada simulador responde uma pergunta que normalmente só aparece depois da assinatura do contrato. Descubra essas respostas antes de decidir.
        </p>

        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          O QUE VOCÊ PRECISA SABER
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
          {cards.map((c) => (
            <Link key={c.name} href={c.href}>
              <div className="group bg-white border border-[var(--ink)]/10 rounded-lg p-4 hover:border-[var(--orange)] hover:shadow-sm transition-all cursor-pointer h-full flex flex-col">
                <p className="text-[14px] md:text-[15px] font-bold text-[var(--ink)] mb-1 leading-tight">{c.name}</p>
                <p className="text-[10px] text-[var(--orange)] font-bold uppercase tracking-tighter mb-2">
                  {c.call}
                </p>
                <p className="text-[13px] md:text-[14px] text-gray-700 leading-snug font-medium mt-auto">{c.text}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/simuladores#hero">
          <button className="border border-[var(--ink)] text-[var(--ink)] text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:bg-[var(--ink)] hover:text-white active:scale-95 transition-all">
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
        <p className="text-[14px] md:text-[15px] text-white/60 mb-4 max-w-2xl">
          Antes de ofertar um lance, veja como esse grupo realmente se comporta. A Zona de Contemplação transforma histórico em contexto para você decidir melhor.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
          {cards.map((c) => (
            <Link key={c.title} href={c.href}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[var(--orange)]/50 transition-all cursor-pointer h-full">
                <p className="text-[14px] md:text-[15px] font-bold text-white mb-1 leading-tight">{c.title}</p>
                <p className="text-[13px] md:text-[14px] text-[var(--orange)] leading-snug font-medium">{c.call}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/zona-contemplacao#parametros">
          <button className="border border-[var(--orange)] text-[var(--orange)] text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:bg-[var(--orange)] hover:text-white active:scale-95 transition-all">
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
      text: "Comprar uma cota não significa receber o bem. Entre a venda e a contemplação existe fila, lance, sorteio, correção e permanência no grupo.",
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

  const placar = [
    { label: "Vendas", value: "↑ Crescimento" },
    { label: "Exclusões", value: "⚠ Relevante" },
    { label: "Reclamações", value: "↑ Crescem" },
    { label: "Lance", value: "Domina" },
  ];

  return (
    <section className="bg-[var(--paper)] py-8 md:py-10 border-t border-[var(--ink)]/10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-2 font-semibold">
          Panorama: Dados Oficiais
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-1.5 leading-tight">
          Não é opinião. São os dados oficiais.
        </h2>
        <p className="text-[14px] md:text-[15px] text-[var(--ink)]/60 mb-1.5 max-w-2xl">
          Aqui você consegue enxergar um mercado que a propaganda nem sempre mostra.
        </p>
        <p className="text-[14px] md:text-[15px] text-[var(--ink)]/60 mb-4 max-w-2xl">
          Os dados ajudam a entender a complexidade real do sistema de consórcios.
        </p>

        <div className="flex flex-col md:flex-row gap-6 mb-4">
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
          <button className="bg-[var(--ink)] text-white text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full hover:opacity-80 active:scale-95 transition-all">
            Ver dados oficiais →
          </button>
        </Link>
      </div>
    </section>
  );
}

// ─── Seção 6: r.enatto / Análise com Renato ──────────────────────────────────
function RenatoSection() {
  return (
    <section className="bg-[var(--ink)] py-8 md:py-12 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Texto */}
          <div className="flex-1">
            <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-2 font-semibold">
              r.enatto
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Os simuladores mostram os números. <br className="hidden md:block" /> A estratégia depende do seu contexto.
            </h2>
            
            <p className="text-[14px] md:text-[15px] text-white font-medium mb-3">
              Nem toda boa estratégia inclui um consórcio.
            </p>
            <p className="text-[14px] md:text-[15px] text-white/85 mb-4 max-w-xl leading-relaxed">
              Minha análise compara diferentes alternativas para recomendar a solução mais adequada aos seus objetivos, sempre com base em dados, evidências e matemática financeira.
            </p>
            <p className="text-[14px] md:text-[15px] text-white/60 mb-5 max-w-xl">
              Não vendo produtos apenas. Construo estratégias.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/sobre">
                <button className="border border-white/30 text-white/70 text-[14px] md:text-[15px] font-semibold px-6 py-2.5 rounded-full hover:border-white hover:text-white active:scale-95 transition-all">
                  Conheça quem está por trás do projeto
                </button>
              </Link>
            </div>
          </div>


        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

// ─── Seção 7: Fechamento ──────────────────────────────────────────────────────
function FechamentoSection() {
  return (
    <section className="bg-[var(--orange)] py-6 md:py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex-1">
            <h2 className="font-serif text-xl md:text-2xl font-bold text-white mb-1.5 leading-tight">
              Agora a decisão é sua.
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/90 mb-0 max-w-xl">
              Os simuladores estão disponíveis gratuitamente para que você faça sua própria análise. Se quiser uma avaliação independente e estratégica para o seu caso, eu posso ajudar.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 flex-shrink-0">
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="w-full bg-white text-[var(--orange)] text-[14px] md:text-[15px] font-bold px-5 py-2 rounded-full hover:bg-white/90 active:scale-95 transition-all">
                Pedir análise individual
              </button>
            </a>
            <Link href="/simuladores#hero">
              <button className="w-full border border-white text-white text-[14px] md:text-[15px] font-semibold px-5 py-2 rounded-full hover:bg-white/10 active:scale-95 transition-all">
                Explorar simuladores
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Página Home ──────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <HeroSection />
      <RaioXSection />
      <ConscienciaSection />
      <ZonaSection />
      <PanoramaSection />
      <RenatoSection />
      <FechamentoSection />
    </div>
  );
}
