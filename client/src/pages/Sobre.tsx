/**
 * Página Sobre — Renato Ladeia
 * Design: minimalista, fundo preto, vídeo sem logomarca, nome + cargo + LinkedIn
 */

export default function Sobre() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ── Conteúdo central ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-10">

          {/* Vídeo */}
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <video
              src="/manus-storage/WhatsAppVideo2026-06-27at00.11.16_1f5dc526.mp4"
              controls
              playsInline
              className="w-full aspect-video object-cover bg-black"
            />
          </div>

          {/* Identidade */}
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Nome + LinkedIn */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Renato Ladeia
              </h1>
              <a
                href="https://www.linkedin.com/in/renatoladeia"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn de Renato Ladeia"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2] hover:bg-[#0077b5] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            {/* Cargo e certificações */}
            <div className="space-y-1">
              <p className="text-white/70 text-base md:text-lg">
                Mais de 15 anos de experiência no mercado financeiro
              </p>
              <p className="text-white/50 text-sm tracking-wide">
                Consultor de Investimentos Independente · CVM · Certificado CEA
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
