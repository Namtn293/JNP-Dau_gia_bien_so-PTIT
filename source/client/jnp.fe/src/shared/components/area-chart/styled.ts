import styled from 'styled-components';

export const ChartBox = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
`;

export const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  font-size: 14px;
  color: rgba(29, 29, 29, 0.45);
`;
