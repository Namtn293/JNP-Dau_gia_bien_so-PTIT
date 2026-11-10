import axiosClient from "@/configs/axios";
import type { WalletVO, TopupDTO, WalletTransactionVO, PageResponse } from "./type";

export const getWalletApi = async (): Promise<WalletVO> => {
  const response = await axiosClient.get<any>("/api/v1/wallet");
  return (response as any)?.data ?? response;
};

export const topupApi = async (dto: TopupDTO): Promise<WalletVO> => {
  const response = await axiosClient.post<any>("/api/v1/wallet/topup", dto);
  return (response as any)?.data ?? response;
};

export const getWalletTransactionsApi = async (params?: {
  page?: number;
  size?: number;
  type?: string;
}): Promise<PageResponse<WalletTransactionVO>> => {
  const response = await axiosClient.get<any>("/api/v1/wallet/transactions", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      type: params?.type || undefined,
    },
  });
  return (response as any)?.data ?? response;
};

