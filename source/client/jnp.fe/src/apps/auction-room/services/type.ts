export type AuctionRoomStatus = "LIVE" | "SOON" | "END";

export interface AuctionLot {
  roomId: string;
  plateNumber: string;
  provinceName: string;
  plateType: string;
  currentPrice: number;
  status: AuctionRoomStatus | string;
  timeLabel: string;
  isCurrent?: boolean;
}

export interface BidHistoryItem {
  userId?: number | string;
  userName: string;
  bidAmount: number;
  increment?: number;
  source?: "MANUAL" | "AUTO" | string;
  time: string;
  bidTime?: string;
  isWinning?: boolean;
  isMine?: boolean;
}

export interface ChatMessage {
  id?: string;
  senderName: string;
  content: string;
  time: string;
  isHost?: boolean;
  isSystem?: boolean;
  isMine?: boolean;
  tag?: string;
}

export interface RoomParticipant {
  id: string;
  name: string;
  role?: string;
  statusText?: string;
  isSelf?: boolean;
  isLeader?: boolean;
}

export interface AuctionRoomDetail {
  sessionCode: string;
  title: string;
  plateNumber: string;
  provinceName: string;
  plateType: string;
  vehicleType: string;
  startPrice: number;
  currentPrice: number;
  endPrice: number;
  stepPrice: number;
  depositAmount: number;
  startTime: string;
  endTime: string;
  startTimeEpochMs?: number;
  endTimeEpochMs?: number;
  serverTimeMs?: number;
  remainingSeconds: number;
  status: AuctionRoomStatus;
  bidCount: number;
  participantCount: number;
  leadingUser: string;
  leadingUserId?: number | string;
  reserveMet: boolean;
  pinnedNotice: string;
  myRole?: RoomRoleEnum;
  isRegistered?: boolean;
  nextStep?: number;
  nextMinBid?: number;
  lots: AuctionLot[];
  initialBids: BidHistoryItem[];
}

export interface PlaceBidPayload {
  roomId: string;
  plateNumber: string;
  bidAmount: number;
  userName?: string;
}

export interface SendChatPayload {
  roomId: string;
  content: string;
  senderName?: string;
}

export interface WsAuctionMessage {
  roomId?: string;
  userId?: string | number;
  plateNumber?: string;
  userName?: string;
  bidAmount?: number;
  currentPrice?: number;
  stepPrice?: number;
  nextStep?: number;
  nextMinBid?: number;
  bidCount?: number;
  timestamp?: string;
  bidTime?: string;
  remainingSeconds?: number;
  endTime?: string;
  endTimeEpochMs?: number;
  serverTimeMs?: number;
  extended?: boolean;
  source?: "MANUAL" | "AUTO" | string;
  status?: string;
  type?: "BID" | "EXTEND" | "NEW_HIGHEST" | "STATUS_CHANGE" | string;
}

export interface WsChatMessage {
  id?: string;
  roomId: string;
  senderId?: string;
  senderName: string;
  content: string;
  timestamp?: string;
  type?: "CHAT" | "JOIN" | "LEAVE" | string;
}

export interface WsRoomEvent {
  roomId: string;
  event:
    | "JOIN"
    | "LEAVE"
    | "START"
    | "HALT"
    | "RESUME"
    | "CANCEL"
    | "END"
    | "ANNOUNCEMENT"
    | "ANNOUNCEMENT_REMOVED"
    | string;
  message?: string;
  participantCount?: number;
  timestamp?: string;
  pinned?: boolean;
  level?: "INFO" | "WARNING" | "IMPORTANT" | string;
  announcementId?: number;
  adminName?: string;
  remainingSeconds?: number;
  endTime?: string;
  endTimeEpochMs?: number;
  serverTimeMs?: number;
}

export type RoomRoleEnum = "BIDDER" | "VIEWER" | "ADMIN" | string;
export type RegistrationStatusEnum = "ACTIVE" | "CANCELLED" | string;

export interface RegistrationDetailVO {
  registered: boolean;
  depositAmount: number;
  status: RegistrationStatusEnum | null;
  myRole: RoomRoleEnum;
}

export interface WalletBalanceVO {
  balance: number;
  heldAmount: number;
  available: number;
}
