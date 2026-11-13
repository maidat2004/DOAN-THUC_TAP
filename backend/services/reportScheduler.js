const cron = require('node-cron');
const ReportSchedule = require('../models/ReportSchedule');
const { generateReportFile, getPeriodRange } = require('./reportGenerator');

const jobs = new Map();
const DEFAULT_TIMEZONE = process.env.REPORT_TIMEZONE || 'Asia/Ho_Chi_Minh';

const buildCronExpression = (schedule) => {
  const [hourStr, minuteStr] = (schedule.time || '00:00').split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (schedule.frequency === 'weekly') {
    return `${minute} ${hour} * * ${schedule.dayOfWeek}`;
  }

  if (schedule.frequency === 'monthly') {
    return `${minute} ${hour} ${schedule.dayOfMonth} * *`;
  }

  return `${minute} ${hour} * * *`;
};

const runSchedule = async (scheduleId) => {
  const schedule = await ReportSchedule.findById(scheduleId);
  if (!schedule || !schedule.isActive) {
    return;
  }

  const { startDate, endDate } = getPeriodRange(schedule.frequency);

  await generateReportFile({
    startDate,
    endDate,
    format: schedule.format,
    periodType: schedule.frequency,
    createdBy: schedule.createdBy,
    scheduleId: schedule._id,
  });

  schedule.lastRunAt = new Date();
  await schedule.save();
};

const scheduleReportJob = (schedule) => {
  if (!schedule || !schedule.isActive) return;

  const scheduleId = schedule._id.toString();

  if (jobs.has(scheduleId)) {
    const existingJob = jobs.get(scheduleId);
    existingJob.stop();
    existingJob.destroy();
    jobs.delete(scheduleId);
  }

  const cronExpression = buildCronExpression(schedule);
  const job = cron.schedule(
    cronExpression,
    () => runSchedule(scheduleId),
    { timezone: DEFAULT_TIMEZONE }
  );

  jobs.set(scheduleId, job);
};

const removeReportJob = (scheduleId) => {
  const job = jobs.get(scheduleId.toString());
  if (job) {
    job.stop();
    job.destroy();
    jobs.delete(scheduleId.toString());
  }
};

const initReportScheduler = async () => {
  const schedules = await ReportSchedule.find({ isActive: true });
  schedules.forEach((schedule) => scheduleReportJob(schedule));
};

module.exports = {
  initReportScheduler,
  scheduleReportJob,
  removeReportJob,
};
