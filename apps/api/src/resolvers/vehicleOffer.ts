import { Context } from "../context";
import { GraphQLError } from "graphql";

export const vehicleOfferResolvers = {
  Query: {
    vehicleOffers: async (_: any, { tripId }: any, { prisma }: Context) => {
      return await prisma.vehicleOffer.findMany({
        where: tripId ? { tripId } : {},
        include: {
          company: true,
          trip: true,
        },
      });
    },

    vehicleOffer: async (_: any, { id }: any, { prisma }: Context) => {
      return await prisma.vehicleOffer.findUnique({
        where: { id },
        include: {
          company: true,
          trip: true,
        },
      });
    },
  },

  Mutation: {
    createVehicleOffer: async (
      _: any,
      { input }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      // Verificar se a empresa existe e se o usuário tem permissão
      if (input.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: input.companyId },
        });

        if (!company) {
          throw new GraphQLError("Empresa não encontrada");
        }

        if (company.ownerId !== parseInt(user.id)) {
          throw new GraphQLError(
            "Você só pode criar ofertas para suas próprias empresas"
          );
        }
      } else {
        // Buscar empresa do usuário se não especificada
        const company = await prisma.company.findFirst({
          where: { ownerId: parseInt(user.id) },
        });

        if (!company) {
          throw new GraphQLError(
            "Apenas empresas podem criar ofertas de veículos"
          );
        }

        input.companyId = company.id;
      }

      return await prisma.vehicleOffer.create({
        data: {
          ...input,
        },
        include: {
          company: true,
          trip: true,
        },
      });
    },

    updateVehicleOffer: async (
      _: any,
      { id, input }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const vehicleOffer = await prisma.vehicleOffer.findUnique({
        where: { id },
        include: { company: true },
      });

      if (!vehicleOffer) {
        throw new GraphQLError("Oferta de veículo não encontrada");
      }

      if (vehicleOffer.company.ownerId !== parseInt(user.id)) {
        throw new GraphQLError(
          "Apenas o proprietário da empresa pode editar a oferta"
        );
      }

      return await prisma.vehicleOffer.update({
        where: { id },
        data: input,
        include: {
          company: true,
          trip: true,
        },
      });
    },

    deleteVehicleOffer: async (
      _: any,
      { id }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const vehicleOffer = await prisma.vehicleOffer.findUnique({
        where: { id },
        include: { company: true },
      });

      if (!vehicleOffer) {
        throw new GraphQLError("Oferta de veículo não encontrada");
      }

      if (vehicleOffer.company.ownerId !== parseInt(user.id)) {
        throw new GraphQLError(
          "Apenas o proprietário da empresa pode deletar a oferta"
        );
      }

      await prisma.vehicleOffer.delete({
        where: { id },
      });

      return true;
    },
  },

  VehicleOffer: {
    company: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.company.findUnique({
        where: { id: parent.companyId },
        include: { owner: true },
      });
    },

    trip: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.tripId) return null;

      return await prisma.trip.findUnique({
        where: { id: parent.tripId },
        include: {
          event: true,
          organizer: true,
        },
      });
    },
  },
};
