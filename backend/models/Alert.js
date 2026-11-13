const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    environmentData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnvironmentData',
      required: true,
    },
    threshold: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Threshold',
      required: true,
    },
    type: {
      type: String,
      enum: ['warning', 'critical'],
      required: true,
    },
    indicator: String,
    value: Number,
    message: String,
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
