import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Select, Spin, Typography, Space, Button, Empty } from 'antd';
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { publicService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PublicMonitor.css';

const { Title, Text } = Typography;

const INDICATOR_CONFIG = {
  water: [
    { key: 'ph', label: 'pH', unit: '' },
    { key: 'do_level', label: 'DO', unit: 'mg/L' },
    { key: 'temperature', label: 'Nhiệt độ', unit: '°C' },
    { key: 'turbidity', label: 'Độ đục', unit: 'NTU' },
    { key: 'conductivity', label: 'Độ dẫn điện', unit: 'µS/cm' },
  ],
  air: [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³' },
    { key: 'co2', label: 'CO2', unit: 'ppm' },
    { key: 'temperature', label: 'Nhiệt độ', unit: '°C' },
    { key: 'humidity', label: 'Độ ẩm', unit: '% RH' },
    { key: 'pressure', label: 'Áp suất', unit: 'hPa' },
  ],
  soil: [
    { key: 'ph', label: 'pH', unit: '' },
    { key: 'moisture', label: 'Độ ẩm', unit: '%' },
    { key: 'nitrogen', label: 'Nitơ', unit: 'mg/kg' },
    { key: 'phosphorus', label: 'Phốt pho', unit: 'mg/kg' },
    { key: 'potassium', label: 'Kali', unit: 'mg/kg' },
    { key: 'organicMatter', label: 'Chất hữu cơ', unit: '%' },
  ],
};

const LEVELS = {
  normal: { label: 'Trong giới hạn', className: 'normal' },
  warning: { label: 'Chuẩn bị vượt', className: 'warning' },
  critical: { label: 'Vượt ngưỡng', className: 'critical' },
  noLimit: { label: 'Không có giới hạn', className: 'no-limit' },
  noData: { label: 'Chưa có dữ liệu', className: 'no-data' },
};

const formatValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  if (typeof value === 'number') {
    return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
  }
  return value;
};

const getLimitText = (threshold) => {
  if (!threshold) return 'Không có giới hạn';
  const minValue = threshold.minValue;
  const maxValue = threshold.maxValue;
  const unit = threshold.unit || '';

  if (minValue !== null && minValue !== undefined && maxValue !== null && maxValue !== undefined) {
    return `Giới hạn: ${minValue} - ${maxValue} ${unit}`.trim();
  }
  if (minValue !== null && minValue !== undefined) {
    return `Giới hạn: ≥ ${minValue} ${unit}`.trim();
  }
  if (maxValue !== null && maxValue !== undefined) {
    return `Giới hạn: ≤ ${maxValue} ${unit}`.trim();
  }
  return 'Không có giới hạn';
};

const getIndicatorLevel = (value, threshold) => {
  const numericValue = Number(value);
  if (value === null || value === undefined || Number.isNaN(numericValue)) {
    return LEVELS.noData;
  }

  if (!threshold || threshold.minValue === undefined || threshold.maxValue === undefined) {
    return LEVELS.noLimit;
  }

  const minValue = Number(threshold.minValue);
  const maxValue = Number(threshold.maxValue);

  if (!Number.isNaN(minValue) && numericValue < minValue) {
    return LEVELS.critical;
  }
  if (!Number.isNaN(maxValue) && numericValue > maxValue) {
    return LEVELS.critical;
  }

  const range = maxValue - minValue;
  if (range > 0) {
    const margin = range * 0.1;
    if (numericValue <= minValue + margin || numericValue >= maxValue - margin) {
      return LEVELS.warning;
    }
  }

  return LEVELS.normal;
};

export const PublicMonitor = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);

  const loadStations = async () => {
    try {
      setStationsLoading(true);
      const res = await publicService.getStations();
      const list = res.data.data || [];
      setStations(list);
      if (list.length > 0 && !selectedStationId) {
        setSelectedStationId(list[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setStationsLoading(false);
    }
  };

  const loadSummary = async (stationId) => {
    try {
      setLoading(true);
      const res = await publicService.getStationSummary(stationId);
      setSummary(res.data.data || null);
    } catch (error) {
      console.error(error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (selectedStationId) {
      loadSummary(selectedStationId);
    }
  }, [selectedStationId]);

  useEffect(() => {
    if (stations.length < 2) {
      return;
    }

    const intervalId = setInterval(() => {
      setSelectedStationId((prevId) => {
        if (!stations.length) return prevId;
        const currentIndex = stations.findIndex((s) => s._id === prevId);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % stations.length;
        return stations[nextIndex]._id;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [stations]);

  const station = summary?.station;
  const latestData = summary?.latestData;
  const thresholds = summary?.thresholds || {};

  const indicators = useMemo(() => {
    if (!station?.type) return [];
    return INDICATOR_CONFIG[station.type] || [];
  }, [station?.type]);

  const latestValues = latestData ? latestData[latestData.type] : null;

  return (
    <div className="public-monitor-container">
      <Card
        className="public-monitor-card"
        title={
          <Space>
            <EnvironmentOutlined />
            <span>Quan trắc công khai</span>
          </Space>
        }
        extra={
          <Space>
            {!isAuthenticated && (
              <Button type="primary" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadStations();
                if (selectedStationId) loadSummary(selectedStationId);
              }}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Row gutter={16} className="public-monitor-toolbar">
          <Col xs={24} md={12}>
            <Text strong>Chọn trạm:</Text>
            <Select
              value={selectedStationId}
              onChange={setSelectedStationId}
              style={{ width: '100%', marginTop: 8 }}
              loading={stationsLoading}
              options={stations.map((stationItem) => ({
                label: `${stationItem.code} - ${stationItem.name}`,
                value: stationItem._id,
              }))}
            />
          </Col>
          <Col xs={24} md={12}>
            <div className="public-monitor-header">
              <Title level={4} style={{ marginBottom: 4 }}>
                {station?.name || 'Chọn trạm để xem dữ liệu'}
              </Title>
              <Text type="secondary">
                {station?.address || 'Địa chỉ sẽ hiển thị tại đây'}
              </Text>
              <div style={{ marginTop: 6 }}>
                <Text>
                  Cập nhật: {latestData?.measurementDate ? new Date(latestData.measurementDate).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {!latestValues ? (
            <Empty description="Chưa có dữ liệu quan trắc" style={{ marginTop: 24 }} />
          ) : (
            <div className="public-monitor-grid">
              <Row gutter={[16, 16]}>
                {indicators.map((indicator) => {
                  const value = latestValues?.[indicator.key];
                  const threshold = thresholds?.[indicator.key];
                  const level = getIndicatorLevel(value, threshold);

                  return (
                    <Col key={indicator.key} xs={24} sm={12} lg={8}>
                      <div className={`monitor-tile ${level.className}`}>
                        <div className="monitor-tile-title">{indicator.label}</div>
                        <div className="monitor-tile-value">
                          {formatValue(value)}
                          {indicator.unit ? ` ${indicator.unit}` : ''}
                        </div>
                        <div className="monitor-tile-limit">{getLimitText(threshold)}</div>
                      </div>
                    </Col>
                  );
                })}
              </Row>

              <div className="monitor-legend">
                <span className="legend-item normal">{LEVELS.normal.label}</span>
                <span className="legend-item warning">{LEVELS.warning.label}</span>
                <span className="legend-item critical">{LEVELS.critical.label}</span>
                <span className="legend-item no-limit">{LEVELS.noLimit.label}</span>
              </div>
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default PublicMonitor;
