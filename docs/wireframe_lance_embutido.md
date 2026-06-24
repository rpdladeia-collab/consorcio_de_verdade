# Wireframe Detalhado: Simulador de Lance Embutido (Revisado)

Este documento descreve o wireframe detalhado revisado para a página do simulador de Lance Embutido, incorporando o feedback do usuário e a nova abordagem **"Dúvida → Resposta → Explicação → Simulador"**. O foco é guiar o usuário de sua pergunta inicial para uma resposta imediata e interpretada, antes de aprofundar em explicações e detalhes técnicos.

## Estrutura Geral da Página

A página será organizada para apresentar a informação de forma progressiva, começando com a interação e o resultado, e depois oferecendo contexto e aprofundamento. O layout será de coluna única, com seções bem definidas e espaçamento generoso para clareza e legibilidade.

---

## 1. Hero da Página

*   **Layout:** Faixa horizontal de largura total, com fundo em preto profundo.
*   **Conteúdo:**
    *   **Título (H1):** "Lance Embutido: vale a pena no seu caso?"
        *   *Estilo:* Fonte grande, em branco/off-white, centralizado ou alinhado à esquerda. Impactante e direto.
    *   **Subtítulo/Descrição (P):** "Descubra quanto crédito você realmente receberá e qual o custo econômico dessa escolha."
        *   *Estilo:* Fonte menor, em branco/off-white, abaixo do título. Promete uma resposta clara.

---

## 2. Faça uma simulação em menos de 1 minuto (Simulador Simplificado)

*   **Layout:** Esta será a primeira seção interativa, logo abaixo do Hero. Card ou bloco com fundo cinza escuro/preto, bordas arredondadas, com um sutil destaque laranja.
*   **Conteúdo:**
    *   **Título (H2):** "Faça uma simulação em menos de 1 minuto"
        *   *Racional:* Convida à ação imediata e destaca a rapidez do processo.
    *   **Formulário:**
        *   **Campo 1:** `Valor da Carta de Crédito` (Input numérico, com máscara de moeda, placeholder "R$ 500.000")
            *   *Ajuda (Tooltip):* "O valor total do bem que você deseja adquirir."
        *   **Campo 2:** `Percentual de Lance Embutido` (Input numérico, com símbolo de %, placeholder "30%")
            *   *Ajuda (Tooltip):* "A porcentagem do valor da carta que você pretende usar como lance."
        *   **Botão:** "Calcular impacto" (Botão primário, cor laranja vibrante, texto em preto, com ícone de calculadora ou seta para a direita).
            *   *Racional:* Foco no resultado e na ação.

---

## 3. Resultado Imediato e Interpretado (Ouro do Projeto)

*   **Layout:** Seção que aparece dinamicamente após a simulação, com fundo branco/off-white ou um fundo contrastante para destacar a importância. Será a seção mais proeminente após a interação inicial.
*   **Conteúdo:**
    *   **Título (H2):** "Seu Resultado: A Verdade sobre o Lance Embutido"
        *   *Racional:* Reforça o posicionamento de transparência e jornalismo de dados.
    *   **KPIs de Destaque (Disposição em 3 colunas ou blocos grandes):**
        *   **Bloco 1:**
            *   *Label:* "Carta Contratada"
            *   *Valor:* `R$ 500.000` (Exemplo)
            *   *Estilo:* Texto em preto profundo, valor em destaque.
        *   **Bloco 2:**
            *   *Label:* "Crédito Líquido"
            *   *Valor:* `R$ 350.000` (Exemplo)
            *   *Estilo:* Texto em preto profundo, valor em destaque, talvez com uma cor sutil de sucesso (verde escuro) se o resultado for positivo, ou neutro.
        *   **Bloco 3:**
            *   *Label:* "Redução do Crédito"
            *   *Valor:* `R$ 150.000` (Exemplo)
            *   *Estilo:* Texto em preto profundo, valor em destaque, talvez com uma cor sutil de alerta (laranja/vermelho) para indicar a perda.
        *   **Bloco 4 (Atenção):**
            *   *Label:* "Eficiência Econômica"
            *   *Valor:* `🟠 Atenção` (Exemplo)
            *   *Estilo:* Ícone de alerta laranja proeminente, texto em preto profundo. Este é o ponto de virada para a análise investigativa.
        *   *Racional:* Apresenta os dados mais críticos de forma concisa e comparativa, usando o laranja para o alerta de eficiência econômica, que é um ponto chave de análise do Consórcio de Verdade. O uso de cores sutis nos blocos de valor pode guiar a percepção inicial do usuário.
    *   **Frase Interpretativa (Impacto Investigativo - Parágrafo em destaque):**
        *   "O lance embutido aumentou sua força de contemplação, mas reduziu em 30% o valor efetivamente disponível para utilização."
        *   *Estilo:* Fonte ligeiramente maior, em negrito ou com destaque visual, em preto profundo. Esta é a "resposta" direta à dúvida inicial do usuário, traduzindo os números em uma conclusão clara e investigativa.

---

## 4. O que é Lance Embutido? (Explicação Contextual)

*   **Layout:** Seção com fundo branco/off-white, com padding interno. Aparece após o resultado imediato.
*   **Conteúdo:**
    *   **Título (H2):** "Entenda o Lance Embutido: Vantagens e Limitações"
        *   *Racional:* Agora que o usuário tem a resposta e o impacto, ele está mais propenso a entender o "porquê" e os detalhes. Esta seção contextualiza a resposta inicial.
    *   **Parágrafo Explicativo:** Texto simples e direto, explicando o conceito.
    *   **Subseção: Vantagens (H3)**
        *   *Lista de Vantagens:* 3-4 pontos, cada um com um ícone ilustrativo e uma breve descrição. (Ex: Ícone de foguete - "Acelera a Contemplação")
    *   **Subseção: Limitações (H3)**
        *   *Lista de Limitações:* 3-4 pontos, cada um com um ícone de alerta e uma breve descrição. (Ex: Ícone de balança - "Reduz o Crédito Líquido")
    *   **Exemplo Visual (Imagem/Infográfico):** Um placeholder para um infográfico simples que ilustre a mecânica do lance embutido (ex: um círculo representando o crédito total, com uma fatia laranja destacando o valor embutido).

---

## 5. Simulador Avançado

*   **Layout:** Seção inicialmente oculta, revelada por um botão. Fundo cinza escuro/preto, similar ao simulador simplificado.
*   **Conteúdo:**
    *   **Botão/Link:** "Configurações Avançadas" (Link/botão discreto, abaixo do simulador simplificado, para expandir esta seção).
    *   **Título (H2):** "Simulador Avançado: Detalhes e Parâmetros Completos"
    *   **Formulário Expandido:** Inclui todos os campos do simulador simplificado, mais:
        *   `Taxa de Administração (%)`
        *   `Fundo de Reserva (%)`
        *   `Seguro (%)`
        *   `Prazo do Consórcio (meses)`
        *   `Índice de Correção (anual %)`
        *   `Modo de Pagamento (Linear/Não Linear)`
        *   `Faixas de Pagamento Não Linear` (Textarea para entrada de faixas)
    *   **Memória de Cálculo (Tabela):** Uma tabela detalhada mostrando o passo a passo dos cálculos, mês a mês, com colunas como `Mês`, `Crédito Corrigido`, `Parcela Total`, `Saldo Final`, etc.
    *   **Botão:** "Recalcular" (Botão secundário, cor preta, texto em branco).

---

## 6. Vídeo Explicativo

*   **Layout:** Seção com fundo preto profundo.
*   **Conteúdo:**
    *   **Título (H2):** "Tutorial: Como Usar o Simulador de Lance Embutido"
    *   **Player de Vídeo (Placeholder):** Um bloco retangular com um ícone de play centralizado, indicando a área para o vídeo tutorial. (Ex: `<iframe>` ou `<video>`).

---

## 7. PDF

*   **Layout:** Seção com fundo branco/off-white.
*   **Conteúdo:**
    *   **Título (H2):** "Gere seu Relatório Personalizado"
    *   **Descrição:** "Baixe um relatório completo da sua simulação, com todos os detalhes e a memória de cálculo, para consultar offline ou compartilhar."
    *   **Botão:** "Gerar Relatório em PDF" (Botão primário, cor laranja vibrante, texto em preto).

---

## 8. Material Complementar

*   **Layout:** Seção com fundo preto profundo.
*   **Conteúdo:**
    *   **Título (H2):** "Aprofunde seu Conhecimento"
    *   **Opção 1 (Download):** Um card com título "Guia Completo de Lance Embutido", descrição e botão "Baixar PDF".
    *   **Opção 2 (Carrossel/Links):** Uma área para exibir 3-4 cards ou links para artigos relacionados do blog, com título e breve descrição. (Ex: "Artigo: Os Mitos do Consórcio", "Artigo: Como Escolher a Melhor Administradora")

---

## 9. Perguntas Frequentes

*   **Layout:** Seção com fundo branco/off-white.
*   **Conteúdo:**
    *   **Título (H2):** "Perguntas Frequentes sobre Lance Embutido"
    *   **Lista de Acordeões:** Uma série de itens de FAQ, onde cada item é um título clicável que expande para revelar a resposta. (Ex: "O lance embutido é sempre vantajoso?", "Qual a diferença entre lance embutido e lance próprio?")

---

## 10. Fontes e Metodologia

*   **Layout:** Seção com fundo preto profundo.
*   **Conteúdo:**
    *   **Título (H2):** "Nossa Metodologia e Fontes"
    *   **Parágrafo Explicativo:** Texto detalhando a base dos cálculos, as fontes de dados (ex: Banco Central, regulamentações específicas) e a metodologia de análise utilizada. Pode incluir links externos para as fontes.

---

## Considerações de Design (Aplicação no Wireframe)

*   **Cores:** O wireframe será descrito com as cores primárias (preto, branco/off-white, laranja) para indicar a intenção visual de cada elemento, com o laranja sendo usado estrategicamente para ações e alertas críticos.
*   **Tipografia:** Indicação de tamanhos e pesos de fonte para títulos e textos, visando clareza e hierarquia, com fontes que transmitam seriedade e modernidade.
*   **Espaçamento:** Ênfase em espaçamentos generosos entre seções e elementos para evitar sobrecarga visual e criar uma sensação de "respiro" e premium.
*   **Elementos Interativos:** Botões e links claramente identificados, com estados (hover, active) implícitos pela cor laranja, garantindo que as chamadas para ação sejam proeminentes.
*   **Responsividade:** O layout será pensado para ser responsivo, adaptando-se a diferentes tamanhos de tela (desktop, tablet, mobile), com a versão desktop sendo a principal referência para este wireframe.
*   **Estética Editorial Premium e Jornalismo de Dados:** O design geral buscará uma estética de "dashboard de análise" ou "reportagem investigativa", com o uso de blocos de informação bem definidos, tipografia clara e o contraste das cores para guiar o olhar do usuário para os pontos mais importantes. O `🟠 Atenção` será um elemento visual chave para reforçar a análise crítica do Consórcio de Verdade.
