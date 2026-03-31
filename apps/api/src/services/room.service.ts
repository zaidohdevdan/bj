import { prisma } from '../lib/prisma';
import { CreateRoomDTO } from '@ephemeral/shared';

export class RoomService {
  async createRoom(userId: string, data: CreateRoomDTO) {
    const { durationMin } = data;
    
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + durationMin * 60 * 1000);

    const room = await prisma.room.create({
      data: {
        status: 'CREATED',
        creatorId: userId,
        createdAt,
        expiresAt,
      },
    });

    return room;
  }

  async getRoomById(roomId: string) {
    return prisma.room.findUnique({
      where: { id: roomId },
      include: { creator: { select: { username: true } } }
    });
  }
}
