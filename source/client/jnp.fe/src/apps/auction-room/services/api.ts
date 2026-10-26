import axiosClient from "@/configs/axios";
import type { AuctionRoomDetail, PlaceBidPayload, SendChatPayload } from "./type";

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
  payload: PlaceBidPayload
): Promise<{ success: boolean; data: PlaceBidPayload }> => {
  return Promise.resolve({ success: true, data: payload });
};

export const sendChatRestApi = async (
  payload: SendChatPayload
): Promise<{ success: boolean; data: SendChatPayload }> => {
  return Promise.resolve({ success: true, data: payload });
};
