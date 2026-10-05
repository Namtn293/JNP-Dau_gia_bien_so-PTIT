import styled, { css, keyframes } from 'styled-components';

const APPEAR_DURATION = '0.32s';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

export const Card = styled.div<{
  $background?: string;
  $borderColor?: string;
  $clickable?: boolean;
  $appearDelay?: number;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: ${({ $background }) => $background ?? '#ffffff'};
  border: 1px solid ${({ $borderColor }) => $borderColor ?? 'rgba(29, 29, 29, 0.15)'};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  user-select: ${({ $clickable }) => ($clickable ? 'none' : 'auto')};

  ${({ $appearDelay }) =>
    $appearDelay !== undefined &&
    css`
      opacity: 0;
      animation: ${fadeInUp} ${APPEAR_DURATION} ease forwards;
      animation-delay: ${$appearDelay}ms;

      /* Tôn trọng người dùng tắt hiệu ứng chuyển động */
      @media (prefers-reduced-motion: reduce) {
        opacity: 1;
        animation: none;
      }
    `}
`;

export const IconBox = styled.div<{
  $accentColor?: string;
  $iconBackground?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $iconBackground }) => $iconBackground ?? '#ffffff'};
  color: ${({ $accentColor }) => $accentColor ?? 'inherit'};
  font-size: 20px;
`;

export const Title = styled.div`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: rgba(29, 29, 29, 0.9);
`;

export const Description = styled.div`
  font-size: 13px;
  font-style: italic;
  color: rgba(29, 29, 29, 0.55);
`;

export const Value = styled.div<{ $accentColor?: string }>`
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  color: ${({ $accentColor }) => $accentColor ?? '#1d1d1d'};
`;
