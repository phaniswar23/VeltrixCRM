import ContactMessage from '../models/ContactMessage.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      message,
    });

    await ActivityLog.create({
      action: 'Inquiry Submitted',
      description: `New contact inquiry received from ${name} (${email})`,
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    const notifs = admins.map((admin) => ({
      user_id: admin._id,
      title: 'New Landing Page Inquiry',
      message: `${name} (${email}) sent an inquiry: "${message.substring(0, 60)}..."`,
      is_read: false,
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. Our team will reach out shortly.',
      contact,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
