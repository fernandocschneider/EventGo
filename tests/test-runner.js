const fs = require('fs');
const path = require('path');

// Importar todos os testes
const testAuth = require('./auth.test');
const testCompanies = require('./companies.test');
const testEvents = require('./events.test');
const testTrips = require('./trips.test');
const testParticipants = require('./participants.test');
const testCostItems = require('./cost-items.test');
const testVehicleOffers = require('./vehicle-offers.test');

// Configuração
const config = require('./config.example');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.tests = [
      { name: 'Autenticação', fn: testAuth },
      { name: 'Empresas', fn: testCompanies },
      { name: 'Eventos', fn: testEvents },
      { name: 'Viagens', fn: testTrips },
      { name: 'Participantes', fn: testParticipants },
      { name: 'Itens de Custo', fn: testCostItems },
      { name: 'Ofertas de Veículos', fn: testVehicleOffers }
    ];
    this.results = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async runTest(test) {
    this.log(`\n${colors.cyan}🧪 Executando testes de ${test.name}...${colors.reset}`);
    this.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      await test.fn();
      const duration = Date.now() - startTime;
      this.log(`\n${colors.green}✅ Testes de ${test.name} concluídos em ${duration}ms${colors.reset}`);
      this.results.push({ name: test.name, status: 'PASSED', duration });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`\n${colors.red}❌ Testes de ${test.name} falharam em ${duration}ms${colors.reset}`);
      this.log(`${colors.red}Erro: ${error.message}${colors.reset}`);
      this.results.push({ name: test.name, status: 'FAILED', duration, error: error.message });
    }
  }

  async runAllTests() {
    this.log(`${colors.bright}${colors.blue}🚀 Iniciando Testes da API EventGo${colors.reset}`);
    this.log(`${colors.blue}URL da API: ${config.API_URL}${colors.reset}`);
    this.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);

    const overallStartTime = Date.now();

    for (const test of this.tests) {
      await this.runTest(test);
    }

    const overallDuration = Date.now() - overallStartTime;
    this.printSummary(overallDuration);
  }

  async runSpecificTest(testName) {
    const test = this.tests.find(t => 
      t.name.toLowerCase().includes(testName.toLowerCase()) ||
      t.name.toLowerCase().replace(/\s+/g, '') === testName.toLowerCase().replace(/\s+/g, '')
    );

    if (!test) {
      this.log(`${colors.red}❌ Teste "${testName}" não encontrado.${colors.reset}`);
      this.log(`${colors.yellow}Testes disponíveis:${colors.reset}`);
      this.tests.forEach(t => this.log(`  - ${t.name}`));
      return;
    }

    await this.runTest(test);
  }

  printSummary(duration) {
    this.log(`\n${colors.bright}${colors.blue}📊 Resumo dos Testes${colors.reset}`);
    this.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);

    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const total = this.results.length;

    this.log(`${colors.green}✅ Passou: ${passed}${colors.reset}`);
    this.log(`${colors.red}❌ Falhou: ${failed}${colors.reset}`);
    this.log(`${colors.blue}⏱️  Tempo total: ${duration}ms${colors.reset}`);

    this.log(`\n${colors.bright}Detalhes:${colors.reset}`);
    this.results.forEach(result => {
      const statusColor = result.status === 'PASSED' ? colors.green : colors.red;
      const statusIcon = result.status === 'PASSED' ? '✅' : '❌';
      this.log(`  ${statusIcon} ${result.name}: ${statusColor}${result.status}${colors.reset} (${result.duration}ms)`);
      
      if (result.error) {
        this.log(`    ${colors.red}Erro: ${result.error}${colors.reset}`);
      }
    });

    if (failed === 0) {
      this.log(`\n${colors.green}${colors.bright}🎉 Todos os testes passaram!${colors.reset}`);
    } else {
      this.log(`\n${colors.red}${colors.bright}⚠️  ${failed} teste(s) falharam. Verifique os erros acima.${colors.reset}`);
    }

    this.log(`\n${colors.cyan}💡 Dicas:${colors.reset}`);
    this.log(`  - Certifique-se de que a API está rodando em ${config.API_URL}`);
    this.log(`  - Verifique se o banco de dados está configurado corretamente`);
    this.log(`  - Execute 'npm install' na pasta tests se houver erros de dependências`);
  }

  printHelp() {
    this.log(`${colors.bright}${colors.blue}🧪 Test Runner - EventGo API${colors.reset}`);
    this.log(`${colors.yellow}${'='.repeat(40)}${colors.reset}`);
    this.log(`\n${colors.cyan}Uso:${colors.reset}`);
    this.log(`  node test-runner.js [teste]`);
    this.log(`\n${colors.cyan}Exemplos:${colors.reset}`);
    this.log(`  node test-runner.js                    # Executa todos os testes`);
    this.log(`  node test-runner.js auth               # Executa apenas testes de autenticação`);
    this.log(`  node test-runner.js eventos            # Executa apenas testes de eventos`);
    this.log(`  node test-runner.js viagens            # Executa apenas testes de viagens`);
    this.log(`\n${colors.cyan}Testes disponíveis:${colors.reset}`);
    this.tests.forEach(test => {
      this.log(`  - ${test.name}`);
    });
    this.log(`\n${colors.cyan}Configuração:${colors.reset}`);
    this.log(`  Edite o arquivo config.example.js para ajustar a URL da API e dados de teste`);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  if (args.includes('--help') || args.includes('-h')) {
    runner.printHelp();
    return;
  }

  try {
    if (args.length === 0) {
      await runner.runAllTests();
    } else {
      await runner.runSpecificTest(args.join(' '));
    }
  } catch (error) {
    console.error(`${colors.red}❌ Erro fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestRunner;
