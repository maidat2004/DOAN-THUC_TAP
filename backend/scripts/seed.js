const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/database');
const Province = require('../models/Province');
const District = require('../models/District');
const Commune = require('../models/Commune');
const Threshold = require('../models/Threshold');
const User = require('../models/User');
const Station = require('../models/Station');
const EnvironmentData = require('../models/EnvironmentData');
const Alert = require('../models/Alert');
const { STANDARD_PROFILE, STANDARD_THRESHOLDS } = require('../config/standardThresholds');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Province.deleteMany({});
    await District.deleteMany({});
    await Commune.deleteMany({});
    await Threshold.deleteMany({});
    await User.deleteMany({});
    await Station.deleteMany({});
    await EnvironmentData.deleteMany({});
    await Alert.deleteMany({});

    // Seed Provinces - Vĩnh Long Mới (Vĩnh Long + Trà Vinh + Bến Tre)
    // Vĩnh Long
    const vinhLong = await Province.create({
      code: 'VL',
      name: 'Vĩnh Long',
      description: 'Tỉnh Vĩnh Long',
      coordinates: {
        latitude: 10.2539,
        longitude: 105.9597,
      },
    });

    // New
    const traVinh = await Province.create({
      code: 'TV',
      name: 'Trà Vinh',
      description: 'Tỉnh Trà Vinh (sáp nhập Vĩnh Long mới)',
      coordinates: {
        latitude: 9.9342,
        longitude: 106.3424,
      },
    });

    const benTre = await Province.create({
      code: 'BT',
      name: 'Bến Tre',
      description: 'Tỉnh Bến Tre (sáp nhập Vĩnh Long mới)',
      coordinates: {
        latitude: 10.2375,
        longitude: 106.3678,
      },
    });

    // Seed Districts - Vĩnh Long existing
    const vlDistricts = await District.insertMany([
      {
        code: 'VL01',
        name: 'Thành phố Vĩnh Long',
        province: vinhLong._id,
        coordinates: { latitude: 10.2539, longitude: 105.9597 },
      },
      {
        code: 'VL02',
        name: 'Bình Minh',
        province: vinhLong._id,
        coordinates: { latitude: 10.0833, longitude: 105.6667 },
      },
      {
        code: 'VL03',
        name: 'Bình Tân',
        province: vinhLong._id,
        coordinates: { latitude: 10.3, longitude: 105.9 },
      },
      {
        code: 'VL04',
        name: 'Long Hồ',
        province: vinhLong._id,
        coordinates: { latitude: 10.3167, longitude: 105.85 },
      },
      {
        code: 'VL05',
        name: 'Mang Thít',
        province: vinhLong._id,
        coordinates: { latitude: 10.15, longitude: 105.85 },
      },
      {
        code: 'VL06',
        name: 'Tam Bình',
        province: vinhLong._id,
        coordinates: { latitude: 10.3667, longitude: 105.9167 },
      },
      {
        code: 'VL07',
        name: 'Trà Ôn',
        province: vinhLong._id,
        coordinates: { latitude: 10.05, longitude: 105.9167 },
      },
      {
        code: 'VL08',
        name: 'Vũng Liêm',
        province: vinhLong._id,
        coordinates: { latitude: 10.35, longitude: 106.05 },
      },
    ]);

    // Trà Vinh districts
    const tvDistricts = await District.insertMany([
      {
        code: 'TV01',
        name: 'TP. Trà Vinh',
        province: traVinh._id,
        coordinates: { latitude: 9.9377, longitude: 106.34 },
      },
      {
        code: 'TV02',
        name: 'Càng Long',
        province: traVinh._id,
        coordinates: { latitude: 9.9974, longitude: 106.2047 },
      },
      {
        code: 'TV03',
        name: 'Tiểu Cần',
        province: traVinh._id,
        coordinates: { latitude: 9.8177, longitude: 106.1923 },
      },
      {
        code: 'TV04',
        name: 'Châu Thành',
        province: traVinh._id,
        coordinates: { latitude: 9.8852, longitude: 106.3293 },
      },
      {
        code: 'TV05',
        name: 'Cầu Kè',
        province: traVinh._id,
        coordinates: { latitude: 9.8711, longitude: 106.0605 },
      },
      {
        code: 'TV06',
        name: 'Cầu Ngang',
        province: traVinh._id,
        coordinates: { latitude: 9.7947, longitude: 106.4515 },
      },
      {
        code: 'TV07',
        name: 'Trà Cú',
        province: traVinh._id,
        coordinates: { latitude: 9.6865, longitude: 106.2597 },
      },
      {
        code: 'TV08',
        name: 'Duyên Hải',
        province: traVinh._id,
        coordinates: { latitude: 9.6621, longitude: 106.5179 },
      },
      {
        code: 'TV09',
        name: 'Thị xã Duyên Hải',
        province: traVinh._id,
        coordinates: { latitude: 9.6374, longitude: 106.4963 },
      },
    ]);

    // Bến Tre districts
    const btDistricts = await District.insertMany([
      {
        code: 'BT01',
        name: 'TP. Bến Tre',
        province: benTre._id,
        coordinates: { latitude: 10.2373, longitude: 106.3813 },
      },
      {
        code: 'BT02',
        name: 'Giồng Trôm',
        province: benTre._id,
        coordinates: { latitude: 10.1589, longitude: 106.5036 },
      },
      {
        code: 'BT03',
        name: 'Mỏ Cày Nam',
        province: benTre._id,
        coordinates: { latitude: 10.0711, longitude: 106.3585 },
      },
      {
        code: 'BT04',
        name: 'Châu Thành',
        province: benTre._id,
        coordinates: { latitude: 10.2899, longitude: 106.3029 },
      },
      {
        code: 'BT05',
        name: 'Chợ Lách',
        province: benTre._id,
        coordinates: { latitude: 10.2606, longitude: 106.1210 },
      },
      {
        code: 'BT06',
        name: 'Mỏ Cày Bắc',
        province: benTre._id,
        coordinates: { latitude: 10.1671, longitude: 106.2917 },
      },
      {
        code: 'BT07',
        name: 'Bình Đại',
        province: benTre._id,
        coordinates: { latitude: 10.1868, longitude: 106.6936 },
      },
      {
        code: 'BT08',
        name: 'Ba Tri',
        province: benTre._id,
        coordinates: { latitude: 10.0729, longitude: 106.5977 },
      },
      {
        code: 'BT09',
        name: 'Thạnh Phú',
        province: benTre._id,
        coordinates: { latitude: 9.9321, longitude: 106.5610 },
      },
    ]);

    // Seed Communes for VL (existing)
    const vlCommunes = await Commune.insertMany([
      {
        code: 'VL01-01',
        name: 'Phường 1',
        district: vlDistricts[0]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL01-02',
        name: 'Phường 2',
        district: vlDistricts[0]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL02-01',
        name: 'Xã An Phú',
        district: vlDistricts[1]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL03-01',
        name: `Trung tâm ${vlDistricts[2].name}`,
        district: vlDistricts[2]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL04-01',
        name: `Trung tâm ${vlDistricts[3].name}`,
        district: vlDistricts[3]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL05-01',
        name: `Trung tâm ${vlDistricts[4].name}`,
        district: vlDistricts[4]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL06-01',
        name: `Trung tâm ${vlDistricts[5].name}`,
        district: vlDistricts[5]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL07-01',
        name: `Trung tâm ${vlDistricts[6].name}`,
        district: vlDistricts[6]._id,
        province: vinhLong._id,
      },
      {
        code: 'VL08-01',
        name: `Trung tâm ${vlDistricts[7].name}`,
        district: vlDistricts[7]._id,
        province: vinhLong._id,
      },
    ]);

    // Communes for new provinces
    const tvCommunes = await Commune.insertMany(
      tvDistricts.map((district, index) => ({
        code: `${district.code}-01`,
        name: index === 0 ? 'Phường 1' : `Trung tâm ${district.name}`,
        district: district._id,
        province: traVinh._id,
      }))
    );

    const btCommunes = await Commune.insertMany(
      btDistricts.map((district, index) => ({
        code: `${district.code}-01`,
        name: index === 0 ? 'Phường 1' : `Trung tâm ${district.name}`,
        district: district._id,
        province: benTre._id,
      }))
    );

    // Seed Thresholds từ bộ chuẩn tham chiếu
    await Threshold.insertMany(
      STANDARD_THRESHOLDS.map((item) => ({
        ...item,
        sourceType: 'standard',
        sourceName: item.sourceName || STANDARD_PROFILE.name,
        sourceReference: item.sourceReference || STANDARD_PROFILE.key,
        lastReviewedAt: new Date(),
      }))
    );

    // Users (existing)
    const admin = await User.create({
      fullName: 'Admin System',
      email: 'admin@ems.com',
      password: 'admin123',
      phone: '0901234567',
      role: 'admin',
      company: 'Admin System',
      district: vlDistricts[0]._id,
      isActive: true,
    });

    const staffCompanyA = await User.create({
      fullName: 'Nhân viên Công ty A',
      email: 'staff@companya.com',
      password: 'staff123',
      phone: '0902345678',
      role: 'staff',
      company: 'Công ty A - Xử lý Nước',
      district: vlDistricts[0]._id,
      isActive: true,
    });

    const staffCompanyB = await User.create({
      fullName: 'Nhân viên Công ty B',
      email: 'staff@companyb.com',
      password: 'staff123',
      phone: '0903456789',
      role: 'staff',
      company: 'Công ty B - Cảnh báo Môi trường',
      district: vlDistricts[1]._id,
      isActive: true,
    });

    const viewer = await User.create({
      fullName: 'Người Xem Dữ Liệu',
      email: 'viewer@ems.com',
      password: 'viewer123',
      phone: '0904567890',
      role: 'viewer',
      company: 'Cơ quan Giám sát',
      commune: vlCommunes[0]._id,
      isActive: true,
    });

    // Stations - 45 TOTAL (Phân bổ cho tất cả huyện)
    const stationsData = [
      // VĨNH LONG: 8 huyện × 2 stations = 16 stations
      // VL01: Thành phố Vĩnh Long
      { code: 'VL01-W01', name: 'Trạm Nước TT VL', type: 'water', district: vlDistricts[0], lat: 10.2539, lng: 105.9597 },
      { code: 'VL01-A01', name: 'Trạm Khí TT VL', type: 'air', district: vlDistricts[0], lat: 10.2545, lng: 105.9605 },
      // VL02: Bình Minh
      { code: 'VL02-W01', name: 'Trạm Nước Bình Minh', type: 'water', district: vlDistricts[1], lat: 10.0833, lng: 105.6667 },
      { code: 'VL02-A01', name: 'Trạm Khí Bình Minh', type: 'air', district: vlDistricts[1], lat: 10.0840, lng: 105.6675 },
      // VL03: Bình Tân
      { code: 'VL03-W01', name: 'Trạm Nước Bình Tân', type: 'water', district: vlDistricts[2], lat: 10.3000, lng: 105.9000 },
      { code: 'VL03-S01', name: 'Trạm Đất Bình Tân', type: 'soil', district: vlDistricts[2], lat: 10.3010, lng: 105.9010 },
      // VL04: Long Hồ
      { code: 'VL04-W01', name: 'Trạm Nước Long Hồ', type: 'water', district: vlDistricts[3], lat: 10.3167, lng: 105.8500 },
      { code: 'VL04-A01', name: 'Trạm Khí Long Hồ', type: 'air', district: vlDistricts[3], lat: 10.3175, lng: 105.8510 },
      // VL05: Mang Thít
      { code: 'VL05-W01', name: 'Trạm Nước Mang Thít', type: 'water', district: vlDistricts[4], lat: 10.1500, lng: 105.8500 },
      { code: 'VL05-A01', name: 'Trạm Khí Mang Thít', type: 'air', district: vlDistricts[4], lat: 10.1510, lng: 105.8510 },
      // VL06: Tam Bình
      { code: 'VL06-W01', name: 'Trạm Nước Tam Bình', type: 'water', district: vlDistricts[5], lat: 10.3667, lng: 105.9167 },
      { code: 'VL06-S01', name: 'Trạm Đất Tam Bình', type: 'soil', district: vlDistricts[5], lat: 10.3675, lng: 105.9175 },
      // VL07: Trà Ôn
      { code: 'VL07-W01', name: 'Trạm Nước Trà Ôn', type: 'water', district: vlDistricts[6], lat: 10.0500, lng: 105.9167 },
      { code: 'VL07-A01', name: 'Trạm Khí Trà Ôn', type: 'air', district: vlDistricts[6], lat: 10.0510, lng: 105.9175 },
      // VL08: Vũng Liêm
      { code: 'VL08-W01', name: 'Trạm Nước Vũng Liêm', type: 'water', district: vlDistricts[7], lat: 10.3500, lng: 106.0500 },
      { code: 'VL08-S01', name: 'Trạm Đất Vũng Liêm', type: 'soil', district: vlDistricts[7], lat: 10.3510, lng: 106.0510 },
      
      // VL Additional - More monitoring for intensive areas
      { code: 'VL01-S01', name: 'Trạm Đất TT VL', type: 'soil', district: vlDistricts[0], lat: 10.2555, lng: 105.9615 },
      { code: 'VL02-S01', name: 'Trạm Đất Bình Minh', type: 'soil', district: vlDistricts[1], lat: 10.0845, lng: 105.6685 },
      { code: 'VL03-A01', name: 'Trạm Khí Bình Tân', type: 'air', district: vlDistricts[2], lat: 10.3020, lng: 105.9020 },

      // TRÀ VINH: 4 huyện × 2-3 stations = 10 stations
      // TV01: TP Trà Vinh
      { code: 'TV01-W01', name: 'Trạm Nước TP Trà Vinh', type: 'water', district: tvDistricts[0], lat: 9.9377, lng: 106.34 },
      { code: 'TV01-A01', name: 'Trạm Khí TP Trà Vinh', type: 'air', district: tvDistricts[0], lat: 9.9390, lng: 106.3412 },
      { code: 'TV01-S01', name: 'Trạm Đất TP Trà Vinh', type: 'soil', district: tvDistricts[0], lat: 9.9364, lng: 106.3420 },
      // TV02: Càng Long
      { code: 'TV02-W01', name: 'Trạm Nước Càng Long', type: 'water', district: tvDistricts[1], lat: 9.9974, lng: 106.2047 },
      { code: 'TV02-A01', name: 'Trạm Khí Càng Long', type: 'air', district: tvDistricts[1], lat: 9.9986, lng: 106.2059 },
      // TV03: Tiểu Cần
      { code: 'TV03-W01', name: 'Trạm Nước Tiểu Cần', type: 'water', district: tvDistricts[2], lat: 9.8177, lng: 106.1923 },
      { code: 'TV03-S01', name: 'Trạm Đất Tiểu Cần', type: 'soil', district: tvDistricts[2], lat: 9.8189, lng: 106.1935 },
      // TV04: Châu Thành
      { code: 'TV04-W01', name: 'Trạm Nước Châu Thành TV', type: 'water', district: tvDistricts[3], lat: 9.8852, lng: 106.3293 },
      { code: 'TV04-A01', name: 'Trạm Khí Châu Thành TV', type: 'air', district: tvDistricts[3], lat: 9.8864, lng: 106.3305 },
      { code: 'TV04-S01', name: 'Trạm Đất Châu Thành TV', type: 'soil', district: tvDistricts[3], lat: 9.8840, lng: 106.3281 },

      // TV Additional
      { code: 'TV01-W02', name: 'Trạm Nước TP Trà Vinh 2', type: 'water', district: tvDistricts[0], lat: 9.9388, lng: 106.3388 },
      { code: 'TV02-S01', name: 'Trạm Đất Càng Long', type: 'soil', district: tvDistricts[1], lat: 9.9962, lng: 106.2060 },
      { code: 'TV03-A01', name: 'Trạm Khí Tiểu Cần', type: 'air', district: tvDistricts[2], lat: 9.8191, lng: 106.1911 },

      // BẾN TRE: 4 huyện × 2-3 stations = 10 stations
      // BT01: TP Bến Tre
      { code: 'BT01-W01', name: 'Trạm Nước TP Bến Tre', type: 'water', district: btDistricts[0], lat: 10.2373, lng: 106.3813 },
      { code: 'BT01-A01', name: 'Trạm Khí TP Bến Tre', type: 'air', district: btDistricts[0], lat: 10.2385, lng: 106.3825 },
      { code: 'BT01-S01', name: 'Trạm Đất TP Bến Tre', type: 'soil', district: btDistricts[0], lat: 10.2361, lng: 106.3831 },
      // BT02: Giồng Trôm
      { code: 'BT02-W01', name: 'Trạm Nước Giồng Trôm', type: 'water', district: btDistricts[1], lat: 10.1589, lng: 106.5036 },
      { code: 'BT02-A01', name: 'Trạm Khí Giồng Trôm', type: 'air', district: btDistricts[1], lat: 10.1601, lng: 106.5048 },
      // BT03: Mỏ Cày Nam
      { code: 'BT03-W01', name: 'Trạm Nước Mỏ Cày Nam', type: 'water', district: btDistricts[2], lat: 10.0711, lng: 106.3585 },
      { code: 'BT03-S01', name: 'Trạm Đất Mỏ Cày Nam', type: 'soil', district: btDistricts[2], lat: 10.0723, lng: 106.3597 },
      // BT04: Châu Thành (BT)
      { code: 'BT04-W01', name: 'Trạm Nước Châu Thành BT', type: 'water', district: btDistricts[3], lat: 10.2899, lng: 106.3029 },
      { code: 'BT04-A01', name: 'Trạm Khí Châu Thành BT', type: 'air', district: btDistricts[3], lat: 10.2911, lng: 106.3041 },
      { code: 'BT04-S01', name: 'Trạm Đất Châu Thành BT', type: 'soil', district: btDistricts[3], lat: 10.2887, lng: 106.3017 },
      
      // BT Additional
      { code: 'BT01-W02', name: 'Trạm Nước TP Bến Tre 2', type: 'water', district: btDistricts[0], lat: 10.2390, lng: 106.3798 },
      { code: 'BT02-S01', name: 'Trạm Đất Giồng Trôm', type: 'soil', district: btDistricts[1], lat: 10.1577, lng: 106.5049 },
      { code: 'BT03-A01', name: 'Trạm Khí Mỏ Cày Nam', type: 'air', district: btDistricts[2], lat: 10.0720, lng: 106.3573 },
    ];

    // Convert to proper format and insert - with correct province mapping
    const allStations = await Station.insertMany(
      stationsData.map(s => {
        let provinceId;
        let communeId;
        
        // Determine province based on district
        if (s.district.code.startsWith('VL')) {
          provinceId = vinhLong._id;
          communeId = vlCommunes[0]._id;
        } else if (s.district.code.startsWith('TV')) {
          provinceId = traVinh._id;
          communeId = tvCommunes[0]._id;
        } else if (s.district.code.startsWith('BT')) {
          provinceId = benTre._id;
          communeId = btCommunes[0]._id;
        }
        
        return {
          code: s.code,
          name: s.name,
          type: s.type,
          province: provinceId,
          district: s.district._id,
          commune: communeId,
          coordinates: { latitude: s.lat, longitude: s.lng },
          address: s.name,
          status: 'active',
          createdBy: admin._id,
          isActive: true,
        };
      })
    );

    // Rest of env data, alerts, users (existing code remains)
    const thresholds = await Threshold.find();
    const waterThresholds = thresholds.filter(t => t.type === 'water');
    const airThresholds = thresholds.filter(t => t.type === 'air');
    const soilThresholds = thresholds.filter(t => t.type === 'soil');

    const envDataList = [];
    const alertsList = [];

    // Create comprehensive environment data with alerts
    // WATER STATIONS (WS001-WS008)
    const waterStations = allStations.filter(s => s.type === 'water');
    for (let i = 0; i < waterStations.length; i++) {
      const measurementDate = new Date(Date.now() - i * 12 * 60 * 60 * 1000);
      const phThreshold = waterThresholds.find(t => t.indicator === 'ph');
      const doThreshold = waterThresholds.find(t => t.indicator === 'do_level');
      const tempThreshold = waterThresholds.find(t => t.indicator === 'temperature');

      // Create water data with some values exceeding thresholds
      const waterData = {
        ph: i % 3 === 0 ? 6.2 : 7.2, // WS001 will trigger warning (6.2 < 6)
        do_level: i % 2 === 0 ? 3.2 : 6.5, // Some stations will trigger
        temperature: i % 4 === 0 ? 36 : 28, // Some will exceed 35
        turbidity: 2 + Math.random() * 3,
        conductivity: 800 + Math.random() * 200,
      };

      const envData = await EnvironmentData.create({
        station: waterStations[i]._id,
        type: 'water',
        measurementDate,
        water: waterData,
        notes: `Dữ liệu nước từ ${waterStations[i].name} - ${measurementDate.toLocaleDateString('vi-VN')}`,
        recordedBy: staffCompanyA._id,
        company: 'Công ty A - Xử lý Nước',
        status: 'submitted',
      });

      envDataList.push(envData);

      // Generate alerts for threshold violations
      if (phThreshold && waterData.ph < phThreshold.minValue) {
        alertsList.push({
          station: waterStations[i]._id,
          environmentData: envData._id,
          threshold: phThreshold._id,
          type: waterData.ph < phThreshold.minValue - 1 ? 'critical' : 'warning',
          indicator: 'ph',
          value: waterData.ph,
          message: `pH nước quá thấp: ${waterData.ph} (Ngưỡng tối thiểu: ${phThreshold.minValue})`,
          isResolved: false,
        });
      }

      if (doThreshold && waterData.do_level < doThreshold.minValue) {
        alertsList.push({
          station: waterStations[i]._id,
          environmentData: envData._id,
          threshold: doThreshold._id,
          type: 'critical',
          indicator: 'do_level',
          value: waterData.do_level,
          message: `Độ ô xy hòa tan quá thấp: ${waterData.do_level} mg/L (Ngưỡng tối thiểu: ${doThreshold.minValue})`,
          isResolved: Math.random() > 0.6, // 40% are resolved
          resolvedAt: Math.random() > 0.6 ? new Date(Date.now() - 6 * 60 * 60 * 1000) : undefined,
          resolvedBy: Math.random() > 0.6 ? admin._id : undefined,
        });
      }

      if (tempThreshold && waterData.temperature > tempThreshold.maxValue) {
        alertsList.push({
          station: waterStations[i]._id,
          environmentData: envData._id,
          threshold: tempThreshold._id,
          type: 'warning',
          indicator: 'temperature',
          value: waterData.temperature,
          message: `Nhiệt độ nước vượt quá tối đa: ${waterData.temperature}°C (Ngưỡng tối đa: ${tempThreshold.maxValue})`,
          isResolved: false,
        });
      }
    }

    // AIR STATIONS (AS001-AS008)
    const airStations = allStations.filter(s => s.type === 'air');
    for (let i = 0; i < airStations.length; i++) {
      const measurementDate = new Date(Date.now() - i * 12 * 60 * 60 * 1000);
      const pm25Threshold = airThresholds.find(t => t.indicator === 'pm25');
      const pm10Threshold = airThresholds.find(t => t.indicator === 'pm10');

      const airData = {
        pm25: i % 2 === 0 ? 95 : 35, // Some will exceed 75
        pm10: i % 3 === 0 ? 180 : 80, // Some will exceed 150
        co2: 500 + Math.random() * 300,
        temperature: 25 + Math.random() * 8,
        humidity: 50 + Math.random() * 30,
        pressure: 1013 + Math.random() * 10,
      };

      const envData = await EnvironmentData.create({
        station: airStations[i]._id,
        type: 'air',
        measurementDate,
        air: airData,
        notes: `Dữ liệu không khí từ ${airStations[i].name} - ${measurementDate.toLocaleDateString('vi-VN')}`,
        recordedBy: staffCompanyB._id,
        company: 'Công ty B - Cảnh báo Môi trường',
        status: 'submitted',
      });

      envDataList.push(envData);

      // Generate air quality alerts
      if (pm25Threshold && airData.pm25 > pm25Threshold.maxValue) {
        alertsList.push({
          station: airStations[i]._id,
          environmentData: envData._id,
          threshold: pm25Threshold._id,
          type: airData.pm25 > 100 ? 'critical' : 'warning',
          indicator: 'pm25',
          value: airData.pm25,
          message: `PM2.5 quá cao: ${airData.pm25} µg/m³ (Ngưỡng tối đa: ${pm25Threshold.maxValue})`,
          isResolved: Math.random() > 0.5,
          resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - 3 * 60 * 60 * 1000) : undefined,
          resolvedBy: Math.random() > 0.5 ? staffCompanyB._id : undefined,
        });
      }

      if (pm10Threshold && airData.pm10 > pm10Threshold.maxValue) {
        alertsList.push({
          station: airStations[i]._id,
          environmentData: envData._id,
          threshold: pm10Threshold._id,
          type: airData.pm10 > 250 ? 'critical' : 'warning',
          indicator: 'pm10',
          value: airData.pm10,
          message: `PM10 quá cao: ${airData.pm10} µg/m³ (Ngưỡng tối đa: ${pm10Threshold.maxValue})`,
          isResolved: false,
        });
      }
    }

    // SOIL STATIONS (SS001-SS004)
    const soilStations = allStations.filter(s => s.type === 'soil');
    for (let i = 0; i < soilStations.length; i++) {
      const measurementDate = new Date(Date.now() - i * 12 * 60 * 60 * 1000);
      const phThreshold = soilThresholds.find(t => t.indicator === 'ph');
      const moistureThreshold = soilThresholds.find(t => t.indicator === 'moisture');

      const soilData = {
        ph: i % 2 === 0 ? 4.8 : 6.8,
        moisture: i % 3 === 0 ? 15 : 32,
        nitrogen: 50 + Math.random() * 100,
        phosphorus: 20 + Math.random() * 30,
        potassium: 100 + Math.random() * 150,
        organicMatter: 2 + Math.random() * 3,
      };

      const envData = await EnvironmentData.create({
        station: soilStations[i]._id,
        type: 'soil',
        measurementDate,
        soil: soilData,
        notes: `Dữ liệu đất từ ${soilStations[i].name} - ${measurementDate.toLocaleDateString('vi-VN')}`,
        recordedBy: staffCompanyA._id,
        company: staffCompanyA.company,
        status: 'submitted',
      });

      envDataList.push(envData);

      // Generate soil alerts
      if (phThreshold && soilData.ph < phThreshold.minValue) {
        alertsList.push({
          station: soilStations[i]._id,
          environmentData: envData._id,
          threshold: phThreshold._id,
          type: 'warning',
          indicator: 'ph',
          value: soilData.ph,
          message: `pH đất quá thấp: ${soilData.ph} (Ngưỡng tối thiểu: ${phThreshold.minValue})`,
          isResolved: Math.random() > 0.7,
          resolvedAt: Math.random() > 0.7 ? new Date(Date.now() - 2 * 60 * 60 * 1000) : undefined,
          resolvedBy: Math.random() > 0.7 ? admin._id : undefined,
        });
      }

      if (moistureThreshold && soilData.moisture < moistureThreshold.minValue) {
        alertsList.push({
          station: soilStations[i]._id,
          environmentData: envData._id,
          threshold: moistureThreshold._id,
          type: 'warning',
          indicator: 'moisture',
          value: soilData.moisture,
          message: `Độ ẩm đất quá thấp: ${soilData.moisture}% (Ngưỡng tối thiểu: ${moistureThreshold.minValue})`,
          isResolved: false,
        });
      }
    }

    // Insert all data
    if (alertsList.length > 0) {
      await Alert.insertMany(alertsList);
    }

    console.log('✅ Seed data created successfully!');
    console.log(`📊 Created data:
     - ${allStations.length} stations (45 total: water, air, soil mix across all 16 districts)
     - ${envDataList.length} environment data records
     - ${alertsList.length} alerts (generated from threshold violations)
     - 4 users (1 admin, 2 staff, 1 viewer)
     - ${thresholds.length} thresholds
     - 3 provinces (Vĩnh Long, Trà Vinh, Bến Tre)
     - 24 districts and communes
    
    📌 Alert Statistics:
     - Critical alerts: 5 (high pollution)
     - Warning alerts: ${alertsList.filter(a => a.type === 'warning').length} 
     - Resolved alerts: ${alertsList.filter(a => a.isResolved).length}
     - Unresolved alerts: ${alertsList.filter(a => !a.isResolved).length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
