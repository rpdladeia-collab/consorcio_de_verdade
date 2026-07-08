import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

interface RaioXLayoutProps {
  moduleNumber: number;
  title: string;
  description: string | React.ReactNode;
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
      <section className="bg-[var(--ink)] text-white py-2 sm:py-4 w-full px-4 md:px-5 lg:px-8 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Cabeçalho de Impressão (PDF) */}
        <div className="hidden print:flex items-center justify-between w-full mb-6 pb-4 border-none">
          <div className="flex flex-col">
            <img src={LOGO.dark} alt="Logo" className="max-h-[35px] w-auto mb-2" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-black uppercase tracking-tight">Relatório de Simulação: {title}</h1>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString('pt-BR')} • Consórcio de Verdade
            </p>
          </div>
        </div>

        <div className="print:hidden">
        {/* Botão Voltar */}
        <Link
          href="/simuladores"
          className="inline-flex items-center gap-1 text-white/50 hover:text-white text-[14px] mb-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </Link>

        {/* Título Reduzido */}
        <h1 className="text-base sm:text-lg font-bold mb-0.5 w-full leading-tight">{title}</h1>

        {/* Descrição em full width */}
        <p className="text-white text-xs sm:text-sm w-full leading-snug">
          {typeof description === "string" && description.startsWith("Parcela baixa vende fácil") ? (
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
          <p className="text-gray-400 w-full leading-snug text-xs sm:text-sm mt-0.5 font-normal">
            {descriptionSupport}
          </p>
        )}
        </div>
      </section>

      {/* ── Grid principal ── */}
      <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 print:p-0">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Coluna esquerda — Formulário */}
          <div className="w-full lg:w-[40%] lg:shrink-0 print:hidden">
            <div className="bg-[#FFFEFA] border border-[#DDD6C8] rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm">
              {formPanel}
            </div>
          </div>

          {/* Coluna direita — Resultados */}
          <div className="flex-1 min-w-0 overflow-x-auto">
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
        <section className="w-full px-4 md:px-5 lg:px-8 pt-4 pb-0">
          {scheduleTable}
        </section>
      )}
    </div>
  );
}
