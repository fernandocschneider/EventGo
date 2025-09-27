import { Context } from "../context";
import { GraphQLError } from "graphql";
import { nanoid } from "nanoid";

export const tripResolvers = {
  Query: {
    trips: async (_: any, { filter, limit }: any, { prisma }: Context) => {
      const where: any = {};

      if (filter) {
        if (filter.eventId) {
          where.eventId = parseInt(filter.eventId);
        }

        if (filter.city) {
          where.OR = [
            { originCity: { contains: filter.city, mode: "insensitive" } },
            { destinationCity: { contains: filter.city, mode: "insensitive" } },
          ];
        }

        if (filter.dateFrom || filter.dateTo) {
          where.date = {};
          if (filter.dateFrom) where.date.gte = filter.dateFrom;
          if (filter.dateTo) where.date.lte = filter.dateTo;
        }

        if (filter.search) {
          where.title = {
            contains: filter.search,
            mode: "insensitive",
          };
        }
      }

      return await prisma.trip.findMany({
        where,
        take: limit,
        include: {
          event: true,
          organizer: true,
          participants: {
            include: { user: true },
          },
          costItems: true,
          vehicleOffers: {
            include: { company: true },
          },
        },
        orderBy: { date: "asc" },
      });
    },

    trip: async (_: any, { id }: any, { prisma }: Context) => {
      return await prisma.trip.findUnique({
        where: { id },
        include: {
          event: true,
          organizer: true,
          participants: {
            include: { user: true },
          },
          costItems: {
            include: { creator: true },
          },
          vehicleOffers: {
            include: { company: true },
          },
        },
      });
    },

    tripByCode: async (_: any, { code }: any, { prisma }: Context) => {
      return await prisma.trip.findUnique({
        where: { code },
        include: {
          event: true,
          organizer: true,
          participants: {
            include: { user: true },
          },
          costItems: {
            include: { creator: true },
          },
          vehicleOffers: {
            include: { company: true },
          },
        },
      });
    },
  },

  Mutation: {
    createTrip: async (_: any, { input }: any, { prisma, user }: Context) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const code = nanoid(8).toUpperCase();

      const trip = await prisma.trip.create({
        data: {
          title: input.title,
          eventId: parseInt(input.eventId),
          originCity: input.originCity,
          destinationCity: input.destinationCity,
          date: input.date,
          code,
          organizerId: parseInt(user.id),
        },
        include: {
          event: true,
          organizer: true,
        },
      });

      // Adicionar o organizador como primeiro participante
      await prisma.participant.create({
        data: {
          userId: parseInt(user.id),
          tripId: trip.id,
          profilePublicInfo: "Organizador da viagem",
        },
      });

      return trip;
    },

    updateTrip: async (
      _: any,
      { id, input }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const trip = await prisma.trip.findUnique({
        where: { id: parseInt(id) },
      });

      if (!trip) {
        throw new GraphQLError("Viagem não encontrada");
      }

      if (trip.organizerId !== parseInt(user.id)) {
        throw new GraphQLError("Apenas o organizador pode editar a viagem");
      }

      return await prisma.trip.update({
        where: { id: parseInt(id) },
        data: {
          title: input.title,
          eventId: parseInt(input.eventId),
          originCity: input.originCity,
          destinationCity: input.destinationCity,
          date: input.date,
        },
        include: {
          event: true,
          organizer: true,
          participants: { include: { user: true } },
        },
      });
    },

    deleteTrip: async (_: any, { id }: any, { prisma, user }: Context) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const trip = await prisma.trip.findUnique({
        where: { id: parseInt(id) },
      });

      if (!trip) {
        throw new GraphQLError("Viagem não encontrada");
      }

      if (trip.organizerId !== parseInt(user.id)) {
        throw new GraphQLError("Apenas o organizador pode deletar a viagem");
      }

      // Deletar registros relacionados primeiro
      await prisma.participant.deleteMany({ where: { tripId: parseInt(id) } });
      await prisma.costItem.deleteMany({ where: { tripId: parseInt(id) } });
      await prisma.vehicleOffer.updateMany({
        where: { tripId: parseInt(id) },
        data: { tripId: null },
      });

      await prisma.trip.delete({ where: { id: parseInt(id) } });

      return true;
    },
  },

  Trip: {
    event: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.event.findUnique({
        where: { id: parent.eventId },
      });
    },

    organizer: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.user.findUnique({
        where: { id: parent.organizerId },
      });
    },

    participants: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.participant.findMany({
        where: { tripId: parent.id },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      });
    },

    costItems: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.costItem.findMany({
        where: { tripId: parent.id },
        include: { creator: true },
        orderBy: { createdAt: "desc" },
      });
    },

    vehicleOffers: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.vehicleOffer.findMany({
        where: { tripId: parent.id },
        include: { company: true },
      });
    },

    totalParticipants: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.participant.count({
        where: { tripId: parent.id },
      });
    },

    totalCosts: async (parent: any, _: any, { prisma }: Context) => {
      const costs = await prisma.costItem.findMany({
        where: { tripId: parent.id },
      });

      return costs.reduce((total, cost) => total + Number(cost.totalAmount), 0);
    },
  },
};
