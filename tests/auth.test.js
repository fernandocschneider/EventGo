const APITester = require('./utils');
const config = require('./config.example');

async function testAuth() {
  console.log('🔐 Testando Autenticação...\n');
  
  const tester = new APITester(config);
  
  try {
    // Teste 1: Signup
    console.log('1️⃣ Testando Signup...');
    try {
      const signupResult = await tester.signup(
        config.TEST_USER.email,
        config.TEST_USER.password,
        config.TEST_USER.name
      );
      
      if (signupResult.token && signupResult.user) {
        console.log('✅ Signup: SUCESSO');
        console.log(`   Token: ${signupResult.token.substring(0, 20)}...`);
        console.log(`   User ID: ${signupResult.user.id}`);
      } else {
        console.log('❌ Signup: FALHOU - Resposta inválida');
      }
    } catch (error) {
      console.log('❌ Signup: FALHOU -', error.message);
    }

    // Teste 2: Login
    console.log('\n2️⃣ Testando Login...');
    try {
      const loginResult = await tester.login(
        config.TEST_USER.email,
        config.TEST_USER.password
      );
      
      if (loginResult.token && loginResult.user) {
        console.log('✅ Login: SUCESSO');
        console.log(`   Token: ${loginResult.token.substring(0, 20)}...`);
        console.log(`   User ID: ${loginResult.user.id}`);
      } else {
        console.log('❌ Login: FALHOU - Resposta inválida');
      }
    } catch (error) {
      console.log('❌ Login: FALHOU -', error.message);
    }

    // Teste 3: Me (verificar usuário autenticado)
    console.log('\n3️⃣ Testando query "me"...');
    try {
      const meQuery = `
        query Me {
          me {
            id
            name
            email
            role
            avatarUrl
          }
        }
      `;
      
      const result = await tester.graphqlRequest(meQuery, {}, tester.token);
      
      if (result.data?.me) {
        console.log('✅ Me: SUCESSO');
        console.log(`   Nome: ${result.data.me.name}`);
        console.log(`   Email: ${result.data.me.email}`);
        console.log(`   Role: ${result.data.me.role}`);
      } else {
        console.log('❌ Me: FALHOU -', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.log('❌ Me: FALHOU -', error.message);
    }

    // Teste 4: Login com credenciais inválidas
    console.log('\n4️⃣ Testando Login com credenciais inválidas...');
    try {
      await tester.login('invalid@email.com', 'wrongpassword');
      console.log('❌ Login inválido: FALHOU - Deveria ter retornado erro');
    } catch (error) {
      console.log('✅ Login inválido: SUCESSO - Erro esperado:', error.message);
    }

    // Teste 5: Acesso sem token
    console.log('\n5️⃣ Testando acesso sem token...');
    try {
      const meQuery = `query Me { me { id name email } }`;
      const result = await tester.graphqlRequest(meQuery, {});
      
      if (result.data?.me === null) {
        console.log('✅ Acesso sem token: SUCESSO - Retornou null como esperado');
      } else {
        console.log('❌ Acesso sem token: FALHOU - Deveria retornar null');
      }
    } catch (error) {
      console.log('✅ Acesso sem token: SUCESSO - Erro esperado:', error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral nos testes de autenticação:', error.message);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testAuth().catch(console.error);
}

module.exports = testAuth;
