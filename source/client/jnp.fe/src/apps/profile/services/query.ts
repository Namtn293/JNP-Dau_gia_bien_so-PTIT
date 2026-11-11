import { useQuery } from "react-query";
import { QK } from "@/shared/constants/queryKeys";
import { getWalletApi, getWalletTransactionsApi, getMyBidHistoryApi } from "./api";
import type { WalletVO, PageResponse, WalletTransactionVO, MyAuctionHistoryVO } from "./type";

export const useWalletQuery = (options?: { enabled?: boolean }) => {
  return useQuery<WalletVO>(QK.wallet, getWalletApi, {
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useWalletTransactionsQuery = (
  params: { page: number; size: number; type?: string },
  options?: { enabled?: boolean }
) => {
  return useQuery<PageResponse<WalletTransactionVO>>(
    [...QK.walletTx(params.page, params.type), params.size],
    () => getWalletTransactionsApi(params),
    {
      staleTime: 10 * 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: options?.enabled ?? true,
    }
  );
};

export const useMyBidHistoryQuery = (
  params: { page: number; size: number; result?: string },
  options?: { enabled?: boolean }
) => {
  return useQuery<PageResponse<MyAuctionHistoryVO>>(
    [...QK.myBids(params.page, params.result), params.size],
    () => getMyBidHistoryApi(params),
    {
      staleTime: 10 * 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: options?.enabled ?? true,
    }
  );
};

