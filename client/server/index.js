import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected on serverless request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error:', err.message);
  }
  next();
});

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    app: 'VeltrixCRM MERN Platform',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (supports both /api/* and /* if rewritten by Vercel)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/customers', customerRoutes);
app.use('/customers', customerRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

app.use('/api/staff', staffRoutes);
app.use('/staff', staffRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);

// Serve static assets in production if client build exists
const clientDist = path.join(__dirname, '../dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('VeltrixCRM API is running. Start the React frontend via Vite dev server or run npm run build.');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Veltrix Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5050;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 [VeltrixCRM Backend] Running at http://localhost:${PORT}`);
  });
}

export default app;
