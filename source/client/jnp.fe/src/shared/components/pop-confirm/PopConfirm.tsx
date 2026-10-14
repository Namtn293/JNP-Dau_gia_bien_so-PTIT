import React from 'react';
import { Popconfirm } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface ConfirmPopconfirmProps {
  title: string;
  message?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  open?: boolean; // Thêm prop open để control từ bên ngoài
  children: React.ReactNode;
}

const ConfirmPopconfirm: React.FC<ConfirmPopconfirmProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  open,
  children,
}) => {
  return (
    <Popconfirm
      title={title}
      description={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      okText="Đồng ý"
      cancelText="Hủy"
      icon={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}
      open={open}

      okButtonProps={{ type: 'primary', loading: loading }}

      overlayInnerStyle={{
        border: '1px solid #91d5ff',
        padding: '12px 16px',
        maxWidth: '250px'
      }}

      placement="topLeft"
    >
      {children}
    </Popconfirm>
  );
};

export default ConfirmPopconfirm;