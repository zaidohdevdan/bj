import { Request, Response } from 'express';
import { CreateRoomSchema } from '@ephemeral/shared'
import { RoomService } from '../services/room.service';

const roomService = new RoomService();

export class RoomController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parseResult = CreateRoomSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.format() });
        return;
      }

      const room = await roomService.createRoom(req.user.userId, parseResult.data);

      res.status(201).json(room);
    } catch (error) {
      console.error('[RoomController/create] error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getRoom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);

      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      // Validação de expiração server-side
      if (new Date() > room.expiresAt || room.status === 'CLOSED') {
        res.status(410).json({ error: 'Room expired or closed' });
        return;
      }

      res.status(200).json(room);
    } catch (error) {
      console.error('[RoomController/getRoom] error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
