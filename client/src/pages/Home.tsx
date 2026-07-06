import { Link } from "wouter";
import { BRAND } from "@/lib/brand";

// ─── Seção 1: Hero ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="bg-[var(--paper)] py-12 md:py-16 border-b border-[var(--ink)]/10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Coluna de texto */}
          <div className="flex-1">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--orange)] border border-[var(--orange)] rounded-full px-3 py-1 mb-5">
              Consórcio não é para todo mundo
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--ink)] leading-tight mb-4">
              Antes de contratar um consórcio,{" "}
              <span className="text-[var(--orange)]">faça a conta.</span>
            </h1>
            <p className="text-sm text-[var(--ink)]/75 leading-relaxed mb-3 max-w-xl">
              <strong>Os simuladores mostram os números. A análise individual responde uma pergunta ainda mais importante: o consórcio é realmente a melhor estratégia para o seu caso?</strong>
            </p>
            <p className="text-sm text-[var(--ink)]/75 leading-relaxed mb-6 max-w-xl">
              Aqui você simula custos, lance, contemplação, correções e capacidade real de pagamento — antes de assinar o contrato.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <Link href="/simuladores">
                <button className="bg-[var(--orange)] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all">
                  Usar simuladores gratuitamente →
                </button>
              </Link>
              <a
                href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="border border-[var(--ink)] text-[var(--ink)] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[var(--ink)] hover:text-white active:scale-95 transition-all">
                  Pedir análise individual
                </button>
              </a>
            </div>
            <p className="text-xs text-[var(--ink)]/50">
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
  const cards = [
    {
      title: "Sem juros não significa sem custo.",
      text: "Taxa de administração, fundo de reserva, seguro e correção podem mudar completamente a leitura da operação.",
    },
    {
      title: "Parcela baixa pode esconder esforço futuro.",
      text: "O valor inicial pode parecer confortável, mas a correção da carta e do saldo pode alterar o peso do contrato no tempo.",
    },
    {
      title: "Lance não é garantia. É disputa.",
      text: "Você não dá lance sozinho. O resultado depende do grupo, da assembleia, da modalidade e do caixa disponível.",
    },
    {
      title: "Contemplação não resolve tudo.",
      text: "Depois de contemplado, ainda existe saldo, reajuste, capacidade de pagamento e análise da administradora.",
    },
  ];

  const nodes = ["parcela", "taxa", "correção", "lance", "prazo", "contemplação", "renda", "exclusão"];

  return (
    <section id="consciencia" className="bg-[var(--ink)] py-10 md:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          Por que simular antes de contratar
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
          Consórcio não é golpe. Mas também não é mágica.
        </h2>


        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Texto */}
          <div className="flex-1">
            <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-2xl">
              Antes de contratar, existem quatro perguntas que mudam completamente a decisão. A maioria das pessoas nunca faz nenhuma delas.
            </p>
            <Link href="/simuladores">
              <button className="text-xs border border-white/30 text-white/70 px-4 py-2 rounded-full hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all">
                Ver o que preciso analisar antes de contratar →
              </button>
            </Link>
          </div>


        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.title} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-xs font-bold text-[var(--orange)] mb-1">{c.title}</p>
              <p className="text-xs text-white/60 leading-snug">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Seção 3: Raio-X do Consórcio ────────────────────────────────────────────
function RaioXSection() {
  const cards = [
    {
      num: "01",
      name: "Essa parcela continua cabendo daqui a alguns anos?",
      call: "Cabe hoje. Amanhã a gente confere.",
      text: "Veja como a parcela pode mudar com o tempo, especialmente quando entram correções, seguros e saldo devedor.",
      href: "/simulador/simule-seu-plano",
    },
    {
      num: "02",
      name: "Esse lance realmente aumenta minhas chances?",
      call: "Dar lance é fácil. Saber se ele compra chance é outra história.",
      text: "Entenda se o lance aproxima você da contemplação ou apenas aumenta o esforço financeiro.",
      href: "/simulador/raio-x-do-lance",
    },
    {
      num: "03",
      name: "Quanto esse consórcio realmente vai me custar?",
      call: "Sem juros não significa sem conta.",
      text: "Separe crédito, taxa, seguro, fundo de reserva e correção para entender o custo real da operação.",
      href: "/simulador/custo-operacao",
    },
    {
      num: "04",
      name: "Quanto do crédito contratado realmente chega até você?",
      call: "Crédito contratado é uma coisa. Dinheiro novo é outra.",
      text: "Veja quanto da operação chega de fato até você e quanto fica no caminho.",
      href: "/simulador/proporcao-taxa",
    },
    {
      num: "05",
      name: "Quanto a correção pode aumentar sua dívida?",
      call: "O juro saiu da conversa. O reajuste ficou.",
      text: "Simule como a correção pode afetar carta, saldo e parcela ao longo do contrato.",
      href: "/simulador/historico-correcoes",
    },
    {
      num: "06",
      name: "Essa operação realmente se paga?",
      call: "Quando a promessa é bonita, a matemática precisa assinar embaixo.",
      text: "Teste se a carta realmente se paga depois da contemplação ou se a conta só fecha no discurso.",
      href: "/simulador/auto-pagavel",
    },
  ];

  return (
    <section className="bg-[var(--paper)] py-10 md:py-12 border-t border-[var(--ink)]/10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          Raio-X do Consórcio
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-2 leading-tight">
          A proposta cabe no bolso. Mas o contrato cabe na vida?
        </h2>
        <p className="text-sm text-[var(--ink)]/60 mb-8 max-w-2xl">
          Cada simulador responde uma pergunta que normalmente só aparece depois da assinatura do contrato. Descubra essas respostas antes de decidir.
        </p>

        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-4 font-semibold">
          O QUE VOCÊ PRECISA SABER
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {cards.map((c) => (
            <Link key={c.num} href={c.href}>
              <div className="group bg-white border border-[var(--ink)]/10 rounded-lg p-4 hover:border-[var(--orange)] hover:shadow-sm transition-all cursor-pointer h-full">
                <p className="text-[10px] tracking-widest uppercase text-[var(--orange)]/60 mb-1 font-semibold">
                  {c.num === "06" ? "O QUE VOCÊ PRECISA SABER #06" : c.num}
                </p>
                <p className="text-sm font-bold text-[var(--ink)] mb-1">{c.name}</p>
                <p className="text-xs text-[var(--orange)] font-medium mb-2 leading-snug">
                  {c.call}
                </p>
                <p className="text-xs text-[var(--ink)]/55 leading-snug">{c.text}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/simuladores">
          <button className="bg-[var(--ink)] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-80 active:scale-95 transition-all">
            Abrir simuladores →
          </button>
        </Link>
      </div>
    </section>
  );
}



// ─── Seção 4: Zona de Contemplação ───────────────────────────────────────────
function ZonaSection() {
  const cards = [
    { title: "Quanto normalmente foi preciso para contemplar?", call: "O grupo tem memória. Use isso antes de ofertar." },
    { title: "Quantas pessoas realmente disputam a contemplação?", call: "Seu lance não concorre com a tabela. Concorre com pessoas." },
    { title: "Seu lance está dentro da faixa competitiva?", call: "Às vezes o lance está alto. Às vezes só parece." },
    { title: "Vale a pena ofertar agora ou esperar?", call: "Dado histórico não garante contemplação. Mas é melhor que achismo." },
  ];

  return (
    <section className="bg-[var(--ink)] py-10 md:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          Zona de Contemplação
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
          Lance não é palpite. É disputa.
        </h2>
        <p className="text-sm text-white/60 mb-6 max-w-2xl">
          Antes de ofertar um lance, veja como esse grupo realmente se comporta. A Zona de Contemplação transforma histórico em contexto para você decidir melhor.
        </p>

        <div className="flex flex-col md:flex-row gap-8 mb-6">
          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((c) => (
              <div key={c.title} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs font-bold text-white mb-1">{c.title}</p>
                <p className="text-xs text-[var(--orange)] leading-snug">{c.call}</p>
              </div>
            ))}
          </div>

          {/* Termômetro visual */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="border border-white/15 rounded-xl p-4">
              <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 text-center">
                Termômetro de lance
              </p>
              <div className="flex flex-col gap-1 mb-3">
                {[
                  { label: "Acima do histórico", color: "bg-red-500/70" },
                  { label: "Zona de disputa", color: "bg-[var(--orange)]" },
                  { label: "Fora da zona", color: "bg-white/20" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    <div className={`h-4 flex-1 rounded ${f.color}`} />
                    <span className="text-[10px] text-white/50 w-28 text-right">{f.label}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-2">
                <p className="text-[10px] text-white/40 text-center">
                  Nem sempre vence quem oferece mais. Vence quem entende o comportamento do grupo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/zona-contemplacao">
          <button className="border border-[var(--orange)] text-[var(--orange)] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[var(--orange)] hover:text-white active:scale-95 transition-all">
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
    },
    {
      title: "Quantos clientes desistem antes do fim?",
      call: "Quem sai da fila também conta a história.",
      text: "O índice de exclusão ajuda a entender quantas pessoas não seguem até o fim do contrato.",
    },
    {
      title: "O que os consumidores mais reclamam?",
      call: "Quando o consumidor reclama, o dado deixa de ser detalhe.",
      text: "Reclamações ajudam a mostrar atritos reais entre promessa, contrato e experiência do cliente.",
    },
    {
      title: "A contemplação depende mais da sorte ou do lance?",
      call: "Sorteio existe. Mas a realidade costuma ter boleto e disputa.",
      text: "A contemplação por lance tem peso relevante e precisa ser considerada antes de contratar.",
    },
  ];

  const placar = [
    { label: "Vendas", value: "↑ Crescimento" },
    { label: "Exclusões", value: "⚠ Relevante" },
    { label: "Reclamações", value: "↑ Crescem" },
    { label: "Lance", value: "Domina" },
  ];

  return (
    <section className="bg-[var(--paper)] py-10 md:py-12 border-t border-[var(--ink)]/10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
          Panorama: Dados Oficiais
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-2 leading-tight">
          Não é opinião. São os dados oficiais.
        </h2>
        <p className="text-sm text-[var(--ink)]/60 mb-2 max-w-2xl">
          Aqui você consegue enxergar um mercado que a propaganda nem sempre mostra.
        </p>
        <p className="text-sm text-[var(--ink)]/60 mb-6 max-w-2xl">
          Os dados ajudam a entender a complexidade real do sistema de consórcios.
        </p>

        <div className="flex flex-col md:flex-row gap-8 mb-6">
          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((c) => (
              <div key={c.title} className="bg-white border border-[var(--ink)]/10 rounded-lg p-4">
                <p className="text-xs font-bold text-[var(--ink)] mb-0.5">{c.title}</p>
                <p className="text-xs text-[var(--orange)] font-medium mb-2 leading-snug">
                  {c.call}
                </p>
                <p className="text-xs text-[var(--ink)]/55 leading-snug">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Bloco placar */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="bg-[var(--ink)] rounded-xl p-4 text-white">
              <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 text-center">
                Indicadores que ajudam a entender o mercado.
              </p>
              {placar.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                >
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-xs text-[var(--orange)]">{p.value}</span>
                </div>
              ))}
              <p className="text-[10px] text-white/40 text-center mt-3">
                Dado oficial não vende sonho. Mostra comportamento.
              </p>
            </div>
          </div>
        </div>

        <Link href="/panorama">
          <button className="bg-[var(--ink)] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-80 active:scale-95 transition-all">
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
    <section className="bg-[var(--ink)] py-10 md:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Texto */}
          <div className="flex-1">
            <p className="text-[10px] tracking-widest uppercase text-[var(--orange)] mb-3 font-semibold">
              r.enatto
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              Os simuladores mostram os números. Eu ajudo a interpretar a decisão.
            </h2>
            <p className="text-sm text-white/60 mb-4 max-w-xl">
              Criei o Consórcio de Verdade porque percebi que muita gente contratava um consórcio entendendo apenas a parcela. Reuni ferramentas, dados e análises para que qualquer pessoa possa tomar uma decisão mais consciente antes de assinar um contrato.
            </p>
            <blockquote className="border-l-2 border-[var(--orange)] pl-4 mb-4">
              <p className="text-sm text-white font-medium italic">
                "Quando fizer sentido, eu ajudo a estruturar. Quando não fizer, eu prefiro te
                mostrar antes."
              </p>
            </blockquote>
            <p className="text-sm text-white/60 mb-5 max-w-xl">
              Os simuladores ajudam você a entender os números. A análise individual transforma essas informações em uma estratégia para o seu caso, considerando objetivo, prazo, renda, patrimônio e perfil.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-[var(--orange)] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all">
                  Pedir análise individual →
                </button>
              </a>
              <Link href="/sobre">
                <button className="border border-white/30 text-white/70 text-sm font-semibold px-5 py-2.5 rounded-full hover:border-white hover:text-white active:scale-95 transition-all">
                  Conheça quem está por trás do projeto
                </button>
              </Link>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
}

// ─── Seção 7: Fechamento ──────────────────────────────────────────────────────
function FechamentoSection() {
  return (
    <section className="bg-[var(--orange)] py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <h2 className="font-serif text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
              Agora a decisão é sua.
            </h2>
            <p className="text-sm text-white/90 mb-0 max-w-xl">
              Os simuladores estão disponíveis gratuitamente para que você faça sua própria análise. Se quiser uma avaliação independente e estratégica para o seu caso, eu posso ajudar.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="w-full bg-white text-[var(--orange)] text-sm font-bold px-6 py-2.5 rounded-full hover:bg-white/90 active:scale-95 transition-all">
                Pedir análise individual
              </button>
            </a>
            <Link href="/simuladores">
              <button className="w-full border border-white text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/10 active:scale-95 transition-all">
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
      <ConscienciaSection />
      <RaioXSection />
      <ZonaSection />
      <PanoramaSection />
      <RenatoSection />
      <FechamentoSection />
    </div>
  );
}
