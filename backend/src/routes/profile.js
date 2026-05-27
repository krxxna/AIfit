import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { hasCompletedProfile, sanitizeUser } from '../utils/userSerialization.js';

const router = express.Router();

const optionalNumber = (schema) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), schema.optional());

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  age: optionalNumber(z.coerce.number().min(10).max(100)),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  height: optionalNumber(z.coerce.number().min(80).max(260)),
  heightUnit: z.enum(['cm', 'in']).optional(),
  heightInches: optionalNumber(z.coerce.number().min(31).max(102)),
  weight: optionalNumber(z.coerce.number().min(25).max(350)),
  targetWeight: optionalNumber(z.coerce.number().min(25).max(350)),
  fitnessGoal: z.string().optional(),
  activityLevel: z.enum(['Low', 'Moderate', 'High']).optional(),
  foodPreference: z.enum(['Veg', 'Non-Veg', 'Vegan']).optional(),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  workoutDaysPerWeek: optionalNumber(z.coerce.number().min(1).max(7)),
  healthNotes: z.string().max(500).optional()
});

router.get('/', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body);
    const { name, ...profilePayload } = payload;

    if (name) req.user.name = name.trim();
    req.user.profile = { ...req.user.profile.toObject?.(), ...profilePayload };

    if (hasCompletedProfile(req.user)) {
      req.user.profile.profileCompletedAt = req.user.profile.profileCompletedAt || new Date();
    } else {
      req.user.profile.profileCompletedAt = undefined;
    }

    await req.user.save();
    res.json({ user: sanitizeUser(req.user) });
  } catch (error) {
    next(error);
  }
});

export default router;
