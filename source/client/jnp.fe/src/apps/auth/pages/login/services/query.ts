import { useQuery } from "react-query";

export const useCurrentAuthUserQuery = () => {
  return useQuery(["current-auth-user"], () => {
    const raw = localStorage.getItem("auction_user");
    return raw ? JSON.parse(raw) : null;
  });
};
