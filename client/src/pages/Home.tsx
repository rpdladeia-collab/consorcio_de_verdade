import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, ScanLine, Sparkles } from "lucide-react";
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
      <div className="cv-hero-ambient" aria-hidden="true"><video className="cv-hero-video" src="/assets/hero-scan-layers.mp4" poster="/assets/bg-caixa-preta.jpg" autoPlay muted loop playsInline preload="metadata" /><div className="cv-hero-video-wash" /><div className="cv-hero-orbit cv-hero-orbit-a" /><div className="cv-hero-orbit cv-hero-orbit-b" /><div className="cv-hero-orbit cv-hero-orbit-c" /><div className="cv-hero-scanline" /><div className="cv-hero-grid" /></div>
      <div className="cv-hero-content cv-shell">
        <div className="cv-hero-meta"><span className="cv-signal-dot" /> <span>início da análise</span></div>
        <div className="cv-hero-main">
          <div>
            <p className="cv-kicker cv-kicker-light">Consórcio não é para todo mundo</p>
            <h1 id="hero-title" className="cv-display cv-hero-title">Antes de contratar um consórcio,<br /><em>faça a conta.</em></h1>
          </div>
          <div className="cv-hero-aside"><span className="cv-aside-line" /><p>Simule custos, lance, contemplação e correções antes de assinar. A análise responde se o consórcio realmente faz sentido para o seu caso.</p></div>
        </div>
        <div className="cv-hero-bottom">
          <div className="cv-hero-words" aria-label="Elementos analisados"><span>custos</span><span>lance</span><span>contemplação</span><span>correção</span><span>cancelamento</span></div>
          <div className="cv-hero-actions"><Link className="cv-button cv-button-orange cv-button-primary" href="/simuladores#hero">Começar o Raio-X <ArrowUpRight /></Link><Link className="cv-button cv-button-line" href="/simuladores#hero">Ver simuladores <ArrowRight /></Link></div>
        </div>
        <div className="cv-hero-footer"><span>simulações gratuitas · dados claros · decisão com mais consciência</span><a href="#reality">descer para revelar <ChevronDown /></a></div>
      </div>
    </section>
  );
}

function RealitySection() {
  return (
    <section id="reality" className="cv-reality-section">
      <div className="cv-shell">
        <Reveal><div className="cv-section-marker"><span>02</span><span>proposta × realidade</span><span className="cv-marker-rule" /></div></Reveal>
        <Reveal className="cv-reality-heading"><h2 className="cv-display">O contrato mostra uma camada.<br /><em>O sistema esconde outras.</em></h2><p>Parcela, prazo, crédito e taxa são o começo. A decisão aparece quando a segunda camada entra em foco.</p></Reveal>
        <div className="cv-reality-stage">
          <article className="cv-reality-panel cv-reality-promise">
            <div className="cv-reality-panel-top"><span className="cv-layer-index">CAMADA 01</span><span>O MERCADO PROMETE</span></div>
            <h3 className="cv-display">O que aparece na primeira conversa.</h3>
            <ul className="cv-reality-points"><li><span>01</span><strong>não tem juros</strong></li><li><span>02</span><strong>contemplação rápida</strong></li><li><span>03</span><strong>parcela que cabe no bolso</strong></li><li><span>04</span><strong>crédito planejado</strong></li><li><span>05</span><strong>facilidade e previsibilidade</strong></li></ul>
            <p className="cv-reality-panel-note">A proposta parece simples quando mostra apenas o começo da história.</p>
          </article>
          <article className="cv-reality-panel cv-reality-truth">
            <div className="cv-reality-panel-top"><span className="cv-layer-index">CAMADA 02</span><span>A VERDADE</span></div>
            <h3 className="cv-display">O que precisa entrar na conta.</h3>
            <ul className="cv-reality-points"><li><span>01</span><strong>taxa de administração e correções</strong></li><li><span>02</span><strong>contemplação depende de sorteio e lance</strong></li><li><span>03</span><strong>parcela pode mudar ao longo do tempo</strong></li><li><span>04</span><strong>prazo é espera, não promessa</strong></li><li><span>05</span><strong>cancelamento pode reduzir o valor recebido</strong></li><li><span>06</span><strong>o dinheiro tem custo de oportunidade</strong></li></ul>
            <p className="cv-reality-panel-note">A análise começa quando a promessa encontra as condições reais do contrato.</p>
          </article>
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
          {AXES.map((item, index) => <Link href={item.href} role="tab" aria-selected={activeAxis === index} aria-label={`Abrir ${item.title.toLowerCase()}: ${item.question}`} key={item.num} className={`cv-axis-row ${activeAxis === index ? "is-active" : ""}`} onMouseEnter={() => setActiveAxis(index)} onFocus={() => setActiveAxis(index)}><span className="cv-axis-num">{item.num}</span><span className="cv-axis-title">{item.title}</span><span className="cv-axis-question-preview">{item.question}</span><ArrowUpRight /></Link>)}
        </div>
        <div className="cv-axis-detail" key={axis.num}><div className="cv-axis-detail-top"><span>eixo {axis.num}</span><span>interface de análise</span></div><h3 className="cv-display">{axis.question}</h3><p>{axis.detail}</p><Link className="cv-text-link" href={axis.href}>entrar em {axis.title.toLowerCase()} <ArrowRight /></Link></div>
      </div>
    </section>
  );
}

function ZoneSection() {
  const [bid, setBid] = useState(34);
  const zone = bid <= 49 ? "zona fraca" : bid <= 60 ? "zona média" : "zona quente";
  const zoneReading = bid <= 49
    ? "Zona fraca: até 49% — o lance ainda está abaixo da faixa média."
    : bid <= 60
      ? "Zona média: de 50% a 60% — a disputa merece contexto."
      : "Zona quente: 61% ou mais — a disputa fica mais pressionada.";
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
        <div className="cv-zone-visual"><div className="cv-zone-visual-head"><span>simulação rápida · lance sobre o crédito</span><strong>{bid}%</strong></div><div className="cv-zone-track"><div className="cv-zone-track-line" /><div className="cv-zone-zones"><span>zona fraca<br /><b>0–49%</b></span><span>zona média<br /><b>50–60%</b></span><span>zona quente<br /><b>61%+</b></span></div><div className="cv-zone-marker" style={{ left: `${bid}%` }}><i /><b>{zone}</b></div></div><input aria-label="Percentual de lance" className="cv-zone-range" type="range" min="0" max="100" value={bid} onChange={(event) => setBid(Number(event.target.value))} /><div className="cv-zone-result"><span>leitura do movimento</span><strong>{zoneReading}</strong><Link className="cv-text-link" href="/zona-contemplacao#parametros">testar meu lance <ArrowRight /></Link></div></div>
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
  return <main className="cv-home"><HeroSection /><div className="cv-scan-transition" aria-hidden="true"><span /><i /></div><RealitySection /><RaioXSection /><ZoneSection /><PanoramaSection /><ClosingSection /></main>;
}
