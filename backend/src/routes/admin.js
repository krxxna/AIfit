import express from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(100);
  res.json({ users });
});

router.get('/analytics', requireAuth, requireAdmin, async (_req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ streak: { $gt: 0 } });
  res.json({
    totalUsers,
    activeUsers,
    reports: [
      { label: 'Workout sessions', value: 7832 },
      { label: 'Calories tracked', value: 48200 },
      { label: 'Diet plans generated', value: 1184 }
    ]
  });
});

export default router;
