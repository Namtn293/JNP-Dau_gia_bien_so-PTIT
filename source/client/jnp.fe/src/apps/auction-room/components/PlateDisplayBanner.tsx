import React from "react";
import {
  PlateMockupStage,
  PlateFrame,
  PlateNumberText,
  PlateMetaText,
  LotIndexTag,
} from "./styled";

interface PlateDisplayBannerProps {
  plateNumber: string;
  provinceName: string;
  vehicleType: string;
  lotIndex: number;
  totalLots: number;
}

export const PlateDisplayBanner: React.FC<PlateDisplayBannerProps> = ({
  plateNumber,
  provinceName,
  vehicleType,
  lotIndex,
  totalLots,
}) => {
  return (
    <PlateMockupStage aria-label="Biển số đang đấu giá">
      <LotIndexTag>
        Lô {lotIndex > 0 ? lotIndex : 1} / {totalLots > 0 ? totalLots : 1}
      </LotIndexTag>

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
