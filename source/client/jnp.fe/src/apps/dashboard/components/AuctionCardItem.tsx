import React from "react";
import { Tag } from "antd";
import { ClockCircleOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import type { AuctionItem } from "../services/type";
import { formatMoney, getTimeLabel, getPriceLabel } from "../utils/format";
import { STATUS_LABEL_MAP } from "../utils/constants";
import {
  AuctionCard,
  PlateBox,
  PlateDisplay,
  RowBetween,
  StatusTag,
  PriceText,
  MuteLabel,
  ActionButton,
  WatchIconButton,
} from "./styled";

interface AuctionCardItemProps {
  item: AuctionItem;
  isWatched?: boolean;
  onToggleWatch?: (item: AuctionItem, isWatched: boolean) => void;
  onOpenBid: (item: AuctionItem) => void;
}

export const AuctionCardItem: React.FC<AuctionCardItemProps> = ({
  item,
  isWatched = false,
  onToggleWatch,
  onOpenBid,
}) => {
  return (
    <AuctionCard>
      <RowBetween>
        <StatusTag $st={item.st}>
          <i />
          {STATUS_LABEL_MAP[item.st]}
        </StatusTag>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 600, margin: 0 }}>
            {item.type}
          </Tag>
          {onToggleWatch && (
            <WatchIconButton
              $watched={isWatched}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatch(item, isWatched);
              }}
            >
              {isWatched ? (
                <StarFilled style={{ color: "#f59e0b" }} />
              ) : (
                <StarOutlined />
              )}
            </WatchIconButton>
          )}
        </div>
      </RowBetween>

      <PlateBox>
        <PlateDisplay>{item.p}</PlateDisplay>
      </PlateBox>

      <div>
        <MuteLabel>{getPriceLabel(item)}</MuteLabel>
        <PriceText>{formatMoney(item.price)}</PriceText>
      </div>

      <RowBetween>
        <MuteLabel>{item.prov}</MuteLabel>
        <Tag
          icon={<ClockCircleOutlined />}
          color={item.st === "live" ? "error" : "default"}
          style={{ fontWeight: 600 }}
        >
          {getTimeLabel(item)}
        </Tag>
      </RowBetween>

      <RowBetween style={{ paddingTop: 8, borderTop: "1px dashed #dbe6ee" }}>
        <MuteLabel>
          Bước: {formatMoney(item.step)} &bull; {item.bids} lượt
        </MuteLabel>
        <ActionButton
          $ghost={item.st === "end"}
          onClick={() => onOpenBid(item)}
        >
          {item.st === "end" ? "Xem kết quả" : "Vào phòng"}
        </ActionButton>
      </RowBetween>
    </AuctionCard>
  );
};

export default AuctionCardItem;
