import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['lead', 'active', 'inactive'],
      default: 'lead',
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    lead_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 30,
    },
    custom_fields: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ assigned_to: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
