import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'fitai-dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fitai-dev-secret');
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}
