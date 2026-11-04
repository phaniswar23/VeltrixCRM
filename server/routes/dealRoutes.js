import express from 'express';
import { getDeals, createDeal, updateDeal, deleteDeal } from '../controllers/dealController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getDeals);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;

