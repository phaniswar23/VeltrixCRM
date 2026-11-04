import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required for timeline event'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['note', 'call', 'meeting', 'status_change', 'deal_created', 'task_created', 'email', 'system'],
      default: 'note',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      call_outcome: {
        type: String,
        enum: ['connected', 'left_voicemail', 'busy', 'wrong_number', 'follow_up_scheduled', 'none'],
        default: 'none',
      },
      duration_minutes: {
        type: Number,
        default: 0,
      },
      scheduled_date: {
        type: Date,
        default: null,
      },
      deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        default: null,
      },
      task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

timelineEventSchema.index({ customer_id: 1, createdAt: -1 });

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);
export default TimelineEvent;

