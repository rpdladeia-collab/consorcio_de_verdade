# Migração Consórcio de Verdade - Clone Manus

## Status da Migração

### Arquivos Migrados
- [x] Client (235 arquivos) - Todos os componentes React, páginas, hooks e estilos
- [x] Server (43 arquivos) - Todos os roteadores tRPC, middleware e lógica de negócio
- [x] Shared (arquivos compartilhados) - Constantes e tipos compartilhados
- [x] Public (assets públicos) - Favicon, manifest e arquivos estáticos
- [x] Drizzle (schema e configurações) - Schema do banco de dados MySQL
- [x] Configurações (vite.config.ts, tsconfig.json, vitest.config.ts, etc.)
- [x] Patches (wouter patch para compatibilidade)

### Stack Preservada
- [x] React 19 + Vite 7
- [x] Express 4 + tRPC 11
- [x] Tailwind CSS 4 + Framer Motion
- [x] Wouter (roteamento) + Zustand (estado)
- [x] Radix UI + shadcn/ui (componentes)
- [x] Drizzle ORM + MySQL
- [x] jsPDF + jspdf-autotable (geração de PDFs)
- [x] Recharts (gráficos e dashboards)
- [x] AWS S3 (armazenamento de arquivos)
- [x] Manus OAuth (autenticação)

### Funcionalidades Confirmadas
- [x] Servidor Express rodando na porta 3000
- [x] Vite em modo desenvolvimento com HMR
- [x] OAuth inicializado com Manus
- [x] Página inicial carregando com design original
- [x] Navegação e componentes funcionando
- [x] Banco de dados pronto (schema copiado)

### Próximas Etapas (Após Aprovação)
- [ ] Testar todos os simuladores (Raio-X, Zona de Contemplação, Panorama)
- [ ] Validar integração com banco de dados
- [ ] Testar autenticação OAuth completa
- [ ] Validar geração de PDFs
- [ ] Testar integração com S3
- [ ] Verificar responsividade em dispositivos móveis
- [ ] Executar suite de testes (pnpm test)

## Notas Importantes
- Nenhuma alteração visual foi feita - design 100% preservado
- Todas as configurações originais mantidas
- Stack completa migrada fielmente
- Projeto pronto para desenvolvimento e testes

### Correções do Simulador 1
- [x] Substituir integralmente o conteúdo do card “Como essa projeção foi construída” por grid de duas colunas com Carta de Crédito, Taxa de Administração Contratual, Fundo de Reserva, Aumento da Carta, Aumento da Taxa de Administração e Seguro de Vida Total calculados a partir das variáveis reais.
- [x] Exibir no rodapé do card o Total Projetado real, usando a soma efetiva das parcelas pagas (`result.paidTotal`).
- [x] Cobrir a matemática e a renderização do card com teste Vitest e validar visualmente em desktop e smartphone.

### Simulador Autopagável - Ajustes
- [x] Adicionar opção de parcela linear/não linear nos parâmetros de comparação (mesma lógica do Simulador Custo de Operação)
- [x] Ajustar cálculo de patrimônio investido para usar rendimento líquido de IR (15% como padrão) com tag "Rendimento líquido de IR"
- [x] Calcular custo de oportunidade sobre o investimento líquido (após desconto de IR)


---

## Simulador "A Parcela Hoje e Amanhã" - Reconstrução Completa

### Card Resumo
- [x] Adicionar tags explicativas aos 4 cards principais (Primeira Parcela, Maior Parcela, Total Pago, Carta Final)

### Análise Reconstruída
- [x] Implementar Visão Executiva com selo de risco automático (Baixo/Médio/Alto)
- [x] Implementar bloco "Como o Dinheiro se Distribui" com percentuais e fluxo visual
- [x] Implementar "Custo Efetivo da Operação" com interpretação automática
- [x] Implementar "Onde está o Dinheiro" com gráficos de distribuição percentual
- [x] Implementar "O que é Custo e o que não é" com tags didáticas
- [x] Implementar indicadores de Evolução de Parcelas (primeira, última, maior, crescimento)
- [x] Implementar indicadores de Evolução da Carta (inicial, correções, final, crescimento)
- [x] Implementar indicadores de Evolução da Taxa (contratada, correções, final)
- [x] Implementar bloco de Indicadores Técnicos com interpretações
- [x] Implementar Interpretação Automática (Pontos Positivos, Atenção, Riscos, Perfil Indicado)

### Tabela de Fluxo
- [ ] Adicionar filtro e busca na tabela de fluxo
- [ ] Adicionar funcionalidade "Ir para mês"
- [ ] Adicionar resumo anual na tabela
- [ ] Adicionar marcação visual dos meses com reajuste
- [ ] Adicionar legenda fixa explicando cada coluna
- [ ] Adicionar tooltips em todos os cabeçalhos

### Glossário
- [x] Implementar bloco de Glossário com 14 termos técnicos

### Testes e Validação
- [x] Testar responsividade em mobile
- [x] Validar cálculos e interpretações automáticas
- [x] Verificar consistência visual com outros simuladores
- [ ] Criar checkpoint final


---

## Simulador "A Parcela Hoje e Amanhã" - Reestruturação como Laudo Técnico Interativo

### REGRA 1: NÃO ALTERAR
- [x] Layout
- [x] Paleta
- [x] Tipografia
- [x] Organização da página
- [x] Cards superiores
- [x] Fluxo mensal
- [x] Estrutura geral

### REGRA 2: ELIMINAR TODAS AS OPINIÕES
- [x] Remover "Risco Médio/Alto/Baixo"
- [x] Remover "Pontos Positivos/Negativos"
- [x] Remover "Perfil Moderado/Conservador/Agressivo"
- [x] Remover "Taxa acima da média"
- [x] Remover "Recomendado/Não recomendado"

### REGRA 3: RASTREABILIDADE MATEMÁTICA
- [x] Cada indicador deve responder: "O que é?", "Como foi calculado?", "Por que aconteceu?"

### Bloco 1: Visão Executiva
- [x] Separar PARÂMETROS de RESULTADOS
- [x] Quadro 1 (Parâmetros): Carta, Prazo, Taxa Administrativa, Correção Contratada, Periodicidade, Modelo
- [x] Quadro 2 (Resultados): Carta Final, Crescimento da Carta, Primeira Parcela, Maior Parcela, Total Pago

### Bloco 2: Como o Dinheiro Evolui
- [x] Criar 4 áreas independentes:
  - [x] Fluxo Patrimonial (Carta → Correções → Carta Atualizada)
  - [x] Fluxo de Remuneração (Taxa Contratada → Correções → Taxa Total)
  - [x] Fluxo de Proteção (Seguro → Seguro Total)
  - [x] Fluxo Financeiro (Parcelas → Total Pago)

### Bloco 3: Custo Efetivo da Operação
- [x] Definir "Custo Explícito" = Taxa Administrativa + Seguro (NUNCA incluir correção)
- [x] Mostrar: Valor, % sobre Carta Inicial, % sobre Carta Atualizada, % sobre Total Pago
- [x] Informar explicitamente qual é a base em cada percentual

### Bloco 4: Onde está o Dinheiro
- [x] Separar visualmente: Patrimônio, Remuneração, Seguro, Atualização Monetária
- [x] Cada componente: Valor, Percentual, Base utilizada, Explicação
- [x] NUNCA somar componentes de naturezas diferentes sem informar

### Bloco 5: Evolução da Parcela
- [x] Manter estrutura
- [x] Acrescentar: Quantidade de reajustes, Percentual acumulado, Valor absoluto
- [x] Adicionar relação intuitiva (ex: "Cada R$100 → R$241")

### Bloco 6: Evolução da Carta
- [x] Corrigir erros de origem dos valores
- [x] Mostrar: Carta Inicial, Atualizações Monetárias Acumuladas, Carta Final, Crescimento Nominal, Crescimento Percentual
- [x] REMOVER "Crescimento anual 0,11%"

### Bloco 7: Evolução da Taxa
- [x] Substituir estrutura atual (que não informa nada)
- [x] Mostrar: Taxa Contratada → Valor Financeiro Inicial → Correções → Valor Financeiro Final → Aumento Financeiro
- [x] Explicar: "A taxa percentual permanece constante. O valor financeiro aumenta porque acompanha a atualização monetária."

### Bloco 8: Indicadores Técnicos
- [x] Corrigir variáveis trocadas
- [x] Mostrar exatamente: Prazo, Correção Contratada, Seguro Contratado, Taxa Administrativa, Periodicidade, Modelo
- [x] NUNCA substituir correção por taxa
- [x] NUNCA usar classificações subjetivas

### Bloco 9: Evidências Matemáticas
- [x] Substituir "Interpretação Automática" completamente
- [x] Cada evidência: Fato, Motivo, Consequência, Origem do cálculo
- [x] Exemplos:
  - [x] "A parcela cresce 142%. Motivo: Correção anual. Consequência: Maior comprometimento. Origem: Comparação primeira/maior parcela"
  - [x] "A carta cresce 157%. Motivo: Atualização monetária. Consequência: Preservação do poder de compra. Origem: Carta inicial vs final"
- [x] NUNCA usar: bom, ruim, alto risco, baixo risco, vale a pena

### Motor de Tags
- [x] Adicionar explicação breve a cada indicador importante (tags/tooltips visíveis)
- [x] Exemplo: "Carta Atualizada" → "Valor projetado após todas as atualizações monetárias."
- [x] Validar tags em todos os 9 blocos relevantes

### Botão "Como esse número foi calculado?"
- [x] Criar botão ⓘ para cada indicador importante
- [x] Ao clicar, exibir: Fórmula utilizada, Variáveis, Resultado, Explicação
- [x] Transforma o simulador em ferramenta auditável

### Glossário
- [x] Atualizar cada termo com: Definição, Como é calculado, Onde aparece no simulador

### Validação Final
- [x] Rastreabilidade matemática em TODOS os indicadores
- [x] Nenhuma variável confundida
- [x] Todas as bases percentuais explicitamente identificadas
- [x] Todas as afirmações reproduzíveis a partir dos cálculos do motor matemático


---

## Simulador "Estrutura do Plano" - Implementação Completa

### Fase 1: Extração do Motor de Cálculo
- [x] Documentar motor JavaScript do HTML original
- [x] Identificar todas as funções e estruturas de dados
- [x] Criar referência de parâmetros e cálculos

### Fase 2: Backend tRPC
- [x] Criar server/lib/estruturaDoPlano.ts com motor de cálculo 100% fiel
- [x] Implementar server/routers/estruturaDoPlano.ts com endpoint `simulate`
- [x] Integrar router em server/routers.ts

### Fase 3: Frontend React
- [x] Criar client/src/pages/EstruturaDoPlano.tsx com layout mobile-first
- [x] Implementar formulário com todos os parâmetros do HTML
- [x] Criar tabela mensal de evolução com eventos
- [x] Adicionar KPIs consolidados

### Fase 4: Gráfico de Evolução Anual
- [x] Criar client/src/components/cdv/YearlyEvolutionChart.tsx
- [x] Implementar gráfico Recharts (Carta Final, Parcela Média, Saldo Final)
- [x] Adicionar tabela resumida anual com correções

### Fase 5: Validação
- [x] Testar motor com valores do HTML original
- [x] Validar primeira parcela: R$ 3.194,44 ✓
- [x] Validar maior parcela: R$ 6.324,78 ✓
- [x] Validar total pago: R$ 827.178,27 ✓
- [x] Validar carta final: R$ 989.965,80 ✓

### Fase 6: Integração
- [x] Adicionar rotas: /simulador/estrutura-do-plano e /simuladores/7
- [x] Integrar em App.tsx
- [x] Testar renderização no navegador
- [x] Adicionar card na página de Simuladores (Raio-X do Consórcio)
- [x] Atualizar contador de análises (8 → 9)

### Pendências (Futuro)
- [ ] Adicionar filtro e busca na tabela mensal
- [ ] Implementar funcionalidade "Ir para mês"
- [ ] Adicionar resumo anual na tabela
- [ ] Adicionar tooltips explicativos
- [x] Criar testes Vitest para o motor de cálculo
- [ ] Validar responsividade em todos os breakpoints


---

## RECONSTRUÇÃO: Simulador "Estrutura do Plano" (v2 — fiel ao HTML)

### Fase 2: Reescrever backend
- [x] Corrigir EPS para 0.02 (igual HTML)
- [x] Corrigir applyAdjustment: calcular beforeTotal ANTES da mutação
- [x] Corrigir applyPaymentPolicy: usar lógica de range + fullBase/componentBudget do HTML
- [x] Adicionar cálculo de custos da operação (renderCosts)
- [x] Adicionar cálculo de investimentos (simulateInvestmentComparison)
- [x] Adicionar buildYearlyCorrections
- [x] Atualizar router com novos campos (savingsRate, cdbRate)

### Fase 3: Reconstruir página React
- [x] 4 abas internas: Dados da proposta, Custos, Correções, Investimentos
- [x] "Política de parcelas" → "Linear e não linear"
- [x] Remover import e uso de YearlyEvolutionChart
- [x] Remover tabela de evolução ANUAL aberrante (YearlyEvolutionChart) — a tabela mensal da aba 1 é parte fiel do HTML original
- [x] Layout seguindo padrão RaioXLayout (paleta clara)
- [x] Conteúdo fiel ao HTML (textos, KPIs, tabelas)

### Fase 4: Validação
- [x] Testar cálculos com valores do HTML (500k, 180 meses, 15%)
- [x] Verificar renderização no navegador
- [x] Checkpoint final
- [x] Corrigir parser decimal para preservar taxas com ponto (0.515 e 0.795), evitando valores inflados na aba Consórcio x investimentos
- [x] Adicionar testes Vitest do motor com os valores padrão do HTML e cenário sem correção
- [x] Validar as quatro abas e a ausência de Contemplação, Capital Novo, gráfico e tabela de evolução anual aberrante
- [x] Salvar checkpoint final da reconstrução corrigida


---

## Correções do Simulador Estrutura do Plano (v3)

- [x] 1. Renomear lacuna "Correção por período (%)" para "Correções (INCC, IPCA)" + ícone laranja com link para FGV
- [x] 2. Corrigir afirmação "O custo total mostra quanto foi pago acima da carta final projetada"
- [x] 3. Card 2: trocar título "Correções do saldo" → "Saldo devedor" + adicionar "Valor contratado + taxa" como saldo devedor inicial
- [x] 4. Card 2: atualizar rótulos das linhas conforme solicitado pelo usuário
- [x] 5. Validar renderização e checkpoint
- [x] Reorganizar KPIs da aba "Dados da proposta": linha 1 (parcela inicial, carta inicial, custo taxa adm inicial), linha 2 (parcela final, carta final, custo taxa adm final), remover "Total projetado"
- [x] Excluir os blocos "Racional" e "Leitura do total" da aba "Dados da proposta"


---

## Ajustes de Usabilidade - Menu Custos (v4)

- [x] Item 1: Trocar "Sobre carta/fundo comum" → "Atualização monetária da carta de crédito" + descrição em tooltip
- [x] Item 2: Trocar "Sobre taxa adm. ainda não paga" → "Atualização monetária da taxa administrativa" + descrição em tooltip
- [x] Item 3: Adicionar botão "?" no "Reajuste total do saldo devedor" com explicação técnica
- [x] Item 4: Remover aviso amarelo "Não somar duas vezes..."
- [x] Card "Custo Operacional": adicionar "?" no título com explicação
- [x] Linha "Taxa administrativa projetada": adicionar "?" com explicação
- [x] Linha "Custo Operacional Total": adicionar "?" com explicação
- [x] Card "Base de Crédito" linha "Reajuste da carta": adicionar "?" com explicação
- [x] Eliminar textos explicativos fixos - mover tudo para tooltips "?"
- [x] Validar e checkpoint
- [x] Replicar a estrutura de apresentação do menu "Custo da operação" do HTML Raio-xdoConsórcioSITE_.renatto.html no simulador Estrutura do Plano, mantendo parâmetros e cálculos existentes
- [x] Implementar tabela "Fluxo completo da operação" na aba Custos
- [x] Validar visualmente a aba Custos após reconstrução
- [x] Salvar checkpoint v5
- [x] Barra de aplicações (poupança/CDB) só aparece na aba Consórcio x investimentos
- [x] Tabela: Taxa de adm e Parcelas em VERMELHO, Carta e Carta corrigida em VERDE
- [x] Remover KPI "Correção fundo comum" da aba Custos (manter apenas custos explícitos)
- [x] Corrigir layout da aba Custos: textos transbordando, falta de proporcionalidade, tabs quebrando linha
- [x] Restringir a aba Custos aos custos explícitos: taxa administrativa contratual, atualização da taxa, seguro e total explícito
- [x] Remover da apresentação de Custos os itens não explícitos: fundo reserva, aumento da carta, total pago nominal e leitura de spread
- [x] Simplificar o fluxo da aba Custos para mostrar apenas taxa administrativa, seguro, custo explícito mensal e acumulado
- [x] Validar visualmente a aba Custos no desktop e mobile, sem overflow e com cards proporcionais
- [x] Executar testes Vitest e salvar checkpoint final desta correção
- [x] Adicionar destaque com percentual do custo total sobre a carta corrigida final na aba Custos
- [x] Excluir tabela "Evolução dos custos explícitos" (mês a mês) da aba Custos
- [x] URGENTE: Restaurar fundo de reserva no racional e apresentação da aba Custos (motor já calculava, mas a aba estava ocultando)
- [x] Adicionar teste Vitest cobrindo reserveRate > 0 e impacto em fr, sums.fr, custoOperacional e fundoReservaProjetado

---

## Correção de Layout - Aba Custos (v8)

- [x] Corrigir KPI cards da aba Custos que estão se sobrepondo/estourando o container (5 colunas com whitespace-nowrap em painel estreito)
- [x] Corrigir tabela de composição com min-w que causa overflow horizontal
- [x] Validar layout em mobile e desktop

---

## Correção de Layout + Gráfico de Correções - Aba Histórico de Correções (v9)

- [x] Construir gráfico moderno de degraus de correção (parcela vs carta) antes da tabela Histórico de correções
- [x] Corrigir enquadramento da tabela "Histórico de correções ano a ano" para notebook e mobile
- [x] Validar visualmente em desktop e mobile (390 px real: sem overflow, gráfico e 15 cards contidos)
- [x] Rodar testes Vitest e salvar checkpoint

---

## Racional e Ponto-chave acima da tabela + Destaque sobre critérios de correção (v10)

- [x] Mover Racional e Ponto-chave para acima da tabela Histórico de correções ano a ano
- [x] Adicionar destaque informando que correções seguem regras da administradora e do contrato (em geral, antes da contemplação afetam carta e saldo; depois, apenas o saldo)
- [x] Melhorar e encurtar o texto do destaque
- [x] Validar visualmente e salvar checkpoint
- [x] Transformar tabela Histórico de correções em accordion fechado com setinha para expandir

---

## Aba Consórcio x Investimentos - Ajustes (v11)

- [x] Adicionar destaque "A Ilusão Nominal vs. Realidade" antes do bloco "Mesmo esforço em renda fixa"
- [x] Remover frase "renda fixa venceu" de todas as análises
- [x] Simplificar para apenas poupança e CDI líquido (remover CDB bruto de todos os quadrantes e análises)
- [x] Adicionar tabela "Auditoria de Fluxo de Caixa (Igualado)" com colunas: Mês, Parcela (Aporte), Carta Atualizada, Saldo Investimento
- [x] Validar visualmente, rodar testes e salvar checkpoint

---

## Exclusão de Simuladores (v12)

- [ ] Excluir Simulador 1 (A Parcela Hoje e Amanhã) - rota, página, card e referências
- [ ] Excluir Simulador 2 (Raio-X do Lance) - rota, página, card e referências
- [ ] Excluir Simulador 4 (Proporção da Taxa) - rota, página, card e referências
- [ ] Atualizar contador de simuladores na página Simuladores
- [ ] Validar build, rodar testes e salvar checkpoint

---

## Exclusão dos Simuladores 1, 2 e 4

- [x] Remover imports e rotas do App.tsx (SimuladorSimulePlano, SimuladorContemplacao, SimuladorProporcaoTaxa)
- [x] Remover cards da página Simuladores.tsx (simule-seu-plano, raio-x-do-lance, proporcao-taxa)
- [x] Atualizar contador "9 análises" → "6 análises" no hero da página Simuladores
- [x] Atualizar contador "8 análises" → "6 análises" no botão do hero
- [x] Remover links da Home.tsx para os 3 simuladores excluídos
- [x] Remover entradas do catálogo simuladores.ts (simule-seu-plano, contemplacao, proporcao-taxa)
- [x] Limpar categorias não utilizadas (plano, contemplacao, eficiencia) do tipo CategoryKey
- [x] Excluir arquivos de página: SimuladorSimulePlano.tsx, SimuladorContemplacao.tsx, SimuladorProporcaoTaxa.tsx
- [x] Excluir arquivos PDF: pdfSimulePlano.ts, pdfContemplacao.ts, pdfProporcaoTaxa.ts
- [x] Verificar ausência de referências remanescentes (grep em client/src e server)
- [x] Testes do simulador Estrutura do Plano: 12/12 passando
- [x] Salvar checkpoint

---

## Correções adicionais do Raio-X e estado de espera

- [ ] Corrigir a numeração exibida na página Raio-X para não reaproveitar os números 01 e 03 dos simuladores removidos/substituídos
- [ ] Alterar o texto do menu de "Raio-X do Consórcio" para "Raio-X" nas versões desktop e móvel
- [ ] Criar componente reutilizável de estado "Aguardando análise" com fundo preto, logomarca centralizada e texto no canto inferior direito
- [ ] Integrar o novo estado de espera em todos os simuladores que exibem resultados antes do processamento
- [ ] Criar ou atualizar testes Vitest de regressão para as alterações
- [ ] Validar visualmente em desktop e mobile
- [ ] Salvar checkpoint das correções

---

## Correções adicionais (Julho 2026)

- [x] Remover rotas numéricas antigas (/simuladores/3, /simuladores/6, /simuladores/7, /simuladores/8, /simuladores/9) do App.tsx
- [x] Renomear "Raio-X do Consórcio" para "Raio-X" no Home.tsx e Simuladores.tsx
- [x] Tela "Aguardando análise" com fundo preto + logomarca centralizada + texto no canto inferior direito (já implementado via WaitingAnalysisScreen)
- [x] Validar build e salvar checkpoint

---

## Exclusão do simulador Custo da Operação

- [x] Remover card do Custo da Operação da seção 02 no Simuladores.tsx
- [x] Remover card do Custo da Operação do Home.tsx
- [x] Remover rota e import do SimuladorCustoOperacao do App.tsx
- [x] Excluir arquivos SimuladorCustoOperacao.tsx e pdfCustoOperacao.ts
- [x] Atualizar contador de análises (8 → 7)
- [x] Validar build e salvar checkpoint


---

## Integração do Lance Livre no Estrutura do Plano (v13)

- [x] Estender interface `EstruturaOptions` para incluir parâmetros do lance
- [x] Adicionar função `analyzeLanceImpact()` em `server/lib/estruturaDoPlano.ts`
- [x] Estender `EstruturaResult` com campo `lanceAnalysis`
- [x] Atualizar router `server/routers/estruturaDoPlano.ts` com novos campos de entrada
- [x] Adicionar novo menu "Estrutura do Lance" em `EstruturaDoPlano.tsx` (aba 5)
- [x] Implementar painel de entrada com campos: base do lance, parcelas pagas, lance próprio, FGTS, embutido, estratégia pós-contemplação
- [x] Integrar análise de viabilidade do lance nos cálculos
- [x] Salvar parâmetros do lance em sessionStorage
- [x] Exibir resultados da análise de lance na nova aba
- [x] Criar testes Vitest para o novo motor de lance integrado
- [ ] Validar responsividade em mobile
- [ ] Salvar checkpoint final


## Correções Estrutura do Lance (v14)

- [x] CARTA ATUALIZADA deve incluir valor da carta + correção aplicada (não apenas valor base)
- [x] Debugar motor: correção não está sendo refletida no 13º/14º mês da tabela
- [x] Visual: linhas com eventos atípicos (correção, lance) devem ter fundo laranja
- [x] Testar completamente antes de entregar

---

## Geração de PDF - Estrutura do Lance (v15)

- [x] Criar arquivo pdfEstruturaDaLance.ts com gerador jsPDF
- [x] Implementar tabelas de parâmetros, KPIs e diagnóstico
- [x] Integrar botão PDF com handler real
- [x] Testar geração de PDF e validar layout
- [x] Adicionar bloco de transparência ao PDF
- [x] Salvar checkpoint
