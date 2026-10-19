import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb+srv://phaniswarjanyavula_db_user:2Dm05nNjOFJn7pCS@cluster0.dhtz6ix.mongodb.net/veltrixcrm?retryWrites=true&w=majority';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
  }
};

export default connectDB;
