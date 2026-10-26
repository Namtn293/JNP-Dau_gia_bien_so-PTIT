import React from "react";
import { Empty } from "antd";
import {
  Panel,
  PanelHeader,
  LotsContainer,
  LotCard,
  LotPlateBadge,
  LotInfo,
} from "./styled";
import type { AuctionLot } from "../services/type";
import { formatMoney } from "../util/format";

interface LotsListPanelProps {
  lots: AuctionLot[];
  currentPlateNumber: string;
  onSelectLot: (lot: AuctionLot) => void;
}

export const LotsListPanel: React.FC<LotsListPanelProps> = ({
  lots,
  currentPlateNumber,
  onSelectLot,
}) => {
  return (
    <Panel id="lotsPanel">
      <PanelHeader>
        <span>Danh sách lô ({lots.length})</span>
      </PanelHeader>
      <LotsContainer>
        {lots.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lô nào trong phiên"
            style={{ padding: "40px 10px" }}
          />
        ) : (
          lots.map((lot) => {
          const isCurrent =
            lot.isCurrent || lot.plateNumber === currentPlateNumber;
          return (
            <LotCard
              key={lot.roomId || lot.plateNumber}
              $current={isCurrent}
              onClick={() => onSelectLot(lot)}
            >
              <LotPlateBadge>{lot.plateNumber}</LotPlateBadge>
              <LotInfo>
                <div className="name">{lot.plateNumber} · {lot.provinceName}</div>
                <div className="sub">
                  <span>{lot.timeLabel}</span>
                  <span>&bull;</span>
                  <span>{formatMoney(lot.currentPrice)}</span>
                </div>
              </LotInfo>
            </LotCard>
          );
        }))}
      </LotsContainer>
    </Panel>
  );
};

export default LotsListPanel;
