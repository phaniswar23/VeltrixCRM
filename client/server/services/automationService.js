import User from '../models/User.js';
import Task from '../models/Task.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import TimelineEvent from '../models/TimelineEvent.js';
import AutomationRule from '../models/AutomationRule.js';
import realtimeService from './realtimeService.js';

let roundRobinPointer = 0;

export const seedDefaultAutomationRules = async () => {
  const defaultRules = [
    {
      name: 'Round-Robin Lead Assignment',
      code: 'ROUND_ROBIN_LEAD',
      description: 'Automatically distributes new leads evenly across active staff members.',
      trigger: 'CUSTOMER_CREATED',
      action_type: 'ROUND_ROBIN_ASSIGN',
      is_active: true,
    },
    {
      name: 'Auto-Task on Closed Won Deal',
      code: 'AUTO_TASK_ON_WON',
      description: 'Creates a client onboarding task whenever a deal enters Closed Won.',
      trigger: 'DEAL_WON',
      action_type: 'CREATE_TASK',
      is_active: true,
    },
    {
      name: 'Follow-up Task on Closed Lost Deal',
      code: 'FOLLOW_UP_ON_LOST',
      description: 'Schedules a 30-day review task when a deal is marked Closed Lost.',
      trigger: 'DEAL_LOST',
      action_type: 'CREATE_TASK',
      is_active: true,
    },
  ];

  for (const rule of defaultRules) {
    const exists = await AutomationRule.findOne({ code: rule.code });
    if (!exists) {
      await AutomationRule.create(rule);
    }
  }
};

export const getNextStaffForRoundRobin = async () => {
  const staff = await User.find({ role: 'staff' }).sort({ createdAt: 1 });
  if (!staff || staff.length === 0) {
    // If no staff, check for admin
    const admin = await User.findOne({ role: 'admin' });
    return admin ? admin._id : null;
  }
  const assigned = staff[roundRobinPointer % staff.length];
  roundRobinPointer = (roundRobinPointer + 1) % staff.length;
  return assigned._id;
};

export const onCustomerCreated = async (customer, createdByUserId) => {
  try {
    const rule = await AutomationRule.findOne({ code: 'ROUND_ROBIN_LEAD', is_active: true });
    if (rule && !customer.assigned_to) {
      const nextStaffId = await getNextStaffForRoundRobin();
      if (nextStaffId) {
        customer.assigned_to = nextStaffId;
        await customer.save();

        await AutomationRule.updateOne(
          { _id: rule._id },
          { $inc: { execution_count: 1 }, last_executed_at: new Date() }
        );

        // Notify assigned staff
        await Notification.create({
          user_id: nextStaffId,
          type: 'assignment',
          message: `New lead "${customer.name}" was automatically assigned to you via Round-Robin.`,
        });

        realtimeService.sendToUser(nextStaffId, 'NOTIFICATION_RECEIVED', {
          title: 'New Lead Assigned',
          message: `Lead "${customer.name}" assigned to you`,
        });
      }
    }

    // Record initial timeline event
    if (createdByUserId) {
      await TimelineEvent.create({
        customer_id: customer._id,
        author: createdByUserId,
        type: 'system',
        title: 'Customer Added to CRM',
        description: `Customer record created with initial stage: ${customer.status}.`,
      });
    }

    realtimeService.broadcast('CUSTOMER_CREATED', { customer });
  } catch (err) {
    console.error('Automation onCustomerCreated error:', err.message);
  }
};

export const onDealStageChanged = async (deal, oldStage, newStage, userId) => {
  try {
    // Record timeline event for customer
    await TimelineEvent.create({
      customer_id: deal.customer_id,
      author: userId || deal.assigned_to,
      type: 'deal_created',
      title: `Deal Stage: ${deal.title}`,
      description: `Moved from "${oldStage}" to "${newStage}". Current value: ${deal.currency} ${deal.amount.toLocaleString()}.`,
      metadata: { deal_id: deal._id },
    });

    if (newStage === 'closed_won') {
      const rule = await AutomationRule.findOne({ code: 'AUTO_TASK_ON_WON', is_active: true });
      if (rule) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2); // 2 days for onboarding

        const task = await Task.create({
          title: `Onboard: ${deal.title}`,
          description: `Automatic onboarding task triggered because deal "${deal.title}" was won. Verify requirements, send kickoff email, and initiate services.`,
          assigned_to: deal.assigned_to || userId,
          customer_id: deal.customer_id,
          priority: 'high',
          status: 'pending',
          due_date: dueDate,
        });

        await AutomationRule.updateOne(
          { _id: rule._id },
          { $inc: { execution_count: 1 }, last_executed_at: new Date() }
        );

        if (deal.assigned_to) {
          await Notification.create({
            user_id: deal.assigned_to,
            type: 'assignment',
            message: `Deal Won! Auto-created onboarding task for "${deal.title}".`,
          });
          realtimeService.sendToUser(deal.assigned_to, 'NOTIFICATION_RECEIVED', {
            title: 'Deal Won! Onboarding Task Created',
            message: `Task created for ${deal.title}`,
          });
        }

        realtimeService.broadcast('TASK_CREATED', { task });
      }
    } else if (newStage === 'closed_lost') {
      const rule = await AutomationRule.findOne({ code: 'FOLLOW_UP_ON_LOST', is_active: true });
      if (rule) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days review

        const task = await Task.create({
          title: `30-Day Re-engagement: ${deal.title}`,
          description: `Deal was lost due to: ${deal.lost_reason || 'unspecified'}. Follow up in 30 days to re-assess client requirements.`,
          assigned_to: deal.assigned_to || userId,
          customer_id: deal.customer_id,
          priority: 'low',
          status: 'pending',
          due_date: dueDate,
        });

        await AutomationRule.updateOne(
          { _id: rule._id },
          { $inc: { execution_count: 1 }, last_executed_at: new Date() }
        );

        realtimeService.broadcast('TASK_CREATED', { task });
      }
    }

    realtimeService.broadcast('DEAL_UPDATED', { deal });
  } catch (err) {
    console.error('Automation onDealStageChanged error:', err.message);
  }
};

