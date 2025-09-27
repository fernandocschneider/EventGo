FROM node:18-alpine

WORKDIR /app

# Instalar OpenSSL para evitar warnings do Prisma
RUN apk add --no-cache openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Limpar cache e remover devDependencies após o build
RUN npm cache clean --force
RUN npm prune --production

EXPOSE 4000

CMD ["npm", "start"]