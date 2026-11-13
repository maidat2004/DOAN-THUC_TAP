const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Lấy danh sách và tạo dữ liệu
router.get('/', dataController.getEnvironmentData);
router.post('/', authorize('staff'), dataController.createEnvironmentData);

// Thống kê
router.get('/statistics', dataController.getDataStatistics);

// Chi tiết, cập nhật, xóa dữ liệu
router.get('/:id', dataController.getEnvironmentDataById);
router.put('/:id', authorize('staff'), dataController.updateEnvironmentData);
router.delete('/:id', authorize('admin'), dataController.deleteEnvironmentData);

// Submit & Approve report
router.post('/:id/submit', authorize('staff'), dataController.submitReport);
router.put('/:id/approve', authorize('admin'), dataController.approveReport);
router.put('/:id/reject', authorize('admin'), dataController.rejectReport);

module.exports = router;
