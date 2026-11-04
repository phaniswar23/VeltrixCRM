import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { autoSeedIfEmpty } from '../seed/autoSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const ATLAS_FALLBACK =
  'mongodb+srv://phaniswarjanyavula_db_user:2Dm05nNjOFJn7pCS@cluster0.dhtz6ix.mongodb.net/veltrixcrm?retryWrites=true&w=majority';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI || ATLAS_FALLBACK;

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedIfEmpty();
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed: ${error.message}`);
    if (primaryUri !== ATLAS_FALLBACK) {
      console.log('[MongoDB] Attempting fallback to cloud Atlas MongoDB cluster...');
      try {
        const conn = await mongoose.connect(ATLAS_FALLBACK, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Connected via Atlas fallback: ${conn.connection.host}/${conn.connection.name}`);
        await autoSeedIfEmpty();
        return conn;
      } catch (fallbackError) {
        console.error(`[MongoDB] Atlas fallback failed: ${fallbackError.message}`);
      }
    }
  }
};

export default connectDB;
