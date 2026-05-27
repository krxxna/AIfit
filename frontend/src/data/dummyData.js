export const defaultProfile = {
  name: '',
  age: '',
  gender: '',
  height: '',
  heightUnit: 'cm',
  heightInches: '',
  weight: '',
  targetWeight: '',
  fitnessGoal: '',
  activityLevel: '',
  foodPreference: '',
  experienceLevel: '',
  workoutDaysPerWeek: '',
  healthNotes: ''
};

export const workoutHistory = [
  { day: 'Mon', calories: 420, minutes: 46, weight: 75.2 },
  { day: 'Tue', calories: 360, minutes: 38, weight: 74.9 },
  { day: 'Wed', calories: 520, minutes: 54, weight: 74.8 },
  { day: 'Thu', calories: 280, minutes: 32, weight: 74.6 },
  { day: 'Fri', calories: 610, minutes: 58, weight: 74.3 },
  { day: 'Sat', calories: 450, minutes: 48, weight: 74.1 },
  { day: 'Sun', calories: 390, minutes: 40, weight: 74 }
];

export const adminUsers = [
  { name: 'Aarav Mehta', goal: 'Build Muscle', bmi: 23.9, status: 'Active' },
  { name: 'Priya Nair', goal: 'Lose Weight', bmi: 27.4, status: 'Active' },
  { name: 'Kabir Shah', goal: 'Improve Fitness', bmi: 21.7, status: 'Paused' },
  { name: 'Nisha Rao', goal: 'Endurance', bmi: 22.5, status: 'Active' }
];

export const reminders = [
  { title: 'Hydration', message: 'Drink 300 ml water before your next meeting.', time: '10:30 AM' },
  { title: 'Workout', message: 'Strength session starts in 45 minutes.', time: '6:15 PM' },
  { title: 'Health tip', message: 'Add 25 g protein to breakfast for better satiety.', time: 'Daily' }
];
