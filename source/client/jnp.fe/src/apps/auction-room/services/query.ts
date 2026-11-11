import { useQuery } from "react-query";
import {
  getAuctionRoomDetailApi,
  getAuctionRegistrationApi,
  getWalletBalanceApi,
  getAuctionWatchStatusApi,
} from "./api";
import type {
  AuctionRoomDetail,
  RegistrationDetailVO,
  WalletBalanceVO,
} from "./type";

export const AUCTION_ROOM_QUERY_KEY = "AUCTION_ROOM_DETAIL";
export const AUCTION_REGISTRATION_QUERY_KEY = "AUCTION_ROOM_REGISTRATION";
export const WALLET_BALANCE_QUERY_KEY = "WALLET_BALANCE";
export const AUCTION_WATCH_STATUS_QUERY_KEY = "AUCTION_ROOM_WATCH_STATUS";

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

export const useAuctionRegistrationQuery = (
  sessionCode: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<RegistrationDetailVO>(
    [AUCTION_REGISTRATION_QUERY_KEY, sessionCode],
    () => getAuctionRegistrationApi(sessionCode),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      enabled: !!sessionCode && (options?.enabled ?? true),
    }
  );
};

export const useWalletBalanceQuery = (options?: { enabled?: boolean }) => {
  return useQuery<WalletBalanceVO>(
    [WALLET_BALANCE_QUERY_KEY],
    () => getWalletBalanceApi(),
    {
      staleTime: 10000,
      refetchOnWindowFocus: false,
      enabled: options?.enabled ?? true,
    }
  );
};

export const useAuctionWatchStatusQuery = (
  sessionCode?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<boolean>(
    [AUCTION_WATCH_STATUS_QUERY_KEY, sessionCode],
    () => getAuctionWatchStatusApi(sessionCode!),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      enabled: !!sessionCode && (options?.enabled ?? true),
    }
  );
};
