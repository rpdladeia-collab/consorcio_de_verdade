# Racional de UX: Simulador de Lance Embutido (Revisado)

Este documento detalha o racional de User Experience (UX) revisado para a página do simulador de Lance Embutido. A principal mudança é a adoção de uma abordagem **"Dúvida → Resposta → Explicação → Simulador"**, priorizando a resposta imediata à pergunta do usuário e uma interpretação investigativa dos resultados, alinhada ao posicionamento do Consórcio de Verdade como jornalismo de dados transparente.

## 1. Princípios Fundamentais de UX (Revisados)

Os princípios foram ajustados para refletir a nova abordagem:

*   **Resposta Imediata e Relevância:** A página deve responder à pergunta central do usuário ("Vale a pena no meu caso?") de forma rápida e direta, antes de aprofundar em explicações. O simulador simplificado e o resultado interpretado serão o ponto focal inicial.
*   **Transparência e Credibilidade Investigativa:** O Consórcio de Verdade não apenas apresenta dados, mas os interpreta de forma crítica. A seção de resultados não será apenas numérica, mas trará insights investigativos sobre o impacto real do lance embutido, com alertas e análises claras.
*   **Clareza e Acessibilidade:** A linguagem continua sendo simples e direta, evitando jargões. O fluxo de interação é otimizado para guiar o usuário da dúvida à resposta, e depois à compreensão aprofundada.
*   **Educação Progressiva:** Após a resposta inicial, a página oferece camadas de informação para quem deseja aprofundar. A explicação do "O que é Lance Embutido?" e o simulador avançado vêm em um segundo momento, para não sobrecarregar o usuário que busca uma resposta rápida.
*   **Estética Editorial Premium e Jornalismo de Dados:** O design visual reforçará a imagem de uma plataforma de inteligência e transparência, utilizando a paleta de cores definida (preto profundo, branco/off-white e laranja vibrante) para criar uma atmosfera de seriedade e análise, distanciando-se de estéticas comerciais.

## 2. Estrutura da Página e Racional de UX (Revisados)

A página será reestruturada para seguir a jornada do usuário, começando pela dúvida e culminando na resposta e explicação detalhada:

### 2.1. Hero da Página

*   **Título (H1):** "Lance Embutido: vale a pena no seu caso?"
    *   *Racional:* Aborda diretamente a dúvida do usuário, gerando engajamento imediato e posicionando a ferramenta como um solucionador de problemas.
*   **Subtítulo/Descrição (P):** "Descubra quanto crédito você realmente receberá e qual o custo econômico dessa escolha."
    *   *Racional:* Promete uma resposta concreta e foca nos dois principais impactos do lance embutido: o valor líquido e o custo/benefício.

### 2.2. Faça uma simulação em menos de 1 minuto (Simulador Simplificado)

*   **Título (H2):** "Faça uma simulação em menos de 1 minuto"
    *   *Racional:* Prioriza a ação e a rapidez, incentivando o usuário a interagir imediatamente.
*   **Formulário:**
    *   **Campo 1:** `Valor da Carta de Crédito` (Input numérico, com máscara de moeda, placeholder "R$ 500.000")
        *   *Racional:* O valor mais relevante para o usuário, fácil de obter.
    *   **Campo 2:** `Percentual de Lance Embutido` (Input numérico, com símbolo de %, placeholder "30%")
        *   *Racional:* O segundo dado crucial, geralmente informado pelo vendedor.
    *   **Botão:** "Calcular impacto" (Botão primário, cor laranja vibrante, texto em preto).
        *   *Racional:* Ação clara e focada no resultado que o usuário busca.

### 2.3. Resultado Imediato e Interpretado (Ouro do Projeto)

Esta seção é o coração da nova abordagem, entregando a resposta à dúvida do usuário de forma impactante.

*   **Título (H2):** "Seu Resultado: A Verdade sobre o Lance Embutido"
*   **KPIs de Destaque:**
    *   **Carta Contratada:** `R$ 500.000` (Valor de entrada do usuário, para contexto)
    *   **Crédito Líquido:** `R$ 350.000` (A resposta mais importante: quanto ele realmente terá)
    *   **Redução do Crédito:** `R$ 150.000` (O custo direto do lance embutido)
    *   **Eficiência Econômica:** `🟠 Atenção` (Um indicador visual e direto do custo/benefício, com cor de alerta)
        *   *Racional:* Apresenta os dados mais críticos de forma concisa e comparativa, usando o laranja para o alerta de eficiência econômica, que é um ponto chave de análise do Consórcio de Verdade.
*   **Frase Interpretativa (Impacto Investigativo):** "O lance embutido aumentou sua força de contemplação, mas reduziu em 30% o valor efetivamente disponível para utilização."
    *   *Racional:* Traduz os números em uma conclusão clara e investigativa, explicando o trade-off de forma direta e sem rodeios. Esta frase é a "resposta" à dúvida inicial do usuário.

### 2.4. O que é Lance Embutido? (Explicação Contextual)

*   **Título (H2):** "Entenda o Lance Embutido: Vantagens e Limitações"
    *   *Racional:* Agora que o usuário tem a resposta, ele está mais propenso a entender o "porquê". Esta seção contextualiza a resposta inicial.
*   **Conteúdo:**
    *   **Explicação Simples:** Definição clara e concisa do que é o lance embutido, como funciona e seu propósito no consórcio.
    *   **Vantagens:** Apresentação dos benefícios (ex: aumento das chances de contemplação, uso de parte do próprio crédito). Com ícones.
    *   **Limitações:** Discussão dos pontos negativos ou considerações importantes (ex: redução do crédito líquido, impacto na eficiência econômica). Com ícones.
    *   **Exemplos Visuais:** Infográficos simples ou ilustrações que demonstrem o conceito de forma prática.

### 2.5. Simulador Avançado

*   **Título (H2):** "Simulador Avançado: Detalhes e Parâmetros Completos"
    *   *Racional:* Para usuários que desejam aprofundar a análise e personalizar a simulação com mais variáveis.
*   **Conteúdo:**
    *   **Botão/Link:** "Configurações Avançadas" (para expandir a seção).
    *   **Formulário Expandido:** Inclui campos como `Taxa de Administração`, `Fundo de Reserva`, `Prazo do Consórcio`, `Índice de Correção`, `Modo de Pagamento`, `Faixas de Pagamento Não Linear`.
    *   **Memória de Cálculo (Tabela):** Tabela detalhada com o passo a passo dos cálculos, mês a mês.
    *   **Botão:** "Recalcular" (para atualizar a simulação avançada).

### 2.6. Vídeo Explicativo

*   **Título (H2):** "Tutorial: Como Usar o Simulador de Lance Embutido"
    *   *Racional:* Oferece um formato alternativo para a compreensão, ideal para quem prefere conteúdo audiovisual.
*   **Player de Vídeo (Placeholder):** Área para o vídeo tutorial.

### 2.7. PDF

*   **Título (H2):** "Gere seu Relatório Personalizado"
    *   *Racional:* Permite ao usuário documentar e compartilhar a análise.
*   **Descrição:** "Baixe um relatório completo da sua simulação, com todos os detalhes e a memória de cálculo, para consultar offline ou compartilhar."
*   **Botão:** "Gerar Relatório em PDF" (Botão primário, cor laranja vibrante).

### 2.8. Material Complementar

*   **Título (H2):** "Aprofunde seu Conhecimento"
    *   *Racional:* Continua a jornada educativa, oferecendo mais conteúdo relevante.
*   **Conteúdo:** Cards ou links para guias e artigos relacionados.

### 2.9. Perguntas Frequentes

*   **Título (H2):** "Perguntas Frequentes sobre Lance Embutido"
    *   *Racional:* Aborda dúvidas comuns de forma rápida e eficiente.
*   **Conteúdo:** Lista de acordeões com FAQ.

### 2.10. Fontes e Metodologia

*   **Título (H2):** "Nossa Metodologia e Fontes"
    *   *Racional:* Reforça a credibilidade e transparência do Consórcio de Verdade.
*   **Conteúdo:** Texto detalhando a base dos cálculos, fontes de dados e metodologia.

## 3. Considerações de Design e Identidade Visual

As considerações de design permanecem as mesmas, mas com ênfase na aplicação para a nova estrutura:

*   **Referência Instagram:** A identidade visual do Instagram (@consorcio.deverdade) continua sendo a principal referência.
*   **Paleta de Cores:** **Preto profundo** para fundos e destaque, **branco/off-white** para texto e conteúdo, e **laranja vibrante** para botões de ação, indicadores importantes e alertas (como a "Eficiência Econômica").
*   **Estética Editorial Premium:** Tipografia limpa, espaçamento generoso, e uso inteligente de linhas e divisores para organizar o conteúdo, transmitindo a sensação de uma plataforma de análise de dados.
*   **Plataforma de Inteligência e Transparência:** O uso de elementos visuais como o `🟠 Atenção` e a frase interpretativa reforçam o caráter investigativo e de jornalismo de dados.
*   **Evitar Associações Indesejadas:** O design continuará a evitar elementos visuais que remetam a bancos, administradoras ou fintechs, mantendo a originalidade e o alinhamento com o posicionamento de jornalismo de dados.
