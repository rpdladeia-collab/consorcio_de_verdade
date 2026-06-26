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
- [ ] Validação responsiva mobile (testar em viewport 375px)
- [ ] Checkpoint final antes de publicar

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
- [ ] Layout global: overflow-x-hidden no body, viewport meta correto, html/body sem scroll horizontal
- [ ] Containers: w-full, max-w-full, px-4/px-6 no mobile em todas as páginas
- [ ] Tabelas: todas dentro de `<div className="w-full overflow-x-auto pb-4">` (Raio-X, Zona, Panorama)
- [ ] Gráficos Canvas: 100% largura disponível, overflow-x-auto quando necessário
- [ ] Grids 4 colunas → grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- [ ] Grids 2 colunas → grid-cols-1 lg:grid-cols-2
- [ ] Inputs: empilhar no mobile (grid-cols-1 md:grid-cols-2), largura total, min-h-[44px]
- [ ] Header mobile: logo esquerda, hambúrguer direita, 100vw, sem deslocamento
- [ ] Hero: 100% largura, texto centralizado, botões empilhados, sem overflow
- [ ] Validação visual 390px, 430px e 768px (Home, Panorama, Raio-X, Zona de Contemplação)
- [ ] Checkpoint final responsividade
