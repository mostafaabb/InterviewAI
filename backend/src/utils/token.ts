import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (payload: { id: string; email: string; role: string; plan: string }): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRandomToken = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};
