import { describe, expect, it } from "vitest";
import {
  DATA_LAB_GROUP_ORDER,
  DATA_LAB_GROUP_SECTION_BY_ID,
  DATA_LAB_GROUP_SECTIONS,
} from "./dataLabCatalogGroups";

describe("organização editorial do catálogo do Data Lab", () => {
  it("mantém todos os 19 grupos oficiais uma única vez", () => {
    const groupIds = DATA_LAB_GROUP_SECTIONS.flatMap(section => section.groupIds);

    expect(groupIds).toHaveLength(19);
    expect(new Set(groupIds).size).toBe(19);
    expect([...groupIds].sort((a, b) => Number(a) - Number(b))).toEqual(
      Array.from({ length: 19 }, (_, index) => String(index + 1)),
    );
  });

  it("mantém administradoras e cotas ativas por estado em blocos separados", () => {
    expect(DATA_LAB_GROUP_SECTION_BY_ID["1"]).toBe("Administradoras de Consórcio");
    expect(DATA_LAB_GROUP_SECTION_BY_ID["19"]).toBe("Cotas Ativas por Estado");
  });

  it("preserva a ordem editorial solicitada para os blocos principais", () => {
    expect(DATA_LAB_GROUP_SECTIONS.map(section => section.label)).toEqual([
      "Mercado",
      "Comercialização",
      "Contemplações e exclusões",
      "Planos de consórcio",
      "Risco e inadimplência",
      "Administradoras de Consórcio",
      "Cotas Ativas por Estado",
    ]);
    expect(DATA_LAB_GROUP_ORDER["4"]).toBeLessThan(DATA_LAB_GROUP_ORDER["10"]);
    expect(DATA_LAB_GROUP_ORDER["10"]).toBeLessThan(DATA_LAB_GROUP_ORDER["7"]);
  });
});
