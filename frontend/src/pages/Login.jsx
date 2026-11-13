import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

export const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
      const result = await login(values.email, values.password);
      if (result.success) {
        message.success('Đăng nhập thành công');
        navigate(getDefaultRouteForRole(result.user?.role));
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Lỗi đăng nhập, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-back">
        <Link to="/monitor">← Quay lại quan trắc công khai</Link>
      </div>
      <Card className="auth-card login-card" title="🌍 Đăng Nhập">
        <Form form={form} onFinish={onFinish} layout="vertical">
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
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng Nhập
          </Button>

          <div className="auth-footer">
            <p>
              Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
};
