import express from 'express';
import {
  getStaff,
  getAllUsers,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getDashboardStats,
} from '../controllers/staffController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/all-users', getAllUsers);
router.route('/').get(getStaff).post(requireAdmin, createStaff);
router.route('/:id').get(getStaffById).put(requireAdmin, updateStaff).delete(requireAdmin, deleteStaff);

export default router;
