export function calculateBMI(weightKg, heightCm) {
  const heightM = Number(heightCm) / 100;
  if (!heightM || !weightKg) return 0;
  return Number((Number(weightKg) / heightM ** 2).toFixed(1));
}

export function getBMICategory(bmi) {
  if (!bmi) return { label: 'Pending', tone: 'bg-slate-100 text-slate-600', suggestion: 'Complete your profile to unlock BMI guidance.' };
  if (bmi < 18.5) {
    return {
      label: 'Underweight',
      tone: 'bg-ocean/15 text-sky-700 dark:text-sky-300',
      suggestion: 'Add calorie-dense whole foods and strength work to build lean mass steadily.'
    };
  }
  if (bmi < 25) {
    return {
      label: 'Normal',
      tone: 'bg-mint/15 text-teal-700 dark:text-teal-300',
      suggestion: 'Maintain your balanced routine with progressive workouts and consistent sleep.'
    };
  }
  if (bmi < 30) {
    return {
      label: 'Overweight',
      tone: 'bg-citrus/20 text-amber-700 dark:text-amber-300',
      suggestion: 'Create a mild calorie deficit and blend cardio with resistance training.'
    };
  }
  return {
    label: 'Obese',
    tone: 'bg-coral/15 text-rose-700 dark:text-rose-300',
    suggestion: 'Prioritize sustainable nutrition changes and low-impact activity progression.'
  };
}
