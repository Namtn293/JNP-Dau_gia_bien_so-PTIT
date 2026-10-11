import React from "react";
import { Tag } from "antd";
import type { AuctionItem, AuctionStatus } from "../services/type";
import { formatMoney, getTimeLabel } from "../utils/format";
import { STATUS_LABEL_MAP } from "../utils/constants";
import {
  BoardGrid,
  BoardColumn,
  MiniCard,
  PlateDisplay,
  RowBetween,
  PriceText,
  MuteLabel,
  ActionButton,
} from "./styled";

interface AuctionBoardItemProps {
  data: AuctionItem[];
  onOpenBid: (item: AuctionItem) => void;
}

export const AuctionBoardItem: React.FC<AuctionBoardItemProps> = ({
  data,
  onOpenBid,
}) => {
  const columns: AuctionStatus[] = ["live", "soon", "end"];

  return (
    <BoardGrid>
      {columns.map((st) => {
        const colItems = data.filter((x) => x.st === st);
        return (
          <BoardColumn key={st}>
            <h3>
              <span>{STATUS_LABEL_MAP[st]}</span>
              <Tag color="blue" style={{ borderRadius: 99, fontWeight: 700 }}>
                {colItems.length}
              </Tag>
            </h3>

            {colItems.map((item) => (
              <MiniCard key={item.p}>
                <div style={{ textAlign: "center", margin: "6px 0" }}>
                  <PlateDisplay $small>{item.p}</PlateDisplay>
                </div>

                <RowBetween>
                  <PriceText $small>{formatMoney(item.price)}</PriceText>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#586979" }}>
                    {getTimeLabel(item)}
                  </span>
                </RowBetween>

                <RowBetween>
                  <MuteLabel>
                    {item.prov} &bull; {item.type}
                  </MuteLabel>
                  <ActionButton
                    $ghost={st === "end"}
                    onClick={() => onOpenBid(item)}
                    style={{ padding: "5px 10px", fontSize: 12 }}
                  >
                    {st === "end" ? "Xem" : "Đấu giá"}
                  </ActionButton>
                </RowBetween>
              </MiniCard>
            ))}
          </BoardColumn>
        );
      })}
    </BoardGrid>
  );
};

export default AuctionBoardItem;
