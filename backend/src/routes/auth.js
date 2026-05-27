import express from 'express';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/signup', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }
    const payload = signupSchema.parse(req.body);
    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create(payload);
    res.status(201).json({
      message: 'Account created. Please log in to continue.',
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected' });
    }
    const { credential } = req.body;
    if (!credential || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'Google credential or GOOGLE_CLIENT_ID missing' });
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const user = await User.findOneAndUpdate(
      { email: payload.email },
      { name: payload.name, email: payload.email, googleId: payload.sub },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile
  };
}

export default router;
