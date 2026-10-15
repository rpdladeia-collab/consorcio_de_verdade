# Raio-X do Consórcio — validação de parcelas não lineares

**Projeto:** Consórcio de Verdade
**Rota:** `/simulador/estrutura-do-plano`
**Data:** 15/10/2026, horário de Brasília
**Base de revisão:** `694dddb94e3188e9818e97f3b4714b93381c72ce`, branch `main`
**Situação na conclusão desta etapa:** alterações locais, sem commit, push ou deploy. Após aprovação financeira posterior, as correções foram consolidadas em um commit local; **não houve push nem deploy.**

## 1. Conclusão executiva

O defeito de digitação foi reproduzido em Chromium real e corrigido. Valores brasileiros como **R$ 300,00, R$ 1.500,00 e R$ 3.194,44**, além de percentuais com vírgula, agora permanecem intactos durante a edição e são convertidos corretamente somente na submissão.

Também foram corrigidos a perda das faixas ao recarregar, a normalização silenciosa de períodos inválidos, a mistura de formulário novo com resultados anteriores e a divergência de base do lance entre KPI, diagnóstico e PDF.

Foram conferidos **quatro cronogramas completos de 180 meses**, as **seis abas em cada cenário**, as memórias e **quatro PDFs realmente baixados pela interface**. O motor foi comparado a um cálculo independente e à versão original. Os pagamentos e demais resultados econômicos originais foram preservados.

> **Limite importante:** a consistência técnica foi validada, mas a aba Eficiência da Taxa contém premissas financeiras antigas que não reproduzem o histórico real das faixas. Elas foram explicitadas, não substituídas silenciosamente. A aprovação das decisões descritas na seção 7 é necessária antes de declarar essa leitura histórica plenamente reconciliada com o cronograma.

Os defaults visuais antigos foram mantidos: a solicitação atual substitui a **referência de teste da Etapa 4**, não determina trocar os valores iniciais da interface.

## 2. Erros efetivamente reproduzidos

| Problema | Evidência anterior | Causa | Correção |
|---|---|---|---|
| Valores brasileiros alterados durante digitação | `300,00` aparecia como `030000`; `1.500,00` como `01.50000`; `3.194,44` como `03.19444` | `input type="number"` descarta a vírgula; `parseFloat` e fallback zero convertem cada tecla e reescrevem o valor controlado | Campo textual com teclado decimal; rascunho preservado; parser monetário explícito na submissão |
| Percentual incorreto | `50,5` aparecia como `0505` | Mesma conversão a cada tecla | Conversão explícita `50,5 → 50.5` na submissão |
| Campo não ficava vazio | Ao apagar, o zero voltava e era prefixado à próxima digitação | `parseFloat(...) || 0` | Vazio continua vazio; submissão sem valor mostra erro, sem transformá-lo em zero |
| Faixas sumiam ao recarregar | O modo `ranges` permanecia em `sessionStorage`, mas a lista voltava vazia | Formulário persistido e faixas em estado separado não persistido | Faixas passam a integrar o mesmo formulário persistido; cálculo inicial reutiliza a mesma montagem de parâmetros |
| Períodos alterados silenciosamente | Início/fim eram arredondados, limitados e invertidos implicitamente durante a montagem do payload | `Math.round`, `Math.max` e fallbacks ocultavam entrada inválida | Validação no cliente, API e motor; erro explícito para intervalo inválido, sem criar um período diferente |
| Resultados e PDF misturavam parâmetros | Carta, base, taxas e mês do formulário atual eram combinados com uma resposta anterior | Leitura direta de `form` na apresentação do lance e na exportação | Apresentação/PDF derivados do snapshot calculado; aviso de parâmetros alterados e bloqueio de PDF até recalcular |
| Força do lance divergente | Com carta corrigida R$ 321.000, lance R$ 90.000 e base categoria, KPI/PDF usavam 24,0%, diagnóstico 28,0%; base contratual selecionada requer 22,4% | KPI usava carta inicial; diagnóstico usava carta sem taxa; metadado `event.base` ignorava a base resolvida | Metadado recebe a base já calculada pelo motor; tela, diagnóstico e PDF compartilham a apresentação baseada nela |
| Precisão e abrangência do PDF | Carta/lance/saldo arredondados sem centavos e cronograma truncado em 30 meses | Formatação e recorte próprios do exportador | Centavos preservados; cronograma completo; seguro, primeira correção, política, faixas e avisos registrados |
| Valor pouco legível no celular | Campo muito estreito ocultava parte de `3.194,44` | Quatro campos e botão na mesma linha | Duas colunas em telas pequenas, com espaço adequado para valor e centavos |

A revisão independente também identificou e corrigiu a rejeição desnecessária de espaços externos colados nos meses, sem arredondar ou alterar o período.

## 3. Referência atualizada e cenários

| Parâmetro | Valor |
|---|---|
| Carta | R$ 300.000,00 |
| Prazo | 180 meses |
| Administração total | 25% |
| Fundo de reserva | 0% |
| Seguro mensal | 0,038% |
| Correção por evento | 7% |
| Periodicidade | Anual, a cada 12 meses |
| Primeira correção | Mês 13 |
| Política linear | Parcela cheia calculada pelo contrato |

Os demais parâmetros auxiliares foram mantidos conforme o motor atual: poupança estimada **0,515% a.m.** e CDB líquido estimado **0,795% a.m.** São premissas de simulação, não cotações de mercado.

| Cenário | Política usada |
|---|---|
| `linear` | Parcela cheia em todos os meses |
| `reduzida` | Valor total de R$ 300,00 nos meses 1–12; parcela cheia nos meses seguintes |
| `multiplas` | R$ 1.500,00 em 1–12; R$ 3.194,44 em 13–24; R$ 300,00 em 25–36; parcela cheia depois |
| `percentuais` | 50% dos componentes da cheia em 1–12; 75% em 13–24; seguro à parte; cheia depois |

Nos quatro cenários sem lance, o fundo de reserva pago é zero, há 14 correções nos meses **13, 25, …, 169**, a carta nominal termina em **R$ 773.560,25** e o saldo contratual termina zerado.

### Resultados sem lance

| Cenário | Parcela inicial | Parcela final | Total pago | Custo operacional | Saldo final |
|---|---:|---:|---:|---:|---:|
| linear | R$ 2.225,83 | R$ 5.373,99 | R$ 646.273,10 | R$ 143.692,66 | R$ 0,00 |
| reduzida | R$ 300,00 | R$ 5.728,76 | R$ 664.120,67 | R$ 148.166,42 | R$ 0,00 |
| multiplas | R$ 1.500,00 | R$ 5.936,95 | R$ 670.423,94 | R$ 149.746,45 | R$ 0,00 |
| percentuais | R$ 1.184,17 | R$ 5.667,15 | R$ 660.513,87 | R$ 147.262,55 | R$ 0,00 |

| Cenário | Fundo comum | Administração | Seguro | Poupança final | CDB líquido final |
|---|---:|---:|---:|---:|---:|
| linear | R$ 502.580,44 | R$ 125.645,11 | R$ 18.047,55 | R$ 991.530,61 | R$ 1.287.694,45 |
| reduzida | R$ 515.954,25 | R$ 128.988,56 | R$ 19.177,86 | R$ 996.157,42 | R$ 1.273.839,48 |
| multiplas | R$ 520.677,49 | R$ 130.169,37 | R$ 19.577,08 | R$ 997.463,81 | R$ 1.270.482,53 |
| percentuais | R$ 513.251,32 | R$ 128.312,83 | R$ 18.949,72 | R$ 995.168,07 | R$ 1.276.831,03 |

Custo operacional, nesses cenários quitados, corresponde a administração + reserva + seguro, sem fundo comum. Os resultados de investimentos usam exatamente as parcelas de cada cronograma como aportes no início de cada mês. O CDB já usa a premissa líquida: não foi adicionado um segundo imposto. Valores exibidos são arredondados para leitura; cálculos continuam em precisão numérica original.

**Atenção à faixa R$ 3.194,44:** o campo e o payload preservam esse valor, mas o motor existente limita a parcela à cheia quando o valor informado a excede. Neste cenário isso ocorre nos meses 13–24. Não é perda de centavos ou conversão incorreta: é a regra atual, agora sinalizada. Por exemplo, no mês 13 o pagamento é R$ 2.430,26, e não R$ 3.194,44.

## 4. Regras do motor efetivamente verificadas

| Tema | Comportamento atual preservado | Validação |
|---|---|---|
| Início/fim | Inclusivos; meses inteiros, `1 ≤ início ≤ fim ≤ prazo` | Casos válidos, invertidos, fracionários, vazios e fora do prazo |
| Lacunas | Parcela cheia = componentes do saldo corrigido / meses restantes, mais seguro | Retorno após faixa reduzida e intervalos sem faixa |
| Sobreposição | Prevalece a primeira faixa na ordem da lista | Exemplo 1–12 e 6–18; sete meses sobrepostos; aviso explícito |
| Valor monetário | Valor total mensal; preserva seguro e aplica o restante proporcionalmente a fundo comum/administração/reserva | Primeiro mês de R$ 300: seguro R$ 142,50 + fundo comum R$ 126,00 + administração R$ 31,50 |
| Percentual | Aplica percentual aos componentes da cheia, mantendo seguro integral | 50% produz R$ 1.184,17 no primeiro mês da referência |
| Acima da cheia | Limita a cheia; não cria antecipação extraordinária | R$ 3.194,44 e percentual 150%; aviso |
| Abaixo do seguro | Mantém seguro e não amortiza componentes | Faixa de R$ 100 frente a seguro R$ 142,50; aviso |
| Saldo não amortizado | Continua no saldo; ganha as próximas correções; lacunas recompõem pagamento no prazo restante | Conferência de todas as linhas |
| Correção periódica | Incide sobre carta e saldos remanescentes no começo do mês de evento | Mês 13 e demais eventos; comparação de componentes e saldo |
| Quitação/residual | Não apaga residual, não alonga prazo e não cria parcela de acerto automaticamente | Caso de 50% até mês 180 mantém residual positivo e aviso; projeção pós-lance também sinaliza residual |

Também foi verificado um cenário com fundo de reserva de 2%, para validar o rateio, sem alterar a referência solicitada de 0%.

## 5. Validação das seis abas e PDFs

Para conferir as abas de lance e eficiência sem ficarem vazias, cada um dos quatro cenários recebeu uma segunda simulação com **lance próprio R$ 45.000, FGTS R$ 15.000, embutido R$ 30.000, evento no mês 24, base categoria e estratégia abater parcela**. Os resultados comparativos sem lance da seção 3 permanecem separados dessa variante.

| Aba | Verificações realizadas | Resultado |
|---|---|---|
| 1. Dados da proposta | Payload, 180 linhas, fundo comum/taxa/reserva/seguro, parcela, saldos, memória e transições de faixa | Conferência numérica e tela aprovadas |
| 2. Custos da operação | Administração, correção da taxa, reserva, seguro, custo total; reconciliação com componentes pagos nos cenários quitados | Aprovada |
| 3. Histórico de correções | 14 eventos, totais anuais, carta, saldo, parcelas, gráfico e histórico expandido | Aprovada; pontos de mudança de política são preservados na amostragem do gráfico |
| 4. Consórcio × investimentos | Mesmo fluxo mensal, aportes, principal, acumulados de poupança/CDB e memória final | Aprovada |
| 5. Estrutura do lance | Mesmas faixas antes do evento, amortização após parcela, base categoria corrigida, carta líquida, parcela anterior/pós-lance | Aprovada; tela/diagnóstico/PDF compartilham o snapshot |
| 6. Eficiência da taxa | Fórmulas atualmente implementadas, atualização por cenário, KPIs e tabela de degradação | Reprodução técnica aprovada; **reconciliação histórica condicionada às decisões da seção 7** |

Na variante de lance, a carta no mês 24 é R$ 321.000, a base categoria é R$ 401.250 e a força do lance é **22,4%**. Primeiras parcelas pós-lance: linear R$ 1.872,70; reduzida R$ 2.039,50; múltiplas R$ 300,00; percentuais R$ 2.010,53.

Os quatro PDFs foram gerados pela própria interface e conferidos com extração de texto. Carta, carta líquida, lance aplicado, força, parcela anterior e posterior e última parcela conferem com a tela/snapshot. Os PDFs contêm as faixas, seguro, primeira correção, avisos e cronograma completo, em vez de apenas 30 meses. A paginação do PDF com múltiplas faixas foi inspecionada visualmente.

Alterar a carta de R$ 300.000 para R$ 350.000 sem recalcular não muda os KPIs antigos: aparece aviso de resultados anteriores e o botão PDF fica indisponível. Após recalcular, os resultados e a exportação voltam a refletir o novo snapshot.

## 6. Testes e reprodutibilidade

### Resultados

- **71 testes do alvo aprovados:** 12 testes originais do motor + 12 de layout + 47 regressões novas.
- **720 linhas mensais** comparadas com cálculo independente por saldo agregado e participações dos componentes; maior diferença absoluta observada: aproximadamente **R$ 0,00000000105**, muito abaixo de um centavo.
- **11 comparações `deepEqual`** contra o motor da base original: pagamentos, saldos, correções, custos, investimentos e indicadores econômicos preservados. Exceções deliberadas: campos novos de avisos e metadado corrigido `event.base` para a categoria.
- Navegador Chromium: seis abas nos quatro cenários, 180 linhas de memória por cenário, quatro PDFs, digitação tecla a tecla, colagem equivalente por preenchimento, edição com cursor no meio, apagar, percentual 50,5%, recarga e layout móvel de 390 px.
- Nenhum erro JavaScript de página nos quatro cenários finais.
- Inputs inválidos bloqueiam a requisição; não são silenciosamente convertidos em zero.
- `pnpm check`: TypeScript e proteção de mídias aprovados.
- `pnpm build`: aprovado; aviso existente de tamanho de bundle, sem alteração de dependências.
- `git diff --check`: aprovado.
- `package.json` e `pnpm-lock.yaml`: **sem alterações**; instalação utilizou o lockfile existente, sem atualização de versões.

### Suíte completa: falhas anteriores não ocultadas

Antes: **169 aprovados, 6 falhos, 4 ignorados**, além de dois arquivos de teste sem suíte. Depois: **216 aprovados, os mesmos 6 falhos e 4 ignorados**, com os mesmos dois arquivos sem suíte.

Falhas preexistentes: quatro expectativas de `financialAnalysis.test.ts`, uma expectativa de layout em `waitingAnalysisScreen.test.ts` e o teste de token ausente em `posthog.secret.test.ts`. Arquivos vazios de suíte: `simuladores-hero.test.ts` e `raio-x-panorama-ajustes.test.ts`. Esses outros módulos não foram alterados para fazer a suíte parecer integralmente aprovada.

### Comandos de reprodução

Executar na raiz da cópia local, com as dependências travadas já instaladas:

```bash
pnpm check
pnpm exec vitest run server/estruturaDoPlano.test.ts server/estruturaDoPlano.layout.test.ts server/estruturaDoPlano.nonLinear.test.ts
pnpm exec tsx scripts/validate-estrutura-nonlinear.ts artifacts/estrutura-nonlinear
pnpm build
```

O exportador grava JSON de entradas/resultados, CSV com cada linha mensal e `summary.json`. CSV: UTF-8 com BOM, separador `;`, valores numéricos de máquina com ponto decimal; não há arredondamento dos dados brutos.

O teste de navegador incluído nas evidências usa Playwright Python e Chromium, uma prévia local na porta 3000 e arquivos de cenário exportados. Sua pasta de saída está explícita no cabeçalho para adaptação em outra máquina. Todo tráfego externo foi bloqueado no navegador; não houve envio de simulações para produção nem acesso a registros de banco.

## 7. Decisões financeiras que não foram inventadas

### 7.1 Eficiência: média projetada ou histórico efetivamente pago?

**Atual:** `parcelas pagas = média de todas as parcelas projetadas × quantidade paga`. A carta usada na eficiência é a inicial, e não a carta atualizada do mês de contemplação. A quantidade de meses também tem suas limitações originais; o cenário de mês 0 mantém o evento no mês 1.

**Alternativa histórica:** somar as parcelas dos meses efetivamente transcorridos. Isso altera dinheiro novo e taxa efetiva, especialmente em faixas reduzidas. Também é preciso aprovar se a base de carta/taxa será inicial ou atualizada; não basta trocar uma soma e presumir o resto.

Exemplo com os lances de R$ 90.000 e mês 24, mantendo todas as outras bases atuais:

| Cenário | Pagas pela média vigente | Pagas no histórico até mês 24 | Taxa vigente | Taxa com apenas a troca pelo histórico, não aplicada |
|---|---:|---:|---:|---:|
| linear | R$ 86.169,75 | R$ 55.059,56 | 60,57% | 48,41% |
| reduzida | R$ 88.549,42 | R$ 33.876,82 | 61,75% | 42,58% |
| multiplas | R$ 89.389,86 | R$ 47.105,85 | 62,18% | 46,04% |
| percentuais | R$ 88.068,52 | R$ 37.048,47 | 61,51% | 43,36% |

**Consequência:** manter a média preserva o modelo, mas não permite chamar o valor de histórico efetivamente desembolsado. Usar o histórico reconcilia a parcela paga com a memória, porém modifica um indicador financeiro. Nenhuma troca foi aplicada. A interface agora explica a premissa.

### 7.2 Degradação: modelo próprio ou mesmo cronograma do plano?

**Atual:** a tabela de degradação usa uma parcela teórica de **taxa administrativa total / prazo**, não a parcela total do consórcio, e estabelece sua própria parcela 0. Esse cálculo é compartilhado com outro módulo, que não foi modificado.

**Alternativa:** um modelo de degradação ligado aos desembolsos reais, às faixas, aos lances e às correções do cronograma.

**Consequência:** as curvas e alertas mudam. A fórmula existente foi reproduzida e identificada como separada, não rotulada como uma auditoria das faixas. Requer decisão conceitual antes de alteração.

### 7.3 Percentual incide sobre componentes ou total com seguro?

**Atual:** aplica percentual sobre fundo comum + taxa + reserva; seguro integral à parte. No primeiro mês, 50% resulta em **R$ 1.184,17**.

**Alternativa:** 50% da parcela total, incluindo seguro, resultaria em **R$ 1.112,92**; também seria preciso definir como tratar a diferença de seguro.

**Consequência:** desembolso, amortização e saldo diferem. A regra atual foi mantida e descrita, sem reduzir seguro silenciosamente.

### 7.4 Faixa acima da cheia significa teto ou amortização extra?

**Atual:** limita à cheia. A entrada R$ 3.194,44 continua correta no formulário/payload, mas não autoriza pagamento extra.

**Alternativa:** amortizar o excedente, com uma regra aprovada de alocação e efeito sobre parcela/prazo.

**Consequência:** saldo, correções, total pago e prazo podem mudar. O excedente não foi convertido automaticamente em antecipação.

### 7.5 Valores fixos, sobreposições e residual

- **Valor em reais:** permanece nominal durante a faixa. Indexá-lo por correções periódicas mudaria pagamentos; não foi aplicado.
- **Sobreposição:** primeira faixa prevalece. Rejeitar sobreposições ou dar prioridade à última muda a política; manteve-se a precedência, com aviso.
- **Valor abaixo do seguro:** seguro é preservado. Rejeitar a faixa é outra interpretação possível; reduzir/subsidiar seguro demandaria regra contratual expressa.
- **Residual:** o prazo não é estendido e não surge acerto automático. Parcela final extraordinária, extensão de prazo ou manutenção de dívida são interpretações distintas; nenhuma foi escolhida. Em cenários não quitados, não se deve confundir obrigação projetada com componentes efetivamente pagos.
- **Pós-contemplação:** o motor existente continua atualizando a carta nominal na projeção. Congelar o crédito liberado após a contemplação versus mostrar uma carta de referência corrigida exige definição contratual; não foi alterado.

## 8. Arquivos locais alterados

| Arquivo | Finalidade |
|---|---|
| `client/src/pages/EstruturaDoPlano.tsx` | Drafts persistidos, submissão única, validação, avisos, snapshot, PDF consistente e campo móvel legível |
| `client/src/lib/estruturaDoPlanoForm.ts` | Parser de dinheiro/percentual e validação de períodos na submissão |
| `client/src/lib/estruturaDoPlanoLance.ts` | Apresentação e payload de PDF a partir do resultado calculado |
| `client/src/lib/pdfEstruturaDaLance.ts` | Premissas/faixas, avisos, precisão e cronograma completo |
| `server/lib/estruturaDoPlano.ts` | Validação de faixas, avisos e correção do metadado da base selecionada |
| `server/routers/estruturaDoPlano.ts` | Validação de intervalos na API e retorno de parâmetros normalizados |
| `server/estruturaDoPlano.nonLinear.test.ts` | 47 regressões novas |
| `server/test-fixtures/estruturaDoPlano.ts` | Cenários e cálculo independente |
| `scripts/validate-estrutura-nonlinear.ts` | Exportação reproduzível de dados e comparação numérica |
| `docs/media-manifest.json` | Somente atualização do número de linha da referência existente ao logo, exigida pelo verificador; nenhuma mídia mudou |
| `docs/VALIDACAO_RAIOX_NAO_LINEAR_ETAPA4.md` | Este relatório |
| `PROJECT_CONTEXT.md` | Registro adicional da correção local e das pendências |

Não foram modificados outros simuladores, banco, migrations, credenciais, domínio, ambiente Railway/Supabase ou versões de dependências.

## 9. Material de revisão e próximo passo

O pacote de evidências contém os quatro JSONs completos, quatro CSVs de 180 meses, quatro PDFs de lance, capturas antes/depois, registros de testes, teste de navegador e um patch de revisão das alterações do alvo.

**Nota histórica:** ao concluir esta etapa, ainda se aguardava aprovação das interpretações financeiras, sobretudo o uso do histórico real e a degradação. Essa aprovação e a instrução para preparar a publicação chegaram depois; as correções aprovadas foram consolidadas localmente, sem push ou deploy.
