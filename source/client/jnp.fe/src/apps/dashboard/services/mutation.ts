import { useMutation, useQueryClient } from "react-query";
import { placeBid } from "./api";
import { AUCTION_QUERY_KEY } from "./query";
import type { PlaceBidPayload } from "./type";

export const usePlaceBidMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: PlaceBidPayload) => placeBid(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(AUCTION_QUERY_KEY);
      },
    }
  );
};
