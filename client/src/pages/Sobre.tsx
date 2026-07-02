/**
 * Página r.enatto — Renato Ladeia
 * Layout: 1/3 vídeo (esq) + 2/3 texto (dir)
 * Proporções exatas conforme especificação do prompt
 */
import { BRAND } from "@/lib/brand";

export default function Sobre() {
  return (
    <div className="bg-[var(--ink)] text-white min-h-screen max-h-screen overflow-hidden flex flex-col">
      <main className="flex-1 w-full px-4 md:px-8 py-6 md:py-8 flex items-center justify-center overflow-y-auto">

        {/* ── Container principal: 1/3 foto + 2/3 texto ── */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start w-full max-w-6xl mx-auto">

          {/* Coluna esquerda — Vídeo 4:5 (1/3) */}
          <div
            className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 rounded-xl overflow-hidden shadow-xl border border-white/10 h-fit"
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

          {/* Coluna direita — Texto (2/3) */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex-1 flex flex-col justify-start gap-4 max-h-[calc(100vh-120px)] overflow-y-auto">

            {/* Logo r.enatto em amarelo */}
            <div className="mb-2">
              <p className="text-2xl md:text-3xl font-bold tracking-tight">
                <span className="text-white">r.</span><span className="text-[#FFD700]">enatto</span>
              </p>
            </div>

            {/* Texto centralizado em maiúsculas */}
            <div className="mb-4">
              <p className="text-sm md:text-base font-bold uppercase tracking-wide text-white/90 leading-relaxed">
                O Consórcio de Verdade nasceu de uma pergunta simples: como entender esse produto de verdade?
              </p>
            </div>

            {/* Separador */}
            <div className="w-10 h-0.5 bg-[var(--orange)] rounded-full" />

            {/* Texto de origem do projeto */}
            <div className="space-y-3 text-white/75 text-sm leading-relaxed flex-1 overflow-y-auto">
              <p>
                Quando comecei a estudar consórcio, percebi que a maioria das pessoas toma a decisão olhando apenas a parcela. Ninguém fala sobre custo total, correção, lance, contemplação ou capacidade real de pagamento.
              </p>
              <p>
                Criei esta plataforma para transformar uma promessa comercial em análise. Aqui você simula cenários, entende os números e toma uma decisão com consciência — não com impulso.
              </p>
              <p>
                Se depois quiser uma leitura individual do seu caso, eu analiso com você. Porque uma boa decisão não começa pela venda. Começa pela clareza.
              </p>
            </div>

            {/* Botão discreto */}
            <div className="pt-1 mt-auto flex-shrink-0">
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[var(--orange)] transition-colors"
              >
                Conheça quem está por trás desse projeto →
              </a>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
