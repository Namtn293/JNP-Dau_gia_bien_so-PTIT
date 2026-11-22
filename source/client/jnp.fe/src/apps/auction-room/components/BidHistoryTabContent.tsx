import React from "react";
import { TabBodyArea, BidHistRow } from "./styled";
import type { BidHistoryItem } from "../services/type";
import { formatMoney } from "../util/format";
import { CrownFilled, RobotOutlined } from "@ant-design/icons";

interface BidHistoryTabContentProps {
  history: BidHistoryItem[];
}

export const BidHistoryTabContent: React.FC<BidHistoryTabContentProps> = ({
  history,
}) => {
  return (
    <TabBodyArea>
      {history.length === 0 ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8" }}>
          Chưa có lượt đặt giá nào
        </div>
      ) : (
        history.map((item, idx) => (
          <BidHistRow key={idx} $isMine={item.isMine}>
            <span className="user">
              {item.isWinning && (
                <CrownFilled style={{ color: "#eab308", fontSize: 13 }} />
              )}
              {item.userName}
              {item.isMine && " (Bạn)"}
              {item.source === "AUTO" && (
                <span
                  title="Đặt giá tự động"
                  style={{
                    marginLeft: 4,
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontSize: 10,
                    background: "#f3e8ff",
                    color: "#7e22ce",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <RobotOutlined /> Tự động
                </span>
              )}
            </span>
            <span className="amount">{formatMoney(item.bidAmount)}</span>
            <span className="time">{item.time}</span>
          </BidHistRow>
        ))
      )}
    </TabBodyArea>
  );
};

export default BidHistoryTabContent;
