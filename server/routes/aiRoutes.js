import express from 'express';
import { chat } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Allow authenticated users to chat with Veltrix AI
router.post('/chat', protect, chat);

export default router;
