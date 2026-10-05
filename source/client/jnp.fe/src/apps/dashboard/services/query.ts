import { useQuery } from "react-query";
import { getAuctionList } from "./api";
import type { AuctionItem } from "./type";

export const AUCTION_QUERY_KEY = ["auction-list"];

export const useAuctionListQuery = () => {
  return useQuery<AuctionItem[]>(AUCTION_QUERY_KEY, getAuctionList, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
