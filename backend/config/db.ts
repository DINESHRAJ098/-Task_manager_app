import mongoose from 'mongoose';

/**
 * MongoDB Database Connection Manager
 * Connects to MongoDB via Mongoose or initializes in-memory persistence fallback
 */
export let isUsingMemoryFallback = false;

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

  try {
    // Attempt Mongoose connection with 2.5s timeout for local/remote MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.host}`);
    isUsingMemoryFallback = false;
  } catch (err: unknown) {
    const error = err as Error;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB server (${mongoURI}): ${error.message}`);
    console.log('[MongoDB Fallback] Initializing in-memory mock MongoDB data-store for smooth zero-config testing.');
    isUsingMemoryFallback = true;
  }
};
