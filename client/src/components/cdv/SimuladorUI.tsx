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
import {
  buildCalcMemoryProjection,
  type CalcMemoryData,
} from "@/lib/calcMemory";

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
      className={`rounded-lg sm:rounded-xl p-2 sm:p-3 border shadow-sm ${
        highlight
          ? "bg-[var(--ink)] text-[var(--paper)] border-transparent"
          : "bg-card border-border"
      }`}
    >
      <p
        className={`text-[14px] leading-tight sm:text-[14px] md:text-[15px] font-normal uppercase tracking-wide ${
          highlight ? "text-white/50" : "text-gray-700"
        }`}
      >
        {label}
      </p>
      <p
        className={`data-num text-[14px] md:text-[15px] sm:text-lg font-medium mt-1.5 break-words ${
          highlight ? "text-[var(--orange)]" : toneColor
        } text-[14px] md:text-[15px] sm:text-base`}
      >
        {value}
      </p>
      {hint && (
        <p
          className={`text-[14px] leading-tight sm:text-[14px] md:text-[15px] mt-1 ${
            highlight ? "text-white/40" : "text-gray-600"
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
      <div className="text-gray-800 leading-relaxed space-y-3 text-[15px]">
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
      <div className="flex justify-between text-[14px] md:text-[15px] mb-1.5">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="data-num font-semibold">{formatBRL(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--orange)] transition-all duration-700"
          style={{ width: `${pct}%`, transitionTimingFunction: "var(--ease-out)" }}
        />
      </div>
      {caption && <p className="text-[14px] md:text-[15px] text-gray-600 mt-1">{caption}</p>}
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
  const [open, setOpen] = React.useState(true);
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-[var(--ink)] px-3 py-2.5 sm:px-5 sm:py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-[14px] md:text-[15px] leading-relaxed font-bold uppercase tracking-widest text-yellow-400">
            {label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bg-[var(--ink)] px-2 pb-2 pt-0.5 sm:px-3 sm:pb-3 sm:pt-0.5 text-white/80 leading-relaxed text-[13px] md:text-[14px] space-y-1 border-t border-white/10">
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
    <div className="grid md:grid-cols-2 gap-4 overflow-x-auto">
      <div className="rounded-2xl border border-[color-mix(in_oklch,var(--positive)_30%,transparent)] bg-[color-mix(in_oklch,var(--positive)_8%,transparent)] p-5">
        <p className="eyebrow text-[var(--positive)] mb-3 flex items-center gap-1.5">
          <Check className="w-4 h-4" /> Pontos positivos
        </p>
        <ul className="space-y-2.5">
          {positives.map((p, i) => (
            <li key={i} className="flex gap-2 text-[14px] md:text-[15px] text-gray-800">
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
            <li key={i} className="flex gap-2 text-[14px] md:text-[15px] text-gray-800">
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
   Memória de cálculo — card "Como essa projeção foi construída"
   Layout: grid 2 colunas (Contrato Inicial | Projeção de Correções) + rodapé Total
---------------------------------------------------------------------------- */
export function CalcMemory({
  data,
  items,
  rows,
  defaultOpen = false,
}: {
  data?: CalcMemoryData;
  items?: { label: string; value: string; isRed?: boolean }[];
  rows?: { label: string; value: string; kind?: "normal" | "alert" }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  /* ---- Modo estruturado (data): grid 2 colunas + rodapé ---- */
  const renderStructured = (d: CalcMemoryData) => {
    const projection = buildCalcMemoryProjection(d);

    const col1: { label: string; value: string }[] = [
      { label: "Carta de Crédito", value: formatBRL(projection.cartaInicial) },
      { label: "Taxa de Adm. Contratual", value: formatBRL(projection.taxaAdmInicial) },
      { label: "Fundo de Reserva", value: formatBRL(projection.fundoReserva) },
    ];
    const col2: { label: string; value: string }[] = [
      { label: "Correção da Carta (Fundo Comum)", value: formatBRL(projection.correcaoFundoComum) },
      { label: "Aumento da Taxa de Adm.", value: formatBRL(projection.aumentoTaxaAdm) },
      { label: "Aumento do Fundo de Reserva", value: formatBRL(projection.aumentoFundoReserva) },
      { label: "Seguro de Vida (Total)", value: formatBRL(projection.seguroTotal) },
    ];

    return (
      <div className="px-5 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUNA 1: CONTRATO INICIAL */}
          <div>
            <h4 className="text-sm font-bold text-[var(--orange)] uppercase tracking-wider mb-4">Contrato Inicial</h4>
            <div className="space-y-3">
              {col1.map((r, i) => (
                <div key={i} className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[13px] md:text-[14px] text-white/70">{r.label}</span>
                  <span className="font-mono text-[13px] md:text-[14px] text-white">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* COLUNA 2: PROJEÇÃO DE CORREÇÕES */}
          <div>
            <h4 className="text-sm font-bold text-[var(--orange)] uppercase tracking-wider mb-4">Projeção de Correções</h4>
            <div className="space-y-3">
              {col2.map((r, i) => (
                <div key={i} className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[13px] md:text-[14px] text-white/70">{r.label}</span>
                  <span className="font-mono text-[13px] md:text-[14px] text-white">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* RODAPÉ: TOTAL PROJETADO */}
        <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
          <span className="text-[14px] md:text-[15px] text-white font-bold uppercase tracking-wider">Total Projetado (O que sai do bolso)</span>
          <span className="font-mono text-xl md:text-2xl font-bold text-[var(--orange)]">
            {formatBRL(projection.totalPago)}
          </span>
        </div>
      </div>
    );
  };

  /* ---- Modo legado (items/rows): lista simples ---- */
  const renderLegacy = (legacyRows: { label: string; value: string; formula?: string }[]) => (
    <div className="divide-y divide-white/8 overflow-x-auto min-w-full">
      {legacyRows.length > 0 ? (
        legacyRows.map((r, i) => (
          <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px] md:text-[15px] text-white/80 whitespace-nowrap">{r.label}</p>
              {r.formula && (
                <p className="mono text-[14px] md:text-[15px] text-white/40 mt-0.5">{r.formula}</p>
              )}
            </div>
            <span className="data-num text-[14px] md:text-[15px] font-semibold text-[var(--orange)] shrink-0 whitespace-nowrap">
              {r.value}
            </span>
          </div>
        ))
      ) : (
        <div className="px-5 py-4 text-center text-white/30 text-[14px] md:text-[15px] italic">
          Nenhuma memória de cálculo disponível para esta simulação.
        </div>
      )}
    </div>
  );

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
      {open && (data ? renderStructured(data) : renderLegacy(rows ?? items ?? []))}
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
          {subtitle && <p className="text-[14px] md:text-[15px] text-gray-700 mt-0.5">{subtitle}</p>}
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
      <p className="text-[14px] md:text-[15px] text-white/50 mt-1 max-w-md">
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
        <p className="font-semibold text-[14px] md:text-[15px]">
          {context === "esta análise" ? "Quer interpretar esses números?" : "Quer validar " + context + " com um especialista?"}
        </p>
        <p className="text-[14px] md:text-[15px] text-foreground/60 mt-1 max-w-xl">
          {context === "esta análise" ? "Eu posso analisar sua proposta com você e mostrar onde estão os principais impactos." : "Você pode usar todos os simuladores gratuitamente. Se preferir uma leitura humana e personalizada da sua proposta, fale diretamente com o especialista — sem compromisso."}
        </p>
      </div>
      {variant === "old" ? (
        <a
          href={BRAND.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3 text-[14px] md:text-[15px] font-semibold whitespace-nowrap transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="w-4 h-4" />
          Falar com o especialista
        </a>
      ) : (
        <a
          href={BRAND.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-3 text-[14px] md:text-[15px] font-semibold whitespace-nowrap transition-transform hover:scale-[1.02]"
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
          <p className="text-[14px] md:text-[15px] text-foreground/65 leading-relaxed">
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
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[14px] md:text-[15px] font-semibold hover:border-[var(--orange)] hover:text-[var(--orange)] transition-colors disabled:opacity-50"
    >
      <FileText className="w-4 h-4" />
      {loading ? "Gerando relatório…" : "Baixar Relatório de Auditoria (PDF)"}
      {!loading && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
