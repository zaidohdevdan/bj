export type RoomStatus = 'CREATED' | 'CONNECTED' | 'EXPIRING' | 'EXPIRED' | 'CLOSED';

export interface BaseRoom {
  id: string;
  status: RoomStatus;
  createdAt: Date;
  expiresAt: Date;
}
