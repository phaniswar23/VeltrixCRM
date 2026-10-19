import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veltrixcrm';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
  }
};

export default connectDB;
