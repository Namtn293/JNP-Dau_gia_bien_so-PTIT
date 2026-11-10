import { useEffect, useRef } from "react";
import { useStompContext } from "./StompProvider";

/**
 * Hook đăng ký lắng nghe 1 kênh STOMP destination
 * @param destination Đường dẫn kênh (vd: "/topic/auctions")
 * @param handler Callback xử lý dữ liệu nhận được
 * @param enabled Điều kiện kích hoạt (mặc định true)
 */
export const useStompSubscription = <T = any>(
  destination: string | null | undefined,
  handler: (data: T) => void,
  enabled: boolean = true
) => {
  const { subscribe } = useStompContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || !destination) {
      return;
    }

    const unsubscribe = subscribe(destination, (data: T) => {
      if (handlerRef.current) {
        handlerRef.current(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [destination, enabled, subscribe]);
};

export default useStompSubscription;

