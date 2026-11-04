import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { onCustomerCreated } from '../services/automationService.js';
import realtimeService from '../services/realtimeService.js';

// Calculate algorithmic lead score (0-100)
const computeLeadScore = (customer) => {
  let score = 20; // Base score
  if (customer.name && customer.name.length > 2) score += 10;
  if (customer.email && customer.email.includes('@')) score += 15;
  if (customer.phone && customer.phone.length >= 8) score += 15;
  if (customer.company && customer.company.length > 1) score += 15;
  if (customer.tags && customer.tags.length > 0) score += 10;
  if (customer.status === 'active') score += 15;
  return Math.min(100, Math.max(0, score));
};

export const getCustomers = async (req, res) => {
  try {
    const { search, staff_id, status, tag } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (staff_id) {
      query.assigned_to = staff_id;
    }

    if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    const customers = await Customer.find(query)
      .populate('assigned_to', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ success: true, customers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      'assigned_to',
      'name email role'
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    return res.json({
      ...customer.toObject(),
      assigned_to_name: customer.assigned_to ? customer.assigned_to.name : 'Unassigned',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      status,
      assigned_to,
      tags,
      initial_deal,
      initial_task,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const targetAssignedTo =
      req.user.role === 'staff' ? req.user._id : assigned_to || null;

    const parsedTags = Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const leadScore = computeLeadScore({
      name,
      email,
      phone,
      company,
      status: status || 'lead',
      tags: parsedTags,
    });

    const customer = await Customer.create({
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      company: company ? company.trim() : '',
      status: status || 'lead',
      assigned_to: targetAssignedTo,
      tags: parsedTags,
      lead_score: leadScore,
    });

    // Run automation pipeline (e.g. Round-robin assignment if unassigned)
    await onCustomerCreated(customer, req.user._id);

    // Refresh assigned_to after round-robin in case it was auto-assigned
    const updatedCust = await Customer.findById(customer._id);
    const effectiveStaffId = updatedCust.assigned_to || req.user._id;

    // Optional One-Click Initial Deal
    let createdDeal = null;
    if (initial_deal && initial_deal.title && initial_deal.title.trim()) {
      createdDeal = await Deal.create({
        title: initial_deal.title.trim(),
        amount: Number(initial_deal.amount) || 0,
        currency: initial_deal.currency || 'INR',
        customer_id: customer._id,
        stage: initial_deal.stage || 'lead',
        win_probability: Number(initial_deal.win_probability) || 20,
        assigned_to: effectiveStaffId,
        expected_close_date: initial_deal.expected_close_date || null,
      });

      await TimelineEvent.create({
        customer_id: customer._id,
        author: req.user._id,
        type: 'deal_created',
        title: `Deal Initiated: ${createdDeal.title}`,
        description: `Created initial deal for ${createdDeal.currency} ${Number(createdDeal.amount).toLocaleString()} in ${createdDeal.stage} stage.`,
        metadata: { deal_id: createdDeal._id },
      });
    }

    // Optional One-Click Initial Task
    let createdTask = null;
    if (initial_task && initial_task.title && initial_task.title.trim()) {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 3);

      createdTask = await Task.create({
        title: initial_task.title.trim(),
        description: initial_task.description || `Initial action item for ${customer.name}`,
        assigned_to: effectiveStaffId,
        customer_id: customer._id,
        status: 'pending',
        priority: initial_task.priority || 'medium',
        due_date: initial_task.due_date || defaultDue,
      });

      await TimelineEvent.create({
        customer_id: customer._id,
        author: req.user._id,
        type: 'task_created',
        title: `Task Scheduled: ${createdTask.title}`,
        description: `Initial task assigned to team member (Priority: ${createdTask.priority}).`,
        metadata: { task_id: createdTask._id },
      });
    }

    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assigned_to', 'name email role')
      .lean();

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Customer Created',
      description: `Created customer: ${customer.name}${createdDeal ? ` with Deal "${createdDeal.title}"` : ''}${createdTask ? ` & Task "${createdTask.title}"` : ''}`,
    });

    return res.status(201).json({
      success: true,
      customer: populatedCustomer,
      deal: createdDeal,
      task: createdTask,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status, assigned_to, tags } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (name) customer.name = name.trim();
    if (email !== undefined) customer.email = email.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (company !== undefined) customer.company = company.trim();
    if (status) customer.status = status;
    if (tags !== undefined) {
      customer.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Only admin can reassign a customer to another staff member
    if (req.user.role === 'admin' && assigned_to !== undefined) {
      customer.assigned_to = assigned_to || null;
    }

    customer.lead_score = computeLeadScore(customer);

    await customer.save();

    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assigned_to', 'name email role')
      .lean();

    realtimeService.broadcast('CUSTOMER_UPDATED', { customer: populatedCustomer });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Customer Updated',
      description: `Updated customer details: ${customer.name}`,
    });

    return res.json({ success: true, customer: populatedCustomer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const name = customer.name;
    const customerId = customer._id;
    await customer.deleteOne();

    // Clean up associated deals and tasks to prevent orphaned ghost records
    const associatedDeals = await Deal.find({ customer_id: customerId }).select('_id');
    await Deal.deleteMany({ customer_id: customerId });
    await Task.deleteMany({ customer_id: customerId });

    realtimeService.broadcast('CUSTOMER_DELETED', { customerId });
    associatedDeals.forEach((d) => {
      realtimeService.broadcast('DEAL_DELETED', { dealId: d._id.toString() });
    });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Customer Deleted',
      description: `Deleted customer: ${name}`,
      details: `Deleted customer: ${name}`,
    });

    return res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Phase 4: Batch CSV Import with Deduplication
export const importCustomersBatch = async (req, res) => {
  try {
    const { rows, duplicateStrategy = 'skip', defaultAssignedTo } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No rows provided for import' });
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = (row.name || row.Name || row['Full Name'] || '').trim();
      const email = (row.email || row.Email || row['Email Address'] || '').trim();
      const phone = (row.phone || row.Phone || row['Phone Number'] || '').trim();
      const company = (row.company || row.Company || row['Organization'] || '').trim();
      const statusRaw = (row.status || row.Status || 'lead').toLowerCase().trim();
      const status = ['lead', 'active', 'inactive'].includes(statusRaw) ? statusRaw : 'lead';
      const tags = row.tags
        ? (Array.isArray(row.tags) ? row.tags : String(row.tags).split(',').map((t) => t.trim()))
        : [];

      if (!name) {
        errors.push({ row: i + 1, error: 'Name is missing' });
        continue;
      }

      // Check for duplicate by email (if valid) or phone
      let existing = null;
      if (email) {
        existing = await Customer.findOne({ email });
      }
      if (!existing && phone) {
        existing = await Customer.findOne({ phone });
      }

      if (existing) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
          continue;
        } else if (duplicateStrategy === 'update') {
          existing.name = name;
          if (company) existing.company = company;
          if (phone) existing.phone = phone;
          if (email) existing.email = email;
          if (tags.length) existing.tags = Array.from(new Set([...existing.tags, ...tags]));
          existing.lead_score = computeLeadScore(existing);
          await existing.save();
          updatedCount++;
          continue;
        }
      }

      const newCustomer = await Customer.create({
        name,
        email,
        phone,
        company,
        status,
        tags,
        assigned_to: defaultAssignedTo || req.user._id,
        lead_score: computeLeadScore({ name, email, phone, company, status, tags }),
      });

      importedCount++;
    }

    const skippedNote = skippedCount > 0 ? `, ${skippedCount} duplicate contacts skipped` : '';
    await ActivityLog.create({
      user_id: req.user._id,
      action: 'CSV Customers Imported',
      description: `Bulk imported ${importedCount} customers, updated ${updatedCount}${skippedNote} to prevent duplication.`,
    });

    realtimeService.broadcast('CUSTOMERS_IMPORTED', { count: importedCount });

    res.json({
      success: true,
      summary: {
        totalRows: rows.length,
        importedCount,
        updatedCount,
        skippedCount,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Batch import failed', error: err.message });
  }
};
