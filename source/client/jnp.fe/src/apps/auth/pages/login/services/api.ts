import type { LoginCredentials, AuthUserData } from "./type";

export const fakeLoginApi = async (credentials: LoginCredentials): Promise<AuthUserData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        email: credentials.email,
        name: credentials.email.split("@")[0] || "User",
        provider: "email",
        role: "Nhà đầu tư",
        deposit: 40000000,
      });
    }, 400);
  });
};

export const fakeGoogleLoginApi = async (): Promise<AuthUserData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        email: "user.google@gmail.com",
        name: "Google User",
        provider: "google",
        role: "Nhà đầu tư",
        deposit: 40000000,
      });
    }, 400);
  });
};
