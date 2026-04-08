import { prisma } from '../../lib/prisma';
import { Room } from '../../../prisma/generated/client';
import { CreateRoomDTO, RoomStatus } from '@ephemeral/shared';
import { IRoomRepository } from '../interfaces/room-repository.interface';

export class PrismaRoomRepository implements IRoomRepository {
  async create(userId: string, data: CreateRoomDTO & { expiresAt: Date, secretHash: string }): Promise<Room> {
    return prisma.room.create({
      data: {
        name: data.name,
        status: 'CREATED',
        creatorId: userId,
        expiresAt: data.expiresAt,
        secretHash: data.secretHash,
      },
    });
  }

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
      include: { 
        creator: { select: { username: true } },
        guest: { select: { username: true } }
      }
    });
  }

  async update(id: string, data: Partial<Room>): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data: {
        ...data,
        // Ensure relations aren't accidentally included in Partials if they leak from types
      } as any
    });
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data: { status }
    });
  }

  async findByUserId(userId: string): Promise<Room[]> {
    return prisma.room.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.room.delete({
      where: { id }
    });
  }

  async deleteManyByUserId(userId: string): Promise<void> {
    await prisma.room.deleteMany({
      where: { creatorId: userId }
    });
  }
}
