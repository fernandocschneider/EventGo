const APITester = require('./utils');
const config = require('./config.example');

async function testTrips() {
  console.log('🚌 Testando Viagens...\n');
  
  const tester = new APITester(config);
  
  try {
    // Fazer login primeiro
    await tester.login(config.TEST_USER.email, config.TEST_USER.password);

    // Criar empresa e evento primeiro
    console.log('🏢 Criando empresa e evento para testes...');
    
    // Criar empresa
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
    }

    // Criar evento
    const createEventQuery = `
      mutation CreateEvent($input: CreateEventInput!) {
        createEvent(input: $input) {
          id
          title
        }
      }
    `;
    const eventData = {
      ...config.TEST_EVENT,
      organizerCompanyId: tester.companyId
    };
    const eventResult = await tester.graphqlRequest(createEventQuery, {
      input: eventData
    }, tester.token);
    
    if (eventResult.data?.createEvent) {
      tester.eventId = eventResult.data.createEvent.id;
    }

    // Teste 1: Criar viagem
    console.log('\n1️⃣ Testando criação de viagem...');
    try {
      const createTripQuery = `
        mutation CreateTrip($input: CreateTripInput!) {
          createTrip(input: $input) {
            id
            title
            description
            originCity
            destinationCity
            date
            maxParticipants
            pricePerPerson
            code
            totalParticipants
            createdAt
            organizer {
              id
              name
              email
            }
            event {
              id
              title
              city
            }
          }
        }
      `;

      const tripData = {
        ...config.TEST_TRIP,
        eventId: tester.eventId
      };

      const result = await tester.graphqlRequest(createTripQuery, {
        input: tripData
      }, tester.token);

      if (result.data?.createTrip) {
        tester.tripId = result.data.createTrip.id;
        console.log('✅ Criar viagem: SUCESSO');
        console.log(`   ID: ${result.data.createTrip.id}`);
        console.log(`   Título: ${result.data.createTrip.title}`);
        console.log(`   Rota: ${result.data.createTrip.originCity} → ${result.data.createTrip.destinationCity}`);
        console.log(`   Código: ${result.data.createTrip.code}`);
        console.log(`   Preço: R$ ${result.data.createTrip.pricePerPerson}`);
      } else {
        console.log('❌ Criar viagem: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Criar viagem: FALHOU -', error.message);
    }

    // Teste 2: Listar viagens
    console.log('\n2️⃣ Testando listagem de viagens...');
    try {
      const tripsQuery = `
        query Trips($filter: TripsFilter, $limit: Int) {
          trips(filter: $filter, limit: $limit) {
            id
            title
            originCity
            destinationCity
            date
            maxParticipants
            totalParticipants
            pricePerPerson
            code
            organizer {
              id
              name
            }
            event {
              id
              title
              city
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(tripsQuery, {
        limit: 10
      }, tester.token);

      if (result.data?.trips) {
        console.log('✅ Listar viagens: SUCESSO');
        console.log(`   Total encontradas: ${result.data.trips.length}`);
        result.data.trips.forEach((trip, index) => {
          console.log(`   ${index + 1}. ${trip.title} - ${trip.originCity} → ${trip.destinationCity} (${trip.totalParticipants}/${trip.maxParticipants})`);
        });
      } else {
        console.log('❌ Listar viagens: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar viagens: FALHOU -', error.message);
    }

    // Teste 3: Buscar viagem por ID
    if (tester.tripId) {
      console.log('\n3️⃣ Testando busca de viagem por ID...');
      try {
        const tripQuery = `
          query Trip($id: ID!) {
            trip(id: $id) {
              id
              title
              description
              originCity
              destinationCity
              date
              maxParticipants
              pricePerPerson
              code
              totalParticipants
              organizer {
                id
                name
                email
              }
              event {
                id
                title
                city
                date
              }
              participants {
                id
                user {
                  id
                  name
                  email
                }
                joinedAt
              }
            }
          }
        `;

        const result = await tester.graphqlRequest(tripQuery, {
          id: tester.tripId
        }, tester.token);

        if (result.data?.trip) {
          console.log('✅ Buscar viagem por ID: SUCESSO');
          console.log(`   Título: ${result.data.trip.title}`);
          console.log(`   Participantes: ${result.data.trip.participants.length}`);
        } else {
          console.log('❌ Buscar viagem por ID: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Buscar viagem por ID: FALHOU -', error.message);
      }
    }

    // Teste 4: Buscar viagem por código
    if (tester.tripId) {
      console.log('\n4️⃣ Testando busca de viagem por código...');
      try {
        // Primeiro, buscar o código da viagem
        const tripQuery = `
          query Trip($id: ID!) {
            trip(id: $id) {
              code
            }
          }
        `;
        const tripResult = await tester.graphqlRequest(tripQuery, {
          id: tester.tripId
        }, tester.token);

        if (tripResult.data?.trip?.code) {
          const tripCode = tripResult.data.trip.code;
          
          const tripByCodeQuery = `
            query TripByCode($code: String!) {
              tripByCode(code: $code) {
                id
                title
                originCity
                destinationCity
                date
                code
                organizer {
                  id
                  name
                }
              }
            }
          `;

          const result = await tester.graphqlRequest(tripByCodeQuery, {
            code: tripCode
          }, tester.token);

          if (result.data?.tripByCode) {
            console.log('✅ Buscar viagem por código: SUCESSO');
            console.log(`   Código: ${result.data.tripByCode.code}`);
            console.log(`   Título: ${result.data.tripByCode.title}`);
          } else {
            console.log('❌ Buscar viagem por código: FALHOU -', JSON.stringify(result.errors));
          }
        }
      } catch (error) {
        console.log('❌ Buscar viagem por código: FALHOU -', error.message);
      }
    }

    // Teste 5: Minhas viagens
    console.log('\n5️⃣ Testando "minhas viagens"...');
    try {
      const myTripsQuery = `
        query MyTrips {
          myTrips {
            id
            title
            originCity
            destinationCity
            date
            totalParticipants
            code
            event {
              id
              title
              city
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(myTripsQuery, {}, tester.token);

      if (result.data?.myTrips) {
        console.log('✅ Minhas viagens: SUCESSO');
        console.log(`   Total: ${result.data.myTrips.length}`);
        result.data.myTrips.forEach((trip, index) => {
          console.log(`   ${index + 1}. ${trip.title} - ${trip.originCity} → ${trip.destinationCity}`);
        });
      } else {
        console.log('❌ Minhas viagens: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Minhas viagens: FALHOU -', error.message);
    }

    // Teste 6: Filtrar viagens por cidade
    console.log('\n6️⃣ Testando filtro de viagens por cidade...');
    try {
      const tripsQuery = `
        query Trips($filter: TripsFilter, $limit: Int) {
          trips(filter: $filter, limit: $limit) {
            id
            title
            originCity
            destinationCity
          }
        }
      `;

      const result = await tester.graphqlRequest(tripsQuery, {
        filter: { city: config.TEST_TRIP.originCity },
        limit: 10
      }, tester.token);

      if (result.data?.trips) {
        console.log('✅ Filtrar por cidade: SUCESSO');
        console.log(`   Viagens encontradas: ${result.data.trips.length}`);
      } else {
        console.log('❌ Filtrar por cidade: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Filtrar por cidade: FALHOU -', error.message);
    }

    // Teste 7: Filtrar viagens por evento
    if (tester.eventId) {
      console.log('\n7️⃣ Testando filtro de viagens por evento...');
      try {
        const tripsQuery = `
          query Trips($filter: TripsFilter, $limit: Int) {
            trips(filter: $filter, limit: $limit) {
              id
              title
              originCity
              destinationCity
              event {
                id
                title
              }
            }
          }
        `;

        const result = await tester.graphqlRequest(tripsQuery, {
          filter: { eventId: tester.eventId },
          limit: 10
        }, tester.token);

        if (result.data?.trips) {
          console.log('✅ Filtrar por evento: SUCESSO');
          console.log(`   Viagens encontradas: ${result.data.trips.length}`);
        } else {
          console.log('❌ Filtrar por evento: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Filtrar por evento: FALHOU -', error.message);
      }
    }

    // Teste 8: Atualizar viagem
    if (tester.tripId) {
      console.log('\n8️⃣ Testando atualização de viagem...');
      try {
        const updateTripQuery = `
          mutation UpdateTrip($id: ID!, $input: CreateTripInput!) {
            updateTrip(id: $id, input: $input) {
              id
              title
              description
              originCity
              destinationCity
              pricePerPerson
            }
          }
        `;

        const updateData = {
          ...config.TEST_TRIP,
          title: 'Updated Trip Title',
          pricePerPerson: 150.75,
          eventId: tester.eventId
        };

        const result = await tester.graphqlRequest(updateTripQuery, {
          id: tester.tripId,
          input: updateData
        }, tester.token);

        if (result.data?.updateTrip) {
          console.log('✅ Atualizar viagem: SUCESSO');
          console.log(`   Título atualizado: ${result.data.updateTrip.title}`);
          console.log(`   Preço atualizado: R$ ${result.data.updateTrip.pricePerPerson}`);
        } else {
          console.log('❌ Atualizar viagem: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Atualizar viagem: FALHOU -', error.message);
      }
    }

    // Teste 9: Deletar viagem
    if (tester.tripId) {
      console.log('\n9️⃣ Testando exclusão de viagem...');
      try {
        const deleteTripQuery = `
          mutation DeleteTrip($id: ID!) {
            deleteTrip(id: $id)
          }
        `;

        const result = await tester.graphqlRequest(deleteTripQuery, {
          id: tester.tripId
        }, tester.token);

        if (result.data?.deleteTrip) {
          console.log('✅ Deletar viagem: SUCESSO');
          tester.tripId = null; // Marcar como deletada
        } else {
          console.log('❌ Deletar viagem: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Deletar viagem: FALHOU -', error.message);
      }
    }

    // Teste 10: Criar viagem sem evento
    console.log('\n🔟 Testando criação de viagem sem evento...');
    try {
      const createTripQuery = `
        mutation CreateTrip($input: CreateTripInput!) {
          createTrip(input: $input) {
            id
            title
          }
        }
      `;

      const tripDataWithoutEvent = {
        ...config.TEST_TRIP,
        // Sem eventId
      };

      const result = await tester.graphqlRequest(createTripQuery, {
        input: tripDataWithoutEvent
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Criar viagem sem evento: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Criar viagem sem evento: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Criar viagem sem evento: SUCESSO - Erro esperado:', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de viagens:', error.message);
  } finally {
    // Limpeza
    await tester.cleanup();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testTrips().catch(console.error);
}

module.exports = testTrips;
