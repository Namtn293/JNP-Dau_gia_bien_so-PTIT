import type { AuctionItem } from "../services/type";
import { SECONDS_IN_HOUR } from "./constants";

export const formatMoney = (n: number): string => {
  if (n >= 1e9) {
    return (n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
  }
  return (n / 1e6).toLocaleString("vi-VN") + " triệu";
};

export const formatTime = (s: number): string => {
  const h = Math.floor(s / SECONDS_IN_HOUR);
  const m = Math.floor((s % SECONDS_IN_HOUR) / 60);
  const sec = s % 60;
  const z = (v: number) => String(v).padStart(2, "0");
  return (h ? `${h}:` : "") + `${z(m)}:${z(sec)}`;
};

export const getTimeLabel = (item: AuctionItem): string => {
  if (item.st === "end") return "Đã chốt";
  if (item.st === "soon") return `Mở sau ${formatTime(item.t)}`;
  return `Còn ${formatTime(item.t)}`;
};

export const getPriceLabel = (item: AuctionItem): string => {
  if (item.st === "end") return "Giá chốt";
  if (item.st === "soon") return "Giá khởi điểm";
  return "Giá hiện tại";
};
