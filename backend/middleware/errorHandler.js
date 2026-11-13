const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Lỗi xác thực', errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} đã tồn tại` });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ',
  });
};

module.exports = errorHandler;
