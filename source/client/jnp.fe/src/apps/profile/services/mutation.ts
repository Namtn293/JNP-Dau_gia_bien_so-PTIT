import { useMutation, useQueryClient } from "react-query";
import { QK } from "@/shared/constants/queryKeys";
import { topupApi } from "./api";
import type { TopupDTO, WalletVO } from "./type";

export const useTopupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<WalletVO, any, TopupDTO>((dto) => topupApi(dto), {
    onSuccess: (data) => {
      queryClient.setQueryData(QK.wallet, data);
      queryClient.invalidateQueries(["wallet-tx"]);
    },
  });
};

