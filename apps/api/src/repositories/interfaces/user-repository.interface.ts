import { PrismaClient, User, Room } from '@prisma/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(username: string, passwordHash: string): Promise<User>;
}
