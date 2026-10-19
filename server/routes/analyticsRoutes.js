import express from 'express';
import { getAnalyticsData, exportCsv, clearLogs } from '../controllers/analyticsController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/data', getAnalyticsData);
router.get('/export', exportCsv);
router.delete('/logs', requireAdmin, clearLogs);

export default router;
