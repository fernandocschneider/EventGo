import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Basic seed data - can be expanded later
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
