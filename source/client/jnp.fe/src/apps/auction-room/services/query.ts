import { useQuery } from "react-query";
import { getAuctionRoomDetailApi } from "./api";
import type { AuctionRoomDetail } from "./type";

export const AUCTION_ROOM_QUERY_KEY = "AUCTION_ROOM_DETAIL";

export const useAuctionRoomDetailQuery = (
  roomId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<AuctionRoomDetail>(
    [AUCTION_ROOM_QUERY_KEY, roomId],
    () => getAuctionRoomDetailApi(roomId),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      enabled: !!roomId && (options?.enabled ?? true),
    }
  );
};
