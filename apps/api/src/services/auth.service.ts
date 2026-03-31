import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { JwtPayloadSession } from '@ephemeral/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'ephemeral_dev_secret';

export class AuthService {
  async authenticateAnonymously(username: string): Promise<{ token: string; user: { id: string, username: string } }> {
    // Busca ou cria o usuário pelo apelido. Como é efêmero, não pedimos senhas.
    let user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username }
      });
    }

    const payload: JwtPayloadSession = {
      userId: user.id,
      username: user.username,
    };

    // Assina o JWT (dura por muito mais tempo que as salas, para manter a sessão ativa)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return { 
      token, 
      user: { id: user.id, username: user.username }
    };
  }
}
