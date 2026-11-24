import React from "react";
import { Table, Select, Button } from "antd";
import { ReloadOutlined, HistoryOutlined } from "@ant-design/icons";
import type { WalletTransactionVO } from "../services/type";
import { useColumn } from "../hooks/useColumn";
import { TransactionTableWrapper } from "./style";

interface TransactionHistoryTableProps {
  transactions: WalletTransactionVO[];
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number, size: number) => void;
  txType?: string;
  onTypeChange: (type?: string) => void;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  total,
  page,
  size,
  onPageChange,
  txType,
  onTypeChange,
  isLoading,
  isFetching,
  onRefresh,
}) => {
  const { columns } = useColumn();

  return (
    <TransactionTableWrapper>
      <div className="table-header-row">
        <div className="title-group">
          <h3>
            <HistoryOutlined style={{ marginRight: 8, color: "#256b8c" }} />
            Lịch Sử Giao Dịch Số Dư
          </h3>
          <span>
            Theo dõi chi tiết các lượt nạp tiền, trừ tiền cọc, hoàn cọc và quyết toán chênh lệch trúng đấu giá
          </span>
        </div>

        <div className="filter-group">
          <Select
            style={{ width: 195 }}
            value={txType}
            onChange={onTypeChange}
            placeholder="Tất cả loại GD"
            allowClear
            options={[
              { label: "Tất cả giao dịch", value: "" },
              { label: "Tặng ban đầu", value: "INIT_BONUS" },
              { label: "Nạp tiền", value: "TOPUP" },
              { label: "Trừ tiền đặt cọc", value: "HOLD" },
              { label: "Hoàn tiền cọc", value: "RELEASE" },
              { label: "Chốt cọc trúng đấu", value: "CAPTURE" },
              { label: "Quyết toán chênh lệch", value: "AUCTION_PAYMENT" },
            ]}
          />

          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={onRefresh}
            title="Làm mới lịch sử"
          >
            Làm mới
          </Button>
        </div>
      </div>

      <Table<WalletTransactionVO>
        rowKey="id"
        columns={columns}
        dataSource={transactions}
        loading={isLoading}
        pagination={{
          current: page + 1,
          pageSize: size,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (newPage, newSize) => onPageChange(newPage - 1, newSize),
          showTotal: (totalCount) => `Tổng cộng ${totalCount} giao dịch`,
        }}
        scroll={{ x: 800 }}
      />
    </TransactionTableWrapper>
  );
};

export default TransactionHistoryTable;

