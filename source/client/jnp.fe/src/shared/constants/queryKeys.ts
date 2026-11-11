/**
 * React Query Keys dùng chung toàn app để quản lý cache và invalidate chéo
 */

export const QK = {
  sessions: (status: string, page: number) => ["auction-sessions", status, page] as const,
  roomDetail: (code: string) => ["auction-room", code] as const,
  registration: (code: string) => ["registration", code] as const,
  autoBid: (code: string) => ["auto-bid", code] as const,
  priceSeries: (code: string) => ["price-series", code] as const,
  sessionBids: (code: string) => ["session-bids", code] as const,
  announcements: (code: string) => ["announcements", code] as const,
  roomChats: (code: string) => ["room-chats", code] as const,
  wallet: ["wallet"] as const,
  walletTx: (page: number, type?: string) => ["wallet-tx", page, type] as const,
  watchList: (page: number) => ["watch-list", page] as const,
  notifications: (page: number, unreadOnly: boolean) => ["notifications", page, unreadOnly] as const,
  unreadCount: ["notifications-unread"] as const,
  myBids: (page: number, result?: string) => ["my-bids", page, result] as const,
  myBidsInSession: (code: string) => ["my-bids", code] as const,
  shillAlerts: (params: object) => ["shill-alerts", params] as const,
};

