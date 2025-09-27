const APITester = require('./utils');
const config = require('./config.example');

async function testParticipants() {
  console.log('👥 Testando Participantes...\n');
  
  const tester = new APITester(config);
  
  try {
    // Fazer login primeiro
    await tester.login(config.TEST_USER.email, config.TEST_USER.password);

    // Criar empresa, evento e viagem primeiro
    console.log('🏗️ Criando dados necessários para testes...');
    
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

    // Criar viagem
    const createTripQuery = `
      mutation CreateTrip($input: CreateTripInput!) {
        createTrip(input: $input) {
          id
          title
          code
        }
      }
    `;
    const tripData = {
      ...config.TEST_TRIP,
      eventId: tester.eventId
    };
    const tripResult = await tester.graphqlRequest(createTripQuery, {
      input: tripData
    }, tester.token);
    
    if (tripResult.data?.createTrip) {
      tester.tripId = tripResult.data.createTrip.id;
      tester.tripCode = tripResult.data.createTrip.code;
    }

    // Teste 1: Participar de uma viagem
    console.log('\n1️⃣ Testando participação em viagem...');
    try {
      const joinTripQuery = `
        mutation JoinTrip($tripId: ID!, $code: String) {
          joinTrip(tripId: $tripId, code: $code) {
            id
            joinedAt
            user {
              id
              name
              email
            }
            trip {
              id
              title
              totalParticipants
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(joinTripQuery, {
        tripId: tester.tripId,
        code: tester.tripCode
      }, tester.token);

      if (result.data?.joinTrip) {
        tester.participantId = result.data.joinTrip.id;
        console.log('✅ Participar em viagem: SUCESSO');
        console.log(`   ID da participação: ${result.data.joinTrip.id}`);
        console.log(`   Total de participantes: ${result.data.joinTrip.trip.totalParticipants}`);
        console.log(`   Data de entrada: ${result.data.joinTrip.joinedAt}`);
      } else {
        console.log('❌ Participar em viagem: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Participar em viagem: FALHOU -', error.message);
    }

    // Teste 2: Minhas participações
    console.log('\n2️⃣ Testando "minhas participações"...');
    try {
      const myParticipationsQuery = `
        query MyParticipations {
          myParticipations {
            id
            joinedAt
            trip {
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
              event {
                id
                title
                city
              }
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(myParticipationsQuery, {}, tester.token);

      if (result.data?.myParticipations) {
        console.log('✅ Minhas participações: SUCESSO');
        console.log(`   Total: ${result.data.myParticipations.length}`);
        result.data.myParticipations.forEach((participation, index) => {
          console.log(`   ${index + 1}. ${participation.trip.title} - ${participation.trip.originCity} → ${participation.trip.destinationCity}`);
        });
      } else {
        console.log('❌ Minhas participações: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Minhas participações: FALHOU -', error.message);
    }

    // Teste 3: Verificar participantes da viagem
    if (tester.tripId) {
      console.log('\n3️⃣ Testando listagem de participantes da viagem...');
      try {
        const tripQuery = `
          query Trip($id: ID!) {
            trip(id: $id) {
              id
              title
              totalParticipants
              participants {
                id
                joinedAt
                user {
                  id
                  name
                  email
                  avatarUrl
                }
              }
            }
          }
        `;

        const result = await tester.graphqlRequest(tripQuery, {
          id: tester.tripId
        }, tester.token);

        if (result.data?.trip) {
          console.log('✅ Listar participantes: SUCESSO');
          console.log(`   Viagem: ${result.data.trip.title}`);
          console.log(`   Total de participantes: ${result.data.trip.totalParticipants}`);
          console.log(`   Participantes detalhados: ${result.data.trip.participants.length}`);
          
          result.data.trip.participants.forEach((participant, index) => {
            console.log(`   ${index + 1}. ${participant.user.name} (${participant.user.email}) - ${participant.joinedAt}`);
          });
        } else {
          console.log('❌ Listar participantes: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Listar participantes: FALHOU -', error.message);
      }
    }

    // Teste 4: Tentar participar novamente da mesma viagem
    console.log('\n4️⃣ Testando participação duplicada...');
    try {
      const joinTripQuery = `
        mutation JoinTrip($tripId: ID!, $code: String) {
          joinTrip(tripId: $tripId, code: $code) {
            id
            joinedAt
          }
        }
      `;

      const result = await tester.graphqlRequest(joinTripQuery, {
        tripId: tester.tripId,
        code: tester.tripCode
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Participação duplicada: SUCESSO - Erro esperado (já participando)');
      } else {
        console.log('❌ Participação duplicada: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Participação duplicada: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 5: Participar sem código
    console.log('\n5️⃣ Testando participação sem código...');
    try {
      const joinTripQuery = `
        mutation JoinTrip($tripId: ID!, $code: String) {
          joinTrip(tripId: $tripId, code: $code) {
            id
            joinedAt
          }
        }
      `;

      const result = await tester.graphqlRequest(joinTripQuery, {
        tripId: tester.tripId
        // Sem código
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Participação sem código: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Participação sem código: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Participação sem código: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 6: Participar com código inválido
    console.log('\n6️⃣ Testando participação com código inválido...');
    try {
      const joinTripQuery = `
        mutation JoinTrip($tripId: ID!, $code: String) {
          joinTrip(tripId: $tripId, code: $code) {
            id
            joinedAt
          }
        }
      `;

      const result = await tester.graphqlRequest(joinTripQuery, {
        tripId: tester.tripId,
        code: 'INVALID_CODE'
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Participação com código inválido: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Participação com código inválido: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Participação com código inválido: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 7: Sair da viagem
    if (tester.participantId) {
      console.log('\n7️⃣ Testando saída da viagem...');
      try {
        const leaveTripQuery = `
          mutation LeaveTrip($participantId: ID!) {
            leaveTrip(participantId: $participantId)
          }
        `;

        const result = await tester.graphqlRequest(leaveTripQuery, {
          participantId: tester.participantId
        }, tester.token);

        if (result.data?.leaveTrip) {
          console.log('✅ Sair da viagem: SUCESSO');
          tester.participantId = null; // Marcar como removido
        } else {
          console.log('❌ Sair da viagem: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Sair da viagem: FALHOU -', error.message);
      }
    }

    // Teste 8: Verificar contagem de participantes após sair
    if (tester.tripId) {
      console.log('\n8️⃣ Testando contagem após sair da viagem...');
      try {
        const tripQuery = `
          query Trip($id: ID!) {
            trip(id: $id) {
              id
              title
              totalParticipants
              participants {
                id
                user {
                  name
                }
              }
            }
          }
        `;

        const result = await tester.graphqlRequest(tripQuery, {
          id: tester.tripId
        }, tester.token);

        if (result.data?.trip) {
          console.log('✅ Contagem após sair: SUCESSO');
          console.log(`   Total de participantes: ${result.data.trip.totalParticipants}`);
          console.log(`   Participantes restantes: ${result.data.trip.participants.length}`);
        } else {
          console.log('❌ Contagem após sair: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Contagem após sair: FALHOU -', error.message);
      }
    }

    // Teste 9: Tentar sair de uma participação que não existe
    console.log('\n9️⃣ Testando saída de participação inexistente...');
    try {
      const leaveTripQuery = `
        mutation LeaveTrip($participantId: ID!) {
          leaveTrip(participantId: $participantId)
        }
      `;

      const result = await tester.graphqlRequest(leaveTripQuery, {
        participantId: '999999'
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Sair de participação inexistente: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Sair de participação inexistente: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Sair de participação inexistente: SUCESSO - Erro esperado:', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de participantes:', error.message);
  } finally {
    // Limpeza
    await tester.cleanup();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testParticipants().catch(console.error);
}

module.exports = testParticipants;
