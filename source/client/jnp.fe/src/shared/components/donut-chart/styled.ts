import styled, { keyframes } from 'styled-components';

const BAR_GROW_DURATION = '0.5s';

const growBar = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const ChartArea = styled.div<{ $size: number }>`
  position: relative;
  align-self: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

/** Phần tổng số nằm giữa vòng donut. Không chắn chuột để tooltip của cung vẫn hoạt động. */
export const CenterTotal = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
  text-align: center;
  padding: 0 24px;

  .center-label {
    font-size: 13px;
    color: rgba(29, 29, 29, 0.45);
  }

  .center-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: #1d1d1d;
  }
`;

export const LegendList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const LegendItem = styled.li`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px 12px;
`;

export const Dot = styled.span<{ $color: string }>`
  grid-row: 1;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

export const LegendLabel = styled.span`
  grid-row: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: #3f4a5a;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LegendValue = styled.span<{ $color: string }>`
  grid-row: 1;
  font-size: 14px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  font-variant-numeric: tabular-nums;
`;

export const BarTrack = styled.div`
  grid-column: 1 / -1;
  grid-row: 2;
  height: 8px;
  border-radius: 999px;
  background: #eef1f5;
  overflow: hidden;
`;

export const BarFill = styled.div<{ $color: string; $percent: number }>`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  transform-origin: left center;
  animation: ${growBar} ${BAR_GROW_DURATION} ease-out;

  /* Tôn trọng người dùng tắt hiệu ứng chuyển động */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  font-size: 14px;
  color: rgba(29, 29, 29, 0.45);
`;
