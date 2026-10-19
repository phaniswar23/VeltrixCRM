import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false,
    });

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.is_read = true;
    await notification.save();

    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user_id: req.user._id });
    return res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
