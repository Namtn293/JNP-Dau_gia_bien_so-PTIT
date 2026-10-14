import React, { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { Badge, message, Popover, Spin, Tooltip } from "antd";

import { giaiThamSoDieuHuong } from "./hooks/utils";
import { useNotifications } from "./hooks/useNotifications";
import NotificationList from "./components/notificationList";
import type { Notification } from "./services/type";
import {
  NotificationHeader, PopoverWrapper, FilterTabsWrapper, FilterTab,
  SectionHeaderWrapper, BellButton
} from "./styled";

const ThongBao: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const {
    notifications, unreadCount, isLoading, isFetchingNextPage,
    hasNextPage, fetchNextPage, markAsRead, markAll, markingAll
  } = useNotifications(open, refreshKey, activeTab);

  const handleNavigate = useCallback(async (item: Notification) => {
    try {
      const navParams = await giaiThamSoDieuHuong(item);
      if (!navParams) {
        message.warning("Thông báo này chưa có dữ liệu điều hướng phù hợp.");
        return;
      }

      setOpen(false);
      navigate({
        to: navParams.routePath as any,
        params: navParams.params as any,
      });
    } catch {
      // Axios interceptor already handles API errors.
    }
  }, [navigate]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      setRefreshKey((prev) => prev + 1);
    }

    setOpen(nextOpen);
  }, []);

  const renderContent = () => (
    <PopoverWrapper $expanded={true}>
      <NotificationHeader>
        <div className="title">Thông báo</div>
        <div className="actions">
          <Tooltip title="Đánh dấu tất cả đã đọc">
            <div className="action-btn icon-only" onClick={() => markAll()}>
              {markingAll ? <Spin size="small" /> : <CheckOutlined  />}
            </div>
          </Tooltip>
        </div>
      </NotificationHeader>

      <FilterTabsWrapper>
        <FilterTab $active={activeTab === "all"} onClick={() => setActiveTab("all")}>Tất cả</FilterTab>
        <FilterTab $active={activeTab === "unread"} onClick={() => setActiveTab("unread")}>
          Chưa đọc {unreadCount > 0 ? `(${unreadCount})` : ''}
        </FilterTab>
      </FilterTabsWrapper>

      <SectionHeaderWrapper>
        <div className="section-title">Trước đó</div>
        <div className="view-all-link" onClick={() => {
          setOpen(false);
          navigate({ to: '/uy-quyen-tai-khoan/quan-ly-thong-bao' });
        }}>Xem tất cả</div>
      </SectionHeaderWrapper>

      <NotificationList
        isExpanded={true}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        fetchNextPage={fetchNextPage}
        notifications={notifications}
        onMarkRead={markAsRead}
        onNavigate={handleNavigate}
      />

    </PopoverWrapper>
  );

  return (
    <>
      <style>{`
        .admin-thong-bao-popover .ant-popover-inner-content {
          overflow: hidden !important;
          overflow-y: hidden !important;
          max-height: none !important;
          padding: 0 !important;
        }
        .admin-thong-bao-popover * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .admin-thong-bao-popover *::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
      `}</style>
      <Popover
        rootClassName="admin-thong-bao-popover"
        overlayClassName="admin-thong-bao-popover"
        content={renderContent()}
        trigger="click"
        open={open} 
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        align={{ offset: [0, 0] }}
        overlayInnerStyle={{ padding: 0, overflow: "hidden", borderRadius: 12 }}
      >
        <Badge count={unreadCount} size="small" overflowCount={99}>
          <BellButton>
            <BellOutlined />
          </BellButton>
        </Badge>
      </Popover>
    </>
  );
};

export default ThongBao;
