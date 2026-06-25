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

## Fase 8 — Testes e Entrega
- [ ] Vitest backend simuladores
- [ ] Validação responsiva mobile/desktop
- [ ] Checkpoint e entrega

## Preservar (não destruir)
- [x] Backend / lógica matemática extraída (raio-x-logic.ts, zona-logic.ts)
- [x] tRPC router de simuladores
- [x] Testes Jest existentes
- [x] Repositório Git
