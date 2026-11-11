import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Spin, Tag } from "antd";
import { LineChartOutlined, RobotOutlined } from "@ant-design/icons";
import type { PriceSeries } from "@/shared/types/auction";
import { TabBodyArea } from "./styled";
import { formatMoney } from "../util/format";

interface PriceChartTabContentProps {
  priceSeries?: PriceSeries;
  isLoading?: boolean;
  currentPrice: number;
}

const formatCompactVnd = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace(/\.00$/, "")} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)} tr`;
  }
  return value.toLocaleString("vi-VN");
};

const formatTimeShort = (iso?: string): string => {
  if (!iso) return "";
  const tIdx = iso.indexOf("T");
  if (tIdx !== -1 && iso.length >= tIdx + 9) {
    return iso.slice(tIdx + 1, tIdx + 9);
  }
  return iso;
};

export const PriceChartTabContent: React.FC<PriceChartTabContentProps> = ({
  priceSeries,
  isLoading,
  currentPrice,
}) => {
  const chartData = useMemo(() => {
    const pts = priceSeries?.points || [];
    return pts.map((pt, index) => ({
      idx: index,
      label: index === 0 ? "Khởi điểm" : formatTimeShort(pt.time),
      fullTime: pt.time ? pt.time.replace("T", " ").slice(0, 19) : "",
      price: pt.price,
      bidder: pt.bidder || (index === 0 ? "Giá khởi điểm" : "Ẩn danh"),
      source: pt.source,
      step: pt.step,
    }));
  }, [priceSeries]);

  const maxChartPrice = useMemo(() => {
    if (!chartData.length) return currentPrice;
    return Math.max(...chartData.map((d) => d.price), currentPrice);
  }, [chartData, currentPrice]);

  if (isLoading) {
    return (
      <TabBodyArea style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin tip="Đang tải biểu đồ giá..." />
      </TabBodyArea>
    );
  }

  return (
    <TabBodyArea>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>Giá khởi điểm</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {formatMoney(priceSeries?.startPrice ?? 40_000_000)}
          </div>
        </div>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 11, color: "#15803d" }}>Giá hiện tại</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>
            {formatMoney(currentPrice || maxChartPrice)}
          </div>
        </div>
      </div>

      {chartData.length <= 1 ? (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            color: "#64748b",
            background: "#f8fafc",
            borderRadius: 10,
            border: "1px dashed #cbd5e1",
          }}
        >
          <LineChartOutlined style={{ fontSize: 28, color: "#94a3b8", marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Chưa có biến động bước giá</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            Biểu đồ sẽ cập nhật theo thời gian thực ngay khi có lượt đặt giá mới.
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: 270 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="auctionPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b6284" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#1b6284" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#64748b" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatCompactVnd}
                tick={{ fontSize: 10, fill: "#64748b" }}
                width={52}
                domain={["auto", "auto"]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "8px 10px",
                        boxShadow: "0 4px 12px rgba(15,23,42,0.1)",
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#1b6284", marginBottom: 4 }}>
                        {formatMoney(item.price)}
                      </div>
                      <div style={{ color: "#334155" }}>
                        Người đặt: <b>{item.bidder}</b>
                        {item.source === "AUTO" && (
                          <Tag color="purple" style={{ marginLeft: 6, fontSize: 10 }}>
                            <RobotOutlined /> Tự động
                          </Tag>
                        )}
                      </div>
                      {item.step ? (
                        <div style={{ color: "#059669", fontSize: 11 }}>
                          Bước áp dụng: +{formatCompactVnd(item.step)}
                        </div>
                      ) : null}
                      {item.fullTime && (
                        <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                          {item.fullTime}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {maxChartPrice >= 80_000_000 && (
                <ReferenceLine
                  y={100_000_000}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: "Mốc 100tr (+10tr)", position: "insideTopLeft", fontSize: 10, fill: "#d97706" }}
                />
              )}
              {maxChartPrice >= 450_000_000 && (
                <ReferenceLine
                  y={500_000_000}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: "Mốc 500tr (+20tr)", position: "insideTopLeft", fontSize: 10, fill: "#dc2626" }}
                />
              )}
              <Area
                type="stepAfter"
                dataKey="price"
                stroke="#1b6284"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#auctionPriceGrad)"
                dot={{ r: 3, fill: "#1b6284", strokeWidth: 1, stroke: "#fff" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
        <b>Thang bước giá:</b> &lt;100tr (+5tr) &bull; 100–500tr (+10tr) &bull; &gt;500tr (+20tr)
      </div>
    </TabBodyArea>
  );
};

export default PriceChartTabContent;

