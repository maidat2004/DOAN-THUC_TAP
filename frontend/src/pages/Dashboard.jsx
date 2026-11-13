import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, message, Spin, Button, Select, DatePicker } from 'antd';
import {
  EnvironmentOutlined,
  AlertOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { stationService, dataService, alertService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    maintenanceStations: 0,
    totalData: 0,
    unresolvedAlerts: 0,
    resolvedAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [recentData, setRecentData] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get stations data
      const stationsRes = await stationService.getAllStations();
      const stationsList = stationsRes.data.data || [];
      
      // Get environment data
      const dataRes = await dataService.getEnvironmentData();
      const dataList = dataRes.data.data || [];
      
      let alertsList = [];
      if (user?.role === 'admin') {
        // Get alerts data (admin only)
        const alertsRes = await alertService.getAlerts({});
        alertsList = alertsRes.data.data || [];
      }

      // Calculate statistics
      const activeStations = stationsList.filter(s => s.status === 'active').length;
      const maintenanceStations = stationsList.filter(s => s.status === 'maintenance').length;
      const unresolvedAlerts = user?.role === 'admin'
        ? alertsList.filter(a => !a.isResolved).length
        : 0;
      const resolvedAlerts = user?.role === 'admin'
        ? alertsList.filter(a => a.isResolved).length
        : 0;

      // Type distribution
      const typeData = [
        { name: 'Nước', value: stationsList.filter(s => s.type === 'water').length, type: 'water' },
        { name: 'Không khí', value: stationsList.filter(s => s.type === 'air').length, type: 'air' },
        { name: 'Đất', value: stationsList.filter(s => s.type === 'soil').length, type: 'soil' },
      ];
      setTypeDistribution(typeData.filter(d => d.value > 0));

      setStats({
        totalStations: stationsList.length,
        activeStations,
        maintenanceStations,
        totalData: dataList.length,
        unresolvedAlerts,
        resolvedAlerts,
      });

      // Get recent data
      setRecentData(dataList.slice(0, 8) || []);

      // Generate chart data from actual data
      const chartPoints = {};
      dataList.forEach(item => {
        const dateValue = item.measurementDate || item.recordedDate;
        const date = dateValue ? new Date(dateValue).toLocaleDateString('vi-VN') : 'N/A';
        chartPoints[date] = (chartPoints[date] || 0) + 1;
      });
      
      const chartDataArray = Object.entries(chartPoints).map(([date, count]) => ({
        date,
        value: count,
      })).slice(-7);
      
      setChartData(chartDataArray.length > 0 ? chartDataArray : [
        { date: 'Hôm nay', value: 0 },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      message.error('Lỗi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Điểm Quan Trắc',
      dataIndex: ['station', 'name'],
      key: 'stationName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Loại Môi Trường',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = { water: '💧 Nước', air: '💨 Không khí', soil: '🌱 Đất' };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Ngày Thu Thập',
      dataIndex: 'measurementDate',
      key: 'recordedDate',
      render: (_, record) => {
        const dateValue = record.measurementDate || record.recordedDate;
        return dateValue ? new Date(dateValue).toLocaleString('vi-VN') : '-';
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: '📝 Nháp',
          submitted: '📤 Đã Gửi',
          approved: '✅ Chấp Thuận',
          rejected: '❌ Bị Từ Chối',
        };
        return statusMap[status] || status;
      },
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải dữ liệu..." fullscreen />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={loadData}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng Điểm Quan Trắc"
              value={stats.totalStations}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Điểm Hoạt Động"
              value={stats.activeStations}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.totalStations}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Dữ Liệu Thu Thập"
              value={stats.totalData}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        {user?.role === 'admin' && (
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Cảnh Báo Chưa Xử Lý"
                value={stats.unresolvedAlerts}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card title="📈 Dữ Liệu Thu Thập (7 Ngày Gần Đây)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1890ff"
                  name="Số Lượng Dữ Liệu"
                  dot={{ fill: '#1890ff' }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {typeDistribution.length > 0 ? (
            <Card title="🌍 Phân bố theo Loại">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            <Card title="🌍 Phân bố theo Loại">
              <p style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                Chưa có dữ liệu
              </p>
            </Card>
          )}
        </Col>
      </Row>

      {/* Alerts Summary */}
      <Row gutter={[16, 16]}>
        {user?.role === 'admin' && (
          <Col xs={24} sm={12} lg={6}>
            <Card className="alert-card">
              <Statistic
                title="Cảnh Báo Đã Xử Lý"
                value={stats.resolvedAlerts}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        )}
        <Col xs={24} sm={12} lg={6}>
          <Card className="alert-card">
            <Statistic
              title="Bảo Trì"
              value={stats.maintenanceStations}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Data */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24}>
          <Card title="🕐 Dữ Liệu Gần Đây">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={recentData.map((item) => ({ ...item, key: item._id }))}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 800 }}
                locale={{ emptyText: 'Không có dữ liệu' }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
