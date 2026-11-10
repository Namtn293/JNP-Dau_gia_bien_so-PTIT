import axiosClient from "@/configs/axios";
import type { NotificationItem } from "@/shared/types/auction";

export interface NotificationsPageResponse {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  empty: boolean;
  first: boolean;
  last: boolean;
}

export const getNotificationsApi = async (params?: {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsPageResponse> => {
  const res = await axiosClient.get<any>("/api/v1/notifications", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      unreadOnly: params?.unreadOnly ?? false,
    },
  });
  return (res as any)?.data ?? res;
};

export const getUnreadNotificationCountApi = async (): Promise<number> => {
  const res = await axiosClient.get<any>("/api/v1/notifications/unread-count");
  const data = (res as any)?.data ?? res;
  return typeof data === "number" ? data : Number(data) || 0;
};

export const markNotificationAsReadApi = async (id: number): Promise<void> => {
  await axiosClient.put(`/api/v1/notifications/${id}/read`);
};

export const markAllNotificationsAsReadApi = async (): Promise<void> => {
  await axiosClient.put("/api/v1/notifications/read-all");
};

