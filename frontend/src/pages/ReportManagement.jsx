import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Space, Popconfirm, message, Spin, Card, Row, Col, Badge, Statistic, Select, DatePicker, TimePicker, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined, ReloadOutlined, DownloadOutlined, ScheduleOutlined } from '@ant-design/icons';
import { dataService, thresholdService, reportService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ReportManagement.css';

const statusColorMap = {
  draft: 'gold',
  submitted: 'blue',
  approved: 'green',
  rejected: 'red',
};

const statusConfig = {
  draft: { label: '📝 Nháp', icon: <FileTextOutlined />, color: 'default' },
  submitted: { label: '📤 Đã gửi', icon: <ClockCircleOutlined />, color: 'processing' },
  approved: { label: '✅ Chấp thuận', icon: <CheckCircleOutlined />, color: 'success' },
  rejected: { label: '❌ Từ chối', icon: <CloseCircleOutlined />, color: 'error' },
};

const INDICATOR_CONFIG = {
  water: [
    { key: 'ph', label: 'pH' },
    { key: 'do_level', label: 'DO (Ô xy Hòa Tan)', unit: 'mg/L' },
    { key: 'temperature', label: 'Nhiệt Độ', unit: '°C' },
    { key: 'turbidity', label: 'Độ Đục', unit: 'NTU' },
    { key: 'conductivity', label: 'Độ Dẫn Điện', unit: 'µS/cm' },
  ],
  air: [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³' },
    { key: 'co2', label: 'CO2', unit: 'ppm' },
    { key: 'temperature', label: 'Nhiệt Độ', unit: '°C' },
    { key: 'humidity', label: 'Độ Ẩm', unit: '% RH' },
    { key: 'pressure', label: 'Áp Suất', unit: 'hPa' },
  ],
  soil: [
    { key: 'ph', label: 'pH' },
    { key: 'moisture', label: 'Độ Ẩm', unit: '%' },
    { key: 'nitrogen', label: 'Nitơ', unit: 'mg/kg' },
    { key: 'phosphorus', label: 'Phốt Phô', unit: 'mg/kg' },
    { key: 'potassium', label: 'Kali', unit: 'mg/kg' },
    { key: 'organicMatter', label: 'Chất Hữu Cơ', unit: '%' },
  ],
};

const INDICATOR_LEVEL_STYLES = {
  normal: {
    label: 'Trong ngưỡng',
    bg: '#f6ffed',
    text: '#389e0d',
    border: '#b7eb8f',
  },
  warning: {
    label: 'Gần ngưỡng',
    bg: '#fff7e6',
    text: '#d46b08',
    border: '#ffd591',
  },
  critical: {
    label: 'Vượt ngưỡng',
    bg: '#fff1f0',
    text: '#cf1322',
    border: '#ffa39e',
  },
  noThreshold: {
    label: 'Chưa có ngưỡng',
    bg: '#f5f5f5',
    text: '#595959',
    border: '#d9d9d9',
  },
  noData: {
    label: 'Không có dữ liệu',
    bg: '#fafafa',
    text: '#8c8c8c',
    border: '#d9d9d9',
  },
};

const PERIOD_LABELS = {
  manual: 'Thủ công',
  daily: 'Hằng ngày',
  weekly: 'Hằng tuần',
  monthly: 'Hằng tháng',
};

const FREQUENCY_LABELS = {
  daily: 'Hằng ngày',
  weekly: 'Hằng tuần',
  monthly: 'Hằng tháng',
};

const WEEKDAY_LABELS = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

export const ReportManagement = () => {
  const { user } = useAuth();
  const canExportReports = ['admin', 'staff'].includes(user?.role);
  const canManageSchedules = user?.role === 'admin';
  const { RangePicker } = DatePicker;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [approvalForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [actionType, setActionType] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [thresholdMap, setThresholdMap] = useState({});
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [reportFiles, setReportFiles] = useState([]);
  const [reportSchedules, setReportSchedules] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [reportFilesLoading, setReportFilesLoading] = useState(false);
  const [reportSchedulesLoading, setReportSchedulesLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (canExportReports) {
      loadReportFiles();
    }

    if (canManageSchedules) {
      loadReportSchedules();
    }
  }, [canExportReports, canManageSchedules]);

  useEffect(() => {
    const handleFocus = () => loadReports();
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      loadReports();
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, typeFilter, searchText, data]);

  useEffect(() => {
    if (detailVisible && detailRecord?.type) {
      loadThresholds(detailRecord.type);
    }
  }, [detailVisible, detailRecord?.type]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await dataService.getEnvironmentData();
      const reportData = res.data.data || [];
      setData(reportData);
    } catch (error) {
      message.error('Lỗi tải báo cáo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buildThresholdMap = (thresholds = []) => {
    return thresholds.reduce((acc, threshold) => {
      if (threshold?.indicator) {
        acc[threshold.indicator] = threshold;
      }
      return acc;
    }, {});
  };

  const loadThresholds = async (type) => {
    try {
      setThresholdLoading(true);
      setThresholdMap({});
      const res = await thresholdService.getThresholds(type);
      const thresholds = res.data.data || [];
      setThresholdMap(buildThresholdMap(thresholds));
    } catch (error) {
      message.error('Lỗi tải ngưỡng: ' + error.message);
    } finally {
      setThresholdLoading(false);
    }
  };

  const loadReportFiles = async () => {
    try {
      setReportFilesLoading(true);
      const res = await reportService.getFiles();
      setReportFiles(res.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách báo cáo: ' + error.message);
    } finally {
      setReportFilesLoading(false);
    }
  };

  const loadReportSchedules = async () => {
    try {
      setReportSchedulesLoading(true);
      const res = await reportService.getSchedules();
      setReportSchedules(res.data.data || []);
    } catch (error) {
      message.error('Lỗi tải lịch xuất báo cáo: ' + error.message);
    } finally {
      setReportSchedulesLoading(false);
    }
  };

  const formatFileSize = (size) => {
    if (size === null || size === undefined) return '-';
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDateRangeLabel = (startDate, endDate) => {
    if (!startDate && !endDate) return 'Không giới hạn';
    const startLabel = startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '...';
    const endLabel = endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '...';
    return `${startLabel} - ${endLabel}`;
  };

  const getScheduleDayLabel = (schedule) => {
    if (schedule.frequency === 'weekly') {
      return WEEKDAY_LABELS[schedule.dayOfWeek] || '-';
    }
    if (schedule.frequency === 'monthly') {
      return `Ngày ${schedule.dayOfMonth}`;
    }
    return '-';
  };

  const handleManualExport = async (values) => {
    try {
      setExporting(true);
      const [start, end] = values.dateRange || [];
      const payload = {
        format: values.format,
        startDate: start?.startOf('day').toISOString(),
        endDate: end?.endOf('day').toISOString(),
      };
      await reportService.exportReport(payload);
      message.success('Xuất báo cáo thành công');
      exportForm.resetFields();
      loadReportFiles();
    } catch (error) {
      message.error('Lỗi xuất báo cáo: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleCreateSchedule = async (values) => {
    try {
      setScheduleSaving(true);
      const payload = {
        name: values.name,
        frequency: values.frequency,
        time: values.time?.format('HH:mm'),
        format: values.format,
      };

      if (values.frequency === 'weekly') {
        payload.dayOfWeek = values.dayOfWeek;
      }

      if (values.frequency === 'monthly') {
        payload.dayOfMonth = values.dayOfMonth;
      }

      await reportService.createSchedule(payload);
      message.success('Tạo lịch xuất báo cáo thành công');
      scheduleForm.resetFields();
      loadReportSchedules();
    } catch (error) {
      message.error('Lỗi tạo lịch: ' + error.message);
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleToggleSchedule = async (scheduleId) => {
    try {
      await reportService.toggleSchedule(scheduleId);
      message.success('Cập nhật lịch xuất báo cáo thành công');
      loadReportSchedules();
    } catch (error) {
      message.error('Lỗi cập nhật lịch: ' + error.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await reportService.deleteSchedule(scheduleId);
      message.success('Xóa lịch xuất báo cáo thành công');
      loadReportSchedules();
    } catch (error) {
      message.error('Lỗi xóa lịch: ' + error.message);
    }
  };

  const handleDownloadFile = async (record) => {
    try {
      const res = await reportService.downloadFile(record._id);
      const mimeType = record.format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.name || `bao_cao.${record.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Lỗi tải báo cáo: ' + error.message);
    }
  };

  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '-';
    }
    if (typeof value === 'number') {
      return value.toFixed(decimals);
    }
    return value;
  };

  const getIndicatorStatus = (indicator, value) => {
    const numericValue = Number(value);
    if (value === null || value === undefined || Number.isNaN(numericValue)) {
      return INDICATOR_LEVEL_STYLES.noData;
    }

    const threshold = thresholdMap[indicator];
    const minValue = Number(threshold?.minValue);
    const maxValue = Number(threshold?.maxValue);

    if (!threshold || Number.isNaN(minValue) || Number.isNaN(maxValue)) {
      return INDICATOR_LEVEL_STYLES.noThreshold;
    }

    if (numericValue < minValue || numericValue > maxValue) {
      return INDICATOR_LEVEL_STYLES.critical;
    }

    const range = maxValue - minValue;
    if (range > 0) {
      const margin = range * 0.1; // 10% biên ngưỡng
      if (numericValue <= minValue + margin || numericValue >= maxValue - margin) {
        return INDICATOR_LEVEL_STYLES.warning;
      }
    }

    return INDICATOR_LEVEL_STYLES.normal;
  };

  const renderLegendChip = (label, style) => (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );

  const renderIndicatorCard = (indicator, value) => {
    const status = getIndicatorStatus(indicator.key, value);

    return (
      <Col xs={24} sm={12} key={indicator.key}>
        <div
          style={{
            padding: '8px',
            backgroundColor: status.bg,
            border: `1px solid ${status.border}`,
            borderRadius: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#555', fontSize: '12px', fontWeight: '500' }}>{indicator.label}</div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: status.text }}>{status.label}</span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: status.text, margin: '4px 0' }}>
            {formatValue(value)}
            {indicator.unit && (
              <span style={{ fontSize: '12px', fontWeight: 'normal' }}> {indicator.unit}</span>
            )}
          </p>
        </div>
      </Col>
    );
  };

  const applyFilters = () => {
    let filtered = data;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (searchText) {
      filtered = filtered.filter(item =>
        item.station?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleSubmitReport = (record) => {
    Modal.confirm({
      title: 'Xác Nhận Gửi',
      content: 'Bạn có chắc chắn muốn gửi báo cáo này? Sau khi gửi, báo cáo sẽ chờ duyệt từ Admin.',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dataService.submitReport(record._id);
          message.success('Gửi báo cáo thành công!');
          loadReports();
        } catch (error) {
          message.error('Lỗi: ' + error.message);
        }
      },
    });
  };

  const handleApproveClick = (record) => {
    setSelectedRecord(record);
    setActionType('approve');
    setModalVisible(true);
  };

  const handleRejectClick = (record) => {
    setSelectedRecord(record);
    setActionType('reject');
    setModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleApprovalSubmit = async (values) => {
    try {
      if (actionType === 'approve') {
        await dataService.approveReport(selectedRecord._id, values);
        message.success('Phê duyệt báo cáo thành công!');
      } else {
        await dataService.rejectReport(selectedRecord._id, values);
        message.success('Từ chối báo cáo thành công!');
      }
      setModalVisible(false);
      approvalForm.resetFields();
      loadReports();
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const getTypeLabel = (type) => {
    const map = { water: '💧 Nước', air: '💨 Không khí', soil: '🌱 Đất' };
    return map[type] || type;
  };

  const getTypeColor = (type) => {
    const map = { water: 'blue', air: 'cyan', soil: 'green' };
    return map[type] || 'default';
  };

  const getPeriodLabel = (periodType) => {
    return PERIOD_LABELS[periodType] || periodType;
  };

  const getFrequencyLabel = (frequency) => {
    return FREQUENCY_LABELS[frequency] || frequency;
  };

  const getFormatColor = (format) => {
    return format === 'pdf' ? 'volcano' : 'green';
  };

  const weekdayOptions = WEEKDAY_LABELS.map((label, index) => ({
    label,
    value: index,
  }));

  const monthDayOptions = Array.from({ length: 28 }, (_, index) => ({
    label: `Ngày ${index + 1}`,
    value: index + 1,
  }));

  const columns = [
    {
      title: 'Điểm Quan Trắc',
      dataIndex: ['station', 'name'],
      key: 'station',
      width: '15%',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type) => <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>,
    },
    {
      title: 'Ngày Đo',
      dataIndex: 'measurementDate',
      key: 'recordedDate',
      width: '12%',
      render: (_, record) => {
        const dateValue = record.measurementDate || record.recordedDate;
        return dateValue ? new Date(dateValue).toLocaleDateString('vi-VN') : '-';
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status) => (
        <Tag color={statusColorMap[status]}>
          {statusConfig[status].label}
        </Tag>
      ),
    },
    {
      title: 'Người Gửi',
      dataIndex: ['recordedBy', 'fullName'],
      key: 'recordedBy',
      width: '12%',
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      width: '15%',
      render: (notes) => notes ? notes.substring(0, 30) + '...' : '-',
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: '18%',
      render: (_, record) => (
        <Space size="small" wrap>
          {user?.role === 'staff' && record.status === 'draft' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSubmitReport(record)}
            >
              Gửi
            </Button>
          )}

          {user?.role === 'admin' && record.status === 'submitted' && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApproveClick(record)}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleRejectClick(record)}
              >
                Từ chối
              </Button>
            </>
          )}

          <Button type="link" size="small" onClick={() => handleViewDetails(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const scheduleColumns = [
    {
      title: 'Tên lịch',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency) => getFrequencyLabel(frequency),
    },
    {
      title: 'Giờ chạy',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Ngày chạy',
      key: 'runDay',
      render: (_, record) => getScheduleDayLabel(record),
    },
    {
      title: 'Định dạng',
      dataIndex: 'format',
      key: 'format',
      render: (format) => <Tag color={getFormatColor(format)}>{format.toUpperCase()}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang chạy' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Chạy gần nhất',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : '-'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => handleToggleSchedule(record._id)}>
            {record.isActive ? 'Tạm dừng' : 'Kích hoạt'}
          </Button>
          <Popconfirm
            title="Xóa lịch xuất báo cáo này?"
            onConfirm={() => handleDeleteSchedule(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reportFileColumns = [
    {
      title: 'Tên tệp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Định dạng',
      dataIndex: 'format',
      key: 'format',
      render: (format) => <Tag color={getFormatColor(format)}>{format.toUpperCase()}</Tag>,
    },
    {
      title: 'Kỳ báo cáo',
      dataIndex: 'periodType',
      key: 'periodType',
      render: (periodType) => getPeriodLabel(periodType),
    },
    {
      title: 'Khoảng thời gian',
      key: 'range',
      render: (_, record) => formatDateRangeLabel(record.startDate, record.endDate),
    },
    {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdBy',
    },
    {
      title: 'Dung lượng',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => formatFileSize(size),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : '-'),
    },
    {
      title: 'Tải xuống',
      key: 'download',
      render: (_, record) => (
        <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownloadFile(record)}>
          Tải xuống
        </Button>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: data.length,
    draft: data.filter(d => d.status === 'draft').length,
    submitted: data.filter(d => d.status === 'submitted').length,
    approved: data.filter(d => d.status === 'approved').length,
    rejected: data.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="report-management-container">
      <Card
        title={<span><FileTextOutlined /> Quản Lý Báo Cáo</span>}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadReports}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Báo Cáo"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nháp"
                value={stats.draft}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chờ Duyệt"
                value={stats.submitted}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã Duyệt"
                value={stats.approved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="Tìm kiếm theo tên điểm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: '📝 Nháp', value: 'draft' },
                { label: '📤 Đã gửi', value: 'submitted' },
                { label: '✅ Chấp thuận', value: 'approved' },
                { label: '❌ Từ chối', value: 'rejected' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả loại', value: 'all' },
                { label: '💧 Nước', value: 'water' },
                { label: '💨 Không khí', value: 'air' },
                { label: '🌱 Đất', value: 'soil' },
              ]}
            />
          </Col>
        </Row>

        {/* User Info */}
        {user && (
          <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f6f8fb' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} lg={6}>
                <div>
                  <small style={{ color: '#999' }}>Người dùng</small>
                  <p style={{ fontWeight: 'bold', margin: '4px 0' }}>{user.fullName}</p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <div>
                  <small style={{ color: '#999' }}>Vai trò</small>
                  <p style={{ fontWeight: 'bold', margin: '4px 0' }}>
                    {user.role === 'admin' ? '👨‍💼 Admin' : user.role === 'staff' ? '👤 Nhân viên' : '👁️ Xem'}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={12}>
                <div>
                  <small style={{ color: '#999' }}>Công ty</small>
                  <p style={{ fontWeight: 'bold', margin: '4px 0' }}>{user.company || 'Tổng hệ thống'}</p>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData.map(item => ({ ...item, key: item._id }))}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1400 }}
            locale={{ emptyText: 'Không có báo cáo' }}
          />
        </Spin>
      </Card>

      {canExportReports && (
        <Card
          title={<span><ScheduleOutlined /> Xuất Báo Cáo Định Kỳ</span>}
          style={{ marginTop: '20px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card type="inner" title="📤 Xuất thủ công">
                <Form
                  form={exportForm}
                  layout="vertical"
                  initialValues={{ format: 'pdf' }}
                  onFinish={handleManualExport}
                >
                  <Form.Item
                    name="dateRange"
                    label="Khoảng thời gian"
                    rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
                  >
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="format"
                    label="Định dạng"
                    rules={[{ required: true, message: 'Vui lòng chọn định dạng' }]}
                  >
                    <Select
                      options={[
                        { label: 'PDF', value: 'pdf' },
                        { label: 'Excel (.xlsx)', value: 'xlsx' },
                      ]}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    htmlType="submit"
                    loading={exporting}
                  >
                    Xuất báo cáo
                  </Button>
                </Form>
              </Card>
            </Col>

            {canManageSchedules && (
              <Col xs={24} lg={12}>
                <Card type="inner" title="🗓️ Lập lịch tự động">
                  <Form
                    form={scheduleForm}
                    layout="vertical"
                    initialValues={{ frequency: 'daily', format: 'pdf' }}
                    onFinish={handleCreateSchedule}
                  >
                    <Form.Item name="name" label="Tên lịch">
                      <Input placeholder="Ví dụ: Báo cáo tuần (PDF)" />
                    </Form.Item>
                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="frequency"
                          label="Tần suất"
                          rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
                        >
                          <Select
                            options={[
                              { label: 'Hằng ngày', value: 'daily' },
                              { label: 'Hằng tuần', value: 'weekly' },
                              { label: 'Hằng tháng', value: 'monthly' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="format"
                          label="Định dạng"
                          rules={[{ required: true, message: 'Vui lòng chọn định dạng' }]}
                        >
                          <Select
                            options={[
                              { label: 'PDF', value: 'pdf' },
                              { label: 'Excel (.xlsx)', value: 'xlsx' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="time"
                      label="Giờ chạy"
                      rules={[{ required: true, message: 'Vui lòng chọn giờ chạy' }]}
                    >
                      <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item dependencies={['frequency']} noStyle>
                      {({ getFieldValue }) => {
                        const frequency = getFieldValue('frequency');
                        if (frequency === 'weekly') {
                          return (
                            <Form.Item
                              name="dayOfWeek"
                              label="Thứ trong tuần"
                              rules={[{ required: true, message: 'Vui lòng chọn thứ' }]}
                            >
                              <Select options={weekdayOptions} />
                            </Form.Item>
                          );
                        }
                        if (frequency === 'monthly') {
                          return (
                            <Form.Item
                              name="dayOfMonth"
                              label="Ngày trong tháng"
                              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                            >
                              <Select options={monthDayOptions} />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={scheduleSaving}
                    >
                      Tạo lịch
                    </Button>
                  </Form>
                </Card>
              </Col>
            )}
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            {canManageSchedules && (
              <Col xs={24} xl={24} xxl={12}>
                <Card type="inner" title="📅 Lịch xuất báo cáo">
                  <Table
                    columns={scheduleColumns}
                    dataSource={reportSchedules.map(item => ({ ...item, key: item._id }))}
                    loading={reportSchedulesLoading}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 980 }}
                    locale={{ emptyText: 'Chưa có lịch xuất báo cáo' }}
                  />
                </Card>
              </Col>
            )}
            <Col xs={24} xl={24} xxl={canManageSchedules ? 12 : 24}>
              <Card type="inner" title="📁 Báo cáo đã xuất">
                <Table
                  columns={reportFileColumns}
                  dataSource={reportFiles.map(item => ({ ...item, key: item._id }))}
                  loading={reportFilesLoading}
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 1050 }}
                  locale={{ emptyText: 'Chưa có báo cáo được xuất' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Approval Modal */}
      <Modal
        title={actionType === 'approve' ? '✅ Phê Duyệt Báo Cáo' : '❌ Từ Chối Báo Cáo'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          approvalForm.resetFields();
        }}
        onOk={() => approvalForm.submit()}
        okText={actionType === 'approve' ? 'Phê Duyệt' : 'Từ Chối'}
        okButtonProps={{
          danger: actionType === 'reject',
        }}
      >
        <Form
          form={approvalForm}
          layout="vertical"
          onFinish={handleApprovalSubmit}
        >
          <Form.Item
            label={actionType === 'approve' ? 'Ghi chú phê duyệt' : 'Lý do từ chối'}
            name={actionType === 'approve' ? 'approvalNotes' : 'rejectionReason'}
            rules={[{ required: true, message: 'Vui lòng nhập thông tin' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder={actionType === 'approve' ? 'Nhập ghi chú phê duyệt...' : 'Nhập lý do từ chối...'}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="📋 Chi Tiết Báo Cáo"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailRecord && (
          <div style={{ paddingTop: '10px' }}>
            {/* Basic Info */}
            <Card title="📍 Thông Tin Cơ Bản" size="small" style={{ marginBottom: '12px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <label style={{ color: '#666', fontSize: '12px' }}>Điểm Quan Trắc</label>
                    <p style={{ fontWeight: 'bold' }}>{detailRecord.station?.name || '-'}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <label style={{ color: '#666', fontSize: '12px' }}>Mã Trạm</label>
                    <p style={{ fontWeight: 'bold' }}>{detailRecord.station?.code || '-'}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <label style={{ color: '#666', fontSize: '12px' }}>Loại Dữ Liệu</label>
                    <p style={{ fontWeight: 'bold' }}>
                      <Tag color={getTypeColor(detailRecord.type)}>
                        {getTypeLabel(detailRecord.type)}
                      </Tag>
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <label style={{ color: '#666', fontSize: '12px' }}>Ngày Đo</label>
                    <p style={{ fontWeight: 'bold' }}>
                      {new Date(detailRecord.measurementDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <label style={{ color: '#666', fontSize: '12px' }}>Trạng Thái</label>
                    <p style={{ fontWeight: 'bold' }}>
                      <Tag color={statusColorMap[detailRecord.status]}>
                        {statusConfig[detailRecord.status]?.label || '-'}
                      </Tag>
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <label style={{ color: '#666', fontSize: '12px' }}>Người Ghi Nhận</label>
                    <p style={{ fontWeight: 'bold' }}>{detailRecord.recordedBy?.fullName || '-'}</p>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Color Legend */}
            <Card
              title="🎨 Chú Thích Màu"
              size="small"
              style={{ marginBottom: '12px', backgroundColor: '#fafafa' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {renderLegendChip('Trong ngưỡng', INDICATOR_LEVEL_STYLES.normal)}
                {renderLegendChip('Gần ngưỡng', INDICATOR_LEVEL_STYLES.warning)}
                {renderLegendChip('Vượt ngưỡng', INDICATOR_LEVEL_STYLES.critical)}
                {renderLegendChip('Chưa có ngưỡng', INDICATOR_LEVEL_STYLES.noThreshold)}
                {renderLegendChip('Không có dữ liệu', INDICATOR_LEVEL_STYLES.noData)}
              </div>
              <div style={{ fontSize: '12px', color: '#777', marginTop: '8px', lineHeight: 1.5 }}>
                <div>• Trong ngưỡng: giá trị nằm giữa Min–Max.</div>
                <div>• Gần ngưỡng: nằm trong 10% biên của Min/Max.</div>
                <div>• Vượt ngưỡng: nhỏ hơn Min hoặc lớn hơn Max.</div>
                <div>• Chưa có ngưỡng: hệ thống chưa cấu hình ngưỡng cho chỉ tiêu.</div>
                <div>• Không có dữ liệu: chỉ tiêu chưa được ghi nhận.</div>
              </div>
              {thresholdLoading && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  Đang tải ngưỡng...
                </div>
              )}
            </Card>

            {/* Water Data */}
            {detailRecord.type === 'water' && detailRecord.water && (
              <Card title="💧 Chỉ Số Nước" size="small" style={{ marginBottom: '12px' }}>
                <Row gutter={[16, 16]}>
                  {INDICATOR_CONFIG.water.map((indicator) =>
                    renderIndicatorCard(indicator, detailRecord.water?.[indicator.key])
                  )}
                </Row>
              </Card>
            )}

            {/* Air Data */}
            {detailRecord.type === 'air' && detailRecord.air && (
              <Card title="💨 Chỉ Số Không Khí" size="small" style={{ marginBottom: '12px' }}>
                <Row gutter={[16, 16]}>
                  {INDICATOR_CONFIG.air.map((indicator) =>
                    renderIndicatorCard(indicator, detailRecord.air?.[indicator.key])
                  )}
                </Row>
              </Card>
            )}

            {/* Soil Data */}
            {detailRecord.type === 'soil' && detailRecord.soil && (
              <Card title="🌱 Chỉ Số Đất" size="small" style={{ marginBottom: '12px' }}>
                <Row gutter={[16, 16]}>
                  {INDICATOR_CONFIG.soil.map((indicator) =>
                    renderIndicatorCard(indicator, detailRecord.soil?.[indicator.key])
                  )}
                </Row>
              </Card>
            )}

            {/* Notes */}
            {detailRecord.notes && (
              <Card title="📝 Ghi Chú" size="small" style={{ marginBottom: '12px' }}>
                <p>{detailRecord.notes}</p>
              </Card>
            )}

            {/* Approval Info */}
            {detailRecord.approvalNotes && (
              <Card title="✅ Ghi Chú Phê Duyệt" size="small" style={{ marginBottom: '12px' }}>
                <p>{detailRecord.approvalNotes}</p>
                {detailRecord.approvedAt && (
                  <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                    Thời gian: {new Date(detailRecord.approvedAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </Card>
            )}

            {detailRecord.rejectionReason && (
              <Card title="❌ Lý Do Từ Chối" size="small" style={{ marginBottom: '12px' }}>
                <p>{detailRecord.rejectionReason}</p>
                {detailRecord.rejectedAt && (
                  <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                    Thời gian: {new Date(detailRecord.rejectedAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </Card>
            )}

            {/* Company Info */}
            {detailRecord.company && (
              <Card title="🏢 Công Ty" size="small">
                <p><strong>Tên Công Ty:</strong> {detailRecord.company}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportManagement;
