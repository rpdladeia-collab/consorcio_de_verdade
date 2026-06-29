/**
 * Página r.enatto — Renato Ladeia
 * Layout compacto: vídeo 4:5 lado esquerdo + texto lado direito
 * Fontes reduzidas para caber na tela sem scroll
 */
import { BRAND } from "@/lib/brand";

export default function Sobre() {
  return (
    <div className="bg-[var(--ink)] text-white min-h-full">
      <main className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* ── Grid: vídeo (esq) + apresentação (dir) ── */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">

          {/* Vídeo 4:5 — lado esquerdo */}
          <div
            className="w-full lg:w-auto lg:shrink-0 rounded-xl overflow-hidden shadow-xl border border-white/10"
            style={{ maxWidth: "260px", width: "100%" }}
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
              {/* Overlay para bloquear clique-direito e arrastar */}
              <div
                className="absolute inset-0 z-10"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ cursor: "default" }}
              />
            </div>
          </div>

          {/* Texto de apresentação — lado direito */}
          <div className="flex-1 flex flex-col justify-center gap-4">

            {/* Nome + LinkedIn */}
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Renato Ladeia
              </h1>
              <a
                href={BRAND.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn de Renato Ladeia"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--orange)] hover:bg-[var(--orange)]/80 transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            {/* Credenciais */}
            <div className="space-y-0.5">
              <p className="text-white/55 text-xs tracking-wide">
                Consultor de Investimentos Independente · CVM · Certificação CEA
              </p>
              <p className="text-white/65 text-sm leading-snug">
                Mais de 15 anos de experiência no mercado financeiro
              </p>
            </div>

            {/* Separador */}
            <div className="w-10 h-0.5 bg-[var(--orange)] rounded-full" />

            {/* Texto de apresentação */}
            <div className="space-y-3 text-white/70 text-sm leading-relaxed max-w-lg">
              <p>
                O <strong className="text-white">Consórcio de Verdade</strong> nasceu para dar clareza a uma decisão que costuma ser apresentada de forma simples demais.
              </p>
              <p>
                Consórcio pode fazer sentido em muitos cenários, mas não deve ser contratado apenas porque a parcela parece caber no bolso ou porque alguém prometeu contemplação rápida.
              </p>
              <p>
                Por isso, criei uma plataforma aberta, com simuladores, análises e explicações para que qualquer pessoa consiga entender o custo, o lance, as correções, a contemplação e o impacto real do consórcio no próprio orçamento.
              </p>
              <p>
                Se mesmo depois de usar os simuladores você quiser uma leitura individual do seu caso, posso analisar sua proposta com critério, independência e responsabilidade.
              </p>
              <p>
                A ideia é simples: menos promessa pronta, mais conta aberta.
              </p>
            </div>

            {/* Botão CTA */}
            <div className="pt-1">
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
              >
                Pedir análise individual
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
