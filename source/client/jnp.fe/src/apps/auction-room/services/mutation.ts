import { useMutation, useQueryClient } from "react-query";
import {
  placeBidRestApi,
  sendChatRestApi,
  registerAuctionApi,
  cancelRegistrationApi,
  watchAuctionSessionApi,
  unwatchAuctionSessionApi,
} from "./api";
import type { PlaceBidPayload, SendChatPayload } from "./type";
import {
  AUCTION_REGISTRATION_QUERY_KEY,
  WALLET_BALANCE_QUERY_KEY,
  AUCTION_WATCH_STATUS_QUERY_KEY,
} from "./query";

export const usePlaceBidMutation = () => {
  return useMutation((payload: PlaceBidPayload) =>
    placeBidRestApi(payload.roomId || payload.plateNumber, payload.bidAmount)
  );
};

export const useSendChatMutation = () => {
  return useMutation((payload: SendChatPayload) => sendChatRestApi(payload));
};

export const useRegisterAuctionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (sessionCode: string) => registerAuctionApi(sessionCode),
    {
      onSuccess: (_data, sessionCode) => {
        queryClient.invalidateQueries([AUCTION_REGISTRATION_QUERY_KEY, sessionCode]);
        queryClient.invalidateQueries([WALLET_BALANCE_QUERY_KEY]);
      },
    }
  );
};

export const useCancelRegistrationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (sessionCode: string) => cancelRegistrationApi(sessionCode),
    {
      onSuccess: (_data, sessionCode) => {
        queryClient.invalidateQueries([AUCTION_REGISTRATION_QUERY_KEY, sessionCode]);
        queryClient.invalidateQueries([WALLET_BALANCE_QUERY_KEY]);
      },
    }
  );
};

export const useWatchAuctionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (sessionCode: string) => watchAuctionSessionApi(sessionCode),
    {
      onSuccess: (_data, sessionCode) => {
        queryClient.invalidateQueries([AUCTION_WATCH_STATUS_QUERY_KEY, sessionCode]);
      },
    }
  );
};

export const useUnwatchAuctionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (sessionCode: string) => unwatchAuctionSessionApi(sessionCode),
    {
      onSuccess: (_data, sessionCode) => {
        queryClient.invalidateQueries([AUCTION_WATCH_STATUS_QUERY_KEY, sessionCode]);
      },
    }
  );
};
