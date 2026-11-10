import { useState } from "react";
import { useNotification } from "@/shared/hooks/useNotification";
import { useTopupMutation } from "../services/mutation";
import { validateTopupAmount } from "../feature/topupValidation";
import { formatVnd } from "../util/format";

export const useAction = () => {
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(10_000_000);
  const { showSuccessNotify, showErrorNotify } = useNotification();

  const topupMutation = useTopupMutation();

  const openTopupModal = () => {
    setAmount(10_000_000);
    setIsTopupModalOpen(true);
  };

  const closeTopupModal = () => {
    if (!topupMutation.isLoading) {
      setIsTopupModalOpen(false);
    }
  };

  const handleSelectPreset = (value: number) => {
    setAmount(value);
  };

  const handleTopup = async () => {
    const errorMsg = validateTopupAmount(amount);
    if (errorMsg) {
      showErrorNotify(errorMsg);
      return;
    }

    try {
      await topupMutation.mutateAsync({ amount });
      showSuccessNotify(`Nạp thành công ${formatVnd(amount)} vào ví!`);
      setIsTopupModalOpen(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Nạp tiền không thành công, vui lòng thử lại";
      showErrorNotify(msg);
    }
  };

  return {
    isTopupModalOpen,
    openTopupModal,
    closeTopupModal,
    amount,
    setAmount,
    handleSelectPreset,
    handleTopup,
    isTopupLoading: topupMutation.isLoading,
  };
};

