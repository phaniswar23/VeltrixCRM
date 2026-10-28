import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  heartbeat,
  sendOtp,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/heartbeat', protect, heartbeat);
router.post('/logout', protect, logout);
router.post('/forgot-password/send-otp', sendOtp);
router.post('/forgot-password/verify-otp', verifyOtp);
router.post('/forgot-password/reset', resetPassword);

export default router;
