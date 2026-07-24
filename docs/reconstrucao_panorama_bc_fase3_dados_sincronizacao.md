# Fase 3 — Auditoria de dados e sincronização do Panorama BC

Data da auditoria: 21/07/2026.

## Escopo e regra operacional

Esta auditoria foi executada em **modo somente leitura**. Nenhuma tabela foi criada, alterada, migrada ou populada; nenhum job foi criado, atualizado ou acionado. O objetivo foi confirmar a estrutura real do banco, a cobertura dos dados, a correspondência com a API oficial do Banco Central e o estado efetivo do mecanismo de sincronização.

## Banco de dados conectado

O projeto aponta para o schema `railway` no Railway. As tabelas Panorama realmente existentes são:

| Tabela | Situação observada |
|---|---|
| `panorama_metadata` | Existe e contém o catálogo local de métricas. |
| `panorama_metrics` | Existe e contém valores históricos anuais. |
| `panorama_sync_logs` | Existe no plural e está vazia. |

A denominação correta é **`panorama_sync_logs`**, não `panorama_sync_log`.

## Estrutura real das tabelas

### `panorama_metadata`

| Coluna | Tipo | Nulo | Observação |
|---|---|---:|---|
| `id_metrica` | `varchar(64)` | Não | Chave primária. |
| `metrica_nome` | `varchar(512)` | Não | Nome editorial da métrica. |
| `id_grupo` | `varchar(64)` | Não | Identificador do grupo. |
| `grupo_nome` | `varchar(256)` | Não | Nome do grupo. |
| `unidade` | `varchar(64)` | Não | Unidade de medida. |
| `status` | `enum('publicado','pendente','arquivado')` | Não | Todos os 125 registros estão como `pendente`. |
| `data_descoberta` | `timestamp` | Não | Preenchimento automático. |

### `panorama_metrics`

| Coluna | Tipo | Nulo | Observação |
|---|---|---:|---|
| `id` | `int` | Não | Chave primária com auto incremento. |
| `data_base` | `int` | Não | Data no formato `AAAAMM`. |
| `id_metrica` | `varchar(64)` | Não | Referência lógica ao catálogo. |
| `valor` | `decimal(20,4)` | Não | Valor numérico; nenhum nulo encontrado. |
| `data_importacao` | `timestamp` | Não | Preenchimento automático. |
| `fonte` | `varchar(64)` | Não | Valor padrão `BCB`. |

### `panorama_sync_logs`

| Coluna | Tipo | Nulo | Observação |
|---|---|---:|---|
| `id` | `int` | Não | Chave primária com auto incremento. |
| `data_execucao` | `timestamp` | Não | Preenchimento automático. |
| `status_api` | `varchar(32)` | Não | Estado da consulta ao BC. |
| `data_base_bcb` | `int` | Sim | Data-base processada. |
| `registros_novos` | `int` | Não | Padrão zero. |
| `metricas_descobertas` | `int` | Não | Padrão zero. |
| `detalhes` | `varchar(1024)` | Sim | Diagnóstico textual. |

## Cobertura local confirmada

| Indicador | Resultado |
|---|---:|
| Métricas no catálogo local | 125 |
| Grupos distintos | 19 |
| Metadados publicados | 0 |
| Metadados pendentes | 125 |
| Registros históricos | 1.250 |
| Datas-base distintas | 10 |
| Primeira data-base | 201612 |
| Última data-base | 202512 |
| Valores nulos | 0 |

Cada data-base contém exatamente **125 métricas**. As datas existentes são: `201612`, `201712`, `201812`, `201912`, `202012`, `202112`, `202212`, `202312`, `202412` e `202512`.

> O banco atual forma uma série anual de dezembro. Ele não contém o histórico trimestral completo divulgado atualmente pelo Banco Central.

## API oficial do Banco Central

A raiz OData oficial expõe as funções `GrupoDeMetricas`, `CadastroDeMetricas` e `Metricas`. A sintaxe validada exige parênteses nas funções:

- Catálogo: `CadastroDeMetricas()?$format=json&$top=1000`
- Valores: `Metricas(DataBase=202512)?$format=json&$top=1000`

A resposta integral do catálogo oficial contém **125 métricas**, com identificadores de 1 a 125, em **19 grupos**. A consulta oficial de `202512` retornou **125 registros**, também com identificadores de 1 a 125. O metadado OData tipa `DataBase` como inteiro, `IdMetrica` como texto na entidade de valores e `Valor` como decimal.

Fontes oficiais:

- [Serviço OData](https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata/)
- [Documentação do serviço](https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/documentacao)
- [Metadado OData](https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata/$metadata)

## Diagnóstico do motor de sincronização

A auditoria encontrou os seguintes fatos:

| Evidência | Resultado |
|---|---|
| `panorama_sync_logs` | Zero registros. |
| Jobs periódicos visíveis para o projeto | Zero jobs. |
| Handler `/api/scheduled/*` específico do Panorama | Não encontrado. |
| Referência executável a `syncLatestPeriod` ou `syncHistoricalPeriod` | Não encontrada fora do próprio cliente e de testes. |
| Teste do cliente BCB | Aprovado: 6 testes. |

O arquivo `server/modules/panorama-bc/data/bcb-client.ts` implementa um cliente coerente para catálogo, grupos, valores e funções de sincronização, mas essas funções **não estão conectadas ao runtime do projeto**. Portanto, não há evidência de um motor de sincronização ativo ou operante nesta linha de base.

## Conclusão da Fase 3

A base atual é suficiente para um **MVP público de consulta histórica anual**, desde que a interface informe explicitamente a granularidade disponível. Ela não sustenta ainda a promessa de atualização trimestral contínua.

Para respeitar a restrição permanente de **zero escrita** nas tabelas Panorama, a reconstrução do Data Lab deve seguir em leitura pura. A sincronização trimestral e qualquer carga complementar permanecem uma lacuna separada, a ser tratada somente após autorização explícita para escrever no banco e definir o mecanismo periódico adequado.
