const express = require('express');
const router = express.Router();
const thresholdController = require('../controllers/thresholdController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Bộ ngưỡng chuẩn tham chiếu
router.get('/standards', thresholdController.getStandardThresholds);
router.post('/standards/apply', authorize('admin'), thresholdController.applyStandardThresholds);

// Lấy danh sách ngưỡng (tất cả)
router.get('/', thresholdController.getThresholds);

// Tạo ngưỡng (admin và staff)
router.post('/', authorize('admin', 'staff'), thresholdController.createThreshold);

// Chi tiết, cập nhật, xóa (admin)
router.get('/:id', thresholdController.getThresholdById);
router.put('/:id', authorize('admin'), thresholdController.updateThreshold);
router.delete('/:id', authorize('admin'), thresholdController.deleteThreshold);

module.exports = router;
