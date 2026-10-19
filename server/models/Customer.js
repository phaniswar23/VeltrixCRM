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
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
