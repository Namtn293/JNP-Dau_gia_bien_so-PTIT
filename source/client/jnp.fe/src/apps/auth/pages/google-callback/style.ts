import styled, { keyframes } from "styled-components";
import { Button } from "antd";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(37, 107, 140, 0.4);
  }
  50% {
    box-shadow: 0 0 0 14px rgba(37, 107, 140, 0);
  }
`;

export const CallbackCard = styled.div`
  width: 100%;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8);
  padding: 36px 32px;
  animation: ${fadeIn} 0.35s ease-out;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 24px 20px;
    border-radius: 16px;
    max-width: 100%;
  }
`;

export const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }
`;

export const GoogleAccountCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;

  .google-icon-wrapper {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;

    .user-name {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 13px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .badge-tag {
    font-size: 11px;
    font-weight: 600;
    color: #059669;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    padding: 2px 8px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
`;

export const NoticeBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 12.5px;
  color: #0369a1;
  line-height: 1.5;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  svg {
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

export const PrimarySubmitButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  background: linear-gradient(135deg, #3284aa 0%, #1e5670 100%);
  border: none;
  box-shadow: 0 6px 18px rgba(30, 86, 112, 0.28);
  color: #ffffff;
  transition: all 0.2s ease;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2b779b 0%, #17455a 100%) !important;
    box-shadow: 0 8px 22px rgba(30, 86, 112, 0.38) !important;
    transform: translateY(-1px);
    color: #ffffff !important;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CancelButton = styled(Button)`
  height: 46px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  background: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    color: #1e293b !important;
    border-color: #cbd5e1 !important;
    background: #f8fafc !important;
  }
`;

export const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;

  .spinner-pulse {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0fdf4;
    color: #16a34a;
    font-size: 28px;
    margin-bottom: 20px;
    animation: ${pulseGlow} 2s infinite;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;
