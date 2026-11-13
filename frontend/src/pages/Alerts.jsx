import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, message, Spin, Space, Row, Col, Statistic, Tag, Input, Select, Modal, Drawer, Divider, Descriptions, Timeline } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, AlertOutlined, ClockCircleOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { alertService } from '../services';
import '../styles/Alerts.css';

export const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, [filter, typeFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await alertService.getAlerts({});
      let filteredAlerts = res.data.data || [];

      // Apply filters
      if (filter === 'unresolved') {
        filteredAlerts = filteredAlerts.filter(a => !a.isResolved);
      } else if (filter === 'resolved') {
        filteredAlerts = filteredAlerts.filter(a => a.isResolved);
      }

      if (typeFilter !== 'all') {
        filteredAlerts = filteredAlerts.filter(a => a.type === typeFilter);
      }

      setAlerts(filteredAlerts);
    } catch (error) {
      message.error('Lỗi tải danh sách cảnh báo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = (id) => {
    Modal.confirm({
      title: 'Xác Nhận Giải Quyết',
      content: 'Bạn có chắc chắn muốn đánh dấu cảnh báo này đã được giải quyết?',
      okText: 'Có',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await alertService.resolveAlert(id);
          message.success('Đã giải quyết cảnh báo');
          loadAlerts();
        } catch (error) {
          message.error('Lỗi giải quyết cảnh báo: ' + error.message);
        }
      },
    });
  };

  const showAlertDetails = (alert) => {
    setSelectedAlert(alert);
    setDrawerVisible(true);
  };

  const getAlertSeverity = (type) => {
    const map = {
      critical: { status: 'error', label: '🔴 Nghiêm Trọng', color: 'red' },
      warning: { status: 'warning', label: '🟡 Cảnh Báo', color: 'orange' },
      info: { status: 'processing', label: '🔵 Thông Tin', color: 'blue' },
    };
    return map[type] || { status: 'default', label: type, color: 'default' };
  };

  const getStationType = (type) => {
    const map = {
      water: { icon: '💧', label: 'Nước', color: 'blue' },
      air: { icon: '💨', label: 'Không khí', color: 'cyan' },
      soil: { icon: '🌱', label: 'Đất', color: 'green' },
    };
    return map[type] || { icon: '❓', label: type, color: 'default' };
  };

  const filteredBySearch = alerts.filter(a =>
    a.message?.toLowerCase().includes(searchText.toLowerCase()) ||
    a.station?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    a.indicator?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Mức Độ',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type) => {
        const severity = getAlertSeverity(type);
        return (
          <Badge
            status={severity.status}
            text={severity.label}
          />
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: ['station', 'type'],
      key: 'stationType',
      width: '8%',
      render: (type) => {
        const stationType = getStationType(type);
        return (
          <Tag color={stationType.color}>
            {stationType.icon} {stationType.label}
          </Tag>
        );
      },
    },
    {
      title: 'Điểm Quan Trắc',
      dataIndex: ['station', 'name'],
      key: 'station',
      width: '18%',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <strong>{name}</strong>
          <span style={{ fontSize: '12px', color: '#666' }}>
            📍 {record.station?.code}
          </span>
        </Space>
      ),
    },
    {
      title: 'Chỉ Tiêu',
      dataIndex: 'indicator',
      key: 'indicator',
      width: '12%',
      render: (indicator) => <strong>{indicator}</strong>,
    },
    {
      title: 'Giá Trị vs Ngưỡng',
      key: 'valueVsThreshold',
      width: '18%',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            📊 {record.value} {record.threshold?.unit || ''}
          </div>
          <div style={{ color: '#666' }}>
            Ngưỡng: {record.threshold?.minValue}-{record.threshold?.maxValue} {record.threshold?.unit || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Thông Báo',
      dataIndex: 'message',
      key: 'message',
      width: '20%',
      render: (message) => (
        <span style={{ fontSize: '12px' }}>{message}</span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isResolved',
      key: 'isResolved',
      width: '10%',
      render: (isResolved, record) => (
        isResolved ? (
          <Tag color="green">✅ Đã Xử Lý</Tag>
        ) : (
          <Tag color="red">⏳ Chưa Xử Lý</Tag>
        )
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: '12%',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showAlertDetails(record)}
            title="Xem chi tiết"
          />
          {!record.isResolved && user?.role === 'admin' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleResolveAlert(record._id)}
              title="Chỉ Admin có thể xử lý"
            >
              Xử Lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: alerts.length,
    unresolved: alerts.filter(a => !a.isResolved).length,
    resolved: alerts.filter(a => a.isResolved).length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
  };

  return (
    <div className="alerts-container">
      <Card
        title={<span><AlertOutlined /> Cảnh Báo Môi Trường</span>}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAlerts}
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
                title="Tổng Cảnh Báo"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chưa Xử Lý"
                value={stats.unresolved}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã Xử Lý"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nghiêm Trọng"
                value={stats.critical}
                valueStyle={{ color: '#ff7a45' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="Tìm kiếm cảnh báo..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              value={filter}
              onChange={setFilter}
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Chưa Xử Lý', value: 'unresolved' },
                { label: 'Đã Xử Lý', value: 'resolved' },
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
                { label: '🔴 Nghiêm Trọng', value: 'critical' },
                { label: '🟡 Cảnh Báo', value: 'warning' },
                { label: '🔵 Thông Tin', value: 'info' },
              ]}
            />
          </Col>
        </Row>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredBySearch.map((a) => ({ ...a, key: a._id }))}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1600 }}
            locale={{ emptyText: 'Không có cảnh báo' }}
          />
        </Spin>
      </Card>

      {/* Alert Details Drawer */}
      <Drawer
        title="Chi Tiết Cảnh Báo"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {selectedAlert && (
          <div className="alert-details">
            <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Mức Độ">
                {getAlertSeverity(selectedAlert.type).label}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                {selectedAlert.isResolved ? (
                  <Tag color="green">✅ Đã Xử Lý</Tag>
                ) : (
                  <Tag color="red">⏳ Chưa Xử Lý</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Tạo">
                {new Date(selectedAlert.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="🏢 Thông Tin Điểm Quan Trắc" size="small" style={{ marginBottom: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên Trạm">
                  {selectedAlert.station?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Mã Trạm">
                  {selectedAlert.station?.code}
                </Descriptions.Item>
                <Descriptions.Item label="Loại">
                  {getStationType(selectedAlert.station?.type).label}
                </Descriptions.Item>
                <Descriptions.Item label="Địa Chỉ">
                  {selectedAlert.station?.address}
                </Descriptions.Item>
                <Descriptions.Item label="Tọa Độ">
                  {selectedAlert.station?.coordinates?.latitude}, {selectedAlert.station?.coordinates?.longitude}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">
                  <Tag color={selectedAlert.station?.status === 'active' ? 'green' : 'orange'}>
                    {selectedAlert.station?.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="📊 Dữ Liệu Môi Trường" size="small" style={{ marginBottom: '16px' }}>
              {selectedAlert.environmentData ? (
                <div>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Thời Gian Đo">
                      {new Date(selectedAlert.environmentData?.measurementDate).toLocaleString('vi-VN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi Nhận Bởi">
                      {selectedAlert.environmentData?.company}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi Chú">
                      {selectedAlert.environmentData?.notes || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ) : (
                <span>Không có dữ liệu</span>
              )}
            </Card>

            <Card title="⚠️ Thông Tin Cảnh Báo" size="small" style={{ marginBottom: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Chỉ Tiêu">
                  <strong>{selectedAlert.indicator}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Giá Trị Đo">
                  <span style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                    {selectedAlert.value} {selectedAlert.threshold?.unit}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Ngưỡng">
                  <div style={{ fontSize: '12px' }}>
                    <div>Tối thiểu: {selectedAlert.threshold?.minValue}</div>
                    <div>Tối đa: {selectedAlert.threshold?.maxValue}</div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Thông Báo">
                  <div style={{ fontStyle: 'italic', color: '#666' }}>
                    {selectedAlert.message}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedAlert.isResolved && (
              <Card title="✅ Thông Tin Giải Quyết" size="small" style={{ marginBottom: '16px' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Thời Gian">
                    {selectedAlert.resolvedAt && new Date(selectedAlert.resolvedAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Được Giải Quyết Bởi">
                    {selectedAlert.resolvedBy?.fullName || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              {!selectedAlert.isResolved && (
                <Button
                  type="primary"
                  block
                  onClick={() => {
                    handleResolveAlert(selectedAlert._id);
                    setDrawerVisible(false);
                  }}
                  icon={<CheckCircleOutlined />}
                >
                  Đánh Dấu Đã Xử Lý
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Alerts;
