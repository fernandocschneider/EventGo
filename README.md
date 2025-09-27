# EventGO - Plataforma de Viagens em Grupo

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

## 📊 Dados de Exemplo (Seed)

O comando `npm run seed` cria:

- 3 usuários (3 users + 2 companies)
- 2 empresas
- 4 eventos
- 2 viagens com participantes
- Itens de custo e ofertas de veículos

### Credenciais de Teste

**Usuários:**

- Email: `user1@example.com` | Senha: `password123`
- Email: `user2@example.com` | Senha: `password123`
- Email: `user3@example.com` | Senha: `password123`

**Empresas:**

- Email: `company1@example.com` | Senha: `password123`
- Email: `company2@example.com` | Senha: `password123`

## 📊 GraphQL API

### Endpoint

- **Development**: http://localhost:4000/graphql
- **Production**: [URL de produção]/graphql

### Exemplos de Queries

```graphql
# Buscar eventos
query GetEvents {
  events {
    id
    title
    description
    city
    venue
    date
  }
}

# Buscar viagem específica
query GetTrip($id: ID!) {
  trip(id: $id) {
    id
    title
    code
    participants {
      id
      user {
        name
      }
    }
    costItems {
      id
      label
      totalAmount
      perPersonShare
    }
  }
}
```

### Exemplos de Mutations

```graphql
# Cadastro de usuário
mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    token
    user {
      id
      name
      email
    }
  }
}

# Criar viagem
mutation CreateTrip($input: CreateTripInput!) {
  createTrip(input: $input) {
    id
    title
    code
    event {
      title
    }
  }
}
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (API + Web)
npm run build        # Build completo
npm run start        # Produção (API + Web)
npm run seed         # Popular banco com dados
npm test             # Executar testes
npm run prisma:migrate    # Executar migrations
npm run prisma:studio     # Interface visual do banco
```

## 🚀 Deploy

### Build para Produção

```bash
# Build completo
npm run build

# Build apenas API
npm run build:api

# Build apenas Web
npm run build:web
```

### Variáveis de Ambiente para Produção

```bash
NODE_ENV=production
DATABASE_URL="sua-url-do-postgres"
JWT_SECRET="seu-jwt-secret-super-seguro"
NEXT_PUBLIC_API_URL="https://sua-api.com/graphql"
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.
