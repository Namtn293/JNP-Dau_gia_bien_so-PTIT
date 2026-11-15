import { useCallback, useState } from "react";
import tokenManager from "@/shared/utils/tokenManager";
import { useNotification } from "@/shared/hooks/useNotification";
import { useStomp, useStompSubscription } from "@/shared/realtime";
import type { WsBidMessage, WsConnectionStatus } from "../services/type";

interface UseAuctionSocketProps {
  onPlateUpdate?: (message: WsBidMessage) => void;
  enabled?: boolean;
}

export const useAuctionSocket = ({
  onPlateUpdate,
  enabled = true,
}: UseAuctionSocketProps = {}) => {
  const { status, isConnected, publish, subscribe } = useStomp();
  const [lastMessage, setLastMessage] = useState<WsBidMessage | null>(null);
  const { showErrorNotify } = useNotification();

  const handleMessage = useCallback(
    (data: any) => {
      setLastMessage(data);
      if (onPlateUpdate) {
        onPlateUpdate(data);
      }
    },
    [onPlateUpdate]
  );

  useStompSubscription("/topic/auctions", handleMessage, enabled);

  /**
   * Gửi lượt đặt giá trực tiếp từ trang danh sách biển số qua WebSocket
   */
  const sendBid = useCallback(
    (bid: WsBidMessage): boolean => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        showErrorNotify("Vui lòng đăng nhập để tham gia đấu giá!");
        return false;
      }

      if (!isConnected) {
        showErrorNotify("Kết nối máy chủ gián đoạn, vui lòng thử lại sau!");
        return false;
      }

      return publish("/app/auction/bid", bid);
    },
    [isConnected, publish, showErrorNotify]
  );

  /**
   * Đăng ký nhận thông tin một phòng đấu giá cụ thể nếu cần
   */
  const subscribeToRoom = useCallback(
    (roomId: string, callback: (msg: any) => void) => {
      return subscribe(`/topic/auction/${roomId}`, callback);
    },
    [subscribe]
  );

  return {
    status: status as WsConnectionStatus,
    isConnected,
    lastMessage,
    sendBid,
    subscribeToRoom,
  };
};

export default useAuctionSocket;
