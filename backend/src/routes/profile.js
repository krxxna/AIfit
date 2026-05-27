import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.coerce.number().min(10).max(100).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  height: z.coerce.number().min(80).max(260).optional(),
  weight: z.coerce.number().min(25).max(350).optional(),
  fitnessGoal: z.string().optional(),
  activityLevel: z.enum(['Low', 'Moderate', 'High']).optional(),
  foodPreference: z.enum(['Veg', 'Non-Veg', 'Vegan']).optional()
});

router.get('/', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body);
    if (payload.name) req.user.name = payload.name;
    req.user.profile = { ...req.user.profile.toObject?.(), ...payload };
    await req.user.save();
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

export default router;
