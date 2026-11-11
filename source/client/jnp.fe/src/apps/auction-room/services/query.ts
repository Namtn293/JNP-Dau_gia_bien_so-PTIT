import { useQuery } from "react-query";
import { QK } from "@/shared/constants/queryKeys";
import {
  getAuctionRoomDetailApi,
  getAuctionRegistrationApi,
  getWalletBalanceApi,
  getAuctionWatchStatusApi,
  getAutoBidConfigApi,
  getPriceSeriesApi,
  getRoomChatsApi,
} from "./api";
import type {
  AuctionRoomDetail,
  RegistrationDetailVO,
  WalletBalanceVO,
  WsChatMessage,
} from "./type";
import type { AutoBidConfig, PriceSeries } from "@/shared/types/auction";

export const AUCTION_ROOM_QUERY_KEY = "AUCTION_ROOM_DETAIL";
export const AUCTION_REGISTRATION_QUERY_KEY = "AUCTION_ROOM_REGISTRATION";
export const WALLET_BALANCE_QUERY_KEY = "WALLET_BALANCE";
export const AUCTION_WATCH_STATUS_QUERY_KEY = "AUCTION_ROOM_WATCH_STATUS";

export const useAuctionRoomDetailQuery = (
  roomId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<AuctionRoomDetail>(
    QK.roomDetail(roomId),
    () => getAuctionRoomDetailApi(roomId),
    {
      staleTime: 0,
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
    QK.registration(sessionCode),
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
    QK.wallet,
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

export const useAutoBidConfigQuery = (
  sessionCode?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<AutoBidConfig>(
    QK.autoBid(sessionCode || ""),
    () => getAutoBidConfigApi(sessionCode!),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      enabled: !!sessionCode && (options?.enabled ?? true),
    }
  );
};

export const usePriceSeriesQuery = (
  sessionCode?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<PriceSeries>(
    QK.priceSeries(sessionCode || ""),
    () => getPriceSeriesApi(sessionCode!),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      enabled: !!sessionCode && (options?.enabled ?? true),
    }
  );
};

export const useRoomChatHistoryQuery = (
  sessionCode?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<WsChatMessage[]>(
    QK.roomChats(sessionCode || ""),
    () => getRoomChatsApi(sessionCode!, 100),
    {
      staleTime: 0,
      refetchOnWindowFocus: false,
      enabled: !!sessionCode && (options?.enabled ?? true),
    }
  );
};
