const APITester = require('./utils');
const config = require('./config.example');

async function testVehicleOffers() {
  console.log('🚗 Testando Ofertas de Veículos...\n');
  
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
    }

    // Teste 1: Criar oferta de veículo
    console.log('\n1️⃣ Testando criação de oferta de veículo...');
    try {
      const createVehicleOfferQuery = `
        mutation CreateVehicleOffer($input: CreateVehicleOfferInput!) {
          createVehicleOffer(input: $input) {
            id
            vehicleType
            capacity
            pricePerPerson
            description
            contactInfo
            isAvailable
            trip {
              id
              title
            }
            company {
              id
              name
            }
            createdAt
          }
        }
      `;

      const vehicleOfferData = {
        tripId: tester.tripId,
        companyId: tester.companyId,
        vehicleType: 'VAN',
        capacity: 8,
        pricePerPerson: 25.00,
        description: 'Van confortável com ar condicionado',
        contactInfo: 'contato@empresa.com',
        isAvailable: true
      };

      const result = await tester.graphqlRequest(createVehicleOfferQuery, {
        input: vehicleOfferData
      }, tester.token);

      if (result.data?.createVehicleOffer) {
        tester.vehicleOfferId = result.data.createVehicleOffer.id;
        console.log('✅ Criar oferta de veículo: SUCESSO');
        console.log(`   ID: ${result.data.createVehicleOffer.id}`);
        console.log(`   Tipo: ${result.data.createVehicleOffer.vehicleType}`);
        console.log(`   Capacidade: ${result.data.createVehicleOffer.capacity} pessoas`);
        console.log(`   Preço por pessoa: R$ ${result.data.createVehicleOffer.pricePerPerson}`);
        console.log(`   Disponível: ${result.data.createVehicleOffer.isAvailable ? 'Sim' : 'Não'}`);
      } else {
        console.log('❌ Criar oferta de veículo: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Criar oferta de veículo: FALHOU -', error.message);
    }

    // Teste 2: Listar ofertas de veículos
    console.log('\n2️⃣ Testando listagem de ofertas de veículos...');
    try {
      const vehicleOffersQuery = `
        query VehicleOffers($tripId: ID) {
          vehicleOffers(tripId: $tripId) {
            id
            vehicleType
            capacity
            pricePerPerson
            description
            contactInfo
            isAvailable
            trip {
              id
              title
              originCity
              destinationCity
            }
            company {
              id
              name
              contactEmail
            }
            createdAt
          }
        }
      `;

      const result = await tester.graphqlRequest(vehicleOffersQuery, {
        tripId: tester.tripId
      }, tester.token);

      if (result.data?.vehicleOffers) {
        console.log('✅ Listar ofertas de veículos: SUCESSO');
        console.log(`   Total encontradas: ${result.data.vehicleOffers.length}`);
        result.data.vehicleOffers.forEach((offer, index) => {
          console.log(`   ${index + 1}. ${offer.vehicleType} - ${offer.capacity} pessoas - R$ ${offer.pricePerPerson}/pessoa`);
        });
      } else {
        console.log('❌ Listar ofertas de veículos: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar ofertas de veículos: FALHOU -', error.message);
    }

    // Teste 3: Buscar oferta de veículo por ID
    if (tester.vehicleOfferId) {
      console.log('\n3️⃣ Testando busca de oferta por ID...');
      try {
        const vehicleOfferQuery = `
          query VehicleOffer($id: ID!) {
            vehicleOffer(id: $id) {
              id
              vehicleType
              capacity
              pricePerPerson
              description
              contactInfo
              isAvailable
              trip {
                id
                title
                originCity
                destinationCity
                date
              }
              company {
                id
                name
                contactEmail
              }
              createdAt
            }
          }
        `;

        const result = await tester.graphqlRequest(vehicleOfferQuery, {
          id: tester.vehicleOfferId
        }, tester.token);

        if (result.data?.vehicleOffer) {
          console.log('✅ Buscar oferta por ID: SUCESSO');
          console.log(`   Tipo: ${result.data.vehicleOffer.vehicleType}`);
          console.log(`   Capacidade: ${result.data.vehicleOffer.capacity}`);
          console.log(`   Empresa: ${result.data.vehicleOffer.company.name}`);
        } else {
          console.log('❌ Buscar oferta por ID: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Buscar oferta por ID: FALHOU -', error.message);
      }
    }

    // Teste 4: Atualizar oferta de veículo
    if (tester.vehicleOfferId) {
      console.log('\n4️⃣ Testando atualização de oferta de veículo...');
      try {
        const updateVehicleOfferQuery = `
          mutation UpdateVehicleOffer($id: ID!, $input: CreateVehicleOfferInput!) {
            updateVehicleOffer(id: $id, input: $input) {
              id
              vehicleType
              capacity
              pricePerPerson
              description
              isAvailable
            }
          }
        `;

        const updateData = {
          tripId: tester.tripId,
          companyId: tester.companyId,
          vehicleType: 'BUS',
          capacity: 40,
          pricePerPerson: 20.00,
          description: 'Ônibus atualizado com Wi-Fi',
          contactInfo: 'contato@empresa.com',
          isAvailable: false
        };

        const result = await tester.graphqlRequest(updateVehicleOfferQuery, {
          id: tester.vehicleOfferId,
          input: updateData
        }, tester.token);

        if (result.data?.updateVehicleOffer) {
          console.log('✅ Atualizar oferta: SUCESSO');
          console.log(`   Tipo atualizado: ${result.data.updateVehicleOffer.vehicleType}`);
          console.log(`   Capacidade atualizada: ${result.data.updateVehicleOffer.capacity}`);
          console.log(`   Preço atualizado: R$ ${result.data.updateVehicleOffer.pricePerPerson}`);
          console.log(`   Disponível: ${result.data.updateVehicleOffer.isAvailable ? 'Sim' : 'Não'}`);
        } else {
          console.log('❌ Atualizar oferta: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Atualizar oferta: FALHOU -', error.message);
      }
    }

    // Teste 5: Criar ofertas com diferentes tipos de veículos
    console.log('\n5️⃣ Testando criação de ofertas com diferentes tipos de veículos...');
    const vehicleTypes = ['CAR', 'VAN', 'BUS', 'MINIBUS'];
    
    for (const vehicleType of vehicleTypes) {
      try {
        const createVehicleOfferQuery = `
          mutation CreateVehicleOffer($input: CreateVehicleOfferInput!) {
            createVehicleOffer(input: $input) {
              id
              vehicleType
              capacity
              pricePerPerson
            }
          }
        `;

        const vehicleOfferData = {
          tripId: tester.tripId,
          companyId: tester.companyId,
          vehicleType: vehicleType,
          capacity: vehicleType === 'CAR' ? 4 : vehicleType === 'VAN' ? 8 : 40,
          pricePerPerson: Math.random() * 50 + 10,
          description: `Oferta de teste - ${vehicleType}`,
          contactInfo: 'contato@empresa.com',
          isAvailable: true
        };

        const result = await tester.graphqlRequest(createVehicleOfferQuery, {
          input: vehicleOfferData
        }, tester.token);

        if (result.data?.createVehicleOffer) {
          console.log(`✅ Criar oferta ${vehicleType}: SUCESSO`);
        } else {
          console.log(`❌ Criar oferta ${vehicleType}: FALHOU -`, JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log(`❌ Criar oferta ${vehicleType}: FALHOU -`, error.message);
      }
    }

    // Teste 6: Listar todas as ofertas (sem filtro de viagem)
    console.log('\n6️⃣ Testando listagem de todas as ofertas...');
    try {
      const vehicleOffersQuery = `
        query VehicleOffers {
          vehicleOffers {
            id
            vehicleType
            capacity
            pricePerPerson
            trip {
              id
              title
            }
            company {
              id
              name
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(vehicleOffersQuery, {}, tester.token);

      if (result.data?.vehicleOffers) {
        console.log('✅ Listar todas as ofertas: SUCESSO');
        console.log(`   Total encontradas: ${result.data.vehicleOffers.length}`);
      } else {
        console.log('❌ Listar todas as ofertas: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar todas as ofertas: FALHOU -', error.message);
    }

    // Teste 7: Deletar oferta de veículo
    if (tester.vehicleOfferId) {
      console.log('\n7️⃣ Testando exclusão de oferta de veículo...');
      try {
        const deleteVehicleOfferQuery = `
          mutation DeleteVehicleOffer($id: ID!) {
            deleteVehicleOffer(id: $id)
          }
        `;

        const result = await tester.graphqlRequest(deleteVehicleOfferQuery, {
          id: tester.vehicleOfferId
        }, tester.token);

        if (result.data?.deleteVehicleOffer) {
          console.log('✅ Deletar oferta: SUCESSO');
          tester.vehicleOfferId = null; // Marcar como deletada
        } else {
          console.log('❌ Deletar oferta: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Deletar oferta: FALHOU -', error.message);
      }
    }

    // Teste 8: Criar oferta sem viagem
    console.log('\n8️⃣ Testando criação de oferta sem viagem...');
    try {
      const createVehicleOfferQuery = `
        mutation CreateVehicleOffer($input: CreateVehicleOfferInput!) {
          createVehicleOffer(input: $input) {
            id
            vehicleType
          }
        }
      `;

      const vehicleOfferDataWithoutTrip = {
        // Sem tripId
        companyId: tester.companyId,
        vehicleType: 'CAR',
        capacity: 4,
        pricePerPerson: 30.00,
        description: 'Oferta sem viagem',
        contactInfo: 'contato@empresa.com',
        isAvailable: true
      };

      const result = await tester.graphqlRequest(createVehicleOfferQuery, {
        input: vehicleOfferDataWithoutTrip
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Criar oferta sem viagem: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Criar oferta sem viagem: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Criar oferta sem viagem: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 9: Criar oferta sem empresa
    console.log('\n9️⃣ Testando criação de oferta sem empresa...');
    try {
      const createVehicleOfferQuery = `
        mutation CreateVehicleOffer($input: CreateVehicleOfferInput!) {
          createVehicleOffer(input: $input) {
            id
            vehicleType
          }
        }
      `;

      const vehicleOfferDataWithoutCompany = {
        tripId: tester.tripId,
        // Sem companyId
        vehicleType: 'VAN',
        capacity: 8,
        pricePerPerson: 25.00,
        description: 'Oferta sem empresa',
        contactInfo: 'contato@empresa.com',
        isAvailable: true
      };

      const result = await tester.graphqlRequest(createVehicleOfferQuery, {
        input: vehicleOfferDataWithoutCompany
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Criar oferta sem empresa: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Criar oferta sem empresa: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Criar oferta sem empresa: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 10: Buscar oferta inexistente
    console.log('\n🔟 Testando busca de oferta inexistente...');
    try {
      const vehicleOfferQuery = `
        query VehicleOffer($id: ID!) {
          vehicleOffer(id: $id) {
            id
            vehicleType
          }
        }
      `;

      const result = await tester.graphqlRequest(vehicleOfferQuery, {
        id: '999999'
      }, tester.token);

      if (result.data?.vehicleOffer === null) {
        console.log('✅ Buscar oferta inexistente: SUCESSO - Retornou null como esperado');
      } else {
        console.log('❌ Buscar oferta inexistente: FALHOU - Deveria retornar null');
      }
    } catch (error) {
      console.log('❌ Buscar oferta inexistente: FALHOU -', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de ofertas de veículos:', error.message);
  } finally {
    // Limpeza
    await tester.cleanup();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testVehicleOffers().catch(console.error);
}

module.exports = testVehicleOffers;
