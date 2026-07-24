# Panorama BC — Matriz de lacunas e sequência mínima de reconstrução

**Data:** 21 de julho de 2026  
**Projeto autorizado:** `/home/ubuntu/consorcio_de_verdade`  
**Escopo desta decisão:** primeira experiência pública de **Mercado em Números / Data Lab**, em leitura pura e sem versionamento não autorizado.

## Síntese executiva

A auditoria confirma que o catálogo local coincide quantitativamente com o catálogo oficial atual: **125 métricas em 19 grupos**. O banco contém **1.250 valores**, distribuídos por 10 datas-base anuais de dezembro entre 2016 e 2025. A API oficial aceita consultas por `DataBase` no formato `AAAAMM` e atualmente divulga o conjunto como trimestral; portanto, a base local é utilizável para o MVP, mas sua granularidade deve ser apresentada honestamente como **anual**.[1] [2]

O mecanismo de sincronização não está operante na linha de base: a tabela `panorama_sync_logs` está vazia, não há job periódico registrado e o cliente BCB, embora aprovado por seis testes, não é chamado pelo runtime. Como a restrição vigente proíbe escrita nas tabelas Panorama, a entrega mínima correta é um módulo público de consulta ao acervo existente, sem tentar completar ou sincronizar dados nesta etapa.

## Matriz requisito × evidência × lacuna × ação corretiva

| Requisito canônico | Evidência direta | Lacuna atual | Ação mínima autorizada |
|---|---|---|---|
| Trabalhar apenas no projeto original | Repositório confirmado em `/home/ubuntu/consorcio_de_verdade`; branch `main` alinhada ao remoto | Há um projeto paralelo criado anteriormente, que não pertence ao escopo | Ignorar integralmente o projeto paralelo e modificar somente o repositório original |
| Interface pública dentro do Panorama BC | `Panorama.tsx` contém o item final `Data Lab` com destino `/data-lab` | A rota não existe em `App.tsx` | Registrar uma única rota pública `/data-lab` no roteador existente |
| Catálogo com 125 métricas e 19 grupos | Banco: 125/19; API oficial: 125/19 | Não há endpoint do site para consumir o catálogo | Expor `listGroups` e `listMetrics` via namespace tRPC isolado `panorama` |
| Dados reais do banco | `panorama_metrics` contém 1.250 valores não nulos | Nenhuma consulta tRPC registrada lê essas tabelas | Declarar tipagem Drizzle somente leitura e criar repositório de consultas sem `insert`, `update` ou `delete` |
| Seletor agrupado por grupos oficiais | `panorama_metadata` possui `id_grupo`, `grupo_nome`, `id_metrica`, `metrica_nome` e `unidade` | Nenhum componente funcional consome esse catálogo | Renderizar as 125 opções em grupos oficiais, sem taxonomia inventada |
| Períodos 12 meses, 5 anos, 10 anos, completo e personalizado | Dez datas-base anuais entre `201612` e `202512` | “12 meses” contém apenas uma observação com a cobertura local; recortes longos também são anuais | Calcular janelas em relação à última data disponível e mostrar aviso explícito de granularidade anual |
| Gráfico de linha interativo | Recharts já está instalado e é utilizado pelo Panorama existente | Arquivos de protótipo não estão conectados e um deles não compila | Criar uma página canônica `DataLab.tsx` e usar `ResponsiveContainer`, `LineChart` e tooltip com os dados do tRPC |
| Tabela dos mesmos dados | Os valores têm `data_base`, `valor`, `unidade` e `fonte` | Não há tabela conectada ao backend | Renderizar a mesma série do gráfico em ordem cronológica, sem valores fictícios |
| Tema editorial escuro e coerente com o Panorama | `Panorama.tsx` já define linguagem, navegação sticky, tipografia e paleta | Protótipos existentes não são rota ativa | Reutilizar `Header`, `Footer`, proporções, cores terrosas e tipografia do Panorama, sem novo layout global |
| Acesso sem autenticação | tRPC oferece `publicProcedure` | Nenhum router Panorama está registrado | Usar somente procedimentos públicos de leitura |
| Isolamento do módulo | Pasta `server/modules/panorama-bc/` já existe | O router principal ainda não monta o namespace | Manter lógica, queries e testes na pasta do módulo; alterar `server/routers.ts` apenas no ponto de composição |
| Zero migração e zero escrita | Tabelas já existem no Railway | O schema Drizzle atual não as declara | Criar `drizzle/panorama-schema.ts` apenas para tipagem; não gerar nem aplicar migração |
| Testes com evidência | Suíte atual: 56 aprovados e 6 falhas anteriores ao módulo; cliente BCB: 6/6 | Não há testes da camada de leitura, período ou contrato tRPC | Criar testes unitários de períodos e testes de integração de leitura com o banco real, sem mascarar as seis falhas preexistentes |
| Preview antes de commit | Nenhuma alteração atual está commitada | Não existe preview funcional do projeto original para o Data Lab | Iniciar o servidor local do repositório original em porta separada, validar desktop e mobile e apresentar link temporário |
| Commit/push somente com autorização | `git status` mostra alterações locais e arquivos não rastreados | Qualquer commit agora violaria a regra operacional | Não executar commit, push, deploy ou checkpoint; aguardar aprovação explícita após o preview |

## Decisões de reconstrução

### 1. Fonte e semântica dos dados

O Data Lab lerá exclusivamente `panorama_metadata` e `panorama_metrics`. A API do Banco Central continuará sendo usada como referência oficial e para testes do cliente existente, mas não será chamada a cada visita do usuário. Isso preserva disponibilidade e evita transformar uma consulta pública em sincronização implícita.[1] [3]

Todos os 125 metadados locais estão com `status='pendente'`. Como o usuário confirmou explicitamente que o seletor do MVP deve conter as **125 métricas oficiais**, e o catálogo local coincide com o catálogo oficial, o endpoint de leitura não filtrará esse campo nesta etapa. Nenhum status será alterado no banco.

### 2. Períodos e granularidade

As janelas serão calculadas a partir da **última competência disponível**, e não da data do computador. Com `202512` como última base, o recorte de 12 meses corresponde a `202501–202512`; cinco anos correspondem a `202101–202512`; dez anos correspondem a `201601–202512`. Como a base contém apenas dezembro, os resultados terão respectivamente 1, 5 e 10 observações.

> A interface não interpolará meses ou trimestres ausentes. Ela exibirá “Série disponível em bases anuais de dezembro” e informará quantas observações existem no recorte selecionado.

### 3. Contrato mínimo do backend

| Procedimento | Entrada | Saída mínima |
|---|---|---|
| `panorama.listGroups` | Nenhuma | 19 grupos oficiais, ordenados, com contagem de métricas |
| `panorama.listMetrics` | Grupo opcional e busca opcional | Identificador, nome, grupo, unidade e status das métricas |
| `panorama.getMetricData` | Métrica, preset de período e intervalo personalizado opcional | Metadado, série ordenada, cobertura disponível e granularidade |

O contrato não incluirá escrita, sincronização, comparativos, IA generativa, previsões, exportação ou métricas derivadas no MVP.

### 4. Experiência visual mínima

A página conterá: cabeçalho editorial; retorno ao Panorama; seletor agrupado de métrica; controles de período; contexto de unidade e cobertura; gráfico de linha; tabela bruta; estados de carregamento, vazio e erro; e nota de fonte/metodologia. Não serão antecipados KPIs avançados, correlações, comparativos, artigos ou mapa regional.

## Sequência mínima de execução

| Ordem | Passo | Critério de conclusão |
|---:|---|---|
| 1 | Declarar as três tabelas Panorama em arquivo Drizzle isolado e somente leitura | Tipos refletem exatamente nomes e tipos reais; nenhuma migração criada |
| 2 | Criar repositório de leitura e utilitário puro de períodos | Consultas só usam `select`; testes de fronteiras de período aprovados |
| 3 | Implementar e registrar o router público `panorama` | Chamadas reais retornam 19 grupos, 125 métricas e série histórica válida |
| 4 | Criar a página canônica `DataLab.tsx` | Métrica, período, gráfico e tabela funcionam com dados do Railway |
| 5 | Neutralizar protótipos duplicados sem exclusão destrutiva | Arquivos antigos passam a reexportar a página canônica ou deixam de quebrar o build |
| 6 | Registrar `/data-lab` e o tratamento visual de rota escura | Link existente no menu abre a página pública correta |
| 7 | Executar testes focados, suíte completa e build | Novos testes passam; falhas preexistentes são distinguidas; build conclui |
| 8 | Validar logs, desktop e smartphone no servidor original | Sem erros de runtime nas rotas testadas; layout legível em ambos os viewports |
| 9 | Apresentar preview e relatório de evidências | Usuário consegue avaliar antes de qualquer versionamento |
| 10 | Aguardar autorização | Commit e push continuam bloqueados até resposta explícita |

## Fora do escopo desta entrega

A sincronização trimestral, a carga histórica complementar, jobs periódicos, escrita no banco, automação, publicação, exportações, comparativos entre métricas, motor de insights, correlações, Inteligência do Mercado e Consórcio pelo Brasil permanecem fora do MVP. Essas frentes exigem autorização e validações próprias.

## Referências

[1]: https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/documentacao "Banco Central do Brasil — documentação do serviço Panorama do Sistema de Consórcios v1"
[2]: https://dadosabertos.bcb.gov.br/dataset/dados-agregados-do-segmento-de-consorcios "Banco Central do Brasil — Dados Agregados do Segmento de Consórcios"
[3]: https://olinda.bcb.gov.br/olinda/servico/PANORAMA_DE_CONSORCIOS/versao/v1/odata/$metadata "Banco Central do Brasil — metadado OData do Panorama de Consórcios"
