export function calculateBMI(weight, height) {
  const heightM = Number(height) / 100;
  if (!heightM || !weight) return 0;
  return Number((Number(weight) / heightM ** 2).toFixed(1));
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function buildRecommendations(profile = {}) {
  const bmi = calculateBMI(profile.weight, profile.height);
  const baseCalories = profile.gender === 'Female' ? 1900 : 2200;
  const activityBonus = { Low: 0, Moderate: 250, High: 450 }[profile.activityLevel] ?? 200;
  const goalAdjustment = profile.fitnessGoal === 'Lose Weight' ? -350 : profile.fitnessGoal === 'Build Muscle' ? 300 : 0;
  const dailyCalories = baseCalories + activityBonus + goalAdjustment;
  const waterLiters = Number(Math.max(2.2, Number(profile.weight || 70) * 0.035).toFixed(1));

  return {
    bmi,
    category: bmiCategory(bmi),
    dailyCalories,
    waterLiters,
    workoutPlan: ['Strength training', 'Cardio intervals', 'Mobility recovery', 'Weekly progressive overload'],
    fitnessGoals: [`Primary goal: ${profile.fitnessGoal || 'Improve Fitness'}`, 'Hit daily movement target', 'Review progress every Sunday']
  };
}
