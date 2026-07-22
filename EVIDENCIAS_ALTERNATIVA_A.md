# Evidências da Implementação da Alternativa A — Modelo Linha a Linha

**Projeto:** Panorama BC — Data Lab  
**Data:** 22 de julho de 2026  
**Decisão:** Alternativa A — 1 linha CSV do Banco Central = 1 linha no banco de dados

---

## Princípio Arquitetural Aplicado

```
CSV oficial do Banco Central
        ↓
1 linha do CSV
        ↓
1 linha no banco de dados
```

Cada linha publicada pelo Banco Central corresponde a exatamente uma linha armazenada na tabela `bc_dados_linha` do banco de dados TiDB. Nenhum JSON agrupado, nenhum chunking, nenhum armazenamento externo (S3) para os dados oficiais.

---

## Evidência 1 — Total de Importações Realizadas

| Métrica | Valor |
|---|---|
| Total de importações | 30 |
| Importações com sucesso | 30 |
| Importações com erro | 0 |
| ZIPs indisponíveis no BC (SKIP) | 2 |

**SQL executado:**
```sql
SELECT COUNT(*) as total,
       SUM(CASE WHEN status='sucesso' THEN 1 ELSE 0 END) as sucessos,
       SUM(CASE WHEN status='erro' THEN 1 ELSE 0 END) as erros
FROM bc_importacoes;
```

**Resultado:** `[{"total":30,"sucessos":"30","erros":"0"}]`

---

## Evidência 2 — Importações por Base de Origem

| Base de Origem | Quantidade de ZIPs |
|---|---|
| consolidados | 23 |
| dados_uf | 7 |
| **Total** | **30** |

**SQL executado:**
```sql
SELECT baseOrigem, COUNT(*) as qtd
FROM bc_importacoes WHERE status='sucesso'
GROUP BY baseOrigem;
```

**Resultado:** `[{"baseOrigem":"consolidados","qtd":23},{"baseOrigem":"dados_uf","qtd":7}]`

**Nota:** Os 2 ZIPs ignorados (`202606Consorcios.zip` e `202606Consorcios_UF.zip`) referem-se à competência 2026-06, que ainda não foi publicada pelo Banco Central no momento da importação. O motor tentará baixá-los automaticamente quando disponibilizados.

---

## Evidência 3 — Datas-Base Disponíveis no Banco

A tabela abaixo lista todas as 30 datas-base importadas com sucesso, ordenadas cronologicamente:

| Data-Base | Base de Origem | Linhas Importadas |
|---|---|---|
| 2024-07 | consolidados | 3.030 |
| 2024-08 | consolidados | 3.036 |
| 2024-09 | consolidados | 18.186 |
| 2024-09 | dados_uf | 7.402 |
| 2024-10 | consolidados | 3.094 |
| 2024-11 | consolidados | 3.086 |
| 2024-12 | consolidados | 18.072 |
| 2024-12 | dados_uf | 7.417 |
| 2025-01 | consolidados | 3.125 |
| 2025-02 | consolidados | 3.131 |
| 2025-03 | consolidados | 18.039 |
| 2025-03 | dados_uf | 7.459 |
| 2025-04 | consolidados | 3.174 |
| 2025-05 | consolidados | 3.202 |
| 2025-06 | consolidados | 18.134 |
| 2025-06 | dados_uf | 7.495 |
| 2025-07 | consolidados | 3.252 |
| 2025-08 | consolidados | 3.285 |
| 2025-09 | consolidados | 18.339 |
| 2025-09 | dados_uf | 7.596 |
| 2025-10 | consolidados | 3.400 |
| 2025-11 | consolidados | 3.426 |
| 2025-12 | consolidados | 18.309 |
| 2025-12 | dados_uf | 7.637 |
| 2026-01 | consolidados | 3.477 |
| 2026-02 | consolidados | 3.497 |
| 2026-03 | consolidados | 18.139 |
| 2026-03 | dados_uf | 7.591 |
| 2026-04 | consolidados | 3.376 |
| 2026-05 | consolidados | 3.542 |

**Período coberto:** julho/2024 a maio/2026 (consolidados) e setembro/2024 a março/2026 (dados_uf — trimestral).

---

## Evidência 4 — Total de Linhas no Banco (bc_dados_linha)

| Métrica | Valor |
|---|---|
| Total de linhas individuais | **231.948** |

**SQL executado:**
```sql
SELECT COUNT(*) as total FROM bc_dados_linha;
```

**Resultado:** `[{"total":231948}]`

Este número corresponde exatamente ao total reportado pelo log de importação: `Total de linhas: 231948`.

---

## Evidência 5 — Linhas por Base de Origem

| Base de Origem | Linhas |
|---|---|
| consolidados | 179.351 |
| dados_uf | 52.597 |
| **Total** | **231.948** |

---

## Evidência 6 — Linhas por Tipo de Dado

| Tipo de Dado | Linhas |
|---|---|
| bens_moveis_grupos | 104.356 |
| bens_imoveis_grupos | 57.086 |
| dados_uf | 52.499 |
| segmentos_consolidados | 17.886 |
| significado_campos_uf | 98 |
| significado_campos_metricas | 23 |
| **Total** | **231.948** |

---

## Evidência 7 — Total de Arquivos Extraídos e Registrados

| Métrica | Valor |
|---|---|
| Total de arquivos | 90 |

**SQL executado:**
```sql
SELECT COUNT(*) as total FROM bc_arquivos;
```

---

## Evidência 8 — Arquivos por Tipo

| Tipo de Arquivo | Quantidade |
|---|---|
| CSV | 67 |
| XLSX | 23 |
| **Total** | **90** |

---

## Evidência 9 — CNPJs Únicos de Administradoras

| Métrica | Valor |
|---|---|
| CNPJs distintos | 136 |

**SQL executado:**
```sql
SELECT COUNT(DISTINCT cnpjAdministradora) as total FROM bc_dados_linha;
```

---

## Evidência 10 — CNPJs por Base de Origem

| Base de Origem | CNPJs Únicos |
|---|---|
| consolidados | 136 |
| dados_uf | 130 |

---

## Evidência 11 — Interseção de CNPJs entre as Duas Bases

| Métrica | Valor |
|---|---|
| CNPJs presentes em ambas as bases | 130 |

**SQL executado:**
```sql
SELECT COUNT(DISTINCT a.cnpjAdministradora) as intersecao
FROM bc_dados_linha a
INNER JOIN bc_dados_linha b ON a.cnpjAdministradora = b.cnpjAdministradora
WHERE a.baseOrigem = 'consolidados' AND b.baseOrigem = 'dados_uf';
```

**Resultado:** `[{"intersecao":130}]`

Isto confirma que o relacionamento entre as duas bases oficiais pelo identificador CNPJ funciona corretamente — 130 administradoras aparecem simultaneamente em consolidados e dados_uf.

---

## Evidência 12 — Nomes Únicos de Administradoras

| Métrica | Valor |
|---|---|
| Nomes distintos | 143 |

---

## Evidências Complementares

### Evidência 13 — Bens Móveis Grupos (Trimestral)

| Data-Base | Linhas |
|---|---|
| 2024-09 | 15.122 |
| 2024-12 | 14.970 |
| 2025-03 | 14.892 |
| 2025-06 | 14.909 |
| 2025-09 | 14.983 |
| 2025-12 | 14.844 |
| 2026-03 | 14.636 |

### Evidência 14 — Dados por UF (Trimestral)

| Data-Base | Linhas |
|---|---|
| 2024-09 | 7.402 |
| 2024-12 | 7.417 |
| 2025-03 | 7.459 |
| 2025-06 | 7.495 |
| 2025-09 | 7.596 |
| 2025-12 | 7.637 |
| 2026-03 | 7.591 |

### Evidência 15 — Tabela Antiga (bc_dados_mensais) Vazia

| Métrica | Valor |
|---|---|
| Linhas remanescentes | 0 |

A tabela antiga `bc_dados_mensais` foi esvaziada. Todos os dados foram migrados para o novo modelo linha a linha em `bc_dados_linha`.

### Evidência 16 — Hashes Únicos (Sem Duplicatas)

| Métrica | Valor |
|---|---|
| Hashes únicos | 30 |
| Total de importações | 30 |

Cada ZIP importado possui um hash SHA-256 distinto, confirmando que não há duplicatas.

### Evidência 17 — Segmentos Consolidados (Mensal)

23 datas-base disponíveis, de 2024-07 a 2026-05, com aproximadamente 780 linhas por mês.

### Evidência 18 — Bens Imóveis Grupos (Mensal)

23 datas-base disponíveis, de 2024-07 a 2026-05, com crescimento de 2.249 a 2.779 linhas por mês.

---

## Log Completo da Importação

```
=== Batch import: 32 ZIPs (start=0) ===
[consolidados] 202606Consorcios.zip ... SKIP (não disponível)
[consolidados] 202605Consorcios.zip ... OK (3542 linhas)
[consolidados] 202604Consorcios.zip ... OK (3376 linhas)
[consolidados] 202603Consorcios.zip ... OK (18139 linhas)
[consolidados] 202602Consorcios.zip ... OK (3497 linhas)
[consolidados] 202601Consorcios.zip ... OK (3477 linhas)
[consolidados] 202512Consorcios.zip ... OK (18309 linhas)
[consolidados] 202511Consorcios.zip ... OK (3426 linhas)
[consolidados] 202510Consorcios.zip ... OK (3400 linhas)
[consolidados] 202509Consorcios.zip ... OK (18339 linhas)
[consolidados] 202508Consorcios.zip ... OK (3285 linhas)
[consolidados] 202507Consorcios.zip ... OK (3252 linhas)
[consolidados] 202506Consorcios.zip ... OK (18134 linhas)
[consolidados] 202505Consorcios.zip ... OK (3202 linhas)
[consolidados] 202504Consorcios.zip ... OK (3174 linhas)
[consolidados] 202503Consorcios.zip ... OK (18039 linhas)
[consolidados] 202502Consorcios.zip ... OK (3131 linhas)
[consolidados] 202501Consorcios.zip ... OK (3125 linhas)
[consolidados] 202412Consorcios.zip ... OK (18072 linhas)
[consolidados] 202411Consorcios.zip ... OK (3086 linhas)
[consolidados] 202410Consorcios.zip ... OK (3094 linhas)
[consolidados] 202409Consorcios.zip ... OK (18186 linhas)
[consolidados] 202408Consorcios.zip ... OK (3036 linhas)
[consolidados] 202407Consorcios.zip ... OK (3030 linhas)
[dados_uf] 202606Consorcios_UF.zip ... SKIP (não disponível)
[dados_uf] 202603Consorcios_UF.zip ... OK (7591 linhas)
[dados_uf] 202512Consorcios_UF.zip ... OK (7637 linhas)
[dados_uf] 202509Consorcios_UF.zip ... OK (7596 linhas)
[dados_uf] 202506Consorcios_UF.zip ... OK (7495 linhas)
[dados_uf] 202503Consorcios_UF.zip ... OK (7459 linhas)
[dados_uf] 202412Consorcios_UF.zip ... OK (7417 linhas)
[dados_uf] 202409Consorcios_UF.zip ... OK (7402 linhas)
=== Resumo do batch ===
Sucessos: 30
Falhas: 0
Ignorados: 2
Total de linhas: 231948
```

---

## Resumo Final

| Indicador | Valor |
|---|---|
| **Modelo arquitetural** | 1 linha CSV = 1 linha no banco |
| **Tabela ativa** | `bc_dados_linha` |
| **ZIPs processados com sucesso** | 30 |
| **ZIPs indisponíveis (BC ainda não publicou)** | 2 |
| **Falhas** | 0 |
| **Total de linhas individuais no banco** | 231.948 |
| **Período coberto (consolidados)** | jul/2024 a mai/2026 (23 meses) |
| **Período coberto (dados_uf)** | set/2024 a mar/2026 (7 trimestres) |
| **CNPJs únicos** | 136 |
| **Interseção de CNPJs entre bases** | 130 |
| **Nomes de administradoras** | 143 |
| **Arquivos extraídos e registrados** | 90 |
| **Hashes únicos (sem duplicatas)** | 30 |
| **Tabela antiga (bc_dados_mensais)** | Vazia (0 linhas) |
| **Limite de 6 MB do TiDB** | Eliminado (cada linha é individual) |

A implementação da Alternativa A está concluída e validada. O problema do limite de 6 MB do TiDB foi eliminado definitivamente, pois cada linha do CSV é armazenada individualmente como um registro no banco de dados, respeitando integralmente a regra arquitetural aprovada.
