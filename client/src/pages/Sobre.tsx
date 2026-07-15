import { Link } from "wouter";
import { BRAND } from "@/lib/brand";
import { useState, useRef } from "react";
import { Linkedin } from "lucide-react";

export default function Sobre() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      // Define o volume para 50% quando o áudio é ativado
      if (!videoRef.current.muted) {
        videoRef.current.volume = 0.5;
      }
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen font-sans selection:bg-[var(--orange)] selection:text-white overflow-x-hidden">
      
      {/* ── HERO ────────────────────────────────────────────────────────────────── */}
      <section className="py-6 md:py-10 border-b border-[var(--ink)]/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
            
            {/* Esquerda (Largura reduzida ~25-30%) */}
            <div className="w-full md:w-[28%] flex flex-col gap-3">
              <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-[var(--paper)] border border-[var(--ink)]/5 relative group">
                <video
                  ref={videoRef}
                  src="/assets/video-perfil.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover grayscale-[0.2]"
                />
                
                {/* Botão Mute/Unmute */}
                <button
                  onClick={toggleMute}
                  className="absolute bottom-3 right-3 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all active:scale-90"
                  title={isMuted ? "Ativar som" : "Desativar som"}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                {/* Overlay de proteção contra clique direito no vídeo */}
                <div 
                  className="absolute inset-0 z-10" 
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              
              {/* Links removidos conforme solicitado */}
            </div>

            {/* Direita (Conteúdo aproximado) */}
            <div className="w-full md:w-[72%]">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--ink)] tracking-tight">
                  Renato Ladeia
                </h1>
                <a 
                  href={BRAND.linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-foreground/40 hover:text-[var(--orange)] transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
                </a>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--ink)]/50 mb-6 uppercase tracking-wider">
                <span>Consultor de Investimentos Independente</span>
                <span className="w-1 h-1 rounded-full bg-[var(--ink)]/20" />
                <span>Registro CVM</span>
                <span className="w-1 h-1 rounded-full bg-[var(--ink)]/20" />
                <span>CEA</span>
              </div>

              <div className="max-w-[560px]">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-[var(--ink)] leading-[1.1] mb-3">
                  A estratégia vem antes da <span className="text-[var(--orange)]">escolha do produto.</span>
                </h2>
                
                <p className="text-[14px] md:text-[15px] md:text-base text-[var(--ink)]/50 mb-8 font-medium max-w-[480px]">
                  Porque produtos financeiros não são um objetivo. São ferramentas para executar uma estratégia.
                </p>
                
                <a
                  href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-[var(--orange)] text-white text-[14px] md:text-[15px] font-bold px-8 py-3.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[var(--orange)]/10"
                >
                  Solicitar análise estratégica
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOCO 2: TEXTO PRINCIPAL ────────────────────────────────────────────── */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-3xl">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-6 leading-tight">
              Antes de escolher um produto, <br className="hidden md:block" />
              eu escolho a estratégia.
            </h3>
            <div className="space-y-4 text-[14px] md:text-[15px] md:text-base text-[var(--ink)]/70 leading-relaxed max-w-[650px]">
              <p>
                A maioria das decisões financeiras começa pelo lugar errado. Primeiro escolhe-se o produto. Depois tenta-se descobrir se ele realmente faz sentido.
              </p>
              <p>
                Minha metodologia segue o caminho inverso. Primeiro compreendo patrimônio, objetivos, prazo, fluxo de caixa e contexto. Só então identifico qual estratégia oferece a melhor relação entre custo, risco e resultado.
              </p>
              <p>
                Em alguns casos será um consórcio. Em outros, um financiamento, um investimento ou até mesmo não contratar nenhum produto naquele momento.
              </p>
              <p className="text-[var(--ink)] font-semibold pt-2">
                Minha função não é indicar produtos. É identificar a estratégia mais adequada para cada contexto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOCO 3: METODOLOGIA ────────────────────────────────────────────────── */}
      <section className="py-10 md:py-14 border-t border-[var(--ink)]/5 bg-[var(--paper)]">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mb-12 text-center">
            Como uma estratégia é construída.
          </h3>
          
          <div className="relative max-w-5xl mx-auto px-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="relative flex items-center justify-between min-w-[800px] md:min-w-0 py-4">
              {/* Linha conectora (sempre horizontal) */}
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--ink)]/10 -translate-y-1/2 z-0" />
              
              {[
                "Objetivo", "Patrimônio", "Prazo", "Fluxo de caixa", "Perfil", "Comparação", "Estratégia", "Produto recomendado"
              ].map((step) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-3 px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--orange)] shadow-[0_0_0_4px_rgba(255,107,0,0.05)]" />
                  <span className="text-[10px] md:text-[12px] uppercase tracking-widest font-bold text-[var(--ink)]/80 whitespace-nowrap text-center">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-[10px] md:text-[13px] md:text-[14px] font-serif italic text-[var(--ink)]/40 uppercase tracking-widest">
              O produto é consequência da estratégia.
            </p>
          </div>
        </div>
      </section>

      {/* ── BLOCO 4: CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="bg-[var(--ink)] py-10 md:py-14 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight max-w-2xl mx-auto">
            O melhor produto muda com o contexto. <br className="hidden md:block" />
            <span className="text-[var(--orange)]">A estratégia certa começa entendendo você.</span>
          </h3>
          <p className="text-[14px] md:text-[15px] text-white/50 mb-8 max-w-xl mx-auto leading-relaxed">
            Uma análise baseada em evidências reduz conflitos de interesse e aumenta a probabilidade de uma decisão coerente com seus objetivos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-[var(--orange)] text-white text-[14px] md:text-[15px] font-bold px-10 py-3.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[var(--orange)]/10"
            >
              Solicitar análise estratégica
            </a>
            <Link
              href="/simuladores"
              className="w-full sm:w-auto border border-white/20 text-white text-[14px] md:text-[15px] font-semibold px-10 py-3.5 rounded-full hover:bg-white hover:text-[var(--ink)] active:scale-95 transition-all"
            >
              Conhecer os simuladores
            </Link>
          </div>
        </div>
      </section>

      {/* ── RODAPÉ EDITORIAL ────────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-[var(--ink)]/5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] text-[var(--ink)]/60 italic max-w-md mx-auto leading-relaxed">
            "O melhor produto financeiro não é aquele que vende mais. <br />
            É aquele que faz mais sentido para você."
          </p>
        </div>
      </footer>

    </div>
  );
}
