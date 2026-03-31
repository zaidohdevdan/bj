import { prisma } from '../../lib/prisma';
import { Room } from '../../../prisma/generated/client';
import { CreateRoomDTO, RoomStatus } from '@ephemeral/shared';
import { IRoomRepository } from '../interfaces/room-repository.interface';

export class PrismaRoomRepository implements IRoomRepository {
  async create(userId: string, data: CreateRoomDTO & { expiresAt: Date }): Promise<Room> {
    return prisma.room.create({
      data: {
        status: 'CREATED',
        creatorId: userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
      include: { creator: { select: { username: true } } }
    });
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data: { status }
    });
  }
}
