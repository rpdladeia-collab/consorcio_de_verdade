import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, Eye, Layers3, ScanLine, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { BRAND } from "@/lib/brand";

const AXES = [
  {
    num: "01",
    title: "PROPOSTA",
    question: "A proposta cabe no bolso. Mas o contrato cabe na vida?",
    detail: "Explore a memória completa de cálculo do seu plano, mês a mês. Custos, correções, evolução da carta e os números que realmente determinam quanto o seu consórcio custa ao longo do tempo.",
    href: "/simulador/estrutura-do-plano#parametros",
    signal: "estrutura do plano",
  },
  {
    num: "02",
    title: "LANCE",
    question: "Você está comprando uma carta ou entrando numa disputa?",
    detail: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria. Lance embutido e lance fixo aparecem como camadas do mesmo problema.",
    href: "/simulador/estrategia-lance#parametros",
    signal: "carta × categoria",
  },
  {
    num: "03",
    title: "CONTEMPLAÇÃO",
    question: "Onde o seu lance realmente se encaixa no grupo?",
    detail: "O lance não é apenas um valor. É uma posição frente à concorrência. Leia histórico, vagas, pressão do grupo e faixa competitiva antes de ofertar.",
    href: "/zona-contemplacao#parametros",
    signal: "zona de contemplação",
  },
  {
    num: "04",
    title: "EXCLUSÃO",
    question: "Quanto você realmente perde quando sai?",
    detail: "Simule saldo, taxas, correções e o custo de oportunidade do dinheiro parado ao cancelar a cota. Quem sai da fila também conta a história.",
    href: "/simulador/custo-cancelamento#parametros",
    signal: "custo de cancelamento",
  },
  {
    num: "05",
    title: "ALAVANCAGEM",
    question: "Uma carta contemplada vale quanto fora do grupo?",
    detail: "Avalie o ativo no mercado secundário e simule o valor de venda de uma carta contemplada com ágio, sem confundir venda com posse.",
    href: "/simulador/venda-carta-contemplada#parametros",
    signal: "mercado secundário",
  },
];

const TRUTHS = [
  { eyebrow: "01 / SEM JUROS", lead: "não significa", accent: "SEM CUSTO.", tone: "bone" },
  { eyebrow: "02 / LANCE", lead: "não é garantia.", accent: "É DISPUTA.", tone: "orange" },
  { eyebrow: "03 / PARCELA BAIXA", lead: "pode esconder", accent: "ESFORÇO FUTURO.", tone: "bone" },
  { eyebrow: "04 / CONTEMPLAÇÃO", lead: "não resolve", accent: "TUDO.", tone: "obsidian" },
];

const PANORAMA_STORY = [
  { year: "2016", label: "BASE", text: "O sistema começa a ser lido como série, não como promessa isolada." },
  { year: "2020", label: "PRESSÃO", text: "O comportamento dos grupos passa a exigir mais contexto para além da parcela." },
  { year: "2023", label: "EVIDÊNCIA", text: "Venda, fila, lance, sorteio e exclusão aparecem como partes do mesmo sistema." },
  { year: "2025", label: "AGORA", text: "Dados oficiais consolidados para conferir antes de contratar." },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("is-visible");
        observer.unobserve(node);
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`cv-reveal ${className}`}>{children}</div>;
}

function HeroSection() {
  return (
    <section id="hero" className="cv-home-hero" aria-labelledby="hero-title">
      <div className="cv-hero-ambient" aria-hidden="true"><div className="cv-hero-orbit cv-hero-orbit-a" /><div className="cv-hero-orbit cv-hero-orbit-b" /><div className="cv-hero-orbit cv-hero-orbit-c" /><div className="cv-hero-scanline" /><div className="cv-hero-grid" /></div>
      <div className="cv-hero-content cv-shell">
        <div className="cv-hero-meta"><span className="cv-signal-dot" /> entrada no sistema <span className="cv-hero-meta-index">01 / 05</span></div>
        <div className="cv-hero-main">
          <div>
            <p className="cv-kicker cv-kicker-light">Consórcio não é para todo mundo</p>
            <h1 id="hero-title" className="cv-display cv-hero-title">Antes de contratar um consórcio,<br /><em>faça a conta.</em></h1>
          </div>
          <div className="cv-hero-aside"><span className="cv-aside-line" /><p>Os simuladores mostram os números. A análise responde se o consórcio é realmente a melhor estratégia para o seu caso.</p><p className="cv-hero-aside-note">Aqui você simula custos, lance, contemplação, correções e capacidade real de pagamento — antes de assinar o contrato.</p></div>
        </div>
        <div className="cv-hero-bottom">
          <div className="cv-hero-words" aria-label="Elementos analisados"><span>custos</span><span>lance</span><span>contemplação</span><span>correção</span><span>cancelamento</span></div>
          <div className="cv-hero-actions"><Link className="cv-button cv-button-orange" href="/simuladores#hero">Começar o Raio-X <ArrowUpRight /></Link><Link className="cv-button cv-button-line" href="/simuladores#hero">Ver simuladores <ArrowRight /></Link></div>
        </div>
        <div className="cv-hero-footer"><span>simulações gratuitas · dados claros · decisão com mais consciência</span><a href="#reality">descer para revelar <ChevronDown /></a></div>
      </div>
    </section>
  );
}

function RealitySection() {
  const [revealed, setRevealed] = useState(false);
  return (
    <section id="reality" className={`cv-reality-section ${revealed ? "is-revealed" : ""}`}>
      <div className="cv-shell">
        <Reveal><div className="cv-section-marker"><span>02</span><span>proposta × realidade</span><span className="cv-marker-rule" /></div></Reveal>
        <Reveal className="cv-reality-heading"><h2 className="cv-display">O contrato mostra uma camada.<br /><em>O sistema esconde outras.</em></h2><p>Parcela, prazo, crédito e taxa são o começo. A decisão aparece quando a segunda camada entra em foco.</p></Reveal>
        <div className="cv-reality-stage">
          <div className="cv-reality-layer cv-reality-visible"><span className="cv-layer-index">CAMADA 01 / O QUE APARECE</span><div className="cv-reality-numbers"><strong>R$ 1.500</strong><span>parcela</span><strong>180</strong><span>meses</span><strong>R$ 250 mil</strong><span>crédito</span></div><p>A proposta organiza o produto em números que cabem numa primeira conversa.</p></div>
          <div className="cv-reality-layer cv-reality-hidden"><span className="cv-layer-index">CAMADA 02 / O QUE PRECISA SER VISTO</span><div className="cv-reality-reveal-list"><span>correção</span><span>disputa por lance</span><span>tempo</span><span>pressão do grupo</span><span>custo de cancelamento</span><span>custo de oportunidade</span><span>probabilidade</span><span>impacto no orçamento</span></div><p>Agora você está vendo o que normalmente só aparece depois da assinatura.</p></div>
          <button type="button" className="cv-reveal-control" onClick={() => setRevealed((value) => !value)}><ScanLine />{revealed ? "voltar à primeira camada" : "revelar a segunda camada"}<ArrowRight /></button>
        </div>
      </div>
    </section>
  );
}

function RaioXSection() {
  const [activeAxis, setActiveAxis] = useState(0);
  const axis = AXES[activeAxis];
  return (
    <section id="raio-x" className="cv-raiox-section">
      <div className="cv-shell">
        <Reveal><div className="cv-section-marker cv-section-marker-light"><span>03</span><span>Raio-X do Consórcio</span><span className="cv-marker-rule" /></div></Reveal>
        <Reveal className="cv-raiox-intro"><div><p className="cv-kicker cv-kicker-light">Examinar antes de decidir</p><h2 className="cv-display">Uma proposta.<br /><em>Cinco perguntas.</em></h2></div><p>O Raio-X abre o produto em partes. Passe por cada eixo para ver o dado, a pergunta e a ferramenta que existe por trás.</p></Reveal>
        <div className="cv-axis-list" role="tablist" aria-label="Eixos do Raio-X">
          {AXES.map((item, index) => <button type="button" role="tab" aria-selected={activeAxis === index} key={item.num} className={`cv-axis-row ${activeAxis === index ? "is-active" : ""}`} onMouseEnter={() => setActiveAxis(index)} onFocus={() => setActiveAxis(index)} onClick={() => setActiveAxis(index)}><span className="cv-axis-num">{item.num}</span><span className="cv-axis-title">{item.title}</span><span className="cv-axis-signal">{item.signal}</span><ArrowUpRight /></button>)}
        </div>
        <div className="cv-axis-detail" key={axis.num}><div className="cv-axis-detail-top"><span>eixo {axis.num}</span><span>interface de análise</span></div><h3 className="cv-display">{axis.question}</h3><p>{axis.detail}</p><Link className="cv-text-link" href={axis.href}>entrar em {axis.title.toLowerCase()} <ArrowRight /></Link></div>
      </div>
    </section>
  );
}

function TruthsSection() {
  return (
    <section id="verdades" className="cv-truths-section">
      <div className="cv-truth-intro"><div className="cv-shell"><p className="cv-kicker cv-kicker-light">Por que simular antes de contratar</p><h2 className="cv-display">Consórcio não é golpe.<br /><em>Mas também não é mágica.</em></h2><p>Antes de contratar: existem quatro pontos que mudam completamente a decisão.</p></div></div>
      {TRUTHS.map((truth, index) => <article className={`cv-truth-panel cv-truth-${truth.tone}`} key={truth.eyebrow}><div className="cv-shell cv-truth-inner"><span className="cv-truth-index">{truth.eyebrow}</span><div className="cv-truth-line"><span>{truth.lead}</span><strong>{truth.accent}</strong></div><span className="cv-truth-count">0{index + 1} / 04</span></div></article>)}
    </section>
  );
}

function ZoneSection() {
  const [bid, setBid] = useState(34);
  const zone = bid < 25 ? "zona fraca" : bid < 45 ? "zona média" : "zona competitiva";
  const questions = [
    ["Quanto normalmente foi preciso para contemplar?", "O grupo tem memória. Use isso antes de ofertar.", "/zona-contemplacao#parametros"],
    ["Quantas pessoas realmente disputam a contemplação?", "Seu lance não concorre com a tabela. Concorre com pessoas.", "/zona-contemplacao#parametros-quant"],
    ["Seu lance está dentro da faixa competitiva?", "Às vezes o lance está alto. Às vezes só parece.", "/zona-contemplacao#parametros"],
    ["Vale a pena ofertar agora ou esperar?", "Dado histórico não garante contemplação. Mas é melhor que achismo.", "/zona-contemplacao#leitura"],
  ];
  return (
    <section id="zona" className="cv-zone-section">
      <div className="cv-shell">
        <Reveal><div className="cv-section-marker"><span>04</span><span>Zona de Contemplação</span><span className="cv-marker-rule" /></div></Reveal>
        <Reveal className="cv-zone-heading"><div><p className="cv-kicker">Simular a disputa</p><h2 className="cv-display">Lance não é palpite.<br /><em>É posição.</em></h2></div><p>Altere o lance e veja a sua posição se mover na faixa de pressão do grupo. A ferramenta transforma histórico em contexto.</p></Reveal>
        <div className="cv-zone-visual"><div className="cv-zone-visual-head"><span>simulação rápida · lance sobre o crédito</span><strong>{bid}%</strong></div><div className="cv-zone-track"><div className="cv-zone-track-line" /><div className="cv-zone-zones"><span>zona fraca</span><span>zona média</span><span>zona competitiva</span></div><div className="cv-zone-marker" style={{ left: `${bid}%` }}><i /><b>{zone}</b></div></div><input aria-label="Percentual de lance" className="cv-zone-range" type="range" min="5" max="80" value={bid} onChange={(event) => setBid(Number(event.target.value))} /><div className="cv-zone-result"><span>leitura do movimento</span><strong>{bid >= 45 ? "A faixa começa a competir." : bid >= 25 ? "Você está dentro de uma faixa que merece contexto." : "O lance ainda parece fraco diante do grupo."}</strong><Link className="cv-text-link" href="/zona-contemplacao#parametros">testar meu lance <ArrowRight /></Link></div></div>
        <div className="cv-question-list">{questions.map(([title, text, href], index) => <Link href={href} key={title}><span>0{index + 1}</span><div><strong>{title}</strong><small>{text}</small></div><ArrowUpRight /></Link>)}</div>
      </div>
    </section>
  );
}

function PanoramaSection() {
  return (
    <section id="panorama" className="cv-panorama-section">
      <div className="cv-shell">
        <Reveal><div className="cv-section-marker cv-section-marker-light"><span>05</span><span>Indústria do Consórcio</span><span className="cv-marker-rule" /></div></Reveal>
        <Reveal className="cv-panorama-heading"><div><p className="cv-kicker cv-kicker-light">Indústria do Consórcio · Panorama: Dados Oficiais</p><h2 className="cv-display">Não é opinião.<br /><em>São os dados.</em></h2></div><p>Os dados ajudam a entender a complexidade real do sistema de consórcios. A pergunta vem antes do gráfico.</p></Reveal>
        <div className="cv-panorama-question"><span>pergunta de entrada</span><h3 className="cv-display">Vender mais significa entregar melhores resultados?</h3><p>Entre a venda e a contemplação existe fila, lance, sorteio, correção e permanência no grupo.</p><Link className="cv-text-link cv-text-link-light" href="/panorama#vendas">abrir a leitura <ArrowRight /></Link></div>
        <div className="cv-data-timeline"><div className="cv-data-timeline-line" />{PANORAMA_STORY.map((item) => <div className="cv-data-point" key={item.year}><span className="cv-data-year">{item.year}</span><span className="cv-data-label">{item.label}</span><p>{item.text}</p></div>)}</div>
        <div className="cv-panorama-links">{["Quantos clientes desistem antes do fim?", "O que os consumidores mais reclamam?", "A contemplação depende mais da sorte ou do lance?"].map((text, index) => <Link href={["/panorama#exclusao", "/panorama#reclamacoes", "/panorama#sorte"][index]} key={text}><span>0{index + 2}</span>{text}<ArrowUpRight /></Link>)}</div>
        <div className="cv-source-line"><span>dados consolidados de 2025</span><span>Banco Central do Brasil · Panorama do Consórcio 2025</span><Link href="/panorama">acessar painel completo <ArrowRight /></Link></div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="cv-closing-section"><div className="cv-shell cv-closing-inner"><Sparkles /><p className="cv-kicker">Consórcio de Verdade</p><h2 className="cv-display">Antes de decidir,<br /><em>veja o que está por trás.</em></h2><div className="cv-closing-actions"><Link className="cv-button cv-button-orange" href="/simuladores#hero">Ver todos os simuladores <ArrowUpRight /></Link><a className="cv-button cv-button-line" href={BRAND.whatsapp} target="_blank" rel="noreferrer">Pedir análise individual <ArrowRight /></a></div><div className="cv-closing-principles"><span>examinar</span><span>simular</span><span>comparar</span><span>revelar</span></div></div></section>
  );
}

export default function Home() {
  return <main className="cv-home"><HeroSection /><div className="cv-scan-transition" aria-hidden="true"><span /><i /></div><RealitySection /><RaioXSection /><TruthsSection /><ZoneSection /><PanoramaSection /><ClosingSection /></main>;
}
