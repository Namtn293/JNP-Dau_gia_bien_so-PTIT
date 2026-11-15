import { useStompContext } from "./StompProvider";

/**
 * Hook truy xuất trạng thái kết nối và hàm publish của STOMP
 */
export const useStomp = () => {
  const { status, isConnected, publish, subscribe } = useStompContext();
  return {
    status,
    isConnected,
    publish,
    subscribe,
  };
};

export default useStomp;

