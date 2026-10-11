import { Table, Tag } from "antd";
import BaseModal from "@shared/components/modals/index";
import type { AlignType } from "rc-table/lib/interface";
import RowActionsEllipsis from "@shared/components/tables/row-actions-ellipsis";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";    
import { formatDateUTC } from "~/shared/utils";

const TABLE_SCROLL_X = 1140;

interface VersionListModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  title: string;
  isLoading?: boolean;
  handleOpenConfirmDelete: (record: any) => void;
  handleView?: (record: any) => void;
  zIndex?: number;
}

export function VersionListModal({
  open,
  onClose,
  data,
  title,
  isLoading = false,
  handleOpenConfirmDelete,
  handleView,
  zIndex,
}: VersionListModalProps) {

  const actions = (record: any) => [
    ...(handleView
      ? [
          {
            key: "view",
            icon: <EyeOutlined style={{ color: "var(--primary)" }} />,
            label: "Xem chi tiết",
            onClick: () => handleView(record),
          },
        ]
      : []),
    ...(record.laLichHen === true
      ? [
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined style={{ color: "var(--error)" }} />,
            danger: true,
            onClick: () => handleOpenConfirmDelete(record),
          },
        ]
      : []),
  ];

  const columns :any = [
    { title: "ID Phiên bản", dataIndex: "id", width: 120 },
    { title: "Mã", dataIndex: "ma", ellipsis: true, width: 130 },
    { title: "Tên", dataIndex: "ten", ellipsis: true, width: 320 },
    {
      title: "Ngày hiệu lực",
      dataIndex: "ngayHieuLuc",
      width: 140,
      render: (value: any) => formatDateUTC(value, "DD/MM/YYYY"),
    },
    {
      title: "Ngày hết hiệu lực",
      dataIndex: "ngayHetHieuLuc",
      width: 150,
      render: (value: any) => formatDateUTC(value, "DD/MM/YYYY"),
    },
    {
      title: "Trạng thái hiệu lực",
      dataIndex: "dangHieuLuc",
      width: 160,
      align: "center" as const,
      render: (value: boolean) => (
        <Tag color={value ? "success" : "error"}>
          {value ? "Có Hiệu Lực" : "Không Hiệu Lực"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center" as AlignType,
      render: (_: any, record: any) => (
        <RowActionsEllipsis actions={actions(record)} />
      ),
    },
  ];

  return (
    <BaseModal
      open={open}
      onCancel={onClose}
      hideModal={onClose}
      footer={null}
      title={title}
      width={1200}
      destroyOnClose
      zIndex={zIndex}
    >
      <Table
        bordered
        loading={isLoading}
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.id ?? record.key}
        pagination={false}
        tableLayout="fixed"
        scroll={{ x: TABLE_SCROLL_X }}
      />
    </BaseModal>
  );
}
