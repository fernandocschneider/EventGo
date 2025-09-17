import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    role: string;
  };
}

export async function createContext({ req }: ExpressContextFunctionArgument): Promise<Context> {
  const context: Context = {
    prisma,
  };

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      context.user = payload;
    } catch (error) {
      // Token inválido, continuar sem usuário
    }
  }

  return context;
}