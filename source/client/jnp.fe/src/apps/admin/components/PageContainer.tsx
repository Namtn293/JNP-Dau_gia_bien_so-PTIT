import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Breadcrumb, Button, Space } from "antd";
import React from "react";

interface PageContainerProps {
  breadcrumbItems: Array<{
    title: React.ReactNode;
    path?: string;
    search?: any;
  }>;
  children: React.ReactNode;
  showNavButtons?: boolean;
  onBack?: () => void;
  showBreadcrumb?: boolean;
  /** Dùng cho layout toàn màn hình (vd: trang bản đồ). Thay minHeight:100% bằng height:100% */
  fullHeight?: boolean;
  /** Màu chữ của breadcrumb item hiện tại (không có link). Mặc định: #112A46 (blue-700). */
  titleColor?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  breadcrumbItems = [],
  children,
  showNavButtons = true,
  showBreadcrumb = true,
  onBack,
  fullHeight = false,
  titleColor,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back(); // Browser back
    }
  };

  return (
    <div className="page-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        ...(fullHeight
          ? { height: "100%", overflow: "hidden" }
          : { height: "100%", minHeight: 0 }),
      }}
    >
      {/* FIX: Navigation + Breadcrumb Header */}
      <div
        style={{
          display: showBreadcrumb ? "flex" : "none",
          alignItems: "center",
          gap: "var(--gap-global)",
          padding: "0.48rem 1.6rem",
          backgroundColor: "#fff",
          borderBottom: "1px solid #d9d9d9",
          position: "sticky",
          top: 0,
          zIndex: 89, // Ngay dưới z-index 90 của Header
        }}
      >
        {/* FIX: Navigation Buttons */}
        {showNavButtons && (
          <Space size={8} style={{ marginLeft: "-8px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              size="small"
              onClick={handleBack}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
              title="Quay lại"
            />
          </Space>
        )}
        <Breadcrumb
          style={{
            fontWeight: 500,
            fontSize: "18px",
            color: titleColor || "#000",
            flex: 1,
          }}
          items={(breadcrumbItems || []).map((item, index) => ({
            key: index,
            title: item.path ? (
              <span
                style={{
                  color: "#000",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                onClick={() =>
                  navigate({ to: item.path!, search: item.search })
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                {item.title}
              </span>
            ) : (
              <span style={{ color: titleColor || "#000", fontWeight: 500 }}>
                {item.title}
              </span>
            ),
          }))}
        />
      </div>

      {/* Page Content */}
      <div style={{ flex: 1,  minHeight: 0  }}>{children}</div>
    </div>
  );
};
