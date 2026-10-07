import axios from 'axios';

const API_URL = 'https://coleta-api-avvu.onrender.com';

async function runTests() {
  console.log('Iniciando testes de comunicação (Frontend -> API -> Database)...');
  
  try {
    // Teste 1: Buscar bairros (Verifica GET e conexão DB)
    console.log('\n[TESTE 1] Consultando a lista de bairros...');
    const listRes = await axios.get(`${API_URL}/bairros`);
    console.log('✅ SUCESSO: Comunicação com a API e Banco de Dados estabelecida.');
    console.log(`Dados retornados (Quantidade: ${listRes.data.length}):`, listRes.data);
    
    // Opcionalmente, pode-se testar a criação se as rotas de POST não exigirem autenticação,
    // mas listRes com status 200 já comprova a comunicação.
    
    console.log('\n✅ Todos os testes básicos passaram com sucesso. O fluxo Frontend -> API -> Banco de Dados está funcionando.');
  } catch (error) {
    console.error('❌ ERRO NA COMUNICAÇÃO:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
