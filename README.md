# Plataforma de Organização de Viagens em Grupo

Uma plataforma web responsiva para facilitar a organização de viagens em grupo para eventos como shows, festivais e competições. Empresas podem cadastrar eventos e oferecer veículos, enquanto usuários criam viagens e dividem custos automaticamente.

## 🚀 Tecnologias

- **Frontend**: React, Next.js 14, Tailwind CSS, Apollo Client
- **Backend**: Node.js, GraphQL (Apollo Server), Prisma ORM
- **Database**: PostgreSQL
- **Containerização**: Docker & Docker Compose
- **Autenticação**: JWT
- **Testes**: Jest, Playwright

## 📋 Funcionalidades

### Para Usuários
- ✅ Cadastro e login com email/senha
- ✅ Buscar eventos e viagens
- ✅ Criar viagens associadas a eventos
- ✅ Participar de viagens via link/código único
- ✅ Dividir custos automaticamente entre participantes
- ✅ Visualizar ofertas de veículos

### Para Empresas
- ✅ Cadastrar eventos
- ✅ Oferecer veículos para deslocamento
- ✅ Gerenciar ofertas e eventos

### Para Organizadores
- ✅ Gerenciar participantes da viagem
- ✅ Criar e editar itens de custo
- ✅ Compartilhar viagem via link/código
- ✅ Dashboard de controle

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Docker (opcional)

### Opção 1: Execução Local (sem Docker)

1. **Clone o repositório**
```bash
git clone <repo-url>
cd group-travel-platform
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
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
# Execute as migrations
npm run prisma:migrate
# Gere o cliente Prisma
npm run prisma:generate
# Execute o seed (dados de exemplo)
npm run seed
```

5. **Execute o projeto**
```bash
# Modo desenvolvimento
npm run dev

# Ou execute separadamente:
# Terminal 1: Backend
npm run dev:api

# Terminal 2: Frontend
npm run dev:web
```

### Opção 2: Execução com Docker

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

### Modelos Principais

- **User**: Usuários da plataforma
- **Company**: Empresas que cadastram eventos
- **Event**: Eventos (shows, festivais, etc.)
- **Trip**: Viagens criadas por usuários
- **Participant**: Participantes de uma viagem
- **CostItem**: Itens de custo (gasolina, hospedagem, etc.)
- **VehicleOffer**: Ofertas de veículos pelas empresas

### Comandos Úteis

```bash
# Executar migrations
npm run prisma:migrate

# Visualizar banco no Prisma Studio
npm run prisma:studio

# Reset do banco (cuidado!)
cd apps/api && npx prisma migrate reset
```

## 📊 GraphQL API

### Endpoint
- **Development**: http://localhost:4000/graphql
- **Production**: [URL de produção]/graphql

### Queries Principais

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

### Mutations Principais

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

# Entrar em viagem
mutation JoinTrip($tripId: ID!, $code: String) {
  joinTrip(tripId: $tripId, code: $code) {
    id
    user {
      name
    }
  }
}

# Criar item de custo
mutation CreateCostItem($input: CreateCostItemInput!) {
  createCostItem(input: $input) {
    id
    label
    totalAmount
    perPersonShare
  }
}
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes do backend
npm run test:api

# Testes do frontend
npm run test:web

# Testes E2E (Playwright)
cd apps/web && npx playwright test
```

## 🌱 Dados de Exemplo (Seed)

O comando `npm run seed` cria:
- 3 usuários de exemplo
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

## 📱 Funcionalidades Implementadas

### ✅ MVP Concluído
- [x] Sistema de autenticação JWT
- [x] CRUD completo para todos os modelos
- [x] Interface responsiva mobile-first
- [x] Geração de código único para viagens
- [x] Divisão automática de custos
- [x] Dashboard de organizador/empresa
- [x] Ofertas de veículos
- [x] Containerização Docker

### 🔄 Próximas Funcionalidades
- [ ] Sistema de notificações em tempo real
- [ ] Chat entre participantes
- [ ] Integração com mapas para rotas
- [ ] Sistema de avaliações
- [ ] Integração de pagamentos (Stripe)
- [ ] Notificações push mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato:
- Email: suporte@grouptravel.com
- Issues: [GitHub Issues](link-para-issues)

---

**Desenvolvido com ❤️ para facilitar viagens em grupo**