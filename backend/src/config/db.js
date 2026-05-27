import mongoose from 'mongoose';

export async function connectDatabase() {
  // Support both expected keys: MONGO_URI and MONGO_URL (in case env uses a different naming).
  const uri = process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    // Fail-fast: auth/profile/recommendations depend on DB.
    throw new Error('MONGO_URI (or MONGO_URL) is not set');
  }


  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000
    });

    console.log('MongoDB connected');
  } catch (error) {
    // Fail-fast: don’t start API in a broken persistence state.
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

