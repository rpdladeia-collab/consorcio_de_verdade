
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, PlayCircle, Instagram, ChevronLeft, ChevronRight, X, Volume2, VolumeX, AlertCircle } from 'lucide-react';

const CARROSSEIS = [
  { 
    id: "renda",
    title: "Comprovação de Renda", 
    tag: "ANÁLISE DE CRÉDITO",
    description: "Por que a comprovação de renda no consórcio pode ser tão rigorosa quanto em um financiamento.",
    slides: [
      "/assets/carrossel-renda/slide-01.png",
      "/assets/carrossel-renda/slide-02.png",
      "/assets/carrossel-renda/slide-03.png",
      "/assets/carrossel-renda/slide-04.png",
      "/assets/carrossel-renda/slide-05.png",
      "/assets/carrossel-renda/slide-06.png"
    ]
  },
  { 
    id: "alerta",
    title: "Na Dúvida, Não Faça!", 
    tag: "ALERTA",
    description: "Checklist essencial antes de assinar qualquer contrato de consórcio.",
    image: "/assets/alerta/na-duvida-nao-faca.png"
  },
  { 
    id: "taxas",
    title: "Taxa de Administração", 
    tag: "ANÁLISE DE CUSTOS",
    description: "Entenda como a taxa de administração impacta o seu investimento em consórcio.",
    slides: [
      "/assets/carrossel-taxa/slide-01.png",
      "/assets/carrossel-taxa/slide-02.png",
      "/assets/carrossel-taxa/slide-03.png",
      "/assets/carrossel-taxa/slide-04.png",
      "/assets/carrossel-taxa/slide-05.png",
      "/assets/carrossel-taxa/slide-06.png",
      "/assets/carrossel-taxa/slide-07.png",
      "/assets/carrossel-taxa/slide-08.png"
    ]
  },
  { 
    id: "lance-embutido",
    title: "Lance Embutido", 
    tag: "ESTRATÉGIA",
    description: "Descubra os riscos e benefícios de usar lance embutido no seu consórcio.",
    slides: [
      "/assets/carrossel-lance-embutido/slide-01.png",
      "/assets/carrossel-lance-embutido/slide-02.png",
      "/assets/carrossel-lance-embutido/slide-03.png",
      "/assets/carrossel-lance-embutido/slide-04.png",
      "/assets/carrossel-lance-embutido/slide-05.png",
      "/assets/carrossel-lance-embutido/slide-06.png",
      "/assets/carrossel-lance-embutido/slide-07.png"
    ]
  },


  { 
    id: "estatisticas",
    title: "Sorteio vs Lance", 
    tag: "DADOS",
    description: "As chances reais de contemplacao em grupos novos vs grupos em andamento.",
    slides: [
      "/assets/carrossel-estatisticas/slide-01.png",
      "/assets/carrossel-estatisticas/slide-02.png",
      "/assets/carrossel-estatisticas/slide-03.jpg"
    ]
  },
  { 
    id: "custo-oportunidade",
    title: "Consorcio nao e Poupanca", 
    tag: "ANALISE FINANCEIRA",
    description: "Entenda o custo de oportunidade e por que consorcio nao e um investimento.",
    slides: [
      "/assets/carrossel-custo-oportunidade/slide-01.png",
      "/assets/carrossel-custo-oportunidade/slide-02.png",
      "/assets/carrossel-custo-oportunidade/slide-03.png",
      "/assets/carrossel-custo-oportunidade/slide-04.png",
      "/assets/carrossel-custo-oportunidade/slide-05.png",
      "/assets/carrossel-custo-oportunidade/slide-06.png",
      "/assets/carrossel-custo-oportunidade/slide-07.png",
      "/assets/carrossel-custo-oportunidade/slide-08.png",
      "/assets/carrossel-custo-oportunidade/slide-09.png"
    ]
  },
  { 
    id: "lance-categoria",
    title: "Lance por Categoria", 
    tag: "ESTRATEGIA",
    description: "Entenda como o lance varia conforme a categoria e o valor da carta de credito.",
    slides: [
      "/assets/carrossel-lance-categoria/slide-01.png",
      "/assets/carrossel-lance-categoria/slide-02.png",
      "/assets/carrossel-lance-categoria/slide-03.png",
      "/assets/carrossel-lance-categoria/slide-04.png",
      "/assets/carrossel-lance-categoria/slide-05.png",
      "/assets/carrossel-lance-categoria/slide-06.png",
      "/assets/carrossel-lance-categoria/slide-07.png",
      "/assets/carrossel-lance-categoria/slide-08.png"
    ]
  },
  { 
    id: "lance-embutido-v2",
    title: "Lance Embutido - Analise Completa", 
    tag: "AUDITORIA",
    description: "Analise detalhada: por que o lance embutido e tao oferecido e seus riscos reais.",
    slides: [
      "/assets/carrossel-lance-embutido-v2/slide-01.png",
      "/assets/carrossel-lance-embutido-v2/slide-02.png",
      "/assets/carrossel-lance-embutido-v2/slide-03.png",
      "/assets/carrossel-lance-embutido-v2/slide-04.png",
      "/assets/carrossel-lance-embutido-v2/slide-05.png",
      "/assets/carrossel-lance-embutido-v2/slide-06.png",
      "/assets/carrossel-lance-embutido-v2/slide-07.png",
      "/assets/carrossel-lance-embutido-v2/slide-08.png",
      "/assets/carrossel-lance-embutido-v2/slide-09.jpg"
    ]
  },
  { 
    id: "lance-fixo",
    title: "Lance Fixo", 
    tag: "ESTRATEGIA",
    description: "Entenda o que e lance fixo, como funciona e quando pode ser combinado com embutido.",
    slides: [
      "/assets/carrossel-lance-fixo/slide-01.png",
      "/assets/carrossel-lance-fixo/slide-02.png",
      "/assets/carrossel-lance-fixo/slide-03.png",
      "/assets/carrossel-lance-fixo/slide-04.png",
      "/assets/carrossel-lance-fixo/slide-05.png",
      "/assets/carrossel-lance-fixo/slide-06.png",
      "/assets/carrossel-lance-fixo/slide-07.png",
      "/assets/carrossel-lance-fixo/slide-08.png"
    ]
  },
  { 
    id: "eficiencia-lance",
    title: "Eficiencia do Lance", 
    tag: "AUDITORIA",
    description: "Quanto maior o lance, menor a eficiencia. Entenda a matematica por tras disso.",
    slides: [
      "/assets/carrossel-eficiencia-lance/slide-01.png",
      "/assets/carrossel-eficiencia-lance/slide-02.png",
      "/assets/carrossel-eficiencia-lance/slide-03.png",
      "/assets/carrossel-eficiencia-lance/slide-04.png",
      "/assets/carrossel-eficiencia-lance/slide-05.png",
      "/assets/carrossel-eficiencia-lance/slide-06.png",
      "/assets/carrossel-eficiencia-lance/slide-07.png",
      "/assets/carrossel-eficiencia-lance/slide-08.jpg"
    ]
  },
  { 
    id: "semaforo-consorcio",
    title: "Semaforo do Consorcio", 
    tag: "GUIA PRATICO",
    description: "Entenda os sinais de alerta em cada fase do consorcio: vermelho, amarelo e verde.",
    slides: [
      "/assets/carrossel-semaforo/slide-01.png",
      "/assets/carrossel-semaforo/slide-02.png",
      "/assets/carrossel-semaforo/slide-03.png",
      "/assets/carrossel-semaforo/slide-04.png",
      "/assets/carrossel-semaforo/slide-05.png",
      "/assets/carrossel-semaforo/slide-06.png",
      "/assets/carrossel-semaforo/slide-07.png",
      "/assets/carrossel-semaforo/slide-08.png"
    ]
  },
  { 
    id: "ordem-preferencia",
    title: "Ordem de Preferencia", 
    tag: "GUIA PRATICO",
    description: "Onde contratar consorcio: Administradoras Especializadas > Bancos > Cooperativas.",
    slides: [
      "/assets/carrossel-preferencia/slide-01.png",
      "/assets/carrossel-preferencia/slide-02.png",
      "/assets/carrossel-preferencia/slide-03.png",
      "/assets/carrossel-preferencia/slide-04.png"
    ]
  },
  { 
    id: "correcao",
    title: "Correção do Consórcio", 
    tag: "MATEMÁTICA",
    description: "Consórcio não tem juros, mas tem correção. Entenda como isso muda o custo real do seu plano.",
    slides: [
      "/assets/carrossel-correcao/slide-01.png",
      "/assets/carrossel-correcao/slide-02.png",
      "/assets/carrossel-correcao/slide-03.png",
      "/assets/carrossel-correcao/slide-04.png",
      "/assets/carrossel-correcao/slide-05.png",
      "/assets/carrossel-correcao/slide-06.png",
      "/assets/carrossel-correcao/slide-07.png",
      "/assets/carrossel-correcao/slide-08.png",
      "/assets/carrossel-correcao/slide-09.png"
    ]
  },
  { 
    id: "essencia",
    title: "A Marca e a Essência", 
    tag: "INSTITUCIONAL",
    description: "A marca pode mudar, mas o compromisso com a verdade no consórcio continua o mesmo.",
    slides: [
      "/assets/carrossel-essencia/slide-01.jpg",
      "/assets/carrossel-essencia/slide-02.png",
      "/assets/carrossel-essencia/slide-03.png",
      "/assets/carrossel-essencia/slide-04.png",
      "/assets/carrossel-essencia/slide-05.png",
      "/assets/carrossel-essencia/slide-06.png"
    ]
  },
  { 
    id: "meia-parcela",
    title: "Meia Parcela", 
    tag: "ALERTA",
    description: "Por que a meia parcela pode ser o começo da sua frustração no consórcio.",
    image: "/assets/meia-parcela/meia-parcela.png"
  },
  { 
    id: "caixa-preta-menu",
    title: "Menu Caixa Preta", 
    tag: "INSTITUCIONAL",
    description: "Os 9 pilares da Caixa Preta do Consórcio - Tudo que você precisa saber.",
    slides: [
      "/manus-storage/B3B514FF-FE72-4417-A66D-3FA8FF3F15F2_e8cf98e3.png",
      "/manus-storage/2443AF92-73E6-4C2B-828D-BD45CF50BDF9_737b8d72.png",
      "/manus-storage/F123AEC3-225D-4BCA-BE47-64718DCB3BA9_0bb740f3.png",
      "/manus-storage/6DBFF4E1-2290-4253-993F-E4996B652AD7_38b06169.png",
      "/manus-storage/4E3C2CA5-3C2E-4908-921F-B6B5A1B8948B_0cbb16a3.png",
      "/manus-storage/9065E275-1979-4CB4-BEAB-9429F081C823_d191b555.png",
      "/manus-storage/F8754966-B640-4182-B25A-E35E3970F071_aee66249.png",
      "/manus-storage/8B65EC98-B478-4645-BA86-36ED7D2208A2_dda92d34.png",
      "/manus-storage/931F26FF-7C82-4982-B37A-B6C533427BAD_e9587969.png"
    ]
  },
  { 
    id: "conclusao",
    title: "Consórcio não é pra todos", 
    tag: "CONCLUSÃO",
    description: "Por que o consórcio precisa de uma análise séria e não é um produto universal.",
    image: "/assets/conclusao/conclusao.png"
  },

  { title: "O custo real do seguro", tag: "AUDITORIA", description: "Como o seguro de vida e quebra de garantia impactam o seu Custo Efetivo Total." },
  { title: "Sorteio vs Lance: A matemática", tag: "DADOS", description: "As chances reais de contemplação em grupos novos vs grupos em andamento." },
  { title: "Por que 48% desistem?", tag: "MERCADO", description: "Uma análise sobre o alto índice de exclusão e cancelamento no Brasil." },
  { title: "Como ler seu extrato", tag: "TUTORIAL", description: "Aprenda a identificar taxas, correções e amortizações no seu extrato mensal." },
];

const VIDEOS = [
  { id: 1, title: "Análise 1", tag: "DADOS", description: "O que você precisa saber", src: "/assets/videos-caixa-preta/video1.mp4" },
  { id: 2, title: "Análise 2", tag: "AUDITORIA", description: "Aprofundando a estratégia", src: "/assets/videos-caixa-preta/video2.mov" },
  { id: 3, title: "Análise 3", tag: "ESTRATÉGIA", description: "Terceira análise em vídeo", src: "/assets/videos-caixa-preta/video3.mp4" },
  { id: 4, title: "Análise 4", tag: "AUDITORIA", description: "Análise complementar", src: "/assets/videos-caixa-preta/video4.mp4" },
];

function CarrosselModal({ isOpen, onClose, slides, title }: { isOpen: boolean; onClose: () => void; slides: string[]; title: string }) {
  const [current, setCurrent] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A08]/98 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <span className="font-['IBM_Plex_Mono'] text-[11px] text-white/40 uppercase tracking-[0.2em]">
          Slide {current + 1} de {slides.length}
        </span>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-[#FFC93C] hover:text-[#0A0A08] transition-all rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative max-w-[500px] w-full aspect-[4/5] bg-black shadow-2xl overflow-hidden rounded-sm border border-white/5">
        <img 
          src={slides[current]} 
          alt={`${title} - Slide ${current + 1}`}
          className="w-full h-full object-contain bg-[#0A0A08] select-none"
        />

        {/* Navegação */}
        <button 
          onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev > 0 ? prev - 1 : slides.length - 1)); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-md flex items-center justify-center rounded-full text-white border border-white/10 hover:bg-[#FFC93C] hover:text-black transition-all group"
        >
          <ChevronLeft className="w-6 h-6 group-active:scale-90 transition-transform" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev < slides.length - 1 ? prev + 1 : 0)); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-md flex items-center justify-center rounded-full text-white border border-white/10 hover:bg-[#FFC93C] hover:text-black transition-all group"
        >
          <ChevronRight className="w-6 h-6 group-active:scale-90 transition-transform" />
        </button>

        {/* Barra de Progresso Superior */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1 flex-1 transition-all duration-300 ${i <= current ? 'bg-[#FFC93C]' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageModal({ isOpen, onClose, image, title }: { isOpen: boolean; onClose: () => void; image: string; title: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A08]/98 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-[#FFC93C] hover:text-[#0A0A08] transition-all rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative max-w-2xl w-full bg-black shadow-2xl overflow-hidden rounded-sm border border-white/5">
        <img 
          src={image} 
          alt={title}
          className="w-full h-auto object-contain bg-[#0A0A08]"
        />
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: typeof VIDEOS[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = 0.1;
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="border border-[#E4DCC9] bg-white rounded-sm overflow-hidden group transition-all hover:border-[#FFC93C]/30 hover:shadow-sm cursor-pointer">
      {/* Container de Vídeo - Sem Capa */}
      <div className="aspect-[9/16] bg-[#0A0A08] flex items-center justify-center relative overflow-hidden" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={video.src}
          className="w-full h-full object-contain"
          loop
          muted={isMuted}
          preload="auto"
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={(e) => {
            const videoElement = e.currentTarget;
            videoElement.currentTime = 0.1;
          }}
        />
      </div>

      {/* Rodapé do Card */}
      <div className="p-3 border-t border-[#E4DCC9] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#0A0A08] uppercase tracking-wider">
            Vídeo #{video.id}
          </span>
          <span className="text-[12px] text-gray-500 line-clamp-1 mt-0.5">
            {video.description}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full border border-[#E4DCC9] flex items-center justify-center group-hover:bg-[#0A0A08] group-hover:text-[#FFC93C] transition-all shrink-0">
          <PlayCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function CaixaPreta() {
  const [activeCarrossel, setActiveCarrossel] = useState<typeof CARROSSEIS[0] | null>(null);
  const [activeImage, setActiveImage] = useState<typeof CARROSSEIS[0] | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF5EA] text-[#0A0A08] font-sans selection:bg-[#FFC93C] selection:text-white">
      {/* HERO SECTION */}
      <section id="hero" className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-black scroll-mt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/bg-caixa-preta.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50 md:bg-black/70" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <Link
            to="/#hero"
            className="inline-flex items-center gap-2 text-[#FFC93C] font-mono text-[12px] md:text-[13px] font-semibold uppercase tracking-widest hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="font-['Archivo_Black'] text-4xl md:text-6xl text-white uppercase tracking-tight leading-tight">
            A <span className="bg-[#FFC93C] text-[#0A0A08] px-3 py-1 inline-block transform -skew-x-6">CAIXA PRETA</span> DO CONSÓRCIO
          </h1>
          <p className="mt-6 text-gray-300 text-[15px] md:text-[17px] max-w-2xl mx-auto leading-relaxed font-medium">
            O que os contratos escondem e os vendedores não contam. Desconstruindo as armadilhas do mercado, um conteúdo por vez.
          </p>
        </div>
      </section>

      {/* CONTEÚDO SOCIAL / CARROSSEIS */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#FFC93C] mb-4 font-bold font-['IBM_Plex_Mono']">
                Conteúdo Independente
              </span>
              <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl text-[#0A0A08] uppercase leading-none">
                Desconstruindo o Racional
              </h2>
            </div>
            <p className="text-[14px] text-gray-500 max-w-xs md:text-right">
              Análises visuais para quem prefere entender a matemática através de evidências.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {CARROSSEIS.map((item, i) => (
              <div 
                key={i} 
                onClick={() => {
                  if (item.slides) setActiveCarrossel(item);
                  else if (item.image) setActiveImage(item);
                }}
                className={`border border-[#E4DCC9] bg-white p-0 rounded-sm overflow-hidden group transition-all ${(item.slides || item.image) ? 'cursor-pointer hover:border-[#FFC93C]/30 hover:shadow-sm' : 'opacity-60 grayscale'}`}
              >
                {/* Imagem do Carrossel - Sem Capa */}
                <div className="aspect-[4/5] bg-[#0A0A08] flex items-center justify-center overflow-hidden">
                  {item.slides ? (
                    <img 
                      src={item.slides[0]} 
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-all duration-700"
                    />
                  ) : item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="p-8 flex flex-col items-center text-center text-white/20">
                      <span className="text-[10px] tracking-[0.2em] uppercase mb-4 font-bold font-['IBM_Plex_Mono']">
                        {item.tag}
                      </span>
                      <h3 className="font-['Archivo_Black'] text-xl md:text-2xl uppercase leading-tight tracking-tight">
                        {item.title}
                      </h3>
                      <div className="mt-8 bg-[#FFC93C] text-black text-[10px] px-3 py-1 font-black uppercase tracking-tighter rounded-sm">
                        Em breve
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Rodapé do Card */}
                <div className="p-3 border-t border-[#E4DCC9] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#0A0A08] uppercase tracking-wider">
                      Post #{i + 1}
                    </span>
                    <span className="text-[12px] text-gray-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </span>
                  </div>
                  {(item.slides || item.image) && (
                    <div className="w-8 h-8 rounded-full border border-[#E4DCC9] flex items-center justify-center group-hover:bg-[#0A0A08] group-hover:text-[#FFC93C] transition-all shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <CarrosselModal 
            isOpen={!!activeCarrossel} 
            onClose={() => setActiveCarrossel(null)} 
            slides={activeCarrossel?.slides || []} 
            title={activeCarrossel?.title || ""}
          />
          
          <ImageModal 
            isOpen={!!activeImage} 
            onClose={() => setActiveImage(null)} 
            image={activeImage?.image || ""} 
            title={activeImage?.title || ""}
          />
        </div>
      </section>

      {/* SEÇÃO VÍDEOS - GRID DE CARDS */}
      <section className="bg-[#0A0A08] py-12 md:py-16 px-6 text-white border-t-4 border-[#FFC93C]">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#FFC93C] mb-4 font-bold font-['IBM_Plex_Mono']">
                Análises em Vídeo
              </span>
              <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl uppercase leading-none">
                A Verdade em Movimento
              </h2>
            </div>
            <p className="text-[14px] text-gray-400 max-w-xs md:text-right">
              Vídeos curtos e diretos ao ponto, onde desmonto os argumentos de venda usando apenas dados oficiais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VIDEOS.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
