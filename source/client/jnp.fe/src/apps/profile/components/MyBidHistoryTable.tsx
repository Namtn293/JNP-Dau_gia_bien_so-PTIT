import React, { useState } from "react";
import { Table, Select, Button, Tag, Modal, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  TrophyOutlined,
  RobotOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type { MyAuctionHistoryVO, MySessionBidItemVO } from "../services/type";
import { getMyBidsInSessionApi } from "../services/api";
import { TransactionTableWrapper } from "./style";
import { formatVnd } from "../util/format";

interface MyBidHistoryTableProps {
  bids: MyAuctionHistoryVO[];
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number, size: number) => void;
  resultFilter?: string;
  onResultFilterChange: (result?: string) => void;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

const RESULT_BADGES: Record<string, { label: string; color: string }> = {
  LEADING: { label: "Đang dẫn đầu", color: "blue" },
  OUTBID: { label: "Đã bị vượt giá", color: "orange" },
  WON: { label: "Trúng đấu giá", color: "green" },
  LOST: { label: "Không trúng", color: "default" },
};

const DEPOSIT_BADGES: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Đang giữ cọc", color: "processing" },
  RELEASED: { label: "Đã hoàn cọc", color: "success" },
  CAPTURED: { label: "Đã trừ cọc", color: "purple" },
  CANCELLED: { label: "Đã hủy", color: "default" },
};

export const MyBidHistoryTable: React.FC<MyBidHistoryTableProps> = ({
  bids,
  total,
  page,
  size,
  onPageChange,
  resultFilter,
  onResultFilterChange,
  isLoading,
  isFetching,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    session?: MyAuctionHistoryVO;
    items: MySessionBidItemVO[];
    loading: boolean;
  }>({ open: false, items: [], loading: false });

  const openBidDetail = async (record: MyAuctionHistoryVO) => {
    setDetailModal({ open: true, session: record, items: [], loading: true });
    try {
      const items = await getMyBidsInSessionApi(record.sessionCode);
      setDetailModal({
        open: true,
        session: record,
        items: Array.isArray(items) ? items : [],
        loading: false,
      });
    } catch {
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns: ColumnsType<MyAuctionHistoryVO> = [
    {
      title: "Biển số & Phiên",
      key: "plate",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
            {r.plateNumber}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {r.sessionCode} &bull; {r.provinceName}
          </div>
        </div>
      ),
    },
    {
      title: "Số lượt đặt",
      key: "myBidCount",
      align: "center",
      render: (_, r) => (
        <Space direction="vertical" size={2} align="center">
          <span style={{ fontWeight: 600 }}>{r.myBidCount} lượt</span>
          {r.myAutoBidCount > 0 && (
            <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>
              <RobotOutlined /> {r.myAutoBidCount} tự động
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Giá cao nhất của tôi",
      dataIndex: "myHighestBid",
      key: "myHighestBid",
      align: "right",
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: "#1b6284" }}>{formatVnd(val)}</span>
      ),
    },
    {
      title: "Giá hiện tại / chốt",
      dataIndex: "finalPrice",
      key: "finalPrice",
      align: "right",
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatVnd(val)}</span>
      ),
    },
    {
      title: "Tiền cọc",
      dataIndex: "depositStatus",
      key: "depositStatus",
      align: "center",
      render: (st?: string | null) => {
        if (!st) return <span style={{ color: "#94a3b8" }}>—</span>;
        const cfg = DEPOSIT_BADGES[st] || { label: st, color: "default" };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      key: "result",
      align: "center",
      render: (res: string) => {
        const cfg = RESULT_BADGES[res] || { label: res, color: "default" };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openBidDetail(r)}
          >
            Lượt đặt
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<ArrowRightOutlined />}
            onClick={() =>
              navigate({
                to: "/phong-dau-gia/$roomId",
                params: { roomId: r.sessionCode },
              })
            }
          >
            Phòng
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <TransactionTableWrapper>
      <div className="table-header-row">
        <div className="title-group">
          <h3>
            <TrophyOutlined style={{ marginRight: 8, color: "#256b8c" }} />
            Lịch Sử Phiên Đấu Giá Của Tôi
          </h3>
          <span>
            Tổng hợp các biển số bạn đã tham gia trả giá, mức giá cao nhất và trạng thái hoàn cọc
          </span>
        </div>

        <div className="filter-group">
          <Select
            style={{ width: 190 }}
            value={resultFilter}
            onChange={onResultFilterChange}
            placeholder="Tất cả kết quả"
            allowClear
            options={[
              { label: "Tất cả kết quả", value: "" },
              { label: "Đang dẫn đầu", value: "LEADING" },
              { label: "Đã bị vượt giá", value: "OUTBID" },
              { label: "Trúng đấu giá", value: "WON" },
              { label: "Không trúng", value: "LOST" },
            ]}
          />

          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={onRefresh}
            title="Làm mới lịch sử đấu giá"
          >
            Làm mới
          </Button>
        </div>
      </div>

      <Table<MyAuctionHistoryVO>
        rowKey="sessionCode"
        columns={columns}
        dataSource={bids}
        loading={isLoading}
        pagination={{
          current: page + 1,
          pageSize: size,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (newPage, newSize) => onPageChange(newPage - 1, newSize),
          showTotal: (totalCount) => `Tổng cộng ${totalCount} phiên`,
        }}
        scroll={{ x: 850 }}
      />

      <Modal
        open={detailModal.open}
        title={
          detailModal.session
            ? `Chi tiết các lượt đặt — ${detailModal.session.plateNumber} (${detailModal.session.sessionCode})`
            : "Chi tiết lượt đặt"
        }
        onCancel={() => setDetailModal({ open: false, items: [], loading: false })}
        footer={null}
        width={620}
      >
        <Table<MySessionBidItemVO>
          rowKey={(_, idx) => String(idx)}
          loading={detailModal.loading}
          dataSource={detailModal.items}
          pagination={false}
          size="small"
          columns={[
            {
              title: "Thời gian",
              key: "time",
              render: (_, it) =>
                it.bidTime ? it.bidTime.replace("T", " ").slice(0, 19) : it.time,
            },
            {
              title: "Số tiền đặt",
              dataIndex: "bidAmount",
              align: "right",
              render: (v: number) => <b>{formatVnd(v)}</b>,
            },
            {
              title: "Bước tăng",
              dataIndex: "increment",
              align: "right",
              render: (v?: number) => (v ? `+${formatVnd(v)}` : "—"),
            },
            {
              title: "Hình thức",
              dataIndex: "source",
              align: "center",
              render: (src?: string) =>
                src === "AUTO" ? (
                  <Tag color="purple">
                    <RobotOutlined /> Tự động
                  </Tag>
                ) : (
                  <Tag color="blue">Thủ công</Tag>
                ),
            },
            {
              title: "Trạng thái",
              dataIndex: "isWinning",
              align: "center",
              render: (win?: boolean) =>
                win ? <Tag color="gold">Đang giữ giá / Thắng</Tag> : <Tag>Đã qua</Tag>,
            },
          ]}
        />
      </Modal>
    </TransactionTableWrapper>
  );
};

export default MyBidHistoryTable;
