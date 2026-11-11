import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client } from "@stomp/stompjs";
import type { StompSubscription } from "@stomp/stompjs";
import tokenManager from "@/shared/utils/tokenManager";
import { useNotification } from "@/shared/hooks/useNotification";

export type StompStatus = "connecting" | "connected" | "disconnected" | "error";

export interface StompContextValue {
  status: StompStatus;
  isConnected: boolean;
  publish: (
    destination: string,
    body: any,
    headers?: Record<string, string>
  ) => boolean;
  subscribe: (
    destination: string,
    handler: (data: any) => void
  ) => () => void;
}

const StompContext = createContext<StompContextValue | null>(null);

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<StompStatus>("disconnected");
  const clientRef = useRef<Client | null>(null);
  const activeSubsRef = useRef<Map<string, StompSubscription>>(new Map());
  const handlersMapRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const { showErrorNotify } = useNotification();
  const showErrorNotifyRef = useRef(showErrorNotify);
  showErrorNotifyRef.current = showErrorNotify;

  // Helper đăng ký STOMP subscription cho 1 destination
  const doStompSubscribe = useCallback(
    (client: Client, destination: string) => {
      if (!client.connected) return;
      if (activeSubsRef.current.has(destination)) return;

      try {
        const sub = client.subscribe(destination, (frame) => {
          let payload: any = frame.body;
          try {
            payload = JSON.parse(frame.body);
          } catch {
            // Giữ raw string nếu không phải json
          }
          const handlers = handlersMapRef.current.get(destination);
          if (handlers) {
            handlers.forEach((h) => {
              try {
                h(payload);
              } catch (err) {
                console.error(`[STOMP] Error in handler for ${destination}:`, err);
              }
            });
          }
        });
        activeSubsRef.current.set(destination, sub);
      } catch (e) {
        console.warn(`[STOMP] Failed to subscribe ${destination}:`, e);
      }
    },
    []
  );

  // Subscribe lại toàn bộ các kênh đã đăng ký khi socket kết nối thành công
  const resubscribeAll = useCallback(
    (client: Client) => {
      // Hủy các subscription cũ trong map nếu có
      activeSubsRef.current.clear();
      handlersMapRef.current.forEach((handlers, destination) => {
        if (handlers.size > 0) {
          doStompSubscribe(client, destination);
        }
      });
    },
    [doStompSubscribe]
  );

  const subscribe = useCallback(
    (destination: string, handler: (data: any) => void): (() => void) => {
      if (!destination) return () => {};

      let set = handlersMapRef.current.get(destination);
      if (!set) {
        set = new Set();
        handlersMapRef.current.set(destination, set);
      }
      set.add(handler);

      // Nếu client đang kết nối, kích hoạt subscription STOMP ngay
      const client = clientRef.current;
      if (client && client.connected) {
        doStompSubscribe(client, destination);
      }

      // Cleanup khi unmount
      return () => {
        const currentSet = handlersMapRef.current.get(destination);
        if (currentSet) {
          currentSet.delete(handler);
          if (currentSet.size === 0) {
            handlersMapRef.current.delete(destination);
            const sub = activeSubsRef.current.get(destination);
            if (sub) {
              try {
                sub.unsubscribe();
              } catch {}
              activeSubsRef.current.delete(destination);
            }
          }
        }
      };
    },
    [doStompSubscribe]
  );

  const publish = useCallback(
    (destination: string, body: any, headers?: Record<string, string>): boolean => {
      const client = clientRef.current;
      if (!client || !client.connected) {
        console.warn(`[STOMP] Cannot publish to ${destination}: socket not connected`);
        return false;
      }
      try {
        client.publish({
          destination,
          body: typeof body === "string" ? body : JSON.stringify(body),
          headers,
        });
        return true;
      } catch (e) {
        console.error(`[STOMP] Publish error on ${destination}:`, e);
        return false;
      }
    },
    []
  );

  const resubscribeAllRef = useRef(resubscribeAll);
  resubscribeAllRef.current = resubscribeAll;

  // Khởi tạo STOMP Client
  useEffect(() => {
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
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      debug: (msg) => {
        if (import.meta.env.DEV && msg.includes("ERROR")) {
          console.debug("[STOMP]", msg);
        }
      },
      onConnect: () => {
        setStatus("connected");
        resubscribeAllRef.current(client);
      },
      onStompError: (frame) => {
        const errorCode = frame.headers["error-code"];
        const errorMessage = frame.headers["message"] || "Lỗi giao thức STOMP";
        console.error("[STOMP] Error frame:", errorCode, errorMessage);

        const authErrors = [
          "AUTH_REQUIRED",
          "TOKEN_EXPIRED",
          "TOKEN_INVALID",
          "USER_BANNED",
          "FORBIDDEN_DESTINATION",
          "FORBIDDEN_ADMIN_ONLY",
          "ADMIN_REQUIRED",
        ];

        if (errorCode && authErrors.includes(errorCode)) {
          client.deactivate();
          setStatus("error");
          showErrorNotifyRef.current(errorMessage);
          return;
        }

        setStatus("error");
      },
      onWebSocketClose: () => {
        setStatus("disconnected");
      },
      onWebSocketError: () => {
        setStatus("disconnected");
      },
      onDisconnect: () => {
        setStatus("disconnected");
      },
    });

    client.activate();
    clientRef.current = client;

    // Lắng nghe sự kiện đăng nhập / đăng xuất để làm mới connection & principal
    const handleAuthChanged = () => {
      if (clientRef.current) {
        clientRef.current.deactivate().then(() => {
          if (clientRef.current) {
            clientRef.current.activate();
          }
        });
      }
    };
    window.addEventListener("auth-changed", handleAuthChanged);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      activeSubsRef.current.clear();
      setStatus("disconnected");
    };
  }, []);

  const value: StompContextValue = {
    status,
    isConnected: status === "connected",
    publish,
    subscribe,
  };

  return <StompContext.Provider value={value}>{children}</StompContext.Provider>;
};

export const useStompContext = () => {
  const ctx = useContext(StompContext);
  if (!ctx) {
    throw new Error("useStompContext must be used within a StompProvider");
  }
  return ctx;
};
