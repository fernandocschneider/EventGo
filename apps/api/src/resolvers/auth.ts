import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Context } from '../context';
import { GraphQLError } from 'graphql';

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) return null;
      
      return await prisma.user.findUnique({
        where: { id: user.id }
      });
    }
  },

  Mutation: {
    signup: async (_: any, { input }: any, { prisma }: Context) => {
      const { name, email, password, role } = input;

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new GraphQLError('Usuário já existe com este email');
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        }
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: newUser
      };
    },

    login: async (_: any, { email, password }: any, { prisma }: Context) => {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new GraphQLError('Credenciais inválidas');
      }

      // Verificar senha
      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (!passwordValid) {
        throw new GraphQLError('Credenciais inválidas');
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return {
        token,
        user
      };
    }
  }
};