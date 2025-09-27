import { DateTimeResolver } from "graphql-scalars";
import { GraphQLScalarType, Kind } from "graphql";
import { authResolvers } from "./auth";
import { userResolvers } from "./user";
import { companyResolvers } from "./company";
import { eventResolvers } from "./event";
import { tripResolvers } from "./trip";
import { participantResolvers } from "./participant";
import { costItemResolvers } from "./costItem";
import { vehicleOfferResolvers } from "./vehicleOffer";

// Custom Decimal scalar resolver
const DecimalResolver = new GraphQLScalarType({
  name: "Decimal",
  description: "A decimal number",
  serialize(value) {
    return value?.toString();
  },
  parseValue(value) {
    return value?.toString();
  },
  parseLiteral(ast) {
    if (
      ast.kind === Kind.STRING ||
      ast.kind === Kind.INT ||
      ast.kind === Kind.FLOAT
    ) {
      return ast.value;
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeResolver,
  Decimal: DecimalResolver,

  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...companyResolvers.Query,
    ...eventResolvers.Query,
    ...tripResolvers.Query,
    ...costItemResolvers.Query,
    ...vehicleOfferResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...companyResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...tripResolvers.Mutation,
    ...participantResolvers.Mutation,
    ...costItemResolvers.Mutation,
    ...vehicleOfferResolvers.Mutation,
  },

  // Type resolvers
  User: userResolvers.User,
  Company: companyResolvers.Company,
  Event: eventResolvers.Event,
  Trip: tripResolvers.Trip,
  Participant: participantResolvers.Participant,
  CostItem: costItemResolvers.CostItem,
  VehicleOffer: vehicleOfferResolvers.VehicleOffer,
};
