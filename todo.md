# Project TODO

- [x] Investigar e documentar a URL exata de um arquivo ZIP oficial de consórcios disponibilizado pelo Banco Central.
- [x] Comprovar o mecanismo técnico que a aplicação do Banco Central usa para obter e disparar o download dos arquivos.
- [x] Comprovar ou registrar como NÃO COMPROVADA a existência de API interna, endpoint JSON e mecanismo intermediário de download.
- [x] Comprovar ou registrar como NÃO COMPROVADO se um ZIP oficial pode ser obtido por uma requisição HTTP simples, sem automação de navegador.
- [x] [SUPERSEDIDO PELO ESCOPO FIXO] Não executado: a análise de outros conjuntos do BC foi proibida; somente Dados Consolidados foi auditado.
- [x] [SUPERSEDIDO PELO ESCOPO FIXO] Não executado: o escopo aprovado determina exclusivamente Dados Consolidados.
- [x] Produzir relatório de investigação com evidências reproduzíveis, lacunas explícitas e recomendação técnica condicionada à aprovação do usuário.
- [ ] Aguardar aprovação expressa antes de qualquer implementação, alteração de código, automação ou agendamento.
- [x] Restringir toda a investigação da Fase 1 exclusivamente a Dados Consolidados de consórcios, sem avaliar ou utilizar outros conjuntos do Banco Central.
- [x] Comprovar a cobertura e o acesso aos últimos 24 meses de Dados Consolidados por URLs oficiais do Banco Central.
- [x] Auditar, com evidências reais do BC, a disponibilidade, sequência mensal, padrão de URL e integridade dos 24 ZIPs de Dados Consolidados.
- [x] Produzir tabela comparativa dos arquivos internos de todos os 24 ZIPs oficiais de Dados Consolidados.
- [x] Auditar todos os CSVs oficiais quanto a colunas, cabeçalhos, encoding, delimitador, linhas corrompidas e registros vazios.
- [x] Auditar todos os registros oficiais quanto a Data_base, duplicidades, CNPJ, administradoras, campos obrigatórios e valores inconsistentes.
- [x] Inventariar integralmente o dicionário oficial e as métricas do BC sem interpretar, transformar ou criar métricas próprias.
- [x] Redigir parecer técnico de qualidade, limitações, riscos técnicos, dependências e riscos de alteração de layout.
- [ ] Não implementar qualquer funcionalidade, código, banco, API, tela, dashboard, cron ou importador antes de aprovação expressa da auditoria.
- [x] Adicionar ao relatório de auditoria uma tabela explícita, com uma linha por cada uma das 24 datas-base, listando os arquivos internos presentes em cada ZIP oficial de Dados Consolidados.
- [x] Encerrar a investigação técnica do Banco Central para a V1 e não realizar novas investigações fora do escopo aprovado.
- [x] Inventariar todos os campos oficiais de Dados Consolidados que podem ser associados a uma administradora.
- [x] Agrupar os campos oficiais em categorias funcionais sem cálculos, scores, rankings, telas ou UX.
- [x] Classificar, sem criar métricas, quais informações possuem histórico mensal, quais permitem comparação temporal direta e quais exigem ressalvas para consumidor final.
- [ ] Entregar a matriz funcional de informações oficiais para Panorama > Administradoras e aguardar aprovação antes de implementar qualquer camada técnica.
- [ ] Entregar ao usuário a matriz funcional de informações oficiais com resumo das categorias e ressalvas, anexando o arquivo correspondente.
- [ ] Registrar explicitamente o estado de espera por aprovação e não iniciar implementação técnica até instrução expressa do usuário.
- [x] Definir critérios de valor informacional para o consumidor usando exclusivamente os campos oficiais dos Dados Consolidados.
- [x] Classificar todos os campos oficiais em alto, médio, baixo valor ou provável não exibição ao usuário final.
- [x] Registrar, para cada campo, utilidade prática, histórico comparável de 24 meses, potencial temporal e decisão de espaço na V1.
- [x] Produzir recomendação objetiva do conteúdo obrigatório da V1, do conteúdo adiável para V2 e do conteúdo a descartar do escopo inicial.
- [x] Entregar a Matriz de Valor do Produto, com classificação de campos e recomendação V1/V2/descarte.
- [ ] Aguardar aprovação explícita da Matriz de Valor antes de qualquer implementação técnica.
- [x] [INTERROMPIDO POR CORREÇÃO DE ESCOPO] Recuperar o contexto funcional documentado do Consórcio de Verdade antes de definir análises de apoio à decisão. Nenhuma matriz de decisão foi produzida a partir deste item.
- [x] [INTERROMPIDO POR CORREÇÃO DE ESCOPO] Mapear dúvidas reais de decisão de compra de consórcio aos fatos oficiais disponíveis nos Dados Consolidados. Não executado como linha paralela.
- [x] [INTERROMPIDO POR CORREÇÃO DE ESCOPO] Delimitar análises permitidas, limites dos dados e mensagens obrigatórias de transparência sem criar recomendação automática. Não executado como linha paralela.
- [x] [INTERROMPIDO POR CORREÇÃO DE ESCOPO] Recomendar o conjunto mínimo de análises de apoio à decisão para a V1 sem propor implementação técnica. Não executado como linha paralela.
- [x] [INTERROMPIDO POR CORREÇÃO DE ESCOPO] Entregar a matriz de decisão do Consórcio de Verdade e aguardar aprovação antes de qualquer implementação. Não executado.
- [x] Executar a Fase 3 exclusivamente como Matriz de Valor dos campos oficiais, classificando valor, utilidade, histórico comparável, potencial temporal e prioridade V1/V2/descarte.
- [x] [CORREÇÃO DE ESCOPO APLICADA] A entrega válida da Fase 3 não redefine o produto, não amplia a investigação e não cria uma nova linha de análises além da solicitação original.
- [x] [HISTÓRICO DE ESCOPO] Houve tentativa anterior de reorientar a Fase 3 para uma matriz de decisão; ela foi interrompida após a correção expressa do usuário. A única entrega válida desta fase é `MATRIZ_DE_VALOR_PANORAMA_ADMINISTRADORAS_FASE3.md`.
- [ ] Comparar, exclusivamente pelo valor de produto, o que Dados Consolidados mostram e o que Dados por UF acrescentam sobre contemplação e comportamento operacional.
- [ ] Responder objetivamente quais informações de alto valor ficam ocultas sem Dados por UF e quais passam a ficar disponíveis com essa base.
- [ ] Avaliar se a ausência dessas informações compromete a proposta de valor do Consórcio de Verdade usando apenas uma das respostas permitidas.
- [ ] Entregar o parecer estratégico da Fase 4 sem inventário completo, arquitetura, modelagem ou sugestão de implementação.
- [ ] Aguardar a decisão explícita do usuário sobre aumentar ou não o escopo da V1 antes de qualquer desenvolvimento.
- [x] Elaborar a Matriz de Entrega do Produto — V1 Panorama > Administradoras, descrevendo o que o consumidor poderá descobrir com Dados Consolidados e Dados por UF do Banco Central, sem proposta de implementação.
- [x] Definir o mapa fechado da camada analítica da V1, cobrindo perfil da administradora, segmentos, grupos, contemplações, lance, sorteio, exclusões, adesões, histórico de 24 meses e limitações oficiais, sem implementação.
- [ ] Adaptar o motor de ingestão para preservar Dados Consolidados e Dados por UF oficiais do Banco Central, sem descarte de campos.
- [ ] Importar e auditar os últimos 24 meses das duas bases oficiais aprovadas, com registros de execução e integridade.
- [ ] Implementar consultas históricas estritamente limitadas ao mapa fechado da camada analítica da V1.
- [ ] Configurar a atualização automática autorizada somente após validar a importação real e as consultas da V1.
- [ ] Entregar evidências de migrações, registros importados, logs de execução e testes reais da Fase 6.
- [ ] Implementar motor de ingestão: downloader determinístico, parser, extractor, orquestrador com SHA-256 e tratamento de erros.
- [ ] Configurar atualização automática diária via Heartbeat/cron (03:00 UTC).
- [ ] Executar importação real dos últimos 24 meses das duas bases oficiais.
- [ ] Validar integridade, coletar evidências reais e entregar comprovação do funcionamento do motor.
- [x] REFATORAÇÃO ALTERNATIVA A: Refatorar schema para modelo linha a linha (1 linha CSV = 1 linha no banco)
- [x] REFATORAÇÃO ALTERNATIVA A: Gerar e aplicar migração SQL no TiDB
- [x] REFATORAÇÃO ALTERNATIVA A: Refatorar parser para retornar linhas individuais
- [x] REFATORAÇÃO ALTERNATIVA A: Refatorar db.ts para inserção linha a linha (bulk insert)
- [x] REFATORAÇÃO ALTERNATIVA A: Refatorar orchestrator para inserção linha a linha
- [x] REFATORAÇÃO ALTERNATIVA A: Limpar banco e re-executar importação completa dos 32 ZIPs
- [x] REFATORAÇÃO ALTERNATIVA A: Coletar as 12 evidências obrigatórias
- [x] REFATORAÇÃO ALTERNATIVA A: Atualizar queries.ts e panorama-admin-router.ts para novo schema

## FASE 8 — MODELAGEM FUNCIONAL DO PANORAMA > ADMINISTRADORAS (V1)

- [x] FASE 8: Consultar dicionário do BC no banco para mapear códigos de segmento → nomes amigáveis
- [x] FASE 8: Classificar manualmente as 143 administradoras em Banco, Adm Independente e Cooperativa
- [x] FASE 8: Modelar as 3 camadas funcionais (Administradora, Segmentos, Grupos) com indicadores e comparativos
- [x] FASE 8: Definir cálculos de médias de mercado e regras de comparativo (acima/abaixo/dentro da média)
- [x] FASE 8: Escrever e entregar o Product Spec completo

## FASE 8.1 — REVISÃO DO PRODUCT SPEC

- [x] FASE 8.1: Revisar classificação — mover associações para "Cooperativas e Associações"
- [x] FASE 8.1: Reescrever Product Spec orientado a perguntas do consumidor (8 alterações)
- [x] FASE 8.1: Mapear viabilidade das 11 inteligências de Top 10 (sem implementar)
- [x] FASE 8.1: Entregar Product Spec revisado para aprovação

## IMPLEMENTAÇÃO PANORAMA > ADMINISTRADORAS (V1)

- [x] ENTREGA 01: Campo de busca + select alfabético + navegação para página da administradora
- [x] ENTREGA 02: Raio-X da administradora (identidade + indicadores operacionais)
- [x] ENTREGA 03: Distribuição da operação (segmentos com grupos, cotas, percentuais)
- [x] ENTREGA 04: Contemplações (lance vs sorteio, histórico trimestral)
- [x] ENTREGA 05: Tendência operacional (crescimento/estável/diminuindo)
- [x] ENTREGA 06: Segmentos (grupos ativos, cotas, taxa, exclusões, contemplações, fila, mercado)
- [x] ENTREGA 07: Grupos (cotas, contemplações, exclusões, taxa, prazo, relevância, comparação)

## CORREÇÕES DE QUALIDADE — PANORAMA > ADMINISTRADORAS

- [x] Adicionar estado de erro explícito para panoramaAdmin.raioX (diferenciar falha de "nenhum dado")
- [x] Adicionar estado de erro explícito para panoramaAdmin.contemplacoes
- [x] Adicionar estado de erro explícito para panoramaAdmin.detalheSegmento
- [x] Adicionar coluna "vs. Segmento" na tabela de grupos (comparativo de taxa do grupo vs média do segmento)

## REORGANIZAÇÃO UX — PANORAMA > ADMINISTRADORAS (9 BLOCOS)

- [x] Auditar métricas: validar exclusões >100%, cotas não contempladas >100% e comparativos de mercado
- [x] Bloco 1: Resumo executivo automático (texto gerado dinamicamente com os dados existentes)
- [x] Bloco 2: Tamanho da operação (grupos, cotas, participação, segmentos, categoria — apenas)
- [x] Bloco 3: Contemplações (lance vs sorteio com destaque, total sobre cotas ativas, comparação com mercado)
- [x] Bloco 4: Fila de espera (cotas aguardando, percentual, comparação com mercado — validar >100%)
- [x] Bloco 5: Exclusões (quantidade, percentual, comparação com mercado, situação em 5 níveis)
- [x] Bloco 6: Distribuição da operação (segmentos com identificação textual)
- [x] Bloco 7: Tendência operacional (substituir Crescendo/Diminuindo por Melhorou/Piorou/Estável)
- [x] Bloco 8: Segmentos (grupos, cotas, contemplações, exclusões, taxa, fila, participação)
- [x] Bloco 9: Grupos (cotas, contemplações, exclusões, taxa, prazo, correção, relevância, comparação)
- [x] Validar no navegador e salvar checkpoint

## FASE 8.2 — REESTRUTURAÇÃO DA TELA INICIAL DO PANORAMA > ADMINISTRADORAS

- [x] Criar consultas de rankings top 3 e totais de mercado no backend
- [x] Reescrever frontend da home em 6 blocos (hero, busca, explorar, rankings, números, rodapé)
- [x] Validar no navegador (desktop + mobile) e salvar checkpoint

## CORREÇÃO DE ESCOPO — FASE 8.2

- [x] Corrigir o item histórico de backend: as consultas e procedures temporariamente criadas para rankings foram integralmente removidas para respeitar a diretriz de não alterar APIs, consultas, banco ou camada analítica.
- [x] Ajustar a home para que rankings e totais não dependam de novas consultas, preservando os seis blocos aprovados.
- [x] Validar desktop e mobile, executar testes e salvar checkpoint da revisão exclusivamente visual.

## REESTRUTURAÇÃO DEFINITIVA V1 — HOME PANORAMA > ADMINISTRADORAS

- [x] Criar consulta única de totais de mercado no backend (adms, segmentos, cotas, grupos — dados reais)
- [x] Reescrever home: 4 blocos enxutos (hero mínimo, busca central, mercado em números texto, rodapé)
- [x] Remover completamente: Explorar o Mercado, rankings fictícios, skeletons, cards "em desenvolvimento"
- [x] Validar no navegador e salvar checkpoint

## EXPORTAÇÃO DA BASE DE DADOS DO BC

- [x] Analisar estrutura dos dados no banco (campos, bases, volume)
- [x] Escrever script de exportação (Node.js) que consulta bc_dados_linha e gera planilha Excel
- [x] Executar o script e gerar o arquivo Excel
- [x] Disponibilizar o arquivo para o usuário (upload + link de download)

## PADRONIZAÇÃO VISUAL — PANORAMA BC COMO MÓDULO NATIVO DO CONSÓRCIO DE VERDADE

- [x] Estudar o padrão visual dos módulos existentes (Raio-X da Parcela, Raio-X do Lance, etc.)
- [x] Redesenhar tela inicial: coluna esquerda (inputs) + coluna direita (o que você descobrirá)
- [x] Redesenhar raio-x da administradora em 8 blocos lógicos no mesmo padrão visual
- [x] Validar no navegador e entregar

## CONCLUSÃO RESTRITA — PANORAMA BC · ADMINISTRADORAS

- [x] Conferir o escopo original e remover qualquer detalhe não solicitado
- [x] Corrigir somente pendências do redesenho já iniciado
- [x] Validar a página em desktop e celular sem alterar outros módulos
- [x] Salvar a versão final do redesenho solicitado

## AJUSTES NO RAIO-X DO CONSÓRCIO — HERO

- [x] Alterar "48,6% DESISTEM" para "48,4% DESISTEM"
- [x] Trocar ano 2024 para 2025 em todo o hero
- [x] Atualizar dados de Imóveis: 54,5% / 3,4 mi cotas
- [x] Atualizar dados de Automóveis: 46,2% / 4,6 mi cotas
- [x] Atualizar dados de Motocicletas: 48,2% / 3,0 mi cotas
- [x] Validar visualmente no navegador
- [x] Cobrir os valores atualizados do hero do Raio-X com teste automatizado

## AJUSTES RAIO-X + PANORAMA:BC — RODADA 2

- [x] 1. Card "Raio-X do Consórcio": trocar texto descritivo abaixo do título
- [x] 2. Simulador Raio-X do Consórcio: remover aviso "Leitura rápida" e subir cards "Racional" e "Ponto Chave"
- [x] 3. Menu "Eficiência da Taxa": trocar subtítulo da tabela "Degradação de Eficiência" e colocar em modo encolhido
- [x] 4. Menu "Dados da Proposta": reordenar cards (parcela inicial, parcela final, carta inicial, carta final, custo taxa inicial, custo taxa final)
- [x] 5. Panorama:BC: adicionar tag amarela "Dados consolidados de 2025" nos heros dos dois menus
- [x] 6. Cobrir as alterações do Raio-X e das tags do Panorama:BC com teste automatizado

## AJUSTES HOME — RODADA 3

- [x] 1. Adicionar tag amarela "Dados consolidados de 2025" no menu Home — Panorama Dados Oficiais
- [x] 2. Remover a frase "Comprar uma cota não significa receber o bem." do card "Vender mais significa entregar melhores resultados?"

## AJUSTES HOME — RODADA 4

- [x] 1. Alterar tag amarela do Home para fundo preto com escrita branca
- [x] 2. Reduzir em 30% o tom das escritas laranja na seção Home — Zona de Contemplação
- [x] 3. Inverter ordem: colocar área "Raio-X" acima da área "Por que simular antes de contratar"

## AJUSTES HOME + PANORAMA — RODADA 5

- [x] 1. Panorama:BC — submenu "Panorama oficial": adicionar tag amarela "Dados integrados com Banco Central em tempo real" no hero
- [x] 2. Home — hero com fundo branco (separar visualmente da seção Raio-X logo abaixo)
- [x] 3. Home — seção Raio-X: reduzir espaço exagerado entre subtítulo e os 4 cards

## RODADA 6 — 7 ALTERAÇÕES

- [x] 1. Home Raio-X: reduzir espaço exagerado entre subtítulo laranja e texto do card (mobile)
- [x] 2. Home hero: botão laranja leva para página Raio-X; excluir frase "simulação gratuita"
- [x] 3. Home área Panorama: excluir frase "aqui vc consegue enxergar..."
- [x] 4. Raio-X Lance sobre Carta: excluir logomarca da dash; manter resultados visíveis antes do input; corrigir fonte fora do padrão
- [x] 5. Raio-X do Lance: adicionar card "Lance Embutido" com tag "em breve" no mesmo formato do card "estratégia de lance"
- [x] 6. Raio-X seção final: corrigir WhatsApp para 31996952204
- [x] 7. Zona de Contemplação: layout parâmetros esquerda + histórico direita; excluir botões "nome do grupo" e "método estatístico"
- [x] 8. Panorama Editorial: tag hero alterada para "Dados 2025" apenas texto amarelo forte
- [x] 9. Panorama Oficial: excluir tag do hero
- [x] 10. Panorama Oficial: área "Interpretação das Métricas" com visualização retraída (accordion)
