import ContactMessage from '../models/ContactMessage.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';

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

export const getInquiries = async (req, res) => {
  try {
    // If database is empty, seed 3 realistic demo website inquiries so the UI looks active
    const count = await ContactMessage.countDocuments();
    if (count === 0) {
      await ContactMessage.create([
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@techcorp.in',
          message: 'Interested in Veltrix Enterprise plan for our 30-member sales team. Do you support custom webhook integrations?',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          name: 'Robert Miller',
          email: 'robert@millermedia.com',
          message: 'Looking to migrate from HubSpot. Does VeltrixCRM offer direct WhatsApp chat and multi-language support out of the box?',
          createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
        {
          name: 'Ananya Deshmukh',
          email: 'ananya@fintechscale.io',
          message: 'Would like to schedule an executive demo next Tuesday for our operations lead and regional managers.',
          createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        },
      ]);
    }

    const inquiries = await ContactMessage.find().sort({ createdAt: -1 });
    return res.json({ success: true, inquiries });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const convertToLead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Convert into active Customer lead
    const customer = await Customer.create({
      name: message.name,
      email: message.email,
      phone: '',
      status: 'lead',
      assigned_to: req.user._id,
    });

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Inquiry Converted',
      description: `Converted website inquiry from ${message.name} into CRM customer lead`,
    });

    // Remove the converted inquiry
    await message.deleteOne();

    return res.status(201).json({
      success: true,
      message: `${message.name} converted to customer lead successfully!`,
      customer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
