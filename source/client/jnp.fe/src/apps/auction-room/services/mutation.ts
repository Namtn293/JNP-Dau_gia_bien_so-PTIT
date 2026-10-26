import { useMutation } from "react-query";
import { placeBidRestApi, sendChatRestApi } from "./api";
import type { PlaceBidPayload, SendChatPayload } from "./type";

export const usePlaceBidMutation = () => {
  return useMutation((payload: PlaceBidPayload) => placeBidRestApi(payload));
};

export const useSendChatMutation = () => {
  return useMutation((payload: SendChatPayload) => sendChatRestApi(payload));
};
