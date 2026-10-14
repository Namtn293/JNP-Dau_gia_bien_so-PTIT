export type AuctionStatus = "live" | "soon" | "end";

export type PlateTypeEnum =
  | "NGU_QUY"
  | "TU_QUY"
  | "LOC_PHAT"
  | "THAN_TAI"
  | "SANH_TIEN"
  | "OTHER";

export interface AuctionSessionVO {
  plateNumber: string;
  provinceName: string;
  plateType: PlateTypeEnum | string;
  price: number;
  sessionStatus: string;
  startTime: string;
  endTime: string;
  stepPrice: number;
  participantCount: number;
  endPrice: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message?: string | null;
  success: boolean;
  data: T;
  metaData?: any;
}

export interface GetAuctionSessionsParams {
  page?: number;
  size?: number;
  status?: string;
}

export interface AuctionItem {
  p: string;
  prov: string;
  type: string;
  plateTypeEnum?: PlateTypeEnum | string;
  st: AuctionStatus;
  price: number;
  step: number;
  bids: number;
  t: number;
  startTime?: string;
  endTime?: string;
}

export interface PlaceBidPayload {
  plateNumber: string;
  amount: number;
}

export interface AuctionFilterParams {
  tab?: AuctionStatus;
  search?: string;
  province?: string;
  plateType?: string;
  sortBy?: "time" | "hi" | "lo" | "bids";
  viewMode?: "grid" | "table" | "board";
}
