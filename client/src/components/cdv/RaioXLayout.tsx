import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

interface RaioXLayoutProps {
  moduleNumber: number;
  title: string;
  description: string;
  descriptionSupport?: string;
  formPanel: React.ReactNode;
  resultsPanel: React.ReactNode;
  hasResult: boolean;
  scheduleTable?: React.ReactNode;
}

export default function RaioXLayout({
  moduleNumber,
  title,
  description,
  descriptionSupport,
  formPanel,
  resultsPanel,
  hasResult,
  scheduleTable,
}: RaioXLayoutProps) {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[var(--ink)] text-white py-4 md:py-5 w-full px-4 md:px-5 lg:px-8">
        {/* Botão Voltar */}
        <Link
          href="/simuladores"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o Raio-X
        </Link>

        {/* Breadcrumb */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--orange)] mb-2">
          Raio-X do Consórcio
        </p>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 w-full">{title}</h1>

        {/* Descrição em full width */}
        <p className="text-white text-base md:text-lg w-full leading-relaxed">
          {description.startsWith("Parcela baixa vende fácil") ? (
            <>
              <span className="font-bold text-[var(--orange)]">Parcela baixa vende fácil. Conta mal feita cobra caro.</span>
              <span className="font-normal"> {description.substring("Parcela baixa vende fácil. Conta mal feita cobra caro.".length)}</span>
            </>
          ) : (
            description
          )}
        </p>

        {/* Suporte descritivo */}
        {descriptionSupport && (
          <p className="text-gray-400 w-full leading-relaxed text-base md:text-lg mt-3 font-normal">
            {descriptionSupport}
          </p>
        )}
      </section>

      {/* ── Grid principal ── */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Coluna esquerda — Formulário */}
          <div className="w-full lg:w-[45%] lg:shrink-0">
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

      {/* ── Tabela de Evolução (Full-width) ── */}
      {hasResult && scheduleTable && (
        <section className="w-full px-4 md:px-5 lg:px-8 py-6">
          {scheduleTable}
        </section>
      )}
    </div>
  );
}
