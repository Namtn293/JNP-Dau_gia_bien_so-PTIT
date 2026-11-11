import type {
  AuctionItem,
  AuctionSessionVO,
  AuctionStatus,
} from "../services/type";
import { PLATE_TYPE_LABELS, SECONDS_IN_HOUR } from "./constants";
import {
  computeRemainingSecondsFromTarget,
  resolveTargetEpochMs,
  updateServerClockOffset,
} from "@/shared/utils/serverClock";

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

export const getPlateTypeLabel = (type?: string): string => {
  if (!type) return "Khác";
  return PLATE_TYPE_LABELS[type] || type;
};

export const mapStatusToAuctionStatus = (status?: string): AuctionStatus => {
  if (!status) return "soon";
  const s = status.trim().toUpperCase();
  if (s === "LIVE" || s === "ĐANG DIỄN RA") return "live";
  if (s === "END" || s === "ĐÃ KẾT THÚC") return "end";
  return "soon";
};

export const calculateRemainingSeconds = (
  sessionStatus?: string,
  startTimeStr?: string,
  endTimeStr?: string
): number => {
  const now = Date.now();
  const st = mapStatusToAuctionStatus(sessionStatus);

  if (st === "soon") {
    if (startTimeStr) {
      const startMs = new Date(startTimeStr).getTime();
      if (!isNaN(startMs)) {
        const diff = Math.floor((startMs - now) / 1000);
        return diff > 0 ? diff : 0;
      }
    }
    return 3600 * 3;
  }

  if (st === "live") {
    if (endTimeStr) {
      const endMs = new Date(endTimeStr).getTime();
      if (!isNaN(endMs)) {
        const diff = Math.floor((endMs - now) / 1000);
        return diff > 0 ? diff : 0;
      }
    }
    return 1800;
  }

  return 0;
};

export const mapAuctionSessionVOToItem = (vo: AuctionSessionVO): AuctionItem => {
  if (vo.serverTimeMs) {
    updateServerClockOffset(vo.serverTimeMs, 800);
  }
  const rawStatus = vo.statusCode || vo.sessionStatus;
  const st = mapStatusToAuctionStatus(rawStatus);
  const targetTimeMs =
    st === "end"
      ? undefined
      : resolveTargetEpochMs({
          epochMs: st === "soon" ? vo.startTimeEpochMs : vo.endTimeEpochMs,
          isoTime: st === "soon" ? vo.startTime : vo.endTime,
        }) ?? undefined;

  const t =
    st === "end"
      ? 0
      : targetTimeMs
      ? computeRemainingSecondsFromTarget(targetTimeMs)
      : calculateRemainingSeconds(rawStatus, vo.startTime, vo.endTime);

  const displayPrice =
    st === "end"
      ? (vo.endPrice ?? vo.currentPrice ?? vo.price ?? 0)
      : st === "live"
        ? (vo.currentPrice ?? vo.price ?? 0)
        : (vo.price ?? vo.currentPrice ?? 0);

  return {
    p: vo.plateNumber,
    sessionCode: vo.sessionCode || vo.plateNumber,
    prov: vo.provinceName || "Toàn quốc",
    type: getPlateTypeLabel(vo.plateType),
    plateTypeEnum: vo.plateType,
    st,
    price: displayPrice,
    step: vo.nextStep ?? vo.stepPrice ?? 5000000,
    bids: vo.participantCount ?? 0,
    t,
    startTime: vo.startTime,
    endTime: vo.endTime,
    targetTimeMs,
    isRegistered: Boolean(vo.isRegistered),
  };
};
