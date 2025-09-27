import { Context } from "../context";
import { GraphQLError } from "graphql";

export const participantResolvers = {
  Mutation: {
    joinTrip: async (
      _: any,
      { tripId, code }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      // Se código foi fornecido, validar
      if (code) {
        const tripByCode = await prisma.trip.findUnique({
          where: { code },
        });

        if (!tripByCode || tripByCode.id !== parseInt(tripId)) {
          throw new GraphQLError("Código de viagem inválido");
        }
      }

      // Verificar se o usuário já participa da viagem
      const existingParticipant = await prisma.participant.findUnique({
        where: {
          userId_tripId: {
            userId: parseInt(user.id),
            tripId: parseInt(tripId),
          },
        },
      });

      if (existingParticipant) {
        throw new GraphQLError("Usuário já participa desta viagem");
      }

      // Adicionar participante
      return await prisma.participant.create({
        data: {
          userId: parseInt(user.id),
          tripId: parseInt(tripId),
        },
        include: {
          user: true,
          trip: {
            include: {
              event: true,
              organizer: true,
            },
          },
        },
      });
    },

    leaveTrip: async (
      _: any,
      { participantId }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: { trip: true },
      });

      if (!participant) {
        throw new GraphQLError("Participação não encontrada");
      }

      // Verificar se o usuário pode remover esta participação
      if (
        participant.userId !== parseInt(user.id) &&
        participant.trip.organizerId !== parseInt(user.id)
      ) {
        throw new GraphQLError("Sem permissão para remover esta participação");
      }

      // Não permitir que o organizador saia da própria viagem
      if (participant.userId === participant.trip.organizerId) {
        throw new GraphQLError("O organizador não pode sair da própria viagem");
      }

      await prisma.participant.delete({
        where: { id: participantId },
      });

      return true;
    },
  },

  Participant: {
    user: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },

    trip: async (parent: any, _: any, { prisma }: Context) => {
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
