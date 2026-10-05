import useServerErrorMsg from "@/shared/hooks/useServerErrorMsg";
import { handleRedirect } from "@/shared/utils";
import type { TLoginRequestAdmin } from "@apps/auth/services";
import { useLogin } from "@apps/auth/services";
import tokenManager from "@utils/tokenManager";
import { App } from "antd";
import { useCallback, useRef, useState } from "react";


/** Hiện captcha sau khi nhận lỗi Admin_Auth_1721 bao nhiêu lần */
const CAPTCHA_THRESHOLD = 3;
/** BE trả về khi sai tài khoản/mật khẩu */
const ERR_WRONG_CREDENTIALS = "Admin_Auth_1721";
/** BE trả về khi tài khoản bị khóa (sai >= 5 lần) */
const ERR_ACCOUNT_LOCKED = "Admin_Auth_Captcha_1727";

/**
 * Hook xử lý đăng nhập cho Admin/Cán bộ
 * - Gọi API đăng nhập
 * - Lưu token vào localStorage
 * - Xử lý redirect sau khi đăng nhập thành công
 */
export const useHandleLogin = () => {
  const { mutate: login, isLoading: isApiLoading } = useLogin();
  const { notification } = App.useApp();
  const { ERROR_CODE_MSG } = useServerErrorMsg();

  const [failCount, setFailCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const isLoading = isApiLoading || isSubmitting;

  /**
   * Ref lưu hàm sinh captcha token.
   * Được set bởi RecaptchaSection qua prop onExecutorChange.
   * Dùng ref để tránh re-render.
   */
  const recaptchaExecutorRef = useRef<(() => Promise<string>) | null>(null);
  /** Luôn luôn dùng captcha khi đăng nhập */
  const shouldShowCaptcha = true;
  const handleRecaptchaExecutorChange = useCallback(
    (executor: (() => Promise<string>) | null) => {
      recaptchaExecutorRef.current = executor;
    },
    []
  );

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
  const handleSaveToken = (token: string, refreshToken: string, roles: string[]) => {
    if (!token) {
      console.warn("Token không hợp lệ");
      return;
    }
    tokenManager.setRoles(roles);
    tokenManager.setAccessToken(token);
    tokenManager.setRefreshToken(refreshToken);
  };
  const handleSubmit = async (values: TLoginRequestAdmin) => {
    if (isSubmittingRef.current || isApiLoading) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // ── Bước 1: Lấy captcha token nếu đã đủ ngưỡng ──────────────────────
    let recaptchaToken: string | undefined;
    if (shouldShowCaptcha) {
      if (!recaptchaExecutorRef.current) {
        handleShowError("Xác thực bảo mật chưa sẵn sàng. Vui lòng đợi và thử lại.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }
      try {
        recaptchaToken = await recaptchaExecutorRef.current();
      } catch {
        handleShowError("Không thể xác thực reCAPTCHA. Vui lòng thử lại.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }
    }
    // ── Bước 2: Gọi API login ─────────────────────────────────────────────
    login(
      { payload: values, recaptchaToken },
      {
        onSuccess: async (response) => {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          if (!response.success || response.data == null) {
            const code = response.message;
            const msg = ERROR_CODE_MSG[code] ?? code ?? "Đăng nhập thất bại";
            handleShowError(msg);
            // Chỉ tăng failCount khi sai mật khẩu
            if (code === ERR_WRONG_CREDENTIALS) {
              setFailCount((prev) => prev + 1);
            }
            // Nếu Backend báo thiếu token (do F5/reset page) -> hiển thị captcha ngay lập tức
            if (code === "User_PhanAnhKienNghi_017") {
              setFailCount(CAPTCHA_THRESHOLD);
            }
            // Tài khoản bị khóa — không cần đếm thêm
            if (code === ERR_ACCOUNT_LOCKED) {
              setFailCount(0);
            }
            return;
          }
          // ── Đăng nhập thành công ─────────────────────────────────────
          setFailCount(0);
          handleSaveToken(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.roles,
          );
          handleRedirect("/admin");
        },
        onError: (error: any) => {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          // Lỗi network / 5xx — không tăng failCount
          console.error("LOGIN ERR::", error);

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
      }
    );
  };

  return {
    isLoading,
    handleSubmit,
    failCount,
    shouldShowCaptcha,
    handleRecaptchaExecutorChange,
  };
};
export default useHandleLogin;
