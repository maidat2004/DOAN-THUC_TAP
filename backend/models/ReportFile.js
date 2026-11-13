const mongoose = require('mongoose');

const reportFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      enum: ['pdf', 'xlsx'],
      required: true,
    },
    periodType: {
      type: String,
      enum: ['manual', 'daily', 'weekly', 'monthly'],
      default: 'manual',
    },
    startDate: Date,
    endDate: Date,
    filePath: {
      type: String,
      required: true,
    },
    fileSize: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReportSchedule',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportFile', reportFileSchema);
