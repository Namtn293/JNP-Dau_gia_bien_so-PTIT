import type { AuctionItem } from "../services/type";

export const SECONDS_IN_HOUR = 3600;

export const INITIAL_AUCTION_DATA: AuctionItem[] = [
  { p: "30K-555.55", prov: "Hà Nội", type: "Ngũ quý", plateTypeEnum: "NGU_QUY", st: "live", price: 1850000000, step: 50000000, bids: 42, t: 1240 },
  { p: "51H-888.88", prov: "TP.HCM", type: "Ngũ quý", plateTypeEnum: "NGU_QUY", st: "live", price: 2320000000, step: 100000000, bids: 67, t: 48 },
  { p: "29A-999.99", prov: "Hà Nội", type: "Ngũ quý", plateTypeEnum: "NGU_QUY", st: "live", price: 3100000000, step: 100000000, bids: 81, t: 5400 },
  { p: "43A-686.86", prov: "Đà Nẵng", type: "Lộc phát", plateTypeEnum: "LOC_PHAT", st: "live", price: 410000000, step: 10000000, bids: 19, t: 2900 },
  { p: "15K-777.77", prov: "Hải Phòng", type: "Ngũ quý", plateTypeEnum: "NGU_QUY", st: "soon", price: 600000000, step: 20000000, bids: 0, t: 3 * SECONDS_IN_HOUR },
  { p: "30L-123.45", prov: "Hà Nội", type: "Sảnh tiến", plateTypeEnum: "SANH_TIEN", st: "soon", price: 350000000, step: 10000000, bids: 0, t: 7 * SECONDS_IN_HOUR },
  { p: "51G-379.79", prov: "TP.HCM", type: "Thần tài", plateTypeEnum: "THAN_TAI", st: "soon", price: 280000000, step: 10000000, bids: 0, t: 20 * SECONDS_IN_HOUR },
  { p: "88A-666.66", prov: "Hà Nội", type: "Ngũ quý", plateTypeEnum: "NGU_QUY", st: "end", price: 4250000000, step: 100000000, bids: 112, t: 0 },
  { p: "30H-868.68", prov: "Hà Nội", type: "Lộc phát", plateTypeEnum: "LOC_PHAT", st: "end", price: 520000000, step: 10000000, bids: 34, t: 0 },
  { p: "51F-345.67", prov: "TP.HCM", type: "Sảnh tiến", plateTypeEnum: "SANH_TIEN", st: "end", price: 190000000, step: 5000000, bids: 15, t: 0 },
  { p: "43B-333.33", prov: "Đà Nẵng", type: "Ngũ quý", plateTypeEnum: "NGU_QUY", st: "end", price: 760000000, step: 20000000, bids: 48, t: 0 },
];

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
