# Proposta Visual e Wireframe: Simulador de Lance Embutido (Refinamento Final)

Este documento apresenta o refinamento final do mockup visual para o simulador de Lance Embutido, transformando a página em uma **experiência de auditoria e descoberta**, com uma narrativa clara e linguagem humana. O objetivo é solidificar a visão de uma plataforma de inteligência e transparência, alinhada à identidade do Consórcio de Verdade.

## 1. Identidade Visual e Estilo

*   **Paleta de Cores:**
    *   **Fundo Principal:** Preto Profundo (`#0D0D0D`) para seções de destaque e navegação.
    *   **Fundo de Conteúdo/Cards:** Cinza Grafite (`#151515`) e Off-white (`#F7F4EC` - um branco mais suave para contraste em seções específicas).
    *   **Texto Principal:** Branco Puro (`#FFFFFF`) para títulos e Off-white (`#E7E3D8`) para leitura em fundos escuros; Preto Profundo (`#151515`) em fundos claros.
    *   **Ação/Alerta/Destaque:** Laranja Vibrante (`#F26A21`) - A cor de assinatura do Instagram, usada para botões, indicadores de atenção e elementos interativos.
    *   **Status:** Verde Investigativo (`#53D993`) para resultados positivos, Vermelho Crítico (`#E54848`) para alertas negativos.
*   **Tipografia:**
    *   **Títulos (H1, H2):** Fonte *Inter* com peso **Extra Bold** (900) e estilo **Condensed** ou similar, para um impacto editorial forte e direto. Letras maiúsculas para H1 e H2.
    *   **Dados/Números (KPIs, Memória de Cálculo):** Fonte *JetBrains Mono* ou *IBM Plex Mono*, evocando precisão técnica e transparência de dados, mas com um toque de "código" ou "relatório de análise".
    *   **Corpo de Texto:** Fonte *Inter* com peso regular (400-500), foco total em legibilidade e conforto de leitura.

---

## 2. Estrutura Visual da Página (Hierarquia de Blocos e Fluxo de Descoberta)

A página será construída como um **relatório investigativo**, guiando o usuário por uma jornada de descoberta:

1.  **Header:** Minimalista, com logo e navegação essencial.
2.  **Hero:** A pergunta central que a plataforma irá responder.
3.  **Introdução Concisa:** Breve contexto sobre o lance embutido, antes da interação.
4.  **Sua Auditoria Começa Aqui:** O formulário de entrada de dados, posicionado como o ponto de partida da investigação.
5.  **Relatório de Auditoria:** O resultado imediato, com KPIs humanizados e o diagnóstico narrativo.
6.  **Entenda o Lance Embutido:** A explicação detalhada, agora que o usuário já tem um resultado para contextualizar.
7.  **Auditoria Detalhada:** O simulador avançado e a memória de cálculo.
8.  **Recursos Complementares:** Vídeo, PDF, Material, FAQ, Fontes.

---

## 3. Mockup Visual Detalhado (Desktop)

### [Header]
*   **Layout:** Faixa superior fixa, fundo Preto Profundo.
*   **Conteúdo:**
    *   **Esquerda:** Logo `.renatto` (ícone 'r' laranja em quadrado preto, seguido de "enatto" em branco, "Consórcio de Verdade" em off-white menor).
    *   **Direita:** Links de navegação (`Simuladores`, `Sobre`, `Contato`) em off-white, com hover laranja.

### [Hero Section]
*   **Layout:** Faixa de largura total, fundo Preto Profundo.
*   **Conteúdo:**
    *   **Título (H1):** `LANCE EMBUTIDO: VALE A PENA NO SEU CASO?`
        *   *Estilo:* Fonte *Inter Extra Bold Condensed*, tamanho grande (ex: 48-64px), branco puro, centralizado.
    *   **Subtítulo (P):** `Descubra quanto crédito você realmente receberá e qual o custo econômico dessa escolha.`
        *   *Estilo:* Fonte *Inter Regular*, tamanho médio (ex: 18-20px), off-white, centralizado, com espaçamento generoso.

### [Introdução Concisa ao Lance Embutido]
*   **Layout:** Seção com fundo Cinza Grafite (`#151515`), padding vertical.
*   **Conteúdo:**
    *   **Parágrafo (P):** `O lance embutido é uma estratégia para acelerar a contemplação no consórcio, utilizando parte do seu próprio crédito como oferta. Mas qual o custo real dessa decisão? Nossa auditoria revela o impacto financeiro no seu bolso.`
        *   *Estilo:* Fonte *Inter Regular*, off-white, texto justificado ou alinhado à esquerda. O objetivo é dar um contexto rápido e instigar a auditoria.

### [Seção: Sua Auditoria Começa Aqui]
*   **Layout:** Card centralizado ou bloco de largura total, fundo Cinza Grafite (`#151515`), bordas levemente arredondadas (8-12px), com uma borda superior sutil em laranja.
*   **Conteúdo:**
    *   **Título (H2):** `SUA AUDITORIA COMEÇA AQUI`
        *   *Estilo:* Fonte *Inter Extra Bold*, tamanho médio (ex: 24-28px), branco puro, alinhado à esquerda.
    *   **Formulário (Grid de 3 colunas):**
        *   **Campo 1:** `VALOR DA CARTA DE CRÉDITO` (Input numérico, máscara de moeda, placeholder "R$ 500.000")
            *   *Ajuda (Tooltip):* `O valor total do bem que você deseja adquirir.`
        *   **Campo 2:** `% LANCE EMBUTIDO` (Input numérico, % suffix, placeholder "30%")
            *   *Ajuda (Tooltip):* `A porcentagem do valor da carta que você pretende usar como lance.`
        *   **Campo 3:** `LANCE PRÓPRIO (OPCIONAL)` (Input numérico, máscara de moeda, placeholder "R$ 0")
            *   *Ajuda (Tooltip):* `Dinheiro extra que você tem para ofertar, além do embutido. Ele muda a eficiência!`
    *   **Botão:** `AUDITAR MEU LANCE` (Botão primário, cor Laranja Vibrante, texto em Preto Profundo, fonte *Inter Extra Bold*, cantos levemente arredondados).

### [Seção: Relatório de Auditoria (Resultado Imediato)]
*   **Layout:** Seção de largura total, fundo Off-white (`#F7F4EC`), que aparece dinamicamente após a auditoria. Contraste com as seções anteriores para destacar o resultado.
*   **Conteúdo:**
    *   **Título (H2):** `SEU RELATÓRIO DE AUDITORIA: LANCE EMBUTIDO`
        *   *Estilo:* Fonte *Inter Extra Bold*, Preto Profundo.
    *   **KPIs Humanizados (Layout de 3 colunas, com blocos de destaque):**
        *   **Bloco 1:**
            *   *Label:* `CARTA CONTRATADA`
            *   *Valor:* `R$ 500.000,00`
            *   *Descrição:* `O valor inicial do seu consórcio.`
            *   *Estilo:* Fundo Cinza Grafite, borda esquerda sutil em Cinza Claro. Valor em *JetBrains Mono* Extra Bold, Preto Profundo.
        *   **Bloco 2:**
            *   *Label:* `CRÉDITO LÍQUIDO DISPONÍVEL`
            *   *Valor:* `R$ 350.000,00`
            *   *Descrição:* `O valor real que você terá para usar após o lance.`
            *   *Estilo:* Fundo Cinza Grafite, borda esquerda sutil em Verde Investigativo. Valor em *JetBrains Mono* Extra Bold, Verde Investigativo.
        *   **Bloco 3:**
            *   *Label:* `REDUÇÃO EFETIVA DO CRÉDITO`
            *   *Valor:* `R$ 150.000,00`
            *   *Descrição:* `O valor do seu crédito que foi usado para o lance.`
            *   *Estilo:* Fundo Cinza Grafite, borda esquerda sutil em Vermelho Crítico. Valor em *JetBrains Mono* Extra Bold, Vermelho Crítico.
        *   **Bloco 4 (Protagonista):**
            *   *Label:* `TAXA SOBRE CAPITAL NOVO EFETIVO`
            *   *Valor:* `32,00%`
            *   *Descrição:* `O custo real do dinheiro que entra no seu bolso.`
            *   *Estilo:* Fundo Cinza Grafite, borda esquerda sutil em Laranja Vibrante. Valor em *JetBrains Mono* Extra Bold, Laranja Vibrante. Ícone de lupa ou similar ao lado do label.
    *   **Diagnóstico Narrativo (Bloco de largura total, com destaque):**
        *   **Título (H3):** `SEU DIAGNÓSTICO: A ANÁLISE DO CONSÓRCIO DE VERDADE`
            *   *Estilo:* Fonte *Inter Extra Bold*, Preto Profundo.
        *   **Status Visual:** Um grande ícone (🟢, 🟠 ou 🔴) seguido de um texto como `BOA EFICIÊNCIA`, `ATENÇÃO`, ou `BAIXA EFICIÊNCIA`.
        *   **Narrativa (P):** `O lance embutido <o que fez por você>, mas <o que tirou de você>. Economicamente, isso significa que <o que significa economicamente, com a Taxa sobre Capital Novo Efetivo em destaque>.`
            *   *Exemplo:* `O lance embutido **aumentou sua força de contemplação**, porém **reduziu significativamente o valor disponível para utilização**. Economicamente, isso significa que a **Taxa sobre Capital Novo Efetivo** ficou em **32,00%**, indicando um custo elevado para o dinheiro que efetivamente entra no seu bolso. Avalie se a agilidade na contemplação compensa este custo.`
            *   *Estilo:* Fonte *Inter Regular*, Preto Profundo, com palavras-chave em negrito. O bloco terá um fundo sutilmente colorido (verde, laranja ou vermelho) dependendo do status.

### [Seção: Entenda o Lance Embutido (Explicação Detalhada)]
*   **Layout:** Seção com fundo Cinza Grafite (`#151515`), padding vertical.
*   **Conteúdo:**
    *   **Título (H2):** `ENTENDA O LANCE EMBUTIDO: VANTAGENS E LIMITAÇÕES`
    *   **Parágrafo Explicativo:** Texto detalhado sobre o conceito.
    *   **Vantagens/Limitações:** Apresentadas em blocos visuais claros, com ícones e descrições concisas.
    *   **Exemplo Visual:** Infográfico simples e elegante, explicando a mecânica.

### [Seção: Auditoria Detalhada (Simulador Avançado)]
*   **Layout:** Seção com fundo Preto Profundo, inicialmente oculta. Revelada por um botão.
*   **Conteúdo:**
    *   **Botão/Link:** `VER DETALHES DA AUDITORIA` (Em off-white, com ícone de seta para baixo/cima).
    *   **Título (H2):** `AUDITORIA DETALHADA: PARÂMETROS E MEMÓRIA DE CÁLCULO`
    *   **Formulário Expandido:** Campos adicionais para personalização da simulação.
    *   **Memória de Cálculo (Tabela):** Tabela com estilo de relatório, headers fixos, fonte *JetBrains Mono*.
    *   **Botão:** `REAUDITAR` (Botão secundário).

### [Seções de Recursos Complementares]
*   **Layout:** Alternando fundos Preto Profundo e Cinza Grafite.
*   **Conteúdo:** Títulos claros (H2), descrições e botões de ação (Laranja Vibrante) para `VÍDEO EXPLICATIVO`, `GERAR RELATÓRIO EM PDF`, `MATERIAL COMPLEMENTAR`, `PERGUNTAS FREQUENTES` e `FONTES E METODOLOGIA`.

---

## 4. Mockup Visual Detalhado (Mobile)

*   **Header:** Logo `.renatto` centralizada, com um ícone de menu hambúrguer à direita para navegação. Fundo Preto Profundo.
*   **Hero:** Título `LANCE EMBUTIDO: VALE A PENA NO SEU CASO?` adaptado para quebrar em 3-4 linhas, mantendo o impacto visual. Subtítulo abaixo.
*   **Introdução Concisa:** Parágrafo adaptado para rolagem vertical.
*   **Sua Auditoria Começa Aqui:**
    *   **Formulário:** Campos de entrada empilhados verticalmente, ocupando 100% da largura disponível.
    *   **Botão `AUDITAR MEU LANCE`:** Fixo na parte inferior da tela (sticky footer) enquanto o formulário estiver visível, para fácil acesso e usabilidade.
*   **Relatório de Auditoria:**
    *   **KPIs Humanizados:** Os blocos de descoberta serão empilhados verticalmente, um abaixo do outro, com o valor em destaque e a descrição abaixo. O `TAXA SOBRE CAPITAL NOVO EFETIVO` mantém seu destaque visual.
    *   **Diagnóstico Narrativo:** O bloco de diagnóstico mantém seu destaque, com o status (🟢/🟠/🔴) e a narrativa adaptados para a largura da tela, com quebras de linha inteligentes para manter a legibilidade.
*   **Entenda o Lance Embutido e Auditoria Detalhada:** Conteúdo adaptado para rolagem vertical, com tabelas responsivas (rolagem horizontal interna ou colunas ocultáveis).
*   **Recursos Complementares:** Seções empilhadas verticalmente, com botões e cards adaptados para o toque.

---

## 5. Exemplos de Componentes e Estilo

*   **KPI Card (Exemplo - Crédito Líquido Disponível):**
    ```html
    <div class="kpi-card kpi-green">
      <span class="kpi-label">CRÉDITO LÍQUIDO DISPONÍVEL</span>
      <span class="kpi-value">R$ 350.000,00</span>
      <span class="kpi-description">O valor real que você terá para usar.</span>
    </div>
    ```
    *   *Estilo:* Fundo Cinza Grafite, borda esquerda de 4px em Verde Investigativo. `kpi-value` em *JetBrains Mono Extra Bold*, Verde Investigativo. `kpi-label` e `kpi-description` em *Inter Regular*, off-white.

*   **Botão de Ação (Exemplo - Primário):**
    ```html
    <button class="btn btn-primary">AUDITAR MEU LANCE</button>
    ```
    *   *Estilo:* Fundo `#F26A21`, texto `#0D0D0D`, fonte *Inter Extra Bold*, cantos levemente arredondados (8px), sem sombra. Ícone de lupa ou seta para a direita à esquerda do texto.

*   **Diagnóstico (Exemplo - Atenção):**
    ```html
    <div class="diagnostic-block diagnostic-attention">
      <h3 class="diagnostic-title">SEU DIAGNÓSTICO: A ANÁLISE DO CONSÓRCIO DE VERDADE</h3>
      <div class="diagnostic-status-line">
        <span class="status-icon">🟠</span>
        <span class="status-text">ATENÇÃO</span>
      </div>
      <p class="diagnostic-narrative">
        O lance embutido **aumentou sua força de contemplação**, porém **reduziu significativamente o valor disponível para utilização**. Economicamente, isso significa que a <strong>Taxa sobre Capital Novo Efetivo</strong> ficou em <strong>32,00%</strong>, indicando um custo elevado para o dinheiro que efetivamente entra no seu bolso. Avalie se a agilidade na contemplação compensa este custo.
      </p>
    </div>
    ```
    *   *Estilo:* Fundo Cinza Grafite com um gradiente sutil de laranja. Borda esquerda de 8px em Laranja Vibrante. `diagnostic-title` em branco, `status-text` em Laranja Vibrante. `diagnostic-narrative` em off-white, com palavras-chave em negrito e a `Taxa sobre Capital Novo Efetivo` em *JetBrains Mono* negrito.

---

Este refinamento final busca criar uma experiência imersiva de auditoria e descoberta, onde cada elemento visual e textual contribui para a narrativa de transparência e inteligência que o Consórcio de Verdade se propõe a oferecer. A página não será uma mera calculadora, mas um **relatório investigativo personalizado** que empodera o usuário com informações claras e acionáveis.
