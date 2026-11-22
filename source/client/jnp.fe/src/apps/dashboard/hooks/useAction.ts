import { useState } from "react";
import useNotification from "@/shared/hooks/useNotification";
import type { AuctionItem, WsBidMessage } from "../services/type";
import { formatMoney } from "../utils/format";
import { placeBidApi } from "../services/api";
import { useWatchSessionMutation, useUnwatchSessionMutation } from "../services/mutation";

export const useAction = (
  _setData?: React.Dispatch<React.SetStateAction<AuctionItem[]>>,
  sendBidWs?: (bid: WsBidMessage) => boolean,
  currentUser?: { name: string; email?: string } | null
) => {
  const { showSuccessNotify, showErrorNotify } = useNotification();
  const [selectedPlate, setSelectedPlate] = useState<AuctionItem | null>(null);
  const [togglingSession, setTogglingSession] = useState<string | null>(null);

  const watchMutation = useWatchSessionMutation();
  const unwatchMutation = useUnwatchSessionMutation();

  const toggleWatch = async (plate: AuctionItem, isWatched: boolean) => {
    const sessionCode = plate.sessionCode || plate.p;
    if (togglingSession === sessionCode) return;
    setTogglingSession(sessionCode);

    try {
      const res = isWatched
        ? await unwatchMutation.mutateAsync(sessionCode)
        : await watchMutation.mutateAsync(sessionCode);

      // 1. Kiểm tra cờ success trả về từ BE
      if (res && res.success === false) {
        showErrorNotify(res.message || "Thao tác không thành công!");
        return;
      }

      // 2. Lấy message chính thức từ BE (nếu có)
      const msg =
        res?.message ||
        (typeof res?.data === "string" ? res.data : null) ||
        (isWatched ? `Đã bỏ theo dõi biển số ${plate.p}` : `Đã theo dõi biển số ${plate.p}`);

      showSuccessNotify(msg);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Thao tác theo dõi thất bại. Vui lòng đăng nhập lại!";
      showErrorNotify(errMsg);
    } finally {
      setTogglingSession(null);
    }
  };

  const placeBid = async (plate: AuctionItem) => {
    try {
      const nextPrice = plate.price + plate.step;
      const sessionCode = plate.sessionCode || plate.p;

      await placeBidApi(sessionCode, nextPrice);

      showSuccessNotify(
        `Đặt giá thành công cho biển ${plate.p}: ${formatMoney(nextPrice)}`
      );
      setSelectedPlate(null);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Đặt giá thất bại. Vui lòng kiểm tra trạng thái đăng nhập và tiền cọc!";
      showErrorNotify(errMsg);
    }
  };

  return {
    selectedPlate,
    setSelectedPlate,
    placeBid,
    toggleWatch,
    watchLoading: watchMutation.isLoading || unwatchMutation.isLoading,
  };
};

export default useAction;
