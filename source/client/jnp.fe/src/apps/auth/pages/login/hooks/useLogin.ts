import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import tokenManager from "@/shared/utils/tokenManager";
import useNotification from "@/shared/hooks/useNotification";
import {
  loginApi,
  authenticateGoogleApi,
  completeGoogleRegistrationApi,
} from "../services/api";
import type {
  LoginCredentials,
  GoogleProfile,
  GoogleRegistrationFormValues,
} from "../services/type";

declare global {
  interface Window {
    google?: any;
  }
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleRegistering, setIsGoogleRegistering] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null);
  const navigate = useNavigate();

  const {
    showSuccessNotify,
    showErrorNotify,
    showInfoNotify,
  } = useNotification();

  /**
   * Xử lý kết quả trả về từ Google Identity Services (ID Token từ Google)
   */
  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      const idToken = response?.credential;
      if (!idToken) {
        showErrorNotify("Không nhận được mã xác thực từ Google!");
        return;
      }

      setIsLoading(true);

      try {
        const result = await authenticateGoogleApi(idToken);

        if (result.isNewUser) {
          showInfoNotify("Tài khoản Google chưa có trong hệ thống. Vui lòng hoàn tất thông tin đăng ký!");

          setGoogleProfile({
            email: result.email,
            fullName: result.fullName,
            tempToken: result.tempToken,
          });
          setIsGoogleRegistering(true);
          setIsLoading(false);
        } else {
          showSuccessNotify("Đăng nhập Google thành công!");
          const accessToken = result.token || "";
          tokenManager.setAccessToken(accessToken);
          tokenManager.setRefreshToken("refresh-token-" + Date.now());
          tokenManager.setRoles(["USER"]);
          localStorage.setItem(
            "auction_user",
            JSON.stringify({
              email: result.email,
              name: result.fullName,
              provider: "google",
              role: "Nhà đầu tư",
            })
          );
          setIsLoading(false);
          navigate({ to: "/danh-sach-dau-gia" });
        }
      } catch (error: any) {
        console.error("Lỗi xác thực Google:", error);
        showErrorNotify(error?.message || "Xác thực Google thất bại, vui lòng thử lại!");
        setIsLoading(false);
      }
    },
    [navigate, showSuccessNotify, showErrorNotify, showInfoNotify]
  );

  /**
   * Khởi tạo Google Identity Services khi trang tải
   */
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const setupGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Tự động render nút Google chuẩn nếu container tồn tại
        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: 380,
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          setupGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [handleGoogleCredentialResponse]);

  /**
   * Lắng nghe kết quả xác thực từ Popup qua BroadcastChannel, localStorage storage event và postMessage
   */
  useEffect(() => {
    const processOAuthResult = (data: any) => {
      if (!data || !data.type) return;

      if (data.type === "GOOGLE_AUTH_SUCCESS") {
        const { token, email, fullName } = data;
        tokenManager.setAccessToken(token);
        tokenManager.setRefreshToken("refresh-token-" + Date.now());
        tokenManager.setRoles(["USER"]);
        localStorage.setItem(
          "auction_user",
          JSON.stringify({
            email,
            name: fullName,
            provider: "google",
            role: "Nhà đầu tư",
          })
        );
        localStorage.removeItem("google_oauth_result");
        localStorage.removeItem("google_oauth_in_progress");
        showSuccessNotify("Đăng nhập Google thành công!");
        navigate({ to: "/danh-sach-dau-gia" });
      } else if (data.type === "GOOGLE_AUTH_NEW_USER") {
        const { tempToken, email, fullName } = data;
        localStorage.removeItem("google_oauth_result");
        localStorage.removeItem("google_oauth_in_progress");
        navigate({
          to: "/auth/google/callback",
          search: {
            isNewUser: "true",
            tempToken,
            email,
            fullName,
          },
        });
      } else if (data.type === "GOOGLE_AUTH_ERROR") {
        localStorage.removeItem("google_oauth_result");
        localStorage.removeItem("google_oauth_in_progress");
        showErrorNotify(data.error || "Đăng nhập Google thất bại!");
      }
    };

    // 1. Lắng nghe qua postMessage
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      processOAuthResult(event.data);
    };

    // 2. Lắng nghe qua localStorage storage event (hoạt động 100% khi window.opener bị mất)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === "google_oauth_result" && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          processOAuthResult(parsed);
        } catch (e) {
          console.error("Lỗi parse storage event oauth:", e);
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    window.addEventListener("storage", handleStorageEvent);

    // 3. Lắng nghe qua BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        broadcastChannel = new BroadcastChannel("google_oauth_channel");
        broadcastChannel.onmessage = (event) => {
          processOAuthResult(event.data);
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel initialization error:", e);
    }

    return () => {
      window.removeEventListener("message", handleAuthMessage);
      window.removeEventListener("storage", handleStorageEvent);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [navigate, showSuccessNotify, showErrorNotify]);

  /**
   * Kích hoạt đăng nhập Google theo chuẩn OAuth Popup (500x650):
   * Mở cửa sổ popup riêng biệt, khi xác thực xong popup sẽ tự đóng và tab chính tự đăng nhập.
   */
  const handleOpenGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const frontendCallback = `${window.location.origin}/auth/google/callback`;
    const state = btoa(JSON.stringify({ redirectTo: "/danh-sach-dau-gia", frontendCallback }));
    const redirectUrl = `${apiUrl}/api/auth/google/redirect?state=${encodeURIComponent(state)}`;

    // Đánh dấu phiên xác thực popup đang diễn ra
    localStorage.setItem("google_oauth_in_progress", "true");
    localStorage.removeItem("google_oauth_result");

    const width = 500;
    const height = 650;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

    const popup = window.open(
      redirectUrl,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    } else {
      // Fallback nếu trình duyệt chặn popup
      window.location.href = redirectUrl;
    }
  };

  /**
   * Đăng nhập thông thường qua API server /api/auth/login
   */
  const handleEmailLogin = async (values: LoginCredentials) => {
    setIsLoading(true);

    try {
      const token = await loginApi(values);
      tokenManager.setAccessToken(token);
      tokenManager.setRefreshToken("refresh-token-" + Date.now());
      tokenManager.setRoles(["USER"]);
      localStorage.setItem(
        "auction_user",
        JSON.stringify({
          email: values.email,
          name: values.email.split("@")[0] || "User",
          provider: "email",
          role: "Nhà đầu tư",
        })
      );

      showSuccessNotify("Đăng nhập thành công!");
      setIsLoading(false);
      navigate({ to: "/danh-sach-dau-gia" });
    } catch (error: any) {
      setIsLoading(false);
      showErrorNotify(error?.message || "Tài khoản hoặc mật khẩu không chính xác!");
    }
  };

  /**
   * Hoàn tất đăng ký tài khoản Google qua API server /api/auth/google/complete-registration
   */
  const handleCompleteGoogleRegistration = async (values: GoogleRegistrationFormValues) => {
    if (!googleProfile) {
      showErrorNotify("Không tìm thấy thông tin xác thực Google!");
      return;
    }

    setIsLoading(true);

    try {
      const formattedDob = values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : "";

      const response = await completeGoogleRegistrationApi({
        tempToken: googleProfile.tempToken,
        email: googleProfile.email,
        fullName: values.fullName,
        dob: formattedDob,
        phoneNumber: values.phoneNumber,
        address: values.address,
      });

      showSuccessNotify("Đăng ký thông tin thành công! Đang chuyển hướng...");

      tokenManager.setAccessToken(response.token);
      tokenManager.setRefreshToken("refresh-token-" + Date.now());
      tokenManager.setRoles(["USER"]);
      localStorage.setItem("auction_user", JSON.stringify(response.user));

      setTimeout(() => {
        setIsLoading(false);
        setIsGoogleRegistering(false);
        setGoogleProfile(null);
        navigate({ to: "/danh-sach-dau-gia" });
      }, 500);
    } catch (error: any) {
      console.error("Lỗi hoàn tất đăng ký Google:", error);
      showErrorNotify(error?.message || "Đăng ký không thành công, vui lòng thử lại!");
      setIsLoading(false);
    }
  };

  const handleCancelGoogleRegistration = () => {
    setIsGoogleRegistering(false);
    setGoogleProfile(null);
    showInfoNotify("Đã hủy thao tác đăng ký");
  };

  return {
    isLoading,
    isGoogleRegistering,
    googleProfile,
    handleEmailLogin,
    handleOpenGoogleLogin,
    handleCompleteGoogleRegistration,
    handleCancelGoogleRegistration,
  };
};

export default useLogin;
