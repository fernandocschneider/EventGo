const APITester = require('./utils');
const config = require('./config.example');

async function testCostItems() {
  console.log('💰 Testando Itens de Custo...\n');
  
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

    // Teste 1: Criar item de custo
    console.log('\n1️⃣ Testando criação de item de custo...');
    try {
      const createCostItemQuery = `
        mutation CreateCostItem($input: CreateCostItemInput!) {
          createCostItem(input: $input) {
            id
            description
            amount
            category
            isPaid
            paidBy {
              id
              name
            }
            trip {
              id
              title
            }
            createdAt
          }
        }
      `;

      const costItemData = {
        tripId: tester.tripId,
        description: 'Transporte para o aeroporto',
        amount: 50.00,
        category: 'TRANSPORT',
        isPaid: false
      };

      const result = await tester.graphqlRequest(createCostItemQuery, {
        input: costItemData
      }, tester.token);

      if (result.data?.createCostItem) {
        tester.costItemId = result.data.createCostItem.id;
        console.log('✅ Criar item de custo: SUCESSO');
        console.log(`   ID: ${result.data.createCostItem.id}`);
        console.log(`   Descrição: ${result.data.createCostItem.description}`);
        console.log(`   Valor: R$ ${result.data.createCostItem.amount}`);
        console.log(`   Categoria: ${result.data.createCostItem.category}`);
        console.log(`   Pago: ${result.data.createCostItem.isPaid ? 'Sim' : 'Não'}`);
      } else {
        console.log('❌ Criar item de custo: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Criar item de custo: FALHOU -', error.message);
    }

    // Teste 2: Listar itens de custo da viagem
    console.log('\n2️⃣ Testando listagem de itens de custo...');
    try {
      const costItemsQuery = `
        query CostItems($tripId: ID!) {
          costItems(tripId: $tripId) {
            id
            description
            amount
            category
            isPaid
            paidBy {
              id
              name
              email
            }
            trip {
              id
              title
            }
            createdAt
          }
        }
      `;

      const result = await tester.graphqlRequest(costItemsQuery, {
        tripId: tester.tripId
      }, tester.token);

      if (result.data?.costItems) {
        console.log('✅ Listar itens de custo: SUCESSO');
        console.log(`   Total encontrados: ${result.data.costItems.length}`);
        result.data.costItems.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.description} - R$ ${item.amount} (${item.category})`);
        });
      } else {
        console.log('❌ Listar itens de custo: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar itens de custo: FALHOU -', error.message);
    }

    // Teste 3: Buscar item de custo por ID
    if (tester.costItemId) {
      console.log('\n3️⃣ Testando busca de item de custo por ID...');
      try {
        const costItemQuery = `
          query CostItem($id: ID!) {
            costItem(id: $id) {
              id
              description
              amount
              category
              isPaid
              paidBy {
                id
                name
                email
              }
              trip {
                id
                title
                originCity
                destinationCity
              }
              createdAt
            }
          }
        `;

        const result = await tester.graphqlRequest(costItemQuery, {
          id: tester.costItemId
        }, tester.token);

        if (result.data?.costItem) {
          console.log('✅ Buscar item por ID: SUCESSO');
          console.log(`   Descrição: ${result.data.costItem.description}`);
          console.log(`   Valor: R$ ${result.data.costItem.amount}`);
          console.log(`   Viagem: ${result.data.costItem.trip.title}`);
        } else {
          console.log('❌ Buscar item por ID: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Buscar item por ID: FALHOU -', error.message);
      }
    }

    // Teste 4: Atualizar item de custo
    if (tester.costItemId) {
      console.log('\n4️⃣ Testando atualização de item de custo...');
      try {
        const updateCostItemQuery = `
          mutation UpdateCostItem($id: ID!, $input: CreateCostItemInput!) {
            updateCostItem(id: $id, input: $input) {
              id
              description
              amount
              category
              isPaid
            }
          }
        `;

        const updateData = {
          tripId: tester.tripId,
          description: 'Transporte atualizado para o aeroporto',
          amount: 75.00,
          category: 'TRANSPORT',
          isPaid: true
        };

        const result = await tester.graphqlRequest(updateCostItemQuery, {
          id: tester.costItemId,
          input: updateData
        }, tester.token);

        if (result.data?.updateCostItem) {
          console.log('✅ Atualizar item de custo: SUCESSO');
          console.log(`   Descrição atualizada: ${result.data.updateCostItem.description}`);
          console.log(`   Valor atualizado: R$ ${result.data.updateCostItem.amount}`);
          console.log(`   Status de pagamento: ${result.data.updateCostItem.isPaid ? 'Pago' : 'Não pago'}`);
        } else {
          console.log('❌ Atualizar item de custo: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Atualizar item de custo: FALHOU -', error.message);
      }
    }

    // Teste 5: Criar item de custo com diferentes categorias
    console.log('\n5️⃣ Testando criação de itens com diferentes categorias...');
    const categories = ['TRANSPORT', 'ACCOMMODATION', 'FOOD', 'ACTIVITIES', 'OTHER'];
    
    for (const category of categories) {
      try {
        const createCostItemQuery = `
          mutation CreateCostItem($input: CreateCostItemInput!) {
            createCostItem(input: $input) {
              id
              description
              category
              amount
            }
          }
        `;

        const costItemData = {
          tripId: tester.tripId,
          description: `Item de teste - ${category}`,
          amount: Math.random() * 100,
          category: category,
          isPaid: false
        };

        const result = await tester.graphqlRequest(createCostItemQuery, {
          input: costItemData
        }, tester.token);

        if (result.data?.createCostItem) {
          console.log(`✅ Criar item ${category}: SUCESSO`);
        } else {
          console.log(`❌ Criar item ${category}: FALHOU -`, JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log(`❌ Criar item ${category}: FALHOU -`, error.message);
      }
    }

    // Teste 6: Deletar item de custo
    if (tester.costItemId) {
      console.log('\n6️⃣ Testando exclusão de item de custo...');
      try {
        const deleteCostItemQuery = `
          mutation DeleteCostItem($id: ID!) {
            deleteCostItem(id: $id)
          }
        `;

        const result = await tester.graphqlRequest(deleteCostItemQuery, {
          id: tester.costItemId
        }, tester.token);

        if (result.data?.deleteCostItem) {
          console.log('✅ Deletar item de custo: SUCESSO');
          tester.costItemId = null; // Marcar como deletado
        } else {
          console.log('❌ Deletar item de custo: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Deletar item de custo: FALHOU -', error.message);
      }
    }

    // Teste 7: Criar item de custo sem viagem
    console.log('\n7️⃣ Testando criação de item sem viagem...');
    try {
      const createCostItemQuery = `
        mutation CreateCostItem($input: CreateCostItemInput!) {
          createCostItem(input: $input) {
            id
            description
          }
        }
      `;

      const costItemDataWithoutTrip = {
        // Sem tripId
        description: 'Item sem viagem',
        amount: 25.00,
        category: 'OTHER',
        isPaid: false
      };

      const result = await tester.graphqlRequest(createCostItemQuery, {
        input: costItemDataWithoutTrip
      }, tester.token);

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Criar item sem viagem: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Criar item sem viagem: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Criar item sem viagem: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 8: Listar itens de viagem inexistente
    console.log('\n8️⃣ Testando listagem de itens de viagem inexistente...');
    try {
      const costItemsQuery = `
        query CostItems($tripId: ID!) {
          costItems(tripId: $tripId) {
            id
            description
          }
        }
      `;

      const result = await tester.graphqlRequest(costItemsQuery, {
        tripId: '999999'
      }, tester.token);

      if (result.data?.costItems) {
        console.log('✅ Listar itens de viagem inexistente: SUCESSO - Lista vazia retornada');
        console.log(`   Itens encontrados: ${result.data.costItems.length}`);
      } else {
        console.log('❌ Listar itens de viagem inexistente: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar itens de viagem inexistente: FALHOU -', error.message);
    }

    // Teste 9: Buscar item de custo inexistente
    console.log('\n9️⃣ Testando busca de item de custo inexistente...');
    try {
      const costItemQuery = `
        query CostItem($id: ID!) {
          costItem(id: $id) {
            id
            description
          }
        }
      `;

      const result = await tester.graphqlRequest(costItemQuery, {
        id: '999999'
      }, tester.token);

      if (result.data?.costItem === null) {
        console.log('✅ Buscar item inexistente: SUCESSO - Retornou null como esperado');
      } else {
        console.log('❌ Buscar item inexistente: FALHOU - Deveria retornar null');
      }
    } catch (error) {
      console.log('❌ Buscar item inexistente: FALHOU -', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de itens de custo:', error.message);
  } finally {
    // Limpeza
    await tester.cleanup();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testCostItems().catch(console.error);
}

module.exports = testCostItems;
