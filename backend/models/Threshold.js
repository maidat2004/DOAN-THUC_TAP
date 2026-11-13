const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['water', 'air', 'soil'],
      required: true,
    },
    indicator: {
      type: String,
      required: true,
    },
    minValue: Number,
    maxValue: Number,
    unit: String,
    colorCode: {
      normal: { type: String, default: 'green' },
      warning: { type: String, default: 'yellow' },
      critical: { type: String, default: 'red' },
    },
    description: String,
    sourceType: {
      type: String,
      enum: ['standard', 'manual'],
      default: 'manual',
    },
    sourceName: String,
    sourceReference: String,
    lastReviewedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Threshold', thresholdSchema);
