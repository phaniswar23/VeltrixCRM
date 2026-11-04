import Deal from '../models/Deal.js';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import ActivityLog from '../models/ActivityLog.js';
import { onDealStageChanged } from '../services/automationService.js';
import realtimeService from '../services/realtimeService.js';

export const getDeals = async (req, res) => {
  try {
    const { stage, assigned_to, search, customer_id } = req.query;
    const filter = {};

    if (stage) filter.stage = stage;
    if (customer_id) filter.customer_id = customer_id;

    // Non-admin can see all deals or only assigned depending on query
    if (req.user.role === 'staff' && assigned_to) {
      filter.assigned_to = assigned_to;
    } else if (assigned_to) {
      filter.assigned_to = assigned_to;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const deals = await Deal.find(filter)
      .populate('customer_id', 'name email phone company')
      .populate('assigned_to', 'name email avatar')
      .sort({ createdAt: -1 });

    // Aggregate statistics
    let totalPipelineValue = 0;
    let weightedForecast = 0;
    let wonValue = 0;
    let lostValue = 0;
    let wonCount = 0;

    deals.forEach((deal) => {
      totalPipelineValue += deal.amount || 0;
      weightedForecast += (deal.amount || 0) * ((deal.win_probability || 0) / 100);
      if (deal.stage === 'closed_won') {
        wonValue += deal.amount || 0;
        wonCount++;
      } else if (deal.stage === 'closed_lost') {
        lostValue += deal.amount || 0;
      }
    });

    const winRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;

    // Attach linked invoices to each deal so frontend knows if invoice exists
    const dealsWithInvoices = await Promise.all(
      deals.map(async (deal) => {
        const invoice = await Invoice.findOne({ deal_id: deal._id }).select(
          'invoice_number grand_total status subtotal tax_amount'
        );
        const dealObj = deal.toObject();
        dealObj.invoice = invoice;
        return dealObj;
      })
    );

    res.json({
      success: true,
      deals: dealsWithInvoices,
      metrics: {
        totalDeals: deals.length,
        totalPipelineValue,
        weightedForecast: Math.round(weightedForecast),
        wonValue,
        lostValue,
        winRate,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deals', error: err.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const {
      title,
      amount,
      currency,
      customer_id,
      stage,
      win_probability,
      expected_close_date,
      assigned_to,
      notes,
    } = req.body;

    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Default stage probabilities if not explicitly specified
    const stageProbabilities = {
      lead: 10,
      qualified: 30,
      proposal: 60,
      negotiation: 80,
      closed_won: 100,
      closed_lost: 0,
    };

    const initialProb = win_probability !== undefined 
      ? win_probability 
      : (stageProbabilities[stage] ?? 20);

    const deal = await Deal.create({
      title,
      amount: Number(amount) || 0,
      currency: currency || 'INR',
      customer_id,
      stage: stage || 'lead',
      win_probability: initialProb,
      expected_close_date: expected_close_date || null,
      assigned_to: assigned_to || req.user._id,
      notes: notes || '',
    });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Deal Created',
      description: `Created deal "${deal.title}" valued at ${deal.currency} ${deal.amount.toLocaleString()}${customer ? ` for customer ${customer.name}` : ''}.`,
      details: `Created deal "${deal.title}" valued at ${deal.currency} ${deal.amount.toLocaleString()}${customer ? ` for customer ${customer.name}` : ''}.`,
    });

    const populated = await Deal.findById(deal._id)
      .populate('customer_id', 'name email phone company')
      .populate('assigned_to', 'name email avatar');

    realtimeService.broadcast('DEAL_CREATED', { deal: populated });

    res.status(201).json({ success: true, deal: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create deal', error: err.message });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const oldStage = deal.stage;
    const { stage, amount, win_probability, expected_close_date, assigned_to, lost_reason, notes, title } = req.body;

    if (title !== undefined) deal.title = title;
    if (amount !== undefined) deal.amount = Number(amount);
    if (expected_close_date !== undefined) deal.expected_close_date = expected_close_date;
    if (assigned_to !== undefined) deal.assigned_to = assigned_to;
    if (lost_reason !== undefined) deal.lost_reason = lost_reason;
    if (notes !== undefined) deal.notes = notes;

    if (stage && stage !== oldStage) {
      deal.stage = stage;
      // Auto-adjust probability if not manually specified
      if (win_probability === undefined) {
        const stageProbabilities = {
          lead: 10,
          qualified: 30,
          proposal: 60,
          negotiation: 80,
          closed_won: 100,
          closed_lost: 0,
        };
        deal.win_probability = stageProbabilities[stage] ?? deal.win_probability;
      }
    }

    if (win_probability !== undefined) {
      deal.win_probability = win_probability;
    }

    await deal.save();

    if (stage && stage !== oldStage) {
      await onDealStageChanged(deal, oldStage, stage, req.user._id);
      await ActivityLog.create({
        user_id: req.user._id,
        action: 'Deal Stage Updated',
        description: `Moved deal "${deal.title}" to ${stage.replace('_', ' ').toUpperCase()}`,
        details: `Moved deal "${deal.title}" to ${stage.replace('_', ' ').toUpperCase()}`,
      });
    }

    const updated = await Deal.findById(deal._id)
      .populate('customer_id', 'name email phone company')
      .populate('assigned_to', 'name email avatar');

    res.json({ success: true, deal: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update deal', error: err.message });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const dealTitle = deal.title;
    await deal.deleteOne();
    realtimeService.broadcast('DEAL_DELETED', { dealId: req.params.id });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Deal Deleted',
      description: `Deleted deal: "${dealTitle}"`,
      details: `Deleted deal: "${dealTitle}"`,
    });

    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete deal', error: err.message });
  }
};

