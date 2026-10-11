/**
 * Tầng query cho trang Google Callback (dùng nếu cần prefetch hoặc check auth session)
 */
export const googleAuthKeys = {
  all: ["google-auth"] as const,
  profile: (email: string) => [...googleAuthKeys.all, "profile", email] as const,
};
