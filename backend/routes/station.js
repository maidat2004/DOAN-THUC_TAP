const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Lấy danh sách và tạo điểm quan trắc
router.get('/', stationController.getAllStations);
router.post('/', authorize('admin', 'staff'), stationController.createStation);

// Chi tiết, cập nhật, xóa điểm quan trắc
router.get('/statistics', stationController.getStationStatistics);
router.get('/:id', stationController.getStationById);
router.put('/:id', authorize('admin', 'staff'), stationController.updateStation);
router.delete('/:id', authorize('admin'), stationController.deleteStation);

module.exports = router;
