/**
 * BrandLogo — Componente único de marca do Consórcio de Verdade
 *
 * REGRAS OBRIGATÓRIAS (prompt 14):
 * - variant="dark"  → fundo claro/off-white: logo com texto preto + quadrado laranja
 * - variant="light" → fundo escuro/preto/grafite: logo com texto branco + quadrado laranja
 * - variant="icon"  → favicon/app/símbolo compacto: ícone oficial (fundo preto, r. branco, quadrado laranja)
 *
 * Tamanhos recomendados:
 * - Header desktop: height 28–36px
 * - Header mobile: height 28–32px
 * - Footer: height 32–40px
 */

import { LOGO, BRAND } from "@/lib/brand";

interface BrandLogoProps {
  variant: "dark" | "light" | "icon";
  /** Altura visual em px. Padrão: 32 */
  height?: number;
  className?: string;
}

export function BrandLogo({ variant, height = 32, className = "" }: BrandLogoProps) {
  const src =
    variant === "dark"
      ? LOGO.dark
      : variant === "light"
        ? LOGO.light
        : LOGO.icon;

  const alt =
    variant === "icon"
      ? "r. — Consórcio de Verdade"
      : BRAND.name;

  return (
    <img
      src={src}
      alt={alt}
      height={height}
      style={{ height: `${height}px`, width: "auto", display: "block", objectFit: "contain" }}
      className={className}
      draggable={false}
    />
  );
}
