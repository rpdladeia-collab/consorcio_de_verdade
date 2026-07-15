FROM node:22-slim

# Instalar libatomic1 (necessário para algumas dependências nativas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar todos os arquivos do projeto
COPY . .

# Instalar dependências usando corepack + pnpm
RUN npm install -g corepack@latest && corepack pnpm install

# Build do projeto (frontend + backend)
RUN corepack pnpm run build

# Configurar ambiente de produção
ENV NODE_ENV=production

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "dist/index.js"]
