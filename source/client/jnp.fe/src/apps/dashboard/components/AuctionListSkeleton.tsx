import React from "react";
import { Skeleton } from "antd";
import {
  CardsGrid,
  AuctionCard,
  PlateBox,
  RowBetween,
  BoardGrid,
  BoardColumn,
  MiniCard,
} from "./styled";

interface AuctionListSkeletonProps {
  viewMode?: "grid" | "table" | "board";
  count?: number;
}

export const AuctionListSkeleton: React.FC<AuctionListSkeletonProps> = ({
  viewMode = "grid",
  count = 6,
}) => {
  if (viewMode === "table") {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #dbe6ee",
          overflowX: "auto",
          boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
        }}
        aria-busy="true"
        aria-label="Đang tải danh sách bảng..."
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f7fb", borderBottom: "1px solid #dbe6ee" }}>
              <th style={{ padding: "14px 16px", textAlign: "left", color: "#586979", fontWeight: 700 }}>
                Biển số
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", color: "#586979", fontWeight: 700 }}>
                Tỉnh thành
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", color: "#586979", fontWeight: 700 }}>
                Loại biển
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", color: "#586979", fontWeight: 700 }}>
                Trạng thái
              </th>
              <th style={{ padding: "14px 16px", textAlign: "right", color: "#586979", fontWeight: 700 }}>
                Giá hiện tại
              </th>
              <th style={{ padding: "14px 16px", textAlign: "center", color: "#586979", fontWeight: 700 }}>
                Thời gian
              </th>
              <th style={{ padding: "14px 16px", textAlign: "center", color: "#586979", fontWeight: 700 }}>
                Lượt đặt
              </th>
              <th style={{ padding: "14px 16px", textAlign: "right", color: "#586979", fontWeight: 700 }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #f0f4f7" }}>
                <td style={{ padding: "12px 16px" }}>
                  <Skeleton.Button active size="small" style={{ width: 110, height: 28, borderRadius: 6 }} />
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Skeleton.Button active size="small" style={{ width: 70, height: 22, borderRadius: 4 }} />
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Skeleton.Button active size="small" style={{ width: 90, height: 22, borderRadius: 12 }} />
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Skeleton.Button active size="small" style={{ width: 100, height: 20, borderRadius: 4 }} />
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <Skeleton.Input active size="small" style={{ width: 70, height: 16 }} />
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <Skeleton.Input active size="small" style={{ width: 30, height: 16 }} />
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Skeleton.Button active size="small" style={{ width: 85, height: 30, borderRadius: 8 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (viewMode === "board") {
    return (
      <BoardGrid aria-busy="true" aria-label="Đang tải danh sách dạng cột...">
        {["Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"].map((title, colIdx) => (
          <BoardColumn key={colIdx}>
            <h3>
              <span>{title}</span>
              <Skeleton.Button active size="small" style={{ width: 28, height: 20, borderRadius: 99 }} />
            </h3>
            {Array.from({ length: 3 }).map((_, itemIdx) => (
              <MiniCard key={itemIdx} style={{ pointerEvents: "none" }}>
                <div style={{ textAlign: "center", margin: "6px 0" }}>
                  <Skeleton.Button active size="small" style={{ width: 130, height: 28, borderRadius: 6 }} />
                </div>
                <RowBetween>
                  <Skeleton.Button active size="small" style={{ width: 90, height: 18, borderRadius: 4 }} />
                  <Skeleton.Input active size="small" style={{ width: 50, height: 14 }} />
                </RowBetween>
                <RowBetween style={{ marginTop: 8 }}>
                  <Skeleton.Input active size="small" style={{ width: 100, height: 14 }} />
                  <Skeleton.Button active size="small" style={{ width: 65, height: 26, borderRadius: 6 }} />
                </RowBetween>
              </MiniCard>
            ))}
          </BoardColumn>
        ))}
      </BoardGrid>
    );
  }

  // Default Grid View
  return (
    <CardsGrid aria-busy="true" aria-label="Đang tải danh sách thẻ...">
      {Array.from({ length: count }).map((_, index) => (
        <AuctionCard key={index} style={{ pointerEvents: "none" }}>
          <RowBetween>
            <Skeleton.Button active size="small" style={{ width: 100, height: 24, borderRadius: 6 }} />
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Skeleton.Button active size="small" style={{ width: 68, height: 24, borderRadius: 6 }} />
              <Skeleton.Button active size="small" style={{ width: 32, height: 32, borderRadius: 8 }} />
            </div>
          </RowBetween>

          <PlateBox style={{ padding: "18px 12px" }}>
            <Skeleton.Button active style={{ width: 180, height: 40, borderRadius: 8 }} />
          </PlateBox>

          <div>
            <Skeleton.Input active size="small" style={{ width: 90, height: 14, marginBottom: 6 }} />
            <br />
            <Skeleton.Button active style={{ width: 140, height: 24, borderRadius: 6 }} />
          </div>

          <RowBetween>
            <Skeleton.Input active size="small" style={{ width: 80, height: 14 }} />
            <Skeleton.Button active size="small" style={{ width: 90, height: 22, borderRadius: 6 }} />
          </RowBetween>

          <RowBetween style={{ paddingTop: 8, borderTop: "1px dashed #dbe6ee" }}>
            <Skeleton.Input active size="small" style={{ width: 120, height: 14 }} />
            <Skeleton.Button active size="small" style={{ width: 90, height: 32, borderRadius: 8 }} />
          </RowBetween>
        </AuctionCard>
      ))}
    </CardsGrid>
  );
};

export default AuctionListSkeleton;

