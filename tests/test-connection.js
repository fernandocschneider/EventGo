const axios = require('axios');

async function testConnection() {
  console.log('🔍 Testando conexão com a API...');
  
  try {
    const response = await axios.post('http://localhost:4000/graphql', {
      query: 'query { __typename }'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ Conexão estabelecida!');
    console.log('📊 Resposta:', response.data);
    
    if (response.data.data?.__typename === 'Query') {
      console.log('✅ GraphQL está funcionando corretamente');
    }
    
  } catch (error) {
    console.log('❌ Erro de conexão:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Servidor não está rodando em http://localhost:4000');
      console.log('   - Execute: cd apps/api && npm run dev');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   - Timeout - servidor pode estar iniciando');
    } else {
      console.log('   - Erro:', error.message);
    }
  }
}

testConnection();
