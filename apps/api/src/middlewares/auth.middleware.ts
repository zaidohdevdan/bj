import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayloadSession } from '@ephemeral/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'ephemeral_dev_secret';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayloadSession;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token is missing or invalid format' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadSession;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
};
