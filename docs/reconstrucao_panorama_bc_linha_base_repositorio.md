# Reconstrução do Panorama BC — Linha de Base do Repositório

**Data da verificação:** 21 de julho de 2026  
**Repositório auditado:** [`rpdladeia-collab/consorcio_de_verdade`](https://github.com/rpdladeia-collab/consorcio_de_verdade)  
**Diretório local:** `/home/ubuntu/consorcio_de_verdade`  
**Natureza:** auditoria somente leitura do código e do histórico Git

## 1. Estado Git verificado

No momento da auditoria, a cópia local estava na branch `main`, no commit `a2cfc437403048b957cc5c333d4842f8fa0b57e4`. O mesmo SHA foi confirmado na branch remota `origin/main`; portanto, não havia commit local pendente de push.

| Item | Evidência verificada |
|---|---|
| Branch local | `main` |
| HEAD local | `a2cfc437403048b957cc5c333d4842f8fa0b57e4` |
| HEAD remoto | `a2cfc437403048b957cc5c333d4842f8fa0b57e4` |
| Repositório remoto | `https://github.com/rpdladeia-collab/consorcio_de_verdade.git` |
| Divergência local/remota | Nenhuma indicada por `git status --short --branch` |
| Alterações funcionais locais | Nenhuma |
| Arquivos locais da reconstrução | `todo.md` modificado; dois documentos não rastreados em `docs/` |

Os arquivos locais da reconstrução ainda **não foram commitados nem enviados ao GitHub**, em cumprimento à proibição expressa de commit sem autorização.

## 2. Sequência dos commits controversos

| Commit | Efeito comprovado | Situação atual |
|---|---|---|
| [`047a412`](https://github.com/rpdladeia-collab/consorcio_de_verdade/commit/047a4127e0c82ac4aa9d5f8000cb0f86a972cf47) | Adicionou 47 arquivos/alterações, incluindo três páginas Data Lab, backend, scripts, schema e documentos | Integralmente revertido no commit seguinte |
| [`bea503e`](https://github.com/rpdladeia-collab/consorcio_de_verdade/commit/bea503e57cdefead17c312d2c19adafd11a268b4) | Reverteu o commit `047a412`, removendo os arquivos e restaurando os arquivos modificados | Vigente no histórico |
| [`a2cfc43`](https://github.com/rpdladeia-collab/consorcio_de_verdade/commit/a2cfc437403048b957cc5c333d4842f8fa0b57e4) | Modificou somente `client/src/pages/Panorama.tsx` para acrescentar um link `Data Lab` no menu interno | É o HEAD atual |

A diferença líquida entre o último commit anterior ao incidente (`3d16421`) e o HEAD atual é de **um arquivo**: `client/src/pages/Panorama.tsx`, com 20 inserções e 9 exclusões.

## 3. Estado real do frontend Panorama BC

O projeto possui uma página rastreada em `client/src/pages/Panorama.tsx` e uma rota pública `/panorama` registrada em `client/src/App.tsx:49`.

A página atual é editorial e utiliza séries importadas de `client/src/lib/panoramaData.ts`. Esse arquivo contém arrays incorporados ao código para dados anuais e por segmento entre 2016 e 2024, além de séries de reclamações e cenário macroeconômico. Não há consulta ao banco, chamada tRPC ou acesso à API do Banco Central nesse arquivo.

| Elemento | Estado comprovado |
|---|---|
| Página `/panorama` | Existe |
| Página `/data-lab` | Não existe no roteador atual |
| Componente `DataLab*.tsx` | Não existe no repositório atual |
| Link `Data Lab` no menu interno | Existe e aponta para `/data-lab` |
| Destino do link | Cai no fallback `NotFound`, pois a rota não existe |
| Fonte atual dos gráficos do Panorama | Arrays estáticos em `client/src/lib/panoramaData.ts` |
| Leitura do MySQL no frontend atual | Não existe |

O link sobrevivente é, portanto, **um link quebrado**. Esta é a explicação técnica para a experiência incorreta observada após o commit.

## 4. Estado real do backend

O arquivo `server/routers.ts` registra apenas os roteadores `system`, `simuladores`, `raiox`, `zonaContemplacao`, `estruturaDoPlano` e `auth`.

| Elemento | Estado comprovado no código atual |
|---|---|
| Router Panorama BC | Não existe |
| Router Data Lab | Não existe |
| Procedimento tRPC para listar métricas | Não existe |
| Procedimento tRPC para séries históricas | Não existe |
| Serviço de sincronização Panorama BC | Não existe no estado rastreado atual |
| Motor analítico TypeScript | Não existe no estado rastreado atual |
| Callback `/api/scheduled/*` do Panorama | Não existe no bootstrap atual |

O projeto possui infraestrutura genérica reutilizável — Express, tRPC, Drizzle, MySQL, Recharts e Heartbeat — mas não há implementação Panorama específica conectada a ela no HEAD atual.

## 5. Estado real do schema e da camada de banco no código

O arquivo `drizzle/schema.ts` declara somente a tabela `users`. O arquivo `server/db.ts` cria a conexão Drizzle a partir de `DATABASE_URL`, mas oferece apenas operações relacionadas a usuários.

| Elemento | Estado comprovado no repositório |
|---|---|
| `panorama_metadata` no schema | Não declarado |
| `panorama_metrics` no schema | Não declarado |
| tabela de logs de sincronização | Não declarada |
| helpers de leitura Panorama | Não existem |
| `DATABASE_URL` genérica | Suportada pelo projeto |

Essa constatação descreve apenas o **código atual**. Ela não prova que as tabelas não existam fisicamente em algum banco remoto; isso será verificado separadamente na auditoria do banco.

## 6. Stack existente que pode ser reaproveitada

O `package.json` comprova que o projeto original já inclui toda a infraestrutura necessária para uma futura implementação, sem novo scaffold:

| Capacidade | Dependências existentes |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion |
| Roteamento | Wouter |
| API tipada | tRPC 11 e Zod |
| Banco | Drizzle ORM e `mysql2` |
| Gráficos | Recharts |
| Testes | Vitest |
| Backend | Express 4 e TypeScript/tsx |
| Agendamento | wrapper Heartbeat em `server/_core/heartbeat.ts` |

A resposta à pergunta operacional obrigatória é, portanto:

> **Sim. Qualquer reconstrução do Panorama BC pode e deve usar exclusivamente a infraestrutura já existente no projeto original. Nenhum novo projeto, backend, frontend, banco ou scaffold é necessário.**

## 7. Problemas objetivos encontrados

| Gravidade | Problema | Evidência |
|---|---|---|
| Crítica | Menu aponta para uma rota inexistente | `Panorama.tsx` contém `href: "/data-lab"`; `App.tsx` não registra essa rota |
| Crítica | Não há backend Panorama no HEAD atual | Ausência em `server/routers.ts` e na árvore rastreada |
| Crítica | Não há motor analítico no HEAD atual | Arquivo criado em `047a412` foi removido em `bea503e` |
| Alta | Panorama atual usa dados incorporados ao frontend | `client/src/lib/panoramaData.ts` |
| Alta | Fonte atual mistura Banco Central e `Consumidor.gov.br` | Arrays e textos da página atual |
| Alta | Schema atual não representa tabelas Panorama | `drizzle/schema.ts` contém somente `users` |
| Média | Documentos anteriores não correspondem ao estado executável | Foram removidos pelo revert ou permaneceram apenas localmente |

## 8. Conclusão da linha de base

O estado real do repositório original é inequívoco: existe a página editorial Panorama BC abastecida por arrays locais, existe um item de menu `Data Lab` apontando para uma rota inexistente e existe infraestrutura full-stack genérica reutilizável. Não existe, no HEAD atual, uma implementação executável do Motor de Dados, do Motor Analítico ou do Data Lab.

A próxima etapa deve verificar separadamente o banco remoto, a possível existência física das tabelas `panorama_*`, os volumes e qualquer automação externa. Até essa verificação, não será afirmado que o banco Panorama existe ou não existe.
