import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IUserRepository } from '../repositories/interfaces/user-repository.interface';
import { JwtPayloadSession, LoginDTO, RegisterDTO } from '@ephemeral/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'ephemeral_dev_secret';

export class AuthService {
  constructor(private userRepository: IUserRepository) { }

  async register(data: RegisterDTO): Promise<{ token: string; user: { id: string, username: string } }> {
    const existingUser = await this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.userRepository.create(data.username, passwordHash);

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

  async login(data: LoginDTO): Promise<{ token: string; user: { id: string, username: string } }> {
    const user = await this.userRepository.findByUsername(data.username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
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

  async authenticateAnonymously(username: string): Promise<{ token: string; user: { id: string, username: string } }> {
    let user = await this.userRepository.findByUsername(username);

    if (!user) {
      // For anonymous, we still need a "password" or we just allow empty password fields in DB
      // But since we want to enforce password auth, let's just make this method internal or restricted.
      const placeholderPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await this.userRepository.create(username, placeholderPassword);
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
