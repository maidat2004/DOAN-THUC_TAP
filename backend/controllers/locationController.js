const Province = require('../models/Province');
const District = require('../models/District');
const Commune = require('../models/Commune');

// Lấy tất cả tỉnh
exports.getProvinces = async (req, res, next) => {
  try {
    const provinces = await Province.find();

    res.status(200).json({
      message: 'Lấy danh sách tỉnh thành công',
      data: provinces,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy huyện theo tỉnh
exports.getDistrictsByProvince = async (req, res, next) => {
  try {
    const { provinceId } = req.params;

    const districts = await District.find({ province: provinceId })
      .populate('province');

    res.status(200).json({
      message: 'Lấy danh sách huyện thành công',
      data: districts,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy xã/phường theo huyện
exports.getCommunesByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;

    const communes = await Commune.find({ district: districtId })
      .populate('district')
      .populate('province');

    res.status(200).json({
      message: 'Lấy danh sách xã/phường thành công',
      data: communes,
    });
  } catch (error) {
    next(error);
  }
};

// Tạo tỉnh (Admin only)
exports.createProvince = async (req, res, next) => {
  try {
    const { code, name, description, coordinates } = req.body;

    const province = new Province({
      code,
      name,
      description,
      coordinates,
    });

    await province.save();

    res.status(201).json({
      message: 'Tạo tỉnh thành công',
      data: province,
    });
  } catch (error) {
    next(error);
  }
};

// Tạo huyện (Admin only)
exports.createDistrict = async (req, res, next) => {
  try {
    const { code, name, province, description, coordinates } = req.body;

    const district = new District({
      code,
      name,
      province,
      description,
      coordinates,
    });

    await district.save();

    res.status(201).json({
      message: 'Tạo huyện thành công',
      data: district,
    });
  } catch (error) {
    next(error);
  }
};

// Tạo xã/phường (Admin only)
exports.createCommune = async (req, res, next) => {
  try {
    const { code, name, district, province, description, coordinates } = req.body;

    const commune = new Commune({
      code,
      name,
      district,
      province,
      description,
      coordinates,
    });

    await commune.save();

    res.status(201).json({
      message: 'Tạo xã/phường thành công',
      data: commune,
    });
  } catch (error) {
    next(error);
  }
};
