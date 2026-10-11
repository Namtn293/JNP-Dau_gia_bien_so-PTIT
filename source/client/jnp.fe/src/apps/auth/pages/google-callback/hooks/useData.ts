import { useMemo } from "react";
import { useLocation } from "@tanstack/react-router";
import { parseCallbackParams } from "../util";

export const useData = () => {
  const location = useLocation();

  const queryParams = useMemo(() => {
    // Ưu tiên đọc từ location.search, fallback đọc từ window.location.search
    const searchString = location.search || window.location.search;
    const parsed = parseCallbackParams(searchString);

    return {
      isNewUser: parsed.isNewUser === "true",
      token: parsed.token || "",
      tempToken: parsed.tempToken || "",
      email: parsed.email ? decodeURIComponent(parsed.email) : "",
      fullName: parsed.fullName ? decodeURIComponent(parsed.fullName) : "",
      error: parsed.error ? decodeURIComponent(parsed.error) : null,
      rawIsNewUser: parsed.isNewUser,
    };
  }, [location.search]);

  return {
    ...queryParams,
    isReady: true,
  };
};

export default useData;
