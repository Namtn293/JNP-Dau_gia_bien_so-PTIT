import { useState } from "react";
import useNotification from "@/shared/hooks/useNotification";
import type { AuctionItem, WsBidMessage } from "../services/type";
import { formatMoney } from "../utils/format";
import { placeBidApi } from "../services/api";

export const useAction = (
  _setData?: React.Dispatch<React.SetStateAction<AuctionItem[]>>,
  sendBidWs?: (bid: WsBidMessage) => boolean,
  currentUser?: { name: string; email?: string } | null
) => {
  const { showSuccessNotify, showErrorNotify } = useNotification();
  const [selectedPlate, setSelectedPlate] = useState<AuctionItem | null>(null);

  const placeBid = async (plate: AuctionItem) => {
    try {
      const nextPrice = plate.price + plate.step;
      const sessionCode = plate.sessionCode || plate.p;

      // 1. Gửi qua WebSocket nếu đang kết nối
      let sentViaWs = false;
      if (sendBidWs) {
        sentViaWs = sendBidWs({
          plateNumber: plate.p,
          roomId: sessionCode,
          bidAmount: nextPrice,
          currentPrice: nextPrice,
          stepPrice: plate.step,
          userName: currentUser?.name || "",
          userId: currentUser?.email || "user",
          type: "BID",
        });
      }

      // 2. Nếu WebSocket gián đoạn, fallback qua REST API
      if (!sentViaWs) {
        await placeBidApi(sessionCode, nextPrice);
      }

      showSuccessNotify(
        `Đã gửi yêu cầu đặt giá cho biển ${plate.p}: ${formatMoney(nextPrice)}`
      );
      setSelectedPlate(null);
    } catch (err: any) {
      showErrorNotify(err?.message || "Đặt giá thất bại. Vui lòng thử lại!");
    }
  };

  return {
    selectedPlate,
    setSelectedPlate,
    placeBid,
  };
};

export default useAction;
