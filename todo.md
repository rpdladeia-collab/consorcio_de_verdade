# Consórcio de Verdade — RECONSTRUÇÃO PREMIUM (Briefing Definitivo)

## Fase 1 — Design System Premium
- [x] Nova paleta: off-white quente, grafite, preto profundo, branco, laranja, cinza quente, verde sinalização
- [x] Alternância de seções claras/escuras (não 100% preto)
- [x] Tipografia: Inter (textos) + JetBrains Mono (dados/cálculos)
- [x] Tokens de cor no index.css (light base + utilitários dark)
- [x] Logomarca no Header e Footer (brand.ts centralizado); pendente nos simuladores e PDF
- [x] Componentes editoriais reutilizáveis (SimuladorUI.tsx)

## Fase 2 — Home com storytelling
- [ ] Header limpo (Simuladores, Dados, Materiais, Sobre, Consultoria, redes discretas)
- [ ] Hero: "Antes de contratar um consórcio, faça a conta." + 2 CTAs + microtexto
- [ ] Bloco "O que você quer descobrir?" como jornada (6 perguntas)
- [ ] Bloco de autoridade ("Consórcio não é sorte...")
- [ ] Bloco de números grandes com fonte e data
- [ ] Bloco de 4 simuladores em destaque
- [ ] Bloco comercial sutil ("Fazer sozinho ou validar estratégia?")
- [ ] Bloco Sobre resumido (fundador, foto, redes)
- [ ] Footer completo

## Fase 3 — Central de Simuladores (centro de investigação)
- [ ] Título "Escolha a pergunta que você quer responder."
- [ ] 4 grupos por dor (Analisar proposta / Entender lance / Vale a pena / Cancelar)
- [ ] Cards ricos: pergunta, descrição, complexidade, tempo, selo gratuito, indica relatório, botão

## Fase 4 — Lance Embutido (modelo)
- [ ] Hero "Lance embutido: parece ajuda, mas reduz seu crédito."
- [ ] Entrada simples (carta, % embutido, lance próprio opc., taxa adm, parcelas pagas opc.)
- [ ] Resultado: carta, crédito líquido, valor embutido, dinheiro novo efetivo, taxa s/ capital novo, diagnóstico
- [ ] Visual: barra carta x crédito líquido, termômetro eficiência, comparação sem/com embutido, gráfico crédito consumido
- [ ] Diagnóstico narrativo + pontos positivos/atenção
- [ ] Modo avançado (prazo, taxa, fundo, parcelas, lance próprio, FGTS, correção)
- [ ] Memória de cálculo preservada
- [ ] CTA comercial sutil pós-resultado

## Fase 5 — Páginas Institucionais
- [ ] Sobre (por que existe, o que entrega, quem está por trás, princípio, CTAs)
- [ ] Contato (título acolhedor, canais WhatsApp/Insta/LinkedIn/email, formulário com tipos de dúvida)
- [ ] Consultoria (página/CTA dedicada)

## Fase 6 — PDF de Auditoria + Vídeo
- [ ] PDF "Relatório de Auditoria Independente" (capa, resumo, dados, resultado, memória, metodologia, fontes, aviso, rodapé)
- [ ] Área de vídeo preparada nos simuladores

## Fase 7 — Demais Simuladores (backend + frontend)
- [x] Zona de Contemplação
- [ ] Lance Livre
- [ ] Lance Fixo
- [ ] Saúde do Grupo
- [ ] Exclusão
- [ ] Consórcio x Financiamento
- [ ] Consórcio x Investimentos
- [ ] Eficiência Econômica
- [ ] Raio-X da Proposta / Diagnóstico de Propostas

## Pendências adicionais (gaps)
- [ ] Logomarca visível nas páginas de simuladores
- [ ] Logomarca integrada ao layout do PDF de Auditoria
- [x] Bloco de Transpariência e Metodologia (TransparencyBlock, texto exato aprovado)
- [x] PDF Módulo 1 com rodapé obrigatório (domínio, data/hora, Motor v1.0, ID hash SHA-256)
- [x] Diretriz de linguagem neutra registrada (sem opinião, sem recomendação)

## Fase 8 — Testes e Entrega
- [ ] Vitest backend simuladores
- [ ] Validação responsiva mobile/desktop
- [ ] Checkpoint e entrega

## Preservar (não destruir)
- [x] Backend / lógica matemática extraída (raio-x-logic.ts, zona-logic.ts)
- [x] tRPC router de simuladores
- [x] Testes Jest existentes
- [x] Repositório Git

## Sprint 2 — Ajustes globais + Módulo 2
- [x] Prazo máximo: alterar 360 → 240 em Zod, inputs, validações, funções, mensagens, testes
- [x] Marca: WhatsApp +5531996952204, LinkedIn https://www.linkedin.com/in/renatoladeia/
- [x] Navegação: menu "Raio-X do Consórcio" com item "Módulo 1: Simule seu plano"
- [x] PDF: logomarca oficial no canto superior direito do cabeçalho
- [x] Mapeamento técnico módulos 2–6 (HTML original)
- [x] Módulo 2: Contemplação — backend (runContemplation + buildContemplationProjection)
- [x] Módulo 2: Contemplação — procedure tRPC raiox.contemplacao
- [x] Módulo 2: Contemplação — testes Vitest
- [x] Módulo 2: Contemplação — página com inputs, KPIs, tabelas, TransparencyBlock, PDF

## Sprint Final — Módulos 3 a 6
- [ ] Módulo 3: backend server/lib/custoOperacao.ts (runOperationCost fiel ao HTML)
- [ ] Módulo 3: procedure tRPC raiox.custoOperacao
- [ ] Módulo 3: testes Vitest (cenário padrão)
- [ ] Módulo 3: página SimuladorCustoOperacao.tsx (RaioXLayout, tabela classificação, tabela fluxo)
- [ ] Módulo 3: PDF pdfCustoOperacao.ts (logo + rodapé jurídico)
- [ ] Módulo 4: backend server/lib/proporcaoTaxa.ts (runEfficiency fiel ao HTML)
- [ ] Módulo 4: procedure tRPC raiox.proporcaoTaxa
- [ ] Módulo 4: testes Vitest (cenário padrão)
- [ ] Módulo 4: página SimuladorProporcaoTaxa.tsx (RaioXLayout, barra de cores, tabela indicadores)
- [ ] Módulo 4: PDF pdfProporcaoTaxa.ts (logo + rodapé jurídico)
- [ ] Módulo 5: backend server/lib/historicoCorrecoes.ts (runCorrections fiel ao HTML)
- [ ] Módulo 5: procedure tRPC raiox.historicoCorrecoes
- [ ] Módulo 5: testes Vitest (cenário padrão)
- [ ] Módulo 5: página SimuladorHistoricoCorrecoes.tsx (RaioXLayout, tabela anual)
- [ ] Módulo 5: PDF pdfHistoricoCorrecoes.ts (logo + rodapé jurídico)
- [ ] Módulo 6: backend server/lib/autoPagavel.ts (runAutoPayable fiel ao HTML)
- [ ] Módulo 6: procedure tRPC raiox.autoPagavel
- [ ] Módulo 6: testes Vitest (cenário padrão)
- [ ] Módulo 6: página SimuladorAutoPagavel.tsx (RaioXLayout, tabela comparação patrimônio)
- [ ] Módulo 6: PDF pdfAutoPagavel.ts (logo + rodapé jurídico)
- [ ] Catálogo simuladores.ts: atualizar status módulos 3-6 para disponivel
- [ ] App.tsx: registrar rotas módulos 3-6
- [ ] Header: atualizar navegação com links para todos os 6 módulos
