import Customer from '../models/Customer.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

export const getCustomers = async (req, res) => {
  try {
    const { search, staff_id, status } = req.query;
    const query = {};

    // If staff member, can see all or assigned depending on requirements; here staff can see CRM customers, or filter by assigned
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (staff_id) {
      query.assigned_to = staff_id;
    }

    if (status) {
      query.status = status;
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
    const customer = await Customer.findById(req.params.id).populate('assigned_to', 'name email role');
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
    const { name, email, phone, status, assigned_to } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    // Role-based rule: Staff accounts cannot assign to other staff; automatically assigned to self
    const targetAssignedTo = req.user.role === 'staff' ? req.user._id : (assigned_to || null);

    const customer = await Customer.create({
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      status: status || 'lead',
      assigned_to: targetAssignedTo,
    });

    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assigned_to', 'name email role')
      .lean();

    // Log activity and create notifications without slowing down the client
    Promise.all([
      ActivityLog.create({
        user_id: req.user._id,
        action: 'Customer Created',
        description: `Created customer: ${customer.name}`,
      }),
      User.find({ _id: { $ne: req.user._id } })
        .select('_id')
        .lean()
        .then((others) => {
          if (others.length > 0) {
            const notifs = others.map((other) => ({
              user_id: other._id,
              title: 'New Customer Added',
              message: `Customer ${customer.name} was added by ${req.user.name} (${req.user.role})`,
              is_read: false,
            }));
            return Notification.insertMany(notifs);
          }
        }),
    ]).catch((err) => console.error('[Background Notification Error]', err.message));

    return res.status(201).json({ success: true, customer: populatedCustomer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, status, assigned_to } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (name) customer.name = name.trim();
    if (email !== undefined) customer.email = email.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (status) customer.status = status;

    // Only admin can reassign a customer to another staff member
    if (req.user.role === 'admin' && assigned_to !== undefined) {
      customer.assigned_to = assigned_to || null;
    }

    await customer.save();

    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assigned_to', 'name email role')
      .lean();

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
    await customer.deleteOne();

    await ActivityLog.create({
      user_id: req.user._id,
      action: 'Customer Deleted',
      description: `Deleted customer: ${name}`,
    });

    // Notify other users
    const others = await User.find({ _id: { $ne: req.user._id } });
    const notifs = others.map((other) => ({
      user_id: other._id,
      title: 'Customer Deleted',
      message: `Customer ${name} was deleted by ${req.user.name} (${req.user.role})`,
      is_read: false,
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    return res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
