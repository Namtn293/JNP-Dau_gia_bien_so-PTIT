import axiosClient from "@/configs/axios";
import type {
  CompleteGoogleRegistrationPayload,
  CompleteGoogleRegistrationResponse,
} from "./type";

/**
 * Hoàn tất hồ sơ định danh cho người dùng đăng nhập bằng Google lần đầu (isNewUser=true)
 * Endpoint: POST /api/auth/google/complete-registration
 */
export const completeGoogleRegistrationApi = async (
  payload: CompleteGoogleRegistrationPayload
): Promise<string> => {
  const res = await axiosClient.post<CompleteGoogleRegistrationResponse>(
    "/api/auth/google/complete-registration",
    payload,
    {
      headers: { "skip-global-notification": "true" } as any,
    }
  );

  const responseData = (res as any)?.data || res;

  if (responseData?.code === 200 || responseData?.success) {
    const token = responseData.data;
    if (typeof token === "string" && token.length > 0) {
      return token;
    }
  }

  // Nếu trả về trực tiếp string token
  if (typeof responseData === "string" && responseData.length > 0) {
    return responseData;
  }

  if (responseData?.data && typeof responseData.data === "string") {
    return responseData.data;
  }

  throw new Error(
    responseData?.message || "Không thể hoàn tất đăng ký tài khoản Google!"
  );
};
