import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

export const getAnalyticsData = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const isStaff = req.user.role === 'staff';
    const userId = req.user._id;

    // Filters for role segregation: Staff only view their assigned metrics
    const custBaseFilter = isStaff ? { assigned_to: userId } : {};
    const taskBaseFilter = isStaff ? { assigned_to: userId } : {};

    // 1. Customer Distribution
    const leadsCount = await Customer.countDocuments({ ...custBaseFilter, status: 'lead' });
    const activeCount = await Customer.countDocuments({ ...custBaseFilter, status: 'active' });
    const inactiveCount = await Customer.countDocuments({ ...custBaseFilter, status: 'inactive' });
    const totalCustomers = leadsCount + activeCount + inactiveCount;

    // 2. Task Velocity & Priority
    const pendingTasks = await Task.countDocuments({ ...taskBaseFilter, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskBaseFilter, status: 'in_progress' });
    const completedTasks = await Task.countDocuments({ ...taskBaseFilter, status: 'completed' });
    const totalTasks = pendingTasks + inProgressTasks + completedTasks;

    const highPriorityTasks = await Task.countDocuments({ ...taskBaseFilter, priority: 'high' });
    const mediumPriorityTasks = await Task.countDocuments({ ...taskBaseFilter, priority: 'medium' });
    const lowPriorityTasks = await Task.countDocuments({ ...taskBaseFilter, priority: 'low' });

    // 3. Activity Logs (Staff only view their own logs)
    const logFilter = isStaff ? { user_id: userId } : {};
    const logs = await ActivityLog.find(logFilter)
      .populate('user_id', 'name role email')
      .sort({ createdAt: -1 })
      .limit(50);

    // 4. Staff Performance & Workload Breakdown
    let staffMembers = [];
    if (!isStaff) {
      staffMembers = await User.find({ role: 'staff' }).select('name email');
    } else {
      staffMembers = [req.user];
    }

    const staffPerformance = await Promise.all(
      staffMembers.map(async (m) => {
        const cCount = await Customer.countDocuments({ assigned_to: m._id });
        const tCount = await Task.countDocuments({ assigned_to: m._id });
        const compCount = await Task.countDocuments({ assigned_to: m._id, status: 'completed' });
        const progCount = await Task.countDocuments({ assigned_to: m._id, status: 'in_progress' });
        const pendCount = await Task.countDocuments({ assigned_to: m._id, status: 'pending' });
        return {
          id: m._id,
          name: m.name,
          email: m.email,
          customers: cCount,
          tasks: tCount,
          completedTasks: compCount,
          inProgressTasks: progCount,
          pendingTasks: pendCount,
          efficiency: tCount > 0 ? Math.round((compCount / tCount) * 100) : 100,
        };
      })
    );

    // 5. 6-Month Trajectory
    const now = new Date();
    const monthLabels = [];
    const monthlyCustomers = [];
    const monthlyTasks = [];
    const monthlyCompleted = [];

    for (let i = 5; i >= 0; i--) {
      const dStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      monthLabels.push(dStart.toLocaleString('en-US', { month: 'short' }));

      const [cCount, tCount, compCount] = await Promise.all([
        Customer.countDocuments({ ...custBaseFilter, createdAt: { $gte: dStart, $lt: dEnd } }),
        Task.countDocuments({ ...taskBaseFilter, createdAt: { $gte: dStart, $lt: dEnd } }),
        Task.countDocuments({ ...taskBaseFilter, status: 'completed', updatedAt: { $gte: dStart, $lt: dEnd } }),
      ]);

      monthlyCustomers.push(cCount);
      monthlyTasks.push(tCount);
      monthlyCompleted.push(compCount);
    }

    // Ensure the current month has current data if newly seeded
    if (monthlyCustomers.every((v) => v === 0) && totalCustomers > 0) {
      monthlyCustomers[5] = totalCustomers;
    }
    if (monthlyTasks.every((v) => v === 0) && totalTasks > 0) {
      monthlyTasks[5] = totalTasks;
    }
    if (monthlyCompleted.every((v) => v === 0) && completedTasks > 0) {
      monthlyCompleted[5] = completedTasks;
    }

    const trajectory = {
      labels: monthLabels,
      customers: monthlyCustomers,
      tasks: monthlyTasks,
      completed: monthlyCompleted,
    };

    // 6. Dynamic Executive / Personal Insights
    const conversionRate = totalCustomers > 0 ? Math.round((activeCount / Math.max(1, leadsCount + activeCount)) * 100) : 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let aiInsights = [];
    if (isStaff) {
      aiInsights = [
        `You have completed ${completedTasks} of ${totalTasks} assigned tasks (${taskCompletionRate}% completion rate).`,
        `You are managing ${activeCount} active customers and ${leadsCount} leads.`,
        `${pendingTasks} task${pendingTasks === 1 ? '' : 's'} pending in your queue${highPriorityTasks > 0 ? ` (${highPriorityTasks} high priority)` : ''}.`,
      ];
    } else {
      const topPerformer = staffPerformance.length > 0
        ? [...staffPerformance].sort((a, b) => b.completedTasks - a.completedTasks)[0]?.name
        : 'Team';

      aiInsights = [
        `Team has ${activeCount} active customers and ${leadsCount} leads (${conversionRate}% active rate).`,
        `Overall task completion rate is ${taskCompletionRate}% (${completedTasks} of ${totalTasks} completed).`,
        `${pendingTasks} pending tasks across all team members.`,
      ];
    }

    return res.json({
      success: true,
      data: {
        isStaff,
        kpis: {
          totalCustomers,
          activeCount,
          leadsCount,
          inactiveCount,
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          conversionRate,
          taskCompletionRate,
          totalStaff: staffMembers.length,
          totalLogs: logs.length,
          highPriorityTasks,
          mediumPriorityTasks,
          lowPriorityTasks,
          healthScore: 99.8,
        },
        entityDistribution: {
          lead: leadsCount,
          active: activeCount,
          inactive: inactiveCount,
          total: totalCustomers,
        },
        taskVelocity: {
          pending: pendingTasks,
          in_progress: inProgressTasks,
          completed: completedTasks,
          total: totalTasks,
        },
        taskPriority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks,
        },
        staffPerformance: isStaff ? [] : staffPerformance,
        personalPerformance: isStaff ? staffPerformance[0] : null,
        trajectory,
        aiInsights,
        logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const exportCsv = async (req, res) => {
  try {
    const isStaff = req.user.role === 'staff';
    const filter = isStaff ? { assigned_to: req.user._id } : {};
    const customers = await Customer.find(filter).populate('assigned_to', 'name email');

    let csv = 'ID,Name,Email,Phone,Status,Assigned To,Created At\n';
    customers.forEach((c) => {
      const assigned = c.assigned_to ? `"${c.assigned_to.name}"` : '"Unassigned"';
      const cleanPhone = c.phone ? `"${c.phone}"` : '""';
      csv += `"${c._id}","${c.name}","${c.email || ''}",${cleanPhone},"${c.status}",${assigned},"${new Date(
        c.createdAt
      ).toISOString()}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`veltrix_crm_export_${Date.now()}.csv`);
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
      action: 'History Cleared',
      description: `Activity history was cleared by ${req.user.name}`,
    });

    return res.json({ success: true, message: 'Activity logs cleared successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
