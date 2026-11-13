const mongoose = require('mongoose');

const environmentDataSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    type: {
      type: String,
      enum: ['water', 'air', 'soil'],
      required: true,
    },
    measurementDate: {
      type: Date,
      required: true,
    },
    // Chỉ số nước (Water)
    water: {
      ph: Number,
      do_level: Number, // Độ ô xy hòa tan (mg/L)
      temperature: Number, // Độ C
      turbidity: Number, // Độ đục (NTU)
      conductivity: Number, // Độ dẫn điện (µS/cm)
    },
    // Chỉ số không khí (Air)
    air: {
      pm25: Number, // µg/m³
      pm10: Number, // µg/m³
      co2: Number, // ppm
      temperature: Number, // Độ C
      humidity: Number, // % RH
      pressure: Number, // hPa
    },
    // Chỉ số đất (Soil)
    soil: {
      ph: Number,
      moisture: Number, // %
      nitrogen: Number, // mg/kg
      phosphorus: Number, // mg/kg
      potassium: Number, // mg/kg
      organicMatter: Number, // %
    },
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: String, // Công ty/doanh nghiệp gửi báo cáo
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'submitted',
    },
    // Approval workflow
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    approvalNotes: String,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

// Index cho truy vấn nhanh
environmentDataSchema.index({ station: 1, measurementDate: -1 });
environmentDataSchema.index({ type: 1, measurementDate: -1 });

module.exports = mongoose.model('EnvironmentData', environmentDataSchema);
