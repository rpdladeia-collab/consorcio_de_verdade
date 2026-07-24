# Validação visual interna — Panorama BC / Mercado em Números

## Preview desktop inicial

- Rota validada: `http://localhost:3101/data-lab` no projeto original.
- O primeiro quadro foi capturado antes da montagem do React; após as consultas concluírem, a página renderizou normalmente.
- Cabeçalho global, hero editorial escuro, navegação Panorama/Data Lab, filtros e painel analítico aparecem no padrão visual existente do site.
- A interface carregou o catálogo real com **125 métricas** distribuídas em **19 grupos**.
- A seleção padrão funcional foi `Cotas ativas - Total`, do grupo `Cotas ativas`, unidade `mil`.
- O recorte padrão de 10 anos retornou **10 observações anuais**, de dezembro de 2016 a dezembro de 2025.
- Valor mais recente observado no preview: `12.819,18 mil` em dezembro de 2025; variação calculada no recorte: `+84,16%`.
- O aviso de granularidade anual de dezembro aparece antes do gráfico; não há interpolação visual ou numérica.
- A API tRPC respondeu com HTTP 200 para catálogo, grupos e série real.
- Não foram encontrados erros no console do navegador nessa primeira inspeção.

## Evidências locais

- Screenshot inicial pós-carregamento: `/home/ubuntu/screenshots/localhost_2026-07-21_05-17-05_2855.webp`.
- HTML capturado: `/home/ubuntu/browser_html/localhost_data-lab_1784611026142.html`.
- Logs consultados: `.manus-logs/browserConsole.log`, `.manus-logs/devserver.log` e `.manus-logs/networkRequests.log`.

## Interações funcionais no desktop

O controle **5 anos** atualizou o recorte sem recarregar a página: a série passou de 10 para 5 observações, abrangendo dezembro de 2021 a dezembro de 2025, e a variação exibida passou para **+51,18%**. A busca por `índice de exclusão` reduziu corretamente o catálogo de 125 para **5 métricas oficiais**. A série já selecionada permaneceu estável durante a filtragem, evitando mudança implícita do indicador analisado.

A tabela e o gráfico continuaram sincronizados após a troca de período. A tabela mostrou exatamente cinco linhas, todas com fonte `BCB`, e o painel preservou a cobertura completa de dezembro de 2016 a dezembro de 2025 como informação de contexto.

## Correção validada durante o preview

A inspeção revelou uma inconsistência: ao filtrar o catálogo, o elemento nativo exibia o primeiro resultado, mas a série anterior permanecia ativa. A página foi corrigida para atualizar a seleção real quando a métrica atual deixa de pertencer ao conjunto filtrado.

Após a correção, a busca por `índice de exclusão` alinhou os três pontos da interface: seletor, bloco “Seleção atual” e série passaram para **Índice de Exclusão - Total**. A consulta retornou 10 observações anuais reais, com **48,42%** em dezembro de 2025 e variação de **-3,49%** no histórico completo, sempre com fonte `BCB`.

## Limitação do navegador de inspeção

A tentativa de redimensionar a janela ativa para 390 × 844 pixels via JavaScript não alterou o viewport da captura, que permaneceu no tamanho desktop controlado pelo ambiente. Portanto, essa tentativa não foi considerada evidência de responsividade; a validação mobile será feita separadamente com captura programática em viewport definido.

## Validação móvel integral — faixas 1 e 2

A captura programática confirmou um viewport real de **390 × 844 pixels** e uma página total de **390 × 3.589 pixels**, sem largura excedente. No topo, o cabeçalho compacto, o menu móvel, o hero, os números de catálogo e as duas abas permanecem legíveis e respeitam a largura do dispositivo.

Na sequência, o cartão de seleção ocupa uma coluna única. Os três controles nativos — grupo, busca e métrica — usam toda a largura disponível sem corte de texto estrutural. A seleção atual e sua unidade ficam explícitas antes do cartão de período. Não foi observado estouro horizontal nas duas primeiras faixas.

## Validação móvel integral — faixas 3 e 4

Os cinco recortes temporais quebram em duas linhas com áreas de toque amplas, mantendo o estado ativo de **10 anos** distinguível por contraste. O cartão da série preserva título, grupo, unidade e rótulo do período em ordem clara.

Os quatro indicadores são reorganizados em uma grade de duas colunas: valor mais recente, variação, observações e cobertura continuam legíveis. O aviso sobre competências anuais permanece destacado antes do gráfico. O gráfico reduz sua largura corretamente, mantém escala, pontos e linha visíveis e não introduz rolagem lateral.

## Validação móvel integral — faixas 5 e 6

O gráfico termina dentro do cartão e apresenta marcações temporais legíveis. A tabela de dados brutos aparece imediatamente depois e mantém as dez competências em ordem decrescente. Em 390 pixels, competência, valor e unidade permanecem legíveis; a coluna de fonte fica fora da área visível inicial da tabela, coerente com o contêiner horizontal rolável definido para telas estreitas, sem alargar a página inteira.

O bloco de transparência mantém contraste alto, borda editorial laranja e texto legível. A mensagem central — catálogo e valores exclusivamente do Banco Central, mesma resposta para gráfico e tabela e ausência de interpolação — permanece clara no mobile.

## Validação móvel integral — faixa 7 e conclusão

A última faixa confirma que o link para a documentação oficial do Banco Central tem contraste e alvo de toque adequados. O rodapé é reorganizado em coluna única, com logotipo, aviso informativo, links legais e ano sem sobreposição ou corte.

A inspeção percorreu as **sete faixas na ordem do manifesto**, com sobreposição vertical para conferir as transições. Não foram observados estouro horizontal da página, elementos sobrepostos, texto estrutural truncado ou áreas vazias anômalas. A única rolagem horizontal prevista é interna à tabela de quatro colunas em tela estreita.

Evidência principal: `artifacts/panorama-preview/data-lab-mobile-full-390x844.png` (390 × 3.589 pixels). Manifesto e faixas: `artifacts/panorama-preview/mobile-tiles/manifest.json` e `tile_001` a `tile_007`.

## Recorte personalizado — inconsistência detectada

Ao apagar ou deixar incompleta uma das competências do período personalizado, a consulta é corretamente desabilitada, mas a interface reutilizava a mensagem “Métrica sem observações”. Essa mensagem é semanticamente incorreta para um intervalo ainda não informado. A correção necessária é distinguir **período incompleto** de **métrica válida sem valores** e orientar o preenchimento de início e fim.

Após o hot reload, o modo **Personalizado** voltou a preencher automaticamente a cobertura válida (`2016-12` a `2025-12`) e manteve as dez observações oficiais. A próxima verificação isolou apenas o estado de competência incompleta para confirmar a nova mensagem semântica.

A correção foi validada no preview: ao remover a competência inicial, a página passou a exibir **“Período personalizado incompleto”** e a orientação de preenchimento, sem alegar ausência de observações. Em seguida, o campo nativo foi preenchido com `2021-12` e aceitou o valor, permitindo a retomada da consulta personalizada.

O intervalo personalizado válido `2021-12` a `2025-12` foi confirmado no preview. A série exibiu **5 observações**, preservou a cobertura total informativa de `2016-12` a `2025-12` e recalculou a variação do recorte para **+51,18%**, sem criar pontos intermediários.

Na primeira abertura do link temporário exposto, o processo de preview herdou a variável global `DATABASE_URL` do projeto ativo e não carregou o catálogo do repositório original. O processo foi encerrado e reiniciado com essa variável herdada removida, permitindo que o próprio projeto carregasse sua configuração nativa, sem ler, editar ou expor segredos.

A segunda tentativa, removendo apenas a variável herdada, ainda não carregou o catálogo no link exposto. Isso confirmou que o servidor de desenvolvimento não importa automaticamente o arquivo local nesse modo de execução. O preview público não deve ser entregue nesse estado; ele será reiniciado com o carregamento nativo de ambiente do Node, sem edição do arquivo.

O preview temporário foi reiniciado por um lançador fora do repositório que carrega `.env.local` somente em memória. O link exposto foi então validado com sucesso: **125 métricas**, **19 grupos**, a série `Cotas ativas - Total`, **10 observações**, cobertura `dez/2016 – dez/2025` e valor recente `12.819,18 mil` apareceram sem erro. Nenhum segredo foi exibido ou alterado.

## Ajustes editoriais do Data Lab — 21 de julho de 2026

No preview atualizado, o hero exibe a nova redação aprovada sobre os dados conectados ao Banco Central do Brasil e mantém o padrão visual escuro existente. Os indicadores foram preservados no mesmo bloco visual e agora apresentam, da esquerda para a direita: **125 métricas oficiais**, **10+ anos de histórico** e **19 grupos de dados**.

A inspeção do DOM confirmou que o seletor `#panorama-group` preserva todos os 19 grupos oficiais e os distribui em seis categorias editoriais: Mercado; Comercialização; Contemplações e exclusões; Planos de consórcio; Risco e inadimplência; e Produtos específicos. Os dois produtos tratados separadamente são Administradoras de Consórcio e Cotas Ativas por Estado.

A observação de granularidade foi atualizada: a tela explica que a cobertura atualmente conectada é anual em dezembro, mas que o conjunto atual do Banco Central tem periodicidade trimestral e que nenhum ponto intermediário é inventado pelo sistema.

## Estabilização da consulta — 21 de julho de 2026

A causa identificada foi uma reconsulta adicional: a cobertura retornada preenchia os campos internos de período personalizado mesmo quando o recorte ativo era “10 anos”; esses valores eram reenviados na consulta subsequente. A entrada da API passou a enviar limites personalizados **somente** quando o modo “Personalizado” está ativo.

Após a correção, uma recarga limpa do preview exibiu a série `Cotas ativas - Total` no recorte de dez anos, com 10 observações entre dezembro de 2016 e dezembro de 2025, sem retorno ao estado de carregamento. O novo comportamento está coberto pelos testes `dataLabQuery.test.ts`.
Uma segunda inspeção, após a página permanecer aberta por alguns segundos, mostrou o mesmo hero, indicadores, seleção e série histórica carregados, sem retorno ao painel de carregamento e sem reinicialização visível do documento.

## Correção da regressão de catálogo e carregamento contínuo — 21 de julho de 2026

Preview validado em `https://3101-ibeexj2lwamv34rr670vz-098640ec.us1.manus.computer/data-lab` após reconstrução do vínculo com os IDs oficiais dos 19 grupos.

Duas inspeções consecutivas confirmaram estado estável: **125 de 125 métricas** visíveis, seleção inicial automática em `Administradoras de Consórcio Autorizadas e Ativas pelo Unicad`, série oficial carregada com **10 observações** de dezembro de 2016 a dezembro de 2025 e valor mais recente de **131** em dezembro de 2025. A página não retornou ao spinner nem repetiu a inicialização entre as inspeções.

A causa da regressão era a substituição indevida dos IDs oficiais numéricos por identificadores editoriais sintéticos. A correção preserva os IDs `1` a `19` do backend, mantém as categorias editoriais somente como apresentação e separa o estado vazio do estado de carregamento.

O glossário também foi validado após a correção: o clique em **Grupos ativos** abriu o pop-up com o título e a explicação correspondente, sem alterar a métrica selecionada nem interromper a série já carregada.

### Validação Móvel Final (390x844px) — Regressão Corrigida

**Faixa 1 (0-600px):**
- O cabeçalho, o hero e os indicadores (125 métricas, 10+ anos, 19 grupos) estão visíveis e formatados corretamente.
- O texto de apoio do hero está atualizado.
- O seletor de métricas está visível e a seleção inicial "Administradoras de Consórcio Autorizadas e Ativas pelo Unicad" está correta.

**Faixa 2 (547-1147px):**
- O restante do seletor de métricas está visível, incluindo a lista de grupos editoriais e o glossário "Interpretando as métricas" com os grupos clicáveis.
- A seção "Defina o período" está visível com o novo texto de transparência acima dos botões de período.

**Faixa 3 (1094-1694px):**
- Os botões de período (12 meses, 5 anos, 10 anos, Completo, Personalizado) estão visíveis e funcionais.
- O início da série histórica está visível, com o gráfico carregado e os dados da métrica selecionada.

**Faixa 4 (1641-2241px):**
- O restante do gráfico da série histórica está visível.
- O início da tabela de dados brutos está visível, com as colunas e os primeiros valores.

**Faixa 5 (2188-2788px):**
- O restante da tabela de dados brutos está visível, com todas as linhas e colunas.
- O início do bloco de transparência e método está visível, com o título e o texto explicativo.

**Faixa 6 (2735-3335px):**
- O restante do bloco de transparência e método está visível, incluindo o link para a fonte oficial do Banco Central.
- O rodapé da página está visível.
