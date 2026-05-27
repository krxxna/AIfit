import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, (_req, res) => {
  res.json({
    reminders: [
      { type: 'water', message: 'Drink 300 ml water now.', cadence: 'every 90 minutes' },
      { type: 'workout', message: 'Your workout starts at 6:15 PM.', cadence: 'daily' },
      { type: 'tip', message: 'Add protein to breakfast for better recovery.', cadence: 'daily' }
    ]
  });
});

export default router;
