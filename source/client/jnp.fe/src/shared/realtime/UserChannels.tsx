import React, { useCallback } from "react";
import { useQueryClient } from "react-query";
import tokenManager from "@/shared/utils/tokenManager";
import { useNotification } from "@/shared/hooks/useNotification";
import { QK } from "@/shared/constants/queryKeys";
import type {
  WsError,
  RoomRoleChanged,
  NotificationItem,
  OutbidAlert,
  AutoBidStoppedPayload,
} from "@/shared/types/auction";
import { useStompSubscription } from "./useStompSubscription";

export const UserChannels: React.FC = () => {
  const token = tokenManager.getAccessToken();
  const isLogin = Boolean(token);
  const queryClient = useQueryClient();
  const { showErrorNotify, showWarningNotify, showInfoNotify } = useNotification();

  // 1. Kênh nhận lỗi người dùng (/user/queue/errors)
  const handleWsError = useCallback(
    (err: WsError) => {
      console.warn("[UserChannels] WS Error received:", err);
      if (err?.message) {
        showErrorNotify(err.message);
      }
    },
    [showErrorNotify]
  );

  // 2. Kênh thay đổi vai trò phòng (/user/queue/room-role)
  const handleRoomRoleChanged = useCallback(
    (payload: RoomRoleChanged) => {
      console.info("[UserChannels] Room role changed:", payload);
      if (payload?.sessionCode) {
        queryClient.invalidateQueries(QK.registration(payload.sessionCode));
        queryClient.invalidateQueries(QK.roomDetail(payload.sessionCode));
      }
      queryClient.invalidateQueries(QK.wallet);
    },
    [queryClient]
  );

  // 3. Kênh thông báo cá nhân (/user/queue/notifications)
  const handleNotification = useCallback(
    (payload: any) => {
      // Phân biệt: nếu là AutoBidScheduler Map có 'reason' thì bỏ qua (xử lý ở kênh outbid)
      if (payload?.reason && !payload?.id) {
        return;
      }
      const item = payload as NotificationItem;
      console.info("[UserChannels] Notification received:", item);

      // Cập nhật số tin chưa đọc
      queryClient.setQueryData<number>(QK.unreadCount, (old = 0) => old + 1);
      queryClient.invalidateQueries(QK.notifications(0, false));
      queryClient.invalidateQueries(QK.notifications(0, true));

      if (item?.type === "WALLET_TOPUP") {
        queryClient.invalidateQueries(QK.wallet);
        queryClient.invalidateQueries(["wallet-tx"]);
      }

      // Không hiển thị popup nhỏ nếu là OUTBID vì kênh outbid đã có cảnh báo riêng
      if (item?.type !== "OUTBID" && item?.content) {
        showInfoNotify(item.title ? `${item.title}: ${item.content}` : item.content);
      }
    },
    [queryClient, showInfoNotify]
  );

  // 4. Kênh cảnh báo vượt giá & auto-bid dừng (/user/queue/outbid)
  const handleOutbid = useCallback(
    (payload: any) => {
      if (payload?.reason) {
        const autoStop = payload as AutoBidStoppedPayload;
        showInfoNotify(`Đấu giá tự động đã dừng: ${autoStop.message || autoStop.reason}`);
        if (autoStop.sessionCode) {
          queryClient.invalidateQueries(QK.autoBid(autoStop.sessionCode));
        }
        return;
      }

      const outbid = payload as OutbidAlert;
      if (outbid?.newPrice) {
        showWarningNotify(
          `Bạn đã bị vượt giá tại ${outbid.plateNumber || outbid.sessionCode}! Mức giá mới: ${outbid.newPrice.toLocaleString("vi-VN")} ₫ (bởi ${outbid.outbidBy || "người khác"})`
        );
        if (outbid.sessionCode) {
          queryClient.invalidateQueries(QK.roomDetail(outbid.sessionCode));
        }
      }
    },
    [queryClient, showInfoNotify, showWarningNotify]
  );

  useStompSubscription<WsError>("/user/queue/errors", handleWsError, isLogin);
  useStompSubscription<RoomRoleChanged>("/user/queue/room-role", handleRoomRoleChanged, isLogin);
  useStompSubscription<any>("/user/queue/notifications", handleNotification, isLogin);
  useStompSubscription<any>("/user/queue/outbid", handleOutbid, isLogin);

  return null;
};

export default UserChannels;

