import { LOGO, BRAND } from "@/lib/brand";

interface WaitingAnalysisScreenProps {
  className?: string;
  label?: string;
  internalMenu?: React.ReactNode;
}

export default function WaitingAnalysisScreen({
  className = "",
  label = "Aguardando análise",
  internalMenu,
}: WaitingAnalysisScreenProps) {
  return (
    <>
      {internalMenu}
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={`relative isolate flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#050505] px-6 py-10 text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:min-h-[400px] ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_center,rgba(255,78,31,0.11),transparent_46%)]"
        />

        <img
          src={LOGO.light}
          alt={BRAND.name}
          className="relative z-10 h-auto w-[min(76%,340px)] object-contain"
        />

        <p className="absolute bottom-5 right-5 z-10 max-w-[70%] text-right font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72 sm:bottom-6 sm:right-6 sm:text-[12px]">
          {label}
        </p>
      </div>
    </>
  );
}
