# Product Spec — Panorama > Administradoras (V1 — Revisão 8.1)

**Projeto:** Consórcio de Verdade — Panorama:BC  
**Fase:** 8.1 — Revisão do Product Spec  
**Data:** 22 de julho de 2026  
**Status:** Aguardando aprovação  

---

## 1. Filosofia do Produto

> O Panorama > Administradoras NÃO existe para mostrar o que o Banco Central publica. Ele existe para mostrar aquilo que o consumidor normalmente NÃO consegue descobrir ao contratar um consórcio.

Esta é a diretriz absoluta do produto. Toda decisão de modelagem funcional parte das **perguntas que o consumidor deseja responder**, não dos campos publicados pelo Banco Central. Os campos do BC são insumos; as respostas ao consumidor são o produto.

### Perguntas Obrigatórias da V1

O produto deverá responder, obrigatoriamente, as seguintes perguntas:

| # | Pergunta do Consumidor | Camada que Responde |
|---|---|---|
| 1 | Esta administradora possui muitos cotistas aguardando contemplação? | Camada 1 — Cotas não contempladas |
| 2 | Esta administradora possui elevado índice de exclusão? | Camada 1 — Índice de exclusão |
| 3 | O sorteio realmente possui relevância operacional? | Camada 1 — Contemplações por lance vs. sorteio |
| 4 | Esta administradora opera forte neste segmento? | Camada 2 — Relevância do segmento |
| 5 | Esta operação está crescendo ou diminuindo? | Camada 1 — Tendência operacional |
| 6 | Este grupo é relevante dentro da administradora? | Camada 3 — Relevância do grupo |
| 7 | Esta taxa está acima ou abaixo da média do mercado? | Camadas 1 e 3 — Comparativos |
| 8 | Este grupo possui muitos excluídos? | Camada 3 — Índice de exclusão do grupo |
| 9 | Como esta operação evoluiu nos últimos 24 meses? | Camadas 1 e 3 — Histórico |

Toda a modelagem funcional foi construída para responder essas perguntas de forma direta, sem subjetividade e sem exigir conhecimento técnico do consumidor.

---

## 2. Posicionamento no Site

A nova seção será acessível dentro do Panorama:BC, ao lado direito do menu "Panorama:Oficial" existente.

| Menu | Conteúdo |
|---|---|
| Panorama:Oficial | Seção já existente com dados oficiais do BC |
| **Panorama:Administradoras** | Nova seção — raio-X investigativo por administradora |

---

## 3. Regra 80/20

A V1 entrega o maior valor possível com a menor complexidade possível. O foco absoluto é:

1. Raio-X da Administradora
2. Raio-X dos Segmentos
3. Raio-X dos Grupos
4. Comparativos com o mercado
5. Histórico dos últimos 24 meses

Tudo que possuir baixo valor para o consumidor será descartado. Sempre priorizar inteligência investigativa em detrimento de volume de dados apresentados.

### Fora de Escopo da V1

- Módulo "Panorama do Mercado" — fase posterior
- Rankings e Top 10 — mapeado como viável (Seção 12), mas não implementado na V1
- Mapas geográficos por UF
- Alertas e notificações
- Exportação de relatórios
- Login obrigatório (a consulta será pública)

---

## 4. Fonte de Dados e Arquitetura

### Fonte Única

A única fonte de dados é o Banco Central do Brasil. Nenhuma informação é buscada fora do BC. Os dados estão importados na tabela `bc_dados_linha` com 231.948 linhas individuais, cobrindo o período de julho/2024 a maio/2026.

### Bases Oficiais Utilizadas

| Base | Tipo | Periodicidade | Período Disponível |
|---|---|---|---|
| Consolidados — Segmentos | `segmentos_consolidados` | Mensal | jul/2024 a mai/2026 (23 meses) |
| Consolidados — Bens Imóveis (Grupos) | `bens_imoveis_grupos` | Mensal | jul/2024 a mai/2026 (23 meses) |
| Consolidados — Bens Móveis (Grupos) | `bens_moveis_grupos` | Trimestral | set/2024 a mar/2026 (7 trimestres) |
| Dados por UF | `dados_uf` | Trimestral | set/2024 a mar/2026 (7 trimestres) |

### Mapeamento de Segmentos (Dicionário Oficial do BC)

O usuário nunca visualiza códigos numéricos. O sistema trabalha internamente com os códigos oficiais e apresenta apenas nomes amigáveis.

| Código Interno | Descrição Oficial do BC | Nome Amigável |
|---|---|---|
| 1 | Bens imóveis | Imóveis |
| 2 | Tratores, equipamentos rodoviários, máquinas agrícolas, embarcações, aeronaves e veículos automotores de carga e transporte coletivo | Pesados |
| 3 | Veículos automotores não incluídos no segmento 2 | Automóveis |
| 4 | Motocicletas e motonetas | Motocicletas |
| 5 | Outros bens móveis duráveis | Outros |
| 6 | Serviços turísticos | Serviços |

### Classificação de Administradoras (Ativo Próprio do Projeto)

O Banco Central não classifica as administradoras por tipo. O Consórcio de Verdade mantém sua própria classificação, criada manualmente a partir da análise dos 142 nomes oficiais publicados pelo BC.

| Categoria | Quantidade | Critério |
|---|---|---|
| Banco | 7 | Instituições cujo negócio principal é bancário |
| Cooperativas e Associações | 13 | Cooperativas, associações, fundações, federações e clubes (natureza mutualista ou sem fins lucrativos) |
| Administradora Independente | 122 | Demais instituições (adms puras, fabricantes, seguradoras) |
| **Total** | **142** | |

A classificação completa está documentada no arquivo `docs/fase8-classificacao-administradoras.md`.

---

## 5. Jornada do Usuário

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
2. **Select com todas as administradoras** — lista em ordem alfabética com as 142 instituições

Ao selecionar uma administradora, o sistema carrega a Camada 1.

---

## 6. Camada 1 — Raio-X da Administradora

Esta é a tela principal do produto. Ao selecionar uma administradora, o usuário vê um raio-X completo de sua operação, estruturado para responder às perguntas do consumidor.

### 6.1 Identidade da Administradora

| Informação | Descrição |
|---|---|
| Nome da administradora | Nome oficial publicado pelo BC |
| Categoria da instituição | Banco, Administradora Independente ou Cooperativas e Associações |
| Total de grupos ativos | Soma de grupos ativos no mês mais recente |
| Total de segmentos em operação | Contagem de segmentos distintos com grupos ativos |

### 6.2 Cotas Não Contempladas — "Muitos cotistas aguardando contemplação?"

Esta é uma das informações de maior valor para o consumidor. O sistema deverá conseguir responder algo semelhante a:

> "87% dos cotistas ativos desta administradora ainda aguardam contemplação."

Não existe qualquer subjetividade nesta análise.

| Indicador | Descrição | Cálculo |
|---|---|---|
| Quantidade absoluta | Total de cotas ativas não contempladas | Soma de `Quantidade_de_cotas_ativas_não_contempladas` |
| Percentual sobre a operação | Proporção de cotas aguardando vs. total | (Cotas não contempladas / Cotas ativas totais) × 100 |
| Evolução histórica | Variação nos últimos 24 meses | Série temporal mensal |
| Comparação com o mercado | Diferença em relação à média do mercado | Percentual da adm vs. percentual médio do mercado |

### 6.3 Índice de Exclusão — "Elevado índice de exclusão?"

O índice de exclusão passa a ser uma das informações mais importantes do produto. Ele existe em três níveis (administradora, segmento e grupo), e na Camada 1 é apresentado no nível da administradora:

| Indicador | Descrição | Cálculo |
|---|---|---|
| Quantidade absoluta | Total de cotas excluídas | Soma de `Quantidade_de_cotas_excluídas` |
| Percentual | Proporção de exclusões sobre a operação | (Cotas excluídas / Cotas ativas totais) × 100 |
| Evolução histórica | Variação nos últimos 24 meses | Série temporal mensal |
| Comparação com o mercado | Diferença em relação à média do mercado | Percentual da adm vs. percentual médio do mercado |

O índice de exclusão não é tratado como apenas mais um campo publicado pelo Banco Central. Ele é apresentado como um indicador investigativo de destaque, com contexto histórico e comparativo.

### 6.4 Contemplações por Lance vs. Sorteio — "O sorteio possui relevância operacional?"

Esta informação possui enorme valor investigativo. Sempre que disponível (base trimestral `dados_uf`), deverá ser apresentada com grande destaque:

| Indicador | Descrição | Fonte |
|---|---|---|
| Contemplações por lance (quantidade absoluta) | Total de cotas contempladas por lance no último trimestre | `dados_uf` → `Quantidade_de_consorciados_ativos_contemplados_por_lance` |
| Contemplações por sorteio (quantidade absoluta) | Total de cotas contempladas por sorteio no último trimestre | `dados_uf` → `Quantidade_de_consorciados_ativos_contemplados_por_sorteio` |
| Distribuição percentual | Proporção lance vs. sorteio | (Lance / (Lance + Sorteio)) × 100 e (Sorteio / (Lance + Sorteio)) × 100 |
| Comparação histórica | Evolução da distribuição nos trimestres disponíveis | Série temporal trimestral |

**Exemplo de apresentação:**

> Último trimestre: 96% das contemplações ocorreram por lance. 4% ocorreram por sorteio.

Quando os dados trimestrais não estiverem disponíveis para a administradora selecionada, o sistema deverá indicar claramente que a informação não está disponível para o período mais recente, sem deixar o usuário sem contexto.

### 6.5 Tendência Operacional — "Esta operação está crescendo ou diminuindo?"

O produto cria o conceito de **Tendência Operacional dos Últimos 24 Meses**. O objetivo NÃO é criar scores. O objetivo é permitir ao usuário visualizar a direção operacional da administradora.

| Indicador de Tendência | O que Mede | Cálculo |
|---|---|---|
| Crescimento de grupos ativos | A operação está expandindo? | Variação percentual: (Grupos ativos no mês mais recente / Grupos ativos 24 meses atrás) - 1 |
| Crescimento das exclusões | As exclusões estão aumentando? | Variação percentual: (Exclusões no mês mais recente / Exclusões 24 meses atrás) - 1 |
| Crescimento das contemplações | Mais cotistas sendo contemplados? | Variação percentual: (Contemplações no mês mais recente / Contemplações 24 meses atrás) - 1 |
| Crescimento das cotas comercializadas | A admissão de novos cotistas está crescendo? | Variação percentual: (Cotas comercializadas no mês mais recente / Cotas comercializadas 24 meses atrás) - 1 |
| Crescimento das cotas aguardando contemplação | A fila está crescendo? | Variação percentual: (Cotas não contempladas no mês mais recente / Cotas não contempladas 24 meses atrás) - 1 |
| Crescimento da operação | A operação total está crescendo? | Variação percentual: (Cotas ativas totais no mês mais recente / Cotas ativas totais 24 meses atrás) - 1 |

Cada tendência é apresentada como um indicador simples de direção: **Crescendo**, **Estável** ou **Diminuindo**, acompanhado do percentual numérico. Não há scores compostos ou notas — apenas a direção e a magnitude.

### 6.6 Distribuição dos Segmentos — "Opera forte neste segmento?"

Apresenta a composição da operação da administradora por segmento, usando os nomes amigáveis:

| Segmento | Grupos Ativos | Participação na Adm | Participação no Mercado |
|---|---|---|---|
| Automóveis | X | X% | X% |
| Imóveis | X | X% | X% |
| Pesados | X | X% | X% |
| Motocicletas | X | X% | X% |
| Serviços | X | X% | X% |
| Outros | X | X% | X% |

A "Participação na Adm" mostra qual percentual dos grupos daquela administradora pertence a cada segmento. A "Participação no Mercado" mostra qual percentual do mercado total daquele segmento pertence a esta administradora.

### 6.7 Comparativos com o Mercado — "Esta taxa está acima ou abaixo da média?"

Cada indicador relevante da administradora é comparado com a média do mercado (calculada sobre todas as 142 administradoras) para o mesmo período.

#### Estrutura de Apresentação

| Elemento | Descrição |
|---|---|
| **Mercado** | Média calculada sobre todas as administradoras para o mesmo segmento e período |
| **Administradora** | Valor da administradora selecionada |
| **Veredito** | ACIMA DA MÉDIA / DENTRO DA MÉDIA / ABAIXO DA MÉDIA |

#### Indicadores Comparados na V1

| Indicador | Cálculo | Interpretação |
|---|---|---|
| Taxa de administração | Média ponderada por cotas ativas | Acima = negativo (mais caro) |
| Índice de exclusão | (Cotas excluídas / Cotas ativas) × 100 | Acima = negativo (mais exclusões) |
| Taxa de contemplação | (Contemplações no mês / Cotas ativas) × 100 | Acima = positivo (mais contemplações) |
| Percentual de cotas não contempladas | (Cotas não contempladas / Cotas ativas) × 100 | Acima = negativo (fila maior) |
| Inadimplência | (Cotas inadimplentes / Cotas ativas) × 100 | Acima = negativo (mais inadimplência) |

#### Regras de Veredito

| Condição | Veredito |
|---|---|
| Valor da adm > média × 1,10 | ACIMA DA MÉDIA |
| Valor da adm < média × 0,90 | ABAIXO DA MÉDIA |
| Valor entre média × 0,90 e média × 1,10 | DENTRO DA MÉDIA |

A cor do veredito (verde/vermelho/cinza) depende se "acima" é positivo ou negativo para aquele indicador específico.

### 6.8 Histórico dos Últimos 24 Meses

Apresenta a evolução temporal dos principais indicadores operacionais. Como o banco possui dados de julho/2024 a maio/2026 (23 meses), o histórico mostrará todos os meses disponíveis.

Cada gráfico de evolução inclui uma linha de referência representando a média do mercado no mesmo período, permitindo ao usuário visualizar se a administradora está acima ou abaixo do mercado ao longo do tempo.

| Indicador com Evolução | Granularidade | Visualização |
|---|---|---|
| Contemplações no mês | Mensal | Gráfico de linha com referência do mercado |
| Exclusões no mês | Mensal | Gráfico de linha com referência do mercado |
| Cotas comercializadas no mês | Mensal | Gráfico de linha com referência do mercado |
| Grupos ativos | Mensal | Gráfico de linha com referência do mercado |
| Cotas não contempladas | Mensal | Gráfico de área com referência do mercado |
| Taxa de administração média | Mensal | Gráfico de linha com referência do mercado |
| Percentual de cotas não contempladas | Mensal | Gráfico de linha com referência do mercado |
| Índice de exclusão | Mensal | Gráfico de linha com referência do mercado |
| Distribuição lance vs. sorteio | Trimestral | Gráfico de barras empilhadas |

---

## 7. Camada 2 — Segmentos da Administradora

Dentro da administradora selecionada, o usuário vê todos os segmentos em operação com seus respectivos números.

### Apresentação

| Segmento | Grupos Ativos | Participação na Adm |
|---|---|---|
| Automóveis | 55 | 58% |
| Imóveis | 18 | 19% |
| Serviços | 12 | 13% |
| Pesados | 8 | 8% |
| Motocicletas | 5 | 5% |

Ao clicar em um segmento, o sistema abre a Camada 3 (Grupos).

### Índice de Exclusão por Segmento

O índice de exclusão também existe no nível do segmento:

| Indicador | Descrição | Cálculo |
|---|---|---|
| Quantidade absoluta | Total de cotas excluídas no segmento | Soma de `Quantidade_de_cotas_excluídas` filtrado por segmento |
| Percentual | Proporção de exclusões no segmento | (Cotas excluídas do segmento / Cotas ativas do segmento) × 100 |
| Comparação com a média do segmento | Diferença em relação à média de exclusão do mercado naquele segmento | Percentual da adm no segmento vs. percentual médio do mercado no segmento |

### Outros Indicadores por Segmento

| Indicador | Descrição |
|---|---|
| Total de cotas ativas no segmento | Soma de cotas ativas de todos os grupos do segmento |
| Taxa média de administração | Média ponderada das taxas dos grupos do segmento |
| Participação do segmento na operação total da adm | Cotas do segmento / total de cotas da adm |
| Cotas não contempladas no segmento | Quantidade e percentual |

---

## 8. Camada 3 — Grupos do Segmento

### Ponto de Entrada

**Não apresentar uma lista gigante de grupos inicialmente.** Priorizar a busca.

O usuário encontra:

1. **Campo de busca por número do grupo** — digita o código do grupo (ex: "00057")
2. **Lista paginada de grupos** — apenas após o usuário solicitar explicitamente "ver todos os grupos"

### Raio-X do Grupo

Ao selecionar um grupo, o sistema apresenta:

#### 8.1 Relevância do Grupo — "Este grupo é relevante dentro da administradora?"

| Indicador | Cálculo | Exemplo de Apresentação |
|---|---|---|
| Participação do grupo dentro do segmento | Cotas do grupo / total de cotas do segmento | "O grupo representa 14% do segmento Automóveis desta administradora." |
| Participação do grupo dentro da administradora | Cotas do grupo / total de cotas da administradora | "Este grupo representa apenas 2,1% da operação total da administradora." |
| Representatividade percentual da operação | Combinação dos dois indicadores acima em um card de destaque | Apresentação visual clara do peso do grupo |

#### 8.2 Dados do Grupo

| Indicador | Campo Original do BC |
|---|---|
| Código do grupo | `Código_do_grupo` |
| Segmento | `Código_do_segmento` (mapeado para nome amigável) |
| Taxa de administração | `Taxa_de_administração` |
| Prazo do grupo (meses) | `Prazo_do_grupo_em_meses` |
| Índice de correção | `Índice_de_correção` |
| Valor médio do bem | `Valor_médio_do_bem` |
| Cotas ativas em dia | `Quantidade_de_cotas_ativas_em_dia` |
| Cotas contempladas no mês | `Quantidade_de_cotas_ativas_contempladas_no_mês` |
| Cotas não contempladas | `Quantidade_de_cotas_ativas_não_contempladas_inadimplentes` |
| Cotas excluídas | `Quantidade_de_cotas_excluídas` |
| Cotas quitadas | `Quantidade_de_cotas_ativas_quitadas` |
| Créditos pendentes de utilização | `Quantidade_de_cotas_ativas_com_crédito_pendente_de_utilização` |

#### 8.3 Índice de Exclusão do Grupo — "Este grupo possui muitos excluídos?"

O índice de exclusão no nível do grupo:

| Indicador | Descrição | Cálculo |
|---|---|---|
| Quantidade absoluta | Total de cotas excluídas do grupo | `Quantidade_de_cotas_excluídas` |
| Percentual | Proporção de exclusões no grupo | (Cotas excluídas / Cotas ativas do grupo) × 100 |
| Comparação com grupos semelhantes | Diferença em relação à média de exclusão dos grupos do mesmo segmento | Percentual do grupo vs. percentual médio dos grupos do mesmo segmento |

#### 8.4 Termômetros de Mercado

Cada grupo recebe comparativos simples com a média do mercado para o mesmo segmento:

| Indicador | Veredito Possível |
|---|---|
| Taxa de administração | Acima da média / Dentro da média / Abaixo da média |
| Índice de exclusão | Acima da média / Dentro da média / Abaixo da média |
| Taxa de contemplação | Acima da média / Dentro da média / Abaixo da média |

#### 8.5 Histórico do Grupo (24 meses)

Evolução dos principais indicadores do grupo ao longo do tempo, com a mesma estrutura da Camada 1 (gráfico de linha com linha de referência do mercado).

---

## 9. Cálculos de Mercado

### Princípio

A "média do mercado" é sempre calculada sobre todas as 142 administradoras para o mesmo segmento e período. O cálculo é **ponderado pelo volume de cotas ativas** de cada administradora, garantindo que administradoras maiores tenham peso proporcional ao seu tamanho.

### Fórmulas

**Taxa Média de Administração do Mercado (por segmento):**

```
TaxaMédia_mercado = Σ(TaxaAdm × CotasAtivas) / Σ(CotasAtivas)
```

**Índice de Exclusão:**

```
ÍndiceExclusão = (CotasExcluídas / CotasAtivas) × 100
```

**Percentual de Cotas Não Contempladas:**

```
PercentualNãoContempladas = (CotasNãoContempladas / CotasAtivas) × 100
```

**Taxa de Contemplação:**

```
TaxaContemplação = (ContemplaçõesNoMês / CotasAtivas) × 100
```

**Taxa de Inadimplência:**

```
TaxaInadimplência = (CotasInadimplentes / CotasAtivas) × 100
```

Onde `CotasInadimplentes` = `Quantidade_de_cotas_ativas_contempladas_inadimplentes` + `Quantidade_de_cotas_ativas_não_contempladas_inadimplentes`.

### Escopo Temporal

Todos os comparativos da Camada 1 utilizam o **mês mais recente disponível** como referência. Os comparativos da Camada 3 (grupos) utilizam o mês mais recente em que o grupo possui dados.

---

## 10. Estrutura de Dados Necessária

### Tabelas Existentes (já no banco)

| Tabela | Uso no Produto |
|---|---|
| `bc_dados_linha` | Tabela principal — todas as consultas |
| `bc_importacoes` | Auditoria — verificar data da última atualização |
| `bc_arquivos` | Auditoria — verificar arquivos processados |

### Nova Tabela: `cd_classificacao_administradoras`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | int (PK) | Identificador |
| `cnpj_administradora` | varchar(8) | CNPJ raiz da administradora |
| `nome_administradora` | varchar(255) | Nome oficial publicado pelo BC |
| `categoria` | enum | `banco` / `adm_independente` / `cooperativa_associacao` |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

### Nova Tabela: `cd_mapeamento_segmentos`

| Coluna | Tipo | Descrição |
|---|---|---|
| `codigo_segmento` | int (PK) | Código oficial do BC (1-6) |
| `nome_amigavel` | varchar(50) | Nome amigável |
| `descricao_oficial` | text | Descrição completa do dicionário do BC |

---

## 11. Diretrizes de UX (para a Fase de Implementação)

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

Conforme diretriz global do projeto, o bloco "Transparência e Método" deverá ser o último elemento exibido em todas as telas, com a cor do destaque aumentada em 50%. Este bloco explicará ao usuário:

- Que os dados são oficiais do Banco Central
- O período de cobertura dos dados
- Como as médias de mercado são calculadas
- Que a classificação por categoria (Banco / Adm Independente / Cooperativas e Associações) é do Consórcio de Verdade, não do BC

### Desenvolvimento Independente

Todo o desenvolvimento ocorrerá em módulo completamente independente, utilizando componentes, rotas, APIs e estruturas próprias. Nenhum arquivo existente será modificado, salvo autorização expressa.

---

## 12. Mapeamento de Viabilidade — Inteligências de Mercado Futuras

Mesmo que essas informações NÃO sejam exibidas na V1, o motor já possui dados suficientes para calculá-las. Esta seção mapeia a viabilidade de cada análise futura, utilizando exclusivamente os dados do Banco Central.

**ATENÇÃO:** Nenhuma dessas análises será implementada agora. O objetivo é apenas verificar se o motor atual consegue produzir essas inteligências futuramente.

| # | Inteligência Futura | Viável com Dados Atuais? | Base Necessária | Campo(s) do BC |
|---|---|---|---|---|
| 1 | Top 10 maiores operações | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_ativas_em_dia` (soma por adm) |
| 2 | Top 10 contemplações | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_ativas_contempladas_no_mês` (soma por adm) |
| 3 | Top 10 contemplações por lance | Sim (trimestral) | `dados_uf` | `Quantidade_de_consorciados_ativos_contemplados_por_lance` |
| 4 | Top 10 contemplações por sorteio | Sim (trimestral) | `dados_uf` | `Quantidade_de_consorciados_ativos_contemplados_por_sorteio` |
| 5 | Top 10 exclusões | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_excluídas` (soma por adm) |
| 6 | Top 10 taxas de administração | Sim | `bens_imoveis_grupos` / `bens_moveis_grupos` | `Taxa_de_administração` (média ponderada por adm) |
| 7 | Top 10 market share por segmento | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_ativas_em_dia` (por segmento, por adm) |
| 8 | Top 10 crescimento operacional | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_ativas_em_dia` (variação temporal por adm) |
| 9 | Top 10 cotistas aguardando contemplação | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_ativas_não_contempladas` (soma por adm) |
| 10 | Top 10 relação exclusões × cotas comercializadas | Sim | `segmentos_consolidados` | `Quantidade_de_cotas_excluídas` / `Quantidade_de_cotas_comercializadas_no_mês` |
| 11 | Top 10 participação por segmento | Sim | `segmentos_consolidados` | `Quantidade_de_grupos_ativos` (por segmento, por adm) |

### Conclusão do Mapeamento

Todas as 11 inteligências de mercado são **viáveis com os dados já importados no banco**. Nenhuma exige fontes externas ao Banco Central. A base `segmentos_consolidados` (mensal) atende 9 das 11 análises. As análises de contemplações por lance e por sorteio requerem a base `dados_uf` (trimestral), também já importada. As análises de taxa de administração detalhada utilizam as bases de grupos (`bens_imoveis_grupos` e `bens_moveis_grupos`).

---

## 13. Entregas da Fase 8.1

Esta fase entrega exclusivamente este documento de Product Spec revisado. Nenhum código, componente visual ou alteração no motor do BC é produzido nesta fase.

### Arquivos de Apoio Produzidos

| Arquivo | Conteúdo |
|---|---|
| `docs/FASE8_PRODUCT_SPEC.md` | Este documento — Product Spec revisado (Fase 8.1) |
| `docs/fase8-classificacao-administradoras.md` | Classificação manual revisada das 142 administradoras |
| `docs/fase8-dicionario-bc.md` | Dicionário do BC e campos disponíveis por base |

### Alterações Incorporadas nesta Revisão

| # | Alteração | Status |
|---|---|---|
| 01 | Filosofia orientada a perguntas do consumidor | Incorporada — Seção 1 |
| 02 | Índice de exclusão em três níveis | Incorporada — Seções 6.3, 7 e 8.3 |
| 03 | Cotas não contempladas com destaque | Incorporada — Seção 6.2 |
| 04 | Contemplações por lance vs. sorteio com destaque | Incorporada — Seção 6.4 |
| 05 | Classificação: Cooperativas e Associações | Incorporada — Seção 4 e classificação revisada |
| 06 | Tendência operacional dos últimos 24 meses | Incorporada — Seção 6.5 |
| 07 | Relevância do grupo | Incorporada — Seção 8.1 |
| 08 | Mapeamento de viabilidade das inteligências de Top 10 | Incorporada — Seção 12 |

### Próximos Passos

1. **Aprovação deste Product Spec revisado** pelo Product Owner
2. Fase de implementação do frontend (módulo independente)
3. Criação das tabelas `cd_classificacao_administradoras` e `cd_mapeamento_segmentos`
4. Implementação das consultas (tRPC procedures)
5. Implementação das 3 camadas de UI
6. Testes e validação
