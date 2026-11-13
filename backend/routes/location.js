const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes untuk GET
router.get('/provinces', locationController.getProvinces);
router.get('/districts/:provinceId', locationController.getDistrictsByProvince);
router.get('/communes/:districtId', locationController.getCommunesByDistrict);

// Protected routes untuk POST/PUT
router.use(authenticate);

router.post('/provinces', authorize('admin'), locationController.createProvince);
router.post('/districts', authorize('admin'), locationController.createDistrict);
router.post('/communes', authorize('admin'), locationController.createCommune);

module.exports = router;
