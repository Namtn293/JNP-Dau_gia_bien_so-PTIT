import { Skeleton } from 'antd';
import * as S from './styled';

const DEFAULT_HEIGHT = 380;

interface AreaChartSkeletonProps {
  height?: number;
}

/**
 * Khung chờ của AreaChart.
 * Giữ đúng chiều cao biểu đồ thật để không giật layout khi dữ liệu về.
 */
export default function AreaChartSkeleton({ height = DEFAULT_HEIGHT }: AreaChartSkeletonProps) {
  return (
    <S.ChartBox $height={height}>
      <Skeleton.Node active style={{ width: '100%', height }} />
    </S.ChartBox>
  );
}
