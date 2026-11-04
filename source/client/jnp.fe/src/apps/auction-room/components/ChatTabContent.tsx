import React, { useRef, useEffect } from "react";
import {
  TabBodyArea,
  ChatInputContainer,
  ChatMsgItem,
  ChatTag,
  SystemNoticeItem,
} from "./styled";
import type { ChatMessage } from "../services/type";
import { InfoCircleOutlined } from "@ant-design/icons";

interface ChatTabContentProps {
  messages: ChatMessage[];
  chatInput: string;
  onChangeChatInput: (val: string) => void;
  onSendChat: () => void;
}

export const ChatTabContent: React.FC<ChatTabContentProps> = ({
  messages,
  chatInput,
  onChangeChatInput,
  onSendChat,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <>
      <TabBodyArea>
        {messages.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Chưa có tin nhắn nào trong phòng
          </div>
        ) : (
          messages.map((m, idx) => {
          if (m.isSystem) {
            return (
              <SystemNoticeItem key={m.id || idx}>
                <InfoCircleOutlined /> {m.content}
              </SystemNoticeItem>
            );
          }
          return (
            <ChatMsgItem key={m.id || idx}>
              <span className="author">{m.senderName}</span>
              {m.isHost && <ChatTag $type="host">Host</ChatTag>}
              {m.isMine && <ChatTag $type="mine">Bạn</ChatTag>}
              {m.tag && !m.isHost && !m.isMine && (
                <ChatTag $type="vip">{m.tag}</ChatTag>
              )}
              : <span className="text">{m.content}</span>
            </ChatMsgItem>
          );
        }))}
        <div ref={bottomRef} />
      </TabBodyArea>

      <ChatInputContainer>
        <input
          placeholder="Nhập tin nhắn..."
          maxLength={200}
          value={chatInput}
          onChange={(e) => onChangeChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onSendChat();
            }
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onSendChat();
          }}
        >
          Gửi
        </button>
      </ChatInputContainer>
    </>
  );
};

export default ChatTabContent;
