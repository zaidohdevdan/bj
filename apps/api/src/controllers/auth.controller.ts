import { Request, Response } from 'express';
import { LoginSchema } from '@ephemeral/shared';
import { AuthService } from '../services/auth.service';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user-repository';

const userRepository = new PrismaUserRepository();
const authService = new AuthService(userRepository);

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = LoginSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.format() });
        return;
      }

      const { username } = parseResult.data;
      const { token, user } = await authService.authenticateAnonymously(username);

      res.status(200).json({ token, user });
    } catch (error) {
      console.error('[AuthController/login] error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
