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
  userName: string;
  bidAmount: number;
  time: string;
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
  remainingSeconds: number;
  status: AuctionRoomStatus;
  bidCount: number;
  participantCount: number;
  leadingUser: string;
  reserveMet: boolean;
  pinnedNotice: string;
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
  plateNumber?: string;
  userName?: string;
  bidAmount?: number;
  currentPrice?: number;
  stepPrice?: number;
  bidCount?: number;
  timestamp?: string;
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
  event: "JOIN" | "LEAVE" | "HALT" | "RESUME" | "CANCEL" | "END" | string;
  message?: string;
  participantCount?: number;
  timestamp?: string;
}
