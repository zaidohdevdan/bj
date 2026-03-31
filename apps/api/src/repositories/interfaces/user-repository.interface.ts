import { User } from '../../../prisma/generated/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(username: string): Promise<User>;
}
