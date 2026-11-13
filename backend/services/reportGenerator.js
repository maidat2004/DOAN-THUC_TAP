const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const EnvironmentData = require('../models/EnvironmentData');
const Alert = require('../models/Alert');
const ReportFile = require('../models/ReportFile');

const REPORT_DIR = path.join(__dirname, '..', 'uploads', 'reports');
const MAX_PDF_ROWS = 200;

const REGULAR_FONT_CANDIDATES = [
  process.env.REPORT_FONT_PATH,
  path.join(__dirname, '..', 'assets', 'fonts', 'NotoSans-Regular.ttf'),
  path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
  'C:\\Windows\\Fonts\\arial.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/Library/Fonts/Arial Unicode.ttf',
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
].filter(Boolean);

const BOLD_FONT_CANDIDATES = [
  process.env.REPORT_BOLD_FONT_PATH,
  path.join(__dirname, '..', 'assets', 'fonts', 'NotoSans-Bold.ttf'),
  path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'),
  'C:\\Windows\\Fonts\\arialbd.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/Library/Fonts/Arial Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
].filter(Boolean);

const TYPE_LABELS = {
  water: 'Nước',
  air: 'Không khí',
  soil: 'Đất',
};

const STATUS_LABELS = {
  draft: 'Nháp',
  submitted: 'Đã gửi',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const ensureReportDirectory = () => {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
};

const resolveExistingFont = (candidates = []) => {
  return candidates.find((fontPath) => {
    try {
      return !!fontPath && fs.existsSync(fontPath);
    } catch (error) {
      return false;
    }
  });
};

const resolvePdfFonts = () => {
  const regular = resolveExistingFont(REGULAR_FONT_CANDIDATES);
  const bold = resolveExistingFont(BOLD_FONT_CANDIDATES);
  return { regular, bold: bold || regular };
};

const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('vi-VN');
};

const formatDateOnly = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return 'Không giới hạn';
  const startLabel = startDate ? formatDateOnly(startDate) : '...';
  const endLabel = endDate ? formatDateOnly(endDate) : '...';
  return `${startLabel} - ${endLabel}`;
};

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  return value;
};

const getPeriodRange = (frequency) => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (frequency === 'daily') {
    startDate.setDate(endDate.getDate() - 1);
  } else if (frequency === 'weekly') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (frequency === 'monthly') {
    startDate.setMonth(endDate.getMonth() - 1);
  }

  return { startDate, endDate };
};

const buildFilter = (startDate, endDate, companyScope = null) => {
  const filter = {};

  if (companyScope) {
    filter.company = companyScope;
  }

  if (startDate || endDate) {
    filter.measurementDate = {};
    if (startDate) filter.measurementDate.$gte = startDate;
    if (endDate) filter.measurementDate.$lte = endDate;
  }
  return filter;
};

const buildSummary = (records) => {
  const summary = {
    total: records.length,
    byType: { water: 0, air: 0, soil: 0 },
    byStatus: { draft: 0, submitted: 0, approved: 0, rejected: 0 },
  };

  records.forEach((record) => {
    if (record.type && summary.byType[record.type] !== undefined) {
      summary.byType[record.type] += 1;
    }
    if (record.status && summary.byStatus[record.status] !== undefined) {
      summary.byStatus[record.status] += 1;
    }
  });

  return summary;
};

const buildAlertSummary = async (startDate, endDate, companyScope = null) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = startDate;
    if (endDate) filter.createdAt.$lte = endDate;
  }

  if (companyScope) {
    const scopedRecords = await EnvironmentData.find(
      buildFilter(startDate, endDate, companyScope)
    ).select('_id');

    if (!scopedRecords.length) {
      return {
        total: 0,
        warning: 0,
        critical: 0,
        resolved: 0,
        unresolved: 0,
      };
    }

    filter.environmentData = {
      $in: scopedRecords.map((record) => record._id),
    };
  }

  const alerts = await Alert.find(filter);
  const summary = {
    total: alerts.length,
    warning: 0,
    critical: 0,
    resolved: 0,
    unresolved: 0,
  };

  alerts.forEach((alert) => {
    if (alert.type === 'warning') summary.warning += 1;
    if (alert.type === 'critical') summary.critical += 1;
    if (alert.isResolved) summary.resolved += 1;
    else summary.unresolved += 1;
  });

  return summary;
};

const buildIndicatorText = (record) => {
  if (!record) return '';
  if (record.type === 'water') {
    const water = record.water || {};
    return `pH: ${formatNumber(water.ph)} | DO: ${formatNumber(water.do_level)} mg/L | Nhiệt độ: ${formatNumber(water.temperature)} °C | Độ đục: ${formatNumber(water.turbidity)} NTU | Độ dẫn: ${formatNumber(water.conductivity)} µS/cm`;
  }
  if (record.type === 'air') {
    const air = record.air || {};
    return `PM2.5: ${formatNumber(air.pm25)} µg/m³ | PM10: ${formatNumber(air.pm10)} µg/m³ | CO2: ${formatNumber(air.co2)} ppm | Nhiệt độ: ${formatNumber(air.temperature)} °C | Độ ẩm: ${formatNumber(air.humidity)} %`;
  }
  if (record.type === 'soil') {
    const soil = record.soil || {};
    return `pH: ${formatNumber(soil.ph)} | Ẩm: ${formatNumber(soil.moisture)} % | N: ${formatNumber(soil.nitrogen)} mg/kg | P: ${formatNumber(soil.phosphorus)} mg/kg | K: ${formatNumber(soil.potassium)} mg/kg | Hữu cơ: ${formatNumber(soil.organicMatter)} %`;
  }
  return '';
};

const generatePdfReport = async ({ filePath, summary, alertSummary, records, startDate, endDate }) => {
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);
    const { regular, bold } = resolvePdfFonts();

    if (regular) {
      doc.registerFont('vi-regular', regular);
    }
    if (bold) {
      doc.registerFont('vi-bold', bold);
    }

    const regularFont = regular ? 'vi-regular' : 'Helvetica';
    const boldFont = bold ? 'vi-bold' : regularFont;

    doc.pipe(stream);

    doc.font(boldFont).fontSize(18).text('BÁO CÁO QUAN TRẮC MÔI TRƯỜNG', { align: 'center' });
    doc.moveDown();

    doc.font(regularFont).fontSize(11).text(`Khoảng thời gian: ${formatDateRange(startDate, endDate)}`);
    doc.text(`Ngày xuất: ${formatDateTime(new Date())}`);
    doc.moveDown();

    doc.font(boldFont).fontSize(12).text('TỔNG QUAN', { underline: true });
    doc.font(regularFont).fontSize(11);
    doc.text(`Tổng số bản ghi: ${summary.total}`);
    doc.text(`Theo loại: Nước ${summary.byType.water} | Không khí ${summary.byType.air} | Đất ${summary.byType.soil}`);
    doc.text(`Theo trạng thái: Nháp ${summary.byStatus.draft} | Đã gửi ${summary.byStatus.submitted} | Duyệt ${summary.byStatus.approved} | Từ chối ${summary.byStatus.rejected}`);
    doc.text(`Cảnh báo: Tổng ${alertSummary.total} | Cảnh báo ${alertSummary.warning} | Nguy cấp ${alertSummary.critical} | Đã xử lý ${alertSummary.resolved} | Chưa xử lý ${alertSummary.unresolved}`);

    doc.moveDown();
    doc.font(boldFont).fontSize(12).text('DANH SÁCH BẢN GHI', { underline: true });
    doc.moveDown(0.5);

    records.slice(0, MAX_PDF_ROWS).forEach((record, index) => {
      const line = `${index + 1}. ${formatDateOnly(record.measurementDate)} | ${record.station?.name || '-'} | ${TYPE_LABELS[record.type] || record.type} | ${STATUS_LABELS[record.status] || record.status}`;
      doc.font(regularFont).fontSize(10).text(line);
      const indicatorText = buildIndicatorText(record);
      if (indicatorText) {
        doc.font(regularFont).fontSize(9).fillColor('#555').text(indicatorText);
        doc.fillColor('black');
      }
      doc.moveDown(0.3);
    });

    if (records.length > MAX_PDF_ROWS) {
      doc.moveDown();
      doc.font(regularFont).fontSize(10).text(`... còn ${records.length - MAX_PDF_ROWS} bản ghi chưa hiển thị.`);
    }

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

const generateExcelReport = async ({ filePath, summary, alertSummary, records, startDate, endDate }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Environment Monitoring System';
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['BÁO CÁO QUAN TRẮC MÔI TRƯỜNG']);
  summarySheet.addRow(['Khoảng thời gian', formatDateRange(startDate, endDate)]);
  summarySheet.addRow(['Ngày xuất', formatDateTime(new Date())]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Tổng số bản ghi', summary.total]);
  summarySheet.addRow(['Nước', summary.byType.water]);
  summarySheet.addRow(['Không khí', summary.byType.air]);
  summarySheet.addRow(['Đất', summary.byType.soil]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Nháp', summary.byStatus.draft]);
  summarySheet.addRow(['Đã gửi', summary.byStatus.submitted]);
  summarySheet.addRow(['Đã duyệt', summary.byStatus.approved]);
  summarySheet.addRow(['Từ chối', summary.byStatus.rejected]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Cảnh báo tổng', alertSummary.total]);
  summarySheet.addRow(['Cảnh báo', alertSummary.warning]);
  summarySheet.addRow(['Nguy cấp', alertSummary.critical]);
  summarySheet.addRow(['Đã xử lý', alertSummary.resolved]);
  summarySheet.addRow(['Chưa xử lý', alertSummary.unresolved]);

  const addSheet = (title, columns, rows) => {
    const sheet = workbook.addWorksheet(title);
    sheet.columns = columns;
    if (rows.length === 0) {
      sheet.addRow(['Không có dữ liệu trong kỳ báo cáo']);
      return;
    }
    rows.forEach((row) => sheet.addRow(row));
  };

  const waterRecords = records.filter((record) => record.type === 'water');
  const airRecords = records.filter((record) => record.type === 'air');
  const soilRecords = records.filter((record) => record.type === 'soil');

  addSheet(
    'Water',
    [
      { header: 'Ngày đo', key: 'measurementDate', width: 20 },
      { header: 'Điểm quan trắc', key: 'station', width: 24 },
      { header: 'Mã trạm', key: 'stationCode', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 14 },
      { header: 'Người ghi nhận', key: 'recordedBy', width: 20 },
      { header: 'pH', key: 'ph', width: 10 },
      { header: 'DO (mg/L)', key: 'do_level', width: 12 },
      { header: 'Nhiệt độ (°C)', key: 'temperature', width: 14 },
      { header: 'Độ đục (NTU)', key: 'turbidity', width: 14 },
      { header: 'Độ dẫn (µS/cm)', key: 'conductivity', width: 16 },
      { header: 'Ghi chú', key: 'notes', width: 30 },
    ],
    waterRecords.map((record) => ({
      measurementDate: formatDateTime(record.measurementDate),
      station: record.station?.name || '-',
      stationCode: record.station?.code || '-',
      status: STATUS_LABELS[record.status] || record.status,
      recordedBy: record.recordedBy?.fullName || '-',
      ph: formatNumber(record.water?.ph),
      do_level: formatNumber(record.water?.do_level),
      temperature: formatNumber(record.water?.temperature),
      turbidity: formatNumber(record.water?.turbidity),
      conductivity: formatNumber(record.water?.conductivity),
      notes: record.notes || '',
    }))
  );

  addSheet(
    'Air',
    [
      { header: 'Ngày đo', key: 'measurementDate', width: 20 },
      { header: 'Điểm quan trắc', key: 'station', width: 24 },
      { header: 'Mã trạm', key: 'stationCode', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 14 },
      { header: 'Người ghi nhận', key: 'recordedBy', width: 20 },
      { header: 'PM2.5', key: 'pm25', width: 10 },
      { header: 'PM10', key: 'pm10', width: 10 },
      { header: 'CO2 (ppm)', key: 'co2', width: 12 },
      { header: 'Nhiệt độ (°C)', key: 'temperature', width: 14 },
      { header: 'Độ ẩm (%)', key: 'humidity', width: 12 },
      { header: 'Áp suất (hPa)', key: 'pressure', width: 12 },
      { header: 'Ghi chú', key: 'notes', width: 30 },
    ],
    airRecords.map((record) => ({
      measurementDate: formatDateTime(record.measurementDate),
      station: record.station?.name || '-',
      stationCode: record.station?.code || '-',
      status: STATUS_LABELS[record.status] || record.status,
      recordedBy: record.recordedBy?.fullName || '-',
      pm25: formatNumber(record.air?.pm25),
      pm10: formatNumber(record.air?.pm10),
      co2: formatNumber(record.air?.co2),
      temperature: formatNumber(record.air?.temperature),
      humidity: formatNumber(record.air?.humidity),
      pressure: formatNumber(record.air?.pressure),
      notes: record.notes || '',
    }))
  );

  addSheet(
    'Soil',
    [
      { header: 'Ngày đo', key: 'measurementDate', width: 20 },
      { header: 'Điểm quan trắc', key: 'station', width: 24 },
      { header: 'Mã trạm', key: 'stationCode', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 14 },
      { header: 'Người ghi nhận', key: 'recordedBy', width: 20 },
      { header: 'pH', key: 'ph', width: 10 },
      { header: 'Độ ẩm (%)', key: 'moisture', width: 12 },
      { header: 'Nitơ (mg/kg)', key: 'nitrogen', width: 14 },
      { header: 'Phốt pho (mg/kg)', key: 'phosphorus', width: 16 },
      { header: 'Kali (mg/kg)', key: 'potassium', width: 14 },
      { header: 'Hữu cơ (%)', key: 'organicMatter', width: 12 },
      { header: 'Ghi chú', key: 'notes', width: 30 },
    ],
    soilRecords.map((record) => ({
      measurementDate: formatDateTime(record.measurementDate),
      station: record.station?.name || '-',
      stationCode: record.station?.code || '-',
      status: STATUS_LABELS[record.status] || record.status,
      recordedBy: record.recordedBy?.fullName || '-',
      ph: formatNumber(record.soil?.ph),
      moisture: formatNumber(record.soil?.moisture),
      nitrogen: formatNumber(record.soil?.nitrogen),
      phosphorus: formatNumber(record.soil?.phosphorus),
      potassium: formatNumber(record.soil?.potassium),
      organicMatter: formatNumber(record.soil?.organicMatter),
      notes: record.notes || '',
    }))
  );

  await workbook.xlsx.writeFile(filePath);
};

const generateReportFile = async ({
  startDate,
  endDate,
  format,
  periodType = 'manual',
  createdBy,
  scheduleId,
  companyScope = null,
}) => {
  ensureReportDirectory();

  const filter = buildFilter(startDate, endDate, companyScope);
  const records = await EnvironmentData.find(filter)
    .populate('station', 'name code type')
    .populate('recordedBy', 'fullName email')
    .sort({ measurementDate: -1 });

  const summary = buildSummary(records);
  const alertSummary = await buildAlertSummary(startDate, endDate, companyScope);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safePeriod = periodType || 'manual';
  const extension = format === 'xlsx' ? 'xlsx' : 'pdf';
  const fileName = `bao_cao_${safePeriod}_${timestamp}.${extension}`;
  const absolutePath = path.join(REPORT_DIR, fileName);

  if (extension === 'pdf') {
    await generatePdfReport({
      filePath: absolutePath,
      summary,
      alertSummary,
      records,
      startDate,
      endDate,
    });
  } else {
    await generateExcelReport({
      filePath: absolutePath,
      summary,
      alertSummary,
      records,
      startDate,
      endDate,
    });
  }

  const stat = await fs.promises.stat(absolutePath);
  const reportFile = await ReportFile.create({
    name: fileName,
    format: extension,
    periodType: safePeriod,
    startDate,
    endDate,
    filePath: path.join('uploads', 'reports', fileName),
    fileSize: stat.size,
    createdBy,
    schedule: scheduleId || undefined,
  });

  return reportFile;
};

module.exports = {
  generateReportFile,
  getPeriodRange,
};
