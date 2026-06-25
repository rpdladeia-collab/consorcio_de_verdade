import { Link } from "wouter";
import {
  ArrowRight,
  Clock,
  Calculator,
  Scale,
  Activity,
  FileSearch,
  Lock,
  MessageCircle,
  Gauge,
} from "lucide-react";
import {
  CATEGORIES,
  CategoryKey,
  SIMULADORES,
  simuladoresByCategory,
  Complexity,
} from "@/lib/simuladores";
import { BRAND } from "@/lib/brand";

const CATEGORY_ICONS: Record<CategoryKey, React.ReactNode> = {
  lances: <Calculator className="w-5 h-5" />,
  decisao: <Scale className="w-5 h-5" />,
  saude: <Activity className="w-5 h-5" />,
  proposta: <FileSearch className="w-5 h-5" />,
};

const COMPLEXITY_DOTS: Record<Complexity, number> = {
  Simples: 1,
  Intermediário: 2,
  Avançado: 3,
};

function ComplexityMeter({ level }: { level: Complexity }) {
  const filled = COMPLEXITY_DOTS[level];
  return (
    <span className="inline-flex items-center gap-1.5" title={`Complexidade: ${level}`}>
      <Gauge className="w-3.5 h-3.5 text-foreground/40" />
      <span className="flex items-center gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i <= filled ? "bg-[var(--orange)]" : "bg-foreground/15"
            }`}
          />
        ))}
      </span>
      <span className="text-[11px] text-foreground/50">{level}</span>
    </span>
  );
}

export default function Simuladores() {
  const categories = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="dark bg-[var(--ink)] text-[var(--paper)] py-16 md:py-20">
        <div className="container-wide px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow text-[var(--orange)] mb-3">Centro de investigação</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05]">
              Central de Simuladores
            </h1>
            <p className="text-lg text-white/65 mt-5 max-w-2xl">
              {SIMULADORES.length} ferramentas independentes para investigar cada
              decisão de consórcio. Escolha pela sua dúvida, preencha poucos dados e
              receba um diagnóstico claro — com a conta feita por inteiro.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-7 text-sm text-white/55">
              <span className="inline-flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--orange)]" />
                Cálculo protegido no servidor
              </span>
              <span className="inline-flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[var(--orange)]" />
                Relatório de auditoria em PDF
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== NAV POR DOR ===================== */}
      <section className="border-b border-border sticky top-[64px] md:top-[72px] z-30 bg-background/85 backdrop-blur-md">
        <div className="container-wide px-5 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-1 px-1 no-scrollbar">
            {categories.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-[var(--orange)] hover:text-[var(--orange)] transition-colors"
              >
                {CATEGORY_ICONS[key]}
                {CATEGORIES[key].label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== GRUPOS POR DOR ===================== */}
      <section className="container-wide px-5 lg:px-8 py-14 space-y-16">
        {categories.map((key) => {
          const cat = CATEGORIES[key];
          const items = simuladoresByCategory(key);
          return (
            <div key={key} id={key} className="scroll-mt-32">
              <div className="flex items-start gap-4 mb-7">
                <div className="w-11 h-11 rounded-xl bg-[var(--orange-soft)] text-[var(--orange)] flex items-center justify-center shrink-0">
                  {CATEGORY_ICONS[key]}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold">{cat.label}</h2>
                  <p className="text-foreground/55 mt-1 max-w-2xl">{cat.desc}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/simulador/${s.slug}`}
                    className="group rounded-2xl border border-border bg-card p-6 flex flex-col transition-all hover:border-[var(--orange)] hover:-translate-y-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="mono text-[11px] uppercase tracking-wider text-foreground/40">
                        {s.title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-foreground/45">
                        <Clock className="w-3 h-3" />~{s.timeMin} min
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-snug">{s.question}</h3>
                    <p className="text-sm text-foreground/60 mt-3 leading-relaxed flex-1">
                      {s.shortDesc}
                    </p>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                      <ComplexityMeter level={s.complexity} />
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange)] group-hover:gap-2 transition-all">
                        Investigar <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ===================== COMERCIAL SUTIL ===================== */}
      <section className="container-wide px-5 lg:px-8 pb-24">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
              Já simulou e quer uma leitura humana do resultado?
            </h2>
            <p className="text-foreground/60 mt-3 max-w-xl">
              Traga sua simulação ou proposta. Damos uma segunda opinião técnica,
              sem vender consórcio e sem comissão de administradora.
            </p>
          </div>
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3.5 text-base font-semibold whitespace-nowrap transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="w-5 h-5" />
            Falar com especialista
          </a>
        </div>
      </section>
    </div>
  );
}
