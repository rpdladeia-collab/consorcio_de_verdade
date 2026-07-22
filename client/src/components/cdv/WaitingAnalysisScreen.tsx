import { LOGO, BRAND } from "@/lib/brand";

interface WaitingAnalysisScreenProps {
  className?: string;
  label?: string;
}

export default function WaitingAnalysisScreen({
  className = "",
  label = "Aguardando análise",
}: WaitingAnalysisScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`relative isolate flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#F6F3EC] px-6 py-10 text-[#1C1A16] border border-[#DDD6C8] shadow-sm sm:min-h-[400px] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,rgba(255,78,31,0.05),transparent_60%)]"
      />

      <img
        src={LOGO.dark}
        alt={BRAND.name}
        className="relative z-10 h-10 md:h-12 w-auto object-contain opacity-90"
      />

      <p className="absolute bottom-5 right-5 z-10 max-w-[70%] text-right font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1A16]/40 sm:bottom-6 sm:right-6">
        {label}
      </p>
    </div>
  );
}
