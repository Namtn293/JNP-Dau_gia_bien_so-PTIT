import { LOCAL_STORAGE_KEYS } from "@constants/storageKeys";
import { decryptDES, encryptDES } from "@utils/desEncryt";
import { lcStorage } from "@utils/storage";
import { isJwtExpired } from "./jwt";

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
      const value =
        import.meta.env.NODE_ENV === "development"
          ? storedValue
          : decryptDES(storedValue);

      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

  const setRoles = (roles: string[]): void => {
    const value = JSON.stringify(roles);

    const storedValue =
      import.meta.env.NODE_ENV === "development" ? value : encryptDES(value);

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
      if (import.meta.env.NODE_ENV === "development") {
        tokenToReturn = accessToken;
      } else {
        tokenToReturn = decryptDES(accessToken);
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
    if (import.meta.env.NODE_ENV === "development") {
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
    if (import.meta.env.NODE_ENV === "development") {
      return refreshToken;
    } else {
      return decryptDES(refreshToken);
    }
  };

  const setRefreshToken = (token: string): void => {
    if (import.meta.env.NODE_ENV === "development") {
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
