const axios = require('axios');

class APITester {
    constructor(config) {
        this.config = config;
        this.token = null;
        this.userId = null;
        this.companyId = null;
        this.eventId = null;
        this.tripId = null;
        this.participantId = null;
        this.costItemId = null;
        this.vehicleOfferId = null;
    }

    // Utilitário para fazer requisições GraphQL
    async graphqlRequest(query, variables = {}, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await axios.post(this.config.API_URL, {
                query,
                variables
            }, { headers });

            return response.data;
        } catch (error) {
            console.error('GraphQL Request Error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Utilitário para fazer login e obter token
    async login(email, password) {
        const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            id
            name
            email
            role
          }
        }
      }
    `;

        const result = await this.graphqlRequest(query, { email, password });

        if (result.data?.login) {
            this.token = result.data.login.token;
            this.userId = result.data.login.user.id;
            console.log('✅ Login realizado com sucesso');
            return result.data.login;
        } else {
            throw new Error('Falha no login: ' + JSON.stringify(result.errors));
        }
    }

    // Utilitário para fazer signup
    async signup(email, password, name) {
        const query = `
      mutation Signup($input: SignupInput!) {
        signup(input: $input) {
          token
          user {
            id
            name
            email
            role
          }
        }
      }
    `;

        const result = await this.graphqlRequest(query, {
            input: { email, password, name }
        });

        if (result.data?.signup) {
            this.token = result.data.signup.token;
            this.userId = result.data.signup.user.id;
            console.log('✅ Signup realizado com sucesso');
            return result.data.signup;
        } else {
            throw new Error('Falha no signup: ' + JSON.stringify(result.errors));
        }
    }

    // Utilitário para limpar dados de teste
    async cleanup() {
        console.log('🧹 Iniciando limpeza dos dados de teste...');

        try {
            // Limpar participação
            if (this.participantId) {
                await this.leaveTrip(this.participantId);
            }

            // Limpar oferta de veículo
            if (this.vehicleOfferId) {
                await this.deleteVehicleOffer(this.vehicleOfferId);
            }

            // Limpar item de custo
            if (this.costItemId) {
                await this.deleteCostItem(this.costItemId);
            }

            // Limpar viagem
            if (this.tripId) {
                await this.deleteTrip(this.tripId);
            }

            // Limpar evento
            if (this.eventId) {
                await this.deleteEvent(this.eventId);
            }

            // Limpar empresa
            if (this.companyId) {
                await this.deleteCompany(this.companyId);
            }

            console.log('✅ Limpeza concluída');
        } catch (error) {
            console.log('⚠️ Erro durante limpeza:', error.message);
        }
    }

    // Métodos auxiliares para operações CRUD
    async deleteVehicleOffer(id) {
        const query = `
      mutation DeleteVehicleOffer($id: ID!) {
        deleteVehicleOffer(id: $id)
      }
    `;
        return await this.graphqlRequest(query, { id }, this.token);
    }

    async deleteCostItem(id) {
        const query = `
      mutation DeleteCostItem($id: ID!) {
        deleteCostItem(id: $id)
      }
    `;
        return await this.graphqlRequest(query, { id }, this.token);
    }

    async deleteTrip(id) {
        const query = `
      mutation DeleteTrip($id: ID!) {
        deleteTrip(id: $id)
      }
    `;
        return await this.graphqlRequest(query, { id }, this.token);
    }

    async deleteEvent(id) {
        const query = `
      mutation DeleteEvent($id: ID!) {
        deleteEvent(id: $id)
      }
    `;
        return await this.graphqlRequest(query, { id }, this.token);
    }

    async deleteCompany(id) {
        const query = `
      mutation DeleteCompany($id: ID!) {
        deleteCompany(id: $id)
      }
    `;
        return await this.graphqlRequest(query, { id }, this.token);
    }

    async leaveTrip(participantId) {
        const query = `
      mutation LeaveTrip($participantId: ID!) {
        leaveTrip(participantId: $participantId)
      }
    `;
        return await this.graphqlRequest(query, { participantId }, this.token);
    }
}

module.exports = APITester;
