export const profileOptions = {
  gender: ['Male', 'Female', 'Other'],
  fitnessGoal: ['Lose Weight', 'Build Muscle', 'Improve Fitness', 'Endurance'],
  activityLevel: ['Low', 'Moderate', 'High'],
  foodPreference: ['Veg', 'Non-Veg', 'Vegan'],
  experienceLevel: ['Beginner', 'Intermediate', 'Advanced']
};

export const requiredProfileFields = ['age', 'height', 'weight', 'gender', 'fitnessGoal', 'activityLevel', 'foodPreference'];

export function cmToInches(heightCm) {
  const cm = Number(heightCm);
  if (!cm) return '';
  return Number((cm / 2.54).toFixed(1));
}

export function inchesToCm(heightInches) {
  const inches = Number(heightInches);
  if (!inches) return '';
  return Number((inches * 2.54).toFixed(1));
}

export function isProfileComplete(userOrProfile) {
  if (typeof userOrProfile?.profileComplete === 'boolean') return userOrProfile.profileComplete;
  const profile = userOrProfile?.profile || userOrProfile || {};
  return requiredProfileFields.every((field) => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== '';
  });
}

export function mergeUserProfile(user, fallbackProfile) {
  const storedProfile = user?.profile || {};
  const height = storedProfile.height ?? fallbackProfile.height;
  const heightUnit = storedProfile.heightUnit || fallbackProfile.heightUnit || 'cm';

  return {
    ...fallbackProfile,
    ...storedProfile,
    name: user?.name || storedProfile.name || fallbackProfile.name,
    height,
    heightUnit,
    heightInches: storedProfile.heightInches ?? cmToInches(height)
  };
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
}

export function buildProfilePayload(profile) {
  const heightUnit = profile.heightUnit || 'cm';
  const heightInches = heightUnit === 'in' ? optionalNumber(profile.heightInches) : cmToInches(profile.height);
  const height = heightUnit === 'in' ? inchesToCm(heightInches) : optionalNumber(profile.height);

  const payload = {
    name: profile.name?.trim(),
    age: optionalNumber(profile.age),
    gender: profile.gender,
    height,
    heightUnit,
    heightInches,
    weight: optionalNumber(profile.weight),
    targetWeight: optionalNumber(profile.targetWeight),
    fitnessGoal: profile.fitnessGoal,
    activityLevel: profile.activityLevel,
    foodPreference: profile.foodPreference,
    experienceLevel: profile.experienceLevel,
    workoutDaysPerWeek: optionalNumber(profile.workoutDaysPerWeek),
    healthNotes: profile.healthNotes?.trim()
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || (payload[key] === '' && key !== 'healthNotes')) delete payload[key];
  });

  return payload;
}

export function displayHeight(profile) {
  if (profile.heightUnit === 'in') return `${profile.heightInches || cmToInches(profile.height)} in`;
  return `${profile.height} cm`;
}
