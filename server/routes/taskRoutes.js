import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
