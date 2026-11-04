import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Deal amount is required'],
      min: [0, 'Amount cannot be negative'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required for a deal'],
    },
    stage: {
      type: String,
      enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      default: 'lead',
    },
    win_probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 20,
    },
    expected_close_date: {
      type: Date,
      default: null,
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lost_reason: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

dealSchema.index({ customer_id: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ assigned_to: 1 });
dealSchema.index({ createdAt: -1 });

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;

