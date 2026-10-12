import { useState } from "react";
import useNotification from "@/shared/hooks/useNotification";
import type { AuctionItem } from "../services/type";
import { formatMoney } from "../utils/format";

export const useAction = (
  setData?: React.Dispatch<React.SetStateAction<AuctionItem[]>>
) => {
  const { showSuccessNotify, showErrorNotify } = useNotification();
  const [selectedPlate, setSelectedPlate] = useState<AuctionItem | null>(null);

  const placeBid = (plate: AuctionItem) => {
    try {
      if (setData) {
        setData((prev) =>
          prev.map((item) => {
            if (item.p === plate.p) {
              const nextPrice = item.price + item.step;
              const nextBids = item.bids + 1;
              return { ...item, price: nextPrice, bids: nextBids };
            }
            return item;
          })
        );
      }
      showSuccessNotify(
        `Đặt giá thành công cho biển ${plate.p}! Giá mới: ${formatMoney(
          plate.price + plate.step
        )}`
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
