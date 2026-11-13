import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

export const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getDefaultRouteForRole = (role) => {
    if (role === 'admin') return '/dashboard';
    if (role === 'staff') return '/reports';
    if (role === 'viewer') return '/monitor';
    return '/monitor';
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await register(
        values.fullName,
        values.email,
        values.password,
        values.phone,
        values.company,
        values.role
      );
      if (result.success) {
        message.success(result.message || 'Đăng ký thành công');
        navigate(getDefaultRouteForRole(result.user?.role));
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Lỗi đăng ký, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="🌍 Đăng Ký Tài Khoản">
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ role: 'staff' }}
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
          >
            <Input placeholder="Nhập tên đầy đủ" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số Điện Thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai Trò Mong Muốn"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              options={[
                { label: '👤 Nhân viên', value: 'staff' },
                { label: '👁️ Người xem', value: 'viewer' },
              ]}
            />
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.role !== curr.role} noStyle>
            {({ getFieldValue }) =>
              getFieldValue('role') === 'staff' ? (
                <Form.Item
                  name="company"
                  label="Công Ty/Đơn Vị"
                  rules={[{ required: true, message: 'Vui lòng nhập công ty' }]}
                >
                  <Input placeholder="Tên công ty/đơn vị" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật Khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Ít nhất 6 ký tự" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác Nhận Mật Khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng Ký
          </Button>

          <div className="auth-footer">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
            </p>
            <p style={{ marginTop: 8, color: '#666' }}>
              Nếu đăng ký vai trò Nhân viên, Admin sẽ duyệt và cấp quyền sau.
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
};
