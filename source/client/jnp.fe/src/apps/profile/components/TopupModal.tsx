import React from "react";
import { InputNumber } from "antd";
import {
  InfoCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import ModalForm, { type IFormItem } from "@apps/admin/components/ModalForm";
import { TOPUP_PRESETS, MIN_TOPUP, MAX_TOPUP } from "../feature/topupValidation";
import { formatVnd } from "../util/format";
import { TopupModalBody } from "./style";

interface TopupModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onAmountChange: (val: number) => void;
  onSelectPreset: (val: number) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  open,
  onClose,
  amount,
  onAmountChange,
  onSelectPreset,
  onSubmit,
  loading,
}) => {
  const formItems: IFormItem[] = [];

  return (
    <ModalForm
      open={open}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
          <DollarOutlined style={{ color: "#256b8c" }} />
          <span>Nạp Tiền Vào Ví Đấu Giá</span>
        </div>
      }
      onCancel={onClose}
      onOk={onSubmit}
      loading={loading}
      okText={`Xác nhận nạp ${formatVnd(amount)}`}
      cancelText="Hủy bỏ"
      width={520}
      formItems={formItems}
      requiredMark={false}
      centered
      okButtonProps={{
        style: {
          backgroundColor: "#256b8c",
          borderColor: "#256b8c",
          fontWeight: 600,
        },
      }}
    >
      <TopupModalBody>
        <div className="notice-banner">
          <InfoCircleOutlined style={{ fontSize: 16, flexShrink: 0 }} />
          <span>
            Hệ thống sử dụng tiền ảo dùng cho môi trường thử nghiệm và đào tạo đấu giá, không có giá trị tiền mặt thật.
          </span>
        </div>

        <div className="section-label">Chọn nhanh số tiền nạp:</div>
        <div className="presets-grid">
          {TOPUP_PRESETS.map((preset) => (
            <button
              key={preset.value}
              className={`preset-btn ${amount === preset.value ? "active" : ""}`}
              onClick={() => onSelectPreset(preset.value)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="section-label">Hoặc nhập số tiền tùy chọn (VNĐ):</div>
        <InputNumber
          style={{ width: "100%", height: 42, fontSize: 16 }}
          min={MIN_TOPUP}
          max={MAX_TOPUP}
          step={1_000_000}
          value={amount}
          onChange={(val) => onAmountChange(val || 0)}
          formatter={(val) =>
            val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
          }
          parser={(val) =>
            val ? Number(val.replace(/\./g, "").replace(/[^0-9]/g, "")) : 0
          }
          addonAfter="VNĐ"
        />
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            marginTop: 6,
            textAlign: "right",
          }}
        >
          Tối thiểu {formatVnd(MIN_TOPUP)} − Tối đa {formatVnd(MAX_TOPUP)}
        </div>
      </TopupModalBody>
    </ModalForm>
  );
};

export default TopupModal;
