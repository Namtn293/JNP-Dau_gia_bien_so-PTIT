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
  quickSteps: number[];
  onQuickBid: (multiplier: number) => void;
  onMainBid: () => void;
  customBidInput: string;
  onChangeCustomBid: (val: string) => void;
  onSubmitCustomBid: () => void;
  autoBidEnabled: boolean;
  autoBidMax: string;
  onToggleAutoBid: (checked: boolean) => void;
  onChangeAutoBidMax: (val: string) => void;
  depositAmount: number;
  isRegistered?: boolean;
  onOpenDepositModal?: () => void;
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
  quickSteps,
  onQuickBid,
  onMainBid,
  customBidInput,
  onChangeCustomBid,
  onSubmitCustomBid,
  autoBidEnabled,
  autoBidMax,
  onToggleAutoBid,
  onChangeAutoBidMax,
  depositAmount,
  isRegistered = false,
  onOpenDepositModal,
}) => {
  const urgency =
    remainingSeconds <= 10
      ? "danger"
      : remainingSeconds <= 30
      ? "warning"
      : "normal";

  const nextMinimumBid = currentPrice + stepPrice;

  return (
    <BiddingConsole>
      <BiddingTopRow>
        <div>
          <PriceLabel>Giá hiện tại</PriceLabel>
          <BigPriceText $popping={isPopping}>
            {formatMoney(currentPrice)}
          </BigPriceText>
          <SubInfoText>
            Dẫn đầu: <b>{leader === "Bạn" ? "Bạn" : leader}</b> &bull; Giá sàn:{" "}
            <b style={{ color: reserveMet ? "#059669" : "#d97706" }}>
              {reserveMet ? "đã đạt" : "chưa đạt"}
            </b>
          </SubInfoText>
        </div>

        <div style={{ textAlign: "right" }}>
          <PriceLabel>Thời gian còn lại</PriceLabel>
          <CountdownTimer $urgency={urgency}>
            {formatCountdown(remainingSeconds)}
          </CountdownTimer>
        </div>
      </BiddingTopRow>

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

      {/* User status alert banner */}
      <UserStatusBanner $state={isRegistered ? userLeadState : "none"}>
        {!isRegistered ? (
          <>
            <InfoCircleOutlined /> Bạn chưa nộp cọc (Đang theo dõi phiên)
          </>
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
            <CheckCircleOutlined style={{ color: "#059669" }} /> Bạn đã nộp cọc & sẵn sàng đặt giá
          </>
        )}
      </UserStatusBanner>

      {/* Quick increment buttons */}
      <QuickIncrementRow>
        {quickSteps.map((k) => (
          <QuickStepBtn
            key={k}
            disabled={isEnded || !isRegistered || userLeadState === "leading"}
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
          $ended={isEnded}
          disabled={isEnded || !isRegistered || userLeadState === "leading"}
          onClick={onMainBid}
        >
          {isEnded
            ? "Phiên đấu giá đã kết thúc"
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
          disabled={isEnded || !isRegistered}
          onChange={(e) => onChangeCustomBid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmitCustomBid();
          }}
        />
        <button disabled={isEnded || !isRegistered} onClick={onSubmitCustomBid}>
          Đặt
        </button>
      </CustomInputRow>

      {/* Auto-bidding proxy row */}
      <AutoBidToggleRow>
        <label>
          <input
            type="checkbox"
            checked={autoBidEnabled}
            disabled={isEnded || !isRegistered}
            onChange={(e) => onToggleAutoBid(e.target.checked)}
          />
          Đặt giá tự động, tối đa
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Mức tối đa (VNĐ)"
          value={autoBidMax}
          disabled={isEnded || !isRegistered}
          onChange={(e) => onChangeAutoBidMax(e.target.value)}
        />
      </AutoBidToggleRow>

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
