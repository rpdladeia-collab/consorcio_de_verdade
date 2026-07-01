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

## Estado Global — Integração de Módulos (Zustand)

- [x] Instalar zustand com middleware persist
- [x] Criar store global client/src/stores/simuladorStore.ts (campos: credit, term, adminRate, reserveRate, insuranceRate, adjRate, adjEvery, mode, ranges, hasData)
- [x] Módulo 1: salvar parâmetros no store ao clicar em Calcular
- [x] Módulo 2: toggle "Importar dados do Módulo 1", preenchimento automático de credit, term, adminRate
- [x] Módulo 3: toggle + preenchimento automático de credit, term, adminRate
- [x] Módulo 4: toggle + preenchimento automático de credit, term, adminRate
- [x] Módulo 5: toggle + preenchimento automático de credit, term, adminRate
- [x] Módulo 6: toggle + preenchimento automático de credit, term
- [x] Validação visual: toggle ligado por padrão quando há dados, desligar limpa campos
- [x] Checkpoint final estado global

## Sprint Logomarca + PDF

- [x] Upload das duas logos (fundo preto e fundo branco) para storage webdev
- [x] Header: logo escura (fundo preto) na versão dark, logo clara (fundo branco) na versão light
- [x] Hero de todos os simuladores: logo no canto superior direito (versão fundo transparente/escuro)
- [x] PDFs: atualizar logo do cabeçalho para nova versão
- [x] PDF: remover bloco "Fontes e metodologia" e corrigir texto de transparência (sem "Não vendemos consórcio")
- [x] Checkpoint final logomarca

## Sprint Home + Logo Transparente

- [x] Logo: processar para fundo transparente (versão light — letras brancas; versão dark — letras escuras)
- [x] Logo: integrar versão dark-transparent no Header (fundo claro)
- [x] Logo: integrar versão light-transparent no RaioXLayout hero (fundo escuro)
- [x] Logo: atualizar todos os 7 PDFs com versão dark-transparent
- [x] Home Hero: badge "Consórcio não é para todo mundo" alinhado à esquerda
- [x] Home Hero: texto "NÃO consegue adquirir o bem desejado"
- [x] Home Hero: botões e disclaimer alinhados à esquerda (sem centralização)
- [x] Home seção escura: eyebrow "RAIO X DO CONSÓRCIO"
- [x] Home seção escura: novo parágrafo com ALGUNS módulos ESSENCIAIS e E MUITO MAIS
- [x] Home: remover seção branca (BLOCO RAIO-X DO CONSÓRCIO com título "Seis módulos...")
- [x] Checkpoint final sprint Home + Logo

## Sprint Melhorias UI — Logos + Home + Raio-X

- [x] Logo: reprocessar ambas as versões PNG com texto "Consórcio de verdade." 30% maior
- [x] Logo: fazer upload das novas versões e atualizar brand.ts
- [x] Home: fundo branco na seção Zona de Contemplação (bg-white em vez de bg-[var(--graphite)])
- [x] Home seção escura: trocar "ALGUNS módulos ESSENCIAIS" por "todos os módulos essenciais"
- [x] Módulo 1: renomear "Simule seu plano" → "Raio-X da Parcela" (card Home, card /raio-x, hero do simulador)
- [x] Todos os simuladores: remover "· RAIO-X DO CONSÓRCIO" ao lado de "MÓDULO N" no hero
- [x] Módulo 1: atualizar texto do hero para o novo copy aprovado

## Sprint Simuladores — Renomeação + Acordeões + Zona + Sobre

- [x] Módulo 2: renomear "Contemplação" → "Raio-X do Lance" + novo texto hero
- [x] Módulo 3: renomear para "Raio-X do Custo Total"
- [x] Módulo 4: renomear para "Raio-X da Eficiência da Taxa de Administração" + novo texto hero
- [x] Módulo 5: renomear para "Raio-X das Correções" + novo texto hero
- [x] Acordeões "O que significa": reformatar em todos os simuladores (fundo preto, título temático em amarelo, fonte menor)
- [x] Módulo 2 acordeão: título "Lance Embutido" + novo texto explicativo
- [x] PDFs: logo presente em todos os PDFs (brand.ts centralizado)
- [x] Zona de Contemplação: fundo padrão Raio-X (bg-[var(--paper)])
- [x] Zona de Contemplação: remover campos "Tendência" e "Pressão Competitiva"
- [x] Seção Sobre: vídeo em loop 4:5 lado esquerdo, texto lado direito, autoplay sem controles de download

## Sprint Zona de Contemplação — Refatoração Nativa

- [x] Destruir versão anterior com iframe/dangerouslySetInnerHTML
- [x] Reescrever SimuladorZonaContemplacao.tsx do zero em React nativo + tRPC
- [x] 3 abas nativas: Histórico de Contemplações, Quantitativo, Leitura Técnica
- [x] Gráfico Recharts nativo (LineChart) com scroll horizontal no mobile
- [x] Termômetro do lance (pin animado) nativo em React
- [x] Tabela de histórico editável com add/remove de linhas
- [x] Tabela quantitativa com seleção de linhas (clique para incluir/excluir)
- [x] Dados de exemplo pré-carregados (grupo XYZ)
- [x] PDF com logo + bloco de transparência (gerarPdfZonaContemplacao)
- [x] 105/105 testes passando · 0 erros TypeScript

## Sprint Panorama Dados Oficiais — Refatoração Nativa

- [x] Panorama: criar client/src/lib/panoramaData.ts com todos os dados tipados
- [x] Panorama: reescrever página nativa com 4 submenus em scroll infinito (sticky nav)
- [x] Panorama: Recharts responsivo em todos os gráficos (ResponsiveContainer + overflow-x-auto)
- [x] Panorama: 4 submenus — Vendas · Índice de Exclusão · Reclamações · Sorte
- [x] Panorama: design system (--paper, --ink, --orange) sem cores hardcoded do HTML original

## Sprint Home + Sobre — Texto e Identidade

- [x] Home Hero: trocar texto abaixo do título pelo novo copy aprovado (Eu construí esta plataforma...)
- [x] Home: trocar botão "Acessar simuladores" → "Usar simuladores gratuitamente"
- [x] Home: trocar botão "Falar com especialista" → "Pedir análise individual"
- [x] Sobre: trocar item de menu "Sobre" → "r.enatto" (grafia da logomarca)
- [x] Sobre: substituir todo o conteúdo pelo novo (Renato Ladeia, cargo, texto, botão "Pedir análise individual")
- [x] Sobre: ícone LinkedIn na cor laranja (bg-[var(--orange)])
- [x] Sobre: corrigir espaço vazio (removido min-h-screen, fundo bg-[var(--ink)] sem padding extra)

## Sprint Panorama — Reestruturação Editorial Completa

- [x] Hero: corrigir texto "É o dado oficial." → "São os dados oficiais."
- [x] Resumo executivo: 5 cards-âncora clicáveis (Leitura rápida) antes dos capítulos
- [x] Sticky nav: atualizar labels para os 5 capítulos novos
- [x] Capítulo 01: Mercado de consórcios (ex-Vendas) — rótulos fixos nos gráficos, botão PDF
- [x] Capítulo 02: Exclusões e permanência (ex-Índice de Exclusão) — rótulos fixos, botão PDF
- [x] Capítulo 03: Reclamações e atendimento — rótulos fixos, botão PDF
- [x] Capítulo 04: Contemplações: lance e sorteio (ex-Sorte) — rótulos fixos, botão PDF
- [x] Capítulo 05: Consórcio em diferentes cenários econômicos (novo bloco macro separado) — botão PDF
- [x] Base de dados: tabela colapsável com botão "Ver base de dados completa" / "Recolher"
- [x] Fontes: observação "O Consórcio de Verdade não tem a ABAC como fonte" em destaque laranja
- [x] Fontes: remover referência à ABAC do texto de metodologia
- [x] pdfPanorama.ts: gerador de PDFs por bloco (6 blocos + PDF completo)
- [x] 0 erros TypeScript · 105/105 testes passando

## Sprint Preparação para Produção — Go Live

- [x] SEO: title "Consórcio de Verdade | Análise Independente" no index.html
- [x] SEO: description atualizada conforme especificação
- [x] Open Graph completo (og:title, og:description, og:url, og:image, og:locale) para WhatsApp/LinkedIn
- [x] Twitter Card configurado
- [x] Favicon SVG gerado com ícone r. laranja (fundo preto, ponto laranja)
- [x] Favicon PNG 32x32, 16x16 e apple-touch-icon 180x180 gerados
- [x] console.log de desenvolvimento removido (ComponentShowcase.tsx)
- [x] TypeScript: 0 erros (npx tsc --noEmit)
- [x] Build: ✓ built in 9.90s, 0 erros
- [ ] Termos de Uso — conteúdo jurídico real (pendente do cliente)
- [ ] Privacidade — política real (pendente do cliente)
- [ ] og-image.png (1200x630) — imagem de compartilhamento para WhatsApp/LinkedIn (pendente)

## Sprint Logos Reais — Correção Final

- [x] Diagnosticar problema: logos aparecendo como quadrados escuros minúsculos (997 bytes, 120×80px)
- [x] Processar logo para fundo claro (Header): texto escuro, fundo transparente — 418×300px
- [x] Processar logo para fundo escuro (Footer): texto branco, fundo transparente — 888×300px
- [x] Processar logo para PDF: fundo branco, texto escuro — 167×120px
- [x] Upload das 3 novas logos para CDN Manus
- [x] Atualizar brand.ts com novas URLs (logo-for-light-bg-v2, logo-for-dark-bg-v2, logo-pdf-v2)
- [x] Atualizar 7 PDFs com nova URL da logo
- [x] Aumentar altura das logos: Header h-9 md:h-10, Footer h-10
- [x] 105/105 testes passando · 0 erros TypeScript

## Sprint Correções Pontuais Home — Prompt Fechado

- [x] Correção 1: Melhorar legibilidade da logo no header (aumentar tamanho, frase "Consórcio de verdade" visível)
- [x] Correção 2: Remover arte/bloco "O que você precisa analisar" do hero (manter resto intacto)
- [x] Correção 3: Remover frase "A maioria dos problemas começa..." da seção "Por que simular antes de contratar"
- [x] Correção 4: Corrigir links 404 do Raio-X do Consórcio (todos os cards e botão)
- [x] Correção 5: Corrigir link 404 do botão "Testar meu lance" (Zona de Contemplação)
- [x] Correção 6a: Padronizar nome "r.enatto" na seção final (minúsculas, padrão marca, quadrado laranja)
- [x] Correção 6b: Limpar box direita seção r.enatto (apenas "Renato Ladeia" + "Consultor de Investimentos Independente · CVM · CEA")


## Sprint Responsividade Mobile e Logomarcas (Prompt 3)

- [ ] Correção 1: Responsividade das Tabelas (overflow-x-auto em mobile)
- [ ] Correção 2: Responsividade dos Formulários (flex-col em mobile)
- [ ] Correção 3: Remover fundos sólidos das logomarcas (usar apenas transparente)
- [ ] Correção 4: Deploy e validação em produção


## SPRINT: CORREÇÕES PONTUAIS (PROMPT FECHADO - SEM IMPROVISO)

- [x] 1. Auditoria Global de Logomarcas: verificar Header, Footer, Home, Raio-X, Zona, Panorama, r.enatto, Simuladores, PDFs, Modais, Mobile, Desktop
- [x] 2. Remover "A CONTA ANTES DO CONTRATO" da Home
- [x] 3. Corrigir posicionamento do ícone INCC (ao lado da palavra, não do campo)
- [x] 4. Padronizar PDFs: cabeçalho discreto com 2 linhas finas + logo transparente branca
- [x] 5. Deletar simulador "Lance embutido: vale a pena no seu caso?" (rota, card, link, página)
- [x] 6. Sincronizar Home Simuladores com Raio-X (mesmos nomes, ordem, quantidade, links)


## CORREÇÕES URGENTES (PÓS CHECKPOINT)

- [x] 1. Restaurar simulador "Raio-X do Lance" (Contemplação) — foi deletado por engano
- [x] 2. Corrigir logomarcas preto com fundo preto — verificadas, todas corretas
- [x] 3. Verificar vídeo na seção final — funcionando corretamente em /sobre
- [x] 4. Garantir rolagem horizontal em tabelas/gráficos do Raio-X — já configuradas
- [x] 5. Validação final e deploy


## 9 ALTERAÇÕES OBRIGATÓRIAS (ANEXO)

- [x] 1. Correção na geração do PDF (Backend/Lógica do Relatório) — Strings com caracteres quebrados
- [x] 2. Hook no Hero Section (Destaque da primeira frase) — "Parcela baixa vende fácil..."
- [x] 3. Textos explicativos dos Cards de Resultado — 4 cards com novos subtítulos
- [x] 4. Botão de Ação do Formulário — "Simular plano" → "Abrir análise"
- [x] 5. Título do Accordion/Seção — "FLUXO DE PARCELAS" → "ESTRUTURA DA PARCELA"
- [x] 6. Título da Tabela de Dados — "FLUXO MENSAL COMPLETO" → "Evolução das parcelas"
- [x] 7. Padronização Global de CTAs — Novo padrão duplo com texto de apoio
- [x] 8. Atualização do Favicon — Substituir por logo "r." com ponto laranja
- [x] 9. Reposicionamento do Ícone INCC — Mover para helper text


## 8 ALTERAÇÕES RAIO-X DO LANCE (NOVO PROMPT)

- [x] 1. Textos do Hero Section: Hook + Parágrafo
- [x] 2. Título do Accordion de Projeção Mensal: "Ver projeção mensal completa" → "Como ficam todas as parcelas?"
- [x] 3. Título do Accordion de Memória de Cálculo: "MEMÓRIA DE CÁLCULO" → "Como chegamos nesse numero?"
- [x] 4. Subtítulo do Card "Força de Lance": "Base: carta" → "Base: carta atualizada"
- [x] 5. Subtítulo do Card "Parcela Pós-Lance": "1ª parcela projetada após o lance" → "1ª parcela aproximada após o lance"
- [x] 6. Criação do Card "Diagnóstico do Lance" (Novo Componente)
- [x] 7. Reversão do CTA na seção "Raio-X da Parcela"
- [x] 8. Inserção de Logomarca no Hero (Global para todos os simuladores)


## 9 ALTERAÇÕES RAIO-X DO CUSTO TOTAL (MÓDULO 3)

- [x] 1. PRIORIDADE 1: Correção do PDF - Avisos do Motor de Cálculo (truncamento)
- [x] 2. PRIORIDADE 2: Padronizar "Delta de correção acumulado" → "Correção do fundo comum"
- [x] 3. PRIORIDADE 2: Adicionar contraponto sobre risco de indexação
- [x] 4. PRIORIDADE 3: Arredondamento - Total Pago Nominal (discépancia de R$ 0,24)
- [x] 5. PRIORIDADE 4: Textos do Hero Section (novo hook e subtexto)
- [x] 6. PRIORIDADE 4: Título do Card de Custo ("Custo explícito total" → "Quanto custa contratar o crédito")
- [x] 7. PRIORIDADE 4: Títulos dos Blocos Pretos (4 blocos com novos títulos)
- [x] 8. PRIORIDADE 4: Nova Frase de Impacto antes da Tabela
- [x] 9. PRIORIDADE 4: Atualização do CTA Final

## 3 ALTERAÇÕES GLOBAIS DE LOGOMARCAS

- [x] 10. Alterar tamanho das logomarcas no Hero dos simuladores (mesmo tamanho da tela inicial)
- [x] 11. Substituir logomarca no Footer de todas as páginas (usar r.enatto branca)
- [x] 12. Remover informações de Renato da tela inicial ("Renato Ladeia / Consultor de Investimentos Independente · CVM · CEA")


## 4 CORREÇÕES CRÍTICAS (NOVO PROMPT)

- [x] 1. Remover texto de apoio quebrado do CTA (Global)
- [x] 2. Restaurar estrutura original do card CTA
- [x] 3. Aplicar textos corretos para Módulo 3 (Raio-X do Custo Total)
- [x] 4. Garantir CTAs dos Módulos 1 e 2 com botão simples
- [x] 5. Aumentar logomarca 60% no Hero (w-28 md:w-40)
- [x] 6. Corrigir títulos dos accordions (remover "CUSTO DA OPERAÇÃO" genérico)
- [x] 7. Melhorar tipografia dos textos de apoio (Hook + Descrição)
