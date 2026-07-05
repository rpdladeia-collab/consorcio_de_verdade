import React, { ReactNode } from "react";
import {
  ShieldCheck,
  Check,
  AlertTriangle,
  Info,
  PlayCircle,
  FileText,
  ChevronDown,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

/* ----------------------------------------------------------------------------
   Utilidades
---------------------------------------------------------------------------- */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(isFinite(value) ? value : 0);
}

export function formatBRLCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isFinite(value) ? value : 0);
}

export function formatPct(value: number, digits = 1): string {
  return `${(isFinite(value) ? value : 0).toFixed(digits).replace(".", ",")}%`;
}

export type Verdict = "positive" | "neutral" | "negative";

const verdictMap: Record<
  Verdict,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  positive: {
    label: "Favorável",
    color: "text-[var(--positive)]",
    bg: "bg-[color-mix(in_oklch,var(--positive)_12%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--positive)_35%,transparent)]",
    dot: "bg-[var(--positive)]",
  },
  neutral: {
    label: "Atenção",
    color: "text-[var(--orange)]",
    bg: "bg-[color-mix(in_oklch,var(--orange)_12%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--orange)_35%,transparent)]",
    dot: "bg-[var(--orange)]",
  },
  negative: {
    label: "Crítico",
    color: "text-[var(--destructive)]",
    bg: "bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)]",
    border: "border-[color-mix(in_oklch,var(--destructive)_35%,transparent)]",
    dot: "bg-[var(--destructive)]",
  },
};

/* ----------------------------------------------------------------------------
   Selo de Auditoria
---------------------------------------------------------------------------- */
export function AuditSeal({ className = "" }: { className?: string }) {
  return (
    <span className={`seal ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5" />
      Raio-X do Consórcio
    </span>
  );
}

/* ----------------------------------------------------------------------------
   Section wrapper editorial
---------------------------------------------------------------------------- */
export function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="eyebrow text-[var(--orange)] mb-2">{eyebrow}</p>}
      <h2 className="text-xl md:text-2xl font-extrabold">{title}</h2>
      {desc && <p className="text-foreground/60 mt-2 max-w-2xl">{desc}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   KPI Card (resultado principal)
---------------------------------------------------------------------------- */
export function KpiCard({
  label,
  value,
  hint,
  highlight = false,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  tone?: "default" | "positive" | "negative" | "orange";
}) {
  const toneColor =
    tone === "positive"
      ? "text-[var(--positive)]"
      : tone === "negative"
      ? "text-[var(--destructive)]"
      : tone === "orange"
      ? "text-[var(--orange)]"
      : "text-foreground";
  return (
    <div
      className={`rounded-lg p-3 border shadow-sm ${
        highlight
          ? "bg-[var(--ink)] text-[var(--paper)] border-transparent"
          : "bg-card border-border"
      }`}
    >
      <p
        className={`text-xs font-normal uppercase tracking-wide ${
          highlight ? "text-white/50" : "text-foreground/40"
        }`}
      >
        {label}
      </p>
      <p
        className={`data-num text-lg font-medium mt-1.5 ${
          highlight ? "text-[var(--orange)]" : toneColor
        }`}
      >
        {value}
      </p>
      {hint && (
        <p
          className={`text-xs mt-1 ${
            highlight ? "text-white/40" : "text-foreground/35"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Diagnóstico Executivo (narrativa + veredito)
---------------------------------------------------------------------------- */
export function DiagnosticCard({
  verdict,
  headline,
  narrative,
}: {
  verdict: Verdict;
  headline: string;
  narrative: ReactNode;
}) {
  const v = verdictMap[verdict];
  return (
    <div className={`rounded-2xl border ${v.border} ${v.bg} p-6 md:p-7`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
        <span className={`eyebrow ${v.color}`}>Diagnóstico · {v.label}</span>
      </div>
      <h3 className="text-xl md:text-2xl font-extrabold mb-3 leading-tight">
        {headline}
      </h3>
      <div className="text-foreground/75 leading-relaxed space-y-3 text-[15px]">
        {narrative}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Barra Antes/Depois (comparação visual)
---------------------------------------------------------------------------- */
export function BeforeAfterBar({
  label,
  total,
  value,
  caption,
}: {
  label: string;
  total: number;
  value: number;
  caption?: string;
}) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-foreground/70">{label}</span>
        <span className="data-num font-semibold">{formatBRL(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--orange)] transition-all duration-700"
          style={{ width: `${pct}%`, transitionTimingFunction: "var(--ease-out)" }}
        />
      </div>
      {caption && <p className="text-xs text-foreground/45 mt-1">{caption}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   "O que isso significa" — novo padrão: fundo preto, título temático amarelo
---------------------------------------------------------------------------- */
export function MeaningBlock({
  children,
  label = "O que isso significa",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-[var(--ink)] px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-yellow-400">
            {label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bg-[var(--ink)] px-5 pb-5 pt-1 text-white/70 leading-relaxed text-[13px] space-y-2 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Pontos positivos / de atenção
---------------------------------------------------------------------------- */
export function PointsList({
  positives,
  attentions,
}: {
  positives: string[];
  attentions: string[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-[color-mix(in_oklch,var(--positive)_30%,transparent)] bg-[color-mix(in_oklch,var(--positive)_8%,transparent)] p-5">
        <p className="eyebrow text-[var(--positive)] mb-3 flex items-center gap-1.5">
          <Check className="w-4 h-4" /> Pontos positivos
        </p>
        <ul className="space-y-2.5">
          {positives.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-[var(--positive)] shrink-0 mt-0.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-[color-mix(in_oklch,var(--orange)_30%,transparent)] bg-[color-mix(in_oklch,var(--orange)_8%,transparent)] p-5">
        <p className="eyebrow text-[var(--orange)] mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Pontos de atenção
        </p>
        <ul className="space-y-2.5">
          {attentions.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/80">
              <AlertTriangle className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Memória de cálculo (linhas)
---------------------------------------------------------------------------- */
export function CalcMemory({
  rows,
}: {
  rows: { label: string; value: string; formula?: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-2xl border border-border bg-[var(--ink)] text-[var(--paper)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--orange)]" />
          <span className="eyebrow text-white/50">Como essa projeção foi construída</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="divide-y divide-white/8">
          {rows.map((r, i) => (
            <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white/80">{r.label}</p>
                {r.formula && (
                  <p className="mono text-xs text-white/40 mt-0.5">{r.formula}</p>
                )}
              </div>
              <span className="data-num text-sm font-semibold text-[var(--orange)] shrink-0">
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Bloco recolhível (modo avançado)
---------------------------------------------------------------------------- */
export function Collapsible({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <div>
          <p className="font-semibold text-base">{title}</p>
          {subtitle && <p className="text-sm text-foreground/55 mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-foreground/50 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Área de vídeo (placeholder preparado)
---------------------------------------------------------------------------- */
export function VideoBlock({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--ink)] text-[var(--paper)] p-5 flex flex-col items-center text-center">
      <PlayCircle className="w-8 h-8 text-[var(--orange)] mb-3" />
      <div className="flex items-center gap-2 mb-1">
        <p className="font-semibold text-lg">{title}</p>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5C518] text-black tracking-wide uppercase">
          Em breve
        </span>
      </div>
      <p className="text-sm text-white/50 mt-1 max-w-md">
        Em breve: um vídeo curto explicando, na prática, como interpretar este
        resultado e evitar as armadilhas mais comuns.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Metodologia / fontes
---------------------------------------------------------------------------- */
/** @deprecated Bloco removido — não exibir jargão técnico ao usuário */
export function MethodologyBlock({
  sources: _sources,
  children: _children,
}: {
  sources: string[];
  children?: ReactNode;
}) {
  // Bloco suprimido conforme decisão de copywriting (sprint jun/2026)
  return null;
}

/* ----------------------------------------------------------------------------
   CTA de consultoria sutil (use grátis ou fale com especialista)
---------------------------------------------------------------------------- */
export function ConsultCTA({
  context = "esta análise",
  variant = "new",
}: {
  context?: string;
  variant?: "new" | "old";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card py-4 px-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {context === "esta análise" ? "Quer interpretar esses números?" : "Quer validar " + context + " com um especialista?"}
        </p>
        <p className="text-xs text-foreground/60 mt-1 max-w-xl">
          {context === "esta análise" ? "Eu posso analisar sua proposta com você e mostrar onde estão os principais impactos." : "Você pode usar todos os simuladores gratuitamente. Se preferir uma leitura humana e personalizada da sua proposta, fale diretamente com o especialista — sem compromisso."}
        </p>
      </div>
      {variant === "old" ? (
        <a
          href={BRAND.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3 text-sm font-semibold whitespace-nowrap transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="w-4 h-4" />
          Falar com o especialista
        </a>
      ) : (
        <a
          href={BRAND.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3 text-sm font-semibold whitespace-nowrap transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="w-4 h-4" />
          Pedir uma análise individual
        </a>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Bloco de Transparência e Metodologia (obrigatório em todos os simuladores)
---------------------------------------------------------------------------- */
export function TransparencyBlock() {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
        <div>
          <p className="eyebrow text-foreground/40 mb-2">Transparência e Metodologia</p>
          <p className="text-sm text-foreground/65 leading-relaxed">
            Este simulador projeta cenários matemáticos com base nos parâmetros
            informados pelo usuário e nas regras padrão do Banco Central. O resultado
            é uma projeção independente para apoio à decisão e não substitui a
            leitura do seu contrato, que pode conter regras específicas da sua
            administradora.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   PDF de Auditoria (botão)
---------------------------------------------------------------------------- */
export function PdfButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:border-[var(--orange)] hover:text-[var(--orange)] transition-colors disabled:opacity-50"
    >
      <FileText className="w-4 h-4" />
      {loading ? "Gerando relatório…" : "Baixar Relatório de Auditoria (PDF)"}
      {!loading && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
