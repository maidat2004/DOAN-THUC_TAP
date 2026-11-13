const dotenv = require('dotenv');
const connectDB = require('../config/database');
const Province = require('../models/Province');
const District = require('../models/District');
const Commune = require('../models/Commune');
const Station = require('../models/Station');

dotenv.config();

const DISTRICT_METADATA = {
  // Vĩnh Long
  VL01: { name: 'Thành phố Vĩnh Long', lat: 10.2539, lng: 105.9597 },
  VL02: { name: 'Bình Minh', lat: 10.0833, lng: 105.6667 },
  VL03: { name: 'Bình Tân', lat: 10.3, lng: 105.9 },
  VL04: { name: 'Long Hồ', lat: 10.3167, lng: 105.85 },
  VL05: { name: 'Mang Thít', lat: 10.15, lng: 105.85 },
  VL06: { name: 'Tam Bình', lat: 10.3667, lng: 105.9167 },
  VL07: { name: 'Trà Ôn', lat: 10.05, lng: 105.9167 },
  VL08: { name: 'Vũng Liêm', lat: 10.35, lng: 106.05 },

  // Trà Vinh
  TV01: { name: 'TP. Trà Vinh', lat: 9.9377, lng: 106.34 },
  TV02: { name: 'Càng Long', lat: 9.9974, lng: 106.2047 },
  TV03: { name: 'Tiểu Cần', lat: 9.8177, lng: 106.1923 },
  TV04: { name: 'Châu Thành', lat: 9.8852, lng: 106.3293 },
  TV05: { name: 'Cầu Kè', lat: 9.8711, lng: 106.0605 },
  TV06: { name: 'Cầu Ngang', lat: 9.7947, lng: 106.4515 },
  TV07: { name: 'Trà Cú', lat: 9.6865, lng: 106.2597 },
  TV08: { name: 'Duyên Hải', lat: 9.6621, lng: 106.5179 },
  TV09: { name: 'Thị xã Duyên Hải', lat: 9.6374, lng: 106.4963 },

  // Bến Tre
  BT01: { name: 'TP. Bến Tre', lat: 10.2373, lng: 106.3813 },
  BT02: { name: 'Giồng Trôm', lat: 10.1589, lng: 106.5036 },
  BT03: { name: 'Mỏ Cày Nam', lat: 10.0711, lng: 106.3585 },
  BT04: { name: 'Châu Thành', lat: 10.2899, lng: 106.3029 },
  BT05: { name: 'Chợ Lách', lat: 10.2606, lng: 106.1210 },
  BT06: { name: 'Mỏ Cày Bắc', lat: 10.1671, lng: 106.2917 },
  BT07: { name: 'Bình Đại', lat: 10.1868, lng: 106.6936 },
  BT08: { name: 'Ba Tri', lat: 10.0729, lng: 106.5977 },
  BT09: { name: 'Thạnh Phú', lat: 9.9321, lng: 106.5610 },
};

const STATION_OFFSET_BY_SUFFIX = {
  W01: { lat: 0, lng: 0 },
  A01: { lat: 0.0012, lng: 0.0012 },
  S01: { lat: -0.0012, lng: 0.0008 },
  W02: { lat: 0.0013, lng: -0.0013 },
};

const round6 = (num) => Number(num.toFixed(6));
const getProvinceCodeFromDistrictCode = (districtCode = '') => districtCode.slice(0, 2);

const getStationCoordinates = (districtCode, stationCode) => {
  const base = DISTRICT_METADATA[districtCode];
  if (!base) return null;

  const suffix = stationCode.split('-')[1] || 'W01';
  const offset = STATION_OFFSET_BY_SUFFIX[suffix] || { lat: 0, lng: 0 };

  return {
    latitude: round6(base.lat + offset.lat),
    longitude: round6(base.lng + offset.lng),
  };
};

const fixStationLocations = async () => {
  try {
    await connectDB();

    const districtCodes = Object.keys(DISTRICT_METADATA);

    const provinces = await Province.find({ code: { $in: ['VL', 'TV', 'BT'] } });
    const districts = await District.find({ code: { $in: districtCodes } });
    const communes = await Commune.find({ province: { $in: provinces.map((p) => p._id) } });

    const provinceByCode = new Map(provinces.map((p) => [p.code, p]));
    const districtByCode = new Map(districts.map((d) => [d.code, d]));

    const communeByProvinceCode = new Map();
    for (const province of provinces) {
      const commune = communes.find((c) => String(c.province) === String(province._id));
      if (commune) {
        communeByProvinceCode.set(province.code, commune._id);
      }
    }

    let updatedDistricts = 0;
    let createdDistricts = 0;
    for (const [districtCode, metadata] of Object.entries(DISTRICT_METADATA)) {
      const provinceCode = getProvinceCodeFromDistrictCode(districtCode);
      const province = provinceByCode.get(provinceCode);
      if (!province) continue;

      const district = districtByCode.get(districtCode);

      if (district) {
        district.name = metadata.name;
        district.province = province._id;
        district.coordinates = {
          latitude: metadata.lat,
          longitude: metadata.lng,
        };
        await district.save();
        updatedDistricts++;
        continue;
      }

      const createdDistrict = await District.create({
        code: districtCode,
        name: metadata.name,
        province: province._id,
        coordinates: {
          latitude: metadata.lat,
          longitude: metadata.lng,
        },
      });
      districtByCode.set(districtCode, createdDistrict);
      createdDistricts++;
    }

    const communeByDistrictCode = new Map();
    let createdCommunes = 0;

    for (const [districtCode, district] of districtByCode.entries()) {
      if (!DISTRICT_METADATA[districtCode]) continue;

      const existingCommune = communes.find((c) => String(c.district) === String(district._id));
      if (existingCommune) {
        communeByDistrictCode.set(districtCode, existingCommune._id);
        continue;
      }

      const defaultCommune = await Commune.create({
        code: `${districtCode}-01`,
        name: `Trung tâm ${district.name}`,
        district: district._id,
        province: district.province,
        coordinates: district.coordinates,
      });

      communes.push(defaultCommune);
      communeByDistrictCode.set(districtCode, defaultCommune._id);
      createdCommunes++;
    }

    const stations = await Station.find({
      isActive: true,
      code: /^(VL|TV|BT)\d{2}-/,
    });

    let updatedStations = 0;
    let skippedStations = 0;

    for (const station of stations) {
      const districtCode = station.code.split('-')[0];
      const provinceCode = districtCode.slice(0, 2);

      const coords = getStationCoordinates(districtCode, station.code);
      const district = districtByCode.get(districtCode);
      const province = provinceByCode.get(provinceCode);

      if (!coords || !district || !province) {
        skippedStations++;
        continue;
      }

      const updateData = {
        coordinates: coords,
        district: district._id,
        province: province._id,
      };

      const communeId = communeByDistrictCode.get(districtCode) || communeByProvinceCode.get(provinceCode);
      if (communeId) {
        updateData.commune = communeId;
      }

      await Station.updateOne({ _id: station._id }, { $set: updateData });
      updatedStations++;
    }

    console.log('✅ Đã cập nhật vị trí điểm quan trắc thành công!');
    console.log(`- Districts updated: ${updatedDistricts}`);
    console.log(`- Districts created: ${createdDistricts}`);
    console.log(`- Communes created: ${createdCommunes}`);
    console.log(`- Stations updated: ${updatedStations}`);
    console.log(`- Stations skipped: ${skippedStations}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật vị trí điểm quan trắc:', error);
    process.exit(1);
  }
};

fixStationLocations();
