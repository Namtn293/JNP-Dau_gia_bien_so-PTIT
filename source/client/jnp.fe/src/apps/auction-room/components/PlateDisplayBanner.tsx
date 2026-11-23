import React from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import {
  PlateMockupStage,
  PlateFrame,
  PlateNumberText,
  PlateMetaText,
  LotIndexTag,
  WatchPlateButton,
} from "./styled";

interface PlateDisplayBannerProps {
  plateNumber: string;
  provinceName: string;
  vehicleType: string;
  lotIndex: number;
  totalLots: number;
  isWatched?: boolean;
  onToggleWatch?: () => void;
  watchLoading?: boolean;
  participantCount?: number;
}

export const PlateDisplayBanner: React.FC<PlateDisplayBannerProps> = ({
  plateNumber,
  provinceName,
  vehicleType,
  lotIndex,
  totalLots,
  isWatched = false,
  onToggleWatch,
  watchLoading = false,
  participantCount,
}) => {
  return (
    <PlateMockupStage aria-label="Biển số đang đấu giá">
      <LotIndexTag>
        Lô {lotIndex > 0 ? lotIndex : 1} / {totalLots > 0 ? totalLots : 1}
        {typeof participantCount === "number" && (
          <span style={{ marginLeft: 8, color: "#15803d", fontWeight: 700 }}>
            &bull; {participantCount} người tham gia
          </span>
        )}
      </LotIndexTag>

      {onToggleWatch && (
        <WatchPlateButton
          $watched={isWatched}
          disabled={watchLoading}
          onClick={onToggleWatch}
          aria-label={isWatched ? "Bỏ theo dõi phiên" : "Theo dõi phiên"}
        >
          {isWatched ? (
            <>
              <StarFilled style={{ color: "#f59e0b" }} />
              <span>Đang theo dõi</span>
            </>
          ) : (
            <>
              <StarOutlined />
              <span>Theo dõi phiên</span>
            </>
          )}
        </WatchPlateButton>
      )}

      <PlateFrame>
        <PlateNumberText>{plateNumber}</PlateNumberText>
        <PlateMetaText>
          {provinceName} &bull; {vehicleType}
        </PlateMetaText>
      </PlateFrame>
    </PlateMockupStage>
  );
};

export default PlateDisplayBanner;
