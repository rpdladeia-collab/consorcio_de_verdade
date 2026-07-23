import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("ajustes da rodada Raio-X e Panorama:BC", () => {
  it("exibe o novo texto descritivo no card Raio-X do Consórcio", () => {
    const source = readSource("client/src/pages/Simuladores.tsx");

    expect(source).toContain(
      "Explore a memória completa de cálculo do seu plano, mês a mês. Custos, correções, evolução da carta e os números que realmente determinam quanto o seu consórcio custa ao longo do tempo.",
    );
  });

  it("remove a leitura rápida, mantém os cards explicativos e fecha a degradação por padrão", () => {
    const source = readSource("client/src/pages/EstruturaDoPlano.tsx");

    expect(source).not.toContain("Leitura rápida: o verde mostra a carta final atualizada");
    expect(source).toContain("Racional");
    expect(source).toContain("Ponto-chave");
    expect(source).toContain("function DegradacaoAccordion");
    expect(source).toContain("const [open, setOpen] = useState(false);");
    expect(source).toContain(
      "Mostra como a taxa de administração perde eficiência à medida que você utiliza recursos próprios no plano.",
    );
  });

  it("mantém a ordem solicitada dos cards de Dados da proposta", () => {
    const source = readSource("client/src/pages/EstruturaDoPlano.tsx");
    const start = source.indexOf('{activeTab === "proposta"');
    const end = source.indexOf("{/* Tabela mensal */}", start);
    const proposalCards = source.slice(start, end);
    const labels = [
      "Parcela inicial",
      "Parcela final",
      "Carta inicial",
      "Carta final",
      "Custo da taxa de adm. inicial",
      "Custo da taxa de adm. final",
    ];

    let previous = -1;
    for (const label of labels) {
      const current = proposalCards.indexOf(`label=\"${label}\"`);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });

  it("inclui a tag de dados consolidados nos dois heros do Panorama:BC", () => {
    const panorama = readSource("client/src/pages/Panorama.tsx");
    const administradoras = readSource("client/src/pages/PanoramaAdministradoras.tsx");
    const layout = readSource("client/src/components/cdv/RaioXLayout.tsx");

    expect(panorama).toContain("Dados consolidados de 2025");
    expect(administradoras).toContain("Dados consolidados de 2025");
    expect(administradoras).toContain("heroBadge={");
    expect(layout).toContain("heroBadge?: React.ReactNode");
  });
});
