import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes
  await prisma.vehicleOffer.deleteMany();
  await prisma.costItem.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.event.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      name: "João Silva",
      email: "user1@example.com",
      passwordHash,
      role: Role.USER,
      avatarUrl:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "user2@example.com",
      passwordHash,
      role: Role.USER,
      avatarUrl:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Carlos Oliveira",
      email: "user3@example.com",
      passwordHash,
      role: Role.USER,
      avatarUrl:
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  });

  // Criar usuários empresa
  const companyUser1 = await prisma.user.create({
    data: {
      name: "Admin EventCorp",
      email: "company1@example.com",
      passwordHash,
      role: Role.COMPANY,
    },
  });

  const companyUser2 = await prisma.user.create({
    data: {
      name: "Admin ShowBiz",
      email: "company2@example.com",
      passwordHash,
      role: Role.COMPANY,
    },
  });

  // Criar empresas
  const company1 = await prisma.company.create({
    data: {
      name: "EventCorp",
      description: "Empresa especializada em eventos musicais e festivais",
      contactEmail: "contato@eventcorp.com",
      ownerId: companyUser1.id,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: "ShowBiz Entertainment",
      description: "Produtora de shows e eventos culturais",
      contactEmail: "info@showbiz.com",
      ownerId: companyUser2.id,
    },
  });

  // Criar eventos
  const event1 = await prisma.event.create({
    data: {
      title: "Rock in Rio 2024",
      description: "O maior festival de música do Brasil está de volta!",
      city: "Rio de Janeiro",
      venue: "Cidade do Rock",
      date: new Date("2024-09-15T20:00:00Z"),
      organizerCompanyId: company1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Lollapalooza Brasil 2024",
      description: "Festival internacional de música alternativa",
      city: "São Paulo",
      venue: "Autódromo de Interlagos",
      date: new Date("2024-03-22T18:00:00Z"),
      organizerCompanyId: company1.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Festival de Inverno de Bonito",
      description: "Música e natureza em perfeita harmonia",
      city: "Bonito",
      venue: "Centro de Convenções",
      date: new Date("2024-07-20T19:00:00Z"),
      organizerCompanyId: company2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: "Festa do Peão de Barretos",
      description: "O maior rodeio da América Latina",
      city: "Barretos",
      venue: "Parque do Peão",
      date: new Date("2024-08-14T20:00:00Z"),
      organizerCompanyId: company2.id,
    },
  });

  // Criar viagens
  const trip1 = await prisma.trip.create({
    data: {
      title: "Galera de SP pro Rock in Rio",
      originCity: "São Paulo",
      destinationCity: "Rio de Janeiro",
      date: new Date("2024-09-14T08:00:00Z"),
      code: nanoid(8).toUpperCase(),
      eventId: event1.id,
      organizerId: user1.id,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "Turma BH - Lollapalooza",
      originCity: "Belo Horizonte",
      destinationCity: "São Paulo",
      date: new Date("2024-03-21T06:00:00Z"),
      code: nanoid(8).toUpperCase(),
      eventId: event2.id,
      organizerId: user2.id,
    },
  });

  // Criar participantes
  await prisma.participant.create({
    data: {
      userId: user1.id,
      tripId: trip1.id,
    },
  });

  await prisma.participant.create({
    data: {
      userId: user2.id,
      tripId: trip1.id,
    },
  });

  await prisma.participant.create({
    data: {
      userId: user3.id,
      tripId: trip1.id,
    },
  });

  await prisma.participant.create({
    data: {
      userId: user2.id,
      tripId: trip2.id,
    },
  });

  await prisma.participant.create({
    data: {
      userId: user3.id,
      tripId: trip2.id,
    },
  });

  // Criar itens de custo
  await prisma.costItem.create({
    data: {
      label: "Gasolina ida e volta",
      totalAmount: 450.0,
      tripId: trip1.id,
      createdBy: user1.id,
    },
  });

  await prisma.costItem.create({
    data: {
      label: "Hospedagem (2 noites)",
      totalAmount: 600.0,
      tripId: trip1.id,
      createdBy: user1.id,
    },
  });

  await prisma.costItem.create({
    data: {
      label: "Pedágio",
      totalAmount: 84.5,
      tripId: trip1.id,
      createdBy: user1.id,
    },
  });

  await prisma.costItem.create({
    data: {
      label: "Combustível",
      totalAmount: 320.0,
      tripId: trip2.id,
      createdBy: user2.id,
    },
  });

  await prisma.costItem.create({
    data: {
      label: "Hotel próximo ao evento",
      totalAmount: 480.0,
      tripId: trip2.id,
      createdBy: user2.id,
    },
  });

  // Criar ofertas de veículos
  await prisma.vehicleOffer.create({
    data: {
      capacity: 4,
      pricePerPerson: 150.0,
      pickupLocation: "Terminal Rodoviário de São Paulo",
      pickupTime: new Date("2024-09-14T07:00:00Z"),
      notes: "Van confortável com ar condicionado, saída pontual às 7h",
      companyId: company1.id,
      tripId: trip1.id,
    },
  });

  await prisma.vehicleOffer.create({
    data: {
      capacity: 8,
      pricePerPerson: 80.0,
      pickupLocation: "Shopping Estação BH",
      pickupTime: new Date("2024-03-21T05:30:00Z"),
      notes: "Micro-ônibus executivo, inclui água e lanche",
      companyId: company2.id,
      tripId: trip2.id,
    },
  });

  // Oferta de veículo sem trip específica (disponível para qualquer viagem)
  await prisma.vehicleOffer.create({
    data: {
      capacity: 12,
      pricePerPerson: 100.0,
      pickupLocation: "Aeroporto de Brasília",
      pickupTime: new Date("2024-07-19T15:00:00Z"),
      notes: "Traslado para Festival de Inverno de Bonito, veículo climatizado",
      companyId: company1.id,
    },
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log(`📊 Dados criados:
    - 5 usuários (3 users + 2 companies)
    - 2 empresas
    - 4 eventos
    - 2 viagens
    - 5 participantes
    - 5 itens de custo
    - 3 ofertas de veículos
  `);

  console.log(`🔑 Credenciais de teste:
    - user1@example.com:password123 (Organizador)
    - user2@example.com:password123 (Usuário)
    - user3@example.com:password123 (Usuário)
    - company1@example.com:password123 (Empresa)
    - company2@example.com:password123 (Empresa)
  `);

  console.log(`🎫 Códigos de viagem:
    - ${trip1.code} (Rock in Rio)
    - ${trip2.code} (Lollapalooza)
  `);
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
