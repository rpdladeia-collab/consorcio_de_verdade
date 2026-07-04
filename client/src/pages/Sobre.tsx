/**
 * Página r.enatto — Renato Ladeia
 * Layout: 1/3 vídeo (esq) + 2/3 texto (dir)
 * Proporções exatas conforme especificação do prompt
 */
import { BRAND } from "@/lib/brand";

export default function Sobre() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen flex flex-col">
      <main className="flex-1 w-full px-4 md:px-8 py-10 md:py-16 flex items-center justify-center">

        {/* ── Container principal: 1/3 foto + 2/3 texto ── */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start w-full max-w-6xl mx-auto">

          {/* Coluna esquerda — Vídeo 4:5 (1/3) */}
          <div
            className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 rounded-xl overflow-hidden shadow-xl border border-[var(--ink)]/10 h-fit"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="relative" style={{ aspectRatio: "4/5" }}>
              <video
                src="/assets/video-perfil.mp4"
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                controlsList="nodownload noremoteplayback"
                className="absolute inset-0 w-full h-full object-cover bg-[var(--ink)] select-none pointer-events-none"
                style={{ userSelect: "none" }}
              />
              {/* Overlay para bloquear clique-direito e arrastar */}
              <div
                className="absolute inset-0 z-10"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ cursor: "default" }}
              />
            </div>
          </div>

          {/* Coluna direita — Texto (2/3) */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex-1 flex flex-col justify-start gap-6">

            {/* Cabeçalho: Nome + LinkedIn */}
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
                Renato Ladeia
              </h1>
              <a
                href={BRAND.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--ink)]/30 hover:text-[var(--orange)] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>

            {/* Subtítulo: Qualificações */}
            <div className="space-y-1">
              <p className="text-sm md:text-base font-medium text-[var(--ink)]/80">
                Consultor de Investimentos Independente | Registro CVM | CEA
              </p>
              <p className="text-xs md:text-sm text-[var(--ink)]/60">
                Mais de 15 anos atuando com produtos financeiros.
              </p>
            </div>

            {/* Separador */}
            <div className="w-12 h-0.5 bg-[var(--orange)] rounded-full" />

            {/* Texto Institucional */}
            <div className="space-y-5 text-[var(--ink)]/75 text-sm md:text-base leading-relaxed max-w-2xl">
              <p>
                Criei o <strong>Consórcio de Verdade</strong> porque percebi uma lacuna crítica no mercado: a dificuldade de encontrar informações realmente úteis e transparentes. Na maioria das vezes, as pessoas contratam um consórcio baseadas apenas no valor da parcela, sem compreender a complexidade real da operação.
              </p>
              <p>
                Meu objetivo com este projeto é transformar essa realidade. Reuni ferramentas e dados para que qualquer pessoa possa tomar uma decisão consciente, enxergando o que normalmente fica oculto nos contratos.
              </p>
              <p>
                Aqui, a prioridade é a <strong>análise e a estratégia</strong>. Não estou aqui para vender produtos, mas para ajudar você a validar se o consórcio é, de fato, o melhor caminho para o seu patrimônio e seus objetivos de vida.
              </p>
            </div>

            {/* Botão de ação principal */}
            <div className="pt-4">
              <a
                href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-white px-8 py-3 text-sm md:text-base font-bold transition-all hover:bg-[var(--ink)]/90 active:scale-95"
              >
                Solicitar análise individual
              </a>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
