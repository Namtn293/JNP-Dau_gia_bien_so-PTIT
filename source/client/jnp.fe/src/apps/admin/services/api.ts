import type { Taikhoan } from "@/apps/admin/services/types";
import type { IResponse } from "@/shared/types/response.type";
// import type { ILoginRespone, TLoginRequest } from "@apps/auth/services/types";
import type { ILoginRespone, TLoginRequestAdmin as TLoginRequest } from "@apps/auth/services/types";
import axiosClient from "@configs/axios";
import { SERVICE_ADMIN_PREFIX } from '@/shared/constants';

const BASE_PATH = `${SERVICE_ADMIN_PREFIX}/Account`; // admin/api/Account
const BASE_PATH_USER = `${SERVICE_ADMIN_PREFIX}/QuanLyNguoiDung`; // admin/api/QuanLyNguoiDung

export const login = (
  payload: TLoginRequest
): Promise<IResponse<ILoginRespone>> => {
  const url = `${BASE_PATH}/login`;
  return axiosClient.post(url, payload);
};
export const getUserInfo = (): Promise<IResponse<Taikhoan>> => {
  const url = `${BASE_PATH_USER}/me`;
  return axiosClient.get(url);
};
export const getAccoungList = (): Promise<any> => {
  const url = `${BASE_PATH}/list`;
  return axiosClient.get(url);
};
