/**
 * RaioXLayout — Layout padrão de todos os módulos do Raio-X do Consórcio.
 *
 * Estrutura:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Hero (título do módulo, badge, descrição)           │
 *   ├──────────────────┬──────────────────────────────────┤
 *   │  Formulário      │  KPIs (grid-cols-2)              │
 *   │  (inputs card)   │  Diagnóstico / leitura técnica   │
 *   │                  │  Tabela (max-h scroll interno)   │
 *   │                  │  Warnings                        │
 *   │                  │  Transparência + PDF + CTA       │
 *   └──────────────────┴──────────────────────────────────┘
 */

import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

interface RaioXLayoutProps {
  moduleNumber: number;
  title: string;
  description: string;
  formPanel: React.ReactNode;
  resultsPanel: React.ReactNode;
  hasResult: boolean;
}

export default function RaioXLayout({
  moduleNumber,
  title,
  description,
  formPanel,
  resultsPanel,
  hasResult,
}: RaioXLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="bg-[var(--ink)] text-white py-10 w-full max-w-[100vw] px-4 md:px-5 lg:px-8">
        <div className="max-w-6xl mx-auto relative">
          {/* Logo canto superior direito */}
          <img
            src={LOGO.light}
            alt={BRAND.name}
            className="absolute top-0 right-0 h-10 md:h-12 w-auto object-contain"
          />
          {/* Botão Voltar */}
          <Link
            href="/simuladores"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Raio-X
          </Link>

          {/* Badge + Módulo */}
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-[var(--orange)]/20 text-[var(--orange)] text-xs font-semibold px-3 py-1 rounded-full border border-[var(--orange)]/30">
              Raio-X do Consórcio
            </span>
          </div>

          {/* Número do módulo com marca-texto amarelo */}
          <p className="mono text-xs uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
            <span className="bg-yellow-400 text-black px-2 py-0.5 rounded font-bold text-[11px]">
              Módulo {moduleNumber}
            </span>
            <span>· Raio-X do Consórcio</span>
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-white/60 max-w-xl leading-relaxed text-sm md:text-base">
            {description}
          </p>
        </div>
      </section>

      {/* ── Grid principal ── */}
      <section className="w-full max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Coluna esquerda — Formulário */}
          <div className="w-full lg:w-[380px] lg:shrink-0">
            <div className="bg-[#FFFEFA] border border-[#DDD6C8] rounded-2xl p-4 md:p-5 shadow-sm">
              {formPanel}
            </div>
          </div>

          {/* Coluna direita — Resultados */}
          <div className="flex-1 min-w-0">
            {hasResult ? (
              resultsPanel
            ) : (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border bg-card/50 text-center px-6">
                <p className="mono text-xs uppercase tracking-widest text-foreground/30 mb-2">
                  Aguardando análise
                </p>
                <p className="text-foreground/50 text-sm">
                  Preencha os dados ao lado e clique em{" "}
                  <strong>Analisar</strong> para ver o resultado.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
