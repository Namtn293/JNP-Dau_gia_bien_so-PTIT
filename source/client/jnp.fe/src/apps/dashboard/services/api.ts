import axiosClient from "@/configs/axios";
import type {
  AuctionSessionVO,
  GetAuctionSessionsParams,
  PageResponse,
  PlaceBidPayload,
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
  payload: PlaceBidPayload
): Promise<{ success: boolean; data: PlaceBidPayload }> => {
  return Promise.resolve({ success: true, data: payload });
};
