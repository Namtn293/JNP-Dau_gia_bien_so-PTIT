import React, { useEffect, useRef } from "react";
import { useData } from "./hooks/useData";
import { useAction } from "./hooks/useAction";
import { GoogleRegisterForm } from "./components/GoogleRegisterForm";
import { LoadingCallback } from "./components/LoadingCallback";
import { broadcastOAuthMessage } from "./util";

export const GoogleCallbackPage: React.FC = () => {
  const {
    isNewUser,
    token,
    tempToken,
    email,
    fullName,
    error,
    rawIsNewUser,
  } = useData();

  const {
    isSubmitting,
    handleLoginSuccess,
    handleAuthError,
    handleCompleteRegistration,
    handleCancel,
  } = useAction();

  // Dùng ref để tránh trigger nhiều lần trong StrictMode
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    // Trường hợp 1: Có thông báo lỗi từ Google OAuth Callback
    if (error) {
      handledRef.current = true;
      handleAuthError(error);
      return;
    }

    // Trường hợp 2: Người dùng cũ (isNewUser=false) đã có token chính thức
    if (rawIsNewUser === "false" && token) {
      handledRef.current = true;
      handleLoginSuccess(token, email, fullName);
      return;
    }

    // Trường hợp 3: Người dùng mới (isNewUser=true) và đang mở trong popup -> chuyển về tab chính hoàn tất
    const isFromPopup =
      (window.opener && !window.opener.closed) ||
      localStorage.getItem("google_oauth_in_progress") === "true";

    if (rawIsNewUser === "true" && tempToken && isFromPopup) {
      handledRef.current = true;
      localStorage.removeItem("google_oauth_in_progress");
      broadcastOAuthMessage({
        type: "GOOGLE_AUTH_NEW_USER",
        tempToken,
        email,
        fullName,
      });
      window.close();
      setTimeout(() => window.close(), 300);
      return;
    }

    // Trường hợp 4: Người dùng cũ nhưng backend trả token trực tiếp mà không có flag
    if (token && !tempToken && rawIsNewUser !== "true") {
      handledRef.current = true;
      handleLoginSuccess(token, email, fullName);
      return;
    }

    // Trường hợp 5: Không có bất kỳ param nào hợp lệ -> chuyển về login
    if (!token && !tempToken && !error && !rawIsNewUser) {
      const timer = setTimeout(() => {
        if (!handledRef.current) {
          handledRef.current = true;
          handleAuthError("Không tìm thấy thông tin phiên đăng nhập Google!");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    error,
    token,
    tempToken,
    rawIsNewUser,
    email,
    fullName,
    handleAuthError,
    handleLoginSuccess,
  ]);

  // Nếu là người dùng mới (isNewUser=true) và có tempToken -> Hiển thị Form hoàn tất hồ sơ
  if (isNewUser && tempToken) {
    return (
      <GoogleRegisterForm
        email={email}
        fullName={fullName}
        isLoading={isSubmitting}
        onSubmit={(values) => handleCompleteRegistration(values, tempToken, email)}
        onCancel={handleCancel}
      />
    );
  }

  // Trường hợp đang chuyển hướng hoặc chờ xử lý token
  return (
    <LoadingCallback
      message={
        rawIsNewUser === "false"
          ? "Đăng nhập thành công! Đang chuyển hướng..."
          : "Đang xác thực thông tin tài khoản Google..."
      }
      subMessage="Hệ thống đang chuẩn bị phiên làm việc cho bạn trên Sàn Đấu giá."
    />
  );
};

export default GoogleCallbackPage;
