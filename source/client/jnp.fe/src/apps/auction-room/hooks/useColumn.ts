import React from "react";
import type { ColumnsType } from "antd/es/table";
import type { BidHistoryItem } from "../services/type";
import { formatMoney } from "../util/format";

export const useColumn = () => {
  const bidHistoryColumns: ColumnsType<BidHistoryItem> = [
    {
      title: "Người đặt",
      dataIndex: "userName",
      key: "userName",
      render: (name: string, record: BidHistoryItem) =>
        React.createElement(
          "span",
          { style: { fontWeight: record.isMine ? 800 : 600 } },
          record.isMine ? `${name} (Bạn)` : name
        ),
    },
    {
      title: "Mức giá",
      dataIndex: "bidAmount",
      key: "bidAmount",
      render: (amount: number) => formatMoney(amount),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
  ];

  return {
    bidHistoryColumns,
  };
};

export default useColumn;
