export type AuctionStatus = "live" | "soon" | "end";

export type PlateTypeEnum =
  | "NGU_QUY"
  | "TU_QUY"
  | "LOC_PHAT"
  | "THAN_TAI"
  | "SANH_TIEN"
  | "OTHER";

export interface AuctionSessionVO {
  sessionCode?: string;
  plateNumber: string;
  provinceName: string;
  plateType: PlateTypeEnum | string;
  price: number;
  currentPrice?: number;
  sessionStatus: string;
  statusCode?: string;
  startTime: string;
  endTime: string;
  startTimeEpochMs?: number;
  endTimeEpochMs?: number;
  serverTimeMs?: number;
  stepPrice: number;
  nextStep?: number;
  nextMinBid?: number;
  participantCount: number;
  endPrice: number;
  isWatched?: boolean;
  isRegistered?: boolean;
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
  sessionCode?: string;
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
  targetTimeMs?: number;
  isRegistered?: boolean;
}

export interface PlaceBidPayload {
  sessionCode?: string;
  plateNumber: string;
  bidAmount?: number;
  amount?: number;
}

export interface WatchVO {
  sessionCode: string;
  plateNumber: string;
  provinceName: string;
  startPrice: number;
  currentPrice: number;
  status: string;
  startTime: string;
  endTime: string;
  watchedAt: string;
}

export interface AuctionFilterParams {
  tab?: AuctionStatus;
  search?: string;
  province?: string;
  plateType?: string;
  sortBy?: "time" | "hi" | "lo" | "bids";
  viewMode?: "grid" | "table" | "board";
}

export interface WsBidMessage {
  plateNumber?: string;
  roomId?: string;
  userId?: string;
  userName?: string;
  bidAmount?: number;
  currentPrice?: number;
  stepPrice?: number;
  bidCount?: number;
  timestamp?: string;
  status?: string;
  type?: "BID" | "EXTEND" | "NEW_HIGHEST" | "STATUS_CHANGE" | string;
}

export type WsConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

