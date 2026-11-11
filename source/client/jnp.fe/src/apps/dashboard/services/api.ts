import axiosClient from "@/configs/axios";
import type {
  AuctionSessionVO,
  GetAuctionSessionsParams,
  PageResponse,
  WatchVO,
  // PlaceBidPayload,
} from "./type";

const fetchByStatus = async (
  status: string,
  page = 0,
  size = 100
): Promise<PageResponse<AuctionSessionVO>> => {
  const response = await axiosClient.get<any>("/api/v1/auction/get", {
    params: { page, size, status },
  });
  return (response as any)?.data ?? response;
};

export const getAuctionSessionsApi = async (
  params?: GetAuctionSessionsParams
): Promise<PageResponse<AuctionSessionVO>> => {
  const status = params?.status ?? "ALL";
  const page = params?.page ?? 0;
  const size = params?.size ?? 100;

  if (status === "ALL") {
    const [liveRes, soonRes, endRes] = await Promise.all([
      fetchByStatus("LIVE", page, size),
      fetchByStatus("SOON", page, size),
      fetchByStatus("END", page, size),
    ]);

    const combinedContent: AuctionSessionVO[] = [
      ...(Array.isArray(liveRes?.content) ? liveRes.content : []),
      ...(Array.isArray(soonRes?.content) ? soonRes.content : []),
      ...(Array.isArray(endRes?.content) ? endRes.content : []),
    ];

    return {
      content: combinedContent,
      totalElements: combinedContent.length,
      totalPages: 1,
      size: combinedContent.length || size,
      number: 0,
      numberOfElements: combinedContent.length,
      first: true,
      last: true,
      empty: combinedContent.length === 0,
    };
  }

  return fetchByStatus(status, page, size);
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
