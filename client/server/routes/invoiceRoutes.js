import express from 'express';
import {
  getInvoices,
  createInvoice,
  createInvoiceFromDeal,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.post('/from-deal/:dealId', createInvoiceFromDeal);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;

