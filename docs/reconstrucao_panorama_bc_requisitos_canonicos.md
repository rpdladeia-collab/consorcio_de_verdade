# Reconstrução do Panorama BC — Requisitos Canônicos

**Data da consolidação:** 21 de julho de 2026  
**Projeto autorizado:** repositório original `consorcio_de_verdade`  
**Natureza deste documento:** reconstrução de requisitos; não comprova implementação

## 1. Regra de evidência

Nenhum relatório anterior, mensagem de progresso, documento de validação ou afirmação de conclusão será tratado como evidência de implementação. Um item só poderá ser declarado existente quando houver comprovação direta por código rastreável, consulta ao banco, teste executado, log ou inspeção visual do projeto original.

As expressões **implementado**, **funcionando**, **concluído**, **operacional** e **validado** somente poderão ser usadas junto da evidência verificável correspondente.

## 2. Restrições operacionais permanentes

1. Todo o trabalho deverá ocorrer exclusivamente no projeto original `consorcio_de_verdade`.
2. É proibido criar outro projeto, scaffold, aplicação, frontend, backend, conexão paralela, banco paralelo ou ambiente de desenvolvimento.
3. É proibido alterar a identidade visual existente sem autorização explícita.
4. É proibido fazer commit, push, deploy, publicação, exclusão ou alteração de infraestrutura sem autorização explícita do usuário.
5. O banco e as tabelas `panorama_*` deverão ser tratados como leitura somente durante a camada analítica; qualquer sincronização deverá preservar histórico e idempotência.
6. Dados fictícios, mocks e placeholders não podem comprovar o comportamento do produto.
7. A página pública somente poderá ser implementada após a aprovação da arquitetura de produto reconstruída.

## 3. Evolução cronológica do escopo

| Ordem | Marco | Decisão canônica | Estado probatório inicial |
|---|---|---|---|
| 1 | Fundação técnica | Panorama BC como produto independente **dentro do site existente**, com estrutura de dados genérica e flexível | A verificar no repositório |
| 2 | Auditoria oficial | Levantamento dos recursos oficiais do Banco Central, grupos, métricas, parâmetros, periodicidade e limitações | A verificar nos anexos e fontes oficiais |
| 3 | Fase 01 — Motor de Dados | Importar e preservar dados oficiais; autodescobrir novas métricas; registrar sincronizações; operar com dados persistidos mesmo se a API estiver indisponível | A verificar no código e banco reais |
| 4 | Validação da Fase 01 | Sincronização manual com API e banco reais; evidências quantitativas; idempotência; preservação do histórico; teste de falha | A verificar no ambiente real |
| 5 | Fase 02 — concepção analítica | Mapear análises e cruzamentos possíveis antes do desenvolvimento visual | A reconstruir documentalmente |
| 6 | Redefinição do produto | Panorama BC dividido em **Mercado em Números**, **Inteligência do Mercado** e **Consórcio pelo Brasil** | Decisão de produto vigente |
| 7 | Data Lab | Mercado em Números funciona como explorador inteligente dos dados oficiais, e não como dashboard corporativo | Decisão de produto vigente |
| 8 | Execução incremental | Primeira entrega visual limitada a métrica, período, gráfico de linha e tabela com dados reais | Gate visual ainda depende de aprovação da arquitetura |
| 9 | Inventário analítico | Mapear perguntas positivas e negativas, cruzamentos, oportunidades, limitações, riscos e ativo analítico | A reconstruir e validar contra o catálogo real |
| 10 | Integração futura | Data Lab fica no final do menu interno do Panorama BC e segue o padrão visual já existente | Decisão de navegação vigente |
| 11 | Correção final | Antes de novas telas, entregar apenas a arquitetura de produto e obter aprovação | Gate vigente até aprovação explícita |
| 12 | Reconstrução atual | Reconstituir todo o trabalho correto desde o início, com evidências e sem commits não autorizados | Em execução |

## 4. Arquitetura de produto que deve ser reconstruída

O **Panorama BC** será uma única área editorial e analítica do site atual, composta futuramente por três áreas coordenadas:

| Área | Papel | Escopo |
|---|---|---|
| **Mercado em Números** | Exploração pública e neutra dos dados oficiais | Métricas, séries históricas, períodos, segmentos, comparativos e visualizações estatísticas sem conclusões proprietárias |
| **Inteligência do Mercado** | Camada futura de estudos e inteligência própria | Análises editoriais, estudos do Consórcio de Verdade e, quando aprovados, indicadores proprietários |
| **Consórcio pelo Brasil** | Camada geográfica isolada | Dados territoriais e regionais, sem mistura indevida com séries econômicas nacionais |

O **Motor de Dados** sustenta as três áreas. O **Motor Analítico** ficará entre a persistência oficial e as experiências públicas, fornecendo cálculos determinísticos em TypeScript. Ele não deverá ser um produto ou projeto separado.

## 5. Escopo canônico do Motor de Dados

O Motor de Dados deverá, se a auditoria comprovar que ainda não existe ou está incompleto:

1. consultar exclusivamente recursos oficiais do Banco Central;
2. identificar a última `DataBase` disponível;
3. descobrir grupos e métricas sem modelagem específica por métrica;
4. persistir registros históricos com, no mínimo, `DataBase`, `IdGrupo`, `Grupo`, `IdMetrica`, `Metrica`, `Valor`, `Unidade` e `DataImportacao`;
5. preservar versões históricas e impedir sobrescrita destrutiva;
6. tratar reprocessamento da mesma base de forma idempotente;
7. registrar início, término, volume, erros e resultado de cada sincronização;
8. identificar novas métricas como descobertas e não publicadas até decisão administrativa;
9. continuar servindo dados já armazenados quando a API oficial estiver indisponível;
10. comprovar quantitativamente grupos, métricas, registros, intervalo temporal, duração e volume armazenado.

A automação periódica somente poderá ser considerada depois que a sincronização manual real estiver comprovada e conforme a decisão operacional vigente.

## 6. Organização canônica das métricas

O número **125 métricas** e a quantidade de **19 grupos** são requisitos declarados, não fatos ainda confirmados nesta reconstrução. A auditoria deverá extrair o catálogo real da fonte oficial e/ou do banco real e produzir:

| Nível | Função |
|---|---|
| Grupo oficial | Primeiro nível de organização, preservando a nomenclatura do Banco Central |
| Métrica oficial | Item selecionável com identificador, nome, descrição e unidade |
| Segmento compatível | Dimensão de comparação somente quando indicada pelos dados oficiais |
| Unidade | Regra para formatação e para impedir comparações matematicamente inválidas |
| Disponibilidade temporal | Primeira e última competência existente para cada série |
| Status de publicação | Publicada, descoberta/não publicada ou incompatível com a experiência pública |

Nenhuma taxonomia deve ser inventada antes de conferir o catálogo real. Agrupamentos econômicos adicionais pertencem à arquitetura analítica e devem manter rastreabilidade para os grupos oficiais.

## 7. Blocos analíticos previstos

| Bloco | Conteúdo permitido | Limites |
|---|---|---|
| Seleção e contexto | Métrica, segmento compatível, período e unidade | Não expor complexidade técnica ao usuário |
| Série histórica | Valores por competência, histórico completo ou recortes válidos | Sem interpolar dados ausentes silenciosamente |
| Variações | Mensal, anual e acumulada | Exigir denominador válido e sinalizar bases incompletas |
| Estatística descritiva | Média, mínimo, máximo, amplitude e volatilidade | Explicar unidade e janela |
| Tendência | Médias móveis e regressão linear simples quando houver amostra suficiente | Não apresentar tendência como previsão |
| Comparativos | Métrica × período, métrica × métrica compatível, segmento × segmento e participação | Bloquear cruzamentos de unidades ou conceitos incompatíveis |
| Pontos de atenção | Picos, vales, maiores altas/quedas e quebras de tendência | Linguagem factual, incluindo resultados negativos |
| Resumo determinístico | Crescimento, posição histórica, tendência e alertas de qualidade | Sem IA generativa e sem inferência econômica proprietária |
| Qualidade e limitações | Lacunas, quebras de série, baixa amostra e risco de interpretação | Sempre visível quando relevante |

## 8. Perspectiva analítica equilibrada

O produto não poderá apresentar apenas narrativas favoráveis ao consórcio. A camada analítica deverá revelar, com a mesma neutralidade matemática:

- crescimento e retração;
- estabilidade e volatilidade;
- recordes positivos e quedas históricas;
- expansão de vendas e cancelamentos/exclusões quando os dados permitirem;
- contemplações e eventuais deteriorações de eficiência observável;
- concentração e perda de participação;
- tendências consistentes e reversões;
- sinais de qualidade insuficiente ou interpretação inconclusiva.

Esses achados deverão ser descritos como fatos estatísticos, sem linguagem promocional, acusatória ou causalidade não comprovada.

## 9. Jornada futura do usuário

1. O usuário entra em **Panorama BC** pelo site atual.
2. O menu interno preserva os capítulos editoriais existentes.
3. No final desse menu aparecem, de forma coerente com a arquitetura aprovada, os acessos às áreas futuras, começando por **Mercado em Números / Data Lab**.
4. O usuário escolhe uma métrica a partir dos grupos oficiais ou de busca textual.
5. Escolhe um período predefinido ou personalizado.
6. Visualiza a série histórica e a tabela dos mesmos dados.
7. Recebe contexto estatístico equilibrado, incluindo resultados positivos, negativos e limitações.
8. Quando compatível, aprofunda em comparativos sugeridos.
9. Pode navegar futuramente para **Inteligência do Mercado** ou **Consórcio pelo Brasil**, sem confundir as naturezas editorial, estatística e geográfica.

## 10. Componentes do site atual potencialmente reaproveitáveis

A auditoria do repositório deverá confirmar os nomes concretos. Conceitualmente, poderão ser reaproveitados:

| Categoria | Uso futuro |
|---|---|
| Cabeçalho e navegação global | Manter inserção do Panorama BC no site principal |
| Menu interno/sticky do Panorama | Acesso às áreas futuras, após aprovação |
| Tipografia, cores, espaçamentos e tokens | Preservar identidade visual existente |
| Rodapé e avisos legais | Manter consistência institucional |
| Contêineres, botões, seletores e tabelas genéricos | Evitar componentes paralelos desnecessários |
| Infraestrutura tRPC e Drizzle existente | Expor leitura do Panorama sem novo backend |
| Tratamento global de erros e estados de carregamento | Integrar a experiência ao comportamento do site |

Esta lista é uma hipótese de reaproveitamento a ser confirmada pela inspeção do código. Componentes específicos não serão declarados reutilizáveis sem evidência.

## 11. Gate de implementação

Antes de qualquer implementação visual, deverão existir e ser apresentados:

1. auditoria real do repositório e do banco;
2. matriz requisito × evidência × lacuna;
3. catálogo confirmado de grupos e métricas;
4. arquitetura de produto consolidada;
5. aprovação explícita do usuário.

Até esse gate ser cumprido, não serão criadas páginas, componentes, menus, dashboards, layouts ou fluxos visuais.

## 12. Critério da primeira entrega visual futura

Somente após aprovação, a primeira entrega deverá ser deliberadamente limitada a:

- acesso dentro do Panorama BC;
- seleção de métrica real;
- seleção de período;
- gráfico de linha;
- tabela com os mesmos dados reais;
- validação visual e funcional antes de qualquer expansão.

Nada da Sprint 02 ou de áreas futuras deverá ser antecipado nessa entrega.
