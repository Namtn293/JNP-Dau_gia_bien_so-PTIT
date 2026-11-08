import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import tokenManager from "@/shared/utils/tokenManager";
import { useNotification } from "@/shared/hooks/useNotification";
import type { WsBidMessage, WsConnectionStatus } from "../services/type";

interface UseAuctionSocketProps {
  onPlateUpdate?: (message: WsBidMessage) => void;
  enabled?: boolean;
}

export const useAuctionSocket = ({
  onPlateUpdate,
  enabled = true,
}: UseAuctionSocketProps = {}) => {
  const [status, setStatus] = useState<WsConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WsBidMessage | null>(null);
  const { showErrorNotify } = useNotification();

  const clientRef = useRef<Client | null>(null);
  const onUpdateRef = useRef(onPlateUpdate);
  onUpdateRef.current = onPlateUpdate;

  useEffect(() => {
    if (!enabled) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setStatus("disconnected");
      }
      return;
    }

    // Determine WebSocket Broker URL
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws";

    setStatus("connecting");

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: () => {
        const token = tokenManager.getAccessToken();
        if (token) {
          client.connectHeaders = {
            Authorization: `Bearer ${token}`,
          };
        } else {
          client.connectHeaders = {};
        }
      },
      debug: (msg) => {
        if (import.meta.env.DEV) {
          // Log only errors or connection status
          if (msg.includes("ERROR") || msg.includes("Opening Web Socket")) {
            console.debug("[WS-STOMP]", msg);
          }
        }
      },
      onConnect: () => {
        setStatus("connected");
        // Subscribe to global auction channel for license plate list updates
        client.subscribe("/topic/auctions", (frame) => {
          try {
            const data: WsBidMessage = JSON.parse(frame.body);
            setLastMessage(data);
            if (onUpdateRef.current) {
              onUpdateRef.current(data);
            }
          } catch (e) {
            console.warn("[WS-STOMP] Parse message error:", e);
          }
        });
      },
      onStompError: (frame) => {
        const errorCode = frame.headers["error-code"];
        const errorMessage = frame.headers["message"] || "Lỗi WebSocket STOMP";
        console.error("[WS-STOMP] STOMP Error:", errorCode, errorMessage);

        // Với token lỗi/hết hạn, ngắt kết nối để không retry spam
        const authErrors = [
          "AUTH_REQUIRED",
          "TOKEN_EXPIRED",
          "TOKEN_INVALID",
          "USER_BANNED",
          "FORBIDDEN_DESTINATION",
        ];
        if (errorCode && authErrors.includes(errorCode)) {
          client.deactivate();
          setStatus("error");
          showErrorNotify(errorMessage);
          return;
        }

        setStatus("error");
      },
      onWebSocketClose: () => {
        setStatus("disconnected");
      },
      onDisconnect: () => {
        setStatus("disconnected");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setStatus("disconnected");
    };
  }, [enabled, showErrorNotify]);

  /**
   * Gửi lượt đặt giá trực tiếp từ trang danh sách biển số qua WebSocket
   */
  const sendBid = useCallback((bid: WsBidMessage): boolean => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      showErrorNotify("Vui lòng đăng nhập để tham gia đấu giá!");
      return false;
    }

    if (!clientRef.current || !clientRef.current.connected) {
      showErrorNotify("Kết nối WebSocket gián đoạn, vui lòng tải lại trang!");
      return false;
    }

    try {
      clientRef.current.publish({
        destination: "/app/auction/bid",
        body: JSON.stringify(bid),
      });
      return true;
    } catch (e) {
      console.error("[WS-STOMP] Lỗi gửi bid:", e);
      showErrorNotify("Không thể gửi lượt đặt giá");
      return false;
    }
  }, [showErrorNotify]);

  /**
   * Đăng ký nhận thông tin một phòng đấu giá cụ thể nếu cần
   */
  const subscribeToRoom = useCallback((roomId: string, callback: (msg: any) => void) => {
    if (!clientRef.current || !clientRef.current.connected) {
      return null;
    }
    return clientRef.current.subscribe(`/topic/auction/${roomId}`, (frame) => {
      try {
        const payload = JSON.parse(frame.body);
        callback(payload);
      } catch (err) {
        console.warn("[WS-STOMP] Room message parse error:", err);
      }
    });
  }, []);

  return {
    status,
    isConnected: status === "connected",
    lastMessage,
    sendBid,
    subscribeToRoom,
  };
};

export default useAuctionSocket;
