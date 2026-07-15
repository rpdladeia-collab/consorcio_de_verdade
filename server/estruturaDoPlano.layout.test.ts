import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../client/src/pages/EstruturaDoPlano.tsx", import.meta.url),
  "utf8",
);

describe("EstruturaDoPlano — layout dos KPIs de custos", () => {
  it("usa colunas adaptáveis com largura mínima segura para os cartões", () => {
    expect(source).toContain(
      "grid-cols-[repeat(auto-fit,minmax(128px,1fr))]",
    );
  });

  it("mantém os valores monetários dos KPIs em uma única linha", () => {
    const valueClass = source.match(
      /<strong className="([^"]*tabular-nums[^"]*)">\{formatBRLCents\(k\.value\)\}<\/strong>/,
    );

    expect(valueClass).not.toBeNull();
    expect(valueClass?.[1]).toContain("whitespace-nowrap");
    expect(valueClass?.[1]).not.toContain("break-words");
  });

  it("contém a largura mínima da tabela de custos dentro de rolagem horizontal", () => {
    const costsTable = source.match(
      /<div className="overflow-x-auto">\s*<table className="w-full min-w-\[500px\] table-fixed">/,
    );

    expect(costsTable).not.toBeNull();
  });
});


describe("EstruturaDoPlano — gráfico e histórico de correções responsivos", () => {
  it("renderiza carta e parcela como degraus em eixos monetários independentes", () => {
    expect(source).toContain('yAxisId="credit"');
    expect(source).toContain('yAxisId="payment"');
    expect(source.match(/type="stepAfter"/g)).toHaveLength(2);
    expect(source).toContain('className="h-[280px] sm:h-[340px] w-full"');
  });

  it("mostra no tooltip os valores totais e o aumento exato de cada degrau", () => {
    expect(source).toContain("function CorrectionChartTooltip");
    expect(source).toContain("point.creditIncrease");
    expect(source).toContain("point.paymentIncrease");
    expect(source).toContain("Passe o cursor ou toque no gráfico para ver os valores exatos");
  });

  it("usa cartões em notebook e mobile e reserva a tabela completa para telas muito largas", () => {
    expect(source).toContain('className="hidden 2xl:block overflow-x-auto"');
    expect(source).toContain('className="2xl:hidden divide-y divide-gray-100"');
    expect(source).toContain('className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]"');
  });
});


describe("EstruturaDoPlano — explicação e histórico recolhível", () => {
  it("mantém o histórico fechado por padrão e permite expandir pelo cabeçalho", () => {
    expect(source).toContain("function CorrectionsHistoryAccordion");
    expect(source).toContain("const [open, setOpen] = useState(false)");
    expect(source).toContain("onClick={() => setOpen((v) => !v)}");
    expect(source).toContain('{open ? "recolher" : "expandir"}');
    expect(source).toContain("{open && (");
  });

  it("posiciona Racional, Ponto-chave e o destaque antes do histórico", () => {
    const rationalIndex = source.indexOf(">Racional</p>");
    const keyPointIndex = source.indexOf(">Ponto-chave</p>");
    const highlightIndex = source.indexOf("Importante: critérios de correção");
    const historyIndex = source.indexOf("<CorrectionsHistoryAccordion yearly={yearly} />");

    expect(rationalIndex).toBeGreaterThan(-1);
    expect(keyPointIndex).toBeGreaterThan(rationalIndex);
    expect(highlightIndex).toBeGreaterThan(keyPointIndex);
    expect(historyIndex).toBeGreaterThan(highlightIndex);
  });

  it("explica de forma qualificada as regras antes e depois da contemplação", () => {
    expect(source).toContain("As correções seguem as regras da administradora e do contrato");
    expect(source).toContain("Em geral, <b>antes da contemplação</b>");
    expect(source).toContain("<b>depois da contemplação</b>, somente o saldo continua corrigido");
  });
});

describe("EstruturaDoPlano — investimentos simplificados e auditoria", () => {
  it("destaca A Ilusão Nominal vs. Realidade antes do mesmo esforço em renda fixa", () => {
    const highlightIndex = source.indexOf("A Ilusão Nominal vs. Realidade");
    const fixedIncomeIndex = source.indexOf("2. Mesmo esforço em renda fixa");

    expect(highlightIndex).toBeGreaterThan(-1);
    expect(fixedIncomeIndex).toBeGreaterThan(highlightIndex);
    expect(source).toContain("O verdadeiro custo de um consórcio não é apenas a taxa de administração");
    expect(source).toContain("Custo de Oportunidade");
  });

  it("remove a frase conclusiva e mantém somente poupança e CDI líquido na leitura principal", () => {
    expect(source).not.toContain("Renda fixa venceu");
    expect(source).not.toContain("CDB líquido superou a carta");
    expect(source).not.toContain("CDB bruto");
    expect(source).toContain("CDB 100% CDI líquido");
    expect(source).toContain("Poupança · mesmo fluxo");
  });

  it("renderiza a auditoria como cartões no mobile e tabela no notebook e desktop", () => {
    expect(source).toContain("Auditoria de Fluxo de Caixa (Igualado)");
    expect(source).toContain('className="sm:hidden divide-y divide-gray-100"');
    expect(source).toContain('className="hidden sm:block overflow-x-auto"');
    expect(source).toContain("Parcela (Aporte)");
    expect(source).toContain("Carta Atualizada");
    expect(source).toContain("Saldo Investimento");
  });
});
