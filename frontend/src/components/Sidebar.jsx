import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const { Sider } = Layout;

export const Sidebar = ({ collapsed, onCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleExpand = () => {
    if (collapsed) {
      onCollapse(false);
    }
  };

  const handleCollapse = () => {
    if (!collapsed) {
      onCollapse(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    // Public monitor for all roles
    {
      key: '0',
      label: 'Quan trắc công khai',
      onClick: () => navigate('/monitor'),
    },
    // Dashboard (admin only)
    ...(user?.role === 'admin'
      ? [
          {
            key: '1',
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
          },
        ]
      : []),
    // All authenticated users
    {
      key: '4',
      label: 'Bản đồ môi trường',
      onClick: () => navigate('/map'),
    },
    // Alerts (admin only)
    ...(user?.role === 'admin'
      ? [
          {
            key: '5',
            label: 'Cảnh báo',
            onClick: () => navigate('/alerts'),
          },
        ]
      : []),
    {
      key: '6',
      label: 'Báo cáo & Thống kê',
      onClick: () => navigate('/reports'),
    },
    // Admin only
    ...(user?.role === 'admin'
      ? [
          {
            key: '2',
            label: 'Quản lý điểm quan trắc',
            onClick: () => navigate('/stations'),
          },
          {
            key: '7',
            label: 'Quản lý người dùng',
            onClick: () => navigate('/users'),
          },
          {
            key: '8',
            label: 'Cấu hình ngưỡng',
            onClick: () => navigate('/thresholds'),
          },
        ]
      : []),
    // Staff only
    ...(user?.role === 'staff'
      ? [
          {
            key: '3',
            label: 'Nhập dữ liệu',
            onClick: () => navigate('/data-collection'),
          },
        ]
      : []),
  ];

  return (
    <>
      <div
        className={`sidebar-hover-zone ${collapsed ? 'active' : 'inactive'}`}
        onMouseEnter={handleExpand}
        aria-hidden="true"
      />
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={0}
        width={250}
        className="app-sider"
        onMouseEnter={handleExpand}
        onMouseLeave={handleCollapse}
      >
        <div className="logo">
          {!collapsed && <h2>🌍 EMS</h2>}
        </div>

        <Menu theme="dark" mode="inline" items={menuItems} />

        <div className="sidebar-footer">
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div className="user-info">
              <Avatar size="large" icon={<UserOutlined />} />
              {!collapsed && (
                <div className="user-details">
                  <p className="user-name">{user?.fullName}</p>
                  <p className="user-role">{user?.role}</p>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </Sider>
    </>
  );
};
