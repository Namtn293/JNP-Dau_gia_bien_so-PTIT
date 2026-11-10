/**
 * Các kiểu dữ liệu cốt lõi cho hệ thống Đấu giá Biển số Xe
 * Đồng bộ chính xác với Backend Auction Core Service (VO, Entity, DTO, Enums)
 */

export type AuctionStatus = "SOON" | "LIVE" | "PAUSED" | "END";
export type RoomRole = "ADMIN" | "BIDDER" | "VIEWER";
export type BidSource = "MANUAL" | "AUTO";
export type RegistrationStatus = "ACTIVE" | "RELEASED" | "CAPTURED" | "CANCELLED";
export type WalletTxType = "INIT_BONUS" | "TOPUP" | "HOLD" | "RELEASE" | "CAPTURE";
export type AutoBidStopReason = "USER_DISABLED" | "MAX_REACHED" | "SESSION_ENDED" | "NOT_REGISTERED";
export type NotificationType =
  | "STARTING_SOON"
  | "STARTED"
  | "NEW_BID"
  | "OUTBID"
  | "ENDING_SOON"
  | "ENDED_WON"
  | "ENDED_LOST"
  | "ENDED"
  | "ROOM_ANNOUNCEMENT"
  | "AUTO_BID_STOPPED"
  | "SHILL_ALERT"
  | "WALLET_TOPUP"
  | "BID_SUCCESS";
export type ShillSeverity = "MEDIUM" | "HIGH";
export type ShillAlertStatus = "OPEN" | "CONFIRMED" | "DISMISSED";
export type AnnouncementLevel = "INFO" | "WARNING" | "IMPORTANT";
export type HistoryResult = "LEADING" | "OUTBID" | "WON" | "LOST";

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Broadcast giá /topics/auction/{code}, /topic/auctions */
export interface BidMessage {
  roomId: string;
  userId: string | null;
  userName: string;
  bidAmount: number;
  currentPrice: number;
  timestamp: string;
  bidTime: string;
  plateNumber: string;
  stepPrice: number;
  bidCount: number;
  status?: string;
  nextStep: number;
  nextMinBid: number;
  source: BidSource;
  type: "BID" | "EXTEND" | "NEW_HIGHEST" | "STATUS_CHANGE" | string;
}

export interface RoomEvent {
  roomId: string;
  event: string;
  message: string;
  participantCount?: number;
  timestamp: string;
}

export interface WsError {
  code: string;
  message: string;
  timestamp: string;
}

/** Cảnh báo vượt giá gửi qua /user/queue/outbid */
export interface OutbidAlert {
  sessionCode: string;
  plateNumber: string;
  newPrice: number;
  yourLastBid: number;
  nextMinBid: number;
  nextStep: number;
  outbidBy: string;
  remainingSeconds: number;
  autoBidActive: boolean;
  bidTime: string;
}

export interface AutoBidStoppedPayload {
  sessionCode: string;
  reason: AutoBidStopReason;
  message: string;
}

export interface RoomRoleChanged {
  sessionCode: string;
  role: RoomRole;
  status: RegistrationStatus;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  sessionCode: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  heldAmount: number;
  available: number;
}

export interface WalletTransaction {
  id: number;
  type: WalletTxType;
  amount: number;
  balanceAfter: number;
  heldAfter: number;
  sessionCode: string | null;
  note: string | null;
  createdAt: string;
}

export interface Registration {
  registered: boolean;
  depositAmount: number;
  status: RegistrationStatus | null;
  myRole: RoomRole;
}

export interface AutoBidConfig {
  sessionCode: string;
  maxAmount: number;
  active: boolean;
  stoppedReason: AutoBidStopReason | null;
  autoBidCount: number;
  nextMinBid: number;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidHistoryItem {
  userName: string;
  userId: number | null;
  bidAmount: number;
  increment: number;
  source: BidSource;
  time: string;
  bidTime: string;
  isWinning: boolean;
}

export interface MyAuctionHistory {
  sessionCode: string;
  plateNumber: string;
  provinceName: string;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  myBidCount: number;
  myAutoBidCount: number;
  myHighestBid: number;
  myLastBidAt: string;
  finalPrice: number;
  depositStatus: RegistrationStatus | null;
  result: HistoryResult;
}

export interface PricePoint {
  time: string;
  price: number;
  bidder: string | null;
  source: BidSource | null;
  step: number | null;
}

export interface StepTier {
  upTo: number | null;
  step: number;
}

export interface PriceSeries {
  sessionCode: string;
  startPrice: number;
  startTime: string;
  endTime: string;
  points: PricePoint[];
  stepTiers: StepTier[];
}

export interface WatchItem {
  sessionCode: string;
  plateNumber: string;
  provinceName: string;
  startPrice: number;
  currentPrice: number;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  watchedAt: string;
}

export interface RoomAnnouncement {
  id: number;
  sessionCode: string;
  content: string;
  pinned: boolean;
  level: AnnouncementLevel;
  adminName: string | null;
  createdAt: string;
}

export interface ShillAlert {
  id: number;
  sessionId: number;
  sessionCode: string;
  userAId: number;
  userAName: string;
  userBId: number;
  userBName: string;
  bidCount: number;
  minGapSeconds: number;
  avgGapSeconds: number;
  sameIp: boolean;
  severity: ShillSeverity;
  status: ShillAlertStatus;
  firstBidAt: string;
  lastBidAt: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  note: string | null;
  recentBids?: BidHistoryItem[];
}

