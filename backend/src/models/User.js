import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const profileSchema = new mongoose.Schema(
  {
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    height: Number,
    weight: Number,
    fitnessGoal: { type: String, default: 'Improve Fitness' },
    activityLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
    foodPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile: { type: profileSchema, default: () => ({}) },
    streak: { type: Number, default: 0 },
    workoutHistory: [
      {
        exercise: String,
        reps: Number,
        calories: Number,
        durationMinutes: Number,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
