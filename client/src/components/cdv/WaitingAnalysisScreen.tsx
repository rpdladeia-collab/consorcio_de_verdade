interface WaitingAnalysisScreenProps {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

export default function WaitingAnalysisScreen({
  className = "",
  label = "Aguardando análise",
  children,
}: WaitingAnalysisScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`relative isolate flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl bg-transparent px-6 py-10 text-white shadow-none sm:min-h-[400px] ${className}`}
    >
      {children ? (
        children
      ) : (
        <div className="text-center opacity-50">
          <p className="font-['IBM_Plex_Mono'] text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
