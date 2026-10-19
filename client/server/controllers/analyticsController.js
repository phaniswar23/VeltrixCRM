import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

export const getAnalyticsData = async (req, res) => {
  try {
    // 1. Customer Entity Distribution
    const leadsCount = await Customer.countDocuments({ status: 'lead' });
    const activeCount = await Customer.countDocuments({ status: 'active' });
    const inactiveCount = await Customer.countDocuments({ status: 'inactive' });

    // 2. Task Operational Velocity
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
    const completedTasks = await Task.countDocuments({ status: 'completed' });

    // 3. System Pulse Logs
    const logs = await ActivityLog.find()
      .populate('user_id', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);

    // 4. Staff Performance
    const staffMembers = await User.find({ role: 'staff' }).select('name email');
    const staffPerformance = await Promise.all(
      staffMembers.map(async (m) => {
        const cCount = await Customer.countDocuments({ assigned_to: m._id });
        const tCount = await Task.countDocuments({ assigned_to: m._id });
        return {
          name: m.name,
          customers: cCount,
          tasks: tCount,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        entityDistribution: {
          lead: leadsCount,
          active: activeCount,
          inactive: inactiveCount,
          total: leadsCount + activeCount + inactiveCount,
        },
        taskVelocity: {
          pending: pendingTasks,
          in_progress: inProgressTasks,
          completed: completedTasks,
          total: pendingTasks + inProgressTasks + completedTasks,
        },
        staffPerformance,
        logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const exportCsv = async (req, res) => {
  try {
    const customers = await Customer.find().populate('assigned_to', 'name email');

    let csv = 'ID,Name,Email,Phone,Status,Assigned To,Created At\n';
    customers.forEach((c) => {
      const assigned = c.assigned_to ? `"${c.assigned_to.name}"` : '"Unassigned"';
      const cleanPhone = c.phone ? `"${c.phone}"` : '""';
      csv += `"${c._id}","${c.name}","${c.email || ''}",${cleanPhone},"${c.status}",${assigned},"${new Date(
        c.createdAt
      ).toISOString()}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`veltrix_crm_intelligence_export_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const clearLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Sequence Purged',
      description: `Immutable activity sequence was purged by ${req.user.name}`,
    });

    return res.json({ success: true, message: 'Activity sequence purged successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
