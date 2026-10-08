import axiosClient from "@/configs/axios";
import type {
  LoginCredentials,
  AuthUserData,
  GoogleAuthCheckResult,
} from "./type";

/**
 * Đăng nhập bằng tài khoản thông thường qua API server (/api/auth/login)
 */
export const loginApi = async (credentials: LoginCredentials): Promise<string> => {
  const res = await axiosClient.post<any>(
    "/api/auth/login",
    {
      userName: credentials.email,
      password: credentials.password,
    },
    {
      headers: { "skip-global-notification": "true" } as any,
    }
  );

  const responseData = (res as any)?.data || res;
  if (responseData?.code === 200 || responseData?.success) {
    return responseData.data;
  }
  throw new Error(responseData?.message || "Tài khoản hoặc mật khẩu không chính xác!");
};

/**
 * Xác thực tài khoản Google qua API server (/api/auth/google)
 * Gửi idToken nhận được từ Google Identity Services (hoặc idToken kiểm thử)
 * Server sẽ kiểm tra email có trong database chưa:
 * - Nếu chưa: isNewUser = true, trả về tempToken để hoàn tất đăng ký
 * - Nếu rồi: isNewUser = false, trả về JWT access token
 */
export const authenticateGoogleApi = async (
  idToken: string
): Promise<GoogleAuthCheckResult> => {
  const res = await axiosClient.post<any>(
    "/api/auth/google",
    {
      idToken,
    },
    {
      headers: { "skip-global-notification": "true" } as any,
    }
  );

  const responseData = (res as any)?.data?.data || (res as any)?.data || res;

  if (responseData && (responseData.email || responseData.tempToken || responseData.token)) {
    return {
      isNewUser: responseData.isNewUser ?? true,
      email: responseData.email,
      fullName: responseData.fullName,
      tempToken: responseData.tempToken,
      token: responseData.token,
    };
  }

  throw new Error((res as any)?.message || "Xác thực tài khoản Google từ server thất bại!");
};

/**
 * Hoàn tất thông tin đăng ký cho tài khoản Google qua API server (/api/auth/google/complete-registration)
 * Server lưu UserInfo và User vào Database, trả về JWT access token
 */
export const completeGoogleRegistrationApi = async (values: {
  tempToken?: string;
  email: string;
  fullName: string;
  dob: string;
  phoneNumber: string;
  address: string;
}): Promise<{ token: string; user: AuthUserData }> => {
  const res = await axiosClient.post<any>(
    "/api/auth/google/complete-registration",
    {
      tempToken: values.tempToken,
      userName: values.email.split("@")[0],
      password: "GoogleUser123@",
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      dob: values.dob,
      address: values.address,
    },
    {
      headers: { "skip-global-notification": "true" } as any,
    }
  );

  const responseData = (res as any)?.data || res;

  if (responseData?.code === 200 || responseData?.success || responseData?.data) {
    const token = responseData.data || responseData;
    return {
      token: typeof token === "string" ? token : token?.token,
      user: {
        email: values.email,
        name: values.fullName,
        provider: "google",
        role: "Nhà đầu tư",
        dob: values.dob,
        phoneNumber: values.phoneNumber,
        address: values.address,
      },
    };
  }

  throw new Error(responseData?.message || "Không thể hoàn tất đăng ký trên server!");
};
