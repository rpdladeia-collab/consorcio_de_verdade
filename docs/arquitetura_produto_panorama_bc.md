# Arquitetura de Produto: Panorama BC

**Versão:** 1.0  
**Data:** Julho 2026  
**Escopo:** Definição da estrutura futura do Panorama BC e suas três áreas estratégicas

---

## 1. Visão Geral da Estrutura Futura

O **Panorama BC** evoluirá de um painel editorial estático para um **ecossistema analítico integrado** com três áreas interdependentes:

| Área | Propósito | Tipo de Usuário |
|------|----------|-----------------|
| **Mercado em Números** (Data Lab) | Exploração autônoma de dados com inteligência analítica automática | Analistas, pesquisadores, curiosos |
| **Inteligência do Mercado** | Análises contextualizadas e narrativas editoriais sobre tendências | Executivos, tomadores de decisão |
| **Consórcio pelo Brasil** | Análise geográfica e segmentada por região/estado | Gestores de operações, vendas |

Todas as três áreas compartilham:
- **Fonte de dados única:** 125 métricas do Banco Central (2016-2026)
- **Motor analítico centralizado:** Cálculos, tendências, comparativos, pontos de atenção
- **Identidade visual coerente:** Tema escuro, tipografia refinada, paleta de cores consistente

---

## 2. Posicionamento do Motor Analítico

### 2.1 O Motor Analítico como Infraestrutura Compartilhada

O **Motor Analítico** é a camada de processamento que alimenta todas as três áreas. Ele não é uma página ou um dashboard, mas uma **infraestrutura de cálculos e insights** acessível via tRPC.

```
┌─────────────────────────────────────────────────────────────┐
│                    PANORAMA BC                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│  │ Mercado em       │  │ Inteligência do  │  │ Consórcio    │
│  │ Números          │  │ Mercado          │  │ pelo Brasil  │
│  │ (Data Lab)       │  │ (Narrativas)     │  │ (Geo)        │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────┘
│           │                     │                     │
│           └─────────────────────┼─────────────────────┘
│                                 │
│                    ┌────────────▼────────────┐
│                    │   MOTOR ANALÍTICO       │
│                    │ (Cálculos, Tendências, │
│                    │  Comparativos, Insights)│
│                    └────────────┬────────────┘
│                                 │
│                    ┌────────────▼────────────┐
│                    │  BANCO DE DADOS MySQL   │
│                    │ (125 métricas, 1.250+  │
│                    │  registros históricos)  │
│                    └─────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Funcionalidades do Motor Analítico

O motor é capaz de:

| Funcionalidade | Descrição |
|---|---|
| **Cálculos Dinâmicos** | Crescimento (mensal, anual, acumulado), CAGR, variação, participação percentual, médias, máximos, mínimos |
| **Análise de Tendências** | Médias móveis (3, 6, 12, 24, 36 meses), regressão linear, comparação com média histórica |
| **Pontos de Atenção** | Identificação automática de picos, vales, quebras de tendência, eventos extremos |
| **Comparativos** | Entre métricas, segmentos, períodos, com sugestões contextuais |
| **Geração de Insights** | Resumos textuais automáticos, análises estatísticas, contextualizações |
| **Volatilidade e Risco** | Medidas de estabilidade, previsibilidade, correlações |

---

## 3. Organização das 125 Métricas

### 3.1 Estrutura Hierárquica

As 125 métricas estão organizadas em **19 grupos** (conforme classificação do Banco Central):

```
Panorama BC
├── Grupo 01: Cotas e Estoque
│   ├── Cotas Comercializadas
│   ├── Cotas Ativas
│   ├── Cotas Excluídas
│   └── ... (outras métricas do grupo)
│
├── Grupo 02: Contemplações
│   ├── Contemplações por Lance
│   ├── Contemplações por Sorteio
│   ├── Taxa de Contemplação
│   └── ...
│
├── Grupo 03: Segmentos
│   ├── Imóveis
│   ├── Automóveis
│   ├── Motocicletas
│   └── Outros Bens e Serviços
│
├── Grupo 04-19: ... (demais grupos)
│
└── Meta-Métricas
    ├── Índice de Exclusão
    ├── Taxa de Permanência
    ├── Ticket Médio
    └── ...
```

### 3.2 Acesso às Métricas em Cada Área

| Área | Acesso às Métricas | Modo de Exploração |
|---|---|---|
| **Mercado em Números** | Todas as 125 métricas | Livre, autônomo, com sugestões automáticas |
| **Inteligência do Mercado** | Subset curado (30-40 principais) | Guiado por narrativas editoriais |
| **Consórcio pelo Brasil** | Métricas segmentadas por região | Filtrado por estado/região |

---

## 4. Blocos Analíticos

O Motor Analítico entrega seus resultados organizados em **blocos temáticos**:

### 4.1 Bloco de Seleção e Filtro
- Seletor de métrica(s)
- Seletor de período (últimos 12m, 5a, 10a, histórico completo, personalizado)
- Seletor de segmento (quando aplicável)
- Seletor de tipo de visualização (linha, barras, área, tabela)

### 4.2 Bloco de Visualização Principal
- Gráfico interativo com a série histórica
- Linhas de tendência (opcional)
- Pontos de atenção destacados
- Legenda e tooltips

### 4.3 Bloco de Análise Rápida (KPIs)
- Crescimento acumulado (%)
- CAGR (%)
- Tendência dos últimos 12 meses
- Volatilidade (desvio padrão)
- Posição histórica do valor atual

### 4.4 Bloco de Insights Automáticos
- Resumo textual da série
- Eventos marcantes identificados
- Comparações com períodos anteriores
- Alertas de anomalias

### 4.5 Bloco de Comparativos Sugeridos
- Comparação com média histórica
- Comparação com segmentos similares
- Comparação com períodos equivalentes
- Sugestões de cruzamentos relevantes

### 4.6 Bloco de Dados Brutos
- Tabela com valores mensais/anuais
- Opção de exportar (CSV, PDF)
- Filtros e ordenação

---

## 5. Jornada do Usuário dentro do Panorama BC

### 5.1 Cenário 1: Explorador (Mercado em Números)

```
1. Usuário acessa Panorama BC
   ↓
2. Vê três opções: "Mercado em Números", "Inteligência do Mercado", "Consórcio pelo Brasil"
   ↓
3. Clica em "Mercado em Números" (Data Lab)
   ↓
4. Vê interface de exploração com:
   - Seletor de métrica (dropdown com 125 opções, agrupadas por grupo)
   - Seletor de período (5 opções pré-definidas)
   - Seletor de visualização (4 tipos de gráfico)
   ↓
5. Seleciona "Cotas Ativas" + "Últimos 10 anos" + "Gráfico de Linha"
   ↓
6. Motor Analítico retorna:
   - Gráfico interativo
   - KPIs (crescimento, CAGR, tendência)
   - Insights automáticos
   - Comparativos sugeridos
   ↓
7. Usuário clica em "Comparar com Segmentos"
   ↓
8. Interface expande para mostrar comparação (Imóveis vs Automóveis vs Motocicletas)
   ↓
9. Usuário exporta os dados em CSV
```

### 5.2 Cenário 2: Executivo (Inteligência do Mercado)

```
1. Usuário acessa Panorama BC
   ↓
2. Clica em "Inteligência do Mercado"
   ↓
3. Vê uma série de **artigos/narrativas** editoriais, cada um focado em um tema:
   - "O Mercado de Imóveis em 2026: Recuperação ou Estagnação?"
   - "Contemplações por Lance: Por que o Sorteio Perdeu Espaço?"
   - "Exclusão: O Problema Silencioso do Consórcio Brasileiro"
   ↓
4. Clica em um artigo
   ↓
5. Vê a narrativa editorial + gráficos/dados que a fundamentam
   ↓
6. Cada gráfico é interativo e alimentado pelo Motor Analítico
   ↓
7. Usuário pode "Aprofundar" clicando em um gráfico
   ↓
8. Vai para o Mercado em Números com a métrica pré-selecionada
```

### 5.3 Cenário 3: Gestor Regional (Consórcio pelo Brasil)

```
1. Usuário acessa Panorama BC
   ↓
2. Clica em "Consórcio pelo Brasil"
   ↓
3. Vê um mapa do Brasil com cores representando desempenho por estado
   ↓
4. Clica em um estado (ex: São Paulo)
   ↓
5. Vê métricas específicas para SP:
   - Cotas ativas
   - Contemplações
   - Exclusão
   - Comparação com média nacional
   ↓
6. Clica em "Detalhar Cotas Ativas em SP"
   ↓
7. Vai para Mercado em Números com filtro de região pré-aplicado
```

---

## 6. Navegação entre Áreas

### 6.1 Estrutura de Navegação Principal

```
┌─────────────────────────────────────────────────────────────┐
│ PANORAMA BC (Menu Principal)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Mercado em Números]  [Inteligência do Mercado]  [Consórcio pelo Brasil]
│
│  ┌─────────────────────────────────────────────────────────┐
│  │ Mercado em Números (Data Lab)                           │
│  ├─────────────────────────────────────────────────────────┤
│  │ • Explorador de Dados                                   │
│  │ • Seletores (Métrica, Período, Visualização)           │
│  │ • Gráficos Interativos                                  │
│  │ • KPIs e Insights                                       │
│  │ • Comparativos                                          │
│  │ • Exportação                                            │
│  └─────────────────────────────────────────────────────────┘
│
│  ┌─────────────────────────────────────────────────────────┐
│  │ Inteligência do Mercado                                 │
│  ├─────────────────────────────────────────────────────────┤
│  │ • Artigos/Narrativas Editoriais                         │
│  │ • Cada artigo tem gráficos interativos                  │
│  │ • Links para "Aprofundar" → Mercado em Números         │
│  │ • Temas curados (30-40 principais)                      │
│  └─────────────────────────────────────────────────────────┘
│
│  ┌─────────────────────────────────────────────────────────┐
│  │ Consórcio pelo Brasil                                   │
│  ├─────────────────────────────────────────────────────────┤
│  │ • Mapa do Brasil                                        │
│  │ • Seleção de Estado/Região                              │
│  │ • Métricas Regionalizadas                               │
│  │ • Links para "Detalhar" → Mercado em Números           │
│  └─────────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Fluxos de Navegação Cruzada

| De | Para | Acionador |
|---|---|---|
| Mercado em Números | Inteligência do Mercado | Botão "Ler Análise" (quando houver artigo sobre a métrica) |
| Inteligência do Mercado | Mercado em Números | Link "Aprofundar" em cada gráfico |
| Consórcio pelo Brasil | Mercado em Números | Link "Detalhar" em cada métrica regional |
| Qualquer área | Panorama (original) | Link "Voltar para Dados Oficiais" |

---

## 7. Componentes do Site Atual que Serão Reaproveitados

### 7.1 Componentes Visuais

| Componente | Localização Atual | Reaproveitamento |
|---|---|---|
| **Header/Footer** | Home, Simuladores, Panorama | Mantém-se idêntico em todas as áreas do Panorama BC |
| **Paleta de Cores** | Panorama (laranja #c2410c, terra, olive) | Estende-se para todas as três áreas |
| **Tipografia** | Panorama (Inter, fontes serif para títulos) | Mantém-se consistente |
| **Grid de Layout** | Panorama (max-w-5xl, espaçamento) | Reutiliza-se em Mercado em Números e Inteligência do Mercado |
| **Componentes Recharts** | Panorama (gráficos de barras, linhas) | Expande-se para incluir área, composição, scatter |
| **Tabelas** | Panorama (formatação de dados) | Reutiliza-se em Mercado em Números |
| **KPI Cards** | Panorama (cards com números) | Reutiliza-se em Mercado em Números |
| **Botões e Controles** | Panorama (buttons, selects, dropdowns) | Reutiliza-se em todas as áreas |
| **Dividers e Separadores** | Panorama (linhas, espaçamento) | Reutiliza-se |
| **Modais/Drawers** | Simuladores | Pode ser reaproveitado para filtros avançados |

### 7.2 Componentes de Lógica

| Componente | Localização Atual | Reaproveitamento |
|---|---|---|
| **Sistema de Roteamento** | App.tsx | Estende-se para as três áreas |
| **Autenticação (se necessária)** | Não existe atualmente | Pode ser adicionado se necessário |
| **Análise de Google Analytics** | Home, Simuladores | Estende-se para Panorama BC |
| **Responsividade Mobile** | Panorama | Mantém-se em todas as áreas |
| **Scroll Suave** | Panorama | Reutiliza-se |
| **Sticky Navigation** | Panorama | Reutiliza-se em Mercado em Números |

### 7.3 Componentes de Backend

| Componente | Localização Atual | Reaproveitamento |
|---|---|---|
| **Conexão MySQL** | Não existe (dados mockados) | Será usada para Panorama BC |
| **tRPC Routers** | Não existe | Será criado para Motor Analítico |
| **Drizzle ORM** | Não existe | Será usado para queries ao banco |
| **Autenticação OAuth** | Não existe | Pode ser adicionado se necessário |

---

## 8. Estrutura de Dados no Backend

### 8.1 Tabelas Principais (já existentes)

```sql
-- Metadados das métricas
panorama_metadata
├── id (PK)
├── metric_code (unique)
├── metric_name
├── metric_group
├── metric_description
├── unit
├── data_type
└── created_at

-- Valores históricos das métricas
panorama_metrics
├── id (PK)
├── metric_id (FK → panorama_metadata)
├── date (YYYY-MM)
├── value
├── segment (opcional)
├── region (opcional)
└── created_at
```

### 8.2 Tabelas Futuras (para suportar as três áreas)

```sql
-- Artigos/Narrativas editoriais (Inteligência do Mercado)
editorial_articles
├── id (PK)
├── title
├── slug
├── content
├── featured_metrics (JSON array)
├── published_at
└── author

-- Configurações regionais (Consórcio pelo Brasil)
regional_data
├── id (PK)
├── state_code
├── state_name
├── region
├── metrics_aggregation (JSON)
└── updated_at
```

---

## 9. Fluxo de Dados (Arquitetura Técnica de Alto Nível)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mercado em Números    Inteligência do Mercado   Consórcio  │
│  (Data Lab)            (Narrativas)              pelo Brasil│
│         │                      │                      │     │
│         └──────────────────────┼──────────────────────┘     │
│                                │                            │
│                    ┌───────────▼────────────┐               │
│                    │   tRPC Client          │               │
│                    │ (trpc.*.useQuery)      │               │
│                    └───────────┬────────────┘               │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ tRPC Server (Express)  │
                    │ /api/trpc/*            │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Motor Analítico        │
                    │ (TypeScript)           │
                    │ • Cálculos             │
                    │ • Tendências           │
                    │ • Comparativos         │
                    │ • Insights             │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Drizzle ORM            │
                    │ (Query Builder)        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ MySQL (Railway)        │
                    │ • panorama_metadata    │
                    │ • panorama_metrics     │
                    │ • editorial_articles   │
                    │ • regional_data        │
                    └────────────────────────┘
```

---

## 10. Considerações de UX/Design

### 10.1 Princípios de Design

- **Minimalismo:** Apenas o essencial é exibido
- **Sofisticação:** Tema escuro, tipografia refinada, espaçamento generoso
- **Clareza:** Cada métrica, gráfico e insight é autoexplicativo
- **Interatividade:** Usuário pode explorar livremente sem limitações
- **Responsividade:** Funciona perfeitamente em mobile, tablet e desktop

### 10.2 Padrões de Interação

| Padrão | Descrição |
|---|---|
| **Seleção em Cascata** | Seleciona métrica → período → visualização |
| **Hover Inteligente** | Tooltips mostram valores exatos ao passar o mouse |
| **Clique para Aprofundar** | Clica em um gráfico para explorar mais |
| **Sugestões Contextuais** | "Você também pode comparar com..." |
| **Exportação Simples** | Um clique para CSV/PDF |

---

## 11. Roadmap de Implementação

### Fase 1: Mercado em Números (Data Lab)
- Implementar interface de seleção
- Conectar ao Motor Analítico
- Exibir gráficos e KPIs
- Adicionar comparativos

### Fase 2: Inteligência do Mercado
- Criar estrutura de artigos editoriais
- Escrever 10-15 artigos iniciais
- Integrar gráficos interativos
- Links para Mercado em Números

### Fase 3: Consórcio pelo Brasil
- Implementar mapa interativo
- Regionalizar dados
- Criar filtros por estado/região
- Links para Mercado em Números

### Fase 4: Refinamentos
- Otimizações de performance
- Melhorias visuais
- Testes de usabilidade
- Feedback do usuário

---

## 12. Conclusão

O **Panorama BC** evoluirá para um ecossistema analítico coeso onde:

1. **Mercado em Números** oferece exploração livre e autônoma
2. **Inteligência do Mercado** oferece narrativas editoriais contextualizadas
3. **Consórcio pelo Brasil** oferece análise geográfica e regional

Todas as três áreas compartilham:
- Uma fonte de dados única (125 métricas do BC)
- Um motor analítico centralizado
- Uma identidade visual coerente
- Uma experiência de usuário integrada

A arquitetura foi projetada para ser **escalável, modular e reutilizável**, permitindo que novas funcionalidades sejam adicionadas sem comprometer a estrutura existente.
