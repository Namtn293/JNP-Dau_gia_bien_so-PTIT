import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import ModalForm, { type IFormItem } from "@apps/admin/components/ModalForm";
import { DepositModalBody } from "./styled";
import { formatMoney } from "../util/format";

interface DepositConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  sessionCode: string;
  plateNumber: string;
  depositAmount: number;
  walletAvailable: number;
}

export const DepositConfirmModal: React.FC<DepositConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  sessionCode,
  plateNumber,
  depositAmount = 40_000_000,
  walletAvailable = 0,
}) => {
  const navigate = useNavigate();
  const formItems: IFormItem[] = [];

  const isSufficient = walletAvailable >= depositAmount;

  return (
    <ModalForm
      open={open}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
          <SafetyCertificateOutlined style={{ color: "#059669" }} />
          <span>Xác nhận Nộp tiền đặt trước (Ký quỹ)</span>
        </div>
      }
      onCancel={onClose}
      onOk={onConfirm}
      loading={loading}
      okText={
        isSufficient
          ? `Xác nhận nộp cọc ${formatMoney(depositAmount)}`
          : "Số dư không đủ"
      }
      cancelText="Đóng"
      width={520}
      formItems={formItems}
      requiredMark={false}
      centered
      okButtonProps={{
        disabled: !isSufficient,
        style: {
          backgroundColor: isSufficient ? "#059669" : "#94a3b8",
          borderColor: isSufficient ? "#059669" : "#94a3b8",
          fontWeight: 600,
        },
      }}
    >
      <DepositModalBody>
        <div className="notice-box">
          <CheckCircleOutlined />
          <span>
            Khoản tiền đặt trước sẽ được phong tỏa tạm thời theo quy định tại Nghị định 39/2023/NĐ-CP.
            Hệ thống <b>tự động hoàn trả 100% tiền đặt trước</b> cho bạn nếu bạn không trúng đấu giá khi phiên kết thúc.
          </span>
        </div>

        <div className="session-summary">
          <div className="summary-row">
            <span className="label">Biển số đấu giá:</span>
            <span className="val">{plateNumber || sessionCode}</span>
          </div>
          <div className="summary-row">
            <span className="label">Mã phiên đấu giá:</span>
            <span className="val">{sessionCode}</span>
          </div>
          <div className="summary-row">
            <span className="label">Tiền đặt trước quy định:</span>
            <span className="val highlight">{formatMoney(depositAmount)}</span>
          </div>
        </div>

        <div
          className={`wallet-status-box ${
            isSufficient ? "sufficient" : "insufficient"
          }`}
        >
          <div className="wallet-info">
            <span className="sub">Số dư ví khả dụng hiện tại:</span>
            <span className="amount">{formatMoney(walletAvailable)}</span>
          </div>

          {!isSufficient && (
            <button
              type="button"
              className="btn-topup-link"
              onClick={() => {
                onClose();
                navigate({ to: "/profile" });
              }}
            >
              <PlusCircleOutlined />
              <span>Nạp thêm tiền</span>
            </button>
          )}
        </div>

        {!isSufficient && (
          <div
            style={{
              fontSize: 12,
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <WarningOutlined />
            <span>
              Số dư khả dụng trong ví không đủ để nộp cọc. Vui lòng nạp thêm tối thiểu{" "}
              <b>{formatMoney(depositAmount - walletAvailable)}</b> để tiếp tục.
            </span>
          </div>
        )}
      </DepositModalBody>
    </ModalForm>
  );
};

export default DepositConfirmModal;

