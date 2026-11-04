export interface AutoBidConfig {
  enabled: boolean;
  maxAmount: number;
}

export interface CheckAutoBidParams {
  config: AutoBidConfig;
  currentLeader: string;
  currentPrice: number;
  stepPrice: number;
  isEnded: boolean;
  onTriggerBid: (amount: number) => void;
  onExceededMax: () => void;
}

export const evaluateAutoBid = ({
  config,
  currentLeader,
  currentPrice,
  stepPrice,
  isEnded,
  onTriggerBid,
  onExceededMax,
}: CheckAutoBidParams): NodeJS.Timeout | null => {
  if (!config.enabled || isEnded || currentLeader === "Bạn") {
    return null;
  }

  const nextBid = currentPrice + stepPrice;
  if (config.maxAmount >= nextBid) {
    return setTimeout(() => {
      onTriggerBid(nextBid);
    }, 700);
  } else {
    onExceededMax();
    return null;
  }
};
