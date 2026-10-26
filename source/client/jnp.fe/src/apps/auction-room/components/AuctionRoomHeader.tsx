import React from "react";
import TopNavbar from "@/apps/dashboard/components/TopNavbar";

interface AuctionRoomHeaderProps {
  userName?: string;
  onLogout?: () => void;
  title?: string;
  plateNumber?: string;
  provinceName?: string;
  isEnded?: boolean;
  participantCount?: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onBackToList?: () => void;
  onOpenParticipants?: () => void;
}

export const AuctionRoomHeader: React.FC<AuctionRoomHeaderProps> = ({
  userName = "Người dùng",
  onLogout,
}) => {
  return <TopNavbar userName={userName} onLogout={onLogout} />;
};

export default AuctionRoomHeader;
