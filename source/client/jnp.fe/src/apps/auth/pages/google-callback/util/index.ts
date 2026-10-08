import dayjs from "dayjs";
import type { GoogleCallbackQuery } from "../services/type";

/**
 * Định dạng ngày sang chuẩn ISO YYYY-MM-DD gửi lên backend
 */
export const formatDateToIso = (date: any): string => {
  if (!date) return "";
  if (dayjs.isDayjs(date)) {
    return date.format("YYYY-MM-DD");
  }
  return dayjs(date).format("YYYY-MM-DD");
};

/**
 * Kiểm tra định dạng số điện thoại Việt Nam (10 chữ số)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.trim();
  const regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return regex.test(cleanPhone);
};

/**
 * Trích xuất tham số từ search string của URL
 */
export const parseCallbackParams = (search: string): GoogleCallbackQuery => {
  const params = new URLSearchParams(search);
  return {
    isNewUser: params.get("isNewUser") || undefined,
    token: params.get("token") || undefined,
    tempToken: params.get("tempToken") || undefined,
    email: params.get("email") || undefined,
    fullName: params.get("fullName") || undefined,
    error: params.get("error") || undefined,
  };
};

export const BROADCAST_CHANNEL_NAME = "google_oauth_channel";
export const OAUTH_STORAGE_KEY = "google_oauth_result";
export const OAUTH_IN_PROGRESS_KEY = "google_oauth_in_progress";

export interface GoogleAuthEventMessage {
  type: "GOOGLE_AUTH_SUCCESS" | "GOOGLE_AUTH_NEW_USER" | "GOOGLE_AUTH_ERROR";
  token?: string;
  tempToken?: string;
  email?: string;
  fullName?: string;
  error?: string;
  timestamp?: number;
}

/**
 * Phát tín hiệu xác thực về Tab chính qua cả BroadcastChannel, localStorage và window.opener
 */
export const broadcastOAuthMessage = (message: GoogleAuthEventMessage) => {
  const payload = { ...message, timestamp: Date.now() };

  // 1. BroadcastChannel (tất cả context cùng origin)
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (e) {
    console.warn("BroadcastChannel error:", e);
  }

  // 2. localStorage StorageEvent (kích hoạt event storage ở các tab khác)
  try {
    localStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage error:", e);
  }

  // 3. window.opener postMessage (nếu không bị cắt do cross-origin)
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin);
    }
  } catch (e) {
    console.warn("window.opener postMessage error:", e);
  }
};
