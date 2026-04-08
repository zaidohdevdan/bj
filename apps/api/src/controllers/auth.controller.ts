import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user-repository';
import { LoginSchema, RegisterSchema } from '@ephemeral/shared';

const userRepository = new PrismaUserRepository();
const authService = new AuthService(userRepository);

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = LoginSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const firstErrorMessage = parseResult.error.errors[0]?.message || 'Dados inválidos';
        res.status(400).json({ error: firstErrorMessage });
        return;
      }

      const { token, user } = await authService.login(parseResult.data);
      res.status(200).json({ token, user });
    } catch (error: unknown) {
      console.error('[AuthController/login] error:', error);
      const isError = error instanceof Error;
      const status = isError && error.message === 'Invalid credentials' ? 401 : 500;
      res.status(status).json({ error: isError ? error.message : 'Internal Server Error' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = RegisterSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const firstErrorMessage = parseResult.error.errors[0]?.message || 'Dados inválidos';
        res.status(400).json({ error: firstErrorMessage });
        return;
      }

      const { token, user } = await authService.register(parseResult.data);
      res.status(201).json({ token, user });
    } catch (error: unknown) {
      console.error('[AuthController/register] error:', error);
      const isError = error instanceof Error;
      const status = isError && error.message === 'User already exists' ? 409 : 500;
      res.status(status).json({ error: isError ? error.message : 'Internal Server Error' });
    }
  }

  async guestJoin(req: Request, res: Response): Promise<void> {
    try {
      const { roomId, guestName, secret } = req.body;

      if (!roomId || !guestName || !secret) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // 1. Verificar segredo da sala
      const roomService = req.app.get('roomService');
      await roomService.verifyGuestSecret(roomId, secret);

      // 2. Autenticar anonimamente
      const { token, user } = await authService.authenticateAnonymously(guestName);

      // 3. Marcar o convidado como verificado na sala imediatamente
      await roomService.verifyGuestSecret(roomId, secret, user.id);

      res.status(200).json({ token, user });
    } catch (error: any) {
      console.error('[AuthController/guestJoin] error:', error.message);
      res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  }
}
