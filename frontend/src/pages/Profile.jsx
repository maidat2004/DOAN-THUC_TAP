import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Spin, Avatar, Typography, Modal } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined, MailOutlined, PhoneOutlined, ShopOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';
import '../styles/Profile.css';

const { Title } = Typography;

export const Profile = () => {
  const { user, loading } = useAuth();
  const [form] = Form.useForm();
  const [changePassForm] = Form.useForm();
  const [isChangePassVisible, setIsChangePassVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
      });
    }
  }, [user, form]);

  const onFinishProfile = async (values) => {
    try {
      setIsLoading(true);
      await authService.updateProfile(values);
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      message.error('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishChangePass = async (values) => {
    try {
      await authService.changePassword(values.oldPassword, values.newPassword);
      message.success('Đổi mật khẩu thành công');
      changePassForm.resetFields();
      setIsChangePassVisible(false);
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" tip="Đang tải thông tin..." fullscreen />
      </div>
    );
  }

  if (!user) {
    return <div style={{ padding: '24px' }}>Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className="profile-container" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Card with User Info */}
      <Card
        style={{
          marginBottom: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          border: '1px solid #e6e6ff'
        }}
      >
        <Row gutter={24} align="middle">
          <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '50px'
              }}
            />
          </Col>
          <Col xs={24} sm={20}>
            <Title level={2} style={{ marginTop: 0, marginBottom: 8, color: '#333' }}>
              {user.fullName}
            </Title>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Email</span>
                  <div style={{ fontSize: 14, color: '#333', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <MailOutlined style={{ color: '#667eea' }} />
                    {user.email}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Vai Trò</span>
                  <div style={{
                    marginTop: 4,
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    fontSize: 14,
                    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    {user.role === 'admin' ? 'Quản Trị Viên' : user.role === 'staff' ? 'Nhân Viên' : 'Người Xem'}
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Số Điện Thoại</span>
                  <div style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <PhoneOutlined style={{ color: '#667eea' }} />
                    {user.phone || 'Chưa cập nhật'}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>Công Ty/Đơn Vị</span>
                  <div style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <ShopOutlined style={{ color: '#667eea' }} />
                    {user.company || 'Chưa cập nhật'}
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Edit Profile Section */}
      <Card
        title={<span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>✏️ Cập Nhật Thông Tin</span>}
        style={{
          marginBottom: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishProfile}
          size="large"
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Họ Tên</span>}
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#667eea' }} />} 
                  placeholder="Họ tên đầy đủ"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600 }}>Email</span>}
              >
                <Input 
                  disabled 
                  prefix={<MailOutlined style={{ color: '#667eea' }} />}
                  style={{ borderRadius: 6 }}
                  value={user.email}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Số Điện Thoại</span>}
                name="phone"
              >
                <Input 
                  prefix={<PhoneOutlined style={{ color: '#667eea' }} />} 
                  placeholder="Số điện thoại (tuỳ chọn)"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>Công Ty/Đơn Vị</span>}
                name="company"
              >
                <Input 
                  prefix={<ShopOutlined style={{ color: '#667eea' }} />} 
                  placeholder="Công ty/Đơn vị (tuỳ chọn)"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={12} style={{ marginTop: 24 }}>
            <Col>
              <Button
                type="link"
                onClick={() => setIsChangePassVisible(true)}
                icon={<LockOutlined />}
                size="large"
                style={{ color: '#667eea', fontWeight: 600 }}
              >
                Đổi Mật Khẩu
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isLoading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                Cập Nhật Thông Tin
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Change Password Modal */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>🔐 Đổi Mật Khẩu</span>}
        open={isChangePassVisible}
        onCancel={() => setIsChangePassVisible(false)}
        footer={null}
      >
        <Form
          form={changePassForm}
          onFinish={onFinishChangePass}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Mật Khẩu Cũ</span>}
            name="oldPassword"
            rules={[{ required: true, message: 'Nhập mật khẩu cũ' }]}
          >
            <Input.Password 
              placeholder="Mật khẩu cũ"
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Mật Khẩu Mới</span>}
            name="newPassword"
            rules={[
              { required: true, message: 'Nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password 
              placeholder="Mật khẩu mới"
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>Xác Nhận Mật Khẩu Mới</span>}
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu mới không khớp'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Xác nhận mật khẩu mới"
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
          <Row justify="end" gutter={12} style={{ marginTop: 24 }}>
            <Col>
              <Button onClick={() => setIsChangePassVisible(false)}>Hủy</Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                Đổi Mật Khẩu
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;

