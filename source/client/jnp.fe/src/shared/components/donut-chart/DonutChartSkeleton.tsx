import { Skeleton } from 'antd';
import * as S from './styled';

const DEFAULT_SIZE = 220;
const SKELETON_ROWS = 4;

interface DonutChartSkeletonProps {
  size?: number;
  /** Số dòng legend giả, nên khớp số mục thật để không giật layout */
  rows?: number;
}

/**
 * Khung chờ của DonutChart.
 * Dùng lại layout của biểu đồ thật để giữ nguyên kích thước khi dữ liệu về.
 */
export default function DonutChartSkeleton({
  size = DEFAULT_SIZE,
  rows = SKELETON_ROWS,
}: DonutChartSkeletonProps) {
  return (
    <S.Wrapper>
      <S.ChartArea $size={size}>
        <Skeleton.Avatar active shape="circle" size={size} />
      </S.ChartArea>
      <S.LegendList>
        {Array.from({ length: rows }, (_, index) => (
          <S.LegendItem key={index}>
            <Skeleton.Avatar active shape="circle" size={10} />
            <Skeleton.Input active size="small" style={{ width: 180, height: 14 }} />
            <Skeleton.Input active size="small" style={{ width: 24, height: 14 }} />
            <S.BarTrack />
          </S.LegendItem>
        ))}
      </S.LegendList>
    </S.Wrapper>
  );
}
