import useData from "./useData";
import useAction from "./useAction";

export const useAuctionData = () => {
  const dataHook = useData();
  const actionHook = useAction(dataHook.setData);

  return {
    ...dataHook,
    ...actionHook,
  };
};

export default useAuctionData;
