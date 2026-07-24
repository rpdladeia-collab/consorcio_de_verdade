# Fontes oficiais localizadas — Panorama de Consórcios

Data da pesquisa: 21/07/2026.

Foram localizadas as seguintes páginas oficiais do Banco Central do Brasil para validação posterior:

1. Portal de Dados Abertos do Banco Central do Brasil: https://dadosabertos.bcb.gov.br/
2. Panorama do Sistema de Consórcios: https://www.bcb.gov.br/estabilidadefinanceira/panoramaconsorcio
3. Dados Agregados do Segmento de Consórcios: https://dadosabertos.bcb.gov.br/dataset/dados-agregados-do-segmento-de-consorcios
4. Nota "BC divulga Panorama do Sistema de Consórcios": https://www.bcb.gov.br/detalhenoticia/20761/nota

A pesquisa também indicou que o Portal de Dados Abertos descreve o conjunto como dados agregados e consolidados do segmento de consórcios. A periodicidade, a estrutura atual do catálogo e a relação com o serviço Olinda ainda precisam ser confirmadas diretamente nas páginas oficiais; nenhum trecho de resultado de busca será usado isoladamente como evidência final.

## Evidências confirmadas diretamente nas fontes oficiais

O Banco Central informa que o conjunto atual **Dados Agregados do Segmento de Consórcios** substitui a publicação anual do Panorama do Sistema de Consórcios, descontinuada após a versão 2024-2025. As séries históricas estão disponíveis a partir de dezembro de 2015; a ficha do conjunto também registra início do período em janeiro de 2016, frequência de atualização **trimestral**, periodicidade **trimestral**, cobertura Brasil e granularidade geográfica por estado.

A fonte oficial declarada inclui Cosif (documentos 4010 e 2080), Unicad, SVR e RIF, entre outros. O serviço Olinda oficial oferece três recursos: **Grupos de Métricas**, **Lista de Métricas** e **Métricas**. O recurso Métricas recebe `DataBase` no formato `AAAAMM` e retorna `DataBase`, `IdMetrica`, `Grupo`, `Metrica`, `Valor` e `Unidade`.

Fontes consultadas integralmente:

- https://www.bcb.gov.br/estabilidadefinanceira/panoramaconsorcio
- https://dadosabertos.bcb.gov.br/dataset/dados-agregados-do-segmento-de-consorcios
- https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/documentacao

Conclusão provisória baseada na fonte oficial e na consulta ao banco: o banco local contém 10 datas-base anuais de dezembro (`201612` a `202512`), enquanto o conjunto oficial atual é trimestral. Portanto, os 1.250 registros locais representam **125 métricas × 10 fotografias anuais**, e não o histórico trimestral completo anunciado pelo Banco Central.

## Sintaxe OData confirmada

A raiz OData oficial expõe as coleções `_GrupoDeMetricas`, `_Metricas` e `_CadastroDeMetricas`, além das funções `GrupoDeMetricas`, `Metricas` e `CadastroDeMetricas`.

A chamada válida do catálogo exige parênteses na função:

`https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata/CadastroDeMetricas()?$format=json&$top=1000`

A chamada sem parênteses retorna HTTP lógico 400 com `The URI is malformed`. A chamada válida devolveu registros com os campos `IdMetrica`, `Metrica`, `Unidade`, `IdGrupo` e `Grupo`. Entre os primeiros registros confirmados estão as métricas de administradoras, PLA, DT, grupos ativos, cotas ativas, carteira e ativos contemplados.

A resposta integral do catálogo foi contada localmente: **125 métricas**, com `IdMetrica` de 1 a 125, distribuídas por **19 grupos**, com `IdGrupo` de 1 a 19. Essa contagem coincide com as tabelas já existentes no Railway.

A função de valores aceita o parâmetro diretamente no segmento da função, por exemplo:

`https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata/Metricas(DataBase=202512)?$format=json&$top=1000`

A consulta oficial de `202512` retornou **125 registros**, todos com essa data-base e com `IdMetrica` de 1 a 125. O parâmetro `DataBase` é inteiro no formato `AAAAMM`, conforme a documentação oficial.

O metadado OData (`$metadata`) confirma a assinatura `Metricas(DataBase: Edm.Int32)` e os tipos da entidade de valores: `DataBase` como `Edm.Int32`, `IdMetrica` como `Edm.String`, `Grupo`, `Metrica` e `Unidade` como `Edm.String`, e `Valor` como `Edm.Decimal`. O catálogo, por sua vez, tipa `IdMetrica` e `IdGrupo` como `Edm.Int32`.

Uma tentativa de consultar diretamente `_Metricas` com filtro por `IdMetrica` retornou erro interno 500 do serviço. Assim, a enumeração das datas-base não deve depender dessa coleção subjacente sem uma estratégia alternativa validada.

## Atualização de evidência — 21 de julho de 2026

A consulta direta ao Portal de Dados Abertos confirmou a transição: o conjunto **Dados Agregados do Segmento de Consórcios** substitui a publicação anual do *Panorama do Sistema de Consórcios (PSC)*, descontinuada após a versão 2024–2025. A ficha atual classifica tanto a frequência de atualização quanto a periodicidade como **trimestral**.[1]

> “Dados agregados e consolidados do Segmento de Consórcios, em substituição à publicação anual do Panorama do Sistema de Consórcios (PSC), descontinuado após a versão 2024-2025.” — Banco Central do Brasil.[1]

A página institucional do Panorama direciona os dados atuais para o Portal de Dados Abertos e deixa os PDFs anteriores apenas como histórico até 2024.[2] Consequentemente, a cobertura anual de dezembro que aparece hoje no Data Lab é uma limitação da **carga histórica hoje conectada ao site** — dez fotografias entre 2016 e 2025 — e não uma regra permanente de publicação do Banco Central.

[1]: https://dadosabertos.bcb.gov.br/dataset/dados-agregados-do-segmento-de-consorcios "Banco Central do Brasil — Dados Agregados do Segmento de Consórcios"
[2]: https://www.bcb.gov.br/estabilidadefinanceira/panoramaconsorcio "Banco Central do Brasil — Panorama do Sistema de Consórcios"
