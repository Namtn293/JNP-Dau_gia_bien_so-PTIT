import { ADMIN_LOGIN_ROUTE } from "@constants";
import tokenManager from "@utils/tokenManager";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export const useHandleLogOut = () => {
  const navigate = useNavigate();

  const handleLogOut = useCallback(() => {
    tokenManager.removeAllToken();
    navigate({ to: ADMIN_LOGIN_ROUTE });
  }, [navigate]);

  return { handleLogOut };
};

export default useHandleLogOut;
