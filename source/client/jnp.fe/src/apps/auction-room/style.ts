import styled, { keyframes, css } from "styled-components";

const popAnim = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const pulseRed = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.02); }
`;

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f4f8fa;
  color: #14202b;
  font-family: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
`;

export const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #dbe6ee;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(37, 107, 140, 0.05);
  flex-wrap: wrap;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

export const BrandIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9ccade 0%, #256b8c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(37, 107, 140, 0.25);
  flex-shrink: 0;
`;

export const BrandText = styled.div`
  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.3px;
    color: #256b8c;
    text-transform: uppercase;
    line-height: 1.2;
  }
  span {
    font-size: 11px;
    color: #586979;
    font-weight: 500;
    display: block;
    margin-top: 1px;
  }
`;

export const LiveBadge = styled.span<{ $ended?: boolean }>`
  background: ${(props) => (props.$ended ? "#64748b" : "#dc2626")};
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: ${(props) => (props.$ended ? "none" : "0 0 10px rgba(220, 38, 38, 0.35)")};
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const HeaderChip = styled.button<{ $active?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.$active ? "#ffffff" : "#586979")};
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #9ccade 0%, #256b8c 100%)"
      : "#ffffff"};
  border: 1px solid ${(props) => (props.$active ? "#256b8c" : "#dbe6ee")};
  border-radius: 9999px;
  padding: 6px 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 8px rgba(37, 107, 140, 0.25)" : "none"};

  &:hover {
    color: ${(props) => (props.$active ? "#ffffff" : "#256b8c")};
    background: ${(props) =>
      props.$active
        ? "linear-gradient(135deg, #9ccade 0%, #256b8c 100%)"
        : "#f0f7fb"};
    border-color: #256b8c;
  }
`;

export const BackButton = styled.button`
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #256b8c;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f7fb;
    border-color: #256b8c;
    color: #1e5670;
  }
`;

export const UserTrigger = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
  background: #ffffff;
  border: 1px solid #dbe6ee;
  transition: all 0.2s ease;

  &:hover {
    color: #256b8c;
    background: #f0f7fb;
    border-color: #256b8c;
  }

  .user-icon {
    font-size: 15px;
    color: #256b8c;
  }

  .caret-icon {
    font-size: 10px;
    color: #a0aec0;
    transition: transform 0.2s ease;
  }

  &:hover .caret-icon {
    transform: rotate(180deg);
  }
`;

export const MainGrid = styled.main`
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 350px;
  gap: 16px;
  padding: 16px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 58px);
  min-height: 640px;

  @media (max-width: 1100px) {
    grid-template-columns: 210px minmax(0, 1fr) 320px;
    gap: 12px;
    padding: 12px;
  }

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    height: auto;
    padding: 12px;
  }
`;

export const Panel = styled.div`
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0 4px 16px rgba(37, 107, 140, 0.05);
`;

export const PanelHeader = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #256b8c;
  padding: 12px 16px;
  border-bottom: 1px solid #dbe6ee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
`;

export const LotsContainer = styled.div`
  overflow-y: auto;
  flex: 1;
`;

export const LotCard = styled.div<{ $current?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f4f8;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${(props) => (props.$current ? "#f0f7fb" : "transparent")};
  border-left: 3px solid ${(props) => (props.$current ? "#256b8c" : "transparent")};

  &:hover {
    background: ${(props) => (props.$current ? "#e5f1f7" : "#f8fafc")};
  }
`;

export const LotPlateBadge = styled.div`
  background: #ffffff;
  border: 2px solid #9ccade;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 11px;
  font-weight: 800;
  color: #14202b;
  font-family: "Courier New", monospace;
  box-shadow: inset 0 0 0 1px #14202b, 0 2px 6px rgba(37, 107, 140, 0.1);
  letter-spacing: 0.5px;
  text-align: center;
  min-width: 72px;
`;

export const LotInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sub {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

export const StageContainer = styled.div`
  overflow-y: auto;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const PlateMockupStage = styled.div`
  height: 190px;
  background: linear-gradient(135deg, #133a4d 0%, #256b8c 50%, #4a8fae 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(156, 202, 222, 0.35) 0%, transparent 70%);
  }
`;

export const PlateFrame = styled.div`
  position: relative;
  z-index: 2;
  background: #ffffff;
  border: 4px solid #9ccade;
  border-radius: 12px;
  padding: 10px 24px;
  box-shadow: inset 0 0 0 2px #111111, 0 12px 32px rgba(37, 107, 140, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 250px;
`;

export const PlateNumberText = styled.div`
  font-size: 38px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 2px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.15);
  line-height: 1;

  @media (max-width: 900px) {
    font-size: 28px;
  }
`;

export const PlateMetaText = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 4px;
`;

export const LotIndexTag = styled.span`
  position: absolute;
  left: 14px;
  bottom: 12px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(19, 58, 77, 0.75);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 9999px;
  z-index: 3;
`;

export const StageInfo = styled.div`
  padding: 16px 20px 4px;

  h3 {
    font-size: 20px;
    font-weight: 800;
    color: #14202b;
    margin: 0;
  }

  p {
    font-size: 13px;
    color: #586979;
    margin: 4px 0 0;
  }
`;

export const DetailTabsBar = styled.div`
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #dbe6ee;
  padding: 0 20px;
  margin-top: 10px;
`;

export const DetailTabBtn = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 10px 0;
  color: ${(props) => (props.$active ? "#256b8c" : "#586979")};
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  font-size: 13px;
  border-bottom: 2px solid ${(props) => (props.$active ? "#256b8c" : "transparent")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #256b8c;
  }
`;

export const DetailContentBox = styled.div`
  padding: 12px 20px;
  color: #586979;
  font-size: 13px;
  line-height: 1.6;
  min-height: 54px;
  background: #f8fafc;
  border-bottom: 1px solid #dbe6ee;
`;

export const BiddingConsole = styled.div`
  margin: 14px 20px 20px;
  border: 1px solid #dbe6ee;
  border-radius: 14px;
  padding: 18px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(37, 107, 140, 0.05);
`;

export const BiddingTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PriceLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #586979;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const BigPriceText = styled.div<{ $popping?: boolean }>`
  font-size: 36px;
  font-weight: 900;
  color: #256b8c;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin: 2px 0;
  transition: transform 0.2s ease;
  ${(props) =>
    props.$popping &&
    css`
      animation: ${popAnim} 0.3s ease-in-out;
      color: #059669;
    `}

  @media (max-width: 900px) {
    font-size: 28px;
  }
`;

export const SubInfoText = styled.div`
  font-size: 12px;
  color: #64748b;

  b {
    color: #1e293b;
    font-weight: 700;
  }
`;

export const CountdownTimer = styled.div<{ $urgency?: "normal" | "warning" | "danger" }>`
  font-size: 32px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: ${(props) =>
    props.$urgency === "danger"
      ? "#dc2626"
      : props.$urgency === "warning"
      ? "#d97706"
      : "#059669"};
  ${(props) =>
    props.$urgency === "danger" &&
    css`
      animation: ${pulseRed} 1s infinite ease-in-out;
    `}
`;

export const UserStatusBanner = styled.div<{ $state?: "none" | "leading" | "outbid" }>`
  margin: 14px 0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) => {
    switch (props.$state) {
      case "leading":
        return css`
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        `;
      case "outbid":
        return css`
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        `;
      default:
        return css`
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
        `;
    }
  }}
`;

export const QuickIncrementRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

export const QuickStepBtn = styled.button`
  flex: 1;
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #256b8c;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #f0f7fb;
    border-color: #256b8c;
    color: #1e5670;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const MainActionBidBtn = styled.button<{ $ended?: boolean }>`
  width: 100%;
  background: ${(props) =>
    props.$ended ? "#94a3b8" : "linear-gradient(135deg, #9ccade 0%, #256b8c 100%)"};
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: ${(props) => (props.$ended ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(37, 107, 140, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(37, 107, 140, 0.4);
    background: linear-gradient(135deg, #82b9cf 0%, #1e5670 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const CustomInputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;

  input {
    flex: 1;
    min-width: 0;
    border: 1px solid #dbe6ee;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    font-family: inherit;
    color: #14202b;

    &:focus {
      outline: none;
      border-color: #256b8c;
      box-shadow: 0 0 0 2px rgba(37, 107, 140, 0.15);
    }
  }

  button {
    background: linear-gradient(135deg, #9ccade 0%, #256b8c 100%);
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: #1e5670;
      color: #ffffff;
    }
  }
`;

export const AutoBidToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  font-size: 13px;
  color: #475569;
  flex-wrap: wrap;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  input[type="text"] {
    width: 150px;
    border: 1px solid #dbe6ee;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #256b8c;
    }
  }
`;

export const RegulationNote = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 12px;
  line-height: 1.5;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
`;

export const InteractionTabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #dbe6ee;
  background: #ffffff;
`;

export const InteractionTabBtn = styled.button<{ $active?: boolean }>`
  flex: 1;
  background: none;
  border: none;
  padding: 12px 6px;
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  color: ${(props) => (props.$active ? "#256b8c" : "#586979")};
  border-bottom: 2px solid ${(props) => (props.$active ? "#256b8c" : "transparent")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #256b8c;
  }
`;

export const PinnedNoticeBar = styled.div`
  background: #f0f7fb;
  border-bottom: 1px solid #dbe6ee;
  color: #1e5670;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.45;
`;

export const TabBodyArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  min-height: 0;
`;

export const ChatInputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;

  input {
    flex: 1;
    min-width: 0;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #0f172a;
    }
  }

  button {
    background: #0f172a;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #1e293b;
    }
  }
`;

export const ChatMsgItem = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.45;

  .author {
    font-weight: 700;
    color: #1e293b;
    margin-right: 6px;
  }

  .text {
    color: #334155;
  }
`;

export const ChatTag = styled.span<{ $type?: "host" | "vip" | "mine" }>`
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 9999px;
  margin-left: 4px;
  display: inline-block;

  ${(props) => {
    switch (props.$type) {
      case "host":
        return css`
          background: #fef3c7;
          color: #b45309;
        `;
      case "vip":
        return css`
          background: #ede9fe;
          color: #6d28d9;
        `;
      default:
        return css`
          background: #e0f2fe;
          color: #0369a1;
        `;
    }
  }}
`;

export const SystemNoticeItem = styled.div`
  background: #f1f5f9;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const BidHistRow = styled.div<{ $isMine?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$isMine ? "#059669" : "#1e293b")};
  font-weight: ${(props) => (props.$isMine ? 800 : 500)};

  .user {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .amount {
    font-weight: 700;
  }

  .time {
    color: #94a3b8;
    font-size: 12px;
  }
`;

export const PresenceGroupHeader = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 12px 0 6px;

  &:first-child {
    margin-top: 0;
  }
`;

export const ParticipantRow = styled.div<{ $isSelf?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  background: ${(props) => (props.$isSelf ? "#ecfdf5" : "transparent")};
  margin-bottom: 2px;

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #475569;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status {
    margin-left: auto;
    font-size: 12px;
    color: #64748b;
  }
`;

export const ModalOverlay = styled.div<{ $open?: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: ${(props) => (props.$open ? "grid" : "none")};
  place-items: center;
  z-index: 100;
  padding: 16px;
`;

export const ModalContent = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

  h3 {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    color: #475569;
    margin: 0 0 20px;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 10px;

    button {
      flex: 1;
      padding: 11px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-cancel {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;

      &:hover {
        background: #e2e8f0;
      }
    }

    .btn-confirm {
      background: linear-gradient(135deg, #9ccade 0%, #256b8c 100%);
      border: none;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 107, 140, 0.3);

      &:hover {
        background: #1e5670;
      }
    }
  }
`;

export const SkeletonCard = styled.div`
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const SkeletonPlateBanner = styled.div`
  background: #ffffff;
  border: 1.5px dashed #cbd5e1;
  border-radius: 16px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 16px 0;
`;

export const SkeletonBiddingStage = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 14px;
`;

export const SkeletonFeedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
`;
