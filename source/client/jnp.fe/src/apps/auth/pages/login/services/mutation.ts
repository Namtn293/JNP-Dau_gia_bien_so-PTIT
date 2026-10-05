import { useMutation } from "react-query";
import { fakeLoginApi, fakeGoogleLoginApi } from "./api";
import type { LoginCredentials } from "./type";

export const useLoginMutation = () => {
  return useMutation((credentials: LoginCredentials) => fakeLoginApi(credentials));
};

export const useGoogleLoginMutation = () => {
  return useMutation(() => fakeGoogleLoginApi());
};
