import { MessageContent, StyledConfirmModal } from "@/apps/admin/components/styled";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  loading?: boolean;
  title?: string;
  message: React.ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onOk: () => void;
  onCancel: () => void;
  zIndex?: number;
  width?: number;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  loading = false,
  title = "Xác nhận thao tác",
  message,
  okText = "Đồng ý",
  cancelText = "Hủy",
  danger = true,
  onOk,
  onCancel,
  zIndex = 2000,
  width = 380,
}) => {
  return (
    <StyledConfirmModal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        danger,
        loading,
      }}
      zIndex={zIndex}
      width={width}
      maskClosable={false}
    >
      <MessageContent>{message}</MessageContent>
    </StyledConfirmModal>
  );
};

export default ConfirmDialog;
