import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  clearAll,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);
router.post('/read-all', markAllRead);
router.delete('/clear', clearAll);

export default router;
