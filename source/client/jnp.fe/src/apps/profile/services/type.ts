export type WalletTxType = "INIT_BONUS" | "TOPUP" | "HOLD" | "RELEASE" | "CAPTURE";

export interface WalletVO {
  balance: number;
  heldAmount: number;
  available: number;
}

export interface WalletTransactionVO {
  id: number;
  type: WalletTxType;
  amount: number;
  balanceAfter: number;
  heldAfter: number;
  sessionCode?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface TopupDTO {
  amount: number;
}

export interface UserProfile {
  id?: string | number;
  username?: string;
  fullName?: string;
  displayName: string;
  email?: string;
  roles: string[];
}

export type BidResultStatus = "LEADING" | "OUTBID" | "WON" | "LOST";

export interface MyAuctionHistoryVO {
  sessionCode: string;
  plateNumber: string;
  provinceName: string;
  status: string;
  startTime: string;
  endTime: string;
  myBidCount: number;
  myAutoBidCount: number;
  myHighestBid: number;
  myLastBidAt: string;
  finalPrice: number;
  depositStatus?: "ACTIVE" | "RELEASED" | "CAPTURED" | "CANCELLED" | null;
  result: BidResultStatus;
}

export interface MySessionBidItemVO {
  userId?: number;
  userName?: string;
  bidAmount: number;
  increment?: number;
  source?: "MANUAL" | "AUTO";
  time?: string;
  bidTime?: string;
  isWinning?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  empty: boolean;
  first: boolean;
  last: boolean;
}

