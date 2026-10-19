import Task from '../models/Task.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

export const getTasks = async (req, res) => {
  try {
    const { search, status, staff_id } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (staff_id) {
      query.assigned_to = staff_id;
    }

    const tasks = await Task.find(query)
      .populate('assigned_to', 'name email role')
      .populate('customer_id', 'name email status')
      .sort({ createdAt: -1 });

    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assigned_to', 'name email role')
      .populate('customer_id', 'name email status');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, customer_id, status, due_date } = req.body;

    if (!title || !assigned_to) {
      return res.status(400).json({ message: 'Task title and assigned user are required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      assigned_to,
      customer_id: customer_id || null,
      status: status || 'pending',
      due_date: due_date || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assigned_to', 'name email role')
      .populate('customer_id', 'name email status');

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Task Created',
      description: `Created task: ${task.title}`,
    });

    // Notify other users
    const others = await User.find({ _id: { $ne: req.user._id } });
    const notifs = others.map((other) => ({
      user_id: other._id,
      title: 'New Task Created',
      message: `Task "${task.title}" was created by ${req.user.name} (${req.user.role})`,
      is_read: false,
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    return res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, assigned_to, customer_id, status, due_date } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assigned_to) task.assigned_to = assigned_to;
    if (customer_id !== undefined) task.customer_id = customer_id || null;
    if (status) task.status = status;
    if (due_date !== undefined) task.due_date = due_date || null;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assigned_to', 'name email role')
      .populate('customer_id', 'name email status');

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Task Updated',
      description: `Updated task: ${task.title}`,
    });

    return res.json({ success: true, task: populatedTask });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Task Status Updated',
      description: `Updated task status: ${task.title} to ${status}`,
    });

    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const title = task.title;
    await task.deleteOne();

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Task Deleted',
      description: `Deleted task: ${title}`,
    });

    // Notify other users
    const others = await User.find({ _id: { $ne: req.user._id } });
    const notifs = others.map((other) => ({
      user_id: other._id,
      title: 'Task Deleted',
      message: `Task "${title}" was deleted by ${req.user.name} (${req.user.role})`,
      is_read: false,
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
