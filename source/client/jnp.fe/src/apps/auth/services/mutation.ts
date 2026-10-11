import { useMutation } from "react-query";
import { login, LoginCanBo, loginNhaDauTu } from "../services/api";
import type { TLoginRequestAdmin } from "./types";

/**
 * Hook sử dụng React Query mutation cho API đăng nhập
 * @returns Mutation object với các method: mutate, mutateAsync, isLoading, etc.
 */
export type TLoginWithCaptcha = {
  payload: TLoginRequestAdmin;
  recaptchaToken?: string;
};

export const useLogin = () => {
  return useMutation(({ payload, recaptchaToken }: TLoginWithCaptcha) =>
    login(payload, recaptchaToken)
  );
};

export const useLoginNhaDauTu = () => {
  return useMutation(loginNhaDauTu);
};

export const useLoginCanBo = () => {
  return useMutation(LoginCanBo);
};
