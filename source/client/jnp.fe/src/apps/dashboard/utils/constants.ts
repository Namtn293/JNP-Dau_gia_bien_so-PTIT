import type { AuctionItem } from "../services/type";

export const SECONDS_IN_HOUR = 3600;

export const INITIAL_AUCTION_DATA: AuctionItem[] = [];

export const STATUS_LABEL_MAP: Record<string, string> = {
  live: "Đang diễn ra",
  soon: "Sắp diễn ra",
  end: "Đã kết thúc",
};

export const PROVINCES_LIST = [
  "Hà Nội",
  "TP.HCM",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Nghệ An",
  "Bình Dương",
];

export const PLATE_TYPE_LABELS: Record<string, string> = {
  NGU_QUY: "Ngũ quý",
  TU_QUY: "Tứ quý",
  LOC_PHAT: "Lộc phát",
  THAN_TAI: "Thần tài",
  SANH_TIEN: "Sảnh tiến",
  OTHER: "Khác",
  "Ngũ quý": "Ngũ quý",
  "Tứ quý": "Tứ quý",
  "Lộc phát": "Lộc phát",
  "Thần tài": "Thần tài",
  "Sảnh tiến": "Sảnh tiến",
  "Khác": "Khác",
};

export const PLATE_TYPES_OPTIONS = [
  { label: "Ngũ quý", value: "NGU_QUY" },
  { label: "Tứ quý", value: "TU_QUY" },
  { label: "Thần tài", value: "THAN_TAI" },
  { label: "Lộc phát", value: "LOC_PHAT" },
  { label: "Sảnh tiến", value: "SANH_TIEN" },
  { label: "Khác", value: "OTHER" },
];

export const PLATE_TYPES_LIST = [
  "Ngũ quý",
  "Tứ quý",
  "Thần tài",
  "Lộc phát",
  "Sảnh tiến",
  "Khác",
];
