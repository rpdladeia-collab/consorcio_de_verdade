import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, LockKeyhole, ScanLine } from "lucide-react";
import { Link } from "wouter";

const CATEGORIAS = [
  { num: "01", title: "Raio-X da Proposta", desc: "O primeiro filtro, antes de olhar preço.", modulos: [{ slug: "estrutura-do-plano", title: "NUNCA UM CONSÓRCIO FOI EXPLICADO ASSIM", desc: "Explore a memória completa de cálculo do seu plano, mês a mês. Custos, correções, evolução da carta e os números que realmente determinam quanto o seu consórcio custa ao longo do tempo.", cta: "EXPLORAR ESTRUTURA" }] },
  { num: "02", title: "Raio-X do Lance", desc: "A matemática por trás da contemplação.", modulos: [{ slug: "estrategia-lance", title: "CARTA OU CATEGORIA?", desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria (crédito + taxas).", cta: "DESCOBRIR RESPOSTA" }, { slug: "#", title: "LANCE EMBUTIDO", desc: "Entenda como o lance embutido funciona, seus limites e quando vale a pena utilizar essa modalidade.", cta: "EM BREVE", isFuture: true }, { slug: "#", title: "LANCE FIXO — SORTE", desc: "Simule o lance fixo combinado com sorteio para entender as probabilidades de contemplação e quando essa estratégia faz sentido.", cta: "EM BREVE", isFuture: true }] },
  { num: "03", title: "Raio-X da Contemplação", desc: "Onde seu lance se encaixa no grupo.", modulos: [{ slug: "zona-contemplacao", title: "ZONA DE CONTEMPLAÇÃO", desc: "O lance não é apenas um valor. É uma posição frente à concorrência. Analise o histórico, o quantitativo de vagas e a pressão do grupo para identificar a sua real zona de contemplação.", cta: "DESCOBRIR MINHA ZONA" }] },
  { num: "04", title: "Raio-X da Exclusão", desc: "Descubra quanto você realmente perde ao cancelar a cota.", modulos: [{ slug: "custo-cancelamento", title: "CUSTO DE CANCELAMENTO", desc: "Descubra quanto você realmente perde ao cancelar a cota: saldo, taxas e o custo de oportunidade do dinheiro parado.", cta: "FAZER ESTA ANÁLISE" }, { slug: "#", title: "VENDA DE CARTA NÃO CONTEMPLADA", desc: "Entenda o deságio real e as regras para transferir uma cota cancelada ou ativa sem contemplação.", cta: "EM BREVE", isFuture: true }] },
  { num: "05", title: "Raio-X da Alavancagem", desc: "Avaliação de ativos e mercado secundário.", modulos: [{ slug: "venda-carta-contemplada", title: "QUANTO VALE SUA CARTA CONTEMPLADA HOJE?", desc: "Simula o valor de venda de uma carta contemplada no mercado secundário com ágio.", cta: "FAZER ESTA ANÁLISE" }] },
];

const STATS = [{ label: "Imóveis", value: "54,5%", total: "3,4 mi" }, { label: "Automóveis", value: "46,2%", total: "4,6 mi" }, { label: "Motocicletas", value: "48,2%", total: "3,0 mi" }];

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add("is-visible"); observer.unobserve(node); } }, { threshold: .12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ModuleRow({ module, category }: { module: typeof CATEGORIAS[number]["modulos"][number]; category: string }) {
  const isFuture = module.isFuture;
  const content = <div className={`cv-tool-module ${isFuture ? "is-future" : ""}`}><div className="cv-tool-module-top"><span className="cv-tool-module-category">{category}</span>{isFuture ? <span className="cv-tool-future"><LockKeyhole /> em breve</span> : <ArrowUpRight className="cv-tool-module-arrow" />}</div><h3>{module.title}</h3><p>{module.desc}</p><span className="cv-tool-module-cta">{module.cta}{!isFuture && <ArrowRight />}</span></div>;
  return isFuture ? <div aria-label={`${module.title}, em breve`}>{content}</div> : <Link href={`/simulador/${module.slug}#parametros`}>{content}</Link>;
}

export default function Simuladores() {
  const [activeCategory, setActiveCategory] = useState(0);
  const active = CATEGORIAS[activeCategory];
  const heroRef = useInView();
  return (
    <div className="cv-tools-page">
      <section id="hero" className="cv-tools-hero"><div className="cv-tools-hero-grid" aria-hidden="true" /><div className="cv-shell cv-tools-hero-inner"><div className="cv-tools-crumb"><span className="cv-signal-dot" /> Raio-X do Consórcio <span>01 / 05</span></div><div className="cv-tools-hero-main"><div><p className="cv-kicker cv-kicker-light">Dados oficiais · método independente</p><h1 className="cv-display">48,4%<br /><em>desistem.</em></h1></div><div className="cv-tools-hero-copy"><p>A maioria das contemplações ocorre por lance. Assinar primeiro e entender depois é como começam os erros mais caros.</p><Link className="cv-text-link cv-text-link-light" href="#analises">abrir as análises <ChevronDown /></Link></div></div><div className="cv-tools-stat-strip"><div className="cv-tools-stat-label"><span>Índice de Exclusão</span><strong>IE 2025 · Banco Central</strong></div>{STATS.map((stat) => <div className="cv-tools-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span><small>{stat.total} cotas</small></div>)}</div><div className="cv-tools-source">Fonte: Banco Central do Brasil · Panorama do Consórcio 2025 · Dados públicos citados. O comportamento passado não garante resultado futuro.</div></div></section>
      <main id="analises" className="cv-tools-main"><div className="cv-shell"><div ref={heroRef} className="cv-tools-intro cv-reveal"><div><span className="cv-kicker">Simular antes de decidir</span><h2 className="cv-display">Cada resposta<br /><em>abre outra pergunta.</em></h2></div><p>Os simuladores mostram custos, lance, contemplação, correções e capacidade real de pagamento — antes de assinar o contrato.</p></div><div className="cv-tools-tabs" role="tablist" aria-label="Categorias de análise">{CATEGORIAS.map((category, index) => <button type="button" role="tab" aria-selected={activeCategory === index} key={category.num} className={activeCategory === index ? "is-active" : ""} onClick={() => setActiveCategory(index)}><span>{category.num}</span>{category.title.replace("Raio-X ", "")}</button>)}</div><section id="cat-01" className="cv-tool-focus" aria-live="polite"><div className="cv-tool-focus-head"><div><span className="cv-kicker">Eixo {active.num} / interface de análise</span><h2 className="cv-display">{active.title}</h2></div><p>{active.desc}</p></div><div className={`cv-tool-modules cv-tool-modules-${active.modulos.length}`}>{active.modulos.map((module) => <ModuleRow key={module.title} module={module} category={active.title} />)}</div></section><div className="cv-tools-all">{CATEGORIAS.map((category, index) => <section id={`cat-${category.num}`} className={`cv-tool-category ${activeCategory === index ? "is-selected" : ""}`} key={category.num}><div className="cv-tool-category-num">{category.num}</div><div className="cv-tool-category-copy"><h3>{category.title}</h3><p>{category.desc}</p></div><button type="button" onClick={() => { setActiveCategory(index); document.getElementById("analises")?.scrollIntoView({ behavior: "smooth" }); }} aria-label={`Selecionar ${category.title}`}><ArrowRight /></button></section>)}</div></div></main>
      <section className="cv-tools-cta"><div className="cv-shell"><ScanLine /><p className="cv-kicker cv-kicker-light">O melhor produto financeiro não é aquele que vende mais.</p><h2 className="cv-display">Ainda ficou<br /><em>em dúvida?</em></h2><p>Às vezes o caso é específico demais para uma régua padrão. Peça uma leitura independente do seu cenário e tome sua decisão com total clareza.</p><a className="cv-button cv-button-orange" href="https://wa.me/5531996952204" target="_blank" rel="noreferrer">Solicitar análise estratégica <ArrowRight /></a></div></section>
    </div>
  );
}
