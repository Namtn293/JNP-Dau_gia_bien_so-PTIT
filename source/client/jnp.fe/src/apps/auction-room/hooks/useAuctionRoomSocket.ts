import { useCallback, useEffect, useRef } from "react";
import tokenManager from "@/shared/utils/tokenManager";
import { useStomp, useStompSubscription } from "@/shared/realtime";
import type {
  WsAuctionMessage,
  WsChatMessage,
  WsRoomEvent,
} from "../services/type";

interface UseAuctionRoomSocketProps {
  roomId: string;
  presenceReady?: boolean;
  onAuctionUpdate?: (msg: WsAuctionMessage) => void;
  onChatMessage?: (msg: WsChatMessage) => void;
  onRoomEvent?: (event: WsRoomEvent) => void;
  enabled?: boolean;
}

export const useAuctionRoomSocket = ({
  roomId,
  presenceReady = true,
  onAuctionUpdate,
  onChatMessage,
  onRoomEvent,
  enabled = true,
}: UseAuctionRoomSocketProps) => {
  const { status, isConnected, publish } = useStomp();
  const token = tokenManager.getAccessToken();
  const isLogin = Boolean(token);
  const shouldSubscribe = enabled && isLogin && Boolean(roomId);

  // 1. Subscribe to auction room channel (bids, price pop, extensions)
  useStompSubscription<WsAuctionMessage>(
    roomId ? `/topic/auction/${roomId}` : null,
    (msg) => onAuctionUpdate?.(msg),
    shouldSubscribe
  );

  // 2. Subscribe to room chat channel
  useStompSubscription<WsChatMessage>(
    roomId ? `/topic/chat/${roomId}` : null,
    (msg) => onChatMessage?.(msg),
    shouldSubscribe
  );

  // 3. Subscribe to presence & room events (join, leave, halt, resume)
  useStompSubscription<WsRoomEvent>(
    roomId ? `/topic/room/${roomId}` : null,
    (event) => onRoomEvent?.(event),
    shouldSubscribe
  );

  // Chỉ gửi JOIN 1 lần cho mỗi kết nối vào phiên mới; reset khi mất kết nối để reconnect tự báo danh lại
  const activePresenceRoomRef = useRef<string | null>(null);
  const publishRef = useRef(publish);
  publishRef.current = publish;

  useEffect(() => {
    if (!isConnected) {
      activePresenceRoomRef.current = null;
    }
  }, [isConnected]);

  useEffect(() => {
    const previousRoom = activePresenceRoomRef.current;
    if (previousRoom && previousRoom !== roomId && isConnected) {
      publishRef.current(`/app/room/${previousRoom}/leave`, { roomId: previousRoom, event: "LEAVE" });
      activePresenceRoomRef.current = null;
    }

    if (!shouldSubscribe || !isConnected || !presenceReady || !roomId) return;
    if (activePresenceRoomRef.current === roomId) return;

    if (publishRef.current(`/app/room/${roomId}/join`, { roomId, event: "JOIN" })) {
      activePresenceRoomRef.current = roomId;
    }
  }, [roomId, shouldSubscribe, isConnected, presenceReady]);

  // Chỉ gửi LEAVE duy nhất khi component phòng đấu giá thực sự unmount
  useEffect(() => {
    return () => {
      const joinedRoom = activePresenceRoomRef.current;
      if (joinedRoom) {
        activePresenceRoomRef.current = null;
        publishRef.current(`/app/room/${joinedRoom}/leave`, { roomId: joinedRoom, event: "LEAVE" });
      }
    };
  }, []);

  const sendBid = useCallback(
    (payload: {
      roomId: string;
      plateNumber?: string;
      bidAmount: number;
      userName?: string;
    }): boolean => {
      if (!isConnected) {
        console.warn("[WS-ROOM] Socket not connected");
        return false;
      }
      return publish(`/app/bid/${roomId}`, {
        ...payload,
        roomId,
      });
    },
    [roomId, isConnected, publish]
  );

  const sendChatMessage = useCallback(
    (content: string, senderName: string = "Bạn"): boolean => {
      if (!isConnected) {
        return false;
      }
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return publish(`/app/chat/${roomId}`, {
        id: msgId,
        roomId,
        senderName,
        content,
        type: "CHAT",
      });
    },
    [roomId, isConnected, publish]
  );

  return {
    status,
    isConnected,
    sendBid,
    sendChatMessage,
  };
};

export default useAuctionRoomSocket;
