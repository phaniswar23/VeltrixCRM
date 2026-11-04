import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.pre('save', function (next) {
  if (!this.description && this.details) {
    this.description = this.details;
  }
  if (!this.details && this.description) {
    this.details = this.description;
  }
  next();
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
