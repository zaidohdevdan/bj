import jwt from 'jsonwebtoken';
import { JwtPayloadSession } from '@ephemeral/shared';
import { IUserRepository } from '../repositories/interfaces/user-repository.interface';

const JWT_SECRET = process.env.JWT_SECRET || 'ephemeral_dev_secret';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async authenticateAnonymously(username: string): Promise<{ token: string; user: { id: string, username: string } }> {
    let user = await this.userRepository.findByUsername(username);

    if (!user) {
      user = await this.userRepository.create(username);
    }

    const payload: JwtPayloadSession = {
      userId: user.id,
      username: user.username,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return { 
      token, 
      user: { id: user.id, username: user.username }
    };
  }
}
