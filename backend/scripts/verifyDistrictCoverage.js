const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Province = require('../models/Province');
const District = require('../models/District');
const Commune = require('../models/Commune');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/environment_data_system';
const TARGET_PROVINCES = ['VL', 'TV', 'BT'];

async function main() {
  await mongoose.connect(MONGO_URI);

  const provinces = await Province.find({ code: { $in: TARGET_PROVINCES } })
    .sort({ code: 1 })
    .lean();

  if (!provinces.length) {
    console.log('Không tìm thấy tỉnh mục tiêu (VL/TV/BT) trong database hiện tại.');
  }

  for (const province of provinces) {
    const districts = await District.find({ province: province._id })
      .sort({ code: 1 })
      .select('code name _id')
      .lean();

    console.log(`\n${province.code} (${province.name}) districts: ${districts.length}`);
    console.log(districts.map((d) => `${d.code}:${d.name}`).join(', '));

    for (const district of districts) {
      const communeCount = await Commune.countDocuments({ district: district._id });
      console.log(`- ${district.code} communes: ${communeCount}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('❌ Verification failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
