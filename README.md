# EventGO - Plataforma de Viagens em Grupo

# Link para o vídeo: 
https://youtu.be/TVcp3JXXSlc

# Link para o projeto online:
https://eventgo.up.railway.app/

Plataforma web para organização de viagens em grupo para eventos, com divisão automática de custos e ofertas de veículos.

## 🚀 Tecnologias

- **Frontend**: React, Next.js 14, Tailwind CSS, Apollo Client
- **Backend**: Node.js, GraphQL (Apollo Server), Prisma ORM
- **Database**: PostgreSQL
- **Containerização**: Docker & Docker Compose
- **Autenticação**: JWT

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Docker (recomendado)

### Execução Local

1. **Clone o repositório**

```bash
git clone <repo-url>
cd group-travel-platform
```

2. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env se necessário
```

3. **Instale as dependências**

```bash
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

4. **Configure o banco de dados**

```bash
# Execute as migrations (cria as tabelas)
npm run prisma:migrate
# Gere o cliente Prisma
npm run prisma:generate
# Execute o seed (dados de exemplo)
npm run seed
```

5. **Execute o projeto**

```bash
# Modo desenvolvimento (API + Web)
npm run dev

# Ou execute separadamente:
# Terminal 1: Backend
npm run dev:api

# Terminal 2: Frontend
npm run dev:web
```

### Execução com Docker

1. **Clone e configure**

```bash
git clone <repo-url>
cd group-travel-platform
cp .env.example .env
```

2. **Execute com Docker Compose**

```bash
# Build e execução
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

3. **Acesse a aplicação**

- Frontend: http://localhost:3000
- Backend/GraphQL Playground: http://localhost:4000/graphql

## 🗄️ Banco de Dados

### Conexão com DBeaver

Para conectar ao banco de dados PostgreSQL no DBeaver:

**Configurações de Conexão:**

- **Host:** `localhost`
- **Porta:** `5432`
- **Database:** `group_travel`
- **Username:** `postgres`
- **Password:** `postgres`
- **Schema:** `public`

### Comandos Úteis

```bash
# Executar migrations
npm run prisma:migrate

# Visualizar banco no Prisma Studio
npm run prisma:studio

# Reset do banco (cuidado!)
cd apps/api && npx prisma migrate reset
```
