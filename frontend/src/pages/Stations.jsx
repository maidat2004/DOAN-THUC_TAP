import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Spin, Card, Row, Col, Statistic, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { stationService, locationService } from '../services';
import MapLocationPicker from '../components/MapLocationPicker';
import '../styles/Stations.css';

export const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form] = Form.useForm();
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const watchedProvince = Form.useWatch('province', form);
  const watchedDistrict = Form.useWatch('district', form);

  useEffect(() => {
    loadStations();
    loadProvinces();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const res = await stationService.getAllStations();
      setStations(res.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách điểm quan trắc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const res = await locationService.getProvinces();
      setProvinces(res.data.data || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      setSelectedProvince(provinceId);
      const res = await locationService.getDistrictsByProvince(provinceId);
      const districtsData = res.data.data || [];
      setDistricts(districtsData);
      return districtsData;
    } catch (error) {
      console.error('Error loading districts:', error);
      return [];
    }
  };

  const loadCommunes = async (districtId) => {
    try {
      setSelectedDistrict(districtId);
      const res = await locationService.getCommunesByDistrict(districtId);
      const communesData = res.data.data || [];
      setCommunes(communesData);
      return communesData;
    } catch (error) {
      console.error('Error loading communes:', error);
      return [];
    }
  };

  const handleMapLocationChange = async (locationPayload) => {
    const isRichPayload = locationPayload && locationPayload.coordinates;
    const coordinates = isRichPayload ? locationPayload.coordinates : locationPayload;

    if (!coordinates?.latitude || !coordinates?.longitude) return;

    form.setFieldsValue({ coordinates });

    const provinceCode = isRichPayload ? locationPayload.provinceCode : null;
    const districtCode = isRichPayload ? locationPayload.districtCode : null;

    let provinceId = form.getFieldValue('province');
    if (!provinceId && provinceCode) {
      provinceId = provinces.find((province) => province.code === provinceCode)?._id;
      if (provinceId) {
        form.setFieldsValue({ province: provinceId });
      }
    }

    if (!provinceId) return;

    const districtList = await loadDistricts(provinceId);
    let districtId = form.getFieldValue('district');

    if (!districtId && districtCode) {
      districtId = districtList.find((district) => district.code === districtCode)?._id;
      if (districtId) {
        form.setFieldsValue({ district: districtId });
      }
    }

    if (!districtId) return;

    const communeList = await loadCommunes(districtId);
    const currentCommune = form.getFieldValue('commune');
    if (!currentCommune && communeList.length > 0) {
      form.setFieldsValue({ commune: communeList[0]._id });
    }
  };

  const handleAddStation = () => {
    setEditingStation(null);
    form.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setCommunes([]);
    setModalVisible(true);
  };

  const handleEditStation = (station) => {
    setEditingStation(station);
    
    // Load and set province
    if (station.province?._id) {
      setSelectedProvince(station.province._id);
      loadDistricts(station.province._id);
      
      // Load and set district with delay
      setTimeout(() => {
        if (station.district?._id) {
          setSelectedDistrict(station.district._id);
          loadCommunes(station.district._id);
        }
      }, 300);
    }
    
    form.setFieldsValue({
      code: station.code,
      name: station.name,
      type: station.type,
      status: station.status,
      province: station.province?._id,
      district: station.district?._id,
      commune: station.commune?._id,
      coordinates: {
        latitude: station.coordinates?.latitude,
        longitude: station.coordinates?.longitude,
      },
      address: station.address,
      description: station.description,
    });
    setModalVisible(true);
  };

  const handleDeleteStation = (id, name) => {
    Modal.confirm({
      title: 'Xác Nhận Xóa',
      content: `Bạn có chắc chắn muốn xóa điểm quan trắc "${name}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await stationService.deleteStation(id);
          message.success('Xóa điểm quan trắc thành công');
          loadStations();
        } catch (error) {
          message.error('Lỗi xóa điểm quan trắc: ' + error.message);
        }
      },
    });
  };

  const handleSaveStation = async (values) => {
    try {
      if (editingStation) {
        await stationService.updateStation(editingStation._id, values);
        message.success('Cập nhật điểm quan trắc thành công');
      } else {
        await stationService.createStation(values);
        message.success('Tạo điểm quan trắc thành công');
      }
      setModalVisible(false);
      form.resetFields();
      loadStations();
    } catch (error) {
      message.error('Lỗi lưu điểm quan trắc: ' + error.message);
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

  const getStatusLabel = (status) => {
    const map = {
      active: { label: '✅ Hoạt Động', color: 'green' },
      inactive: { label: '❌ Vô Hiệu', color: 'red' },
      maintenance: { label: '🔧 Bảo Trì', color: 'orange' },
    };
    return map[status] || { label: status, color: 'default' };
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.code?.toLowerCase().includes(searchText.toLowerCase()) ||
                         station.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || station.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    {
      title: 'Mã Điểm',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên Điểm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>,
      filters: [
        { text: '💧 Nước', value: 'water' },
        { text: '💨 Không khí', value: 'air' },
        { text: '🌱 Đất', value: 'soil' },
      ],
    },
    {
      title: 'Huyện',
      dataIndex: ['district', 'name'],
      key: 'district',
    },
    {
      title: 'Tọa độ',
      key: 'coordinates',
      render: (_, record) => (
        <span style={{ fontSize: '12px' }}>
          {record.coordinates?.latitude?.toFixed(4)}, {record.coordinates?.longitude?.toFixed(4)}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = getStatusLabel(status);
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
      filters: [
        { text: '✅ Hoạt Động', value: 'active' },
        { text: '❌ Vô Hiệu', value: 'inactive' },
        { text: '🔧 Bảo Trì', value: 'maintenance' },
      ],
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditStation(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStation(record._id, record.name)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: stations.length,
    active: stations.filter(s => s.status === 'active').length,
    maintenance: stations.filter(s => s.status === 'maintenance').length,
    water: stations.filter(s => s.type === 'water').length,
  };

  return (
    <div className="stations-container">
      <Card
        title={<span><EnvironmentOutlined /> Quản Lý Điểm Quan Trắc</span>}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddStation}
            >
              Thêm Điểm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadStations}
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
                title="Tổng Điểm"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hoạt Động"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Bảo Trì"
                value={stats.maintenance}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nước"
                value={stats.water}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="Tìm kiếm mã hoặc tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
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
          <Col xs={24} sm={12} lg={8}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: '✅ Hoạt Động', value: 'active' },
                { label: '❌ Vô Hiệu', value: 'inactive' },
                { label: '🔧 Bảo Trì', value: 'maintenance' },
              ]}
            />
          </Col>
        </Row>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredStations.map((s) => ({ ...s, key: s._id }))}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            locale={{ emptyText: 'Không có điểm quan trắc' }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={editingStation ? 'Sửa Điểm Quan Trắc' : 'Thêm Điểm Quan Trắc'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setEditingStation(null);
        }}
        width={900}
        styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveStation}>
          <Form.Item
            label="Mã Điểm"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã điểm' }]}
          >
            <Input placeholder="VD: ST001" />
          </Form.Item>

          <Form.Item
            label="Tên Điểm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên điểm' }]}
          >
            <Input placeholder="VD: Điểm quan trắc sông Tiền" />
          </Form.Item>

          <Form.Item
            label="Loại Môi Trường"
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select
              placeholder="Chọn loại"
              options={[
                { label: '💧 Nước', value: 'water' },
                { label: '💨 Không khí', value: 'air' },
                { label: '🌱 Đất', value: 'soil' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Trạng Thái"
            name="status"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: '✅ Hoạt Động', value: 'active' },
                { label: '❌ Vô Hiệu', value: 'inactive' },
                { label: '🔧 Bảo Trì', value: 'maintenance' },
              ]}
            />
          </Form.Item>

          {/* Province, District, Commune Selection */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tỉnh"
                name="province"
                rules={[{ required: true, message: 'Vui lòng chọn tỉnh' }]}
              >
                <Select
                  placeholder="Chọn tỉnh"
                  options={provinces.map(p => ({
                    label: p.name,
                    value: p._id,
                  }))}
                  onChange={(value) => {
                    setSelectedDistrict(null);
                    setCommunes([]);
                    loadDistricts(value);
                    form.setFieldsValue({ district: null, commune: null });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Huyện"
                name="district"
                rules={[{ required: true, message: 'Vui lòng chọn huyện' }]}
              >
                <Select
                  placeholder="Chọn huyện"
                  disabled={!selectedProvince}
                  options={districts.map(d => ({
                    label: d.name,
                    value: d._id,
                  }))}
                  onChange={(value) => {
                    loadCommunes(value);
                    form.setFieldsValue({ commune: null });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Xã"
                name="commune"
                rules={[{ required: true, message: 'Vui lòng chọn xã' }]}
              >
                <Select
                  placeholder="Chọn xã"
                  disabled={!selectedDistrict}
                  options={communes.map(c => ({
                    label: c.name,
                    value: c._id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa Chỉ"
            name="address"
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ chi tiết" />
          </Form.Item>

          {/* Hidden field to validate coordinates */}
          <Form.Item
            name="coordinates"
            style={{ display: 'none' }}
            rules={[
              {
                validator: (_, value) => {
                  if (!value || !value.latitude || !value.longitude) {
                    return Promise.reject(new Error('Vui lòng chọn vị trí trên bản đồ'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="hidden" />
          </Form.Item>

          {/* Map Location Picker - Outside Form.Item */}
          <MapLocationPicker
            value={form.getFieldValue('coordinates') || null}
            selectedProvinceId={watchedProvince}
            selectedDistrictCode={districts.find((district) => district._id === watchedDistrict)?.code || null}
            onChange={handleMapLocationChange}
          />

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <Input.TextArea rows={2} placeholder="Mô tả chi tiết về điểm quan trắc" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Stations;
