import { Room } from '../../../prisma/generated/client';
import { CreateRoomDTO, RoomStatus } from '@ephemeral/shared';

export interface IRoomRepository {
  create(userId: string, data: CreateRoomDTO & { expiresAt: Date }): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  updateStatus(id: string, status: RoomStatus): Promise<Room>;
}
