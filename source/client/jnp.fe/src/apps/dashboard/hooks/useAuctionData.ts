import useData from "./useData";
import useAction from "./useAction";

export const useAuctionData = () => {
  const dataHook = useData();
  const actionHook = useAction(
    dataHook.setData,
    dataHook.sendBid,
    dataHook.currentUser
  );

  return {
    ...dataHook,
    ...actionHook,
  };
};

export default useAuctionData;
