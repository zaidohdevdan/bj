import { PrismaClient, User, Room } from '@prisma/client';
import { CreateRoomDTO, RoomStatus } from '@ephemeral/shared';

export interface IRoomRepository {
  create(userId: string, data: CreateRoomDTO & { expiresAt: Date, secretHash: string }): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  update(id: string, data: Partial<Room>): Promise<Room>;
  updateStatus(id: string, status: RoomStatus): Promise<Room>;
  findByUserId(userId: string): Promise<Room[]>;
  delete(id: string): Promise<void>;
  deleteManyByUserId(userId: string): Promise<void>;
}
