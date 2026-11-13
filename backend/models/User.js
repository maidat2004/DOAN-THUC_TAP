const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập tên đầy đủ'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải ít nhất 6 ký tự'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'viewer'],
      default: 'viewer',
    },
    requestedRole: {
      type: String,
      enum: ['staff', 'viewer', null],
      default: null,
    },
    company: {
      type: String,
      trim: true,
      // Công ty/doanh nghiệp của user (để quản lý quyền xem dữ liệu)
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },
    commune: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commune',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method so sánh password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
