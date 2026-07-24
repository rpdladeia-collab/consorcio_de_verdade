# Migração Consórcio de Verdade - Clone Manus

## Correção autorizada — vínculo Railway

- [x] No serviço web `consorcio_de_verdade`, criar somente `DATABASE_URL = ${{MySQL.MYSQL_URL}}`.
- [x] Não modificar variáveis, credenciais, banco, código ou outros serviços.
- [x] Reiniciar/reimplantar somente o serviço web após salvar a referência.
- [x] Validar `panorama.listGroups`, `panorama.listMetrics` e a página `/data-lab` no domínio publicado.
- [x] Confirmar 19 grupos, 125 métricas, gráfico e tabela em produção.

## Recuperação do histórico BACEN/Railway

- [x] Localizar os commits que introduziram a integração BACEN, o banco Railway e o módulo Panorama.
- [x] Localizar documentação, scripts, variáveis e registros existentes da configuração já fornecida.
- [x] Confirmar qual URL de banco funcional é usada no preview sem expor credenciais.
- [x] Comparar a configuração histórica com o ambiente do serviço publicado.
- [x] Identificar a causa comprovada da perda de conexão no domínio publicado.
- [x] Não solicitar novamente credenciais ou informações já existentes.
- [x] Não alterar, fazer push ou deploy sem autorização expressa.
- [x] Não acessar nem modificar Railway, navegador conectado ou qualquer serviço externo durante esta investigação.

## Auditoria pré-commit — nomenclatura aprovada

- [x] Confirmar repositório, branch, remoto e ausência de divergência remota.
- [x] Confirmar que o diff funcional contém somente as duas substituições aprovadas em `DataLab.tsx`.
- [x] Validar a rota `/data-lab` e os endpoints tRPC no preview correto.
- [x] Validar a conexão do Panorama com o banco e identificar requisitos de `DATABASE_URL` na Railway.
- [x] Executar testes do Panorama e build completo imediatamente antes do commit.
- [x] Criar commit limpo apenas com a alteração aprovada e o histórico de controle pertinente.
- [x] Não executar deploy sem autorização expressa.

## Correção de nomenclatura — Panorama oficial

- [x] Substituir “Mercado em Números” por “Panorama oficial” no título principal da página.
- [x] Substituir “Mercado em Números” por “Panorama oficial” na segunda opção do menu ao lado de “Panorama editorial”.
- [x] Não alterar layout, dados, rotas ou demais textos.
- [x] Validar a nomenclatura no preview correto antes de commit, push ou deploy.

## Incidente urgente — Panorama oficial

- [x] Interromper o preview iniciado incorretamente e restabelecer o launcher oficial do repositório `consorcio_de_verdade`.
- [x] Reproduzir a falha do catálogo do Panorama oficial no ambiente correto e identificar a causa entre frontend, tRPC e Railway.
- [x] Corrigir de forma mínima o carregamento das 125 métricas sem alterar funcionalidades não relacionadas.
- [x] Configurar `DATABASE_URL` no serviço web da Railway e reiniciá-lo somente após aprovação; não é necessário novo commit de código.
- [x] Validar seleção automática e manual de métricas, gráfico, tabela e períodos no preview correto.
- [x] Executar testes específicos do Panorama e o build completo sem erros.
- [x] Entregar um preview funcional para aprovação antes de qualquer novo commit ou push.

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

---

## Exclusao do Simulador "Seu lance aumenta a chance" (v16 - CORRIGIDO)

- [x] Remover APENAS o primeiro simulador (contemplacao) de Simuladores.tsx
- [x] Manter SimuladorLanceCartaXCategoria em Simuladores.tsx
- [x] Remover import de SimuladorContemplacao do App.tsx
- [x] Remover rota /simulador/contemplacao do App.tsx
- [x] Excluir arquivo: SimuladorContemplacao.tsx
- [x] Excluir arquivo PDF: pdfContemplacao.ts
- [x] Remover referencia de contemplacao do Home.tsx
- [x] Manter referencia de lance-carta-x-categoria
- [x] Validar build
- [x] Salvar checkpoint


---

## Reconstrução integral do Panorama BC — solicitação de 21/07/2026

- [x] Reconstituir cronologicamente todos os requisitos enviados no chat e nos anexos, sem tratar relatórios antigos como evidência.
- [x] Identificar o estado exato do repositório original `consorcio_de_verdade`, incluindo arquivos rastreados, não rastreados, commits, reversões e alterações locais.
- [x] Verificar tecnicamente o banco MySQL, as tabelas `panorama_*`, os volumes, a abrangência temporal e a origem dos dados (125 métricas, 19 grupos, 1.250 valores, 10 datas anuais de dezembro, 201612–202512).
- [x] Verificar a existência e o funcionamento real do motor de sincronização, do Heartbeat e de qualquer automação relacionada (cliente testado; zero jobs, zero logs e nenhuma integração de runtime ativa).
- [x] Produzir uma matriz requisito × evidência × lacuna × ação corretiva (`docs/reconstrucao_panorama_bc_matriz_lacunas_sequencia.md`).
- [x] Restaurar e testar o Motor de Dados do Panorama BC exclusivamente dentro do projeto original (cliente oficial: 7 testes; validação ao vivo: 125 métricas, 19 grupos e 125 valores em 202512).
- [x] Consolidar a arquitetura analítica e a organização real das 125 métricas oficiais do Banco Central (paridade exata: 125 métricas, 19 grupos, zero divergências).
- [x] Implementar e testar o backend analítico isolado, sem alterar infraestrutura ou lógica não relacionada do projeto principal (4 testes de integração com o Railway real).
- [x] Implementar e testar a primeira experiência funcional de `Mercado em Números` no padrão visual já existente do site.
- [x] Executar testes unitários, integração, build, inspeção de logs e validação visual com dados reais (18/18 testes Panorama; build aprovado; 5 falhas legadas não relacionadas na suíte global).
- [x] Produzir preview interno e relatório de evidências antes de qualquer commit (`docs/reconstrucao_panorama_bc_preview_visual.md`).
- [x] Solicitar autorização explícita do usuário antes de qualquer commit, push, deploy, exclusão ou alteração de infraestrutura (solicitação apresentada no relatório final; nenhuma autorização presumida).

> Regra permanente desta reconstrução: nenhum commit, push, deploy, exclusão ou alteração de infraestrutura sem autorização explícita do usuário.

### Reconstrução executável do Data Lab — Sprint 01

- [x] Declarar `panorama_metadata`, `panorama_metrics` e `panorama_sync_logs` em schema Drizzle isolado e somente leitura, sem gerar migração.
- [x] Criar utilitário determinístico de recortes 12 meses, 5 anos, 10 anos, histórico completo e intervalo personalizado (7 testes unitários).
- [x] Criar repositório de leitura do catálogo e das séries históricas usando apenas consultas `select`.
- [x] Criar router público tRPC `panorama` com `listGroups`, `listMetrics` e `getMetricData`.
- [x] Registrar o namespace `panorama` no router principal sem alterar rotas não relacionadas.
- [x] Criar testes Vitest para recortes temporais, catálogo real e série histórica real (18 testes Panorama aprovados até esta etapa).
- [x] Consolidar o catálogo oficial em grupos reais preservando nomes, unidades e rastreabilidade do Banco Central (`docs/panorama_bc_catalogo_125_metricas.json` e `.csv`).
- [x] Criar página canônica `DataLab.tsx` com seletor agrupado, busca, períodos, gráfico de linha e tabela real.
- [x] Exibir claramente a granularidade anual disponível, a cobertura da série e a fonte Banco Central do Brasil.
- [x] Registrar a rota pública `/data-lab` e manter uma saída clara de volta ao Panorama BC.
- [x] Corrigir ou neutralizar protótipos duplicados do Data Lab sem exclusão destrutiva (nenhum protótipo concorrente persistia no repositório; foi criada uma única página canônica).
- [x] Validar estados de carregamento, erro, vazio e métrica sem observações (404 coberto em integração; período incompleto corrigido no preview; catálogo atual não contém métrica sem histórico).
- [x] Executar testes focados, suíte completa, verificação TypeScript e build, distinguindo falhas preexistentes (18/18 Panorama; 147/152 testes globais aprovados; 1 erro TypeScript legado; build aprovado).
- [x] Iniciar preview temporário do projeto original e validar desktop e smartphone com dados reais (captura móvel integral 390 × 3.589 px, sete faixas inspecionadas).
- [x] Consolidar relatório final de evidências e entrar em espera por autorização explícita antes de commit ou push (`docs/reconstrucao_panorama_bc_relatorio_final.md`).

### Ajustes editoriais do Data Lab — solicitação posterior

- [x] Substituir exclusivamente o texto de apoio do hero pela nova redação aprovada sobre dados conectados ao Banco Central.
- [x] Reorganizar os indicadores do hero em três blocos: 125 métricas oficiais, 10+ anos de histórico e 19 grupos de dados, preservando o padrão visual atual.
- [x] Reorganizar visualmente o seletor de métricas nas categorias e agrupamentos editoriais definidos pelo usuário, sem mudar o catálogo oficial nem os dados.
- [x] Manter Administradoras de Consórcio e Cotas Ativas por Estado como grupos separados no seletor.
- [x] Confirmar na documentação oficial do Banco Central a periodicidade publicada do Panorama de Consórcios e explicar o significado da série anual observada.
- [x] Preservar inalterados todos os demais elementos, filtros, gráfico, tabela, transparência e comportamento do Data Lab.
- [ ] Validar desktop e smartphone após os ajustes e fornecer novo preview temporário.

### Correção de estabilidade — preview Data Lab

- [x] Diagnosticar a origem do loop de recarga relatado no preview do Data Lab (limites personalizados alimentavam uma consulta adicional; corrigido e testado).
- [x] Corrigir a causa do loop sem alterar comportamento, dados ou elementos fora do escopo solicitado.
- [x] Validar o preview estabilizado em desktop e smartphone antes de fornecer novo link (produção compilada, sem observador de arquivos; captura móvel integral 390x4976px, 9 faixas inspecionadas).

### Regressão crítica — catálogo zerado e carregamento contínuo

- [x] Identificar por que os grupos editoriais deixaram de corresponder aos identificadores oficiais retornados pelo backend (IDs numéricos `1`–`19` haviam sido substituídos por slugs sintéticos).
- [x] Restaurar o carregamento das 125 métricas e a seleção inicial automática sem remover o novo texto nem o glossário.
- [x] Garantir que o estado de carregamento não seja exibido quando nenhuma métrica válida estiver selecionada.
- [x] Criar teste de regressão cobrindo 19 grupos oficiais, seleção inicial e entrada estável da consulta (15/15 testes focados aprovados; 125 métricas confirmadas no preview real).
- [x] Validar no preview público uma métrica real, sua série histórica e ausência de repetição de consultas (10 observações oficiais entre 2016 e 2025; duas inspeções consecutivas estáveis).

## Correção solicitada — indicadores de 2025 e unidades do Panorama

- [x] Atualizar os indicadores editoriais para `5,3 mi` cotas comercializadas em 2025, `12,8 mi` cotas ativas em dez./2025, `48,4%` de índice de exclusão geral em 2025 e `78,3%` de contemplações por lance em 2024.
- [x] Eliminar a abreviação `k` de todos os cards, gráficos, tooltips e tabelas do Panorama oficial.
- [x] Exibir valores inferiores a 10 mil como números absolutos em pt-BR, sem abreviação.
- [x] Para valores maiores, respeitar e identificar a unidade oficial de divulgação do Banco Central, sem conversões ambíguas.
- [x] Substituir o subtítulo técnico da série por uma apresentação clara da fonte e da unidade oficial, incluindo a natureza da grandeza, como `mil cotas`.
- [x] Substituir `Cobertura completa` por `Histórico disponível` e apresentar separadamente a periodicidade oficial do Banco Central.
- [x] Revisar também o selo `Histórico completo` para manter coerência terminológica com o novo rótulo.
- [x] Criar ou atualizar testes Vitest para indicadores, formatação de valores, unidade, histórico e periodicidade (15/15 testes focados aprovados; build aprovado; suíte global com 163 testes aprovados e 5 falhas legadas fora do Panorama).
- [ ] Validar no preview correto em desktop e smartphone antes de qualquer commit, push ou deploy.
- [ ] Não executar commit, push ou deploy sem aprovação expressa após a apresentação do preview.

## Atualização 2025 — hero e Capítulo 01 do Panorama editorial

- [x] Corrigir no hero `Contemplações por lance` para `77,8%` e competência `2025`.
- [x] Substituir a leitura direta do Capítulo 01 pelo texto de 2025 fornecido, sem alterar sua caixa, tipografia ou posição.
- [x] Atualizar os quatro KPIs do Capítulo 01 para `5,3 mi`, `12,8 mi`, `+132,46%` com `2,28 mi para 5,3 mi`, e `9 anos`.
- [x] Ampliar o título e a série do gráfico `Cotas comercializadas — total` para 2016–2025, incluindo a barra de 2025 com rótulo `5,32`.
- [x] Ampliar para 2025 as quatro séries do gráfico `Cotas comercializadas — por produto`, com Imóveis `1,39`, Veículos `1,92`, Motocicletas `1,44` e Outros bens e serviços `0,48`.
- [x] Confirmar com o usuário que os valores por produto são independentes e não devem ser forçados a somar o total anual de `5,32 mi`; manter todos exatamente como fornecidos.
- [x] Preservar integralmente layout, componentes, espaçamentos, estilos, interações e dados fora do escopo informado (novos pontos isolados no Capítulo 01; base histórica compartilhada não alterada).
- [x] Atualizar os testes Vitest para cobrir o hero, os KPIs e os pontos de 2025 das cinco séries (5/5 testes focados aprovados; build de produção aprovado).
- [ ] Validar as alterações no preview correto em desktop e smartphone.
- [ ] Não executar commit, push ou deploy sem aprovação expressa após o novo preview.

## Alteração isolada — gráfico de contemplações 2025

- [x] Alterar exclusivamente o subtítulo do gráfico para `% de contemplações por modalidade (2016–2025)`.
- [x] Incluir exclusivamente a coluna de 2025 com `77,8%` por lance e `22,2%` por sorteio, sem alterar outros capítulos ou dados.
- [x] Executar uma validação técnica focalizada e apresentar o preview sem commit, push ou deploy (build aprovado e duas alterações confirmadas no código).

## Texto aprovado — Capítulo 04 (Contemplações)

- [x] Manter o título `Quem contempla por sorteio é minoria. Quem paga lance, maioria.`.
- [x] Substituir exclusivamente o parágrafo abaixo do título pelo aviso: `Atenção: esta análise é baseada em todo o mercado de consórcio. A realidade de grande parte dos grupos não chega a 10% de contemplações por sorteio.`
- [x] Manter no destaque: `Em 2025, 77,8% das contemplações foram por lance. Apenas 22,2% ocorreram por sorteio. Quem planeja contar com a sorte para contemplar está apostando contra a probabilidade histórica.`
- [x] Validar a atualização textual no preview sem commit, push ou deploy (build aprovado; aviso e destaque de 2025 confirmados no código).

## Correção pendente consolidada — Capítulos 02 e 04

- [x] Atualizar no Capítulo 04 os cards para `77,8%` de contemplações por lance em 2025 e `22,2%` de contemplações por sorteio em 2025.
- [x] Acrescentar 2025 ao gráfico geral de exclusão do Capítulo 02 com `48,4%`.
- [x] Acrescentar 2025 ao gráfico por produto do Capítulo 02 com Imóveis `54,5%`, Automóveis `46,24%`, Motocicletas `48,22%` e Outros bens e serviços `41,89%`.
- [x] Atualizar no Capítulo 02 os quatro cards abaixo do gráfico para 2025: Imóveis `54,5% · 3,4 mi`; Automóveis `46,24% · 4,6 mi`; Motocicletas `48,22% · 3,0 mi`; Outros bens e serviços `41,89% · 1,0 mi`.
- [x] Atualizar no Capítulo 02 os KPIs e a leitura direta já informados: `48,4%`, `12,01 mi`, pico `50,7%` em 2017, imóveis `62,4%` e `9 anos`.
- [x] Validar o build e apresentar o preview sem commit, push ou deploy (3/3 testes aprovados; build aprovado).

## Ajustes pontuais — Capítulos 02, 04 e 05

- [x] Excluir do subtítulo do Capítulo 02 o texto `Acima de 40% é alto. O consórcio brasileiro opera nessa faixa há quase uma década.`
- [x] Atualizar no Capítulo 04 o KPI de contemplações totais para `1,88 mi` em `2025`.
- [x] Alterar no Capítulo 05 o título do gráfico para `(2016–2025)` e incluir a coluna de 2025 com financiamento imobiliário `12%`, Selic `15%` e consórcio vendido `5,3 mi`.
- [x] Validar o build e apresentar o preview sem commit, push ou deploy (build aprovado).
