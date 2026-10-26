import React, { useState } from "react";
import {
  TabBodyArea,
  PresenceGroupHeader,
  ParticipantRow,
  ChatTag,
} from "./styled";
import type { RoomParticipant } from "../services/type";
import { Input, Empty } from "antd";
import { SearchOutlined, CrownFilled } from "@ant-design/icons";

interface ParticipantsTabContentProps {
  participants: RoomParticipant[];
  currentLeader: string;
}

export const ParticipantsTabContent: React.FC<ParticipantsTabContentProps> = ({
  participants,
  currentLeader,
}) => {
  const [keyword, setKeyword] = useState("");

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  const organizers = filtered.filter(
    (p) => p.role === "Ban tổ chức" || p.role === "Giám sát viên"
  );
  const bidders = filtered.filter(
    (p) => p.role !== "Ban tổ chức" && p.role !== "Giám sát viên"
  );

  return (
    <TabBodyArea>
      <div style={{ marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Tìm người dùng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          size="small"
        />
      </div>

      {organizers.length > 0 && (
        <>
          <PresenceGroupHeader>BAN TỔ CHỨC</PresenceGroupHeader>
          {organizers.map((p) => (
            <ParticipantRow key={p.id}>
              <div className="avatar">{p.name.charAt(0)}</div>
              <div className="name">
                {p.name}
                {p.role && <ChatTag $type="host">{p.role}</ChatTag>}
              </div>
              <div className="status">{p.statusText}</div>
            </ParticipantRow>
          ))}
        </>
      )}

      {bidders.length > 0 && (
        <>
          <PresenceGroupHeader>
            NGƯỜI THAM GIA ({bidders.length})
          </PresenceGroupHeader>
          {bidders.map((p) => {
            const isLead = p.name === currentLeader || p.isLeader;
            return (
              <ParticipantRow key={p.id} $isSelf={p.isSelf}>
                <div className="avatar">{p.name.charAt(0)}</div>
                <div className="name">
                  {p.name}
                  {p.isSelf && <small>(bạn)</small>}
                  {isLead && <ChatTag $type="vip">Dẫn đầu</ChatTag>}
                </div>
                <div className="status">
                  {isLead ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#d97706" }}>
                      <CrownFilled style={{ color: "#eab308" }} /> Dẫn đầu
                    </span>
                  ) : (
                    p.statusText || "Đang theo dõi"
                  )}
                </div>
              </ParticipantRow>
            );
          })}
        </>
      )}

      {organizers.length === 0 && bidders.length === 0 && (
        <Empty
          description={keyword ? "Không tìm thấy người dùng phù hợp" : "Chưa có người tham gia"}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 32 }}
        />
      )}
    </TabBodyArea>
  );
};

export default ParticipantsTabContent;
