import express from 'express';
import {
  getTimelineForCustomer,
  addTimelineEvent,
  deleteTimelineEvent,
} from '../controllers/timelineController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/customer/:customerId', getTimelineForCustomer);
router.post('/', addTimelineEvent);
router.delete('/:id', deleteTimelineEvent);

export default router;

