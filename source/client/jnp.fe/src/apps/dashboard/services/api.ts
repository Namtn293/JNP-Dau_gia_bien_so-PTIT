import axiosClient from "@/configs/axios";
import type {
  AuctionSessionVO,
  GetAuctionSessionsParams,
  PageResponse,
  WatchVO,
  // PlaceBidPayload,
} from "./type";

export const getAuctionSessionsApi = async (
  params?: GetAuctionSessionsParams
): Promise<PageResponse<AuctionSessionVO>> => {
  const response = await axiosClient.get<any>("/api/v1/auction/get", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      status: params?.status ?? "SOON",
    },
  });

  // response is already response.data from axios interceptor
  const resData = (response as any)?.data ?? response;
  return resData;
};

export const placeBidApi = async (
  sessionCode: string,
  bidAmount: number
): Promise<any> => {
  const response = await axiosClient.post<any>(`/api/v1/auction/${sessionCode}/bid`, {
    bidAmount,
  });
  return (response as any)?.data ?? response;
};

export const getWatchedListApi = async (
  page = 0,
  size = 100
): Promise<PageResponse<WatchVO>> => {
  const response = await axiosClient.get<any>("/api/v1/watch", {
    params: { page, size },
  });
  return (response as any)?.data ?? response;
};

export const watchSessionApi = async (sessionCode: string): Promise<any> => {
  const response = await axiosClient.post<any>(`/api/v1/watch/${sessionCode}`);
  return response;
};

export const unwatchSessionApi = async (sessionCode: string): Promise<any> => {
  const response = await axiosClient.delete<any>(`/api/v1/watch/${sessionCode}`);
  return response;
};
