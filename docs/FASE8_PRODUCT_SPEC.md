# Product Spec — Panorama > Administradoras (V1)

**Projeto:** Consórcio de Verdade — Panorama:BC  
**Fase:** 8 — Modelagem Funcional  
**Data:** 22 de julho de 2026  
**Status:** Aguardando aprovação  

---

## 1. Visão do Produto

O Panorama > Administradoras é um **raio-X investigativo** do mercado de consórcios brasileiro. Não é um portal de dados do Banco Central. Não é um comparador tradicional. É uma ferramenta que transforma os dados oficiais publicados pelo BC em inteligência acionável para o consumidor, respondendo perguntas que o mercado normalmente não explica.

O produto opera sob um princípio fundamental: **sempre que existir dúvida entre mostrar mais dados ou entregar mais valor ao usuário, escolha entregar mais valor**.

### Posicionamento no Site

A nova seção será acessível dentro do Panorama:BC, ao lado direito do menu "Panorama:Oficial" existente. O usuário verá duas opções de navegação no menu principal do Panorama:BC:

| Menu | Conteúdo |
|---|---|
| Panorama:Oficial | Seção já existente com dados oficiais do BC |
| **Panorama:Administradoras** | Nova seção — raio-X investigativo por administradora |

---

## 2. Regra 80/20

A V1 entrega o maior valor possível com a menor complexidade possível. As três funcionalidades proibidas na V1 são: dashboards complexos, dezenas de filtros e rankings desnecessários. O foco absoluto é a jornada de consulta: administradora → segmentos → grupos, com comparativos de mercado e histórico de 24 meses.

### Fora de Escopo da V1

- Módulo "Panorama do Mercado" (classificação e comparação entre categorias de instituições) — fase posterior
- Mapas geográficos por UF
- Alertas e notificações
- Exportação de relatórios
- Login obrigatório (a consulta será pública)

---

## 3. Fonte de Dados e Arquitetura

### Fonte Única

A única fonte de dados é o Banco Central do Brasil. Nenhuma informação é buscada fora do BC. Os dados já estão importados no banco do projeto na tabela `bc_dados_linha` com 231.948 linhas individuais, cobrindo o período de julho/2024 a maio/2026.

### Bases Oficiais Utilizadas

| Base | Tipo | Periodicidade | Período Disponível |
|---|---|---|---|
| Consolidados — Segmentos | `segmentos_consolidados` | Mensal | jul/2024 a mai/2026 (23 meses) |
| Consolidados — Bens Imóveis (Grupos) | `bens_imoveis_grupos` | Mensal | jul/2024 a mai/2026 (23 meses) |
| Consolidados — Bens Móveis (Grupos) | `bens_moveis_grupos` | Trimestral | set/2024 a mar/2026 (7 trimestres) |
| Dados por UF | `dados_uf` | Trimestral | set/2024 a mar/2026 (7 trimestres) |

### Mapeamento de Segmentos (Dicionário Oficial do BC)

O sistema trabalha internamente com os códigos numéricos oficiais e apresenta apenas nomes amigáveis ao usuário. O mapeamento é extraído diretamente do dicionário oficial do BC:

| Código Interno | Descrição Oficial do BC | Nome Amigável |
|---|---|---|
| 1 | Bens imóveis | Imóveis |
| 2 | Tratores, equipamentos rodoviários, máquinas agrícolas, embarcações, aeronaves e veículos automotores de carga e transporte coletivo | Pesados |
| 3 | Veículos automotores não incluídos no segmento 2 | Automóveis |
| 4 | Motocicletas e motonetas | Motocicletas |
| 5 | Outros bens móveis duráveis | Outros |
| 6 | Serviços turísticos | Serviços |

### Classificação de Administradoras (Ativo Próprio do Projeto)

O Banco Central não classifica as administradoras por tipo. O Consórcio de Verdade mantém sua própria classificação, criada manualmente a partir da análise dos 143 nomes oficiais publicados pelo BC. Esta classificação é um ativo do projeto e poderá ser ampliada conforme surjam novas administradoras.

| Categoria | Quantidade | Critério de Classificação |
|---|---|---|
| Banco | 7 | Instituições cujo negócio principal é bancário |
| Cooperativa | 7 | Instituições de natureza cooperativa |
| Administradora Independente | 128 | Demais instituições (adms puras, fabricantes, seguradoras, associações) |
| **Total** | **143** | |

A classificação completa está documentada no arquivo `docs/fase8-classificacao-administradoras.md`.

---

## 4. Jornada do Usuário

A navegação segue uma lógica de três camadas, do macro para o micro:

```
CAMADA 1: Raio-X da Administradora
    ↓
CAMADA 2: Segmentos da Administradora
    ↓
CAMADA 3: Grupos do Segmento
```

### Ponto de Entrada — Seleção da Administradora

O usuário acessa a seção Panorama:Administradoras e encontra:

1. **Campo de busca por nome** — digita o nome da administradora (ex: "Itaú", "Embracon", "Porto Seguro")
2. **Select com todas as administradoras** — lista em ordem alfabética com as 143 instituições

Ao selecionar uma administradora, o sistema carrega a Camada 1.

---

## 5. Camada 1 — Raio-X da Administradora

Esta é a tela principal do produto. Ao selecionar uma administradora, o usuário vê um raio-X completo de sua operação.

### 5.1 Dados Gerais

| Indicador | Descrição | Fonte |
|---|---|---|
| Nome da administradora | Nome oficial publicado pelo BC | Todas as bases |
| Categoria da instituição | Banco, Administradora Independente ou Cooperativa | Classificação própria do projeto |
| Total de grupos ativos | Soma de grupos ativos no mês mais recente | `segmentos_consolidados` → `Quantidade_de_grupos_ativos` |
| Total de grupos encerrados | Soma de grupos encerrados no mês mais recente | `segmentos_consolidados` → `Quantidade_de_grupos_encerrados_no_mês` (acumulado) |
| Total de segmentos em operação | Contagem de segmentos distintos com grupos ativos | `segmentos_consolidados` → distinct `Código_do_segmento` |
| Participação percentual dos segmentos | Distribuição percentual de grupos ativos por segmento | Calculado a partir de `Quantidade_de_grupos_ativos` por segmento |

### 5.2 Distribuição dos Segmentos

Apresenta a composição da operação da administradora por segmento, usando os nomes amigáveis:

| Segmento | Grupos Ativos | Participação na Adm | Participação no Mercado |
|---|---|---|---|
| Automóveis | X | X% | X% |
| Imóveis | X | X% | X% |
| Pesados | X | X% | X% |
| Motocicletas | X | X% | X% |
| Serviços | X | X% | X% |
| Outros | X | X% | X% |

A "Participação na Adm" mostra qual percentual dos grupos daquela administradora pertence a cada segmento. A "Participação no Mercado" mostra qual percentual do mercado total daquele segmento pertence a esta administradora — ambos calculados a partir dos dados oficiais.

### 5.3 Raio-X Operacional

Apresenta os indicadores operacionais da administradora no mês mais recente disponível:

| Indicador | Campo Original do BC | Fonte |
|---|---|---|
| Total de cotas ativas | `Quantidade_de_cotas_ativas_em_dia` | `segmentos_consolidados` |
| Cotas não contempladas | `Quantidade_de_cotas_ativas_não_contempladas` | `segmentos_consolidados` |
| Contemplações acumuladas | `Quantidade_acumulada_de_cotas_ativas_contempladas` | `segmentos_consolidados` |
| Contemplações no mês | `Quantidade_de_cotas_ativas_contempladas_no_mês` | `segmentos_consolidados` |
| Cotas excluídas | `Quantidade_de_cotas_excluídas` | `segmentos_consolidados` |
| Cotas comercializadas no mês | `Quantidade_de_cotas_comercializadas_no_mês` | `segmentos_consolidados` |
| Créditos pendentes de utilização | `Quantidade_de_cotas_ativas_com_crédito_pendente_de_utilização` | `segmentos_consolidados` |

**Observação sobre contemplações por lance vs. sorteio:** A base `segmentos_consolidados` não separa contemplações por tipo (lance/sorteio). Esta separação está disponível apenas na base `dados_uf` (trimestral), nos campos `Quantidade_de_consorciados_ativos_contemplados_por_lance` e `Quantidade_de_consorciados_ativos_contemplados_por_sorteio`. Na V1, estes indicadores serão apresentados na granularidade trimestral quando disponíveis, com indicação clara do período de referência.

### 5.4 Comparativos com o Mercado

Esta é uma das funcionalidades mais importantes da V1. Cada indicador relevante da administradora é comparado com a média do mercado (calculada sobre todas as 143 administradoras) para o mesmo período.

#### Estrutura de Apresentação

Para cada indicador comparado, o sistema apresenta três valores:

| Elemento | Descrição |
|---|---|
| **Mercado** | Média calculada sobre todas as administradoras para o mesmo segmento e período |
| **Administradora** | Valor da administradora selecionada |
| **Veredito** | ACIMA DA MÉDIA / DENTRO DA MÉDIA / ABAIXO DA MÉDIA |

#### Indicadores Comparados na V1

| Indicador | Cálculo do Comparativo |
|---|---|
| Taxa de administração | Média ponderada por cotas ativas do segmento |
| Taxa de exclusão | (Cotas excluídas / Cotas ativas) × 100 |
| Taxa de contemplação | (Contemplações no mês / Cotas ativas) × 100 |
| Percentual de inadimplência | (Cotas inadimplentes / Cotas ativas) × 100 |

#### Regras de Veredito

| Condição | Veredito | Cor |
|---|---|---|
| Valor da adm > média × 1,10 | ACIMA DA MÉDIA | Vermelho (indicador negativo) ou Verde (indicador positivo) |
| Valor da adm < média × 0,90 | ABAIXO DA MÉDIA | Verde (indicador negativo) ou Vermelho (indicador positivo) |
| Valor entre média × 0,90 e média × 1,10 | DENTRO DA MÉDIA | Cinza neutro |

A interpretação de "acima" como positivo ou negativo depende do indicador:

| Indicador | "Acima da média" é... |
|---|---|
| Taxa de administração | Negativo (mais caro para o consorciado) |
| Taxa de exclusão | Negativo (mais exclusões) |
| Taxa de contemplação | Positivo (mais contemplações) |
| Inadimplência | Negativo (mais inadimplência) |

### 5.5 Histórico dos Últimos 24 Meses

Apresenta a evolução temporal dos principais indicadores operacionais. Como o banco possui dados de julho/2024 a maio/2026 (23 meses), o histórico mostrará todos os meses disponíveis.

#### Indicadores com Evolução Temporal

| Indicador | Granularidade | Visualização |
|---|---|---|
| Contemplações no mês | Mensal | Gráfico de linha |
| Exclusões no mês | Mensal | Gráfico de linha |
| Cotas comercializadas no mês | Mensal | Gráfico de linha |
| Grupos ativos | Mensal | Gráfico de linha |
| Cotas não contempladas | Mensal | Gráfico de área |
| Taxa de administração média | Mensal | Gráfico de linha |

Cada gráfico de evolução deve incluir uma linha de referência representando a média do mercado no mesmo período, permitindo ao usuário visualizar se a administradora está acima ou abaixo do mercado ao longo do tempo.

---

## 6. Camada 2 — Segmentos da Administradora

Dentro da administradora selecionada, o usuário vê todos os segmentos em operação com seus respectivos números de grupos ativos.

### Apresentação

| Segmento | Grupos Ativos | Participação na Adm |
|---|---|---|
| Automóveis (55 grupos) | 55 | 58% |
| Imóveis (18 grupos) | 18 | 19% |
| Serviços (12 grupos) | 12 | 13% |
| Pesados (8 grupos) | 8 | 8% |
| Motocicletas (5 grupos) | 5 | 5% |

Ao clicar em um segmento, o sistema abre a Camada 3 (Grupos).

### Indicadores por Segmento

Para cada segmento, além do número de grupos, o sistema apresenta:

| Indicador | Descrição |
|---|---|
| Total de cotas ativas no segmento | Soma de cotas ativas de todos os grupos do segmento |
| Taxa média de administração | Média ponderada das taxas dos grupos do segmento |
| Participação do segmento na operação total da adm | Cotas do segmento / total de cotas da adm |

---

## 7. Camada 3 — Grupos do Segmento

### Ponto de Entrada

**Não apresentar uma lista gigante de grupos inicialmente.** Priorizar a busca.

O usuário encontra:

1. **Campo de busca por número do grupo** — digita o código do grupo (ex: "00057")
2. **Lista paginada de grupos** — apenas após o usuário solicitar explicitamente "ver todos os grupos"

### Raio-X do Grupo

Ao selecionar um grupo, o sistema apresenta:

#### Dados do Grupo

| Indicador | Campo Original do BC | Fonte |
|---|---|---|
| Código do grupo | `Código_do_grupo` | `bens_imoveis_grupos` / `bens_moveis_grupos` |
| Segmento | `Código_do_segmento` (mapeado para nome amigável) | Mesma |
| Taxa de administração | `Taxa_de_administração` | Mesma |
| Prazo do grupo (meses) | `Prazo_do_grupo_em_meses` | Mesma |
| Índice de correção | `Índice_de_correção` | Mesma |
| Valor médio do bem | `Valor_médio_do_bem` | Mesma |
| Cotas ativas em dia | `Quantidade_de_cotas_ativas_em_dia` | Mesma |
| Cotas contempladas no mês | `Quantidade_de_cotas_ativas_contempladas_no_mês` | Mesma |
| Cotas não contempladas | `Quantidade_de_cotas_ativas_não_contempladas_inadimplentes` | Mesma |
| Cotas excluídas | `Quantidade_de_cotas_excluídas` | Mesma |
| Cotas quitadas | `Quantidade_de_cotas_ativas_quitadas` | Mesma |
| Créditos pendentes de utilização | `Quantidade_de_cotas_ativas_com_crédito_pendente_de_utilização` | Mesma |

#### Participação do Grupo

| Indicador | Cálculo |
|---|---|
| Participação do grupo no segmento | Cotas do grupo / total de cotas do segmento |
| Participação do grupo na administradora | Cotas do grupo / total de cotas da administradora |

#### Termômetros de Mercado

Cada grupo recebe comparativos simples com a média do mercado para o mesmo segmento:

| Indicador | Veredito Possível |
|---|---|
| Taxa de administração | Acima da média / Dentro da média / Abaixo da média |
| Exclusões | Acima da média / Dentro da média / Abaixo da média |
| Contemplações | Acima da média / Dentro da média / Abaixo da média |

#### Histórico do Grupo (24 meses)

Evolução dos principais indicadores do grupo ao longo do tempo, com a mesma estrutura da Camada 1 (gráfico de linha com linha de referência do mercado).

---

## 8. Cálculos de Mercado

### Princípio

A "média do mercado" é sempre calculada sobre todas as 143 administradoras para o mesmo segmento e período. O cálculo é **ponderado pelo volume de cotas ativas** de cada administradora, garantindo que administradoras maiores tenham peso proporcional ao seu tamanho.

### Fórmulas

#### Taxa Média de Administração do Mercado (por segmento)

```
TaxaMédia_mercado = Σ(TaxaAdm × CotasAtivas) / Σ(CotasAtivas)
```

Onde a soma percorre todas as administradoras que operam no segmento naquele período.

#### Taxa de Exclusão

```
TaxaExclusão = (CotasExcluídas / CotasAtivas) × 100
```

Calculada individualmente para cada administradora e para o mercado (soma agregada).

#### Taxa de Contemplação

```
TaxaContemplação = (ContemplaçõesNoMês / CotasAtivas) × 100
```

#### Taxa de Inadimplência

```
TaxaInadimplência = (CotasInadimplentes / CotasAtivas) × 100
```

Onde `CotasInadimplentes` = `Quantidade_de_cotas_ativas_contempladas_inadimplentes` + `Quantidade_de_cotas_ativas_não_contempladas_inadimplentes`.

### Escopo Temporal

Todos os comparativos da Camada 1 utilizam o **mês mais recente disponível** como referência. Os comparativos da Camada 3 (grupos) utilizam o mês mais recente em que o grupo possui dados (alguns grupos podem ter sido encerrados e não aparecer em meses recentes).

---

## 9. Perguntas que o Produto Responde

O produto foi desenhado para responder perguntas que o consumidor normalmente não consegue responder ao contratar um consórcio:

| Pergunta | Onde é Respondida |
|---|---|
| Estou entrando em uma grande operação ou em uma pequena operação? | Camada 1 — Dados Gerais (total de grupos, cotas) |
| Esta administradora opera bem este segmento? | Camada 2 — Indicadores por segmento + comparativo |
| Existem muitos cotistas aguardando contemplação? | Camada 1 — Raio-X Operacional (cotas não contempladas) |
| O sorteio possui relevância operacional? | Camada 1 — Contemplações por sorteio vs. lance (dados_uf) |
| Esta taxa está acima da média do mercado? | Camada 1 — Comparativos com o mercado |
| Este grupo possui muitas exclusões? | Camada 3 — Raio-X do grupo + termômetro |
| Como esta administradora se comportou nos últimos 24 meses? | Camada 1 — Histórico |
| Este segmento é relevante para esta administradora? | Camada 1 — Distribuição dos segmentos |
| O que os dados oficiais do BC revelam sobre esta operação? | Todas as camadas — síntese investigativa |

---

## 10. Estrutura de Dados Necessária

### Tabelas Existentes (já no banco)

| Tabela | Uso no Produto |
|---|---|
| `bc_dados_linha` | Tabela principal — todas as consultas |
| `bc_importacoes` | Auditoria — verificar data da última atualização |
| `bc_arquivos` | Auditoria — verificar arquivos processados |

### Nova Tabela: `cd_classificacao_administradoras`

Tabela de classificação própria do projeto (não do BC). Deve ser criada na fase de implementação.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | int (PK) | Identificador |
| `cnpj_administradora` | varchar(8) | CNPJ raiz da administradora (chave de cruzamento) |
| `nome_administradora` | varchar(255) | Nome oficial publicado pelo BC |
| `categoria` | enum | `banco` / `adm_independente` / `cooperativa` |
| `created_at` | timestamp | Data de criação do registro |
| `updated_at` | timestamp | Data de atualização |

### Nova Tabela: `cd_mapeamento_segmentos`

Tabela de mapeamento de códigos do BC para nomes amigáveis. Deve ser criada na fase de implementação.

| Coluna | Tipo | Descrição |
|---|---|---|
| `codigo_segmento` | int (PK) | Código oficial do BC (1-6) |
| `nome_amigavel` | varchar(50) | Nome amigável (Imóveis, Pesados, etc.) |
| `descricao_oficial` | text | Descrição completa do dicionário do BC |

---

## 11. Arquitetura de Consultas

### Princípio

Todas as consultas utilizam exclusivamente a tabela `bc_dados_linha` e as tabelas de classificação/mapeamento do projeto. Nenhum dado é buscado fora do BC.

### Consultas Principais

| Consulta | Camada | Origem dos Dados |
|---|---|---|
| Lista de administradoras | Ponto de entrada | `bc_dados_linha` (distinct nomeAdministradora) + `cd_classificacao_administradoras` |
| Dados gerais da administradora | Camada 1 | `segmentos_consolidados` (mês mais recente) |
| Distribuição de segmentos | Camada 1 | `segmentos_consolidados` (agrupado por código_do_segmento) |
| Raio-X operacional | Camada 1 | `segmentos_consolidados` (soma por administradora) |
| Comparativos de mercado | Camada 1 | `segmentos_consolidados` (média ponderada sobre todas as adms) |
| Histórico 24 meses | Camada 1 | `segmentos_consolidados` (série temporal por data_base) |
| Lista de segmentos da adm | Camada 2 | `segmentos_consolidados` (distinct segmento com grupos ativos) |
| Lista de grupos do segmento | Camada 3 | `bens_imoveis_grupos` + `bens_moveis_grupos` (filtrado por adm + segmento) |
| Raio-X do grupo | Camada 3 | `bens_imoveis_grupos` / `bens_moveis_grupos` (linha específica) |
| Termômetros do grupo | Camada 3 | Comparação com média do segmento |
| Histórico do grupo | Camada 3 | `bens_imoveis_grupos` / `bens_moveis_grupos` (série temporal) |

---

## 12. Diretrizes de UX (para a Fase de Implementação)

Estas diretrizes guiarão a implementação do frontend na próxima fase, mas **não são parte da entrega desta fase**.

### Filosofia Visual

- **Investigativo, não institucional** — a interface deve parecer uma ferramenta de análise, não um portal de dados
- **Contexto acima de números** — cada número deve vir acompanhado de seu contexto de mercado
- **Resposta rápida** — o usuário deve ver o raio-X da administradora em menos de 2 segundos
- **Mobile-first** — todos os textos, tabelas e cards devem ser otimizados para smartphone com tamanho e nitidez aumentados

### Navegação

- Breadcrumb claro: Panorama:BC > Administradoras > [Nome da Adm] > [Segmento] > [Grupo]
- Botão "voltar" em todas as camadas
- A seleção da administradora permanece visível durante toda a navegação entre camadas

### Bloco "Transparência e Método"

Conforme diretriz global do projeto, o bloco "Transparência e Método" deverá ser o último elemento exibido em todas as telas do Panorama:Administradoras, com a cor do destaque aumentada em 50%. Este bloco explicará ao usuário:

- Que os dados são oficiais do Banco Central
- O período de cobertura dos dados
- Como as médias de mercado são calculadas
- Que a classificação por categoria (Banco/Adm/Cooperativa) é do Consórcio de Verdade, não do BC

### Desenvolvimento Independente

Conforme diretriz do projeto, todo o desenvolvimento ocorrerá em módulo completamente independente, utilizando componentes, rotas, APIs e estruturas próprias. Nenhum arquivo existente será modificado, salvo autorização expressa.

---

## 13. Entregas da Fase 8

Esta fase entrega exclusivamente este documento de Product Spec. Nenhum código, componente visual ou alteração no motor do BC é produzido nesta fase.

### Arquivos de Apoio Produzidos

| Arquivo | Conteúdo |
|---|---|
| `docs/FASE8_PRODUCT_SPEC.md` | Este documento — Product Spec completo |
| `docs/fase8-classificacao-administradoras.md` | Classificação manual das 143 administradoras |
| `docs/fase8-dicionario-bc.md` | Dicionário do BC e campos disponíveis por base |

### Próximos Passos

1. **Aprovação deste Product Spec** pelo Product Owner
2. Fase de implementação do frontend (módulo independente)
3. Criação das tabelas `cd_classificacao_administradoras` e `cd_mapeamento_segmentos`
4. Implementação das consultas (tRPC procedures)
5. Implementação das 3 camadas de UI
6. Testes e validação
