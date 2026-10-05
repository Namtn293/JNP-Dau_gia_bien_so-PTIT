import axiosClient from "@/configs/axios";
import type { IResponse } from "@/shared/types/response.type";
import type {
  TLoginApiPayload,
  ILoginRespone,
  TLoginRequestAdmin,
  TLoginRequestNhaDauTu,
} from "@apps/auth/services/types";
import { SERVICE_ADMIN_PREFIX } from '@/shared/constants';

const BASE_PATH_AUTH = `${SERVICE_ADMIN_PREFIX}/Auth`; // admin/api/Auth
const BASE_PATH_AUTH_CNTC = `${SERVICE_ADMIN_PREFIX}/cntc/CNTC_Auth`; // admin/api/cntc/CNTC_Auth

/**
 * Chuyển đổi form data sang payload API
 */
const mapLoginRequestToApiPayload = (
  request: TLoginRequestNhaDauTu,
): TLoginApiPayload => {
  return {
    canCuocCongDan: request.account,
    matKhau: request.password,
  };
};

/**
 * API đăng nhập
 * Endpoint: POST /Auth/DangNhap
 * (BaseURL đã có /api nên chỉ cần /Auth/DangNhap)
 * Body: { tenDangNhap: string, matKhau: string }
 * Response: { token: string, refreshToken: string, user: IUser }
 */
export const login = (
  payload: TLoginRequestAdmin,
  recaptchaToken?: string,
): Promise<IResponse<ILoginRespone>> => {
  return axiosClient.post(`${BASE_PATH_AUTH}/dang-nhap`, payload, {
    headers: recaptchaToken ? { "X-Recaptcha-Token": recaptchaToken } : undefined,
  });
};

export const loginNhaDauTu = (
  payload: TLoginRequestNhaDauTu,
): Promise<IResponse<ILoginRespone>> => {
  const apiPayload = mapLoginRequestToApiPayload(payload);
  return axiosClient.post(`${BASE_PATH_AUTH_CNTC}/dang-nhap`, apiPayload);
};

export const LoginCanBo = (
  payload: TLoginRequestAdmin,
): Promise<IResponse<ILoginRespone>> => {
  return axiosClient.post(`${BASE_PATH_AUTH}/dang-nhap-ldap`, payload);
};

export const getAccoungList = (): Promise<any[]> => {
  // Giải thích: Khi tắt auth thật, danh sách tài khoản cũng trả về rỗng để tránh gọi backend.
  return Promise.resolve([]);
};
