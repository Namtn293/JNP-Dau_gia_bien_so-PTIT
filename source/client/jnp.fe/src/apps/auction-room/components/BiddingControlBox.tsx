import React from "react";
import {
  BiddingConsole,
  BiddingTopRow,
  PriceLabel,
  BigPriceText,
  SubInfoText,
  CountdownTimer,
  UserStatusBanner,
  QuickIncrementRow,
  QuickStepBtn,
  MainActionBidBtn,
  CustomInputRow,
  AutoBidToggleRow,
  RegulationNote,
  ViewerAlertBanner,
  DepositActionBtn,
} from "./styled";
import { formatMoney, formatCountdown } from "../util/format";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

interface BiddingControlBoxProps {
  currentPrice: number;
  isPopping: boolean;
  leader: string;
  reserveMet: boolean;
  remainingSeconds: number;
  userLeadState: "none" | "leading" | "outbid";
  stepPrice: number;
  isEnded: boolean;
  roomStatus?: "LIVE" | "SOON" | "PAUSED" | "END";
  quickSteps: number[];
  onQuickBid: (multiplier: number) => void;
  onMainBid: () => void;
  customBidInput: string;
  onChangeCustomBid: (val: string) => void;
  onSubmitCustomBid: () => void;
  autoBidEnabled: boolean;
  autoBidMax: string;
  autoBidLoading?: boolean;
  onToggleAutoBid: (checked: boolean) => void;
  onChangeAutoBidMax: (val: string) => void;
  onUpdateAutoBidMax?: () => void;
  depositAmount: number;
  isRegistered?: boolean;
  onOpenDepositModal?: () => void;
  onCancelDeposit?: () => void;
  depositLoading?: boolean;
}

export const BiddingControlBox: React.FC<BiddingControlBoxProps> = ({
  currentPrice,
  isPopping,
  leader,
  reserveMet,
  remainingSeconds,
  userLeadState,
  stepPrice,
  isEnded,
  roomStatus = "LIVE",
  quickSteps,
  onQuickBid,
  onMainBid,
  customBidInput,
  onChangeCustomBid,
  onSubmitCustomBid,
  autoBidEnabled,
  autoBidMax,
  autoBidLoading = false,
  onToggleAutoBid,
  onChangeAutoBidMax,
  onUpdateAutoBidMax,
  depositAmount,
  isRegistered = false,
  onOpenDepositModal,
  onCancelDeposit,
  depositLoading = false,
}) => {
  const isPaused = roomStatus === "PAUSED";
  const isSoon = roomStatus === "SOON";
  const canPlaceBidNow = !isEnded && roomStatus === "LIVE" && isRegistered && userLeadState !== "leading";
  const urgency =
    isPaused || (roomStatus === "LIVE" && remainingSeconds <= 10)
      ? "danger"
      : roomStatus === "LIVE" && remainingSeconds <= 30
      ? "warning"
      : "normal";

  const nextMinimumBid = currentPrice + stepPrice;

  return (
    <BiddingConsole>
      <BiddingTopRow>
        <div>
          <PriceLabel>
            {isEnded ? "Giá trúng cuối cùng" : isSoon ? "Giá khởi điểm" : "Giá hiện tại"}
          </PriceLabel>
          <BigPriceText $popping={isPopping}>
            {formatMoney(currentPrice)}
          </BigPriceText>
          <SubInfoText>
            Dẫn đầu: <b>{leader ? (leader === "Bạn" ? "Bạn" : leader) : "Chưa có"}</b> &bull; Giá sàn:{" "}
            <b style={{ color: reserveMet ? "#059669" : "#d97706" }}>
              {reserveMet ? "đã đạt" : "chưa đạt"}
            </b>
          </SubInfoText>
        </div>

        <div style={{ textAlign: "right" }}>
          <PriceLabel>
            {isPaused
              ? "Trạng thái phiên"
              : isSoon
              ? "Mở phiên sau"
              : isEnded
              ? "Đã kết thúc"
              : "Thời gian còn lại"}
          </PriceLabel>
          <CountdownTimer $urgency={urgency}>
            {isPaused ? "TẠM DỪNG" : formatCountdown(remainingSeconds)}
          </CountdownTimer>
        </div>
      </BiddingTopRow>

      {/* Paused emergency alert */}
      {isPaused && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: 10,
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          Phiên đấu giá đang tạm dừng khẩn cấp bởi Ban tổ chức. Mọi lệnh đặt giá tạm thời bị đóng băng.
        </div>
      )}

      {/* Viewer alert banner when not registered */}
      {!isEnded && !isRegistered && (
        <ViewerAlertBanner>
          <div className="banner-text">
            <SafetyCertificateOutlined />
            <span>
              <b>Chế độ Khách theo dõi:</b> Bạn chưa nộp tiền đặt trước cho phiên này. Hãy nộp cọc để tham gia trả giá.
            </span>
          </div>
          {onOpenDepositModal && (
            <button
              type="button"
              className="btn-quick-deposit"
              onClick={onOpenDepositModal}
            >
              Nộp cọc ngay
            </button>
          )}
        </ViewerAlertBanner>
      )}

      {/* User status alert banner (ẩn thông báo chưa nộp cọc khi phiên đã kết thúc) */}
      {isEnded ? (
        userLeadState === "leading" ? (
          <UserStatusBanner $state="leading">
            <CheckCircleOutlined /> Chúc mừng! Bạn đã trúng đấu giá biển số này
          </UserStatusBanner>
        ) : userLeadState === "outbid" ? (
          <UserStatusBanner $state="none">
            <InfoCircleOutlined /> Phiên đấu giá đã kết thúc
          </UserStatusBanner>
        ) : null
      ) : (
        <UserStatusBanner $state={isRegistered ? userLeadState : "none"}>
          {!isRegistered ? (
            <>
              <InfoCircleOutlined /> Bạn chưa nộp cọc (Đang theo dõi phiên)
            </>
          ) : isSoon ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 8 }}>
              <span>
                <CheckCircleOutlined style={{ color: "#059669", marginRight: 6 }} />
                Bạn đã nộp cọc &amp; sẵn sàng chờ giờ mở phiên
              </span>
              {onCancelDeposit && (
                <button
                  type="button"
                  disabled={depositLoading}
                  onClick={onCancelDeposit}
                  style={{
                    border: "1px solid #dc2626",
                    background: "#fff",
                    color: "#dc2626",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy cọc
                </button>
              )}
            </div>
          ) : userLeadState === "leading" ? (
            <>
              <CheckCircleOutlined /> Bạn đang dẫn đầu phiên đấu giá (Đấu giá viên)
            </>
          ) : userLeadState === "outbid" ? (
            <>
              <CloseCircleOutlined /> Bạn đã bị vượt giá! Đặt lại để giành vị trí dẫn đầu
            </>
          ) : (
            <>
              <CheckCircleOutlined style={{ color: "#059669" }} /> Bạn đã nộp cọc &amp; sẵn sàng đặt giá
            </>
          )}
        </UserStatusBanner>
      )}

      {/* Quick increment buttons */}
      <QuickIncrementRow>
        {quickSteps.map((k) => (
          <QuickStepBtn
            key={k}
            disabled={!canPlaceBidNow}
            onClick={() => onQuickBid(k)}
          >
            +{formatMoney(stepPrice * k).replace(" ₫", "")}
          </QuickStepBtn>
        ))}
      </QuickIncrementRow>

      {/* Big Action Button: Deposit if not registered, otherwise Bid */}
      {!isEnded && !isRegistered ? (
        <DepositActionBtn
          type="button"
          onClick={onOpenDepositModal}
        >
          <SafetyCertificateOutlined style={{ fontSize: 18 }} />
          <span>Nộp tiền đặt trước ({formatMoney(depositAmount)}) để tham gia</span>
        </DepositActionBtn>
      ) : (
        <MainActionBidBtn
          $ended={isEnded || isPaused || isSoon}
          disabled={!canPlaceBidNow}
          onClick={onMainBid}
        >
          {isEnded
            ? "Phiên đấu giá đã kết thúc"
            : isPaused
            ? "Phiên đang tạm dừng"
            : isSoon
            ? "Chưa đến giờ mở phiên"
            : userLeadState === "leading"
            ? "Bạn đang dẫn đầu"
            : `Đặt giá ${formatMoney(nextMinimumBid)}`}
        </MainActionBidBtn>
      )}

      {/* Custom bid input row */}
      <CustomInputRow>
        <input
          inputMode="numeric"
          placeholder={`Nhập giá khác (tối thiểu ${formatMoney(nextMinimumBid)})`}
          value={customBidInput}
          disabled={!canPlaceBidNow}
          onChange={(e) => onChangeCustomBid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canPlaceBidNow) onSubmitCustomBid();
          }}
        />
        <button disabled={!canPlaceBidNow} onClick={onSubmitCustomBid}>
          Đặt
        </button>
      </CustomInputRow>

      {/* Auto-bidding proxy row */}
      <AutoBidToggleRow>
        <label>
          <input
            type="checkbox"
            checked={autoBidEnabled}
            disabled={isEnded || !isRegistered || autoBidLoading}
            onChange={(e) => onToggleAutoBid(e.target.checked)}
          />
          Đặt giá tự động, tối đa
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Mức tối đa (VNĐ)"
            value={autoBidMax}
            disabled={isEnded || !isRegistered || autoBidLoading}
            onChange={(e) => onChangeAutoBidMax(e.target.value)}
            style={{ flex: 1 }}
          />
          {autoBidEnabled && onUpdateAutoBidMax && (
            <button
              type="button"
              disabled={isEnded || !isRegistered || autoBidLoading}
              onClick={onUpdateAutoBidMax}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #1b6284",
                background: "#1b6284",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Lưu
            </button>
          )}
        </div>
      </AutoBidToggleRow>
      {!isEnded && autoBidEnabled && (
        <div style={{ fontSize: 11, color: "#059669", marginTop: -4, marginBottom: 6 }}>
          Đấu giá tự động đang bật trên server (tự động trả sau 5–6.5 giây nếu bị vượt giá).
        </div>
      )}

      {/* Regulation note */}
      <RegulationNote>
        Bước giá <b>{formatMoney(stepPrice)}</b> &bull; Tiền đặt cọc{" "}
        <b>{formatMoney(depositAmount)}</b> &bull; Có đặt giá trong 10 giây cuối sẽ tự
        động gia hạn thêm 30 giây (Quy định chống giật giá phút chót).
      </RegulationNote>
    </BiddingConsole>
  );
};

export default BiddingControlBox;
