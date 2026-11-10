export interface DecodedJwt {
  sub?: string;
  userId?: number | string;
  roles?: string[];
  exp?: number;
  iat?: number;
  fullName?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Giải mã an toàn chuỗi JWT Base64URL hỗ trợ ký tự UTF-8
 */
export function parseJwt(token?: string | null): DecodedJwt | null {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    // Thay thế ký tự Base64URL sang chuẩn Base64
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Bổ sung padding '=' nếu thiếu
    const remainder = base64.length % 4;
    if (remainder > 0) {
      base64 = base64.padEnd(base64.length + (4 - remainder), "=");
    }

    // Giải mã Base64 sang binary string
    const binaryStr = window.atob(base64);

    // Giải mã UTF-8
    try {
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const decoded = new TextDecoder("utf-8").decode(bytes);
      return JSON.parse(decoded);
    } catch {
      // Fallback
      return JSON.parse(binaryStr);
    }
  } catch (err) {
    return null;
  }
}

/**
 * Kiểm tra xem token đã hết hạn hay chưa
 */
export function isJwtExpired(token?: string | null): boolean {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  // payload.exp được tính bằng giây
  return payload.exp * 1000 <= Date.now();
}

/**
 * Trích xuất thông tin người dùng từ JWT
 */
export function getUserFromToken(token?: string | null) {
  const payload = parseJwt(token);
  if (!payload) return null;

  const id = payload.userId ? String(payload.userId) : payload.sub;
  const displayName =
    payload.fullName ||
    payload.name ||
    payload.sub ||
    (payload.email ? payload.email.split("@")[0] : undefined) ||
    "";

  return {
    id,
    username: payload.sub,
    fullName: payload.fullName || payload.name,
    email: payload.email,
    roles: payload.roles || [],
    displayName,
  };
}

