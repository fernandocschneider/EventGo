const APITester = require('./utils');
const config = require('./config.example');

async function testEvents() {
  console.log('🎉 Testando Eventos...\n');
  
  const tester = new APITester(config);
  
  try {
    // Fazer login primeiro
    await tester.login(config.TEST_USER.email, config.TEST_USER.password);

    // Criar uma empresa primeiro (necessária para criar eventos)
    console.log('🏢 Criando empresa para testes...');
    const createCompanyQuery = `
      mutation CreateCompany($input: CreateCompanyInput!) {
        createCompany(input: $input) {
          id
          name
        }
      }
    `;
    const companyResult = await tester.graphqlRequest(createCompanyQuery, {
      input: config.TEST_COMPANY
    }, tester.token);
    
    if (companyResult.data?.createCompany) {
      tester.companyId = companyResult.data.createCompany.id;
      console.log('✅ Empresa criada para testes');
    }

    // Teste 1: Criar evento
    console.log('\n1️⃣ Testando criação de evento...');
    try {
      const createEventQuery = `
        mutation CreateEvent($input: CreateEventInput!) {
          createEvent(input: $input) {
            id
            title
            description
            city
            venue
            date
            createdAt
            organizerCompany {
              id
              name
            }
          }
        }
      `;

      const eventData = {
        ...config.TEST_EVENT,
        organizerCompanyId: tester.companyId
      };

      const result = await tester.graphqlRequest(createEventQuery, {
        input: eventData
      }, tester.token);

      if (result.data?.createEvent) {
        tester.eventId = result.data.createEvent.id;
        console.log('✅ Criar evento: SUCESSO');
        console.log(`   ID: ${result.data.createEvent.id}`);
        console.log(`   Título: ${result.data.createEvent.title}`);
        console.log(`   Cidade: ${result.data.createEvent.city}`);
        console.log(`   Data: ${result.data.createEvent.date}`);
      } else {
        console.log('❌ Criar evento: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Criar evento: FALHOU -', error.message);
    }

    // Teste 2: Listar eventos
    console.log('\n2️⃣ Testando listagem de eventos...');
    try {
      const eventsQuery = `
        query Events($filter: EventsFilter, $limit: Int) {
          events(filter: $filter, limit: $limit) {
            id
            title
            description
            city
            venue
            date
            createdAt
            organizerCompany {
              id
              name
            }
            trips {
              id
              title
              totalParticipants
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(eventsQuery, {
        limit: 10
      }, tester.token);

      if (result.data?.events) {
        console.log('✅ Listar eventos: SUCESSO');
        console.log(`   Total encontrados: ${result.data.events.length}`);
        result.data.events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} - ${event.city} (${event.trips.length} viagens)`);
        });
      } else {
        console.log('❌ Listar eventos: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar eventos: FALHOU -', error.message);
    }

    // Teste 3: Buscar evento por ID
    if (tester.eventId) {
      console.log('\n3️⃣ Testando busca de evento por ID...');
      try {
        const eventQuery = `
          query Event($id: ID!) {
            event(id: $id) {
              id
              title
              description
              city
              venue
              date
              createdAt
              organizerCompany {
                id
                name
              }
              trips {
                id
                title
                originCity
                destinationCity
                date
                totalParticipants
              }
            }
          }
        `;

        const result = await tester.graphqlRequest(eventQuery, {
          id: tester.eventId
        }, tester.token);

        if (result.data?.event) {
          console.log('✅ Buscar evento por ID: SUCESSO');
          console.log(`   Título: ${result.data.event.title}`);
          console.log(`   Viagens associadas: ${result.data.event.trips.length}`);
        } else {
          console.log('❌ Buscar evento por ID: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Buscar evento por ID: FALHOU -', error.message);
      }
    }

    // Teste 4: Filtrar eventos por cidade
    console.log('\n4️⃣ Testando filtro de eventos por cidade...');
    try {
      const eventsQuery = `
        query Events($filter: EventsFilter, $limit: Int) {
          events(filter: $filter, limit: $limit) {
            id
            title
            city
            date
          }
        }
      `;

      const result = await tester.graphqlRequest(eventsQuery, {
        filter: { city: config.TEST_EVENT.city },
        limit: 10
      }, tester.token);

      if (result.data?.events) {
        console.log('✅ Filtrar por cidade: SUCESSO');
        console.log(`   Eventos encontrados: ${result.data.events.length}`);
        result.data.events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} - ${event.city}`);
        });
      } else {
        console.log('❌ Filtrar por cidade: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Filtrar por cidade: FALHOU -', error.message);
    }

    // Teste 5: Buscar eventos por texto
    console.log('\n5️⃣ Testando busca de eventos por texto...');
    try {
      const eventsQuery = `
        query Events($filter: EventsFilter, $limit: Int) {
          events(filter: $filter, limit: $limit) {
            id
            title
            city
            venue
          }
        }
      `;

      const result = await tester.graphqlRequest(eventsQuery, {
        filter: { search: config.TEST_EVENT.title },
        limit: 10
      }, tester.token);

      if (result.data?.events) {
        console.log('✅ Busca por texto: SUCESSO');
        console.log(`   Eventos encontrados: ${result.data.events.length}`);
      } else {
        console.log('❌ Busca por texto: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Busca por texto: FALHOU -', error.message);
    }

    // Teste 6: Atualizar evento
    if (tester.eventId) {
      console.log('\n6️⃣ Testando atualização de evento...');
      try {
        const updateEventQuery = `
          mutation UpdateEvent($id: ID!, $input: CreateEventInput!) {
            updateEvent(id: $id, input: $input) {
              id
              title
              description
              city
              venue
            }
          }
        `;

        const updateData = {
          ...config.TEST_EVENT,
          title: 'Updated Event Title',
          description: 'Updated event description'
        };

        const result = await tester.graphqlRequest(updateEventQuery, {
          id: tester.eventId,
          input: updateData
        }, tester.token);

        if (result.data?.updateEvent) {
          console.log('✅ Atualizar evento: SUCESSO');
          console.log(`   Título atualizado: ${result.data.updateEvent.title}`);
        } else {
          console.log('❌ Atualizar evento: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Atualizar evento: FALHOU -', error.message);
      }
    }

    // Teste 7: Deletar evento
    if (tester.eventId) {
      console.log('\n7️⃣ Testando exclusão de evento...');
      try {
        const deleteEventQuery = `
          mutation DeleteEvent($id: ID!) {
            deleteEvent(id: $id)
          }
        `;

        const result = await tester.graphqlRequest(deleteEventQuery, {
          id: tester.eventId
        }, tester.token);

        if (result.data?.deleteEvent) {
          console.log('✅ Deletar evento: SUCESSO');
          tester.eventId = null; // Marcar como deletado
        } else {
          console.log('❌ Deletar evento: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Deletar evento: FALHOU -', error.message);
      }
    }

    // Teste 8: Criar evento sem empresa
    console.log('\n8️⃣ Testando criação de evento sem empresa...');
    try {
      const createEventQuery = `
        mutation CreateEvent($input: CreateEventInput!) {
          createEvent(input: $input) {
            id
            title
          }
        }
      `;

      const eventDataWithoutCompany = {
        ...config.TEST_EVENT,
        // Sem organizerCompanyId
      };

      const result = await tester.graphqlRequest(createEventQuery, {
        input: eventDataWithoutCompany
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Criar evento sem empresa: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Criar evento sem empresa: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Criar evento sem empresa: SUCESSO - Erro esperado:', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de eventos:', error.message);
  } finally {
    // Limpeza
    await tester.cleanup();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testEvents().catch(console.error);
}

module.exports = testEvents;
