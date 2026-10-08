import { useMutation } from "@tanstack/react-query";
import { completeGoogleRegistrationApi } from "./api";
import type { CompleteGoogleRegistrationPayload } from "./type";

export const useCompleteGoogleRegistrationMutation = () => {
  return useMutation({
    mutationFn: (payload: CompleteGoogleRegistrationPayload) =>
      completeGoogleRegistrationApi(payload),
  });
};
