# Validação financeira — plano real do Raio-X

**Data:** 15/10/2026. **Estado:** correções validadas e consolidadas em commit local na branch `main`; sem push, deploy, migração ou escrita em banco de produção. **Motor avaliado:** `server/lib/estruturaDoPlano.ts`, chamado pela página Estrutura do Plano.

## Resultado executivo

O comportamento original de faixas fixas **não conseguia reproduzir este plano**: limitava à parcela cheia os valores nominais acima do limite linear e mantinha os valores informados fixos após correções. Isso deixava saldo residual de **R$ 314.057,87** ao fim da 160ª prestação. A primeira prestação, por exemplo, era limitada a R$ 2.630,78, em vez dos R$ 3.430,78 solicitados.

Implementei um modo explícito, opt-in, **“Recalcular saldo — preserva o perfil e quita no prazo”**. Ele mantém intacta a regra anterior para as demais simulações, reproduz os valores informados nas prestações 1–12, aplica cada correção ao saldo remanescente e recalibra proporcionalmente os componentes amortizáveis futuros. O seguro é calculado separadamente. O novo cenário fecha o saldo em zero na prestação 160.

O cronograma do motor e uma implementação matemática independente concordaram nas 160 prestações: diferença máxima absoluta de **R$ 0,0000000000582** (erro numérico de ponto flutuante). A interface local exibiu os mesmos valores em todas as 160 linhas e as seis abas foram verificadas.

## Parâmetros e convenções aplicadas

| Premissa | Valor usado |
|---|---:|
| Carta | R$ 320.000,00 |
| Prazo | 160 meses |
| Taxa administrativa | 24% (R$ 76.800,00 iniciais) |
| Fundo de reserva | 0% |
| Seguro | 0,038% ao mês |
| Correção | 7% anual, primeira no mês 13 |
| Perfil nominal | Meses 1–10: R$ 3.430,78; 11–159: R$ 2.577,34; 160: R$ 2.593,34 |
| Modo pós-correção | Recálculo do saldo, perfil não linear proporcional preservado |

Para manter a semântica já usada na tela, os valores de faixa em reais são **prestações totais de referência, com o seguro incluído**. O motor calcula o seguro sobre o saldo total FC + taxa administrativa + reserva existente no início da prestação; nesse cenário o saldo inicial é R$ 396.800,00. Cada correção é aplicada **antes** da prestação do mês indicado e incide nos componentes de saldo que o motor já corrigia (fundo comum e taxa administrativa; reserva é zero). Os cálculos internos preservam precisão completa; o arredondamento para centavos ocorre na exibição, não mês a mês.

Essas convenções descrevem o motor atual, não certificam o contrato da administradora. Se o seguro do contrato incidir sobre outra base, ou se o índice corrigir somente parte do saldo, o resultado contratual mudará.

## Regra implementada

1. As faixas informadas precisam ser monetárias, não sobrepostas, contíguas e cobrir o prazo inteiro; assim o sistema não inventa parcelas em lacunas.
2. Antes da primeira correção, as faixas são reproduzidas como prestação total; o seguro é separado para identificar o componente amortizável.
3. No mês de correção, o saldo devedor remanescente recebe 7%: `saldo_corrigido = saldo_antes × 1,07`.
4. O motor mantém o perfil remanescente de componentes amortizáveis e recalcula seu fator uniforme: `fator = saldo_corrigido ÷ soma dos componentes nominais ainda não pagos`. Aplica esse fator às faixas futuras, distribuindo o pagamento entre os saldos de fundo comum e taxa proporcionalmente. Soma o seguro mensal calculado à parte.
5. O fator permanece até a próxima correção anual. No evento seguinte, o saldo atualizado é recalculado contra o perfil ainda não pago; o processo se repete até o prazo.

Esse fator não é simplesmente 1,07. Na 13ª prestação, o saldo pós-correção é R$ 384.199,43 e o perfil nominal de componentes ainda não pagos soma R$ 371.538,34; portanto, o fator é **1,034077**. Aplicar 1,07 ao perfil nominal geraria cerca de R$ 13.346,60 de amortização a mais que o saldo corrigido. Nas correções seguintes, a razão dos novos fatores para os anteriores é exatamente 1,07, dentro da precisão do motor. Assim, o saldo é respeitado sem aplicar 7% cegamente sobre todas as parcelas.

## Prestações pedidas — resultados calculados

“Saldo antes” é o saldo devedor antes de eventual correção do mês. “Saldo após correção” é o saldo que entra na amortização da prestação. “Saldo final” é o remanescente depois do pagamento dos componentes (o seguro não amortiza saldo).

| Mês | Parcela nominal | Parcela calculada | Saldo antes | Correção | Saldo após correção | Fator do perfil | Saldo final | Evento |
|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | R$ 3.430,78 | **R$ 3.430,78** | R$ 396.800,00 | — | R$ 396.800,00 | 1,000000 | R$ 393.520,00 | Sem correção |
| 10 | R$ 3.430,78 | **R$ 3.430,78** | R$ 367.235,13 | — | R$ 367.235,13 | 1,000000 | R$ 363.943,90 | Sem correção |
| 11 | R$ 2.577,34 | **R$ 2.577,34** | R$ 363.943,90 | — | R$ 363.943,90 | 1,000000 | R$ 361.504,85 | Sem correção |
| 12 | R$ 2.577,34 | **R$ 2.577,34** | R$ 361.504,85 | — | R$ 361.504,85 | 1,000000 | R$ 359.064,89 | Sem correção |
| 13 | R$ 2.577,34 | **R$ 2.670,07** | R$ 359.064,89 | **R$ 25.134,54** | **R$ 384.199,43** | 1,034077 | R$ 381.675,35 | Correção de 7% + recálculo |
| 14 | R$ 2.577,34 | **R$ 2.670,07** | R$ 381.675,35 | — | R$ 381.675,35 | 1,034077 | R$ 379.150,32 | Fator da 13ª mantido |
| 24 | R$ 2.577,34 | **R$ 2.670,07** | R$ 356.381,79 | — | R$ 356.381,79 | 1,034077 | R$ 353.847,15 | Fator da 13ª mantido |
| 25 | R$ 2.577,34 | **R$ 2.856,98** | R$ 353.847,15 | **R$ 24.769,30** | **R$ 378.616,45** | 1,106463 | R$ 375.903,34 | Correção de 7% + recálculo |
| 159 | R$ 2.577,34 | **R$ 6.007,05** | R$ 12.042,21 | — | R$ 12.042,21 | 2,328941 | R$ 6.039,73 | Fator da 157ª mantido |
| 160 | R$ 2.593,34 | **R$ 6.042,03** | R$ 6.039,73 | — | R$ 6.039,73 | 2,328941 | **R$ 0,00** | Quitação do saldo; seguro somado |

Os valores após a 12ª mudam pela regra pedida; não são uma divergência de arredondamento. A prestação 160 totaliza R$ 6.042,03 porque amortiza R$ 6.039,73 e acrescenta R$ 2,30 de seguro. O saldo amortizável é quitado exatamente no motor.

## Repetição anual da correção

| Mês da correção | Saldo antes | 7% aplicado | Saldo após correção | Fator novo | Prestação no mês |
|---:|---:|---:|---:|---:|---:|
| 13 | R$ 359.064,89 | R$ 25.134,54 | R$ 384.199,43 | 1,034077 | R$ 2.670,07 |
| 25 | R$ 353.847,15 | R$ 24.769,30 | R$ 378.616,45 | 1,106463 | R$ 2.856,98 |
| 37 | R$ 345.991,10 | R$ 24.219,38 | R$ 370.210,47 | 1,183915 | R$ 3.056,96 |
| 49 | R$ 335.141,83 | R$ 23.459,93 | R$ 358.601,76 | 1,266789 | R$ 3.270,95 |
| 61 | R$ 320.906,85 | R$ 22.463,48 | R$ 343.370,33 | 1,355465 | R$ 3.499,92 |
| 73 | R$ 302.852,47 | R$ 21.199,67 | R$ 324.052,15 | 1,450347 | R$ 3.744,91 |
| 85 | R$ 280.499,93 | R$ 19.634,99 | R$ 300.134,92 | 1,551871 | R$ 4.007,06 |
| 97 | R$ 253.321,11 | R$ 17.732,48 | R$ 271.053,58 | 1,660502 | R$ 4.287,55 |
| 109 | R$ 220.733,91 | R$ 15.451,37 | R$ 236.185,28 | 1,776738 | R$ 4.587,68 |
| 121 | R$ 182.097,19 | R$ 12.746,80 | R$ 194.843,99 | 1,901109 | R$ 4.908,82 |
| 133 | R$ 136.705,28 | R$ 9.569,37 | R$ 146.274,65 | 2,034187 | R$ 5.252,43 |
| 145 | R$ 83.781,96 | R$ 5.864,74 | R$ 89.646,70 | 2,176580 | R$ 5.620,10 |
| 157 | R$ 22.473,97 | R$ 1.573,18 | R$ 24.047,15 | 2,328941 | R$ 6.011,61 |

Na 25ª em diante, cada fator sucessivo é 7% maior que o anterior. A taxa de correção incide sobre o saldo que existe imediatamente antes de cada evento, não sobre prestações já pagas.

## Divergências encontradas e corrigidas

- **Parcela inicial limitada à cheia:** o motor anterior aplicava o teto linear. Na 1ª prestação calculava R$ 2.630,78 em vez de R$ 3.430,78 (diferença de −R$ 800,00); na 10ª, R$ 2.622,30. O modo `balanceRebase` opt-in agora reproduz as 10 parcelas solicitadas. O modo antigo continua preservado para outros planos.
- **Saldo incorreto após os valores limitados:** mesmo quando as prestações 11 e 12 coincidiam com os R$ 2.577,34 informados, o saldo anterior estava inflado por causa do subpagamento nas dez primeiras. O saldo ao fim do mês 12 era R$ 367.127,11 no cálculo anterior; no cronograma corrigido é R$ 359.064,89.
- **Correções sem recálculo do perfil:** o modo fixo preservava R$ 2.577,34 depois da 13ª correção. A nova regra aplica R$ 25.134,54 ao saldo correto e reescala as parcelas futuras para R$ 2.670,07; na 25ª, o mesmo procedimento reaplica 7% ao saldo remanescente.
- **Saldo residual:** a projeção anterior deixava R$ 314.057,87 após a prestação 160. O cenário corrigido fecha em R$ 0,00.
- **Eficiência desalinhada:** a aba usava `média de todas as parcelas × quantidade paga`, que não corresponde a um histórico não linear. Agora soma as parcelas reais dos primeiros `n` meses. A degradação progressiva recebe o mesmo cronograma neste simulador; consumidores legados da função sem cronograma continuam com o método anterior.
- **Rastreabilidade visual/PDF:** a tabela mensal expõe o fator do perfil; o eventual PDF de lance identifica a regra pós-correção. Isso não muda o PDF do plano real, pois o usuário não forneceu lance.

## Consistência das seis abas

1. **Dados da proposta:** 160 linhas; prestações e fatores comparados campo a campo com a resposta do motor. Inicial, final, correções e saldo são da mesma simulação.
2. **Custos da operação:** soma dos pagamentos é R$ 636.693,64; fundo comum amortizado R$ 500.499,38; taxa administrativa projetada paga R$ 120.119,85; seguro total R$ 16.074,41; custo operacional (taxa + seguro, regra da aba) R$ 136.194,26. Reconciliado às linhas mensais.
3. **Histórico de correções:** 13 eventos, nos meses 13, 25, …, 157; acumulado de reajuste do saldo R$ 223.819,23; totais anuais reconciliados ao cronograma.
4. **Consórcio × investimentos:** os 160 aportes mensais de poupança e CDB usam cada pagamento calculado, não uma série linear. As taxas exibidas são premissas da própria interface (0,515% a.m. e 0,795% a.m.), não dados fornecidos para este plano.
5. **Estrutura do Lance:** o cenário real não contém lance, FGTS, embutido ou mês de contemplação. A aba corretamente solicita esses dados e não apresenta um resultado inventado. Em teste de integração separado — não parte do plano informado — foi usado lance técnico de R$ 1,00 no mês 24 apenas para confirmar que a projeção de lance coincide com as 24 primeiras linhas antes do evento.
6. **Eficiência da Taxa:** com zero parcelas anteriores informado, o desembolso pago é R$ 0,00; a degradação usa o cronograma previsto. Em teste isolado com 24 parcelas pagas, o KPI somou R$ 71.503,33, igual à soma das prestações 1–24. A aba não acrescenta a correção ao principal de maneira independente da memória.

**Conclusão das abas:** cinco abas exibem os cálculos do caso real; a quinta fica corretamente pendente dos dados de lance não informados. As seis abas permanecem coerentes com o mesmo snapshot do cronograma e com suas premissas próprias.

## Verificações executadas

- `pnpm check`: aprovado; TypeScript e proteção do manifesto de mídias aprovados.
- Testes direcionados do simulador/layout/API: **76/76 aprovados**.
- Independência matemática: 160 meses, diferença máxima de R$ 0,0000000000582 em nove campos mensais.
- Navegador local, tráfego externo bloqueado: seis abas verificadas, 160 linhas comparadas integralmente e nenhum erro JavaScript.
- `pnpm build`: aprovado. Permanece o aviso preexistente de chunk JavaScript maior que 500 kB.
- Suíte completa: **221 testes aprovados, 6 falhos, 4 ignorados; 2 arquivos sem testes registrados**. As falhas são as mesmas classes fora do simulador já observadas na linha de base: expectativas antigas do `financialAnalysis`, token de PostHog ausente no ambiente de teste, expectativa de tema antiga em `WaitingAnalysisScreen`, além de dois arquivos sem suíte. Nenhuma falha dos testes deste motor/layout.
- `package.json` e `pnpm-lock.yaml` não foram alterados. Foi criado commit local; não houve push, deploy, acesso a banco ou alteração na produção.

## Arquivos e reprodução

- `prestações_chave.csv` — cópia para conferência manual das dez linhas pedidas.
- `cronograma_160_meses.csv` — cronograma mensal completo, em CSV delimitado por ponto e vírgula.
- `plano_real_completo.json` — resultado integral do motor e comparação independente.
- `resumo_validacao.json` — resumo dos fatores, eventos e reconciliações.
- Esses arquivos ficam juntos na pasta de evidências `real-plan/` do pacote entregue.
- Exportação reproduzível: `pnpm exec tsx scripts/validate-real-plan.ts <pasta-de-saída>`.
- Teste visual reutilizável: `/home/ubuntu/audit-cdv/etapa4/validate_real_plan_browser.py` (requer prévia local e Playwright já instalado).

O cenário informa **o que este motor calcula sob as convenções acima**; não é promessa de parcela, validação jurídica do contrato nem orientação de investimento.
