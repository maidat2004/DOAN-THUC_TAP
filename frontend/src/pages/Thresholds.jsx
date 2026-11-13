import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Spin, Card, Row, Col, Statistic, InputNumber, Tag, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, AlertOutlined } from '@ant-design/icons';
import { thresholdService } from '../services';
import '../styles/Thresholds.css';

const FALLBACK_INDICATOR_LIBRARY = {
  water: [
    { indicator: 'ph', label: 'pH', unit: '' },
    { indicator: 'do_level', label: 'DO', unit: 'mg/L' },
    { indicator: 'temperature', label: 'Nhiệt độ', unit: '°C' },
  ],
  air: [
    { indicator: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
    { indicator: 'pm10', label: 'PM10', unit: 'µg/m³' },
    { indicator: 'co2', label: 'CO2', unit: 'ppm' },
  ],
  soil: [
    { indicator: 'ph', label: 'pH', unit: '' },
    { indicator: 'moisture', label: 'Độ ẩm', unit: '%' },
  ],
};

const buildIndicatorLibrary = (thresholdList = []) => {
  const normalized = {
    water: [...FALLBACK_INDICATOR_LIBRARY.water],
    air: [...FALLBACK_INDICATOR_LIBRARY.air],
    soil: [...FALLBACK_INDICATOR_LIBRARY.soil],
  };

  const existed = new Set(
    Object.entries(normalized)
      .flatMap(([type, items]) => items.map((item) => `${type}:${item.indicator}`))
  );

  for (const item of thresholdList) {
    if (!item?.type || !item?.indicator) continue;
    if (!['water', 'air', 'soil'].includes(item.type)) continue;

    const key = `${item.type}:${item.indicator}`;
    if (existed.has(key)) continue;

    normalized[item.type].push({
      indicator: item.indicator,
      label: item.name || item.indicator,
      unit: item.unit || '',
    });
    existed.add(key);
  }

  return normalized;
};

export const Thresholds = () => {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [form] = Form.useForm();
  const [filterType, setFilterType] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [standardProfile, setStandardProfile] = useState(null);
  const [standardThresholds, setStandardThresholds] = useState([]);
  const [applyStandardLoading, setApplyStandardLoading] = useState(false);
  const selectedType = Form.useWatch('type', form);
  const selectedIndicator = Form.useWatch('indicator', form);

  const indicatorLibraryByType = useMemo(
    () => buildIndicatorLibrary([...standardThresholds, ...thresholds]),
    [standardThresholds, thresholds]
  );

  const indicatorOptions = useMemo(
    () => (selectedType
      ? (indicatorLibraryByType[selectedType] || []).map((item) => ({
          value: item.indicator,
          label: item.label,
          unit: item.unit,
        }))
      : []),
    [indicatorLibraryByType, selectedType]
  );

  const selectedIndicatorInfo = useMemo(
    () => indicatorOptions.find((item) => item.value === selectedIndicator) || null,
    [indicatorOptions, selectedIndicator]
  );

  useEffect(() => {
    loadThresholds();
  }, [filterType, sourceFilter]);

  useEffect(() => {
    loadStandardProfile();
  }, []);

  const loadThresholds = async () => {
    try {
      setLoading(true);
      const res = await thresholdService.getThresholds(filterType, sourceFilter);
      setThresholds(res.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách ngưỡng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStandardProfile = async () => {
    try {
      const res = await thresholdService.getStandardThresholds();
      setStandardProfile(res.data.data?.profile || null);
      setStandardThresholds(res.data.data?.thresholds || []);
    } catch (error) {
      // Không chặn UI nếu endpoint chưa sẵn sàng
      setStandardProfile(null);
      setStandardThresholds([]);
    }
  };

  useEffect(() => {
    if (!selectedType) return;

    const optionsByType = indicatorLibraryByType[selectedType] || [];
    const hasCurrentIndicator = optionsByType.some((item) => item.indicator === selectedIndicator);

    if (!hasCurrentIndicator) {
      form.setFieldsValue({ indicator: undefined, unit: undefined });
      return;
    }

    const matched = optionsByType.find((item) => item.indicator === selectedIndicator);
    if (matched && matched.unit !== form.getFieldValue('unit')) {
      form.setFieldValue('unit', matched.unit);
    }
  }, [selectedType, selectedIndicator, indicatorLibraryByType, form]);

  const handleApplyStandardThresholds = () => {
    Modal.confirm({
      title: 'Nạp bộ ngưỡng chuẩn tham chiếu',
      content:
        'Hệ thống sẽ nạp/cập nhật ngưỡng chuẩn tham chiếu. Ngưỡng tạo tay vẫn được giữ nguyên.',
      okText: 'Nạp chuẩn',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setApplyStandardLoading(true);
          await thresholdService.applyStandardThresholds();
          message.success('Nạp ngưỡng chuẩn thành công');
          loadThresholds();
          loadStandardProfile();
        } catch (error) {
          message.error('Lỗi nạp ngưỡng chuẩn: ' + error.message);
        } finally {
          setApplyStandardLoading(false);
        }
      },
    });
  };

  const handleAddThreshold = () => {
    setEditingThreshold(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditThreshold = (threshold) => {
    setEditingThreshold(threshold);
    form.setFieldsValue({
      name: threshold.name,
      type: threshold.type,
      indicator: threshold.indicator,
      minValue: threshold.minValue,
      maxValue: threshold.maxValue,
      unit: threshold.unit,
      description: threshold.description,
    });
    setModalVisible(true);
  };

  const handleDeleteThreshold = (id, name) => {
    Modal.confirm({
      title: 'Xác Nhận Xóa',
      content: `Bạn có chắc chắn muốn xóa ngưỡng "${name}" không?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await thresholdService.deleteThreshold(id);
          message.success('Xóa ngưỡng thành công');
          loadThresholds();
        } catch (error) {
          message.error('Lỗi xóa ngưỡng: ' + error.message);
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const handleSaveThreshold = async (values) => {
    try {
      if (editingThreshold) {
        await thresholdService.updateThreshold(editingThreshold._id, values);
        message.success('Cập nhật ngưỡng thành công');
      } else {
        await thresholdService.createThreshold(values);
        message.success('Tạo ngưỡng thành công');
      }
      setModalVisible(false);
      form.resetFields();
      loadThresholds();
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      water: '💧 Nước',
      air: '💨 Không khí',
      soil: '🌱 Đất',
    };
    return map[type] || type;
  };

  const getTypeColor = (type) => {
    const map = {
      water: 'blue',
      air: 'cyan',
      soil: 'green',
    };
    return map[type] || 'default';
  };

  const columns = [
    {
      title: 'Tên ngưỡng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span style={{ color: getTypeColor(type), fontWeight: 'bold' }}>
          {getTypeLabel(type)}
        </span>
      ),
      filters: [
        { text: '💧 Nước', value: 'water' },
        { text: '💨 Không khí', value: 'air' },
        { text: '🌱 Đất', value: 'soil' },
      ],
      onFilter: (value, record) => {
        if (value === '') return true;
        return record.type === value;
      },
    },
    {
      title: 'Chỉ tiêu',
      dataIndex: 'indicator',
      key: 'indicator',
    },
    {
      title: 'Giá trị tối thiểu',
      dataIndex: 'minValue',
      key: 'minValue',
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      title: 'Giá trị tối đa',
      dataIndex: 'maxValue',
      key: 'maxValue',
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
      width: 200,
    },
    {
      title: 'Nguồn',
      key: 'sourceType',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.sourceType === 'standard' ? 'geekblue' : 'gold'}>
            {record.sourceType === 'standard' ? 'Chuẩn tham chiếu' : 'Tạo tay'}
          </Tag>
          <small style={{ color: '#666' }}>{record.sourceName || '-'}</small>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditThreshold(record)}
          >
            Sửa
          </Button>
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteThreshold(record._id, record.name)}
            loading={deleteLoading}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: thresholds.length,
    water: thresholds.filter(t => t.type === 'water').length,
    air: thresholds.filter(t => t.type === 'air').length,
    soil: thresholds.filter(t => t.type === 'soil').length,
  };

  return (
    <div className="thresholds-container">
      <Card
        title={<span><AlertOutlined /> Cấu Hình Ngưỡng Cảnh Báo</span>}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddThreshold}
            >
              Thêm ngưỡng
            </Button>
            <Button
              type="default"
              onClick={handleApplyStandardThresholds}
              loading={applyStandardLoading}
            >
              Nạp ngưỡng chuẩn
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadThresholds}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng ngưỡng"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chất lượng nước"
                value={stats.water}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chất lượng không khí"
                value={stats.air}
                valueStyle={{ color: '#2f54eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chất lượng đất"
                value={stats.soil}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {standardProfile && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={standardProfile.name}
            description={`${standardProfile.description} Bạn vẫn có thể tạo ngưỡng thủ công.`}
          />
        )}

        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={8}>
            <Select
              value={filterType || 'all'}
              style={{ width: '100%' }}
              onChange={(value) => setFilterType(value === 'all' ? '' : value)}
              options={[
                { label: 'Tất cả loại', value: 'all' },
                { label: '💧 Nước', value: 'water' },
                { label: '💨 Không khí', value: 'air' },
                { label: '🌱 Đất', value: 'soil' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              value={sourceFilter || 'all'}
              style={{ width: '100%' }}
              onChange={(value) => setSourceFilter(value === 'all' ? '' : value)}
              options={[
                { label: 'Tất cả nguồn', value: 'all' },
                { label: 'Chuẩn tham chiếu', value: 'standard' },
                { label: 'Tạo tay', value: 'manual' },
              ]}
            />
          </Col>
        </Row>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={thresholds.map((threshold) => ({ ...threshold, key: threshold._id }))}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={editingThreshold ? 'Sửa ngưỡng' : 'Thêm ngưỡng mới'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setEditingThreshold(null);
        }}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveThreshold}
        >
          <Form.Item
            label="Tên ngưỡng"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngưỡng' }]}
          >
            <Input placeholder="VD: Độ pH nước" />
          </Form.Item>

          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select
              placeholder="Chọn loại"
              onChange={() => {
                form.setFieldsValue({ indicator: undefined, unit: undefined });
              }}
              options={[
                { label: '💧 Nước', value: 'water' },
                { label: '💨 Không khí', value: 'air' },
                { label: '🌱 Đất', value: 'soil' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Chỉ tiêu"
            name="indicator"
            rules={[{ required: true, message: 'Vui lòng chọn chỉ tiêu' }]}
          >
            <Select
              placeholder={selectedType ? 'Chọn chỉ tiêu theo loại môi trường' : 'Chọn loại trước'}
              disabled={!selectedType}
              showSearch
              optionFilterProp="label"
              options={indicatorOptions}
              onChange={(value) => {
                const matched = indicatorOptions.find((item) => item.value === value);
                form.setFieldValue('unit', matched?.unit || '');
              }}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit"
            extra={selectedIndicatorInfo
              ? `Đơn vị gợi ý cho chỉ tiêu này: ${selectedIndicatorInfo.unit || 'không có đơn vị'}`
              : 'Đơn vị sẽ được tự động gợi ý sau khi chọn chỉ tiêu'}
          >
            <Input
              placeholder={selectedIndicatorInfo
                ? (selectedIndicatorInfo.unit || 'Không có đơn vị')
                : 'VD: mg/L'}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá trị tối thiểu"
                name="minValue"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị tối thiểu' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá trị tối đa"
                name="maxValue"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị tối đa' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về ngưỡng này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Thresholds;
