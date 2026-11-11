import axiosClient from "@/configs/axios";
import type {
  AuctionRoomDetail,
  PlaceBidPayload,
  SendChatPayload,
  RegistrationDetailVO,
  WalletBalanceVO,
} from "./type";

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

export const sendChatRestApi = async (
  payload: SendChatPayload
): Promise<{ success: boolean; data: SendChatPayload }> => {
  return Promise.resolve({ success: true, data: payload });
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
  const response = await axiosClient.get<any>("/api/v1/wallet/balance");
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
