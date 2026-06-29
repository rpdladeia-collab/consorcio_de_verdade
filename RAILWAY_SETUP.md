# Deploy no Railway — Consórcio de Verdade

## Variáveis de Ambiente Obrigatórias

Configure as seguintes variáveis no painel do Railway (Settings → Variables):

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | Definir como `production` |
| `DATABASE_URL` | String de conexão MySQL/TiDB |
| `JWT_SECRET` | Chave secreta para cookies de sessão |
| `VITE_APP_ID` | ID do app Manus OAuth |
| `OAUTH_SERVER_URL` | URL do servidor OAuth Manus |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login Manus |
| `BUILT_IN_FORGE_API_URL` | URL da API Manus Forge |
| `BUILT_IN_FORGE_API_KEY` | Chave da API Manus Forge (server-side) |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave da API Manus Forge (frontend) |
| `VITE_FRONTEND_FORGE_API_URL` | URL da API Manus Forge (frontend) |
| `OWNER_OPEN_ID` | Open ID do proprietário |
| `OWNER_NAME` | Nome do proprietário |

> **Nota:** A variável `PORT` é injetada automaticamente pelo Railway. Não precisa configurar.

## Comandos de Build e Start

Já configurados no `railway.toml`:
- **Build:** `pnpm install --frozen-lockfile && pnpm run build`
- **Start:** `node dist/index.js`

## Estrutura do Build

```
dist/
  index.js        ← servidor Express (backend + tRPC)
  public/         ← frontend React compilado pelo Vite
    index.html
    assets/
```

O servidor Express serve os arquivos estáticos de `dist/public/` e redireciona
todas as rotas não-API para `index.html` (SPA routing).
