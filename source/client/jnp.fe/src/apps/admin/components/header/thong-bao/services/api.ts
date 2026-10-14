import axiosClient from '@/configs/axios';
import type { IResponse } from '@/shared/types/response.type';
import { SERVICE_ADMIN_PREFIX } from '@/shared/constants';
const BASE_URL = `${SERVICE_ADMIN_PREFIX}/thong-bao`;


export const layTatCaThongBao = async ({ page = 1, pageSize = 20, ...restParams } = {}) => {
  const res = await axiosClient.get(`${BASE_URL}/cua-toi`, {
    params: { page, pageSize, ...restParams },
  });
  return res as any;
};

export const danhDauDaXem = async (id: number) => {
  await axiosClient.put(`${BASE_URL}/danh-dau-da-xem/${id}`);
};

export const danhDauTatCaDaXem = async () => {
  await axiosClient.put(`${BASE_URL}/danh-dau-tat-ca-da-xem`);
};

export const xoaThongBao = async (ids: number[]): Promise<IResponse<boolean>> => {
  return axiosClient.delete(`${BASE_URL}/xoa`, {
    data: ids,
  });
};

export const demSoLuongThongBaoChuaXem = async (): Promise<number> => {
  const res = await axiosClient.get(`${BASE_URL}/dem-so-luong-chua-xem`);
  return (res as any).data;
};

