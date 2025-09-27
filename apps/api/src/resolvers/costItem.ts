import { Context } from "../context";
import { GraphQLError } from "graphql";
import { Decimal } from "@prisma/client/runtime/library";

export const costItemResolvers = {
  Query: {
    costItems: async (_: any, { tripId }: any, { prisma }: Context) => {
      return await prisma.costItem.findMany({
        where: { tripId: parseInt(tripId) },
        include: {
          trip: true,
          creator: true,
        },
      });
    },

    costItem: async (_: any, { id }: any, { prisma }: Context) => {
      return await prisma.costItem.findUnique({
        where: { id },
        include: {
          trip: true,
          creator: true,
        },
      });
    },
  },

  Mutation: {
    createCostItem: async (
      _: any,
      { input }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      // Verificar se o usuário é organizador da viagem
      const trip = await prisma.trip.findUnique({
        where: { id: parseInt(input.tripId) },
      });

      if (!trip) {
        throw new GraphQLError("Viagem não encontrada");
      }

      if (trip.organizerId !== parseInt(user.id)) {
        throw new GraphQLError(
          "Apenas o organizador pode criar itens de custo"
        );
      }

      return await prisma.costItem.create({
        data: {
          label: input.label,
          totalAmount: input.totalAmount,
          tripId: parseInt(input.tripId),
          createdBy: parseInt(user.id),
        },
        include: {
          trip: true,
          creator: true,
        },
      });
    },

    updateCostItem: async (
      _: any,
      { id, input }: any,
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const costItem = await prisma.costItem.findUnique({
        where: { id: parseInt(id) },
        include: { trip: true },
      });

      if (!costItem) {
        throw new GraphQLError("Item de custo não encontrado");
      }

      // Verificar se o usuário é organizador da viagem
      if (costItem.trip.organizerId !== parseInt(user.id)) {
        throw new GraphQLError(
          "Apenas o organizador pode editar itens de custo"
        );
      }

      return await prisma.costItem.update({
        where: { id: parseInt(id) },
        data: {
          label: input.label,
          totalAmount: input.totalAmount,
        },
        include: {
          trip: true,
          creator: true,
        },
      });
    },

    deleteCostItem: async (_: any, { id }: any, { prisma, user }: Context) => {
      if (!user) {
        throw new GraphQLError("Usuário deve estar logado");
      }

      const costItem = await prisma.costItem.findUnique({
        where: { id: parseInt(id) },
        include: { trip: true },
      });

      if (!costItem) {
        throw new GraphQLError("Item de custo não encontrado");
      }

      // Verificar se o usuário é organizador da viagem
      if (costItem.trip.organizerId !== parseInt(user.id)) {
        throw new GraphQLError(
          "Apenas o organizador pode deletar itens de custo"
        );
      }

      await prisma.costItem.delete({
        where: { id: parseInt(id) },
      });

      return true;
    },
  },

  CostItem: {
    trip: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.trip.findUnique({
        where: { id: parent.tripId },
      });
    },

    creator: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.user.findUnique({
        where: { id: parent.createdBy },
      });
    },

    paidBy: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.paidById) return null;
      return await prisma.user.findUnique({
        where: { id: parent.paidById },
      });
    },

    amount: async (parent: any, _: any, { prisma }: Context) => {
      return parent.amount || parent.totalAmount;
    },

    perPersonShare: async (parent: any, _: any, { prisma }: Context) => {
      const participantCount = await prisma.participant.count({
        where: { tripId: parent.tripId },
      });

      if (participantCount === 0) return new Decimal(0);

      return new Decimal(parent.totalAmount).dividedBy(participantCount);
    },
  },
};
