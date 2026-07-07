/**
 * Página Central do Raio-X do Consórcio
 * Grid escuro 3×2 — fundo #111, cards #1c1b15, borda laranja no hover
 * Compressão visual: modo dashboard editorial
 */

import { Link } from "wouter";
import {
  Calculator,
  Scale,
  FileSearch,
  Gauge,
  Activity,
  Zap,
  ArrowRight,
  Lock,
  DollarSign,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const MODULOS = [
  {
    num: 1,
    icon: <Calculator className="w-5 h-5" />,
    title: "Essa parcela continua cabendo daqui a alguns anos?",
    desc: "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.",
    slug: "simule-seu-plano",
    btn: "Simular parcela"
  },
  {
    num: 2,
    icon: <Scale className="w-5 h-5" />,
    title: "Esse lance realmente aumenta minhas chances?",
    desc: "Projeta o impacto financeiro da contemplação em diferentes momentos do plano.",
    slug: "raio-x-do-lance",
    btn: "Simular lance"
  },
  {
    num: 3,
    icon: <FileSearch className="w-5 h-5" />,
    title: "Quanto esse consórcio realmente vai me custar?",
    desc: "Calcula o custo real do consórcio: taxa de administração, seguro e fundo de reserva.",
    slug: "custo-operacao",
    btn: "Simular custo"
  },
  {
    num: 4,
    icon: <Gauge className="w-5 h-5" />,
    title: "Quanto do crédito contratado realmente chega até você?",
    desc: "Mostra quanto da parcela é taxa e como isso degrada a eficiência ao longo do tempo.",
    slug: "proporcao-taxa",
    btn: "Simular eficiência"
  },
  {
    num: 5,
    icon: <Activity className="w-5 h-5" />,
    title: "Quanto a correção pode aumentar sua dívida?",
    desc: "Analisa o impacto dos reajustes históricos sobre o saldo devedor e a carta de crédito.",
    slug: "historico-correcoes",
    btn: "Simular correções"
  },
  {
    num: 6,
    icon: <Zap className="w-5 h-5" />,
    title: "Essa operação realmente se paga?",
    desc: "Verifica se a carta de crédito é capaz de se pagar com rendimento após a contemplação.",
    slug: "auto-pagavel",
    btn: "Testar operação"
  },
  {
    num: 7,
    icon: <Scale className="w-5 h-5" />,
    title: "Lance sobre Carta vs Categoria",
    desc: "Compara a diferença matemática entre ofertar o lance sobre o crédito ou sobre a categoria (crédito + taxas).",
    slug: "lance-carta-x-categoria",
    btn: "Comparar bases"
  },
  {
    num: 8,
    icon: <DollarSign className="w-5 h-5" />,
    title: "Venda de Carta Contemplada",
    desc: "Simule o valor de venda de uma carta de crédito contemplada, considerando o saldo devedor, taxa de repasse e outros fatores.",
    slug: "venda-carta-contemplada",
    btn: "Simular venda"
  },
];

export default function Simuladores() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pt-6 pb-4">
        <p className="text-[var(--orange)] text-xs font-mono uppercase tracking-widest mb-2">
          Raio-X do Consórcio
        </p>
        <h1 className="text-xl md:text-2xl font-extrabold leading-[1.1] text-[var(--ink)] w-full">
          Aqui você não analisa apenas os números. Você entende como a operação funciona.
        </h1>
        <p className="text-[var(--ink)]/60 text-xs mt-2 w-full leading-relaxed">
          Cada análise responde uma dúvida específica da operação. Mais do que calcular valores, ela ajuda a compreender como cada decisão impacta o funcionamento do contrato ao longo do tempo.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-[10px] text-[var(--ink)]/70">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[var(--orange)]" />
            Cálculos protegidos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileSearch className="w-3.5 h-3.5 text-[var(--orange)]" />
            Relatório em PDF
          </span>
        </div>
      </section>

      {/* ── GRID 3×2 ─────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          {MODULOS.map((m) => (
            <Link
              key={m.slug}
              href={`/simulador/${m.slug}`}
              className="group flex flex-col rounded-xl border border-white/10 bg-[#1c1b15] p-4 transition-colors duration-200 hover:border-orange-500"
            >
              {/* Label */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--orange)]">{m.icon}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--orange)]">
                  Raio-X #{m.num < 10 ? `0${m.num}` : m.num}
                </span>
              </div>

              {/* Título */}
              <h2 className="text-white font-bold text-sm leading-snug mb-1">
                {m.title}
              </h2>

              {/* Descrição */}
              <p className="text-white/70 text-xs leading-relaxed flex-1">
                {m.desc}
              </p>

              {/* CTA */}
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--orange)] group-hover:gap-2.5 transition-all duration-200">
                {m.btn}
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pb-0">
        <div className="rounded-xl bg-[var(--orange)] py-6 px-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-black text-lg md:text-xl font-extrabold leading-tight">
              Os simuladores mostram os números. Eu ajudo a interpretar a decisão.
            </h2>
            <p className="text-black/70 mt-1 max-w-xl text-xs md:text-sm">
              Se depois da simulação você quiser uma análise independente para o seu caso, solicite uma análise individual.
            </p>
          </div>
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-6 py-2 text-xs md:text-sm font-bold whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Solicitar análise individual
          </a>
        </div>
      </section>
    </div>
  );
}
