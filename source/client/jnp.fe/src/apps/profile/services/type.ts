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

