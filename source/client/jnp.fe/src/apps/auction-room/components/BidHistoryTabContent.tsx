import React from "react";
import { TabBodyArea, BidHistRow } from "./styled";
import type { BidHistoryItem } from "../services/type";
import { formatMoney } from "../util/format";
import { CrownFilled } from "@ant-design/icons";

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
