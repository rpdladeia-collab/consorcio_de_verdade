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
 *
 * Props:
 *   - moduleNumber: número do módulo (1–6)
 *   - title: título do módulo
 *   - description: subtítulo/descrição
 *   - formPanel: conteúdo do painel esquerdo (inputs)
 *   - resultsPanel: conteúdo do painel direito (KPIs + tabela + etc)
 *   - hasResult: se true, mostra o painel direito; se false, mostra placeholder
 */

import React from "react";
import { Shield } from "lucide-react";

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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-[var(--orange)]/20 text-[var(--orange)] text-xs font-semibold px-3 py-1 rounded-full border border-[var(--orange)]/30">
              <Shield className="w-3 h-3" />
              Análise independente
            </span>
          </div>
          <p className="mono text-xs uppercase tracking-widest text-white/40 mb-1">
            Módulo {moduleNumber} · Raio-X do Consórcio
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
