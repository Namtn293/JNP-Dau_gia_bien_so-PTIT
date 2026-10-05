export type AuctionStatus = "live" | "soon" | "end";

export interface AuctionItem {
  p: string;
  prov: string;
  type: string;
  st: AuctionStatus;
  price: number;
  step: number;
  bids: number;
  t: number;
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
