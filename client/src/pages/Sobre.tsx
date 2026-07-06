/**
 * Página r.enatto — Renato Ladeia
 * Layout: 1/3 vídeo (esq) + 2/3 texto (dir)
 * Proporções exatas conforme especificação do prompt
 */
import { BRAND } from "@/lib/brand";

export default function Sobre() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen flex flex-col">
      <main className="flex-1 w-full px-4 md:px-8 py-8 md:py-12 flex items-center justify-center">

        {/* ── Container principal: 1/3 foto + 2/3 texto ── */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start w-full max-w-6xl mx-auto">

          {/* Coluna esquerda — Vídeo 4:5 (1/3) + Social */}
          <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col gap-4">
            <div
              className="w-full rounded-xl overflow-hidden shadow-xl border border-[var(--ink)]/10 h-fit"
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="relative" style={{ aspectRatio: "4/5" }}>
                <video
                  src="/assets/video-perfil.mp4"
                  autoPlay
                  loop
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload noremoteplayback"
                  className="absolute inset-0 w-full h-full object-cover bg-[var(--ink)] select-none"
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

            {/* Redes Sociais */}
            <div className="flex flex-col gap-3 px-1">
              <a href="https://instagram.com/consorcio.deverdade" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-[var(--ink)]/70 hover:text-[var(--orange)] transition-colors uppercase tracking-wider">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                @consorcio.deverdade
              </a>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ink)]/40 uppercase tracking-wider">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                @consorciodeverdade <span className="opacity-50 ml-1">(em breve)</span>
              </div>
              <a href="https://instagram.com/investir.deverdade" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-[var(--ink)]/70 hover:text-[var(--orange)] transition-colors uppercase tracking-wider">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                @investir.deverdade
              </a>

              {/* Spotify Player */}
              <div className="mt-4">
                <iframe
                  style={{ borderRadius: "12px" }}
                  src="https://open.spotify.com/embed/artist/2JkpXm8JTPRRa9CJevpxAR?utm_source=generator&si=fdc09701ccaf49b8"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Coluna direita — Texto (2/3) */}
          <div className="w-full md:w-3/4 flex-1 flex flex-col justify-start gap-5">

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
                O <strong>Consórcio de Verdade</strong> nasceu da constatação de uma lacuna no mercado: a dificuldade de encontrar informações realmente claras, técnicas e independentes para avaliar um consórcio. Em muitos casos, a decisão ainda é tomada com base apenas no valor da parcela, enquanto fatores como custo total, reajustes, contemplação e eficiência da operação permanecem em segundo plano.
              </p>
              <p>
                Este projeto reúne dados, análises e simuladores desenvolvidos para tornar essa decisão mais consciente. O objetivo não é incentivar ou desestimular a contratação de um consórcio, mas oferecer ferramentas que permitam compreender a operação em profundidade antes de assumir um compromisso de longo prazo.
              </p>
              <p>
                Mais do que comparar propostas, a proposta é ajudar você a validar se o consórcio faz sentido para o seu patrimônio, seus objetivos e sua estratégia financeira.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
