const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Lấy danh sách cảnh báo - chỉ Admin
router.get('/', authorize('admin'), alertController.getAlerts);

// Thống kê cảnh báo chi tiết - chỉ Admin
router.get('/statistics', authorize('admin'), alertController.getAlertStatistics);

// Lấy cảnh báo theo trạm - chỉ Admin
router.get('/station/:stationId', authorize('admin'), alertController.getAlertsByStation);

// Giải quyết cảnh báo - chỉ Admin
router.put('/:id/resolve', authorize('admin'), alertController.resolveAlert);

module.exports = router;
