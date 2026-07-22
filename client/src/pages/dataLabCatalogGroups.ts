export type DataLabGroupSection = {
  label: string;
  groupIds: string[];
};

/**
 * Ordem editorial do seletor. Os IDs e nomes reais continuam vindo do catálogo
 * oficial do Banco Central; esta estrutura apenas organiza sua navegação.
 */
export const DATA_LAB_GROUP_SECTIONS: DataLabGroupSection[] = [
  {
    label: "Mercado",
    groupIds: ["4", "5", "6"],
  },
  {
    label: "Comercialização",
    groupIds: ["10", "13", "14"],
  },
  {
    label: "Contemplações e exclusões",
    groupIds: ["7", "8", "9"],
  },
  {
    label: "Planos de consórcio",
    groupIds: ["16", "17", "18", "2", "3"],
  },
  {
    label: "Risco e inadimplência",
    groupIds: ["11", "12", "15"],
  },
  {
    label: "Administradoras de Consórcio",
    groupIds: ["1"],
  },
  {
    label: "Cotas Ativas por Estado",
    groupIds: ["19"],
  },
];

export const DATA_LAB_GROUP_SECTION_BY_ID = Object.fromEntries(
  DATA_LAB_GROUP_SECTIONS.flatMap(section =>
    section.groupIds.map(groupId => [groupId, section.label]),
  ),
) as Record<string, string>;

export const DATA_LAB_GROUP_ORDER = Object.fromEntries(
  DATA_LAB_GROUP_SECTIONS.flatMap((section, sectionIndex) =>
    section.groupIds.map((groupId, groupIndex) => [
      groupId,
      sectionIndex * 100 + groupIndex,
    ]),
  ),
) as Record<string, number>;
