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
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const MODULOS = [
  {
    num: 1,
    icon: <Calculator className="w-4 h-4" />,
    title: "Raio-X da Parcela",
    desc: "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.",
    slug: "simule-seu-plano",
  },
  {
    num: 2,
    icon: <Scale className="w-4 h-4" />,
    title: "Raio-X do Lance",
    desc: "Projeta o impacto financeiro da contemplação em diferentes momentos do plano.",
    slug: "contemplacao",
  },
  {
    num: 3,
    icon: <FileSearch className="w-4 h-4" />,
    title: "Raio-X do Custo Total",
    desc: "Calcula o custo real do consórcio: taxa de administração, seguro e fundo de reserva.",
    slug: "custo-operacao",
  },
  {
    num: 4,
    icon: <Gauge className="w-4 h-4" />,
    title: "Raio-X da Eficiência da Taxa",
    desc: "Mostra quanto da parcela é taxa e como isso degrada a eficiência ao longo do tempo.",
    slug: "proporcao-taxa",
  },
  {
    num: 5,
    icon: <Activity className="w-4 h-4" />,
    title: "Raio-X das Correções",
    desc: "Analisa o impacto dos reajustes históricos sobre o saldo devedor e a carta de crédito.",
    slug: "historico-correcoes",
  },
  {
    num: 6,
    icon: <Zap className="w-4 h-4" />,
    title: "Auto pagável?",
    desc: "Verifica se a carta de crédito é capaz de se pagar com rendimento após a contemplação.",
    slug: "auto-pagavel",
  },
];

export default function Simuladores() {
  return (
    <div className="bg-[#111] text-white">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pt-8 pb-5">
        <div className="max-w-3xl">
          <p className="text-[var(--orange)] text-xs font-mono uppercase tracking-widest mb-2">
            Raio-X do Consórcio
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-[1.1] text-white">
            Se você não entende estes pontos,{" "}
            <span className="text-[var(--orange)]">não contrate ainda.</span>
          </h1>
          <p className="text-white/55 text-sm mt-3 max-w-2xl leading-relaxed">
            Cada módulo abaixo mostra uma parte essencial da decisão. Antes de
            contratar, entenda fluxo de parcelas, contemplação, custo da
            operação, proporção da taxa, correções e viabilidade.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 text-xs text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[var(--orange)]" />
              Cálculo protegido no servidor
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-[var(--orange)]" />
              Relatório de auditoria em PDF
            </span>
          </div>
        </div>
      </section>

      {/* ── GRID 3×2 ─────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                  Módulo {m.num}
                </span>
              </div>

              {/* Título */}
              <h2 className="text-white font-bold text-base leading-snug mb-1.5">
                {m.title}
              </h2>

              {/* Descrição */}
              <p className="text-white/50 text-xs leading-snug flex-1">
                {m.desc}
              </p>

              {/* CTA */}
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[var(--orange)] group-hover:gap-2.5 transition-all duration-200">
                Abrir simulador
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="w-full px-4 md:px-8 lg:px-16 pb-8">
        <div className="rounded-2xl border border-white/10 bg-[#1c1b15] py-6 px-8 flex flex-col md:flex-row items-center gap-5">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-white text-xl font-extrabold leading-tight">
              Já simulou e quer uma leitura humana do resultado?
            </h2>
            <p className="text-white/50 mt-2 max-w-xl text-sm">
              Traga sua simulação ou proposta. Damos uma segunda opinião
              técnica, com quem joga limpo.
            </p>
          </div>
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-2.5 text-sm font-semibold whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Falar com especialista
          </a>
        </div>
      </section>
    </div>
  );
}
