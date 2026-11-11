import axiosClient from "@/configs/axios";
import type {
  AnnouncementDTO,
  AnnouncementLevel,
  RoomAnnouncement,
  ShillAlert,
  ShillAlertStatus,
} from "@/shared/types/auction";

export interface AdminRoomVO {
  id: string;
  plate: string;
  region: string;
  status: string;
  participantCount: number;
  currentPrice: number;
  remainingLabel: string;
  rttMs: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const getAdminRoomsApi = async (): Promise<AdminRoomVO[]> => {
  const res = await axiosClient.get<any>("/api/v1/admin/auction/rooms");
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export const haltRoomApi = async (roomId: string): Promise<any> => {
  const res = await axiosClient.post<any>(`/api/v1/admin/auction/rooms/${roomId}/halt`);
  return (res as any)?.data ?? res;
};

export const resumeRoomApi = async (roomId: string): Promise<any> => {
  const res = await axiosClient.post<any>(`/api/v1/admin/auction/rooms/${roomId}/resume`);
  return (res as any)?.data ?? res;
};

export const cancelRoomApi = async (roomId: string): Promise<any> => {
  const res = await axiosClient.post<any>(`/api/v1/admin/auction/rooms/${roomId}/cancel`);
  return (res as any)?.data ?? res;
};

export const getRoomAnnouncementsApi = async (
  code: string,
  page = 0,
  size = 20
): Promise<PageResponse<RoomAnnouncement>> => {
  const res = await axiosClient.get<any>(`/api/v1/auction/${code}/announcements`, {
    params: { page, size },
  });
  return (res as any)?.data ?? res;
};

export const postRoomAnnouncementApi = async (
  code: string,
  dto: AnnouncementDTO & { level?: AnnouncementLevel }
): Promise<RoomAnnouncement> => {
  const res = await axiosClient.post<any>(
    `/api/v1/admin/auction/${code}/announcements`,
    dto
  );
  return (res as any)?.data ?? res;
};

export const deleteRoomAnnouncementApi = async (
  code: string,
  id: number
): Promise<string> => {
  const res = await axiosClient.delete<any>(
    `/api/v1/admin/auction/${code}/announcements/${id}`
  );
  return (res as any)?.data ?? res;
};

export const getShillAlertsApi = async (params?: {
  status?: ShillAlertStatus | string;
  sessionCode?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<ShillAlert>> => {
  const res = await axiosClient.get<any>("/api/v1/admin/shill-alerts", {
    params: {
      status: params?.status || undefined,
      sessionCode: params?.sessionCode || undefined,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  });
  return (res as any)?.data ?? res;
};

export const getShillAlertDetailApi = async (id: number): Promise<ShillAlert> => {
  const res = await axiosClient.get<any>(`/api/v1/admin/shill-alerts/${id}`);
  return (res as any)?.data ?? res;
};

export const reviewShillAlertApi = async (
  id: number,
  dto: { status: ShillAlertStatus; note?: string }
): Promise<ShillAlert> => {
  const res = await axiosClient.put<any>(`/api/v1/admin/shill-alerts/${id}`, dto);
  return (res as any)?.data ?? res;
};

export const banUserApi = async (
  userId: number,
  reason?: string
): Promise<string> => {
  const res = await axiosClient.post<any>(`/api/v1/admin/users/${userId}/ban`, {
    reason: reason || "Vi phạm quy chế đấu giá (thổi giá)",
  });
  return (res as any)?.data ?? res;
};

