import { useMutation, useQueryClient } from "react-query";
import { QK } from "@/shared/constants/queryKeys";
import {
  placeBidRestApi,
  sendChatRestApi,
  registerAuctionApi,
  cancelRegistrationApi,
  watchAuctionSessionApi,
  unwatchAuctionSessionApi,
  configureAutoBidApi,
  disableAutoBidApi,
} from "./api";
import type { PlaceBidPayload, SendChatPayload } from "./type";
import { AUCTION_WATCH_STATUS_QUERY_KEY } from "./query";

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
        queryClient.invalidateQueries(QK.registration(sessionCode));
        queryClient.invalidateQueries(QK.roomDetail(sessionCode));
        queryClient.invalidateQueries(QK.wallet);
        queryClient.invalidateQueries(["AUCTION_SESSIONS"]);
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
        queryClient.invalidateQueries(QK.registration(sessionCode));
        queryClient.invalidateQueries(QK.roomDetail(sessionCode));
        queryClient.invalidateQueries(QK.wallet);
        queryClient.invalidateQueries(["AUCTION_SESSIONS"]);
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
        queryClient.invalidateQueries(["WATCHED_SESSIONS"]);
        queryClient.invalidateQueries(["AUCTION_SESSIONS"]);
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
        queryClient.invalidateQueries(["WATCHED_SESSIONS"]);
        queryClient.invalidateQueries(["AUCTION_SESSIONS"]);
      },
    }
  );
};

export const useConfigureAutoBidMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ sessionCode, maxAmount }: { sessionCode: string; maxAmount: number }) =>
      configureAutoBidApi(sessionCode, maxAmount),
    {
      onSuccess: (_data, { sessionCode }) => {
        queryClient.invalidateQueries(QK.autoBid(sessionCode));
      },
    }
  );
};

export const useDisableAutoBidMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (sessionCode: string) => disableAutoBidApi(sessionCode),
    {
      onSuccess: (_data, sessionCode) => {
        queryClient.invalidateQueries(QK.autoBid(sessionCode));
      },
    }
  );
};
