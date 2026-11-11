import axiosClient from "@/configs/axios";
import type {
  AuctionRoomDetail,
  SendChatPayload,
  RegistrationDetailVO,
  WalletBalanceVO,
  WsChatMessage,
} from "./type";
import type { AutoBidConfig, PriceSeries } from "@/shared/types/auction";

export const getAuctionRoomDetailApi = async (
  roomId: string
): Promise<AuctionRoomDetail> => {
  try {
    const response = await axiosClient.get<any>(`/api/v1/auction/room/${roomId}`);
    const resData = (response as any)?.data ?? response;
    return resData;
  } catch (error) {
    console.error("[AuctionRoomApi] Failed to fetch room detail from BE:", error);
    throw error;
  }
};

export const placeBidRestApi = async (
  sessionCode: string,
  bidAmount: number
): Promise<any> => {
  const response = await axiosClient.post<any>(`/api/v1/auction/${sessionCode}/bid`, {
    bidAmount,
  });
  return (response as any)?.data ?? response;
};

export const getRoomChatsApi = async (
  code: string,
  limit = 100
): Promise<WsChatMessage[]> => {
  const response = await axiosClient.get<any>(`/api/v1/auction/${code}/chats`, {
    params: { limit },
  });
  const resData = (response as any)?.data ?? response;
  return Array.isArray(resData) ? resData : [];
};

export const sendChatRestApi = async (
  payload: SendChatPayload
): Promise<WsChatMessage> => {
  const response = await axiosClient.post<any>(
    `/api/v1/auction/${payload.roomId}/chats`,
    {
      content: payload.content,
      senderName: payload.senderName,
    }
  );
  return (response as any)?.data ?? response;
};

export const getAuctionRegistrationApi = async (
  code: string
): Promise<RegistrationDetailVO> => {
  const response = await axiosClient.get<any>(`/api/v1/auction/${code}/registration`);
  return (response as any)?.data ?? response;
};

export const registerAuctionApi = async (
  code: string
): Promise<RegistrationDetailVO> => {
  const response = await axiosClient.post<any>(`/api/v1/auction/${code}/register`);
  return (response as any)?.data ?? response;
};

export const cancelRegistrationApi = async (
  code: string
): Promise<RegistrationDetailVO> => {
  const response = await axiosClient.delete<any>(`/api/v1/auction/${code}/register`);
  return (response as any)?.data ?? response;
};

export const getWalletBalanceApi = async (): Promise<WalletBalanceVO> => {
  const response = await axiosClient.get<any>("/api/v1/wallet");
  return (response as any)?.data ?? response;
};

export const getAutoBidConfigApi = async (code: string): Promise<AutoBidConfig> => {
  const response = await axiosClient.get<any>(`/api/v1/auction/${code}/auto-bid`);
  return (response as any)?.data ?? response;
};

export const configureAutoBidApi = async (
  code: string,
  maxAmount: number
): Promise<AutoBidConfig> => {
  const response = await axiosClient.put<any>(`/api/v1/auction/${code}/auto-bid`, {
    maxAmount,
  });
  return (response as any)?.data ?? response;
};

export const disableAutoBidApi = async (code: string): Promise<string> => {
  const response = await axiosClient.delete<any>(`/api/v1/auction/${code}/auto-bid`);
  return (response as any)?.data ?? response;
};

export const getPriceSeriesApi = async (code: string): Promise<PriceSeries> => {
  const response = await axiosClient.get<any>(`/api/v1/auction/${code}/price-series`);
  return (response as any)?.data ?? response;
};

export const getAuctionWatchStatusApi = async (sessionCode: string): Promise<boolean> => {
  const response = await axiosClient.get<any>(`/api/v1/watch/${sessionCode}/status`);
  return (response as any)?.data ?? response;
};

export const watchAuctionSessionApi = async (sessionCode: string): Promise<any> => {
  const response = await axiosClient.post<any>(`/api/v1/watch/${sessionCode}`);
  return response;
};

export const unwatchAuctionSessionApi = async (sessionCode: string): Promise<any> => {
  const response = await axiosClient.delete<any>(`/api/v1/watch/${sessionCode}`);
  return response;
};
