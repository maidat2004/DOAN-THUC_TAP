import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Row, Col, Statistic, Table, Space, Button, Tag, Empty, Input, Tabs } from 'antd';
import { EnvironmentOutlined, ReloadOutlined, EnvironmentFilled } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stationService, dataService } from '../services';
import '../styles/EnvironmentMap.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const EnvironmentMap = () => {
  const [stations, setStations] = useState([]);
  const [environmentData, setEnvironmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map', 'stations', 'data'

  const mapCenter = [10.2415, 105.7841]; // Vinh Long Province coordinates

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    const handleFocus = () => loadMapData();
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      loadMapData();
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [stationsRes, dataRes] = await Promise.all([
        stationService.getAllStations(),
        dataService.getEnvironmentData(),
      ]);
      setStations(stationsRes.data.data || []);
      setEnvironmentData(dataRes.data.data || []);
    } catch (error) {
      message.error('Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMapInNewTab = (latitude, longitude, name) => {
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15&layers=M`;
    window.open(url, '_blank');
  };

  const stationColumns = [
    {
      title: 'Mã điểm',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên điểm quan trắc',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = { water: '💧 Nước', air: '💨 Không khí', soil: '🌱 Đất' };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Tọa độ',
      key: 'coordinates',
      render: (_, record) => (
        <span>
          {record.coordinates?.latitude.toFixed(4)}, {record.coordinates?.longitude.toFixed(4)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: <Tag color="green">✅ Hoạt Động</Tag>,
          inactive: <Tag color="red">❌ Vô Hiệu</Tag>,
          maintenance: <Tag color="orange">🔧 Bảo Trì</Tag>,
        };
        return statusMap[status] || status;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => openMapInNewTab(record.coordinates.latitude, record.coordinates.longitude, record.name)}
        >
          Xem bản đồ
        </Button>
      ),
    },
  ];

  const dataColumns = [
    {
      title: 'Điểm quan trắc',
      dataIndex: ['station', 'name'],
      key: 'station',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = { water: '💧 Nước', air: '💨 Không khí', soil: '🌱 Đất' };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Ngày ghi nhận',
      dataIndex: 'measurementDate',
      key: 'recordedDate',
      render: (_, record) => {
        const dateValue = record.measurementDate || record.recordedDate;
        return dateValue ? new Date(dateValue).toLocaleDateString('vi-VN') : '-';
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: <Tag color="gold">Nháp</Tag>,
          submitted: <Tag color="blue">Đã gửi</Tag>,
          approved: <Tag color="green">Chấp thuận</Tag>,
          rejected: <Tag color="red">Từ chối</Tag>,
        };
        return statusMap[status] || status;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            if (record.station?.coordinates) {
              openMapInNewTab(
                record.station.coordinates.latitude,
                record.station.coordinates.longitude,
                record.station.name
              );
            }
          }}
        >
          Xem vị trí
        </Button>
      ),
    },
  ];

  const filteredStations = stations.filter(station =>
    station.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    station.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredData = environmentData.filter(data =>
    data.station?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="environment-map-container">
      <Card
        title={<span><EnvironmentOutlined /> Bản Đồ Môi Trường</span>}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadMapData}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Tabs Navigation */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            type={viewMode === 'map' ? 'primary' : 'default'}
            onClick={() => setViewMode('map')}
            icon={<EnvironmentFilled />}
          >
            🗺️ Bản Đồ
          </Button>
          <Button
            type={viewMode === 'stations' ? 'primary' : 'default'}
            onClick={() => setViewMode('stations')}
          >
            📍 Điểm Quan Trắc ({stations.length})
          </Button>
          <Button
            type={viewMode === 'data' ? 'primary' : 'default'}
            onClick={() => setViewMode('data')}
          >
            📊 Dữ Liệu Môi Trường ({environmentData.length})
          </Button>
        </div>

        <Spin spinning={loading}>
          {/* MAP VIEW */}
          {viewMode === 'map' && (
            <div style={{ marginBottom: '16px' }}>
              <Card
                style={{ marginBottom: '16px' }}
                title="Bản đồ Các Điểm Quan Trắc"
              >
                <div className="map-wrapper">
                  <MapContainer center={mapCenter} zoom={12} className="map-container">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {stations.map((station) => (
                      station.coordinates && (
                        <Marker
                          key={station._id}
                          position={[station.coordinates.latitude, station.coordinates.longitude]}
                        >
                          <Popup className="station-popup">
                            <div style={{ minWidth: '200px' }}>
                              <h4 style={{ margin: '0 0 8px 0' }}>{station.name}</h4>
                              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                                <strong>Mã:</strong> {station.code}
                              </p>
                              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                                <strong>Loại:</strong> {
                                  station.type === 'water' ? '💧 Nước' :
                                  station.type === 'air' ? '💨 Không khí' :
                                  '🌱 Đất'
                                }
                              </p>
                              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                                <strong>Địa chỉ:</strong> {station.address}
                              </p>
                              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                                <strong>Trạng thái:</strong> {
                                  station.status === 'active' ? '✅ Hoạt động' :
                                  station.status === 'maintenance' ? '🔧 Bảo trì' :
                                  '❌ Vô hiệu'
                                }
                              </p>
                              <Button
                                type="primary"
                                size="small"
                                block
                                style={{ marginTop: '8px' }}
                                onClick={() => openMapInNewTab(
                                  station.coordinates.latitude,
                                  station.coordinates.longitude,
                                  station.name
                                )}
                              >
                                Chi tiết (OSM)
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                </div>
              </Card>

              {/* Statistics */}
              {stations.length > 0 && (
                <Row gutter={16}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Tổng điểm"
                        value={stations.length}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Hoạt động"
                        value={stations.filter(s => s.status === 'active').length}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Bảo trì"
                        value={stations.filter(s => s.status === 'maintenance').length}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Vô hiệu"
                        value={stations.filter(s => s.status === 'inactive').length}
                        valueStyle={{ color: '#f5222d' }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          )}

          {/* STATIONS VIEW */}
          {viewMode === 'stations' && (
            <div>
              {/* Information */}
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}>
                  💡 <strong>Lưu ý:</strong> Nhấp vào "Xem bản đồ" để xem chi tiết vị trí trên OpenStreetMap
                </p>
              </div>

              {/* Statistics */}
              {stations.length > 0 && (
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Tổng điểm"
                        value={stations.length}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Hoạt động"
                        value={stations.filter(s => s.status === 'active').length}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Bảo trì"
                        value={stations.filter(s => s.status === 'maintenance').length}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Vô hiệu"
                        value={stations.filter(s => s.status === 'inactive').length}
                        valueStyle={{ color: '#f5222d' }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Search */}
              <Input.Search
                placeholder="Tìm kiếm theo tên hoặc mã điểm..."
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: '16px' }}
                allowClear
              />

              {/* Stations Table */}
              {filteredStations.length > 0 ? (
                <Table
                  columns={stationColumns}
                  dataSource={filteredStations.map(s => ({ ...s, key: s._id }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              ) : (
                <Empty description="Không có dữ liệu điểm quan trắc" />
              )}
            </div>
          )}

          {/* DATA VIEW */}
          {viewMode === 'data' && (
            <div>
              {/* Search */}
              <Input.Search
                placeholder="Tìm kiếm theo tên điểm quan trắc..."
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: '16px' }}
                allowClear
              />

              {/* Data Table */}
              {filteredData.length > 0 ? (
                <Table
                  columns={dataColumns}
                  dataSource={filteredData.map(d => ({ ...d, key: d._id }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              ) : (
                <Empty description="Không có dữ liệu môi trường" />
              )}
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default EnvironmentMap;
