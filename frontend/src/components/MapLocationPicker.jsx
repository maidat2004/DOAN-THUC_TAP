import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Select, Button, Space, Divider, Alert, Descriptions, Empty } from 'antd';
import { EnvironmentOutlined, CopyOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services';

// District coordinates (pre-defined cho 3 tỉnh)
const DISTRICT_COORDINATES = {
  // Vĩnh Long
  'VL01': { name: 'Thành phố Vĩnh Long', lat: 10.2539, lng: 105.9597 },
  'VL02': { name: 'Bình Minh', lat: 10.0833, lng: 105.6667 },
  'VL03': { name: 'Bình Tân', lat: 10.3, lng: 105.9 },
  'VL04': { name: 'Long Hồ', lat: 10.3167, lng: 105.85 },
  'VL05': { name: 'Mang Thít', lat: 10.15, lng: 105.85 },
  'VL06': { name: 'Tam Bình', lat: 10.3667, lng: 105.9167 },
  'VL07': { name: 'Trà Ôn', lat: 10.05, lng: 105.9167 },
  'VL08': { name: 'Vũng Liêm', lat: 10.35, lng: 106.05 },
  // Trà Vinh
  'TV01': { name: 'TP. Trà Vinh', lat: 9.9377, lng: 106.3400 },
  'TV02': { name: 'Càng Long', lat: 9.9974, lng: 106.2047 },
  'TV03': { name: 'Tiểu Cần', lat: 9.8177, lng: 106.1923 },
  'TV04': { name: 'Châu Thành', lat: 9.8852, lng: 106.3293 },
  'TV05': { name: 'Cầu Kè', lat: 9.8711, lng: 106.0605 },
  'TV06': { name: 'Cầu Ngang', lat: 9.7947, lng: 106.4515 },
  'TV07': { name: 'Trà Cú', lat: 9.6865, lng: 106.2597 },
  'TV08': { name: 'Duyên Hải', lat: 9.6621, lng: 106.5179 },
  'TV09': { name: 'Thị xã Duyên Hải', lat: 9.6374, lng: 106.4963 },
  // Bến Tre
  'BT01': { name: 'TP. Bến Tre', lat: 10.2373, lng: 106.3813 },
  'BT02': { name: 'Giồng Trôm', lat: 10.1589, lng: 106.5036 },
  'BT03': { name: 'Mỏ Cày Nam', lat: 10.0711, lng: 106.3585 },
  'BT04': { name: 'Châu Thành', lat: 10.2899, lng: 106.3029 },
  'BT05': { name: 'Chợ Lách', lat: 10.2606, lng: 106.1210 },
  'BT06': { name: 'Mỏ Cày Bắc', lat: 10.1671, lng: 106.2917 },
  'BT07': { name: 'Bình Đại', lat: 10.1868, lng: 106.6936 },
  'BT08': { name: 'Ba Tri', lat: 10.0729, lng: 106.5977 },
  'BT09': { name: 'Thạnh Phú', lat: 9.9321, lng: 106.5610 },
};

const PROVINCE_CENTER = {
  'VL': { name: 'Vĩnh Long', lat: 10.2415, lng: 105.7841, zoom: 9 },
  'TV': { name: 'Trà Vinh', lat: 9.9377, lng: 106.3400, zoom: 9 },
  'BT': { name: 'Bến Tre', lat: 10.2373, lng: 106.3813, zoom: 9 },
};

export const MapLocationPicker = ({ value, onChange, selectedProvinceId = null, selectedDistrictCode = null }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const mapModeRef = useRef('click');
  const syncLocationFromCoordinatesRef = useRef(() => {});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(value || null);
  const [mapMode, setMapMode] = useState('click'); // 'click' or 'district'
  const [loading, setLoading] = useState(false);

  const getProvinceCodeFromDistrictCode = (districtCode = '') => districtCode.slice(0, 2);

  const findNearestDistrict = (lat, lng, provinceCodeFilter = null) => {
    const candidates = Object.entries(DISTRICT_COORDINATES).filter(([code]) => {
      if (!provinceCodeFilter) return true;
      return getProvinceCodeFromDistrictCode(code) === provinceCodeFilter;
    });

    if (!candidates.length) return null;

    let nearestDistrictCode = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const [districtCode, info] of candidates) {
      const distance = ((lat - info.lat) ** 2) + ((lng - info.lng) ** 2);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestDistrictCode = districtCode;
      }
    }

    return nearestDistrictCode;
  };

  const syncLocationFromCoordinates = (lat, lng) => {
    const districtCode = findNearestDistrict(lat, lng, selectedProvinceCode);
    if (!districtCode) return;

    const provinceCode = getProvinceCodeFromDistrictCode(districtCode);
    const province = provinces.find((p) => p.code === provinceCode);

    if (province && province._id !== selectedProvince) {
      setSelectedProvince(province._id);
    }

    setSelectedProvinceCode(provinceCode);
    setSelectedDistrict(districtCode);
  };

  useEffect(() => {
    syncLocationFromCoordinatesRef.current = syncLocationFromCoordinates;
  }, [syncLocationFromCoordinates]);

  useEffect(() => {
    if (!selectedProvinceId) {
      setSelectedProvince(null);
      setSelectedProvinceCode(null);
      setSelectedDistrict(null);
      return;
    }

    if (selectedProvinceId !== selectedProvince) {
      setSelectedProvince(selectedProvinceId);
    }

    const matchedProvince = provinces.find((province) => province._id === selectedProvinceId);
    if (matchedProvince?.code && matchedProvince.code !== selectedProvinceCode) {
      setSelectedProvinceCode(matchedProvince.code);
    }
  }, [selectedProvinceId, selectedProvince, provinces, selectedProvinceCode]);

  useEffect(() => {
    if (!selectedDistrictCode) {
      setSelectedDistrict(null);
      return;
    }

    if (selectedDistrictCode !== selectedDistrict) {
      setSelectedDistrict(selectedDistrictCode);
    }

    const provinceCode = getProvinceCodeFromDistrictCode(selectedDistrictCode);
    if (provinceCode !== selectedProvinceCode) {
      setSelectedProvinceCode(provinceCode);
    }
  }, [selectedDistrictCode, selectedDistrict, selectedProvinceCode]);

  useEffect(() => {
    mapModeRef.current = mapMode;
  }, [mapMode]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center: Vĩnh Long
    const defaultCenter = PROVINCE_CENTER['VL'];
    
    // Create map
    const map = L.map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: defaultCenter.zoom,
      scrollWheelZoom: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker if coordinates exist
    if (value?.latitude && value?.longitude) {
      addMarker(map, value.latitude, value.longitude);
      setSelectedCoordinates(value);
    }

    // Click handler
    map.on('click', (e) => {
      if (mapModeRef.current === 'click') {
        addMarker(map, e.latlng.lat, e.latlng.lng);
        setSelectedCoordinates({
          latitude: parseFloat(e.latlng.lat.toFixed(4)),
          longitude: parseFloat(e.latlng.lng.toFixed(4)),
        });
        syncLocationFromCoordinatesRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapRef, value]);

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await locationService.getProvinces();
        const filteredProvinces = res.data.data.filter(p => 
          ['VL', 'TV', 'BT'].includes(p.code)
        );
        setProvinces(filteredProvinces);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedProvinceCode(null);
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoading(true);
        const res = await locationService.getDistrictsByProvince(selectedProvince);
        setDistricts(res.data.data || []);
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDistricts();
  }, [selectedProvince]);

  // Pan to province
  useEffect(() => {
    if (!selectedProvinceCode || !mapInstanceRef.current) return;

    const centerInfo = PROVINCE_CENTER[selectedProvinceCode];
    if (centerInfo) {
      mapInstanceRef.current.setView([centerInfo.lat, centerInfo.lng], centerInfo.zoom);
    }
  }, [selectedProvinceCode]);

  // Pan to district
  useEffect(() => {
    if (!selectedDistrict || !mapInstanceRef.current) return;

    const districtInfo = DISTRICT_COORDINATES[selectedDistrict];
    if (districtInfo) {
      addMarker(mapInstanceRef.current, districtInfo.lat, districtInfo.lng);
      mapInstanceRef.current.setView([districtInfo.lat, districtInfo.lng], 11);
      setSelectedCoordinates({
        latitude: parseFloat(districtInfo.lat.toFixed(4)),
        longitude: parseFloat(districtInfo.lng.toFixed(4)),
      });
    }
  }, [selectedDistrict]);

  const addMarker = (map, lat, lng) => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        shadowSize: [41, 41],
      }),
    }).addTo(map);

    // Allow dragging
    marker.on('dragend', () => {
      const newLat = marker.getLatLng().lat;
      const newLng = marker.getLatLng().lng;
      setSelectedCoordinates({
        latitude: parseFloat(newLat.toFixed(4)),
        longitude: parseFloat(newLng.toFixed(4)),
      });
      syncLocationFromCoordinatesRef.current(newLat, newLng);
    });

    markerRef.current = marker;
  };

  const handleConfirmCoordinates = () => {
    if (!selectedCoordinates) return;

    const inferredProvinceCode = selectedProvinceCode || (selectedDistrict
      ? getProvinceCodeFromDistrictCode(selectedDistrict)
      : null);

    onChange?.({
      coordinates: selectedCoordinates,
      provinceId: selectedProvince || null,
      provinceCode: inferredProvinceCode,
      districtCode: selectedDistrict || null,
    });
  };

  const handleCopyCoordinates = () => {
    if (selectedCoordinates) {
      const text = `${selectedCoordinates.latitude}, ${selectedCoordinates.longitude}`;
      navigator.clipboard.writeText(text);
      alert('Đã sao chép: ' + text);
    }
  };

  const districtInfo = selectedDistrict ? DISTRICT_COORDINATES[selectedDistrict] : null;

  return (
    <Card
      title={<span><EnvironmentOutlined /> Chọn Vị Trí Điểm Quan Trắc</span>}
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <Alert
        message="💡 Chọn vị trí: Click trực tiếp trên bản đồ HOẶC chọn huyện/xã để tự động đặt vị trí"
        type="info"
        style={{ marginBottom: '16px' }}
      />

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12}>
          <label style={{ fontWeight: '600', color: '#262626' }}>Chọn Tỉnh</label>
          <Select
            placeholder="Chọn tỉnh..."
            value={selectedProvince}
            onChange={(value, option) => {
              setSelectedProvince(value);
              setSelectedProvinceCode(option?.code || null);
              setSelectedDistrict(null);
              setMapMode('district');
            }}
            options={provinces.map(p => ({
              label: p.name,
              value: p._id,
              code: p.code,
            }))}
            optionLabelProp="label"
            style={{ width: '100%', marginTop: '4px' }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <label style={{ fontWeight: '600', color: '#262626' }}>Chọn Huyện/Xã</label>
          <Select
            placeholder="Chọn huyện/xã..."
            value={selectedDistrict}
            onChange={(value) => {
              setSelectedDistrict(value);
              setMapMode('district');
            }}
            disabled={!selectedProvince || loading}
            loading={loading}
            options={districts.map(d => ({
              label: d.name,
              value: d.code,
            }))}
            optionLabelProp="label"
            style={{ width: '100%', marginTop: '4px' }}
          />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={24}>
          <label style={{ fontWeight: '600', color: '#262626' }}>
            Cách Chọn Vị Trí Nâng Cao
          </label>
          <Space style={{ marginTop: '8px' }}>
            <Button
              type={mapMode === 'click' ? 'primary' : 'default'}
              onClick={() => setMapMode('click')}
            >
              🖱️ Click Trên Bản Đồ
            </Button>
            <Button
              type={mapMode === 'district' ? 'primary' : 'default'}
              onClick={() => setMapMode('district')}
              disabled={!selectedProvince}
            >
              📍 Chọn Huyện Tự Động
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          height: '400px',
          borderRadius: '6px',
          border: '2px solid #f0f0f0',
          marginBottom: '16px',
          backgroundColor: '#f5f5f5',
        }}
      />

      <Divider />

      {/* Selected Coordinates Info */}
      <Row gutter={16}>
        <Col xs={24} sm={16}>
          {selectedCoordinates ? (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Vĩ Độ (Latitude)">
                <strong style={{ color: '#1890ff', fontSize: '14px' }}>
                  {selectedCoordinates.latitude}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Kinh Độ (Longitude)">
                <strong style={{ color: '#1890ff', fontSize: '14px' }}>
                  {selectedCoordinates.longitude}
                </strong>
              </Descriptions.Item>
              {districtInfo && (
                <Descriptions.Item label="Huyện/Xã">
                  {districtInfo.name}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Empty
              description="Chưa chọn vị trí"
              style={{ padding: '20px', backgroundColor: '#fafafa', borderRadius: '4px' }}
            />
          )}
        </Col>
        <Col xs={24} sm={8}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              block
              onClick={handleConfirmCoordinates}
              disabled={!selectedCoordinates}
              size="large"
            >
              ✓ Xác Nhận Vị Trí
            </Button>
            <Button
              block
              icon={<CopyOutlined />}
              onClick={handleCopyCoordinates}
              disabled={!selectedCoordinates}
            >
              Sao Chép Tọa Độ
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default MapLocationPicker;
