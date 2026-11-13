const fs = require('fs');
const path = require('path');
const ReportFile = require('../models/ReportFile');
const ReportSchedule = require('../models/ReportSchedule');
const User = require('../models/User');
const { generateReportFile } = require('../services/reportGenerator');
const { scheduleReportJob, removeReportJob } = require('../services/reportScheduler');

const isValidTime = (time) => /^\d{2}:\d{2}$/.test(time || '');

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

exports.exportReport = async (req, res, next) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.body;

    if (!['pdf', 'xlsx'].includes(format)) {
      return res.status(400).json({ message: 'Định dạng báo cáo không hợp lệ' });
    }

    const parsedStart = parseDateValue(startDate);
    const parsedEnd = parseDateValue(endDate);

    if (!parsedStart || !parsedEnd) {
      return res.status(400).json({ message: 'Vui lòng chọn khoảng thời gian hợp lệ' });
    }

    let companyScope = null;
    if (req.user?.role === 'staff') {
      const currentUser = await User.findById(req.user.userId).select('company');
      const normalizedCompany = currentUser?.company?.trim();

      if (!normalizedCompany) {
        return res.status(400).json({
          message: 'Tài khoản nhân viên chưa được gán công ty nên chưa thể xuất báo cáo',
        });
      }

      companyScope = normalizedCompany;
    }

    const reportFile = await generateReportFile({
      startDate: parsedStart,
      endDate: parsedEnd,
      format,
      periodType: 'manual',
      createdBy: req.user.userId,
      companyScope,
    });

    res.status(201).json({
      message: 'Xuất báo cáo thành công',
      data: reportFile,
    });
  } catch (error) {
    next(error);
  }
};

exports.listReportFiles = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user?.role !== 'admin') {
      filter.createdBy = req.user.userId;
    }

    const files = await ReportFile.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email')
      .populate('schedule', 'name frequency');

    res.status(200).json({
      message: 'Lấy danh sách báo cáo thành công',
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadReportFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reportFile = await ReportFile.findById(id);

    if (!reportFile) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = reportFile.createdBy && String(reportFile.createdBy) === String(req.user?.userId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Bạn chỉ được tải báo cáo do chính bạn tạo' });
    }

    const absolutePath = path.join(__dirname, '..', reportFile.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Tệp báo cáo không tồn tại' });
    }

    res.download(absolutePath, reportFile.name);
  } catch (error) {
    next(error);
  }
};

exports.listSchedules = async (req, res, next) => {
  try {
    const schedules = await ReportSchedule.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      message: 'Lấy danh sách lịch xuất báo cáo thành công',
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const { name, frequency, time, dayOfWeek, dayOfMonth, format = 'pdf' } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ message: 'Tần suất không hợp lệ' });
    }

    if (!isValidTime(time)) {
      return res.status(400).json({ message: 'Giờ chạy không hợp lệ (HH:mm)' });
    }

    if (frequency === 'weekly' && (dayOfWeek === undefined || dayOfWeek === null)) {
      return res.status(400).json({ message: 'Vui lòng chọn thứ trong tuần' });
    }

    if (frequency === 'weekly' && (Number(dayOfWeek) < 0 || Number(dayOfWeek) > 6)) {
      return res.status(400).json({ message: 'Thứ trong tuần không hợp lệ' });
    }

    if (frequency === 'monthly' && (dayOfMonth === undefined || dayOfMonth === null)) {
      return res.status(400).json({ message: 'Vui lòng chọn ngày trong tháng' });
    }

    if (frequency === 'monthly' && (Number(dayOfMonth) < 1 || Number(dayOfMonth) > 28)) {
      return res.status(400).json({ message: 'Ngày trong tháng không hợp lệ' });
    }

    if (!['pdf', 'xlsx'].includes(format)) {
      return res.status(400).json({ message: 'Định dạng báo cáo không hợp lệ' });
    }

    const schedule = await ReportSchedule.create({
      name: name || `Lịch ${frequency} (${format.toUpperCase()})`,
      frequency,
      time,
      dayOfWeek: frequency === 'weekly' ? Number(dayOfWeek) : undefined,
      dayOfMonth: frequency === 'monthly' ? Number(dayOfMonth) : undefined,
      format,
      createdBy: req.user.userId,
      isActive: true,
    });

    scheduleReportJob(schedule);

    res.status(201).json({
      message: 'Tạo lịch xuất báo cáo thành công',
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await ReportSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch xuất báo cáo' });
    }

    schedule.isActive = !schedule.isActive;
    await schedule.save();

    if (schedule.isActive) {
      scheduleReportJob(schedule);
    } else {
      removeReportJob(schedule._id);
    }

    res.status(200).json({
      message: 'Cập nhật trạng thái lịch xuất báo cáo thành công',
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await ReportSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch xuất báo cáo' });
    }

    removeReportJob(id);

    res.status(200).json({
      message: 'Xóa lịch xuất báo cáo thành công',
    });
  } catch (error) {
    next(error);
  }
};
