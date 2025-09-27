export const typeDefs = `#graphql
  scalar DateTime
  scalar Decimal

  enum Role {
    USER
    COMPANY
    ORGANIZER
  }


  type User {
    id: ID!
    name: String!
    email: String!
    avatarUrl: String
    role: Role!
    createdAt: DateTime!
    organizedTrips: [Trip!]!
    participations: [Participant!]!
    ownedCompanies: [Company!]!
  }

  type Company {
    id: ID!
    name: String!
    description: String
    contactEmail: String!
    createdAt: DateTime!
    owner: User!
    events: [Event!]!
    vehicleOffers: [VehicleOffer!]!
  }

  type Event {
    id: ID!
    title: String!
    description: String
    city: String!
    venue: String!
    date: DateTime!
    createdAt: DateTime!
    organizerCompany: Company
    trips: [Trip!]!
  }

  type Trip {
    id: ID!
    title: String!
    originCity: String!
    destinationCity: String!
    date: DateTime!
    code: String!
    createdAt: DateTime!
    event: Event!
    organizer: User!
    participants: [Participant!]!
    costItems: [CostItem!]!
    vehicleOffers: [VehicleOffer!]!
    totalParticipants: Int!
    totalCosts: Decimal!
  }

  type Participant {
    id: ID!
    joinedAt: DateTime!
    profilePublicInfo: String
    user: User!
    trip: Trip!
  }

  type CostItem {
    id: ID!
    label: String!
    totalAmount: Decimal!
    perPersonShare: Decimal!
    createdAt: DateTime!
    trip: Trip!
    creator: User!
  }

  type VehicleOffer {
    id: ID!
    capacity: Int!
    pricePerPerson: Decimal
    pickupLocation: String!
    pickupTime: DateTime!
    notes: String
    createdAt: DateTime!
    company: Company!
    trip: Trip
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    role: Role = USER
  }

  input CreateTripInput {
    title: String!
    eventId: ID!
    originCity: String!
    destinationCity: String!
    date: DateTime!
  }

  input CreateCostItemInput {
    tripId: ID!
    label: String!
    totalAmount: Decimal!
  }

  input CreateEventInput {
    title: String!
    description: String
    city: String!
    venue: String!
    date: DateTime!
  }

  input CreateVehicleOfferInput {
    capacity: Int!
    pricePerPerson: Decimal
    pickupLocation: String!
    pickupTime: DateTime!
    notes: String
    tripId: ID
  }

  input CreateCompanyInput {
    name: String!
    description: String
    contactEmail: String!
  }

  input EventsFilter {
    city: String
    dateFrom: DateTime
    dateTo: DateTime
    search: String
  }

  input TripsFilter {
    eventId: ID
    city: String
    dateFrom: DateTime
    dateTo: DateTime
    search: String
  }

  type Query {
    me: User
    events(filter: EventsFilter, limit: Int = 20, offset: Int = 0): [Event!]!
    event(id: ID!): Event
    trips(filter: TripsFilter, limit: Int = 20, offset: Int = 0): [Trip!]!
    trip(id: ID!): Trip
    tripByCode(code: String!): Trip
    companies(limit: Int = 20, offset: Int = 0): [Company!]!
    myCompanies: [Company!]!
    myTrips: [Trip!]!
    myParticipations: [Participant!]!
    costItems(tripId: ID!): [CostItem!]!
    costItem(id: ID!): CostItem
    vehicleOffers(tripId: ID): [VehicleOffer!]!
    vehicleOffer(id: ID!): VehicleOffer
  }

  type Mutation {
    # Autenticação
    signup(input: SignupInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Empresas
    createCompany(input: CreateCompanyInput!): Company!

    # Eventos
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: CreateEventInput!): Event!

    # Viagens
    createTrip(input: CreateTripInput!): Trip!
    updateTrip(id: ID!, input: CreateTripInput!): Trip!
    deleteTrip(id: ID!): Boolean!

    # Participação em viagens
    joinTrip(tripId: ID!, code: String): Participant!
    leaveTrip(participantId: ID!): Boolean!

    # Itens de custo
    createCostItem(input: CreateCostItemInput!): CostItem!
    updateCostItem(id: ID!, input: CreateCostItemInput!): CostItem!
    deleteCostItem(id: ID!): Boolean!

    # Ofertas de veículos
    createVehicleOffer(input: CreateVehicleOfferInput!): VehicleOffer!
    updateVehicleOffer(id: ID!, input: CreateVehicleOfferInput!): VehicleOffer!
    deleteVehicleOffer(id: ID!): Boolean!
  }
`;