import { prisma } from '../../lib/prisma';
import { PrismaClient, User, Room } from '@prisma/client';
import { IUserRepository } from '../interfaces/user-repository.interface';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  async create(username: string, passwordHash: string): Promise<User> {
    return prisma.user.create({
      data: { 
        username,
        password: passwordHash
      }
    });
  }
}
