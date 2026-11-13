import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, message, Card, Spin, Row, Col, Alert, Steps, Divider } from 'antd';
import { CheckOutlined, SaveOutlined } from '@ant-design/icons';
import { dataService, stationService } from '../services';
import '../styles/DataCollection.css';

export const DataCollection = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedType, setSelectedType] = useState('water');
  const [stationLoading, setStationLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const res = await stationService.getAllStations();
      setStations(res.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách điểm quan trắc');
    } finally {
      setStationLoading(false);
    }
  };

  const handleStationChange = (value) => {
    const station = stations.find((s) => s._id === value);
    if (station) {
      setSelectedType(station.type);
      form.setFieldValue('type', station.type);
      // Clear data fields when changing station
      form.setFieldsValue({
        ph: undefined,
        do_level: undefined,
        temperature: undefined,
        turbidity: undefined,
        conductivity: undefined,
        pm25: undefined,
        pm10: undefined,
        co2: undefined,
        humidity: undefined,
        pressure: undefined,
        moisture: undefined,
        nitrogen: undefined,
        phosphorus: undefined,
        potassium: undefined,
        organicMatter: undefined,
      });
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setCurrentStep(1);

      // Convert datetime-local to ISO string
      const measurementDate = values.measurementDate 
        ? new Date(values.measurementDate).toISOString()
        : new Date().toISOString();

      const data = {
        station: values.station,
        type: values.type,
        measurementDate: measurementDate,
        notes: values.notes,
      };

      // Thêm dữ liệu chi tiết theo loại
      if (values.type === 'water') {
        data.water = {
          ph: values.ph,
          do_level: values.do_level,
          temperature: values.temperature,
          turbidity: values.turbidity,
          conductivity: values.conductivity,
        };
      } else if (values.type === 'air') {
        data.air = {
          pm25: values.pm25,
          pm10: values.pm10,
          co2: values.co2,
          temperature: values.temperature,
          humidity: values.humidity,
          pressure: values.pressure,
        };
      } else if (values.type === 'soil') {
        data.soil = {
          ph: values.ph,
          moisture: values.moisture,
          nitrogen: values.nitrogen,
          phosphorus: values.phosphorus,
          potassium: values.potassium,
          organicMatter: values.organicMatter,
        };
      }

      await dataService.createData(data);
      
      setCurrentStep(2);
      setTimeout(() => {
        message.success('✅ Dữ liệu đã được gửi và chờ Admin duyệt!');
        form.resetFields();
        setCurrentStep(0);
        setSelectedType('water');
      }, 1500);
    } catch (error) {
      message.error('Lỗi lưu dữ liệu: ' + error.message);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const waterFields = (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="ph"
            label="pH"
            rules={[{ required: true, message: 'Vui lòng nhập pH' }]}
          >
            <InputNumber min={0} max={14} step={0.1} placeholder="6-8" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="temperature"
            label="Nhiệt Độ (°C)"
            rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ' }]}
          >
            <InputNumber min={0} max={50} step={0.1} placeholder="25-30" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="do_level"
            label="DO - Ô xy hòa tan (mg/L)"
            rules={[{ required: true, message: 'Vui lòng nhập DO' }]}
          >
            <InputNumber min={0} max={20} step={0.1} placeholder="4-8" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="turbidity"
            label="Độ Đục (NTU)"
            rules={[{ required: true, message: 'Vui lòng nhập độ đục' }]}
          >
            <InputNumber min={0} max={100} step={0.1} placeholder="1-5" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="conductivity"
        label="Độ Dẫn Điện (µS/cm)"
        rules={[{ required: true, message: 'Vui lòng nhập độ dẫn điện' }]}
      >
        <InputNumber min={0} max={5000} step={1} placeholder="500-1500" />
      </Form.Item>
    </>
  );

  const airFields = (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="pm25"
            label="PM2.5 (µg/m³)"
            rules={[{ required: true, message: 'Vui lòng nhập PM2.5' }]}
          >
            <InputNumber min={0} max={500} step={0.1} placeholder="0-50" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="pm10"
            label="PM10 (µg/m³)"
            rules={[{ required: true, message: 'Vui lòng nhập PM10' }]}
          >
            <InputNumber min={0} max={500} step={0.1} placeholder="0-100" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="co2"
            label="CO2 (ppm)"
            rules={[{ required: true, message: 'Vui lòng nhập CO2' }]}
          >
            <InputNumber min={0} max={2000} step={1} placeholder="400-1000" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="temperature"
            label="Nhiệt Độ (°C)"
            rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ' }]}
          >
            <InputNumber min={-50} max={60} step={0.1} placeholder="20-35" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="humidity"
            label="Độ Ẩm (% RH)"
            rules={[{ required: true, message: 'Vui lòng nhập độ ẩm' }]}
          >
            <InputNumber min={0} max={100} step={0.1} placeholder="30-90" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="pressure"
            label="Áp Suất (hPa)"
            rules={[{ required: true, message: 'Vui lòng nhập áp suất' }]}
          >
            <InputNumber min={900} max={1100} step={0.1} placeholder="1000-1020" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const soilFields = (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="ph"
            label="pH"
            rules={[{ required: true, message: 'Vui lòng nhập pH' }]}
          >
            <InputNumber min={0} max={14} step={0.1} placeholder="6-8" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="moisture"
            label="Độ Ẩm (%)"
            rules={[{ required: true, message: 'Vui lòng nhập độ ẩm' }]}
          >
            <InputNumber min={0} max={100} step={0.1} placeholder="20-40" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="nitrogen"
            label="Nitơ (mg/kg)"
            rules={[{ required: true, message: 'Vui lòng nhập nitơ' }]}
          >
            <InputNumber min={0} max={1000} step={1} placeholder="0-300" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phosphorus"
            label="Phosphor (mg/kg)"
            rules={[{ required: true, message: 'Vui lòng nhập phosphor' }]}
          >
            <InputNumber min={0} max={300} step={0.1} placeholder="0-100" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="potassium"
            label="Kali (mg/kg)"
            rules={[{ required: true, message: 'Vui lòng nhập kali' }]}
          >
            <InputNumber min={0} max={1000} step={1} placeholder="0-300" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="organicMatter"
            label="Chất Hữu Cơ (%)"
            rules={[{ required: true, message: 'Vui lòng nhập chất hữu cơ' }]}
          >
            <InputNumber min={0} max={20} step={0.1} placeholder="1-5" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  if (stationLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải dữ liệu..." fullscreen />
      </div>
    );
  }

  return (
    <div className="data-collection-container">
      <Card
        title={<span>📝 Nhập Dữ Liệu Môi Trường</span>}
      >
        <Alert
          message="Hướng dẫn:"
          description="Vui lòng chọn điểm quan trắc, sau đó nhập các chỉ tiêu theo loại môi trường tương ứng. Tất cả các trường được đánh dấu (*) là bắt buộc."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Steps
          current={currentStep}
          items={[
            { title: 'Dữ liệu', description: 'Nhập thông tin' },
            { title: 'Xác nhận', description: 'Đang lưu...' },
            { title: 'Hoàn thành', description: 'Thành công' },
          ]}
          style={{ marginBottom: '20px' }}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
          <Divider>Thông tin cơ bản</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="station"
                label="Chọn Điểm Quan Trắc *"
                rules={[{ required: true, message: 'Vui lòng chọn điểm' }]}
              >
                <Select
                  placeholder="Chọn điểm quan trắc"
                  onChange={handleStationChange}
                  options={stations.map(s => ({
                    label: `${s.code} - ${s.name}`,
                    value: s._id,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="measurementDate"
                label="Ngày/Giờ Thu Thập *"
                rules={[{ required: true, message: 'Vui lòng chọn ngày giờ' }]}
              >
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="type" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Divider>
            {selectedType === 'water' && '💧 Chỉ tiêu Chất lượng Nước'}
            {selectedType === 'air' && '💨 Chỉ tiêu Chất lượng Không khí'}
            {selectedType === 'soil' && '🌱 Chỉ tiêu Chất lượng Đất'}
          </Divider>

          {selectedType === 'water' && waterFields}
          {selectedType === 'air' && airFields}
          {selectedType === 'soil' && soilFields}

          <Form.Item name="notes" label="Ghi Chú">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú thêm nếu có (tùy chọn)"
              maxLength={500}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            block
            size="large"
          >
            Lưu Dữ Liệu
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default DataCollection;
