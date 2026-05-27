const REQUIRED_PROFILE_FIELDS = ['age', 'height', 'weight', 'gender', 'fitnessGoal', 'activityLevel', 'foodPreference'];

function serializeProfile(profile) {
  return profile?.toObject?.() || profile || {};
}

export function hasCompletedProfile(user) {
  const profile = serializeProfile(user?.profile);
  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== '';
  });
}

export function sanitizeUser(user) {
  const profile = serializeProfile(user.profile);
  const profileComplete = hasCompletedProfile(user);

  return {
    id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: profileComplete ? profile : {},
    profileComplete
  };
}
