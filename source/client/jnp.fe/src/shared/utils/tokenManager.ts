import { LOCAL_STORAGE_KEYS } from "@constants/storageKeys";
import { decryptDES, encryptDES } from "@utils/desEncryt";
import { lcStorage } from "@utils/storage";
import { isJwtExpired } from "./jwt";

const isDevMode = (): boolean =>
  Boolean(
    import.meta.env.DEV ||
    import.meta.env.MODE === "development" ||
    import.meta.env.NODE_ENV === "development"
  );

const isJwtFormat = (val?: string): boolean =>
  Boolean(val && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(val.trim()));

const tokenManager = () => {
  let accessToken: string | undefined = lcStorage.get(
    LOCAL_STORAGE_KEYS.accessToken
  );
  let refreshToken: string | undefined = lcStorage.get(
    LOCAL_STORAGE_KEYS.refreshToken
  );

  const getRoles = (): string[] | undefined => {
    const storedValue = lcStorage.get(LOCAL_STORAGE_KEYS.roles);
    if (!storedValue) return undefined;

    try {
      // Hỗ trợ cả JSON plain (dev mới) lẫn DES-encrypted (phiên đăng nhập cũ)
      if (typeof storedValue === "string" && storedValue.trim().startsWith("[")) {
        return JSON.parse(storedValue);
      }
      const decrypted = decryptDES(storedValue);
      const parsed = JSON.parse(decrypted);
      if (isDevMode()) {
        lcStorage.set(LOCAL_STORAGE_KEYS.roles, decrypted);
      }
      return parsed;
    } catch {
      try {
        return JSON.parse(storedValue);
      } catch {
        return undefined;
      }
    }
  };

  const setRoles = (roles: string[]): void => {
    const value = JSON.stringify(roles);

    const storedValue = isDevMode() ? value : encryptDES(value);

    lcStorage.set(LOCAL_STORAGE_KEYS.roles, storedValue);
  };

  const notifyAuthChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
  };

  const removeAllToken = (): void => {
    accessToken = undefined;
    refreshToken = undefined;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.accessToken);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.roles);
    localStorage.removeItem("auction_user");
    notifyAuthChanged();
  };

  const getAccessToken = (): string | undefined => {
    // Luôn đồng bộ lại từ localStorage nếu bộ nhớ trong bị rỗng do reload/event
    if (!accessToken) {
      accessToken = lcStorage.get(LOCAL_STORAGE_KEYS.accessToken);
    }
    if (!accessToken) return undefined;

    let tokenToReturn: string | undefined;
    try {
      if (isJwtFormat(accessToken)) {
        tokenToReturn = accessToken;
      } else {
        const decrypted = decryptDES(accessToken);
        if (isJwtFormat(decrypted)) {
          tokenToReturn = decrypted;
          // Tự động chuyển đổi token cũ đã mã hóa DES sang plain khi chạy dev mode
          if (isDevMode()) {
            accessToken = decrypted;
            lcStorage.set(LOCAL_STORAGE_KEYS.accessToken, decrypted);
          }
        } else if (isDevMode()) {
          tokenToReturn = accessToken;
        }
      }
    } catch {
      return undefined;
    }

    if (tokenToReturn && isJwtExpired(tokenToReturn)) {
      console.warn("Access token đã hết hạn, xóa phiên đăng nhập");
      accessToken = undefined;
      localStorage.removeItem(LOCAL_STORAGE_KEYS.accessToken);
      notifyAuthChanged();
      return undefined;
    }

    return tokenToReturn;
  };

  const setAccessToken = (token: string): void => {
    if (isDevMode()) {
      accessToken = token;
    } else {
      accessToken = encryptDES(token);
    }
    lcStorage.set(LOCAL_STORAGE_KEYS.accessToken, accessToken);
    notifyAuthChanged();
  };

  const removeAccessToken = (): void => {
    accessToken = undefined;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.accessToken);
    notifyAuthChanged();
  };

  const getRefreshToken = () => {
    if (!refreshToken) {
      refreshToken = lcStorage.get(LOCAL_STORAGE_KEYS.refreshToken);
    }
    if (!refreshToken) return undefined;
    if (isJwtFormat(refreshToken) || refreshToken.startsWith("refresh-token-")) {
      return refreshToken;
    }
    try {
      const decrypted = decryptDES(refreshToken);
      if (decrypted) {
        if (isDevMode()) {
          refreshToken = decrypted;
          lcStorage.set(LOCAL_STORAGE_KEYS.refreshToken, decrypted);
        }
        return decrypted;
      }
    } catch {
      // Fallback trả nguyên bản nếu không phải chuỗi mã hóa DES
    }
    return refreshToken;
  };

  const setRefreshToken = (token: string): void => {
    if (isDevMode()) {
      refreshToken = token;
    } else {
      refreshToken = encryptDES(token);
    }
    lcStorage.set(LOCAL_STORAGE_KEYS.refreshToken, refreshToken);
  };

  const removeRefreshToken = (): void => {
    refreshToken = undefined;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.refreshToken);
  };
  return {
    getRoles,
    setRoles,
    getAccessToken,
    setAccessToken,
    removeAccessToken,
    getRefreshToken,
    setRefreshToken,
    removeRefreshToken,
    removeAllToken,
  };
};

export default tokenManager();
