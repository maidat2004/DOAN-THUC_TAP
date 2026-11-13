const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã điểm quan trắc'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên điểm quan trắc'],
    },
    description: String,
    type: {
      type: String,
      enum: ['water', 'air', 'soil'],
      required: [true, 'Vui lòng chọn loại môi trường'],
    },
    province: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      required: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    commune: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commune',
      required: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    address: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index địa chỉ 2dsphere cho truy vấn địa lý
stationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Station', stationSchema);
