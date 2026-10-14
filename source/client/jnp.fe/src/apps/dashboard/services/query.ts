import { useQuery } from "react-query";
import { getAuctionSessionsApi } from "./api";
import type { AuctionSessionVO, GetAuctionSessionsParams, PageResponse } from "./type";

export const AUCTION_QUERY_KEY = "AUCTION_SESSIONS";

export const useAuctionSessionsQuery = (
  params?: GetAuctionSessionsParams,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useQuery<PageResponse<AuctionSessionVO>>(
    [AUCTION_QUERY_KEY, params?.status, params?.page, params?.size],
    () => getAuctionSessionsApi(params),
    {
      staleTime: 10 * 1000,
      refetchInterval: options?.refetchInterval ?? 30000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: options?.enabled ?? true,
    }
  );
};
