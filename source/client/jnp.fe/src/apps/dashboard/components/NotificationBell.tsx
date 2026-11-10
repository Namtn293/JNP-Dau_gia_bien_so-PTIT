import React, { useState, useMemo, useCallback } from "react";
import { Badge, Popover, Spin, Empty, Tooltip } from "antd";
import {
  BellOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";

import { QK } from "@/shared/constants/queryKeys";
import { useNotification } from "@/shared/hooks/useNotification";
import tokenManager from "@/shared/utils/tokenManager";
import {
  getNotificationsApi,
  getUnreadNotificationCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "@/shared/services/notificationApi";
import type { NotificationItem } from "@/shared/types/auction";
import {
  NotificationBellButton,
  NotificationDropdownCard,
  NotifHeader,
  NotifFilterBar,
  NotifFilterTab,
  NotifListContainer,
  NotifItem,
  NotifFooter,
} from "./styled";

const getTagConfig = (type?: string) => {
  switch (type) {
    case "OUTBID":
      return { label: "Bị vượt giá", bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" };
    case "STARTING_SOON":
      return { label: "Sắp bắt đầu", bg: "#fff7e6", color: "#d46b08", border: "#ffd591" };
    case "STARTED":
      return { label: "Đang diễn ra", bg: "#e6f7ff", color: "#0958d9", border: "#91c5ff" };
    case "NEW_BID":
      return { label: "Giá mới", bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" };
    case "ENDING_SOON":
      return { label: "Sắp kết thúc", bg: "#fff7e6", color: "#d46b08", border: "#ffd591" };
    case "ENDED_WON":
      return { label: "Trúng đấu giá", bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" };
    case "ENDED_LOST":
      return { label: "Không trúng", bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" };
    case "AUTO_BID_STOPPED":
      return { label: "Tự động dừng", bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" };
    case "SHILL_ALERT":
      return { label: "Cảnh báo thổi giá", bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" };
    case "ROOM_ANNOUNCEMENT":
      return { label: "Thông báo sàn", bg: "#f9f0ff", color: "#531dab", border: "#d3adf7" };
    case "WALLET_TOPUP":
      return { label: "Nạp tiền", bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" };
    case "BID_SUCCESS":
      return { label: "Đặt giá thành công", bg: "#e6f7ff", color: "#0958d9", border: "#91c5ff" };
    default:
      return { label: "Quá hạn", bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" };
  }
};

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccessNotify, showInfoNotify } = useNotification();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [size, setSize] = useState(10);

  const token = tokenManager.getAccessToken();
  const isLogin = Boolean(token);

  // 1. Số lượng tin chưa đọc
  const { data: unreadCount = 0 } = useQuery<number>(
    QK.unreadCount,
    getUnreadNotificationCountApi,
    {
      enabled: isLogin,
      refetchInterval: 30000,
      staleTime: 10000,
    }
  );

  // 2. Danh sách thông báo
  const {
    data: notifData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(
    [...QK.notifications(0, activeTab === "unread"), size],
    () =>
      getNotificationsApi({
        page: 0,
        size,
        unreadOnly: activeTab === "unread",
      }),
    {
      enabled: isLogin && open,
      staleTime: 5000,
      keepPreviousData: true,
    }
  );

  // 3. Đánh dấu đã đọc 1 tin
  const markReadMutation = useMutation(markNotificationAsReadApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(QK.unreadCount);
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // 4. Đánh dấu tất cả đã đọc
  const markAllMutation = useMutation(markAllNotificationsAsReadApi, {
    onSuccess: () => {
      queryClient.setQueryData(QK.unreadCount, 0);
      queryClient.invalidateQueries(["notifications"]);
      showSuccessNotify("Đã đánh dấu tất cả thông báo là đã đọc");
    },
  });

  const notifications = useMemo(
    () => notifData?.content ?? [],
    [notifData?.content]
  );
  const totalElements = notifData?.totalElements ?? 0;

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setSize(10);
    }
  }, []);

  const handleClickItem = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    if (item.sessionCode) {
      setOpen(false);
      navigate({
        to: "/phong-dau-gia/$roomId",
        params: { roomId: item.sessionCode },
      });
    }
  };

  const handleViewMore = () => {
    if (totalElements > notifications.length) {
      setSize((prev) => prev + 10);
    } else {
      showInfoNotify("Đã hiển thị toàn bộ thông báo.");
    }
  };

  const renderDropdownContent = () => (
    <NotificationDropdownCard>
      <NotifHeader>
        <div className="notif-title">Thông báo</div>
        {unreadCount > 0 && (
          <Tooltip title="Đánh dấu tất cả đã đọc">
            <div
              className="notif-mark-read"
              onClick={() => markAllMutation.mutate()}
            >
              <CheckOutlined />
              <span>Đã đọc hết</span>
            </div>
          </Tooltip>
        )}
      </NotifHeader>

      <NotifFilterBar>
        <div className="tabs-capsule">
          <NotifFilterTab
            $active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            Tất cả ({totalElements})
          </NotifFilterTab>
          <NotifFilterTab
            $active={activeTab === "unread"}
            onClick={() => setActiveTab("unread")}
          >
            Chưa đọc ({unreadCount})
          </NotifFilterTab>
        </div>

        <Tooltip title="Tải lại">
          <div
            className="reload-btn"
            onClick={() => refetch()}
          >
            <ReloadOutlined spin={isFetching} />
          </div>
        </Tooltip>
      </NotifFilterBar>

      <NotifListContainer>
        {isLoading && notifications.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "30px 0" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                activeTab === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Không có thông báo nào"
              }
            />
          </div>
        ) : (
          notifications.map((item: NotificationItem) => {
            const tag = getTagConfig(item.type);
            const formattedTime = item.createdAt
              ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")
              : "";

            return (
              <NotifItem
                key={item.id}
                $unread={!item.isRead}
                onClick={() => handleClickItem(item)}
              >
                <div className="icon-wrapper">
                  <ClockCircleOutlined style={{ color: "#e53935", fontSize: 18 }} />
                </div>

                <div className="item-body">
                  <div className="title-row">
                    <span className="title-text">{item.title}</span>
                    <span className="time-text">{formattedTime}</span>
                  </div>

                  <div className="tag-row">
                    <span
                      className="badge-tag"
                      style={{
                        backgroundColor: tag.bg,
                        color: tag.color,
                        borderColor: tag.border,
                      }}
                    >
                      {tag.label}
                    </span>
                  </div>

                  <div className="desc-text">{item.content}</div>
                </div>

                {!item.isRead && <span className="unread-dot" />}
              </NotifItem>
            );
          })
        )}
      </NotifListContainer>

      <NotifFooter onClick={handleViewMore}>
        <span>Xem thêm</span>
        <ArrowRightOutlined style={{ marginLeft: 6 }} />
      </NotifFooter>
    </NotificationDropdownCard>
  );

  return (
    <Popover
      content={renderDropdownContent()}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayInnerStyle={{ padding: 0, borderRadius: 12, overflow: "hidden" }}
    >
      <Badge count={unreadCount} size="small" overflowCount={99}>
        <NotificationBellButton title="Thông báo">
          <BellOutlined />
        </NotificationBellButton>
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
