import dayjs from "dayjs";
import type { WalletTxType } from "../services/type";

export const formatVnd = (amount?: number | null): string => {
  if (amount == null || isNaN(amount)) return "0 ₫";
  return amount.toLocaleString("vi-VN") + " ₫";
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD/MM/YYYY HH:mm:ss");
};

export interface TxBadgeConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  sign: string;
}

export const getTxTypeBadge = (type?: WalletTxType): TxBadgeConfig => {
  switch (type) {
    case "INIT_BONUS":
      return {
        label: "Tặng ban đầu",
        color: "#389e0d",
        bg: "#f6ffed",
        border: "#b7eb8f",
        sign: "+",
      };
    case "TOPUP":
      return {
        label: "Nạp tiền",
        color: "#389e0d",
        bg: "#f6ffed",
        border: "#b7eb8f",
        sign: "+",
      };
    case "HOLD":
      return {
        label: "Giữ cọc",
        color: "#d46b08",
        bg: "#fff7e6",
        border: "#ffd591",
        sign: "🔒",
      };
    case "RELEASE":
      return {
        label: "Hoàn cọc",
        color: "#0958d9",
        bg: "#e6f7ff",
        border: "#91c5ff",
        sign: "🔓",
      };
    case "CAPTURE":
      return {
        label: "Trừ cọc (Trúng)",
        color: "#cf1322",
        bg: "#fff1f0",
        border: "#ffa39e",
        sign: "−",
      };
    default:
      return {
        label: type || "Giao dịch",
        color: "#595959",
        bg: "#f5f5f5",
        border: "#d9d9d9",
        sign: "",
      };
  }
};

