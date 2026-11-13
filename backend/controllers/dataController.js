const EnvironmentData = require('../models/EnvironmentData');
const Alert = require('../models/Alert');
const Threshold = require('../models/Threshold');

// Tạo dữ liệu môi trường mới
exports.createEnvironmentData = async (req, res, next) => {
  try {
    const { station, type, measurementDate, water, air, soil, notes } = req.body;

    if (!station || !type || !measurementDate) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    const data = new EnvironmentData({
      station,
      type,
      measurementDate,
      water: type === 'water' ? water : undefined,
      air: type === 'air' ? air : undefined,
      soil: type === 'soil' ? soil : undefined,
      notes,
      recordedBy: req.user.userId,
      company: req.user.company, // Auto-gán công ty từ user
      status: 'submitted', // Chờ admin duyệt
    });

    await data.save();
    await data.populate('station recordedBy');

    // Kiểm tra ngưỡng cảnh báo
    await checkThresholds(data);

    res.status(201).json({
      message: 'Tạo dữ liệu môi trường thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy dữ liệu môi trường
exports.getEnvironmentData = async (req, res, next) => {
  try {
    const { station, type, startDate, endDate, page = 1, limit = 20 } = req.query;
    let filter = {};

    // Staff chỉ xem báo cáo của chính mình
    if (req.user.role === 'staff') {
      filter.recordedBy = req.user.userId;
    } else if (req.user.role !== 'admin' && req.user.company) {
      // Các role khác (vd: viewer) chỉ xem dữ liệu của công ty mình
      filter.company = req.user.company;
    }

    if (station) filter.station = station;
    if (type) filter.type = type;

    if (startDate || endDate) {
      filter.measurementDate = {};
      if (startDate) filter.measurementDate.$gte = new Date(startDate);
      if (endDate) filter.measurementDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const data = await EnvironmentData.find(filter)
      .populate('station')
      .populate('recordedBy', 'fullName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ measurementDate: -1 });

    const total = await EnvironmentData.countDocuments(filter);

    res.status(200).json({
      message: 'Lấy dữ liệu môi trường thành công',
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết một bản ghi dữ liệu
exports.getEnvironmentDataById = async (req, res, next) => {
  try {
    const data = await EnvironmentData.findById(req.params.id)
      .populate('station')
      .populate('recordedBy');

    if (!data) {
      return res.status(404).json({ message: 'Dữ liệu không tồn tại' });
    }

    // Check quyền xem: staff chỉ được xem dữ liệu của chính mình
    if (req.user.role === 'staff' && data.recordedBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem dữ liệu này' });
    }

    // Viewer (hoặc role khác) chỉ xem dữ liệu thuộc công ty mình
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.company && data.company !== req.user.company) {
      return res.status(403).json({ message: 'Bạn không có quyền xem dữ liệu này' });
    }

    res.status(200).json({
      message: 'Lấy thông tin dữ liệu thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật dữ liệu môi trường
exports.updateEnvironmentData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { water, air, soil, notes, status } = req.body;

    const data = await EnvironmentData.findById(id);
    if (!data) {
      return res.status(404).json({ message: 'Dữ liệu không tồn tại' });
    }

    // Check quyền: Admin hoặc creator hoặc cùng công ty
    if (req.user.role !== 'admin' && 
        data.recordedBy.toString() !== req.user.userId && 
        data.company !== req.user.company) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật dữ liệu này' });
    }

    // Chỉ admin mới có thể thay đổi status
    if (req.user.role !== 'admin' && data.status !== status) {
      return res.status(403).json({ message: 'Chỉ admin có thể thay đổi trạng thái' });
    }

    if (data.type === 'water') data.water = water || data.water;
    if (data.type === 'air') data.air = air || data.air;
    if (data.type === 'soil') data.soil = soil || data.soil;

    data.notes = notes || data.notes;
    if (req.user.role === 'admin') {
      data.status = status || data.status;
    }

    await data.save();
    await data.populate('station recordedBy');

    await checkThresholds(data);

    res.status(200).json({
      message: 'Cập nhật dữ liệu thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa dữ liệu
exports.deleteEnvironmentData = async (req, res, next) => {
  try {
    const data = await EnvironmentData.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Dữ liệu không tồn tại' });
    }

    res.status(200).json({
      message: 'Xóa dữ liệu thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê dữ liệu
exports.getDataStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const totalRecords = await EnvironmentData.countDocuments(
      dateFilter ? { measurementDate: dateFilter } : {}
    );

    const recordsByType = await EnvironmentData.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const recordsByStation = await EnvironmentData.aggregate([
      { $group: { _id: '$station', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      message: 'Lấy thống kê dữ liệu thành công',
      data: {
        totalRecords,
        recordsByType,
        recordsByStation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Kiểm tra và tạo cảnh báo
async function checkThresholds(data) {
  try {
    let indicators = [];

    if (data.type === 'water' && data.water) {
      indicators = ['ph', 'do_level', 'temperature'];
    } else if (data.type === 'air' && data.air) {
      indicators = ['pm25', 'pm10', 'co2'];
    } else if (data.type === 'soil' && data.soil) {
      indicators = ['ph', 'moisture'];
    }

    for (const indicator of indicators) {
      const manualThreshold = await Threshold.findOne({
        type: data.type,
        indicator,
        isActive: true,
        $or: [{ sourceType: 'manual' }, { sourceType: { $exists: false } }],
      }).sort({ updatedAt: -1, createdAt: -1 });

      const standardThreshold = await Threshold.findOne({
        type: data.type,
        indicator,
        sourceType: 'standard',
        isActive: true,
      }).sort({ updatedAt: -1, createdAt: -1 });

      const threshold = manualThreshold || standardThreshold;
      if (!threshold) continue;

      let value;
      if (data.type === 'water') value = data.water[indicator];
      if (data.type === 'air') value = data.air[indicator];
      if (data.type === 'soil') value = data.soil[indicator];

      if (value !== undefined) {
        let alertType = null;
        let message = '';

        if (value > threshold.maxValue) {
          alertType = 'critical';
          message = `${indicator} vượt ngưỡng tối đa: ${value} > ${threshold.maxValue}`;
        } else if (value < threshold.minValue) {
          alertType = 'warning';
          message = `${indicator} dưới mức tối thiểu: ${value} < ${threshold.minValue}`;
        }

        if (alertType) {
          const alert = new Alert({
            station: data.station,
            environmentData: data._id,
            threshold: threshold._id,
            type: alertType,
            indicator,
            value,
            message,
          });

          await alert.save();
        }
      }
    }
  } catch (error) {
    console.error('Error checking thresholds:', error);
  }
}

// Submit báo cáo (Staff/User)
exports.submitReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await EnvironmentData.findById(id);
    if (!data) {
      return res.status(404).json({ message: 'Dữ liệu không tồn tại' });
    }

    // Check quyền: chỉ creator hoặc admin
    if (req.user.role !== 'admin' && data.recordedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền gửi báo cáo này' });
    }

    // Chỉ có thể submit nếu là draft
    if (data.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể submit báo cáo ở trạng thái draft' });
    }

    data.status = 'submitted';
    await data.save();

    res.status(200).json({
      message: 'Gửi báo cáo thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Phê duyệt báo cáo (Admin only)
exports.approveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalNotes } = req.body;

    const data = await EnvironmentData.findById(id);
    if (!data) {
      return res.status(404).json({ message: 'Dữ liệu không tồn tại' });
    }

    if (data.status !== 'submitted') {
      return res.status(400).json({ message: 'Chỉ có thể phê duyệt báo cáo submitted' });
    }

    data.status = 'approved';
    data.approvalNotes = approvalNotes;
    data.approvedBy = req.user.userId;
    data.approvedAt = new Date();
    await data.save();

    res.status(200).json({
      message: 'Phê duyệt báo cáo thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Từ chối báo cáo (Admin only)
exports.rejectReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const data = await EnvironmentData.findById(id);
    if (!data) {
      return res.status(404).json({ message: 'Dữ liệu không tồn tại' });
    }

    if (data.status !== 'submitted') {
      return res.status(400).json({ message: 'Chỉ có thể từ chối báo cáo submitted' });
    }

    data.status = 'rejected';
    data.rejectionReason = rejectionReason;
    data.rejectedBy = req.user.userId;
    data.rejectedAt = new Date();
    await data.save();

    res.status(200).json({
      message: 'Từ chối báo cáo thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};
