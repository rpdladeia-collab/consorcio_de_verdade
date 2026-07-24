import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const panoramaSource = readFileSync(
  new URL("./Panorama.tsx", import.meta.url),
  "utf8",
);

describe("dados de 2025 dos Capítulos 02 e 04", () => {
  it("inclui 2025 no gráfico geral e nos quatro segmentos de exclusão", () => {
    expect(panoramaSource).toContain('{ ano: "2025", ie: 48.4, excluidas: 12.01 }');
    expect(panoramaSource).toContain('"Imóveis": { ie: 54.5, excluidas: 3.4 }');
    expect(panoramaSource).toContain('"Automóveis": { ie: 46.24, excluidas: 4.6 }');
    expect(panoramaSource).toContain('"Motocicletas": { ie: 48.22, excluidas: 3.0 }');
    expect(panoramaSource).toContain('"Outros bens e serviços": { ie: 41.89, excluidas: 1.0 }');
  });

  it("mostra os cards de exclusão como dados de 2025", () => {
    expect(panoramaSource).toContain("IE 2025:");
    expect(panoramaSource).toContain('atual.excluidas.toFixed(1).replace(".", ",")');
  });

  it("atualiza os cards de contemplações para 2025", () => {
    expect(panoramaSource).toContain('num="77,8%" label="Contemplações por lance em 2025"');
    expect(panoramaSource).toContain('num="22,2%" label="Contemplações por sorteio em 2025"');
  });
});
