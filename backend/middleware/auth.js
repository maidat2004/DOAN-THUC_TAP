const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const dbUser = await User.findById(req.user.userId).select('role isActive');

      if (!dbUser || dbUser.isActive === false) {
        return res.status(401).json({ message: 'Tài khoản không còn hiệu lực' });
      }

      // Đồng bộ role từ DB để quyền thay đổi có hiệu lực ngay lập tức
      req.user.role = dbUser.role;

      if (!roles.includes(dbUser.role)) {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, authorize };
