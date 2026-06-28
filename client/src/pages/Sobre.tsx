/**
 * Página Sobre — Renato Ladeia
 * Layout: vídeo 4:5 lado esquerdo (autoplay, loop, sem download) + texto lado direito
 */

export default function Sobre() {
  return (
    <div className="min-h-screen bg-[var(--ink)] text-white">
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">

        {/* ── Grid: vídeo (esq) + apresentação (dir) ── */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">

          {/* Vídeo 4:5 — lado esquerdo */}
          <div
            className="w-full lg:w-auto lg:shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ maxWidth: "340px", width: "100%" }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="relative" style={{ aspectRatio: "4/5" }}>
              <video
                src="/manus-storage/video_sem_logo_38c4444a.mp4"
                autoPlay
                loop
                playsInline
                disablePictureInPicture
                controlsList="nodownload noremoteplayback"
                className="absolute inset-0 w-full h-full object-cover bg-black select-none pointer-events-none"
                style={{ userSelect: "none" }}
              />
              {/* Overlay transparente para bloquear clique-direito e arrastar */}
              <div
                className="absolute inset-0 z-10"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ cursor: "default" }}
              />
            </div>
          </div>

          {/* Texto de apresentação — lado direito */}
          <div className="flex-1 flex flex-col justify-center gap-6 lg:pt-4">

            {/* Nome + LinkedIn */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Renato Ladeia
              </h1>
              <a
                href="https://www.linkedin.com/in/renatoladeia"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn de Renato Ladeia"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0A66C2] hover:bg-[#0077b5] transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            {/* Credenciais */}
            <div className="space-y-1">
              <p className="text-white/75 text-base md:text-lg leading-relaxed">
                Mais de 15 anos de experiência no mercado financeiro
              </p>
              <p className="text-white/45 text-sm tracking-wide">
                Consultor de Investimentos Independente · CVM · Certificado CEA
              </p>
            </div>

            {/* Separador */}
            <div className="w-12 h-0.5 bg-[var(--orange)] rounded-full" />

            {/* Texto de apresentação */}
            <div className="space-y-4 text-white/70 text-base leading-relaxed max-w-xl">
              <p>
                O <strong className="text-white">Consórcio de Verdade</strong> foi construído para dar clareza a uma decisão que costuma ser apresentada de forma simples demais.
              </p>
              <p>
                O consórcio pode fazer sentido em muitos cenários, mas não deve ser tratado como solução universal. Por isso, este espaço reúne simulações, análises e explicações para que cada pessoa consiga enxergar o produto por inteiro: o que ele entrega, o que ele não promete, onde pode funcionar e onde pode gerar frustração.
              </p>
              <p>
                A ideia é simples: menos discurso pronto, mais entendimento real.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
