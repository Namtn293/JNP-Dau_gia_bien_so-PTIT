import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type {
  WsAuctionMessage,
  WsChatMessage,
  WsRoomEvent,
} from "../services/type";

interface UseAuctionRoomSocketProps {
  roomId: string;
  onAuctionUpdate?: (msg: WsAuctionMessage) => void;
  onChatMessage?: (msg: WsChatMessage) => void;
  onRoomEvent?: (event: WsRoomEvent) => void;
  enabled?: boolean;
}

export const useAuctionRoomSocket = ({
  roomId,
  onAuctionUpdate,
  onChatMessage,
  onRoomEvent,
  enabled = true,
}: UseAuctionRoomSocketProps) => {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const clientRef = useRef<Client | null>(null);

  const onAuctionUpdateRef = useRef(onAuctionUpdate);
  onAuctionUpdateRef.current = onAuctionUpdate;

  const onChatMessageRef = useRef(onChatMessage);
  onChatMessageRef.current = onChatMessage;

  const onRoomEventRef = useRef(onRoomEvent);
  onRoomEventRef.current = onRoomEvent;

  useEffect(() => {
    if (!enabled || !roomId) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setStatus("disconnected");
      }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws";

    setStatus("connecting");

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        if (import.meta.env.DEV && (msg.includes("ERROR") || msg.includes("Opening Web Socket"))) {
          console.debug("[WS-ROOM]", msg);
        }
      },
      onConnect: () => {
        setStatus("connected");

        // 1. Subscribe to auction room channel (bids, price pop, extensions)
        client.subscribe(`/topic/auction/${roomId}`, (frame) => {
          try {
            const data: WsAuctionMessage = JSON.parse(frame.body);
            if (onAuctionUpdateRef.current) {
              onAuctionUpdateRef.current(data);
            }
          } catch (e) {
            console.warn("[WS-ROOM] Parse auction message error:", e);
          }
        });

        // 2. Subscribe to room chat channel
        client.subscribe(`/topic/chat/${roomId}`, (frame) => {
          try {
            const data: WsChatMessage = JSON.parse(frame.body);
            if (onChatMessageRef.current) {
              onChatMessageRef.current(data);
            }
          } catch (e) {
            console.warn("[WS-ROOM] Parse chat message error:", e);
          }
        });

        // 3. Subscribe to presence & room events (join, leave, halt, resume)
        client.subscribe(`/topic/room/${roomId}`, (frame) => {
          try {
            const data: WsRoomEvent = JSON.parse(frame.body);
            if (onRoomEventRef.current) {
              onRoomEventRef.current(data);
            }
          } catch (e) {
            console.warn("[WS-ROOM] Parse room event error:", e);
          }
        });

        // Send join presence
        try {
          client.publish({
            destination: `/app/room/${roomId}/join`,
            body: JSON.stringify({ roomId, event: "JOIN" }),
          });
        } catch (e) {}
      },
      onStompError: (frame) => {
        console.error("[WS-ROOM] STOMP Error:", frame.headers["message"]);
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
      if (client.connected) {
        try {
          client.publish({
            destination: `/app/room/${roomId}/leave`,
            body: JSON.stringify({ roomId, event: "LEAVE" }),
          });
        } catch (e) {}
      }
      client.deactivate();
      clientRef.current = null;
      setStatus("disconnected");
    };
  }, [roomId, enabled]);

  const sendBid = useCallback(
    (payload: {
      roomId: string;
      plateNumber: string;
      bidAmount: number;
      userName?: string;
    }): boolean => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.warn("[WS-ROOM] Socket not connected, fallback to local flow");
        return false;
      }
      try {
        clientRef.current.publish({
          destination: `/app/bid/${roomId}`,
          body: JSON.stringify(payload),
        });
        return true;
      } catch (e) {
        console.error("[WS-ROOM] Send bid error:", e);
        return false;
      }
    },
    [roomId]
  );

  const sendChatMessage = useCallback(
    (content: string, senderName: string = "Bạn"): boolean => {
      if (!clientRef.current || !clientRef.current.connected) {
        return false;
      }
      try {
        const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        clientRef.current.publish({
          destination: `/app/chat/${roomId}`,
          body: JSON.stringify({
            id: msgId,
            roomId,
            senderName,
            content,
            type: "CHAT",
          }),
        });
        return true;
      } catch (e) {
        console.error("[WS-ROOM] Send chat error:", e);
        return false;
      }
    },
    [roomId]
  );

  return {
    status,
    isConnected: status === "connected",
    sendBid,
    sendChatMessage,
  };
};
