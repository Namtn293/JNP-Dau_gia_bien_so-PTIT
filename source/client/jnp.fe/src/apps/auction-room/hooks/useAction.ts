import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useNotification } from "@/shared/hooks/useNotification";
import { formatMoney, parseMoney, getCurrentTimeString } from "../util/format";
import type { AuctionLot } from "../services/type";

interface UseActionProps {
  currentPrice: number;
  stepPrice: number;
  isEnded: boolean;
  leader?: string;
  plateNumber: string;
  sessionCode: string;
  currentUser: { name?: string; fullName?: string; id?: string };
  customBidInput: string;
  setCustomBidInput: (v: string) => void;
  chatInput: string;
  setChatInput: (v: string) => void;
  confirmModal: { open: boolean; amount: number };
  setConfirmModal: (v: { open: boolean; amount: number }) => void;
  setMyLastBid: (v: number) => void;
  soundEnabled?: boolean;
  setSoundEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
  autoBidEnabled?: boolean;
  setAutoBidEnabled: (v: boolean) => void;
  autoBidMax: string;
  setAutoBidMax: (v: string) => void;
  sendSocketBid: (payload: any) => boolean;
  sendSocketChat: (content: string, senderName?: string) => boolean;
  handleAuctionUpdate: (msg: any) => void;
  addSystemNotice?: (msg: string) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useAction = ({
  currentPrice,
  stepPrice,
  isEnded,
  plateNumber,
  sessionCode,
  currentUser,
  customBidInput,
  setCustomBidInput,
  chatInput,
  setChatInput,
  confirmModal,
  setConfirmModal,
  setMyLastBid,
  setSoundEnabled,
  setAutoBidEnabled,
  autoBidMax,
  setAutoBidMax,
  sendSocketBid,
  sendSocketChat,
  handleAuctionUpdate,
  setChatMessages,
}: UseActionProps) => {
  const navigate = useNavigate();
  const { showSuccessNotify, showErrorNotify } = useNotification();

  // 1. Prompt confirmation modal before placing bid
  const promptBidModal = useCallback(
    (targetAmount: number) => {
      if (isEnded) {
        showErrorNotify("Phiên đấu giá đã kết thúc");
        return;
      }
      if (targetAmount <= currentPrice) {
        showErrorNotify(`Mức giá phải cao hơn giá hiện tại (${formatMoney(currentPrice)})`);
        return;
      }
      setConfirmModal({
        open: true,
        amount: targetAmount,
      });
    },
    [isEnded, currentPrice, setConfirmModal, showErrorNotify]
  );

  // 2. Action: Quick bid buttons (+1, +2, +5 steps)
  const onQuickBid = useCallback(
    (multiplier: number) => {
      const target = currentPrice + stepPrice * multiplier;
      promptBidModal(target);
    },
    [currentPrice, stepPrice, promptBidModal]
  );

  // 3. Action: Big main bid button (+1 step)
  const onMainBid = useCallback(() => {
    const target = currentPrice + stepPrice;
    promptBidModal(target);
  }, [currentPrice, stepPrice, promptBidModal]);

  // 4. Action: Custom bid input submission
  const onSubmitCustomBid = useCallback(() => {
    const val = parseMoney(customBidInput);
    const minRequired = currentPrice + stepPrice;
    if (val < minRequired) {
      showErrorNotify(`Mức giá tối thiểu hợp lệ là ${formatMoney(minRequired)}`);
      return;
    }
    promptBidModal(val);
  }, [customBidInput, currentPrice, stepPrice, promptBidModal, showErrorNotify]);

  // 5. Action: Confirm and execute bid
  const onConfirmBid = useCallback(() => {
    const amount = confirmModal.amount;
    setConfirmModal({ open: false, amount: 0 });
    setCustomBidInput("");

    if (amount <= currentPrice) {
      showErrorNotify("Mức giá đã thay đổi bởi người khác, vui lòng đặt lại");
      return;
    }

    setMyLastBid(amount);

    const userName = currentUser?.name || "Bạn";
    const bidPayload = {
      roomId: sessionCode,
      plateNumber,
      bidAmount: amount,
      currentPrice: amount,
      userName,
      timestamp: getCurrentTimeString(),
    };

    // Broadcast through socket if active, otherwise trigger local update
    const sent = sendSocketBid(bidPayload);
    if (!sent) {
      handleAuctionUpdate(bidPayload);
    }

    showSuccessNotify(`Đặt giá thành công ${formatMoney(amount)} cho biển số ${plateNumber}!`);
  }, [
    confirmModal.amount,
    currentPrice,
    setConfirmModal,
    setCustomBidInput,
    setMyLastBid,
    currentUser,
    sessionCode,
    plateNumber,
    sendSocketBid,
    handleAuctionUpdate,
    showSuccessNotify,
    showErrorNotify,
  ]);

  // 6. Action: Cancel modal
  const onCancelModal = useCallback(() => {
    setConfirmModal({ open: false, amount: 0 });
  }, [setConfirmModal]);

  // 7. Action: Send chat message
  const onSendChat = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const senderName = currentUser?.fullName || currentUser?.name || "Bạn";
    const sent = sendSocketChat(trimmed, senderName);

    // Only add local message if socket is not connected
    if (!sent) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          senderName,
          content: trimmed,
          time: getCurrentTimeString(),
          isMine: true,
        },
      ]);
    }

    setChatInput("");
  }, [chatInput, currentUser, sendSocketChat, setChatMessages, setChatInput]);

  // 8. Action: Toggle audio sound
  const onToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      showSuccessNotify(next ? "Đã bật âm thanh chuông báo" : "Đã tắt âm thanh");
      return next;
    });
  }, [setSoundEnabled, showSuccessNotify]);

  // 9. Action: Toggle auto-bidding proxy
  const onToggleAutoBid = useCallback(
    (checked: boolean) => {
      if (checked) {
        const maxVal = parseMoney(autoBidMax);
        if (maxVal <= currentPrice) {
          showErrorNotify(`Mức giá tự động tối đa phải cao hơn giá hiện tại (${formatMoney(currentPrice)})`);
          return;
        }
        setAutoBidEnabled(true);
        showSuccessNotify(`Đã kích hoạt tự động đặt giá tới mức tối đa ${formatMoney(maxVal)}`);
      } else {
        setAutoBidEnabled(false);
        showSuccessNotify("Đã tắt tính năng tự động đặt giá");
      }
    },
    [autoBidMax, currentPrice, setAutoBidEnabled, showSuccessNotify, showErrorNotify]
  );

  // 10. Action: Change auto bid max input
  const onChangeAutoBidMax = useCallback(
    (val: string) => {
      const num = parseMoney(val);
      setAutoBidMax(num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "");
    },
    [setAutoBidMax]
  );

  // 11. Action: Navigate to another lot
  const onSelectLot = useCallback(
    (lot: AuctionLot) => {
      const targetRoomId = lot.roomId || lot.plateNumber;
      navigate({
        to: `/phong-dau-gia/${targetRoomId}` as any,
      });
    },
    [navigate]
  );

  // 12. Action: Back to auction list dashboard
  const onBackToList = useCallback(() => {
    navigate({
      to: "/danh-sach-dau-gia",
    });
  }, [navigate]);

  return {
    onQuickBid,
    onMainBid,
    onSubmitCustomBid,
    onConfirmBid,
    onCancelModal,
    onSendChat,
    onToggleSound,
    onToggleAutoBid,
    onChangeAutoBidMax,
    onSelectLot,
    onBackToList,
  };
};
