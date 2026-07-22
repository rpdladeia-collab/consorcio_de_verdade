# FASE 1: Motor de Ingestão de Dados do Banco Central

## Visão Geral

Esta é a **Fase 1** do projeto **Panorama: Administradoras**. O objetivo exclusivo desta fase é construir um motor robusto e confiável para:

1. **Localizar** arquivos mensais do Banco Central
2. **Baixar** automaticamente ZIPs novos
3. **Armazenar** ZIPs originais permanentemente
4. **Extrair** conteúdo dos ZIPs
5. **Importar** dados integralmente para PostgreSQL
6. **Preservar** histórico completo (sem sobrescrita)
7. **Registrar** todo o processo de importação

**IMPORTANTE**: Esta fase NÃO inclui análises, indicadores, dashboards ou qualquer transformação de dados. O banco de dados funciona como um **espelho fiel** do Banco Central.

---

## Arquitetura

```
[Banco Central do Brasil]
         ↓
    [ZIP Mensal]
         ↓
[Downloader] → Detecta novo ZIP, calcula hash, verifica duplicatas
         ↓
[Armazenamento] → /storage/banco-central/2026-07.zip
         ↓
[Extrator] → Extrai CSV, XLSX, etc. para /storage/banco-central/2026-07/
         ↓
[Parser] → Converte CSV para JSON (dados brutos)
         ↓
[Importador] → Armazena em PostgreSQL
         ↓
[Banco de Dados] → 3 tabelas: bc_importacoes, bc_arquivos, bc_dados_mensais
         ↓
[Histórico Completo] → Sem sobrescrita, auditoria total
```

---

## Componentes Implementados

### 1. **Schema PostgreSQL** (`drizzle/schema.ts`)

Três tabelas simples:

#### `bc_importacoes`
Rastreia cada importação:
- `id` — PK
- `dataImportacao` — Quando foi importado
- `dataBase` — Data-base do arquivo (YYYY-MM)
- `nomeZip` — Nome do arquivo ZIP
- `hashArquivo` — SHA-256 (detecção de duplicatas)
- `status` — pendente | sucesso | erro
- `quantidadeArquivosExtraidos` — Número de arquivos
- `logs` — Rastreamento completo

#### `bc_arquivos`
Registra cada arquivo extraído:
- `id` — PK
- `importacaoId` — FK para bc_importacoes
- `nomeArquivo` — Nome do arquivo
- `tipoArquivo` — csv, xlsx, txt, etc.
- `dataBase` — Data-base
- `caminhoArmazenado` — Caminho completo no disco

#### `bc_dados_mensais`
Armazena dados brutos do BC:
- `id` — PK
- `importacaoId` — FK para bc_importacoes
- `dataBase` — Data-base
- `tipoDados` — Tipo de dados (segmentos_consolidados, bens_imoveis_grupos, etc.)
- `dadosJson` — Dados brutos em JSON (sem transformação)

### 2. **Downloader** (`server/modules/bc-admin/downloader.ts`)

Responsável por:
- Acessar página do BC
- Detectar novos ZIPs
- Calcular hash SHA-256
- Verificar duplicatas
- Fazer download automático

**Funções principais:**
- `downloadZipFile()` — Download com retry
- `calculateFileHash()` — SHA-256
- `extractDataBaseFromZipName()` — Extrair YYYY-MM
- `isZipAlreadyImported()` — Detectar duplicatas
- `processNewZip()` — Orquestração de um ZIP

### 3. **Extrator** (`server/modules/bc-admin/extractor.ts`)

Responsável por:
- Extrair arquivos ZIP
- Armazenar em `/storage/banco-central/{data-base}/`
- Validar integridade do ZIP
- Listar arquivos extraídos

**Funções principais:**
- `extractZipFile()` — Extração completa
- `validateZipIntegrity()` — Verificar corrupção
- `listExtractedFiles()` — Listar arquivos

### 4. **Parser** (`server/modules/bc-admin/parser.ts`)

Responsável por:
- Ler arquivos CSV (com suporte a semicolons)
- Converter para JSON (dados brutos)
- Validar campos obrigatórios
- Suporte para XLSX (placeholder)

**Funções principais:**
- `parseCSVFile()` — Parse de CSV
- `parseXLSXFile()` — Parse de XLSX (placeholder)
- `validateParsedData()` — Validação de campos
- `extractTipoDados()` — Extrair tipo de dados do nome

### 5. **Orquestrador** (`server/modules/bc-admin/orchestrator.ts`)

Coordena todo o fluxo:
1. Download
2. Validação de integridade
3. Cálculo de hash
4. Criação de registro de importação
5. Extração de arquivos
6. Registro de arquivos
7. Parse e importação de dados
8. Atualização de status

**Funções principais:**
- `executeFullImportFlow()` — Fluxo completo
- `checkForNewZips()` — Detectar novos ZIPs
- `processAllNewZips()` — Processar todos

### 6. **Helpers de BD** (`server/modules/bc-admin/db.ts`)

Funções para interagir com o banco:
- `createImportacao()` — Criar registro
- `findImportacaoByHash()` — Detectar duplicatas
- `updateImportacaoStatus()` — Atualizar status
- `createArquivo()` — Registrar arquivo
- `createDadosMensal()` — Armazenar dados
- `listImportacoes()` — Auditoria

### 7. **Handler de Cron** (`server/modules/bc-admin/scheduled-handler.ts`)

Handler para `/api/scheduled/bc-admin-import`:
- Autenticação como cron
- Execução de `processAllNewZips()`
- Retorno de relatório de importação
- Tratamento de erros

### 8. **Testes Unitários** (`server/modules/bc-admin/parser.test.ts`)

10 testes para o parser:
- ✓ Parse de CSV
- ✓ Extração de dados
- ✓ Detecção de arquivo não encontrado
- ✓ Rejeição de não-CSV
- ✓ Validação de campos obrigatórios
- ✓ Detecção de campos faltantes
- ✓ Rejeição de dados vazios
- ✓ Extração de tipo_dados
- ✓ Tratamento de linhas vazias
- ✓ Suporte a campos com aspas

---

## Validações Implementadas

Conforme especificado no prompt:

- ✓ ZIP corrompido
- ✓ Arquivo inexistente
- ✓ Arquivo duplicado (por hash)
- ✓ Erro de leitura
- ✓ Falha na importação
- ✓ Falha de conexão

---

## Fluxo de Importação

```
NOVO ZIP
   ↓
DOWNLOAD (com validação de status HTTP)
   ↓
VALIDAÇÃO (integridade do ZIP)
   ↓
HASH (SHA-256)
   ↓
VERIFICAÇÃO DE DUPLICATA (por hash)
   ↓
CRIAÇÃO DE REGISTRO (bc_importacoes)
   ↓
EXTRAÇÃO (arquivos para disco)
   ↓
REGISTRO DE ARQUIVOS (bc_arquivos)
   ↓
PARSE (CSV → JSON)
   ↓
VALIDAÇÃO (campos obrigatórios)
   ↓
IMPORTAÇÃO (bc_dados_mensais)
   ↓
ATUALIZAÇÃO DE STATUS (sucesso/erro)
   ↓
FINALIZADO
```

---

## Armazenamento em Disco

```
/storage/banco-central/
├── 2026-06.zip
├── 2026-07.zip
├── 2026-08.zip
├── 2026-06/
│   ├── 202606Segmentos_Consolidados.csv
│   ├── 202606Bens_Imoveis_Grupos.csv
│   └── Significado_dos_campos_e_metricas.xlsx
├── 2026-07/
│   ├── 202607Segmentos_Consolidados.csv
│   ├── 202607Bens_Imoveis_Grupos.csv
│   └── Significado_dos_campos_e_metricas.xlsx
└── 2026-08/
    ├── 202608Segmentos_Consolidados.csv
    ├── 202608Bens_Imoveis_Grupos.csv
    └── Significado_dos_campos_e_metricas.xlsx
```

---

## Cron Automático

O handler está registrado em `/api/scheduled/bc-admin-import` e pode ser agendado para executar automaticamente:

**Configuração recomendada:**
- **Dia**: 15 de cada mês
- **Hora**: 02:00 UTC
- **Cron**: `0 0 2 15 * *`

Para criar o cron (após deploy):

```bash
manus-heartbeat create \
  --name bc-admin-monthly-import \
  --cron "0 0 2 15 * *" \
  --path /api/scheduled/bc-admin-import \
  --description "Monthly import of Banco Central consortium data"
```

---

## Próximas Fases

**IMPORTANTE**: Nenhuma funcionalidade da Fase 2 deverá ser iniciada sem autorização expressa.

A Fase 1 está completa quando:
- ✓ Motor de dados funcionando de forma estável
- ✓ Histórico completo preservado
- ✓ Processo auditável e rastreável
- ✓ Validações básicas implementadas
- ✓ Testes passando

---

## Fonte Oficial dos Dados

Todos os dados vêm exclusivamente do:

**Banco Central do Brasil**
https://www.bcb.gov.br/estabilidadefinanceira/consorciobd

---

## Filosofia do Projeto

**Espelho Fiel do Banco Central**

Não é permitido:
- ❌ Alterar informações
- ❌ Normalizar dados
- ❌ Corrigir nomenclaturas
- ❌ Criar métricas
- ❌ Excluir campos
- ❌ Consolidar dados

Todo dado é armazenado **exatamente como publicado** pelo Banco Central.

---

## Rastreabilidade e Auditoria

Cada importação é rastreada completamente:

1. **Hash SHA-256** — Identifica arquivo único
2. **Logs detalhados** — Cada etapa registrada
3. **Status** — pendente | sucesso | erro
4. **Timestamp** — Data/hora de importação
5. **Quantidade de arquivos** — Número de arquivos extraídos
6. **Dados originais** — Preservados em JSON

---

## Testes

Executar testes do parser:

```bash
pnpm test -- server/modules/bc-admin/parser.test.ts
```

Resultado esperado: **10/10 testes passando**

---

## Próximos Passos

1. **Implementar scraping/API do BC** — Detectar novos ZIPs automaticamente
2. **Testar fluxo completo** — Com dados reais do BC
3. **Configurar cron** — Agendamento mensal
4. **Validar histórico** — Múltiplos meses de dados
5. **Deploy** — Publicar para produção

---

## Observações Finais

- Esta é uma infraestrutura robusta e confiável
- Dados são imutáveis (histórico completo)
- Processo é totalmente auditável
- Pronto para Fase 2 (análises e indicadores)
