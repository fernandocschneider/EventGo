const APITester = require('./utils');
const config = require('./config.example');

async function testCompanies() {
  console.log('🏢 Testando Empresas...\n');
  
  const tester = new APITester(config);
  
  try {
    // Fazer login primeiro
    await tester.login(config.TEST_USER.email, config.TEST_USER.password);

    // Teste 1: Criar empresa
    console.log('1️⃣ Testando criação de empresa...');
    try {
      const createCompanyQuery = `
        mutation CreateCompany($input: CreateCompanyInput!) {
          createCompany(input: $input) {
            id
            name
            description
            contactEmail
            createdAt
            owner {
              id
              name
              email
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(createCompanyQuery, {
        input: config.TEST_COMPANY
      }, tester.token);

      if (result.data?.createCompany) {
        tester.companyId = result.data.createCompany.id;
        console.log('✅ Criar empresa: SUCESSO');
        console.log(`   ID: ${result.data.createCompany.id}`);
        console.log(`   Nome: ${result.data.createCompany.name}`);
        console.log(`   Email: ${result.data.createCompany.contactEmail}`);
      } else {
        console.log('❌ Criar empresa: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Criar empresa: FALHOU -', error.message);
    }

    // Teste 2: Listar empresas
    console.log('\n2️⃣ Testando listagem de empresas...');
    try {
      const companiesQuery = `
        query Companies($limit: Int, $offset: Int) {
          companies(limit: $limit, offset: $offset) {
            id
            name
            description
            contactEmail
            createdAt
            owner {
              id
              name
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(companiesQuery, {
        limit: 10,
        offset: 0
      }, tester.token);

      if (result.data?.companies) {
        console.log('✅ Listar empresas: SUCESSO');
        console.log(`   Total encontradas: ${result.data.companies.length}`);
        result.data.companies.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.name} (${company.contactEmail})`);
        });
      } else {
        console.log('❌ Listar empresas: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Listar empresas: FALHOU -', error.message);
    }

    // Teste 3: Minhas empresas
    console.log('\n3️⃣ Testando "minhas empresas"...');
    try {
      const myCompaniesQuery = `
        query MyCompanies {
          myCompanies {
            id
            name
            description
            contactEmail
            createdAt
            events {
              id
              title
              city
              date
            }
          }
        }
      `;

      const result = await tester.graphqlRequest(myCompaniesQuery, {}, tester.token);

      if (result.data?.myCompanies) {
        console.log('✅ Minhas empresas: SUCESSO');
        console.log(`   Total: ${result.data.myCompanies.length}`);
        result.data.myCompanies.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.name} (${company.events.length} eventos)`);
        });
      } else {
        console.log('❌ Minhas empresas: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Minhas empresas: FALHOU -', error.message);
    }

    // Teste 4: Atualizar empresa
    if (tester.companyId) {
      console.log('\n4️⃣ Testando atualização de empresa...');
      try {
        const updateCompanyQuery = `
          mutation UpdateCompany($id: ID!, $input: CreateCompanyInput!) {
            updateCompany(id: $id, input: $input) {
              id
              name
              description
              contactEmail
            }
          }
        `;

        const updateData = {
          ...config.TEST_COMPANY,
          name: 'Updated Company Name',
          description: 'Updated description'
        };

        const result = await tester.graphqlRequest(updateCompanyQuery, {
          id: tester.companyId,
          input: updateData
        }, tester.token);

        if (result.data?.updateCompany) {
          console.log('✅ Atualizar empresa: SUCESSO');
          console.log(`   Nome atualizado: ${result.data.updateCompany.name}`);
        } else {
          console.log('❌ Atualizar empresa: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Atualizar empresa: FALHOU -', error.message);
      }
    }

    // Teste 5: Deletar empresa
    if (tester.companyId) {
      console.log('\n5️⃣ Testando exclusão de empresa...');
      try {
        const deleteCompanyQuery = `
          mutation DeleteCompany($id: ID!) {
            deleteCompany(id: $id)
          }
        `;

        const result = await tester.graphqlRequest(deleteCompanyQuery, {
          id: tester.companyId
        }, tester.token);

        if (result.data?.deleteCompany) {
          console.log('✅ Deletar empresa: SUCESSO');
          tester.companyId = null; // Marcar como deletada
        } else {
          console.log('❌ Deletar empresa: FALHOU -', JSON.stringify(result.errors));
        }
      } catch (error) {
        console.log('❌ Deletar empresa: FALHOU -', error.message);
      }
    }

    // Teste 6: Criar empresa sem autenticação
    console.log('\n6️⃣ Testando criação de empresa sem autenticação...');
    try {
      const createCompanyQuery = `
        mutation CreateCompany($input: CreateCompanyInput!) {
          createCompany(input: $input) {
            id
            name
          }
        }
      `;

      const result = await tester.graphqlRequest(createCompanyQuery, {
        input: config.TEST_COMPANY
      }); // Sem token

      if (result.errors && result.errors.length > 0) {
        console.log('✅ Criar empresa sem auth: SUCESSO - Erro esperado');
      } else {
        console.log('❌ Criar empresa sem auth: FALHOU - Deveria ter retornado erro');
      }
    } catch (error) {
      console.log('✅ Criar empresa sem auth: SUCESSO - Erro esperado:', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de empresas:', error.message);
  } finally {
    // Limpeza
    await tester.cleanup();
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testCompanies().catch(console.error);
}

module.exports = testCompanies;
