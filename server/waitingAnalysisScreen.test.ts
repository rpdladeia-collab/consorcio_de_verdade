import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WaitingAnalysisScreen from "../client/src/components/cdv/WaitingAnalysisScreen";
import { BRAND, LOGO } from "@/lib/brand";

describe("WaitingAnalysisScreen", () => {
  it("renderiza o estado de espera com fundo preto, logomarca centralizada e rótulo", () => {
    const html = renderToStaticMarkup(createElement(WaitingAnalysisScreen));

    expect(html).toContain("Aguardando análise");
    expect(html).toContain('role="status"');
    expect(html).toContain("bg-[#050505]");
    expect(html).toContain("items-center");
    expect(html).toContain("justify-center");
    expect(html).toContain("bottom-5");
    expect(html).toContain("right-5");
    expect(html).toContain(LOGO.light);
    expect(html).toContain(`alt="${BRAND.name}"`);
  });

  it("aceita um rótulo alternativo mantendo a região acessível", () => {
    const html = renderToStaticMarkup(
      createElement(WaitingAnalysisScreen, {
        label: "Processamento ainda não iniciado",
      }),
    );

    expect(html).toContain("Processamento ainda não iniciado");
    expect(html).toContain('aria-live="polite"');
  });
});
