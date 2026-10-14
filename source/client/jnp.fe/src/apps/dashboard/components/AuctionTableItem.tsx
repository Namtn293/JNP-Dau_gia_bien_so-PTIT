import React from "react";
import { Tag } from "antd";
import type { AuctionItem } from "../services/type";
import { formatMoney, getTimeLabel, getPriceLabel } from "../utils/format";
import { STATUS_LABEL_MAP } from "../utils/constants";
import { PlateDisplay, StatusTag, ActionButton } from "./styled";

interface AuctionTableItemProps {
  items: AuctionItem[];
  onOpenBid: (item: AuctionItem) => void;
}

export const AuctionTableItem: React.FC<AuctionTableItemProps> = ({
  items,
  onOpenBid,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #dbe6ee",
        overflowX: "auto",
        boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
      }}
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
          {items.map((item) => (
            <tr key={item.p} style={{ borderBottom: "1px solid #f0f4f7" }}>
              <td style={{ padding: "12px 16px" }}>
                <PlateDisplay $small>{item.p}</PlateDisplay>
              </td>
              <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.prov}</td>
              <td style={{ padding: "12px 16px" }}>
                <Tag color="cyan" style={{ borderRadius: 6 }}>
                  {item.type}
                </Tag>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <StatusTag $st={item.st}>
                  <i />
                  {STATUS_LABEL_MAP[item.st]}
                </StatusTag>
              </td>
              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: "#123d50" }}>
                  {formatMoney(item.price)}
                </div>
                <div style={{ fontSize: 11, color: "#586979" }}>
                  {getPriceLabel(item)}
                </div>
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>
                {getTimeLabel(item)}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>
                {item.bids}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                <ActionButton
                  $ghost={item.st === "end"}
                  onClick={() => onOpenBid(item)}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  {item.st === "end" ? "Chi tiết" : "Vào phòng"}
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuctionTableItem;
