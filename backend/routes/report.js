const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/export', authorize('admin', 'staff'), reportController.exportReport);
router.get('/files', authorize('admin', 'staff'), reportController.listReportFiles);
router.get('/files/:id/download', authorize('admin', 'staff'), reportController.downloadReportFile);

router.get('/schedules', authorize('admin'), reportController.listSchedules);
router.post('/schedules', authorize('admin'), reportController.createSchedule);
router.patch('/schedules/:id/toggle', authorize('admin'), reportController.toggleSchedule);
router.delete('/schedules/:id', authorize('admin'), reportController.deleteSchedule);

module.exports = router;
