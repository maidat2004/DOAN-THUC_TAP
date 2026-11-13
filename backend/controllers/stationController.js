const Station = require('../models/Station');
const District = require('../models/District');
const Commune = require('../models/Commune');
const Province = require('../models/Province');

// Tạo điểm quan trắc
exports.createStation = async (req, res, next) => {
  try {
    const { code, name, type, province, district, commune, coordinates, address } = req.body;

    if (!code || !name || !type || !coordinates) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    const station = new Station({
      code,
      name,
      type,
      province,
      district,
      commune,
      coordinates,
      address,
      createdBy: req.user.userId,
    });

    await station.save();

    res.status(201).json({
      message: 'Tạo điểm quan trắc thành công',
      station,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả điểm quan trắc
exports.getAllStations = async (req, res, next) => {
  try {
    const { type, district, commune } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (district) filter.district = district;
    if (commune) filter.commune = commune;

    const stations = await Station.find(filter)
      .populate('province')
      .populate('district')
      .populate('commune')
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      message: 'Lấy danh sách điểm quan trắc thành công',
      total: stations.length,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết một điểm quan trắc
exports.getStationById = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id)
      .populate('province')
      .populate('district')
      .populate('commune')
      .populate('createdBy');

    if (!station) {
      return res.status(404).json({ message: 'Điểm quan trắc không tồn tại' });
    }

    res.status(200).json({
      message: 'Lấy thông tin điểm quan trắc thành công',
      station,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật điểm quan trắc
exports.updateStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, coordinates, address, status } = req.body;

    const station = await Station.findByIdAndUpdate(
      id,
      { name, type, coordinates, address, status },
      { new: true, runValidators: true }
    )
      .populate('province')
      .populate('district')
      .populate('commune');

    if (!station) {
      return res.status(404).json({ message: 'Điểm quan trắc không tồn tại' });
    }

    res.status(200).json({
      message: 'Cập nhật điểm quan trắc thành công',
      station,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa điểm quan trắc (soft delete)
exports.deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({ message: 'Điểm quan trắc không tồn tại' });
    }

    res.status(200).json({
      message: 'Xóa điểm quan trắc thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê điểm quan trắc
exports.getStationStatistics = async (req, res, next) => {
  try {
    const totalStations = await Station.countDocuments({ isActive: true });
    const stationsByType = await Station.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const stationsByDistrict = await Station.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      message: 'Lấy thống kê điểm quan trắc thành công',
      data: {
        totalStations,
        stationsByType,
        stationsByDistrict,
      },
    });
  } catch (error) {
    next(error);
  }
};
