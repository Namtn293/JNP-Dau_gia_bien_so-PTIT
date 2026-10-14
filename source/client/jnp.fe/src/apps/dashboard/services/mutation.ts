import { useMutation, useQueryClient } from "react-query";
import { placeBidApi } from "./api";
import { AUCTION_QUERY_KEY } from "./query";
import type { PlaceBidPayload } from "./type";

export const usePlaceBidMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: PlaceBidPayload) => placeBidApi(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(AUCTION_QUERY_KEY);
      },
    }
  );
};
