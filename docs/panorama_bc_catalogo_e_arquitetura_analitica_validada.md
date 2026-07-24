# Panorama BC — Catálogo e arquitetura analítica validados

**Data:** 21 de julho de 2026  
**Autor:** Manus AI  
**Escopo:** organização oficial das 125 métricas e contrato analítico mínimo para o Data Lab.

## Resultado da validação

O catálogo do Railway e o catálogo atual do Banco Central foram comparados campo a campo, após normalização exclusiva de espaços em branco. Ambos possuem **125 métricas** e **19 grupos**; não há identificadores ausentes ou extras e não foi encontrada divergência de nome, grupo ou unidade. A fonte oficial é o serviço Panorama do Sistema de Consórcios do Banco Central.[1] [2]

| Verificação | Resultado |
|---|---:|
| Métricas locais | 125 |
| Métricas oficiais | 125 |
| Grupos locais | 19 |
| Grupos oficiais | 19 |
| Métricas ausentes localmente | 0 |
| Métricas extras localmente | 0 |
| Divergências de nome, grupo ou unidade | 0 |

Os artefatos completos e reproduzíveis estão em `docs/panorama_bc_catalogo_125_metricas.json` e `docs/panorama_bc_catalogo_125_metricas.csv`. Eles foram exportados da tabela `panorama_metadata` em modo somente leitura.

## Os 19 grupos oficiais reais

| ID | Grupo oficial | Métricas | Unidades distintas |
|---:|---|---:|---:|
| 1 | Administradoras de Consórcio | 6 | 1 |
| 2 | PLA | 1 | 1 |
| 3 | DT | 1 | 1 |
| 4 | Grupos ativos | 1 | 1 |
| 5 | Cotas ativas | 12 | 1 |
| 6 | Carteira | 6 | 2 |
| 7 | Ativos Contemplados | 15 | 2 |
| 8 | Cotas excluídas | 6 | 1 |
| 9 | Índice de Exclusão | 5 | 1 |
| 10 | Cotas Comercializadas | 7 | 1 |
| 11 | Inadimplência | 1 | 1 |
| 12 | Pré Inadimplência | 1 | 1 |
| 13 | Recursos Coletados | 5 | 1 |
| 14 | Recursos a Coletar | 5 | 2 |
| 15 | RNP | 5 | 3 |
| 16 | Taxa de Administração | 7 | 1 |
| 17 | Valor Médio | 7 | 1 |
| 18 | Prazo Médio | 7 | 1 |
| 19 | Cotas Ativas por Estado | 27 | 1 |

A arquitetura não renomeará esses grupos nem criará uma taxonomia econômica paralela no MVP. O seletor os exibirá na nomenclatura oficial e manterá o `id_grupo` como chave estável.

## Unidades oficiais e regra de compatibilidade

| Unidade | Métricas | Formatação prevista |
|---|---:|---|
| `mil` | 66 | Número com sufixo “mil” |
| `R$ bilhões` | 17 | Moeda em bilhões de reais |
| `%` | 15 | Percentual |
| `meses` | 7 | Número com sufixo “meses” |
| `R$ mil` | 7 | Moeda em milhares de reais |
| `unidade` | 7 | Número inteiro ou decimal conforme o valor oficial |
| `R$ milhões` | 5 | Moeda em milhões de reais |
| `mi` | 1 | Número com o sufixo oficial “mi” |

> Comparações futuras só poderão combinar séries com unidades matematicamente compatíveis. O MVP não fará comparações entre métricas; ele exibirá uma série por vez e utilizará a unidade oficial para gráfico, tooltip e tabela.

## Arquitetura analítica corrigida

O desenho técnico válido é uma camada única dentro do projeto existente:

```text
Data Lab público
    ↓ tRPC público de leitura
Router Panorama isolado
    ↓
Repositório de consultas somente leitura
    ↓
Drizzle ORM tipado, sem migração
    ↓
Railway: panorama_metadata + panorama_metrics
```

O cliente oficial do Banco Central fica isolado no Motor de Dados para validação e sincronização futura. Ele não é chamado no carregamento da página e não escreve no banco. Assim, a experiência pública continua funcionando com o histórico persistido mesmo quando a API oficial estiver lenta ou indisponível.

## Contrato analítico da Sprint 01

| Bloco | Implementação permitida agora | Adiado |
|---|---|---|
| Catálogo | Grupos e 125 métricas oficiais, busca textual e unidade | Taxonomias proprietárias |
| Período | 12 meses, 5 anos, 10 anos, completo e personalizado | Interpolação de bases ausentes |
| Visualização | Gráfico de linha e tooltip | Barras, área, dispersão e múltiplas séries |
| Dados brutos | Tabela cronológica da mesma série | CSV e PDF |
| Contexto | Cobertura, observações, granularidade anual e fonte | Narrativas econômicas e causalidade |
| Qualidade | Estados de erro, vazio e lacuna de cobertura | Motor de anomalias e score de qualidade |

## Granularidade e leitura correta

O acervo persistido contém dez competências anuais de dezembro: de `201612` a `202512`. Portanto, o filtro de 12 meses pode retornar uma única observação e os filtros de cinco e dez anos retornam, respectivamente, cinco e dez observações. A página deverá mostrar esse fato sem criar pontos mensais ou trimestrais fictícios.

A função de período deve usar a última `data_base` disponível como âncora. Essa regra impede que a passagem do tempo reduza a série apenas porque a data do servidor avançou enquanto o banco permaneceu inalterado.

## Critérios de rastreabilidade

Cada resposta do backend deverá conter o identificador e nome da métrica, grupo oficial, unidade, primeira e última competência disponíveis, recorte efetivamente aplicado, quantidade de observações e fonte. O frontend deverá usar exatamente a série retornada para o gráfico e a tabela.

Nenhum campo será derivado de outra fonte, e nenhum valor será completado, estimado ou interpolado. O Banco Central permanece a única fonte de dados permitida para o Panorama BC.[1]

## Referências

[1]: https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/documentacao "Banco Central do Brasil — documentação do Panorama do Sistema de Consórcios"
[2]: https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata/CadastroDeMetricas()?$format=json&$top=1000 "Banco Central do Brasil — catálogo de métricas do Panorama de Consórcios"
