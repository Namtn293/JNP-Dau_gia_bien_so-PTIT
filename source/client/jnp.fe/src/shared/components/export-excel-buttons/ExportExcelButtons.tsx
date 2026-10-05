import React, { useRef, useState } from "react";
import { Button, Popover } from "antd";
import {
  FileExcelOutlined,
  LoadingOutlined,
  DownOutlined,
} from "@ant-design/icons";

interface ExportExcelButtonsProps {
  onExportPage: () => void;
  onExportAll: () => void;
  loadingPage?: boolean;
  loadingAll?: boolean;
  exportPageLabel?: string;
  exportAllLabel?: string;
}

const ExportExcelButtons: React.FC<ExportExcelButtonsProps> = ({
  onExportPage,
  onExportAll,
  loadingPage = false,
  loadingAll = false,
  exportAllLabel = "Xuất tất cả",
  exportPageLabel = "Xuất trang hiện tại",
}) => {
  const [open, setOpen] = useState(false);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const firstBtnRef = useRef<HTMLButtonElement>(null);
  const secondBtnRef = useRef<HTMLButtonElement>(null);

  const handleExportPage = () => {
    onExportPage();
    setOpen(false);
    triggerBtnRef.current?.focus();
  };

  const handleExportAll = () => {
    onExportAll();
    setOpen(false);
    triggerBtnRef.current?.focus();
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      setTimeout(() => firstBtnRef.current?.focus(), 100);
    }
  };

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        minWidth: "150px",
        padding: "4px 6px",
      }}
    >
      <Button
        ref={firstBtnRef}
        type="text"
        icon={
          loadingAll ? (
            <LoadingOutlined style={{ fontSize: "14px" }} />
          ) : (
            <FileExcelOutlined style={{ fontSize: "14px" }} />
          )
        }
        onClick={handleExportAll}
        loading={loadingAll}
        style={{
          alignSelf: "flex-start",
          height: "40px",
          borderRadius: "6px",
          padding: "0 12px",
          fontSize: "14px",
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            secondBtnRef.current?.focus();
          }
          if (e.key === "Escape") {
            setOpen(false);
            triggerBtnRef.current?.focus();
          }
        }}
      >
        <span style={{ marginLeft: "8px" }}>{exportAllLabel}</span>
      </Button>
      <Button
        ref={secondBtnRef}
        type="text"
        icon={
          loadingPage ? (
            <LoadingOutlined style={{ fontSize: "14px" }} />
          ) : (
            <FileExcelOutlined style={{ fontSize: "14px" }} />
          )
        }
        onClick={handleExportPage}
        loading={loadingPage}
        style={{
          alignSelf: "flex-start",
          height: "40px",
          borderRadius: "6px",
          padding: "0 12px",
          fontSize: "14px",
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            firstBtnRef.current?.focus();
          }
          if (e.key === "Tab" && !e.shiftKey) {
            setOpen(false);
            triggerBtnRef.current?.focus();
          }
          if (e.key === "Escape") {
            setOpen(false);
            triggerBtnRef.current?.focus();
          }
        }}
      >
        <span style={{ marginLeft: "8px" }}>{exportPageLabel}</span>
      </Button>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomLeft"
      overlayInnerStyle={{ padding: 0 }}
    >
      <Button
        ref={triggerBtnRef}
        type="primary"
        icon={
          loadingPage || loadingAll ? (
            <LoadingOutlined />
          ) : (
            <FileExcelOutlined />
          )
        }
        loading={loadingPage || loadingAll}
        style={{
          display: "flex",
          alignItems: "center",
          height: "36px",
          padding: "0 16px",
        }}
      >
        Xuất Excel{" "}
        <DownOutlined style={{ fontSize: "10px", marginLeft: "4px" }} />
      </Button>
    </Popover>
  );
};

export default ExportExcelButtons;
