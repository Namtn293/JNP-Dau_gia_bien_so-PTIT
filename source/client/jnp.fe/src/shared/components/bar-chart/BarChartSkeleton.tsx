import { Skeleton } from 'antd';
import * as S from './styled';

const DEFAULT_HEIGHT = 380;

interface BarChartSkeletonProps {
  height?: number;
}

/**
 * Khung chờ của BarChart.
 * Giữ đúng chiều cao biểu đồ thật để không giật layout khi dữ liệu về.
 */
export default function BarChartSkeleton({ height = DEFAULT_HEIGHT }: BarChartSkeletonProps) {
  return (
    <S.ChartBox $height={height}>
      <Skeleton.Node active style={{ width: '100%', height }} />
    </S.ChartBox>
  );
}
