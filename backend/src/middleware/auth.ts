import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

declare global { namespace Express { interface Request { userId?: string } } }
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.reachinbox_token ?? req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try { req.userId = (jwt.verify(token, config.jwtSecret) as { userId: string }).userId; next(); }
  catch { res.status(401).json({ error: 'Invalid or expired session' }); }
}
