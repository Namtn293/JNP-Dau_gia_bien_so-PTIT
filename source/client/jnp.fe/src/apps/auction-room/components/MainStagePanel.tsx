import React from "react";
import {
  Panel,
  StageContainer,
  StageInfo,
  DetailTabsBar,
  DetailTabBtn,
  DetailContentBox,
} from "./styled";
import PlateDisplayBanner from "./PlateDisplayBanner";
import BiddingControlBox from "./BiddingControlBox";
import { LOT_DETAILS } from "../util/constants";

interface MainStagePanelProps {
  plateNumber: string;
  provinceName: string;
  vehicleType: string;
  plateType: string;
  title: string;
  lotIndex: number;
  totalLots: number;
  activeDetailTab: string;
  onSelectDetailTab: (tabKey: string) => void;
  // Bidding props
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
  isWatched?: boolean;
  onToggleWatch?: () => void;
  watchLoading?: boolean;
}

export const MainStagePanel: React.FC<MainStagePanelProps> = ({
  plateNumber,
  provinceName,
  vehicleType,
  plateType,
  title,
  lotIndex,
  totalLots,
  activeDetailTab,
  onSelectDetailTab,
  currentPrice,
  isPopping,
  leader,
  reserveMet,
  remainingSeconds,
  userLeadState,
  stepPrice,
  isEnded,
  roomStatus,
  quickSteps,
  onQuickBid,
  onMainBid,
  customBidInput,
  onChangeCustomBid,
  onSubmitCustomBid,
  autoBidEnabled,
  autoBidMax,
  autoBidLoading,
  onToggleAutoBid,
  onChangeAutoBidMax,
  onUpdateAutoBidMax,
  depositAmount,
  isRegistered,
  onOpenDepositModal,
  onCancelDeposit,
  depositLoading,
  isWatched,
  onToggleWatch,
  watchLoading,
}) => {
  const tabs = [
    { key: "desc", label: "Mô tả" },
    { key: "legal", label: "Hồ sơ pháp lý" },
    { key: "rules", label: "Quy chế & Tiền cọc" },
    { key: "delivery", label: "Thủ tục nhận xe" },
  ];

  return (
    <Panel className="stage">
      <StageContainer>
        {/* Visual License Plate Mockup */}
        <PlateDisplayBanner
          plateNumber={plateNumber}
          provinceName={provinceName}
          vehicleType={vehicleType}
          lotIndex={lotIndex}
          totalLots={totalLots}
          isWatched={isWatched}
          onToggleWatch={onToggleWatch}
          watchLoading={watchLoading}
        />

        {/* Title and Meta Information */}
        <StageInfo>
          <h3>{title}</h3>
          <p>
            Tỉnh thành: <b>{provinceName}</b> &bull; Phân loại: <b>{plateType}</b> &bull; Phương tiện: <b>{vehicleType}</b>
          </p>
        </StageInfo>

        {/* Detail Tabs Bar */}
        <DetailTabsBar role="tablist">
          {tabs.map((t) => (
            <DetailTabBtn
              key={t.key}
              $active={activeDetailTab === t.key}
              onClick={() => onSelectDetailTab(t.key)}
            >
              {t.label}
            </DetailTabBtn>
          ))}
        </DetailTabsBar>

        {/* Tab Content Display */}
        <DetailContentBox>
          {LOT_DETAILS[activeDetailTab] || LOT_DETAILS.desc}
        </DetailContentBox>

        {/* Real-time Bidding Console */}
        <BiddingControlBox
          currentPrice={currentPrice}
          isPopping={isPopping}
          leader={leader}
          reserveMet={reserveMet}
          remainingSeconds={remainingSeconds}
          userLeadState={userLeadState}
          stepPrice={stepPrice}
          isEnded={isEnded}
          roomStatus={roomStatus}
          quickSteps={quickSteps}
          onQuickBid={onQuickBid}
          onMainBid={onMainBid}
          customBidInput={customBidInput}
          onChangeCustomBid={onChangeCustomBid}
          onSubmitCustomBid={onSubmitCustomBid}
          autoBidEnabled={autoBidEnabled}
          autoBidMax={autoBidMax}
          autoBidLoading={autoBidLoading}
          onToggleAutoBid={onToggleAutoBid}
          onChangeAutoBidMax={onChangeAutoBidMax}
          onUpdateAutoBidMax={onUpdateAutoBidMax}
          depositAmount={depositAmount}
          isRegistered={isRegistered}
          onOpenDepositModal={onOpenDepositModal}
          onCancelDeposit={onCancelDeposit}
          depositLoading={depositLoading}
        />
      </StageContainer>
    </Panel>
  );
};

export default MainStagePanel;
