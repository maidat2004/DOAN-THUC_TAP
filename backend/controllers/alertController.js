const Alert = require('../models/Alert');

// Lấy danh sách cảnh báo
exports.getAlerts = async (req, res, next) => {
  try {
    const { station, type, isResolved, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (station) filter.station = station;
    if (type) filter.type = type;

    if (isResolved !== undefined) {
      filter.isResolved = isResolved === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alerts = await Alert.find(filter)
      .populate({
        path: 'station',
        select: 'name code type address coordinates status province district',
      })
      .populate({
        path: 'environmentData',
        select: 'type water air soil measurementDate notes company recordedBy',
        populate: {
          path: 'recordedBy',
          select: 'fullName email company',
        },
      })
      .populate({
        path: 'threshold',
        select: 'name type indicator minValue maxValue unit description',
      })
      .populate({
        path: 'resolvedBy',
        select: 'fullName email role',
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Alert.countDocuments(filter);

    res.status(200).json({
      message: 'Lấy danh sách cảnh báo thành công',
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// Giải quyết cảnh báo
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user.userId,
      },
      { new: true }
    )
      .populate({
        path: 'station',
        select: 'name code type address',
      })
      .populate({
        path: 'environmentData',
        select: 'measurementDate notes',
      })
      .populate({
        path: 'resolvedBy',
        select: 'fullName email role',
      });

    if (!alert) {
      return res.status(404).json({ message: 'Cảnh báo không tồn tại' });
    }

    res.status(200).json({
      message: 'Giải quyết cảnh báo thành công',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê cảnh báo chi tiết
exports.getAlertStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate, type, station } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let typeFilter = {};
    if (type) typeFilter.type = type;

    let stationFilter = {};
    if (station) stationFilter.station = station;

    const filter = { ...dateFilter, ...typeFilter, ...stationFilter };

    const totalAlerts = await Alert.countDocuments(filter);
    const unresolvedAlerts = await Alert.countDocuments({
      ...filter,
      isResolved: false,
    });
    const resolvedAlerts = await Alert.countDocuments({
      ...filter,
      isResolved: true,
    });

    const alertsByType = await Alert.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } },
    ]);

    const alertsByStation = await Alert.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$station',
          count: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ['$type', 'critical'] }, 1, 0] },
          },
          warning: {
            $sum: { $cond: [{ $eq: ['$type', 'warning'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'stations',
          localField: '_id',
          foreignField: '_id',
          as: 'stationInfo',
        },
      },
      { $unwind: '$stationInfo' },
      {
        $project: {
          station: '$stationInfo.name',
          code: '$stationInfo.code',
          count: 1,
          critical: 1,
          warning: 1,
        },
      },
    ]);

    const recentAlerts = await Alert.find(filter)
      .populate('station', 'name code type')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      message: 'Lấy thống kê cảnh báo thành công',
      data: {
        summary: {
          totalAlerts,
          unresolvedAlerts,
          resolvedAlerts,
          resolutionRate: totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0,
        },
        byType: alertsByType,
        byStation: alertsByStation,
        recent: recentAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy cảnh báo theo trạm
exports.getAlertsByStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const alerts = await Alert.find({
      station: stationId,
      createdAt: { $gte: startDate },
    })
      .populate('threshold', 'indicator minValue maxValue unit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Lấy ${alerts.length} cảnh báo từ trạm thành công`,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};
