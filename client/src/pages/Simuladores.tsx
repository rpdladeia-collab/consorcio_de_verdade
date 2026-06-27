/**
 * Página Central do Raio-X do Consórcio
 * Grid escuro 3×2 — fundo #111, cards #1c1b15, borda laranja no hover
 * Conforme especificação aprovada (Sprint UI/UX — Página Central do Raio-X)
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
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const MODULOS = [
  {
    num: 1,
    icon: <Calculator className="w-5 h-5" />,
    title: "Simule seu plano",
    desc: "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.",
    slug: "simule-seu-plano",
  },
  {
    num: 2,
    icon: <Scale className="w-5 h-5" />,
    title: "Contemplação",
    desc: "Projeta o impacto financeiro da contemplação em diferentes momentos do plano.",
    slug: "contemplacao",
  },
  {
    num: 3,
    icon: <FileSearch className="w-5 h-5" />,
    title: "Custo da operação",
    desc: "Calcula o custo real do consórcio: taxa de administração, seguro e fundo de reserva.",
    slug: "custo-operacao",
  },
  {
    num: 4,
    icon: <Gauge className="w-5 h-5" />,
    title: "Proporção da taxa",
    desc: "Mostra quanto da parcela é taxa e como isso degrada a eficiência ao longo do tempo.",
    slug: "proporcao-taxa",
  },
  {
    num: 5,
    icon: <Activity className="w-5 h-5" />,
    title: "Histórico de correções",
    desc: "Analisa o impacto dos reajustes históricos sobre o saldo devedor e a carta de crédito.",
    slug: "historico-correcoes",
  },
  {
    num: 6,
    icon: <Zap className="w-5 h-5" />,
    title: "Auto pagável?",
    desc: "Verifica se a carta de crédito é capaz de se pagar com rendimento após a contemplação.",
    slug: "auto-pagavel",
  },
];

export default function Simuladores() {
  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pt-16 pb-12">
        <div className="max-w-3xl">
          <p className="text-[var(--orange)] text-xs font-mono uppercase tracking-widest mb-4">
            Raio-X do Consórcio
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] text-white">
            Se você não entende estes pontos,{" "}
            <span className="text-[var(--orange)]">não contrate ainda.</span>
          </h1>
          <p className="text-white/55 text-base md:text-lg mt-5 max-w-2xl leading-relaxed">
            Cada módulo abaixo mostra uma parte essencial da decisão. Antes de
            contratar, entenda fluxo de parcelas, contemplação, custo da
            operação, proporção da taxa, correções e viabilidade.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm text-white/40">
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
      </section>

      {/* ── GRID 3×2 ─────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MODULOS.map((m) => (
            <Link
              key={m.slug}
              href={`/simulador/${m.slug}`}
              className="group flex flex-col rounded-xl border border-white/10 bg-[#1c1b15] p-6 transition-colors duration-200 hover:border-orange-500"
            >
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[var(--orange)]">{m.icon}</span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--orange)]">
                  Módulo {m.num}
                </span>
              </div>

              {/* Título */}
              <h2 className="text-white font-bold text-xl leading-snug mb-3">
                {m.title}
              </h2>

              {/* Descrição */}
              <p className="text-white/50 text-sm leading-relaxed flex-1">
                {m.desc}
              </p>

              {/* CTA */}
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--orange)] group-hover:gap-3 transition-all duration-200">
                Abrir simulador
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pb-24">
        <div className="rounded-2xl border border-white/10 bg-[#1c1b15] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-tight">
              Já simulou e quer uma leitura humana do resultado?
            </h2>
            <p className="text-white/50 mt-3 max-w-xl text-sm md:text-base">
              Traga sua simulação ou proposta. Damos uma segunda opinião
              técnica, com quem joga limpo.
            </p>
          </div>
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3.5 text-base font-semibold whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Falar com especialista
          </a>
        </div>
      </section>
    </div>
  );
}
