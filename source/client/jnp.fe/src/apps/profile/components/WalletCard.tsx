import React from "react";
import {
  WalletOutlined,
  PlusCircleOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { WalletVO } from "../services/type";
import { formatVnd } from "../util/format";
import { WalletCardWrapper } from "./style";

interface WalletCardProps {
  wallet: WalletVO;
  onOpenTopup: () => void;
  isLoading?: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onOpenTopup,
  isLoading,
}) => {
  return (
    <WalletCardWrapper>
      <div>
        <div className="wallet-top-row">
          <div className="wallet-title">
            <WalletOutlined />
            <span>Ví Đấu Giá Demo</span>
          </div>
          <button className="topup-btn" onClick={onOpenTopup} disabled={isLoading}>
            <PlusCircleOutlined />
            <span>Nạp tiền</span>
          </button>
        </div>

        <div className="balance-display">
          <div className="balance-label">Số dư ví hiện tại</div>
          <div className="balance-value">{formatVnd(wallet.balance)}</div>
        </div>
      </div>

      <div>
        <div className="sub-balances">
          <div className="sub-item">
            <div className="sub-label">
              <LockOutlined />
              <span>Tiền đang đặt cọc</span>
            </div>
            <div className="sub-value">{formatVnd(wallet.heldAmount)}</div>
          </div>

          <div className="sub-item">
            <div className="sub-label">
              <CheckCircleOutlined />
              <span>Tổng giá trị (Ví + Cọc)</span>
            </div>
            <div className="sub-value">
              {formatVnd((wallet.balance || 0) + (wallet.heldAmount || 0))}
            </div>
          </div>
        </div>

        <div className="demo-note">
          * Tiền trong ví là tiền ảo phục vụ thử nghiệm và demo tính năng đấu giá trực tuyến.
        </div>
      </div>
    </WalletCardWrapper>
  );
};

export default WalletCard;

