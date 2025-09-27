import { Context } from "../context";
import { GraphQLError } from "graphql";

export const eventResolvers = {
  Query: {
    events: async (_: any, { filter, limit }: any, { prisma }: Context) => {
      const where: any = {};

      if (filter) {
        if (filter.city) {
          where.city = {
            contains: filter.city,
            mode: "insensitive",
          };
        }

        if (filter.dateFrom || filter.dateTo) {
          where.date = {};
          if (filter.dateFrom) where.date.gte = filter.dateFrom;
          if (filter.dateTo) where.date.lte = filter.dateTo;
        }

        if (filter.search) {
          where.OR = [
            { title: { contains: filter.search, mode: "insensitive" } },
            { description: { contains: filter.search, mode: "insensitive" } },
            { venue: { contains: filter.search, mode: "insensitive" } },
          ];
        }
      }

      return await prisma.event.findMany({
        where,
        take: limit,
        include: {
          organizerCompany: true,
          trips: {
            include: {
              organizer: true,
              participants: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });
    },

    event: async (_: any, { id }: any, { prisma }: Context) => {
      return await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: {
          organizerCompany: true,
          trips: {
            include: {
              organizer: true,
              participants: {
                include: { user: true },
              },
              costItems: true,
            },
          },
        },
      });
    },
  },

  Mutation: {
    createEvent: async (_: any, { input }: any, { prisma, user }: Context) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      // Verificar se a empresa existe e se o usuário tem permissão
      if (input.organizerCompanyId) {
        const company = await prisma.company.findUnique({
          where: { id: parseInt(input.organizerCompanyId) },
        });

        if (!company) {
          throw new GraphQLError("Empresa não encontrada");
        }

        if (company.ownerId !== parseInt(user.id)) {
          throw new GraphQLError(
            "Você só pode criar eventos para suas próprias empresas"
          );
        }
      }

      return await prisma.event.create({
        data: {
          ...input,
          organizerCompanyId: parseInt(input.organizerCompanyId),
        },
        include: {
          organizerCompany: true,
        },
      });
    },

    updateEvent: async (
      _: any,
      { id, input }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: { organizerCompany: true },
      });

      if (!event) {
        throw new GraphQLError("Evento não encontrado");
      }

      if (event.organizerCompany?.ownerId !== parseInt(user.id)) {
        throw new GraphQLError("Apenas o organizador pode editar o evento");
      }

      return await prisma.event.update({
        where: { id: parseInt(id) },
        data: {
          title: input.title,
          description: input.description,
          city: input.city,
          venue: input.venue,
          date: input.date,
        },
        include: {
          organizerCompany: true,
        },
      });
    },

    deleteEvent: async (_: any, { id }: any, { prisma, user }: Context) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: { organizerCompany: true },
      });

      if (!event) {
        throw new GraphQLError("Evento não encontrado");
      }

      if (event.organizerCompany?.ownerId !== parseInt(user.id)) {
        throw new GraphQLError("Apenas o organizador pode deletar o evento");
      }

      await prisma.event.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },

  Event: {
    organizerCompany: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.organizerCompanyId) return null;

      return await prisma.company.findUnique({
        where: { id: parent.organizerCompanyId },
        include: { owner: true },
      });
    },

    trips: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.trip.findMany({
        where: { eventId: parent.id },
        include: {
          organizer: true,
          participants: { include: { user: true } },
        },
        orderBy: { date: "asc" },
      });
    },
  },
};
