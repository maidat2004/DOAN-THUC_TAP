const Threshold = require('../models/Threshold');
const { STANDARD_PROFILE, STANDARD_THRESHOLDS } = require('../config/standardThresholds');

// Tạo ngưỡng cảnh báo
exports.createThreshold = async (req, res, next) => {
  try {
    const { name, type, indicator, minValue, maxValue, unit, description } = req.body;

    if (Number(minValue) > Number(maxValue)) {
      return res.status(400).json({ message: 'Giá trị tối thiểu không được lớn hơn giá trị tối đa' });
    }

    const existing = await Threshold.findOne({
      type,
      indicator,
      isActive: true,
      $or: [{ sourceType: 'manual' }, { sourceType: { $exists: false } }],
    });

    if (existing) {
      return res.status(409).json({ message: 'Đã tồn tại ngưỡng thủ công cho chỉ tiêu này' });
    }

    const threshold = new Threshold({
      name,
      type,
      indicator,
      minValue,
      maxValue,
      unit,
      description,
      sourceType: 'manual',
      sourceName: 'Tạo thủ công',
      sourceReference: 'User-defined',
      lastReviewedAt: new Date(),
    });

    await threshold.save();

    res.status(201).json({
      message: 'Tạo ngưỡng cảnh báo thành công',
      data: threshold,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả ngưỡng
exports.getThresholds = async (req, res, next) => {
  try {
    const { type, sourceType } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (sourceType) filter.sourceType = sourceType;

    const thresholds = await Threshold.find(filter).sort({ type: 1, indicator: 1, sourceType: -1, updatedAt: -1 });

    res.status(200).json({
      message: 'Lấy danh sách ngưỡng cảnh báo thành công',
      data: thresholds,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết ngưỡng
exports.getThresholdById = async (req, res, next) => {
  try {
    const threshold = await Threshold.findById(req.params.id);

    if (!threshold) {
      return res.status(404).json({ message: 'Ngưỡng không tồn tại' });
    }

    res.status(200).json({
      message: 'Lấy thông tin ngưỡng thành công',
      data: threshold,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật ngưỡng
exports.updateThreshold = async (req, res, next) => {
  try {
    const { minValue, maxValue, description, sourceName, sourceReference } = req.body;

    if (Number(minValue) > Number(maxValue)) {
      return res.status(400).json({ message: 'Giá trị tối thiểu không được lớn hơn giá trị tối đa' });
    }

    const updatePayload = {
      minValue,
      maxValue,
      description,
      lastReviewedAt: new Date(),
    };

    if (sourceName !== undefined) updatePayload.sourceName = sourceName;
    if (sourceReference !== undefined) updatePayload.sourceReference = sourceReference;

    const threshold = await Threshold.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!threshold) {
      return res.status(404).json({ message: 'Ngưỡng không tồn tại' });
    }

    res.status(200).json({
      message: 'Cập nhật ngưỡng thành công',
      data: threshold,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa ngưỡng
exports.deleteThreshold = async (req, res, next) => {
  try {
    const threshold = await Threshold.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!threshold) {
      return res.status(404).json({ message: 'Ngưỡng không tồn tại' });
    }

    res.status(200).json({
      message: 'Xóa ngưỡng cảnh báo thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy bộ ngưỡng chuẩn tham chiếu
exports.getStandardThresholds = async (req, res, next) => {
  try {
    res.status(200).json({
      message: 'Lấy bộ ngưỡng chuẩn tham chiếu thành công',
      data: {
        profile: STANDARD_PROFILE,
        thresholds: STANDARD_THRESHOLDS,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Nạp/Cập nhật bộ ngưỡng chuẩn tham chiếu
exports.applyStandardThresholds = async (req, res, next) => {
  try {
    const operations = STANDARD_THRESHOLDS.map((item) => ({
      updateOne: {
        filter: {
          type: item.type,
          indicator: item.indicator,
          sourceType: 'standard',
        },
        update: {
          $set: {
            name: item.name,
            type: item.type,
            indicator: item.indicator,
            minValue: item.minValue,
            maxValue: item.maxValue,
            unit: item.unit,
            description: item.description,
            sourceType: 'standard',
            sourceName: item.sourceName,
            sourceReference: item.sourceReference,
            isActive: true,
            lastReviewedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await Threshold.bulkWrite(operations, { ordered: false });

    const totalStandard = await Threshold.countDocuments({ sourceType: 'standard', isActive: true });

    res.status(200).json({
      message: 'Nạp bộ ngưỡng chuẩn tham chiếu thành công',
      data: {
        profile: STANDARD_PROFILE,
        totalStandard,
      },
    });
  } catch (error) {
    next(error);
  }
};
