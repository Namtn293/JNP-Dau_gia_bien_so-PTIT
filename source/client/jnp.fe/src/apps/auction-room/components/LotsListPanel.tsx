import React, { useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLotRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn để đưa biển số đang đấu giá vào chính giữa thanh danh sách lô
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const container = containerRef.current;
      const target = currentLotRef.current;
      if (!container || !target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const delta =
        targetRect.top -
        containerRect.top -
        container.clientHeight / 2 +
        targetRect.height / 2;

      container.scrollTo({
        top: Math.max(0, container.scrollTop + delta),
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [currentPlateNumber, lots.length]);

  return (
    <Panel id="lotsPanel">
      <PanelHeader>
        <span>Danh sách lô ({lots.length})</span>
      </PanelHeader>
      <LotsContainer ref={containerRef}>
        {lots.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lô nào trong phiên"
            style={{ padding: "40px 10px" }}
          />
        ) : (
          lots.map((lot) => {
          const isCurrent = currentPlateNumber
            ? lot.plateNumber === currentPlateNumber
            : Boolean(lot.isCurrent);
          return (
            <LotCard
              key={lot.roomId || lot.plateNumber}
              ref={isCurrent ? currentLotRef : undefined}
              $current={isCurrent}
              onClick={() => onSelectLot(lot)}
            >
              <LotPlateBadge>{lot.plateNumber}</LotPlateBadge>
              <LotInfo>
                <div className="name" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lot.plateNumber} · {lot.provinceName}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#1d4ed8",
                        background: "#dbeafe",
                        borderRadius: 999,
                        padding: "1px 6px",
                        flexShrink: 0,
                      }}
                    >
                      Đang xem
                    </span>
                  )}
                </div>
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
