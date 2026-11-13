const Station = require('../models/Station');
const EnvironmentData = require('../models/EnvironmentData');
const Threshold = require('../models/Threshold');

// Public: list active stations
exports.getPublicStations = async (req, res, next) => {
  try {
    const stations = await Station.find({ isActive: true })
      .select('code name type address coordinates status')
      .sort({ name: 1 });

    res.status(200).json({
      message: 'Lấy danh sách điểm quan trắc công khai thành công',
      total: stations.length,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

// Public: latest data + thresholds for a station
exports.getPublicStationSummary = async (req, res, next) => {
  try {
    const { stationId } = req.params;

    const station = await Station.findById(stationId)
      .select('code name type address coordinates status');

    if (!station) {
      return res.status(404).json({ message: 'Điểm quan trắc không tồn tại' });
    }

    const latestData = await EnvironmentData.findOne({ station: stationId })
      .select('type measurementDate water air soil')
      .sort({ measurementDate: -1 });

    const thresholds = await Threshold.find({ type: station.type, isActive: true })
      .select('indicator minValue maxValue unit');

    const thresholdMap = thresholds.reduce((acc, threshold) => {
      if (threshold?.indicator) {
        acc[threshold.indicator] = threshold;
      }
      return acc;
    }, {});

    res.status(200).json({
      message: 'Lấy dữ liệu quan trắc công khai thành công',
      data: {
        station,
        latestData,
        thresholds: thresholdMap,
      },
    });
  } catch (error) {
    next(error);
  }
};
