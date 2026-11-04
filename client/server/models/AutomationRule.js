import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    trigger: {
      type: String,
      enum: ['CUSTOMER_CREATED', 'CONTACT_INQUIRY', 'DEAL_WON', 'DEAL_LOST', 'TASK_OVERDUE'],
      required: true,
    },
    action_type: {
      type: String,
      enum: ['ROUND_ROBIN_ASSIGN', 'CREATE_TASK', 'SEND_NOTIFICATION', 'TAG_CUSTOMER'],
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    execution_count: {
      type: Number,
      default: 0,
    },
    last_executed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);
export default AutomationRule;

