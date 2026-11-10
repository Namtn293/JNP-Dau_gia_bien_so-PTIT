import React, { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Link } from "@tanstack/react-router";
import type { WalletTransactionVO } from "../services/type";
import { formatVnd, formatDateTime, getTxTypeBadge } from "../util/format";

export const useColumn = () => {
  const columns: ColumnsType<WalletTransactionVO> = useMemo(
    () => [
      {
        title: "Mã GD",
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number) => (
          <span style={{ fontWeight: 600, color: "#595959" }}>#{id}</span>
        ),
      },
      {
        title: "Loại giao dịch",
        dataIndex: "type",
        key: "type",
        width: 160,
        render: (type) => {
          const cfg = getTxTypeBadge(type);
          return (
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          );
        },
      },
      {
        title: "Biến động",
        dataIndex: "amount",
        key: "amount",
        width: 160,
        align: "right",
        render: (amount: number, record) => {
          const cfg = getTxTypeBadge(record.type);
          const isNegative = record.type === "HOLD" || record.type === "CAPTURE";
          const color = isNegative ? "#cf1322" : "#389e0d";
          const prefix = isNegative ? "− " : "+ ";

          return (
            <span style={{ fontWeight: 700, color, fontSize: 13.5 }}>
              {prefix}
              {formatVnd(amount)}
            </span>
          );
        },
      },
      {
        title: "Số dư sau GD",
        dataIndex: "balanceAfter",
        key: "balanceAfter",
        width: 160,
        align: "right",
        render: (val: number) => (
          <span style={{ fontWeight: 600, color: "#14202b" }}>
            {formatVnd(val)}
          </span>
        ),
      },
      {
        title: "Phiên liên quan",
        dataIndex: "sessionCode",
        key: "sessionCode",
        width: 150,
        render: (code?: string | null) => {
          if (!code) return <span style={{ color: "#8c8c8c" }}>-</span>;
          return (
            <Link
              to="/phong-dau-gia/$roomId"
              params={{ roomId: code }}
              style={{ color: "#256b8c", fontWeight: 600 }}
            >
              {code}
            </Link>
          );
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        ellipsis: true,
        render: (note?: string | null) => (
          <span style={{ color: "#586979" }}>{note || "-"}</span>
        ),
      },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (date?: string) => (
          <span style={{ color: "#8c8c8c", fontSize: 12.5 }}>
            {formatDateTime(date)}
          </span>
        ),
      },
    ],
    []
  );

  return { columns };
};

