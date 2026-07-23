import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("hero do Raio-X do Consórcio", () => {
  it("exibe os valores oficiais atualizados de 2025", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Simuladores.tsx"),
      "utf8",
    );

    expect(source).toContain("48,4% DESISTEM. E A MAIORIA DAS CONTEMPLAÇÕES OCORREM POR LANCE.");
    expect(source).toContain("IE 2025 · Banco Central");
    expect(source).toContain('{ label: "Imóveis", value: "54,5%", total: "3,4 mi" }');
    expect(source).toContain('{ label: "Automóveis", value: "46,2%", total: "4,6 mi" }');
    expect(source).toContain('{ label: "Motocicletas", value: "48,2%", total: "3,0 mi" }');
    expect(source).toContain("Panorama do Consórcio 2025");
  });
});
