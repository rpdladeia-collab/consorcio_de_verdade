import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { LOGO } from "@/lib/brand";
import WaitingAnalysisScreen from "@/components/cdv/WaitingAnalysisScreen";

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
  title,
  description,
  descriptionSupport,
  formPanel,
  resultsPanel,
  hasResult,
  scheduleTable,
}: RaioXLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF5EA]">
      {/* ── Hero ── */}
      <section className="bg-[#0A0A08] text-white pt-8 pb-16 w-full px-4 md:px-5 lg:px-8 print:bg-white print:text-black print:p-0 print:border-none">
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

        <div className="max-w-7xl mx-auto print:hidden">
          {/* Botão Voltar - Padronizado */}
          <Link
            to="/simuladores#cat-01"
            className="inline-flex items-center gap-2 text-[#FF4E1F] font-['IBM_Plex_Mono'] text-[14px] md:text-[15px] font-semibold uppercase tracking-widest hover:text-[#FFC93C] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Título - Fonte Display */}
          <h1 className="font-['Archivo_Black'] text-2xl md:text-3xl lg:text-4xl mb-4 leading-tight text-white uppercase">
            {title}
          </h1>

          {/* Descrição - Estilo Suave */}
          <div className="text-[#C9C4B8] text-[14px] md:text-[15px] md:text-base max-w-3xl leading-relaxed">
            {description}
          </div>

          {/* Suporte descritivo */}
          {descriptionSupport && (
            <p className="text-[#79746A] text-[14px] md:text-[15px] md:text-[14px] md:text-[15px] mt-2 font-normal leading-relaxed max-w-3xl">
              {descriptionSupport}
            </p>
          )}
        </div>
      </section>

      {/* ── Grid principal ── */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-5 lg:px-8 py-8 print:p-0">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Coluna esquerda — Formulário */}
          <div id="parametros" className="w-full lg:w-[40%] lg:shrink-0 print:hidden mb-8 lg:mb-0 scroll-mt-24">
            <div className="bg-white border border-[#DDD6C8] rounded-xl p-6 shadow-sm">
              {formPanel}
            </div>
          </div>

          {/* Coluna direita — Resultados */}
          <div className="flex-1 min-w-0 w-full">
            <WaitingAnalysisScreen>
              {resultsPanel}
            </WaitingAnalysisScreen>
          </div>
        </div>
      </section>

      {/* ── Tabela de Evolução (Full-width) ── */}
      {hasResult && scheduleTable && (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-5 lg:px-8 pb-16">
          {scheduleTable}
        </section>
      )}
    </div>
  );
}
