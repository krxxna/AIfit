import { calculateBMI, getBMICategory } from './bmi';

const dietTemplates = {
  Veg: [
    ['Breakfast', 'Greek yogurt bowl with oats, berries, chia seeds', 430, 28, 54, 12],
    ['Lunch', 'Paneer quinoa bowl with lentils and roasted vegetables', 680, 42, 76, 24],
    ['Snack', 'Sprouts chaat with fruit and coconut water', 260, 16, 40, 5],
    ['Dinner', 'Tofu tikka, brown rice, spinach dal, cucumber salad', 610, 38, 72, 18]
  ],
  'Non-Veg': [
    ['Breakfast', 'Egg omelet with whole-grain toast and avocado', 500, 34, 42, 24],
    ['Lunch', 'Grilled chicken rice bowl with beans and salad', 720, 55, 78, 18],
    ['Snack', 'Tuna cucumber cups with banana smoothie', 330, 30, 34, 9],
    ['Dinner', 'Fish curry, millet, steamed vegetables, curd', 640, 48, 66, 20]
  ],
  Vegan: [
    ['Breakfast', 'Protein smoothie with soy milk, banana, oats, peanut butter', 520, 30, 62, 18],
    ['Lunch', 'Chickpea Buddha bowl with tahini and brown rice', 700, 32, 92, 22],
    ['Snack', 'Roasted edamame, dates, and lemon water', 310, 22, 36, 8],
    ['Dinner', 'Tempeh stir fry with soba noodles and mixed greens', 650, 40, 74, 20]
  ]
};

export function buildRecommendation(profile) {
  const bmi = calculateBMI(profile.weight, profile.height);
  const category = getBMICategory(bmi);
  const baseCalories = profile.gender === 'Female' ? 1900 : 2200;
  const activityBonus = { Low: 0, Moderate: 250, High: 450 }[profile.activityLevel] ?? 200;
  const goalAdjustment = profile.fitnessGoal === 'Lose Weight' ? -350 : profile.fitnessGoal === 'Build Muscle' ? 300 : 0;
  const dailyCalories = baseCalories + activityBonus + goalAdjustment;
  const waterLiters = Number(Math.max(2.2, Number(profile.weight || 70) * 0.035).toFixed(1));

  return {
    bmi,
    category,
    dailyCalories,
    waterLiters,
    focus: profile.fitnessGoal || 'Improve Fitness',
    workoutPlan: [
      '3 strength sessions focused on compound movement patterns',
      '2 cardio sessions with zone-2 intervals and one short HIIT finisher',
      '10 minutes of mobility work after each training day',
      'Weekly progression: add 1 set or 5% load when form stays clean'
    ],
    exercises: [
      { name: 'Pushups', sets: 4, reps: '8-14', cue: 'Keep ribs down and elbows at 45 degrees.' },
      { name: 'Squats', sets: 4, reps: '10-16', cue: 'Drive knees out and maintain a tall chest.' },
      { name: 'Jumping Jacks', sets: 3, reps: '45 sec', cue: 'Land softly and keep a steady rhythm.' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15', cue: 'Pin elbows and avoid swinging.' }
    ],
    diet: (dietTemplates[profile.foodPreference] || dietTemplates.Veg).map(([meal, item, calories, protein, carbs, fats]) => ({
      meal,
      item,
      calories,
      protein,
      carbs,
      fats
    }))
  };
}
