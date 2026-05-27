import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildRecommendations } from '../utils/recommendations.js';

const router = express.Router();

const dietMap = {
  Veg: {
    breakfast: 'Greek yogurt oats bowl',
    lunch: 'Paneer quinoa bowl',
    snacks: 'Sprouts chaat',
    dinner: 'Tofu tikka with dal'
  },
  'Non-Veg': {
    breakfast: 'Egg toast with avocado',
    lunch: 'Chicken rice bowl',
    snacks: 'Tuna cucumber cups',
    dinner: 'Fish curry with millet'
  },
  Vegan: {
    breakfast: 'Soy protein smoothie',
    lunch: 'Chickpea Buddha bowl',
    snacks: 'Roasted edamame',
    dinner: 'Tempeh soba stir fry'
  }
};

router.get('/', requireAuth, (req, res) => {
  const recommendations = buildRecommendations(req.user.profile);
  res.json({
    ...recommendations,
    diet: dietMap[req.user.profile.foodPreference] || dietMap.Veg
  });
});

export default router;
