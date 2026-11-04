import TimelineEvent from '../models/TimelineEvent.js';
import Customer from '../models/Customer.js';
import realtimeService from '../services/realtimeService.js';

export const getTimelineForCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const events = await TimelineEvent.find({ customer_id: customerId })
      .populate('author', 'name email avatar role')
      .populate('metadata.deal_id', 'title amount stage')
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch timeline', error: err.message });
  }
};

export const addTimelineEvent = async (req, res) => {
  try {
    const { customer_id, type, title, description, metadata } = req.body;

    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const event = await TimelineEvent.create({
      customer_id,
      author: req.user._id,
      type: type || 'note',
      title,
      description: description || '',
      metadata: metadata || {},
    });

    const populated = await TimelineEvent.findById(event._id).populate(
      'author',
      'name email avatar role'
    );

    realtimeService.broadcast('TIMELINE_EVENT_ADDED', { event: populated });

    res.status(201).json({ success: true, event: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add timeline event', error: err.message });
  }
};

export const deleteTimelineEvent = async (req, res) => {
  try {
    const event = await TimelineEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Timeline event not found' });
    }

    // Only author or admin can delete
    if (req.user.role !== 'admin' && String(event.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete timeline event', error: err.message });
  }
};

