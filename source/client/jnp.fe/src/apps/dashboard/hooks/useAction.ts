import { useState } from "react";
import useNotification from "@/shared/hooks/useNotification";
import type { AuctionItem, WsBidMessage } from "../services/type";
import { formatMoney } from "../utils/format";

export const useAction = (
  setData?: React.Dispatch<React.SetStateAction<AuctionItem[]>>,
  sendBidWs?: (bid: WsBidMessage) => boolean,
  currentUser?: { name: string; email?: string }
) => {
  const { showSuccessNotify, showErrorNotify } = useNotification();
  const [selectedPlate, setSelectedPlate] = useState<AuctionItem | null>(null);

  const placeBid = (plate: AuctionItem) => {
    try {
      const nextPrice = plate.price + plate.step;
      const nextBids = plate.bids + 1;

      // 1. Gửi qua WebSocket tới server để broadcast cho toàn bộ người dùng
      if (sendBidWs) {
        sendBidWs({
          plateNumber: plate.p,
          roomId: plate.p,
          bidAmount: nextPrice,
          currentPrice: nextPrice,
          stepPrice: plate.step,
          userName: currentUser?.name || "Người dùng",
          userId: currentUser?.email || "user",
          type: "BID",
        });
      }

      // 2. Cập nhật lạc quan (optimistic UI) trên client hiện tại
      if (setData) {
        setData((prev) =>
          prev.map((item) => {
            if (item.p === plate.p) {
              return { ...item, price: nextPrice, bids: nextBids };
            }
            return item;
          })
        );
      }

      showSuccessNotify(
        `Đặt giá thành công cho biển ${plate.p}! Giá mới: ${formatMoney(nextPrice)}`
      );
      setSelectedPlate(null);
    } catch {
      showErrorNotify("Đặt giá thất bại. Vui lòng thử lại!");
    }
  };

  return {
    selectedPlate,
    setSelectedPlate,
    placeBid,
  };
};

export default useAction;
