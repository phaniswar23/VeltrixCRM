import AutomationRule from '../models/AutomationRule.js';
import { seedDefaultAutomationRules } from '../services/automationService.js';

export const getAutomationRules = async (req, res) => {
  try {
    await seedDefaultAutomationRules();
    const rules = await AutomationRule.find().sort({ createdAt: 1 });
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch automation rules', error: err.message });
  }
};

export const toggleAutomationRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    rule.is_active = !rule.is_active;
    await rule.save();

    res.json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update rule', error: err.message });
  }
};

