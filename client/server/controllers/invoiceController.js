import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Deal from '../models/Deal.js';
import ActivityLog from '../models/ActivityLog.js';
import TimelineEvent from '../models/TimelineEvent.js';
import realtimeService from '../services/realtimeService.js';

export const getInvoices = async (req, res) => {
  try {
    const { status, customer_id, search } = req.query;
    const filter = {};

    if (status) {
      if (status === 'unpaid') {
        filter.status = { $ne: 'paid' };
      } else {
        filter.status = status;
      }
    }
    if (customer_id) filter.customer_id = customer_id;
    if (search && search.trim()) {
      filter.$or = [
        { invoice_number: { $regex: search.trim(), $options: 'i' } },
        { 'items.description': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(filter)
      .populate('customer_id', 'name email phone company')
      .populate('deal_id', 'title amount stage')
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    // Compute global metrics (or scoped by customer if customer_id filter provided)
    const statsQuery = customer_id ? { customer_id } : {};
    const allInvoices = await Invoice.find(statsQuery);

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;

    allInvoices.forEach((inv) => {
      totalInvoiced += inv.grand_total || 0;
      if (inv.status === 'paid') {
        totalPaid += inv.grand_total || 0;
      } else if (inv.status !== 'cancelled') {
        totalPending += inv.grand_total || 0;
      }
    });

    res.json({
      success: true,
      invoices,
      stats: {
        totalCount: allInvoices.length,
        totalInvoiced,
        totalPaid,
        totalPending,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const {
      customer_id,
      deal_id,
      items,
      tax_rate,
      discount,
      currency,
      due_date,
      notes,
      invoice_number,
    } = req.body;

    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Auto-generate invoice number if missing
    let invNum = invoice_number;
    if (!invNum) {
      const count = await Invoice.countDocuments();
      invNum = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const parsedItems = (items || []).map((item) => ({
      description: item.description || 'Service/Product',
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
    }));

    const subtotal = parsedItems.reduce((acc, curr) => acc + curr.total, 0);
    const taxRate = Number(tax_rate) !== undefined ? Number(tax_rate) : 18;
    const discountVal = Number(discount) || 0;
    const taxAmount = ((subtotal - discountVal) * taxRate) / 100;
    const grandTotal = Math.max(0, subtotal - discountVal + taxAmount);

    const invoice = await Invoice.create({
      invoice_number: invNum,
      customer_id,
      deal_id: deal_id || null,
      items: parsedItems,
      subtotal,
      tax_rate: taxRate,
      tax_amount: Math.round(taxAmount),
      discount: discountVal,
      grand_total: Math.round(grandTotal),
      currency: currency || 'INR',
      due_date: due_date || undefined,
      notes: notes || undefined,
      created_by: req.user._id,
      status: 'draft',
    });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Invoice Created',
      description: `Generated invoice ${invoice.invoice_number} for ${customer.name} total ${invoice.currency} ${invoice.grand_total.toLocaleString()}.`,
      details: `Generated invoice ${invoice.invoice_number} for ${customer.name} total ${invoice.currency} ${invoice.grand_total.toLocaleString()}.`,
    });

    await TimelineEvent.create({
      customer_id,
      author: req.user._id,
      type: 'note',
      title: `Invoice Generated: ${invoice.invoice_number}`,
      description: `Invoice created with ${parsedItems.length} items. Total: ${invoice.currency} ${invoice.grand_total.toLocaleString()}.`,
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('customer_id', 'name email phone company')
      .populate('created_by', 'name email');

    realtimeService.broadcast('INVOICE_CREATED', { invoice: populated });

    res.status(201).json({ success: true, invoice: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invoice', error: err.message });
  }
};

export const createInvoiceFromDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const deal = await Deal.findById(dealId).populate('customer_id');
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Return existing invoice if already generated for this deal to prevent duplicates
    const existing = await Invoice.findOne({ deal_id: deal._id })
      .populate('customer_id', 'name email phone company')
      .populate('deal_id', 'title amount stage')
      .populate('created_by', 'name email');
    if (existing) {
      return res.status(200).json({ success: true, invoice: existing, message: 'Invoice already exists for this deal' });
    }

    // Resolve customer ID safely
    let customerId = deal.customer_id?._id || deal.customer_id;
    if (!customerId) {
      const anyCust = await Customer.findOne();
      customerId = anyCust ? anyCust._id : null;
    }

    if (!customerId) {
      return res.status(400).json({ message: 'Please add a customer before creating an invoice.' });
    }

    // Generate unique invoice number safely
    const count = await Invoice.countDocuments();
    let invNum = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    let exists = await Invoice.findOne({ invoice_number: invNum });
    let attempts = 1;
    while (exists && attempts < 50) {
      invNum = `INV-${new Date().getFullYear()}-${String(count + 1 + attempts).padStart(4, '0')}`;
      exists = await Invoice.findOne({ invoice_number: invNum });
      attempts++;
    }
    if (exists) {
      invNum = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    const items = [
      {
        description: deal.title || 'CRM Opportunity Services',
        quantity: 1,
        unit_price: deal.amount || 0,
        total: deal.amount || 0,
      },
    ];

    const subtotal = deal.amount || 0;
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    const invoice = await Invoice.create({
      invoice_number: invNum,
      customer_id: customerId,
      deal_id: deal._id,
      items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: Math.round(taxAmount),
      discount: 0,
      grand_total: Math.round(grandTotal),
      currency: deal.currency || 'INR',
      created_by: req.user?._id || null,
      status: 'draft',
      notes: `Generated from deal: ${deal.title}`,
    });

    try {
      await TimelineEvent.create({
        customer_id: customerId,
        user_id: req.user?._id || null,
        type: 'status_change',
        title: `Invoice ${invNum} Generated`,
        description: `Created from deal "${deal.title}" for ₹${grandTotal.toLocaleString()}`,
      });
    } catch (e) {
      // quiet fail
    }

    const populated = await Invoice.findById(invoice._id)
      .populate('customer_id', 'name email phone company')
      .populate('deal_id', 'title amount stage')
      .populate('created_by', 'name email');

    realtimeService.broadcast('INVOICE_CREATED', { invoice: populated });

    res.status(201).json({ success: true, invoice: populated });
  } catch (err) {
    console.error('Error creating invoice from deal:', err);
    res.status(500).json({ message: err.message || 'Failed to convert deal to invoice' });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const {
      customer_id,
      items,
      tax_rate,
      discount,
      status,
      notes,
      due_date,
    } = req.body;

    if (customer_id) {
      invoice.customer_id = customer_id;
    }

    if (items && Array.isArray(items)) {
      const parsedItems = items.map((item) => ({
        description: item.description || 'Deliverable / Service',
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
      }));

      const subtotal = parsedItems.reduce((acc, curr) => acc + curr.total, 0);
      const taxRateVal = tax_rate !== undefined ? Number(tax_rate) : (invoice.tax_rate || 18);
      const discountVal = discount !== undefined ? Number(discount) : (invoice.discount || 0);
      const taxable = Math.max(0, subtotal - discountVal);
      const taxAmount = (taxable * taxRateVal) / 100;
      const grandTotal = taxable + taxAmount;

      invoice.items = parsedItems;
      invoice.subtotal = subtotal;
      invoice.tax_rate = taxRateVal;
      invoice.tax_amount = Math.round(taxAmount);
      invoice.discount = discountVal;
      invoice.grand_total = Math.round(grandTotal);
    } else {
      if (tax_rate !== undefined || discount !== undefined) {
        const taxRateVal = tax_rate !== undefined ? Number(tax_rate) : (invoice.tax_rate || 18);
        const discountVal = discount !== undefined ? Number(discount) : (invoice.discount || 0);
        const taxable = Math.max(0, (invoice.subtotal || 0) - discountVal);
        const taxAmount = (taxable * taxRateVal) / 100;
        const grandTotal = taxable + taxAmount;

        invoice.tax_rate = taxRateVal;
        invoice.discount = discountVal;
        invoice.tax_amount = Math.round(taxAmount);
        invoice.grand_total = Math.round(grandTotal);
      }
    }

    if (status !== undefined) {
      invoice.status = status;
      if (status === 'paid') {
        if (!invoice.paid_at) invoice.paid_at = new Date();
        if (invoice.deal_id) {
          await Deal.findByIdAndUpdate(invoice.deal_id, {
            stage: 'closed_won',
            win_probability: 100,
          });
          realtimeService.broadcast('DEAL_UPDATED', { dealId: invoice.deal_id });
        }
      } else {
        invoice.paid_at = null;
      }
    }

    if (notes !== undefined) invoice.notes = notes;
    if (due_date !== undefined) invoice.due_date = due_date;

    await invoice.save();

    const populated = await Invoice.findById(invoice._id)
      .populate('customer_id', 'name email phone company')
      .populate('deal_id', 'title amount stage')
      .populate('created_by', 'name email');

    realtimeService.broadcast('INVOICE_UPDATED', { invoice: populated });

    res.json({ success: true, invoice: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update invoice', error: err.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete invoice', error: err.message });
  }
};

