import { Context } from "../context";

export const userResolvers = {
  Query: {
    myTrips: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) return [];

      return await prisma.trip.findMany({
        where: { organizerId: parseInt(user.id) },
        include: {
          event: true,
          participants: {
            include: { user: true },
          },
          costItems: true,
          vehicleOffers: {
            include: { company: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    myParticipations: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) return [];

      return await prisma.participant.findMany({
        where: { userId: parseInt(user.id) },
        include: {
          user: true,
          trip: {
            include: {
              event: true,
              organizer: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      });
    },
  },

  User: {
    organizedTrips: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.trip.findMany({
        where: { organizerId: parent.id },
        include: {
          event: true,
          participants: { include: { user: true } },
        },
      });
    },

    participations: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.participant.findMany({
        where: { userId: parent.id },
        include: {
          trip: {
            include: { event: true },
          },
        },
      });
    },

    ownedCompanies: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.company.findMany({
        where: { ownerId: parent.id },
      });
    },
  },
};
