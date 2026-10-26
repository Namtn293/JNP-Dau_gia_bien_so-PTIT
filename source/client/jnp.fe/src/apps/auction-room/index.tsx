import React from "react";
import { useParams } from "@tanstack/react-router";
import { PageWrapper, MainGrid } from "./style";

// Components
import AuctionRoomHeader from "./components/AuctionRoomHeader";
import LotsListPanel from "./components/LotsListPanel";
import MainStagePanel from "./components/MainStagePanel";
import InteractionTabsPanel from "./components/InteractionTabsPanel";
import BidConfirmModal from "./components/BidConfirmModal";
import AuctionRoomSkeleton from "./components/AuctionRoomSkeleton";

// Hooks & utils
import { useData } from "./hooks/useData";
import { useAction } from "./hooks/useAction";
import { QUICK_BID_STEPS } from "./util/constants";

export const AuctionRoomPage: React.FC = () => {
  const params = useParams({ strict: false }) as { roomId?: string };
  const rawRoomId = params?.roomId || "";

  const data = useData(rawRoomId);
  const action = useAction({
    currentPrice: data.currentPrice,
    stepPrice: data.stepPrice,
    isEnded: data.isEnded,
    leader: data.leader,
    plateNumber: data.plateNumber,
    sessionCode: data.sessionCode,
    currentUser: data.currentUser,
    customBidInput: data.customBidInput,
    setCustomBidInput: data.setCustomBidInput,
    chatInput: data.chatInput,
    setChatInput: data.setChatInput,
    confirmModal: data.confirmModal,
    setConfirmModal: data.setConfirmModal,
    setMyLastBid: data.setMyLastBid,
    soundEnabled: data.soundEnabled,
    setSoundEnabled: data.setSoundEnabled,
    autoBidEnabled: data.autoBidEnabled,
    setAutoBidEnabled: data.setAutoBidEnabled,
    autoBidMax: data.autoBidMax,
    setAutoBidMax: data.setAutoBidMax,
    sendSocketBid: data.sendSocketBid,
    sendSocketChat: data.sendSocketChat,
    handleAuctionUpdate: data.handleAuctionUpdate,
    addSystemNotice: data.addSystemNotice,
    setChatMessages: data.setChatMessages,
  });

  if (data.isLoading) {
    return <AuctionRoomSkeleton />;
  }

  const lotIndex =
    data.lots.findIndex((l) => l.plateNumber === data.plateNumber) + 1 || 1;

  return (
    <PageWrapper>
      {/* 1. Header Bar (Shared TopNavbar) */}
      <AuctionRoomHeader
        userName={data.currentUser?.fullName || data.currentUser?.name || "Người dùng"}
      />

      {/* 2. Three-Column Main Grid */}
      <MainGrid>
        {/* Left: Lots list */}
        <LotsListPanel
          lots={data.lots}
          currentPlateNumber={data.plateNumber}
          onSelectLot={action.onSelectLot}
        />

        {/* Center: Stage & Bidding Box */}
        <MainStagePanel
          plateNumber={data.plateNumber}
          provinceName={data.provinceName}
          vehicleType={data.vehicleType}
          plateType={data.plateType}
          title={data.title}
          lotIndex={lotIndex}
          totalLots={data.lots.length}
          activeDetailTab={data.activeDetailTab}
          onSelectDetailTab={data.setActiveDetailTab}
          currentPrice={data.currentPrice}
          isPopping={data.isPopping}
          leader={data.leader}
          reserveMet={data.reserveMet}
          remainingSeconds={data.remainingSeconds}
          userLeadState={data.userLeadState}
          stepPrice={data.stepPrice}
          isEnded={data.isEnded}
          quickSteps={QUICK_BID_STEPS}
          onQuickBid={action.onQuickBid}
          onMainBid={action.onMainBid}
          customBidInput={data.customBidInput}
          onChangeCustomBid={data.setCustomBidInput}
          onSubmitCustomBid={action.onSubmitCustomBid}
          autoBidEnabled={data.autoBidEnabled}
          autoBidMax={data.autoBidMax}
          onToggleAutoBid={action.onToggleAutoBid}
          onChangeAutoBidMax={action.onChangeAutoBidMax}
          depositAmount={data.depositAmount}
        />

        {/* Right: Interaction tabs (Chat, Hist, People) */}
        <InteractionTabsPanel
          activeTab={data.activeRightTab}
          onSelectTab={data.setActiveRightTab}
          pinnedNotice={data.pinnedNotice}
          messages={data.chatMessages}
          chatInput={data.chatInput}
          onChangeChatInput={data.setChatInput}
          onSendChat={action.onSendChat}
          history={data.bidHistory}
          participants={data.participants}
          currentLeader={data.leader}
        />
      </MainGrid>

      {/* 3. Bid Confirmation Modal */}
      <BidConfirmModal
        open={data.confirmModal.open}
        bidAmount={data.confirmModal.amount}
        plateNumber={data.plateNumber}
        onCancel={action.onCancelModal}
        onConfirm={action.onConfirmBid}
      />
    </PageWrapper>
  );
};

export default AuctionRoomPage;
