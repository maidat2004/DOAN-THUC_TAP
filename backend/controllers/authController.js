const User = require('../models/User');
const { generateToken } = require('../config/jwt');

// Đăng ký
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role, company } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên, email và mật khẩu' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const allowedRoles = ['staff', 'viewer'];
    const normalizedRole = allowedRoles.includes(role) ? role : 'viewer';

    if (normalizedRole === 'staff' && !company) {
      return res.status(400).json({ message: 'Vui lòng nhập công ty cho tài khoản nhân viên' });
    }

    user = new User({
      fullName,
      email,
      password,
      phone,
      role: 'viewer',
      requestedRole: normalizedRole === 'staff' ? 'staff' : undefined,
      company,
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    user.password = undefined;

    res.status(201).json({
      message: 'Đăng ký thành công. Tài khoản được cấp quyền người xem, admin sẽ duyệt nếu cần quyền nhân viên.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Admin tạo tài khoản
exports.createUserByAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role, company, isActive = true } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên, email và mật khẩu' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    if (role === 'admin') {
      return res.status(400).json({ message: 'Không thể tạo tài khoản Admin qua chức năng này' });
    }

    const allowedRoles = ['staff', 'viewer'];
    const normalizedRole = allowedRoles.includes(role) ? role : 'viewer';

    if (normalizedRole === 'staff' && !company) {
      return res.status(400).json({ message: 'Vui lòng nhập công ty cho tài khoản nhân viên' });
    }

    user = new User({
      fullName,
      email,
      password,
      phone,
      role: normalizedRole,
      requestedRole: undefined,
      company,
      isActive,
    });

    await user.save();

    user.password = undefined;

    res.status(201).json({
      message: 'Tạo tài khoản thành công',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const lastLogin = new Date();
    await User.findByIdAndUpdate(
      user._id,
      { lastLogin },
      { runValidators: false }
    );
    user.lastLogin = lastLogin;

    const token = generateToken(user._id, user.role);

    user.password = undefined;

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('district')
      .populate('commune');

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    let refreshedToken;
    if (req.user.role && user.role && req.user.role !== user.role) {
      refreshedToken = generateToken(user._id, user.role);
    }

    res.status(200).json({
      message: 'Lấy thông tin người dùng thành công',
      user,
      token: refreshedToken,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin người dùng
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, company, district, commune } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, phone, company, district, commune },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Cập nhật thông tin thành công',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mới' });
    }

    const user = await User.findById(req.user.userId).select('+password');

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách người dùng (chỉ Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('district').populate('commune');

    res.status(200).json({
      message: 'Lấy danh sách người dùng thành công',
      total: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật người dùng (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, phone, role, company, district, commune, isActive, requestedRole } = req.body;

    if (req.user.userId === userId && role !== undefined) {
      return res.status(400).json({ message: 'Bạn không thể tự thay đổi vai trò của chính mình' });
    }

    if (req.user.userId === userId && isActive === false) {
      return res.status(400).json({ message: 'Bạn không thể tự vô hiệu hóa tài khoản của chính mình' });
    }

    if (role === 'admin') {
      return res.status(400).json({ message: 'Không thể cấp quyền Admin qua chức năng này' });
    }

    if (role !== undefined && !['staff', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    if (role === 'staff' && !company) {
      return res.status(400).json({ message: 'Vui lòng nhập công ty cho tài khoản nhân viên' });
    }

    if (requestedRole === 'admin') {
      return res.status(400).json({ message: 'Không thể yêu cầu quyền Admin' });
    }

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (phone !== undefined) updateFields.phone = phone;
    if (role !== undefined) updateFields.role = role;
    if (company !== undefined) updateFields.company = company;
    if (district !== undefined) updateFields.district = district;
    if (commune !== undefined) updateFields.commune = commune;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const update = { $set: updateFields };

    if (requestedRole === null) {
      update.$unset = { requestedRole: '' };
    } else if (requestedRole !== undefined) {
      update.$set.requestedRole = requestedRole;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    ).populate('district commune');

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({
      message: 'Cập nhật người dùng thành công',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa người dùng (chỉ Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.userId === userId) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    next(error);
  }
};

