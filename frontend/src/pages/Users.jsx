import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Spin, Tag, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { authService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Users.css';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [approvalMode, setApprovalMode] = useState('approve');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      setUsers(res.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách người dùng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (userId === currentUser?._id) {
      message.warning('Bạn không thể tự xóa tài khoản của chính mình');
      return;
    }

    Modal.confirm({
      title: 'Xác Nhận Xóa',
      content: `Bạn có chắc chắn muốn xóa người dùng "${userName}" không?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await authService.deleteUser(userId);
          message.success('Xóa người dùng thành công');
          loadUsers();
        } catch (error) {
          message.error('Lỗi xóa người dùng: ' + error.message);
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const handleCreateUser = async (values) => {
    try {
      setCreateLoading(true);
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
        company: values.company,
      };

      await authService.createUser(payload);
      message.success('Tạo tài khoản thành công');
      setCreateModalVisible(false);
      createForm.resetFields();
      loadUsers();
    } catch (error) {
      message.error('Lỗi tạo tài khoản: ' + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const openApproveModal = (user) => {
    const isPendingApproval = user.role === 'viewer' && user.requestedRole === 'staff';
    setApprovalMode(isPendingApproval ? 'approve' : 'edit');
    setSelectedUser(user);
    approveForm.setFieldsValue({
      role: user.requestedRole || user.role || 'viewer',
      company: user.company || '',
    });
    setApproveModalVisible(true);
  };

  const handleApproveUser = async (values) => {
    if (!selectedUser) return;

    try {
      setApproveLoading(true);
      await authService.updateUser(selectedUser._id, {
        role: values.role,
        company: values.company,
        requestedRole: null,
      });
      message.success(approvalMode === 'approve' ? 'Duyệt tài khoản thành công' : 'Cập nhật quyền thành công');
      setApproveModalVisible(false);
      approveForm.resetFields();
      loadUsers();
    } catch (error) {
      message.error('Lỗi duyệt tài khoản: ' + error.message);
    } finally {
      setApproveLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colorMap = {
      admin: 'red',
      staff: 'blue',
      viewer: 'green',
    };
    const labelMap = {
      admin: '👨‍💼 Admin',
      staff: '👤 Nhân viên',
      viewer: '👁️ Xem',
    };
    return { color: colorMap[role] || 'default', label: labelMap[role] || role };
  };

  const getStatusTag = (user) => {
    const isActive = user.isActive !== false;
    if (!isActive) {
      return <Tag color="red">❌ Vô Hiệu</Tag>;
    }
    if (user.role === 'viewer' && user.requestedRole === 'staff') {
      return <Tag color="orange">⏳ Chờ Duyệt</Tag>;
    }
    return (
      <Tag color="green">✅ Hoạt Động</Tag>
    );
  };

  const renderRequestedRole = (role, currentRole) => {
    if (currentRole !== 'viewer' || role !== 'staff') return '-';
    const roleMap = {
      staff: '👤 Nhân viên',
      viewer: '👁️ Người xem',
    };
    return <Tag color="gold">{roleMap[role] || role}</Tag>;
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên đầy đủ',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
      render: (company) => company || '-',
    },
    {
      title: 'Yêu cầu',
      dataIndex: 'requestedRole',
      key: 'requestedRole',
      render: (requestedRole, record) => renderRequestedRole(requestedRole, record.role),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const { color, label } = getRoleColor(role);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Lần đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const isPendingApproval = record.role === 'viewer' && record.requestedRole === 'staff';

        return (
        <Space size="small">
          {isPendingApproval && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openApproveModal(record)}
            >
              Duyệt
            </Button>
          )}
          {!isPendingApproval && record.role !== 'admin' && record._id !== currentUser?._id && (
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => openApproveModal(record)}
            >
              Sửa quyền
            </Button>
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record._id, record.fullName)}
            loading={deleteLoading}
            disabled={record._id === currentUser?._id}
          >
            Xóa
          </Button>
        </Space>
      );
      },
    },
  ];

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    viewers: users.filter(u => u.role === 'viewer').length,
  };

  return (
    <div className="users-container">
      <Card
        title={<span><UserOutlined /> Quản Lý Người Dùng</span>}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo tài khoản
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadUsers}
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
                title="Tổng người dùng"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Admin"
                value={stats.admins}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nhân viên"
                value={stats.staff}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Người xem"
                value={stats.viewers}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <Input.Search
          placeholder="Tìm kiếm theo tên hoặc email..."
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: '16px' }}
          allowClear
        />

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredUsers.map((user) => ({ ...user, key: user._id }))}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </Card>

      {/* Create User Modal */}
      <Modal
        title="➕ Tạo Tài Khoản Mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={createLoading}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{ role: 'staff' }}
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Họ tên đầy đủ" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="name@company.com" />
          </Form.Item>

          <Form.Item name="phone" label="Số Điện Thoại">
            <Input placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai Trò"
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
        </Form>
      </Modal>

      {/* Approve User Modal */}
      <Modal
        title={approvalMode === 'approve' ? '✅ Duyệt Tài Khoản' : '🔐 Cập Nhật Quyền Người Dùng'}
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          approveForm.resetFields();
        }}
        onOk={() => approveForm.submit()}
        okText={approvalMode === 'approve' ? 'Duyệt' : 'Lưu'}
        cancelText="Hủy"
        confirmLoading={approveLoading}
      >
        <Form
          form={approveForm}
          layout="vertical"
          onFinish={handleApproveUser}
          initialValues={{ role: 'viewer' }}
        >
          <Form.Item
            name="role"
            label={approvalMode === 'approve' ? 'Phê Duyệt Vai Trò' : 'Vai Trò'}
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
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
