import { Context } from '../context';
import { GraphQLError } from 'graphql';

export const companyResolvers = {
  Query: {
    companies: async (_: any, { limit, offset }: any, { prisma }: Context) => {
      return await prisma.company.findMany({
        take: limit,
        skip: offset,
        include: {
          owner: true,
          events: true,
          vehicleOffers: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    myCompanies: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) return [];

      return await prisma.company.findMany({
        where: { ownerId: user.id },
        include: {
          events: true,
          vehicleOffers: true
        }
      });
    }
  },

  Mutation: {
    createCompany: async (_: any, { input }: any, { prisma, user }: Context) => {
      if (!user) {
        throw new GraphQLError('Usuário deve estar logado');
      }

      if (user.role !== 'COMPANY') {
        throw new GraphQLError('Apenas usuários do tipo COMPANY podem criar empresas');
      }

      return await prisma.company.create({
        data: {
          ...input,
          ownerId: user.id
        },
        include: {
          owner: true,
          events: true,
          vehicleOffers: true
        }
      });
    }
  },

  Company: {
    owner: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.user.findUnique({
        where: { id: parent.ownerId }
      });
    },

    events: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.event.findMany({
        where: { organizerCompanyId: parent.id },
        orderBy: { date: 'asc' }
      });
    },

    vehicleOffers: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.vehicleOffer.findMany({
        where: { companyId: parent.id },
        include: { trip: true }
      });
    }
  }
};