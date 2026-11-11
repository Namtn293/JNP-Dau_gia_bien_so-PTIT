import React from "react";
import {
  Panel,
  InteractionTabBar,
  InteractionTabBtn,
  PinnedNoticeBar,
} from "./styled";
import ChatTabContent from "./ChatTabContent";
import BidHistoryTabContent from "./BidHistoryTabContent";
import ParticipantsTabContent from "./ParticipantsTabContent";
import PriceChartTabContent from "./PriceChartTabContent";
import type {
  ChatMessage,
  BidHistoryItem,
  RoomParticipant,
} from "../services/type";
import type { PriceSeries } from "@/shared/types/auction";

interface InteractionTabsPanelProps {
  activeTab: "chat" | "hist" | "chart" | "ppl";
  onSelectTab: (tab: "chat" | "hist" | "chart" | "ppl") => void;
  pinnedNotice: string;
  // Chat props
  messages: ChatMessage[];
  chatInput: string;
  onChangeChatInput: (val: string) => void;
  onSendChat: () => void;
  canChat?: boolean;
  isEnded?: boolean;
  // History props
  history: BidHistoryItem[];
  // Chart props
  priceSeries?: PriceSeries;
  isPriceSeriesLoading?: boolean;
  currentPrice: number;
  // People props
  participants: RoomParticipant[];
  currentLeader: string;
}

export const InteractionTabsPanel: React.FC<InteractionTabsPanelProps> = ({
  activeTab,
  onSelectTab,
  pinnedNotice,
  messages,
  chatInput,
  onChangeChatInput,
  onSendChat,
  canChat = true,
  isEnded = false,
  history,
  priceSeries,
  isPriceSeriesLoading,
  currentPrice,
  participants,
  currentLeader,
}) => {
  return (
    <Panel id="interactionPanel">
      <InteractionTabBar role="tablist">
        <InteractionTabBtn
          $active={activeTab === "chat"}
          onClick={() => onSelectTab("chat")}
        >
          Trò chuyện
        </InteractionTabBtn>
        <InteractionTabBtn
          $active={activeTab === "hist"}
          onClick={() => onSelectTab("hist")}
        >
          Lịch sử ({history.length})
        </InteractionTabBtn>
        <InteractionTabBtn
          $active={activeTab === "chart"}
          onClick={() => onSelectTab("chart")}
        >
          Biểu đồ
        </InteractionTabBtn>
        <InteractionTabBtn
          $active={activeTab === "ppl"}
          onClick={() => onSelectTab("ppl")}
        >
          Tham gia ({participants.length})
        </InteractionTabBtn>
      </InteractionTabBar>

      {/* Pinned announcement from Host */}
      {activeTab === "chat" && pinnedNotice && (
        <PinnedNoticeBar>
          <span>{pinnedNotice}</span>
        </PinnedNoticeBar>
      )}

      {activeTab === "chat" && (
        <ChatTabContent
          messages={messages}
          chatInput={chatInput}
          onChangeChatInput={onChangeChatInput}
          onSendChat={onSendChat}
          canChat={canChat}
          isEnded={isEnded}
        />
      )}

      {activeTab === "hist" && <BidHistoryTabContent history={history} />}

      {activeTab === "chart" && (
        <PriceChartTabContent
          priceSeries={priceSeries}
          isLoading={isPriceSeriesLoading}
          currentPrice={currentPrice}
        />
      )}

      {activeTab === "ppl" && (
        <ParticipantsTabContent
          participants={participants}
          currentLeader={currentLeader}
        />
      )}
    </Panel>
  );
};

export default InteractionTabsPanel;
