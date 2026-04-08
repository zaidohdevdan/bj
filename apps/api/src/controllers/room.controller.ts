import { Request, Response } from 'express';
import { CreateRoomSchema, VerifyRoomKeySchema } from '@ephemeral/shared';
import { RoomService } from '../services/room.service';

// ──────────────────────────────────────────────────────────────────────────────
// IMPORTANTE: NÃO instanciamos o RoomService aqui.
// O server.ts injeta o RoomService com o WhatsappNotificationProvider real
// via app.set('roomService', ...). Acessamos via req.app.get('roomService').
// Instanciar localmente (com ConsoleNotificationProvider) causava o bug de
// envio silencioso — o bot do WhatsApp nunca era chamado.
// ──────────────────────────────────────────────────────────────────────────────

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

      const roomService: RoomService = req.app.get('roomService');
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
      const roomService: RoomService = req.app.get('roomService');
      const room = await roomService.getRoomById(id);

      // CAMUFLAGEM: Se não existe ou está inativa, vai pro Google
      if (!room || room.status === 'EXPIRED' || room.status === 'CLOSED') {
        res.redirect('https://www.google.com');
        return;
      }

      res.status(200).json(room);
    } catch (error: unknown) {
      res.redirect('https://www.google.com');
    }
  }

  async verifyKey(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.redirect('https://www.google.com');
        return;
      }

      const parseResult = VerifyRoomKeySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.format() });
        return;
      }

      const { id } = req.params;
      const roomService: RoomService = req.app.get('roomService');
      const room = await roomService.verifyRoomKey(id, req.user.userId, parseResult.data);

      res.status(200).json(room);
    } catch (error: unknown) {
      res.redirect('https://www.google.com');
    }
  }

  async join(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.redirect('https://www.google.com');
        return;
      }

      const { id } = req.params;
      const roomService: RoomService = req.app.get('roomService');
      const room = await roomService.joinRoom(id, req.user.userId);

      res.status(200).json(room);
    } catch (error: unknown) {
      res.redirect('https://www.google.com');
    }
  }

  async close(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const roomService: RoomService = req.app.get('roomService');
      const room = await roomService.closeRoom(id, req.user.userId);

      res.status(200).json(room);
    } catch (error: unknown) {
      res.redirect('https://www.google.com');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const roomService: RoomService = req.app.get('roomService');
      const rooms = await roomService.listRoomsByUser(req.user.userId);
      res.status(200).json(rooms);
    } catch (error) {
      console.error('[RoomController/list] error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async destroy(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const roomService: RoomService = req.app.get('roomService');
      await roomService.destroyRoom(id, req.user.userId);
      res.status(204).send();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Internal Server Error';
      const status = msg === 'Unauthorized' ? 403 : msg === 'Room not found' ? 404 : 500;
      console.error('[RoomController/destroy] error:', error);
      res.status(status).json({ error: msg });
    }
  }

  async clearRooms(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const roomService: RoomService = req.app.get('roomService');
      await roomService.clearUserRooms(req.user.userId);
      res.status(204).send();
    } catch (error) {
      console.error('[RoomController/clearRooms] error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
