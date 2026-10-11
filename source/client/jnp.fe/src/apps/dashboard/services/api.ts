import type { AuctionItem, PlaceBidPayload } from "./type";
import { INITIAL_AUCTION_DATA } from "../utils/constants";

export const getAuctionList = async (): Promise<AuctionItem[]> => {
  // In development/mock mode without backend, return initial auction list
  return Promise.resolve(INITIAL_AUCTION_DATA);
};

export const placeBid = async (payload: PlaceBidPayload): Promise<{ success: boolean; data: PlaceBidPayload }> => {
  return Promise.resolve({ success: true, data: payload });
};
