import express from 'express';
import {
  submitContact,
  getInquiries,
  deleteInquiry,
  convertToLead,
} from '../controllers/contactController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public submission
router.post('/', submitContact);

// Admin-only management
router.get('/', protect, requireAdmin, getInquiries);
router.delete('/:id', protect, requireAdmin, deleteInquiry);
router.post('/:id/convert', protect, requireAdmin, convertToLead);

export default router;
