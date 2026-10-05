import { App } from "antd";

import useServerErrorMsg from "@/shared/hooks/useServerErrorMsg";
import type { TLoginRequestAdmin } from "@apps/auth/services";
import { useLoginCanBo } from "@apps/auth/services";

import { handleRedirect } from "@/shared/utils";
import tokenManager from "@utils/tokenManager";

/**
 * Hook xử lý đăng nhập cho Admin/Cán bộ
 * - Gọi API đăng nhập
 * - Lưu token vào localStorage
 * - Xử lý redirect sau khi đăng nhập thành công
 */
export const useHandleLoginCanBo = () => {
  const { mutate: login, isLoading } = useLoginCanBo();
  const { notification } = App.useApp();
  const { ERROR_CODE_MSG } = useServerErrorMsg();

  /**
   * Hiển thị thông báo lỗi
   */
  const handleShowError = (message: string) => {
    notification.error({
      message: "Thất bại!",
      description: message,
    });
  };
  /** lưu token và refresh token vào local storage */
  const handleSaveToken = (
    token: string,
    refreshToken: string,
    roles: string[],
  ) => {
    if (!token) {
      console.warn("Token không hợp lệ");
      return;
    }
    tokenManager.setRoles(roles);
    tokenManager.setAccessToken(token);
    tokenManager.setRefreshToken(refreshToken);
  };

  const handleSubmit = (values: TLoginRequestAdmin) => {
    login(values, {
      onSuccess: async (response) => {
        if (!response.success || response.data == null) {
          const msg =
            ERROR_CODE_MSG[response.message] ??
            response.message ??
            "Đăng nhập thất bại";
          handleShowError(msg);
          return;
        }

        // Lưu token trước
        handleSaveToken(
          response?.data?.accessToken,
          response?.data?.refreshToken,
          response?.data?.roles,
        );

        // dùng tài khoản này redirect sang quan li bai viet
        // const { account, password } = values;
        // if (account === 'test123' && password === '123456') {
        //   navigate({ to: BAI_VIET_CUA_TOI_ROUTE });
        handleRedirect("/admin");
        // }
      },

      onError: (error: any) => {
        console.log("LOGIN ERR::", error);

        let errorMsg = "Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng hoặc máy chủ.";
        const responseData = error?.response?.data;
        if (responseData) {
          const code = responseData.message || responseData.code;
          if (code) {
            errorMsg = ERROR_CODE_MSG[code] ?? code;
          } else if (responseData.error) {
            errorMsg = responseData.error;
          }
        } else if (error?.message) {
          if (error.message === "Network Error") {
            errorMsg = "Lỗi kết nối mạng hoặc lỗi CORS. Không thể kết nối tới máy chủ.";
          } else {
            errorMsg = error.message;
          }
        }
        handleShowError(errorMsg);
      },
    });
  };

  return {
    isLoading,
    handleSubmit,
  };
};
export default useHandleLoginCanBo;
