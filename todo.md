# Consórcio de Verdade — TODO (estado real)

## Infraestrutura e Design System
- [x] Paleta de cores, tipografia, tokens CSS (index.css)
- [x] brand.ts centralizado (WhatsApp, LinkedIn, logomarca)
- [x] Header com navegação (Home, Raio-X do Consórcio, Panorama: Dados Oficiais, Sobre)
- [x] Footer completo
- [x] Componentes reutilizáveis: SimuladorUI.tsx, RaioXLayout.tsx
- [x] TransparencyBlock com texto exato aprovado
- [x] Diretriz de linguagem neutra registrada

## Raio-X do Consórcio — 6 Módulos
- [x] Módulo 1: Simule seu plano — backend (buildSchedule, EPS=0.01), procedure raiox.simulePlano, página, PDF, testes
- [x] Módulo 2: Contemplação — backend (runContemplation + buildContemplationProjection), procedure raiox.contemplacao, página, PDF, testes
- [x] Módulo 3: Custo da Operação — backend (runOperationCost), procedure raiox.custoOperacao, página, PDF, testes
- [x] Módulo 4: Proporção da Taxa — backend (runEfficiency), procedure raiox.proporcaoTaxa, página, PDF, testes
- [x] Módulo 5: Histórico de Correções — backend (runCorrections), procedure raiox.historicoCorrecoes, página, PDF, testes
- [x] Módulo 6: Auto Pagável? — backend (runAutoPayable), procedure raiox.autoPagavel, página, PDF, testes
- [x] Catálogo simuladores.ts com 6 módulos do HTML original
- [x] Todas as rotas registradas no App.tsx
- [x] Prazo máximo 240 meses em todos os schemas Zod e validações

## Panorama: Dados Oficiais (BCB)
- [x] panoramaData.ts com constantes exatas do HTML original
- [x] Componentes SVG (BarChart, LineChart, GroupedBarChart) fiéis ao HTML
- [x] Página /panorama com todas as seções (Hero, Vendas, Exclusão, Reclamações, Macro, Base)
- [x] Link no menu Header (desktop e mobile)

## PDFs
- [x] Padrão aprovado: logo 14x14 canto superior direito, rodapé obrigatório (domínio, data/hora, Motor v1.0, ID hash)
- [x] PDF Módulo 1 (pdfSimulePlano.ts)
- [x] PDF Módulo 2 (pdfContemplacao.ts)
- [x] PDF Módulo 3 (pdfCustoOperacao.ts)
- [x] PDF Módulo 4 (pdfProporcaoTaxa.ts)
- [x] PDF Módulo 5 (pdfHistoricoCorrecoes.ts)
- [x] PDF Módulo 6 (pdfAutoPagavel.ts)

## Testes Vitest
- [x] server/raiox.test.ts (12 testes — golden test + seguro)
- [x] server/contemplacao.test.ts (13 testes)
- [x] server/modulos3a6.test.ts (28 testes)
- [x] server/auth.logout.test.ts (1 teste)
- [x] Total: 54/54 testes passando

## Páginas Institucionais
- [x] Sobre — página "em construção" limpa
- [ ] Contato — conteúdo real (canais, formulário)
- [ ] Termos de Uso — conteúdo real
- [ ] Privacidade — conteúdo real

## Pendências abertas
- [x] Validação responsiva mobile (testar em viewport 375px)
- [x] Checkpoint final antes de publicar

## Zona de Contemplação 2026 (novo simulador)
- [x] server/lib/zonaContemplacao2026.ts — runZonaHistorico + runZonaQuantitativo (fiel ao HTML)
- [x] server/routers/zonaContemplacao.ts — procedures calcHistorico + calcQuantitativo
- [x] server/routers.ts — registrar zonaContemplacaoRouter
- [x] server/zonaContemplacao.test.ts — testes golden (cenário padrão do HTML)
- [x] client/src/pages/ZonaContemplacao.tsx — 3 abas, Canvas, layout 100% fiel ao HTML original
- [x] client/src/lib/pdfZonaContemplacao.ts — PDF padrão aprovado (logo 14x14, rodapé jurídico)
- [x] client/src/components/Header.tsx — item "Zona de Contemplação" após "Raio-X do Consórcio"
- [x] client/src/App.tsx — rota /zona-contemplacao
- [x] Validação visual (screenshot) e testes passando
- [x] Checkpoint salvo

## Proporção da Taxa — Degradação Progressiva de Eficiência
- [x] server/lib/proporcaoTaxa.ts — adicionar função calcDegradacaoProgressiva (tabela por parcela)
- [x] server/routers/raiox.ts — expor dados de degradação no resultado da procedure (totalParcelas opcional)
- [x] server/modulos3a6.test.ts — testes golden para degradação progressiva (16 novos testes)
- [x] client/src/pages/SimuladorProporcaoTaxa.tsx — tabela progressiva (parcelas 0,5,10...N)
- [x] client/src/pages/SimuladorProporcaoTaxa.tsx — gráfico Canvas de degradação (linha descendente)
- [x] client/src/pages/SimuladorProporcaoTaxa.tsx — alertas 3 níveis (atenção/alerta/crítico)
- [x] client/src/pages/SimuladorProporcaoTaxa.tsx — relatório final "Cenário Sem Contemplação"

## Sprint Responsividade Mobile
- [x] Layout global: overflow-x-hidden no body, viewport meta correto, html/body sem scroll horizontal
- [x] Containers: w-full, max-w-full, px-4/px-6 no mobile em todas as páginas
- [x] Tabelas: todas dentro de overflow-x-auto (Raio-X, Zona, Panorama)
- [x] Gráficos Canvas: 100% largura disponível, overflow-x-auto quando necessário
- [x] Grids 4 colunas → grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- [x] Grids 2 colunas → grid-cols-1 lg:grid-cols-2
- [x] Inputs: empilhar no mobile (grid-cols-1 md:grid-cols-2), largura total, min-h-[44px]
- [x] Header mobile: logo esquerda, hambúrguer direita, 100vw, sem deslocamento
- [x] Hero: 100% largura, texto centralizado, botões empilhados, sem overflow
- [x] Validação visual 390px, 430px e 768px (Home, Panorama, Raio-X, Zona de Contemplação)
- [x] Checkpoint final responsividade

## Sprint Correção de Posicionamento de Marca + Reestruturação da Home

### Header
- [x] Remover botão "Falar com especialista" do Header (canto superior direito)
- [x] Remover ícone LinkedIn do Header
- [x] Manter apenas Instagram em destaque no canto direito

### Hero Section
- [x] Trocar badge "Independente · sem venda de consórcio" → "Entenda antes de decidir"
- [x] Substituir subtítulo exatamente pelo texto aprovado (mercado bate recordes / 50% não atingem objetivo / plataforma para decisão consciente)
- [x] Corrigir contraste do disclaimer abaixo dos botões (text-gray-600 ou equivalente)

### Copywriting — Bloco Preto e Bloco Laranja
- [x] Bloco Preto: remover frase "não vendemos consórcio", substituir por posicionamento de venda consultiva
- [x] Bloco Laranja (CTA final): remover "Sem venda, sem comissão", substituir por convite à segunda opinião

### Formulário de Contato (nova seção acima do Footer)
- [x] Criar seção de contato com campos: Nome, WhatsApp/E-mail, Assunto (Select), Mensagem
- [x] Botão "Enviar mensagem"
- [x] Estilo editorial, sem alterar design system

### Reestruturação da Home (Anexo)
- [x] Remover blocos: "O setor em números", dados ABAC, bloco recordes, blocos genéricos não vinculados ao menu
- [x] Trocar título da seção de simuladores: "O que você quer descobrir?" → "Se você não entende estes pontos, não contrate ainda."
- [x] Adicionar subtítulo da seção de simuladores (texto aprovado no anexo)
- [x] Garantir que clique nos cards dos simuladores abre o módulo no topo da página
- [x] Criar bloco Raio-X do Consórcio (resumo + botão "Abrir Raio-X do Consórcio")
- [x] Criar bloco Zona de Contemplação (resumo + botão "Abrir Zona de Contemplação")
- [x] Criar bloco Panorama: Dados Oficiais (resumo + botão "Ver dados oficiais")
- [x] Criar bloco Sobre (resumo + botão "Conhecer o projeto")
- [x] Remover qualquer frase "sem venda de consórcio" e substituir por posicionamento correto

## Bug Crítico Mobile — Overflow/Scroll Tabelas e Gráficos
- [x] Remover overflow-hidden de containers intermediários (cards, seções) — manter apenas no body/html global
- [x] Tabelas Raio-X: wrapper w-full overflow-x-auto + min-w-[700px] na tag table + whitespace-nowrap nas células
- [x] Tabelas Zona de Contemplação: wrapper w-full overflow-x-auto + min-w-[480px] histórico, min-w-[900px] quantitativo
- [x] Tabelas Panorama: wrapper w-full overflow-x-auto + min-w-[700px]
- [x] Gráficos Canvas Raio-X: wrapper w-full overflow-x-auto + min-w-[600px] no container do canvas
- [x] Gráficos Canvas Zona de Contemplação: wrapper w-full overflow-x-auto + min-w-[700px]
- [x] Gráficos SVG Panorama: wrapper w-full overflow-x-auto + min-w-[600px]

## Sprint UI/UX — Página Central Raio-X (/raio-x)
- [x] Fundo escuro bg-[#111] na página inteira
- [x] Título branco bold grande: "Se você não entende estes pontos, não contrate ainda."
- [x] Subtítulo cinza/muted com texto aprovado
- [x] Grid 3 colunas desktop / 1 coluna mobile: grid grid-cols-1 lg:grid-cols-3 gap-6
- [x] Cards com bg-[#1c1b15], border border-white/10, rounded-xl, hover:border-orange-500
- [x] 6 cards com label MÓDULO N (laranja, uppercase, mono), título branco, texto cinza
- [x] Links diretos para cada simulador (/simulador/slug)

## Sprint Refinamento — Zona de Contemplação
- [ ] Hierarquia invertida: percentual do lance pretendido em destaque absoluto primeiro, termômetro/zona abaixo (pendente)
- [x] Gráfico mobile: wrapper w-full overflow-x-auto + min-w-[700px] no canvas
- [x] Ícones ?: remover fundo laranja sólido, manter apenas text-orange-500 sem background
- [x] Placeholder: "Grupo XYZ" (corrigido)
- [ ] PDF: melhoria de qualidade do gráfico (canvas já usa toDataURL direto, sem html2canvas)

## Sprint Crítica — Erro 404 + UX/UI + Página Sobre
- [x] Corrigir erro 404: Custo da Operação, Proporção da Taxa, Histórico de Correções
- [x] Verificar e corrigir links (href) no grid da página central Raio-X
- [x] Remover bloco "Fontes e Metodologia" de TODOS os simuladores
- [x] Remover frase "Não vendemos consórcio..." do bloco Transparência em TODOS os simuladores
- [x] Substituir badge "Análise independente" por "Raio-X do Consórcio" em todos os simuladores
- [x] Adicionar marca-texto amarelo no label "Módulo N" em todos os simuladores
- [x] Adicionar botão "← Voltar para o Raio-X" no topo esquerdo de todos os simuladores
- [x] Colocar "O que isso significa" em Accordion fechado por padrão em todos os simuladores
- [x] Colocar "Memória de Cálculo" em Accordion fechado por padrão em todos os simuladores
- [x] Módulo 1: ícone de link ao lado de "Correção anual (%)" → https://www.melhorcambio.com/incc
- [x] Módulo 2: tooltip (?) em "Base do Lance" explicando cálculo sobre carta vs categoria
- [x] Módulo 2: tooltip (?) em "FGTS" com alerta sobre regras variáveis por administradora
- [x] Upload do vídeo WhatsApp para storage e criar página /sobre minimalista
- [x] Página /sobre: fundo preto, vídeo sem logomarca, nome Renato Ladeia, cargo, ícone LinkedIn
