import express from 'express';
import { getAutomationRules, toggleAutomationRule } from '../controllers/automationController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAutomationRules);
router.patch('/:id/toggle', requireAdmin, toggleAutomationRule);

export default router;

