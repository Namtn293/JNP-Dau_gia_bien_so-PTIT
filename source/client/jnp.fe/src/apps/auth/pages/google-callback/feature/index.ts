import tokenManager from "@/shared/utils/tokenManager";
import type { UserSessionProfile } from "../services/type";

/**
 * Lưu trữ phiên đăng nhập khi xác thực thành công
 */
export const saveUserAuthSession = (
  token: string,
  userProfile: {
    email: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
    dob?: string;
  }
) => {
  tokenManager.setAccessToken(token);
  tokenManager.setRefreshToken("refresh-token-" + Date.now());
  tokenManager.setRoles(["USER"]);

  const sessionData: UserSessionProfile = {
    email: userProfile.email,
    name: userProfile.fullName,
    phoneNumber: userProfile.phoneNumber,
    address: userProfile.address,
    dob: userProfile.dob,
    provider: "google",
    role: "Nhà đầu tư",
  };

  localStorage.setItem("auction_user", JSON.stringify(sessionData));
};
