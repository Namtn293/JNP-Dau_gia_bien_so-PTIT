import { useMutation, useQueryClient } from "react-query";
import { placeBidApi, watchSessionApi, unwatchSessionApi } from "./api";
import { AUCTION_QUERY_KEY, WATCHED_SESSIONS_KEY } from "./query";
import type { PlaceBidPayload } from "./type";

export const usePlaceBidMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: PlaceBidPayload) =>
      placeBidApi(
        payload.sessionCode || payload.plateNumber,
        payload.bidAmount ?? payload.amount ?? 0
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(AUCTION_QUERY_KEY);
      },
    }
  );
};

export const useWatchSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (sessionCode: string) => watchSessionApi(sessionCode),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(WATCHED_SESSIONS_KEY);
      },
    }
  );
};

export const useUnwatchSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (sessionCode: string) => unwatchSessionApi(sessionCode),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(WATCHED_SESSIONS_KEY);
      },
    }
  );
};
