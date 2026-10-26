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
import type {
  ChatMessage,
  BidHistoryItem,
  RoomParticipant,
} from "../services/type";

interface InteractionTabsPanelProps {
  activeTab: "chat" | "hist" | "ppl";
  onSelectTab: (tab: "chat" | "hist" | "ppl") => void;
  pinnedNotice: string;
  // Chat props
  messages: ChatMessage[];
  chatInput: string;
  onChangeChatInput: (val: string) => void;
  onSendChat: () => void;
  // History props
  history: BidHistoryItem[];
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
  history,
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
          Lịch sử giá ({history.length})
        </InteractionTabBtn>
        <InteractionTabBtn
          $active={activeTab === "ppl"}
          onClick={() => onSelectTab("ppl")}
        >
          Người tham gia ({participants.length})
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
        />
      )}

      {activeTab === "hist" && <BidHistoryTabContent history={history} />}

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
