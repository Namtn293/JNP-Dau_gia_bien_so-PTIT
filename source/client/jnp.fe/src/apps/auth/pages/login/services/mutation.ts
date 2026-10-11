import { useMutation } from "@tanstack/react-query";
import { loginApi, authenticateGoogleApi } from "./api";
import type { LoginCredentials } from "./type";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
  });
};

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationFn: (idToken: string) => authenticateGoogleApi(idToken),
  });
};
