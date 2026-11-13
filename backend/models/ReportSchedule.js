const mongoose = require('mongoose');

const reportScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 28,
    },
    format: {
      type: String,
      enum: ['pdf', 'xlsx'],
      default: 'pdf',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastRunAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportSchedule', reportScheduleSchema);
