import { Link } from "wouter";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Activity,
  FileSearch,
  Calculator,
  Lock,
  Eye,
  MessageCircle,
  Gauge,
} from "lucide-react";
import { CATEGORIES, CategoryKey, SIMULADORES } from "@/lib/simuladores";
import { BRAND } from "@/lib/brand";

const CATEGORY_ICONS: Record<CategoryKey, React.ReactNode> = {
  plano: <Calculator className="w-6 h-6" />,
  contemplacao: <Scale className="w-6 h-6" />,
  custo: <FileSearch className="w-6 h-6" />,
  eficiencia: <Gauge className="w-6 h-6" />,
  correcoes: <Activity className="w-6 h-6" />,
  autopagavel: <ArrowRight className="w-6 h-6" />,
};

export default function Home() {
  // Destaque: Módulos 1, 2 e 3 do HTML original
  const featured = SIMULADORES.filter((s) =>
    ["simule-seu-plano", "contemplacao", "custo-da-operacao"].includes(s.slug)
  );

  return (
    <div>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--orange-soft)]/40 to-transparent pointer-events-none" />
        <div className="container-wide px-5 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center pt-20 pb-24 md:pt-28 md:pb-32">
            <span className="seal mb-6 reveal">
              <ShieldCheck className="w-3.5 h-3.5" />
              Independente · sem venda de consórcio
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.02] reveal">
              Antes de contratar um consórcio,{" "}
              <span className="text-[var(--orange)]">faça a conta.</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/65 mt-6 max-w-2xl mx-auto reveal">
              Uma plataforma independente com simuladores, dados e análises para
              você entender consórcios sem promessa, pressão comercial ou conflito
              de interesse.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9 reveal">
              <Link
                href="/simuladores"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3.5 text-base font-semibold transition-transform hover:scale-[1.02]"
              >
                Acessar simuladores
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold hover:border-[var(--orange)] hover:text-[var(--orange)] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com especialista
              </a>
            </div>
            <p className="text-xs text-foreground/45 mt-5 reveal">
              Use gratuitamente. Sem cadastro obrigatório. Cálculos auditáveis.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== JORNADA POR DOR ==================== */}
      <section className="container-wide px-5 lg:px-8 pb-8">
        <div className="text-center mb-12">
          <p className="eyebrow text-[var(--orange)] mb-2">Comece pela sua dúvida</p>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            O que você quer descobrir?
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
            const c = CATEGORIES[key];
            return (
              <Link
                key={key}
                href={`/simuladores#${key}`}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--orange)] hover:-translate-y-1"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--orange-soft)] text-[var(--orange)] flex items-center justify-center mb-4">
                  {CATEGORY_ICONS[key]}
                </div>
                <h3 className="font-bold text-lg mb-2">{c.label}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{c.pain}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange)] mt-4 group-hover:gap-2 transition-all">
                  Explorar <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ==================== AUTORIDADE / INDEPENDÊNCIA ==================== */}
      <section className="dark bg-[var(--ink)] text-[var(--paper)] mt-20 py-20">
        <div className="container-wide px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow text-[var(--orange)] mb-3">Por que existimos</p>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                O mercado de consórcio explica o produto.{" "}
                <span className="text-[var(--orange)]">
                  Nós explicamos a conta.
                </span>
              </h2>
              <p className="text-white/65 mt-5 leading-relaxed">
                O Consórcio de Verdade não vende consórcio, não recebe comissão de
                administradora e não tem meta de venda. Nosso compromisso é com a
                matemática e com a sua decisão — não com o fechamento de um
                contrato.
              </p>
              <div className="mt-8 grid sm:grid-cols-3 gap-5">
                {[
                  { icon: <Lock className="w-5 h-5" />, t: "Cálculo protegido", d: "A lógica roda no servidor, não no seu navegador." },
                  { icon: <Eye className="w-5 h-5" />, t: "Transparente", d: "Memória de cálculo e metodologia abertas." },
                  { icon: <ShieldCheck className="w-5 h-5" />, t: "Sem conflito", d: "Nenhuma comissão de administradora." },
                ].map((f, i) => (
                  <div key={i}>
                    <div className="text-[var(--orange)] mb-2">{f.icon}</div>
                    <p className="font-semibold text-sm">{f.t}</p>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Números com fonte */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
              <p className="eyebrow text-white/40 mb-6">O setor em números</p>
              <div className="space-y-6">
                {[
                  { n: "10,5 mi", d: "consorciados ativos no Brasil", src: "ABAC, 2024" },
                  { n: "R$ 95 bi", d: "em créditos comercializados no ano", src: "ABAC, 2024" },
                  { n: "+11%", d: "de crescimento de adesões no período", src: "ABAC, 2024" },
                ].map((s, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-4 border-b border-white/8 pb-5 last:border-0 last:pb-0">
                    <div>
                      <p className="data-num text-3xl font-bold text-[var(--orange)]">{s.n}</p>
                      <p className="text-sm text-white/65 mt-1">{s.d}</p>
                    </div>
                    <span className="mono text-[11px] text-white/35 whitespace-nowrap">{s.src}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/35 mt-6 leading-relaxed">
                Dados ilustrativos do setor, com fonte indicada. Os simuladores
                usam os parâmetros que você informar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SIMULADORES EM DESTAQUE ==================== */}
      <section className="container-wide px-5 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow text-[var(--orange)] mb-2">Mais usados</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Simuladores em destaque
            </h2>
          </div>
          <Link
            href="/simuladores"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange)] hover:gap-2.5 transition-all"
          >
            Ver todos os {SIMULADORES.length} simuladores
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {featured.map((s) => (
            <Link
              key={s.slug}
              href={`/simulador/${s.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 flex flex-col transition-all hover:border-[var(--orange)] hover:-translate-y-1"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <span className="seal self-start mb-4">{s.complexity}</span>
              <h3 className="font-bold text-xl leading-snug">{s.question}</h3>
              <p className="text-sm text-foreground/60 mt-3 leading-relaxed flex-1">
                {s.shortDesc}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange)] mt-5 group-hover:gap-2 transition-all">
                Simular agora <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== COMERCIAL SUTIL ==================== */}
      <section className="container-wide px-5 lg:px-8 pb-24">
        <div className="rounded-3xl bg-[var(--orange)] text-white p-10 md:p-14 text-center relative overflow-hidden">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold max-w-2xl mx-auto leading-tight">
              Use os simuladores à vontade. Se quiser, traga sua proposta para uma
              segunda opinião.
            </h2>
            <p className="text-white/85 mt-4 max-w-xl mx-auto">
              Sem venda de consórcio, sem comissão. Apenas uma leitura honesta e
              técnica do seu caso, feita por quem conhece o setor por dentro.
            </p>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-white px-8 py-4 text-base font-semibold mt-8 transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com o especialista
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
