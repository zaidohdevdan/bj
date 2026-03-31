import { CreateRoomDTO } from '@ephemeral/shared';
import { IRoomRepository } from '../repositories/interfaces/room-repository.interface';

export class RoomService {
  constructor(private roomRepository: IRoomRepository) {}

  async createRoom(userId: string, data: CreateRoomDTO) {
    const { durationMin } = data;
    
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + durationMin * 60 * 1000);

    const room = await this.roomRepository.create(userId, {
      ...data,
      expiresAt,
    });

    return room;
  }

  async getRoomById(roomId: string) {
    return this.roomRepository.findById(roomId);
  }
}
