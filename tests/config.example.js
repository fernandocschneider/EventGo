// Configuração para testes da API
module.exports = {
  // URL da API GraphQL
  API_URL: 'http://localhost:4000/graphql',
  
  // Dados de teste para autenticação
  TEST_USER: {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  },
  
  // Dados de teste para empresa
  TEST_COMPANY: {
    name: 'Test Company',
    contactEmail: 'company@example.com',
    description: 'Test Company Description'
  },
  
  // Dados de teste para evento
  TEST_EVENT: {
    title: 'Test Event',
    city: 'Test City',
    venue: 'Test Venue',
    description: 'Test Event Description',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias no futuro
  },
  
  // Dados de teste para viagem
  TEST_TRIP: {
    title: 'Test Trip',
    originCity: 'Origin City',
    destinationCity: 'Destination City',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias no futuro
    description: 'Test Trip Description',
    maxParticipants: 10,
    pricePerPerson: 100.50
  }
};
