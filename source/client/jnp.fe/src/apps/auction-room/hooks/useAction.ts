import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useNotification } from "@/shared/hooks/useNotification";
import { formatMoney, parseMoney, getCurrentTimeString } from "../util/format";
import type { AuctionLot } from "../services/type";
import { placeBidRestApi } from "../services/api";
import {
  useRegisterAuctionMutation,
  useCancelRegistrationMutation,
  useWatchAuctionMutation,
  useUnwatchAuctionMutation,
  useConfigureAutoBidMutation,
  useDisableAutoBidMutation,
} from "../services/mutation";

interface UseActionProps {
  currentPrice: number;
  stepPrice: number;
  isEnded: boolean;
  roomStatus?: "LIVE" | "SOON" | "PAUSED" | "END";
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
  isRegistered?: boolean;
  setDepositModalOpen: (open: boolean) => void;
  refetchRegistration?: () => void;
  refetchWallet?: () => void;
  isWatched?: boolean;
  refetchWatchStatus?: () => void;
}

export const useAction = ({
  currentPrice,
  stepPrice,
  isEnded,
  roomStatus = "LIVE",
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
  // handleAuctionUpdate,
  // setChatMessages,
  isRegistered,
  setDepositModalOpen,
  refetchRegistration,
  refetchWallet,
  isWatched,
  refetchWatchStatus,
}: UseActionProps) => {
  const navigate = useNavigate();
  const { showSuccessNotify, showErrorNotify } = useNotification();
  const registerMutation = useRegisterAuctionMutation();
  const cancelRegisterMutation = useCancelRegistrationMutation();
  const watchMutation = useWatchAuctionMutation();
  const unwatchMutation = useUnwatchAuctionMutation();
  const configureAutoBidMutation = useConfigureAutoBidMutation();
  const disableAutoBidMutation = useDisableAutoBidMutation();
  const [togglingWatch, setTogglingWatch] = useState(false);

  const onToggleWatch = useCallback(async () => {
    if (togglingWatch) return;
    const targetCode = sessionCode || plateNumber;
    setTogglingWatch(true);

    try {
      const res = isWatched
        ? await unwatchMutation.mutateAsync(targetCode)
        : await watchMutation.mutateAsync(targetCode);

      // 1. Kiểm tra cờ success trả về từ BE
      if (res && res.success === false) {
        showErrorNotify(res.message || "Thao tác không thành công!");
        return;
      }

      // 2. Lấy message chính thức từ BE (nếu có)
      const msg =
        res?.message ||
        (typeof res?.data === "string" ? res.data : null) ||
        (isWatched ? `Đã bỏ theo dõi biển số ${plateNumber}` : `Đã theo dõi biển số ${plateNumber}`);

      showSuccessNotify(msg);
      refetchWatchStatus?.();
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Thao tác theo dõi thất bại.";
      showErrorNotify(errMsg);
    } finally {
      setTogglingWatch(false);
    }
  }, [
    sessionCode,
    plateNumber,
    isWatched,
    togglingWatch,
    watchMutation,
    unwatchMutation,
    showSuccessNotify,
    showErrorNotify,
    refetchWatchStatus,
  ]);

  const onOpenDepositModal = useCallback(() => {
    setDepositModalOpen(true);
  }, [setDepositModalOpen]);

  const onCloseDepositModal = useCallback(() => {
    setDepositModalOpen(false);
  }, [setDepositModalOpen]);

  const onConfirmDeposit = useCallback(async () => {
    try {
      const targetCode = sessionCode || plateNumber;
      await registerMutation.mutateAsync(targetCode);
      showSuccessNotify(
        `Nộp tiền đặt trước thành công! Bạn đã được cấp quyền Đấu giá viên chính thức cho biển số ${plateNumber}.`
      );
      setDepositModalOpen(false);
      refetchRegistration?.();
      refetchWallet?.();
    } catch (err: any) {
      showErrorNotify(
        err?.response?.data?.message || err?.message || "Đặt cọc thất bại. Vui lòng kiểm tra lại số dư ví!"
      );
    }
  }, [
    sessionCode,
    plateNumber,
    registerMutation,
    showSuccessNotify,
    showErrorNotify,
    setDepositModalOpen,
    refetchRegistration,
    refetchWallet,
  ]);

  const onCancelDeposit = useCallback(async () => {
    try {
      const targetCode = sessionCode || plateNumber;
      await cancelRegisterMutation.mutateAsync(targetCode);
      showSuccessNotify(
        `Đã hủy đăng ký tham gia biển số ${plateNumber} và hoàn lại 100% tiền cọc vào ví.`
      );
      refetchRegistration?.();
      refetchWallet?.();
    } catch (err: any) {
      showErrorNotify(
        err?.response?.data?.message || err?.data?.message || err?.message || "Không thể hủy cọc!"
      );
    }
  }, [
    sessionCode,
    plateNumber,
    cancelRegisterMutation,
    showSuccessNotify,
    showErrorNotify,
    refetchRegistration,
    refetchWallet,
  ]);

  // 1. Prompt confirmation modal before placing bid
  const promptBidModal = useCallback(
    (targetAmount: number) => {
      if (isEnded || roomStatus === "END") {
        showErrorNotify("Phiên đấu giá đã kết thúc");
        return;
      }
      if (roomStatus === "PAUSED") {
        showErrorNotify("Phiên đấu giá đang tạm dừng khẩn cấp bởi Ban tổ chức");
        return;
      }
      if (roomStatus === "SOON") {
        showErrorNotify("Phiên đấu giá chưa bắt đầu");
        return;
      }
      if (!isRegistered) {
        showErrorNotify("Bạn đang ở chế độ Khách xem. Vui lòng nộp tiền đặt trước (40.000.000 đ) để tham gia trả giá.");
        setDepositModalOpen(true);
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
    [isEnded, roomStatus, isRegistered, currentPrice, setConfirmModal, setDepositModalOpen, showErrorNotify]
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

  // 5. Action: Confirm and execute bid (gọi REST để nhận kết quả đồng bộ từ BidService; server tự broadcast STOMP tới phòng)
  const onConfirmBid = useCallback(async () => {
    const amount = confirmModal.amount;
    setConfirmModal({ open: false, amount: 0 });
    setCustomBidInput("");

    if (amount <= currentPrice) {
      showErrorNotify("Mức giá đã thay đổi bởi người khác, vui lòng đặt lại");
      return;
    }

    try {
      await placeBidRestApi(sessionCode, amount);
      setMyLastBid(amount);
      showSuccessNotify(`Đặt giá thành công ${formatMoney(amount)} cho biển số ${plateNumber}!`);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Đặt giá thất bại. Vui lòng thử lại!";
      showErrorNotify(errMsg);
    }
  }, [
    confirmModal.amount,
    currentPrice,
    setConfirmModal,
    setCustomBidInput,
    setMyLastBid,
    sessionCode,
    plateNumber,
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

    if (!sent) {
      showErrorNotify("Mất kết nối máy chủ, không thể gửi tin nhắn chat!");
      return;
    }

    setChatInput("");
  }, [chatInput, currentUser, sendSocketChat, showErrorNotify, setChatInput]);

  // 8. Action: Toggle audio sound
  const onToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      showSuccessNotify(next ? "Đã bật âm thanh chuông báo" : "Đã tắt âm thanh");
      return next;
    });
  }, [setSoundEnabled, showSuccessNotify]);

  // 9. Action: Toggle auto-bidding proxy (Server-side AutoBidScheduler)
  const onToggleAutoBid = useCallback(
    async (checked: boolean) => {
      const targetCode = sessionCode || plateNumber;
      if (checked) {
        const maxVal = parseMoney(autoBidMax);
        const minRequired = currentPrice + stepPrice;
        if (maxVal < minRequired) {
          showErrorNotify(
            `Mức giá tự động tối đa phải tối thiểu bằng giá đặt kế tiếp (${formatMoney(minRequired)})`
          );
          return;
        }
        try {
          await configureAutoBidMutation.mutateAsync({
            sessionCode: targetCode,
            maxAmount: maxVal,
          });
          setAutoBidEnabled(true);
          showSuccessNotify(
            `Đã kích hoạt đấu giá tự động trên server tới mức tối đa ${formatMoney(maxVal)}`
          );
        } catch (err: any) {
          showErrorNotify(
            err?.response?.data?.message || err?.message || "Không thể bật đấu giá tự động"
          );
        }
      } else {
        try {
          await disableAutoBidMutation.mutateAsync(targetCode);
          setAutoBidEnabled(false);
          showSuccessNotify("Đã tắt tính năng tự động đặt giá");
        } catch (err: any) {
          showErrorNotify(
            err?.response?.data?.message || err?.message || "Không thể tắt đấu giá tự động"
          );
        }
      }
    },
    [
      sessionCode,
      plateNumber,
      autoBidMax,
      currentPrice,
      stepPrice,
      configureAutoBidMutation,
      disableAutoBidMutation,
      setAutoBidEnabled,
      showSuccessNotify,
      showErrorNotify,
    ]
  );

  // 9b. Action: Update auto bid max while enabled
  const onUpdateAutoBidMax = useCallback(async () => {
    const targetCode = sessionCode || plateNumber;
    const maxVal = parseMoney(autoBidMax);
    const minRequired = currentPrice + stepPrice;
    if (maxVal < minRequired) {
      showErrorNotify(
        `Mức giá tự động tối đa phải tối thiểu bằng ${formatMoney(minRequired)}`
      );
      return;
    }
    try {
      await configureAutoBidMutation.mutateAsync({
        sessionCode: targetCode,
        maxAmount: maxVal,
      });
      showSuccessNotify(`Đã cập nhật mức trần tự động: ${formatMoney(maxVal)}`);
    } catch (err: any) {
      showErrorNotify(
        err?.response?.data?.message || err?.message || "Không thể cập nhật mức trần tự động"
      );
    }
  }, [
    sessionCode,
    plateNumber,
    autoBidMax,
    currentPrice,
    stepPrice,
    configureAutoBidMutation,
    showSuccessNotify,
    showErrorNotify,
  ]);

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
        to: "/phong-dau-gia/$roomId",
        params: { roomId: targetRoomId },
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
    onUpdateAutoBidMax,
    autoBidLoading: configureAutoBidMutation.isLoading || disableAutoBidMutation.isLoading,
    onSelectLot,
    onBackToList,
    onOpenDepositModal,
    onCloseDepositModal,
    onConfirmDeposit,
    onCancelDeposit,
    depositLoading: registerMutation.isLoading || cancelRegisterMutation.isLoading,
    onToggleWatch,
    watchLoading: watchMutation.isLoading || unwatchMutation.isLoading,
  };
};
