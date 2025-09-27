# 🧪 Testes da API EventGo

Este diretório contém uma suíte completa de testes para todos os endpoints da API GraphQL do EventGo.

## 📋 **Estrutura dos Testes**

### **Módulos Testados:**

- ✅ **Autenticação** (`auth.test.js`) - Login, signup, verificação de usuário
- ✅ **Empresas** (`companies.test.js`) - CRUD de empresas
- ✅ **Eventos** (`events.test.js`) - CRUD de eventos
- ✅ **Viagens** (`trips.test.js`) - CRUD de viagens
- ✅ **Participantes** (`participants.test.js`) - Participação em viagens
- ✅ **Itens de Custo** (`cost-items.test.js`) - Gestão de custos
- ✅ **Ofertas de Veículos** (`vehicle-offers.test.js`) - Ofertas de transporte

### **Arquivos:**

- `test-runner.js` - Executor principal dos testes
- `utils.js` - Utilitários compartilhados (APITester)
- `config.example.js` - Configuração de teste
- `package.json` - Dependências dos testes

## 🚀 **Como Executar**

### **1. Instalar Dependências**

```bash
cd tests
npm install
```

### **2. Configurar**

Edite o arquivo `config.example.js` se necessário:

```javascript
module.exports = {
  API_URL: "http://localhost:4000/graphql", // URL da sua API
  TEST_USER: {
    email: "test@example.com",
    password: "testpassword123",
    name: "Test User",
  },
  // ... outros dados de teste
};
```

### **3. Executar Testes**

#### **Todos os Testes:**

```bash
npm test
# ou
node test-runner.js
```

#### **Teste Específico:**

```bash
# Testes de autenticação
npm run test:auth
# ou
node test-runner.js auth

# Testes de eventos
npm run test:events
# ou
node test-runner.js eventos

# Testes de viagens
npm run test:trips
# ou
node test-runner.js viagens
```

#### **Scripts Disponíveis:**

```bash
npm run test:auth           # Testes de autenticação
npm run test:events         # Testes de eventos
npm run test:trips          # Testes de viagens
npm run test:companies      # Testes de empresas
npm run test:participants   # Testes de participantes
npm run test:cost-items     # Testes de itens de custo
npm run test:vehicle-offers # Testes de ofertas de veículos
```

## 📊 **O que os Testes Verificam**

### **✅ Casos de Sucesso:**

- Criação, leitura, atualização e exclusão (CRUD)
- Listagens com filtros
- Relacionamentos entre entidades
- Autenticação e autorização
- Validações de negócio

### **❌ Casos de Erro:**

- Dados inválidos
- Recursos inexistentes
- Permissões insuficientes
- Validações de campos obrigatórios
- Relacionamentos quebrados

### **🔍 Cobertura de Testes:**

#### **Autenticação:**

- ✅ Login com credenciais válidas
- ✅ Signup de novo usuário
- ✅ Verificação de usuário autenticado (query `me`)
- ❌ Login com credenciais inválidas
- ❌ Acesso sem token

#### **Empresas:**

- ✅ Criar empresa
- ✅ Listar empresas
- ✅ Buscar empresas do usuário
- ✅ Atualizar empresa
- ✅ Deletar empresa
- ❌ Operações sem autenticação

#### **Eventos:**

- ✅ Criar evento
- ✅ Listar eventos
- ✅ Buscar evento por ID
- ✅ Filtrar por cidade
- ✅ Buscar por texto
- ✅ Atualizar evento
- ✅ Deletar evento
- ❌ Criar evento sem empresa

#### **Viagens:**

- ✅ Criar viagem
- ✅ Listar viagens
- ✅ Buscar viagem por ID
- ✅ Buscar viagem por código
- ✅ Filtrar por cidade/evento
- ✅ Atualizar viagem
- ✅ Deletar viagem
- ❌ Criar viagem sem evento

#### **Participantes:**

- ✅ Participar de viagem
- ✅ Listar participações
- ✅ Ver participantes da viagem
- ✅ Sair da viagem
- ❌ Participação duplicada
- ❌ Participar sem código
- ❌ Código inválido

#### **Itens de Custo:**

- ✅ Criar item de custo
- ✅ Listar itens da viagem
- ✅ Buscar item por ID
- ✅ Atualizar item
- ✅ Deletar item
- ✅ Diferentes categorias
- ❌ Criar item sem viagem

#### **Ofertas de Veículos:**

- ✅ Criar oferta
- ✅ Listar ofertas
- ✅ Buscar oferta por ID
- ✅ Atualizar oferta
- ✅ Deletar oferta
- ✅ Diferentes tipos de veículos
- ❌ Criar oferta sem viagem/empresa

## 🐛 **Interpretando os Resultados**

### **✅ SUCESSO:**

```
✅ Criar viagem: SUCESSO
   ID: 123
   Título: Test Trip
```

### **❌ FALHA:**

```
❌ Criar viagem: FALHOU - [{"message":"Field 'eventId' is required"}]
```

### **📊 Resumo:**

```
📊 Resumo dos Testes
✅ Passou: 45
❌ Falhou: 3
⏱️  Tempo total: 2500ms
```

## 🔧 **Solução de Problemas**

### **Erro de Conexão:**

```
❌ Erro geral nos testes: connect ECONNREFUSED
```

**Solução:** Verifique se a API está rodando em `http://localhost:4000`

### **Erro de Autenticação:**

```
❌ Login: FALHOU - Invalid credentials
```

**Solução:** Verifique os dados de teste em `config.example.js`

### **Erro de Dependências:**

```
Error: Cannot find module 'axios'
```

**Solução:** Execute `npm install` na pasta `tests`

### **Erro de Schema:**

```
❌ Criar viagem: FALHOU - Field 'eventId' is required
```

**Solução:** Verifique se o schema GraphQL está atualizado

## 📈 **Melhorias Futuras**

- [ ] **Testes de Performance** - Medir tempo de resposta
- [ ] **Testes de Carga** - Múltiplas requisições simultâneas
- [ ] **Testes de Integração** - Fluxos completos end-to-end
- [ ] **Coverage Report** - Relatório de cobertura de código
- [ ] **CI/CD Integration** - Execução automática no pipeline

## 💡 **Dicas**

1. **Execute os testes regularmente** durante o desenvolvimento
2. **Verifique os logs detalhados** para entender falhas
3. **Use dados de teste únicos** para evitar conflitos
4. **Mantenha os testes atualizados** quando mudar a API
5. **Execute testes específicos** durante desenvolvimento de features

---

**🎯 Objetivo:** Garantir que todos os endpoints da API funcionem corretamente e identificar problemas antes do deploy!
