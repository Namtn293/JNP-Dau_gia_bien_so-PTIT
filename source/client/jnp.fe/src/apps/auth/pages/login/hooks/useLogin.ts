import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "@tanstack/react-router";
import tokenManager from "@/shared/utils/tokenManager";
import type { LoginCredentials, AuthUserData } from "../services/type";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fakeLogin = (user: AuthUserData) => {
    setIsLoading(true);
    message.loading({ content: "Đang xử lý đăng nhập...", key: "login-action" });

    const mockAccessToken = "mock-auction-access-token-" + Date.now();
    const mockRefreshToken = "mock-auction-refresh-token-" + Date.now();

    tokenManager.setAccessToken(mockAccessToken);
    tokenManager.setRefreshToken(mockRefreshToken);
    tokenManager.setRoles(["USER", "ADMIN"]);
    localStorage.setItem("auction_user", JSON.stringify(user));

    setTimeout(() => {
      message.success({ content: "Đăng nhập thành công!", key: "login-action" });
      setIsLoading(false);
      navigate({ to: "/danh-sach-dau-gia" });
    }, 400);
  };

  const handleEmailLogin = (values: LoginCredentials) => {
    const emailVal = values.email || "user@example.com";
    fakeLogin({
      email: emailVal,
      name: emailVal.split("@")[0] || "Trần Đức An",
      provider: "email",
      role: "Nhà đầu tư",
      deposit: 40000000,
    });
  };

  const handleGoogleLogin = () => {
    fakeLogin({
      email: "user.google@gmail.com",
      name: "Trần Đức An (Google)",
      provider: "google",
      role: "Nhà đầu tư",
      deposit: 40000000,
    });
  };

  return {
    isLoading,
    handleEmailLogin,
    handleGoogleLogin,
  };
};

export default useLogin;
