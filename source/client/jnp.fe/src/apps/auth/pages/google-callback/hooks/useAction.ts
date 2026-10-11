import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import useNotification from "@/shared/hooks/useNotification";
import { ADMIN_LOGIN_ROUTE } from "@/constants";
import { completeGoogleRegistrationApi } from "../services/api";
import { saveUserAuthSession } from "../feature";
import { formatDateToIso, broadcastOAuthMessage } from "../util";
import type { GoogleRegisterFormValues } from "../services/type";

export const useAction = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showSuccessNotify, showErrorNotify, showInfoNotify } = useNotification();

  /**
   * Xử lý đăng nhập thành công cho người dùng cũ (isNewUser=false)
   */
  const handleLoginSuccess = useCallback(
    (token: string, email: string, fullName: string) => {
      saveUserAuthSession(token, { email, fullName });

      const isFromPopup =
        (window.opener && !window.opener.closed) ||
        localStorage.getItem("google_oauth_in_progress") === "true";

      if (isFromPopup) {
        localStorage.removeItem("google_oauth_in_progress");
        broadcastOAuthMessage({
          type: "GOOGLE_AUTH_SUCCESS",
          token,
          email,
          fullName,
        });

        // Đóng cửa sổ popup xác thực
        window.close();
        setTimeout(() => window.close(), 300);
        return;
      }

      showSuccessNotify("Đăng nhập Google thành công!");

      // Điều hướng người dùng vào sàn đấu giá nếu không phải popup
      navigate({ to: "/danh-sach-dau-gia" });
    },
    [navigate, showSuccessNotify]
  );

  /**
   * Xử lý trường hợp Google trả về lỗi hoặc người dùng hủy xác thực
   */
  const handleAuthError = useCallback(
    (errorMessage: string) => {
      const isFromPopup =
        (window.opener && !window.opener.closed) ||
        localStorage.getItem("google_oauth_in_progress") === "true";

      if (isFromPopup) {
        localStorage.removeItem("google_oauth_in_progress");
        broadcastOAuthMessage({
          type: "GOOGLE_AUTH_ERROR",
          error: errorMessage,
        });

        window.close();
        setTimeout(() => window.close(), 300);
        return;
      }

      showErrorNotify(
        errorMessage || "Đăng nhập Google thất bại hoặc người dùng đã hủy thao tác!"
      );
      navigate({ to: ADMIN_LOGIN_ROUTE });
    },
    [navigate, showErrorNotify]
  );

  /**
   * Xử lý nộp form hoàn tất hồ sơ định danh cho người dùng mới (isNewUser=true)
   */
  const handleCompleteRegistration = useCallback(
    async (
      values: GoogleRegisterFormValues,
      tempToken: string,
      email: string
    ) => {
      if (!tempToken) {
        showErrorNotify("Mã xác thực tạm thời không hợp lệ, vui lòng đăng nhập lại!");
        navigate({ to: ADMIN_LOGIN_ROUTE });
        return;
      }

      setIsSubmitting(true);

      try {
        const formattedDob = formatDateToIso(values.dob);

        const accessToken = await completeGoogleRegistrationApi({
          tempToken,
          fullName: values.fullName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          dob: formattedDob || undefined,
          address: values.address ? values.address.trim() : undefined,
          userName: "", // Backend tự sinh theo chuẩn
          password: "", // Backend tự sinh theo chuẩn
        });

        // Lưu phiên đăng nhập chính thức
        saveUserAuthSession(accessToken, {
          email,
          fullName: values.fullName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          address: values.address ? values.address.trim() : undefined,
          dob: formattedDob,
        });

        const isFromPopup =
          (window.opener && !window.opener.closed) ||
          localStorage.getItem("google_oauth_in_progress") === "true";

        if (isFromPopup) {
          localStorage.removeItem("google_oauth_in_progress");
          broadcastOAuthMessage({
            type: "GOOGLE_AUTH_SUCCESS",
            token: accessToken,
            email,
            fullName: values.fullName.trim(),
          });
          window.close();
          setTimeout(() => window.close(), 300);
          return;
        }

        showSuccessNotify("Hoàn tất hồ sơ định danh thành công! Đang vào sàn đấu giá...");

        setTimeout(() => {
          setIsSubmitting(false);
          navigate({ to: "/danh-sach-dau-gia" });
        }, 300);
      } catch (error: any) {
        console.error("Lỗi hoàn tất hồ sơ định danh:", error);
        setIsSubmitting(false);
        showErrorNotify(
          error?.message || "Không thể hoàn tất hồ sơ, vui lòng kiểm tra lại thông tin!"
        );
      }
    },
    [navigate, showSuccessNotify, showErrorNotify]
  );

  /**
   * Người dùng hủy hoàn tất hồ sơ định danh
   */
  const handleCancel = useCallback(() => {
    showInfoNotify("Đã hủy thao tác đăng ký");
    navigate({ to: ADMIN_LOGIN_ROUTE });
  }, [navigate, showInfoNotify]);

  return {
    isSubmitting,
    handleLoginSuccess,
    handleAuthError,
    handleCompleteRegistration,
    handleCancel,
  };
};

export default useAction;
