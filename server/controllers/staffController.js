import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';

export const getStaff = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'staff' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const staffList = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Aggregate counts for each staff
    const staffWithCounts = await Promise.all(
      staffList.map(async (member) => {
        const customersCount = await Customer.countDocuments({ assigned_to: member._id });
        const tasksCount = await Task.countDocuments({ assigned_to: member._id });
        return {
          ...member.toObject(),
          customers_count: customersCount,
          tasks_count: tasksCount,
        };
      })
    );

    return res.json({ success: true, staff: staffWithCounts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ name: 1 });
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    const customersCount = await Customer.countDocuments({ assigned_to: user._id });
    const tasksCount = await Task.countDocuments({ assigned_to: user._id });

    return res.json({
      success: true,
      staff: {
        ...user.toObject(),
        customers_count: customersCount,
        tasks_count: tasksCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'admin' ? 'admin' : 'staff',
    });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Staff Onboarded',
      description: `Authorized member: ${user.name} (${user.role})`,
    });

    return res.status(201).json({ success: true, staff: user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (password) user.password = password;

    await user.save();

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Staff Updated',
      description: `Updated member profile: ${user.name}`,
    });

    return res.json({ success: true, staff: user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const name = user.name;
    // Unassign their customers & tasks
    await Customer.updateMany({ assigned_to: user._id }, { assigned_to: null });
    await Task.deleteMany({ assigned_to: user._id });
    await user.deleteOne();

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Staff Deauthorized',
      description: `Deauthorized member: ${name}`,
    });

    return res.json({ success: true, message: 'Member deauthorized successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const isStaff = req.user.role === 'staff';
    const userId = req.user._id;

    const totalCustomers = isStaff
      ? await Customer.countDocuments({ assigned_to: userId })
      : await Customer.countDocuments();

    const totalStaff = await User.countDocuments({ role: 'staff' });

    const totalTasks = isStaff
      ? await Task.countDocuments({ assigned_to: userId })
      : await Task.countDocuments();

    const completedTasks = isStaff
      ? await Task.countDocuments({ assigned_to: userId, status: 'completed' })
      : await Task.countDocuments({ status: 'completed' });

    const pendingTasks = isStaff
      ? await Task.countDocuments({ assigned_to: userId, status: 'pending' })
      : await Task.countDocuments({ status: 'pending' });

    const inProgressTasks = isStaff
      ? await Task.countDocuments({ assigned_to: userId, status: 'in_progress' })
      : await Task.countDocuments({ status: 'in_progress' });

    // Recent customers
    const customerFilter = isStaff ? { assigned_to: userId } : {};
    const recentCustomers = await Customer.find(customerFilter)
      .populate('assigned_to', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent tasks
    const taskFilter = isStaff ? { assigned_to: userId } : {};
    const recentTasks = await Task.find(taskFilter)
      .populate('assigned_to', 'name')
      .populate('customer_id', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent activities
    const recentActivities = await ActivityLog.find()
      .populate('user_id', 'name role')
      .sort({ createdAt: -1 })
      .limit(6);

    // Growth metrics (last 30 vs prev 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Customers = await Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const prev30Customers = await Customer.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });
    const customerGrowth =
      prev30Customers > 0
        ? Math.round(((last30Customers - prev30Customers) / prev30Customers) * 100)
        : last30Customers > 0
        ? 100
        : 0;

    const last30Tasks = await Task.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const prev30Tasks = await Task.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });
    const taskGrowth =
      prev30Tasks > 0
        ? Math.round(((last30Tasks - prev30Tasks) / prev30Tasks) * 100)
        : last30Tasks > 0
        ? 100
        : 0;

    const taskEfficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Active staff in last 15 minutes
    const activeThreshold = new Date(now.getTime() - 15 * 60 * 1000);
    const onlineStaffCount = await User.countDocuments({
      role: 'staff',
      last_activity: { $gte: activeThreshold },
    });

    // Staff performance list
    const staffMembers = await User.find({ role: 'staff' }).select('name email');
    const staffPerformance = await Promise.all(
      staffMembers.map(async (m) => {
        const cCount = await Customer.countDocuments({ assigned_to: m._id });
        const tCount = await Task.countDocuments({ assigned_to: m._id });
        return {
          _id: m._id,
          name: m.name,
          customersCount: cCount,
          tasksCount: tCount,
        };
      })
    );

    return res.json({
      success: true,
      stats: {
        totalCustomers,
        totalStaff,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        customerGrowth,
        taskGrowth,
        taskEfficiency,
        onlineStaffCount,
        recentCustomers,
        recentTasks,
        recentActivities,
        staffPerformance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
