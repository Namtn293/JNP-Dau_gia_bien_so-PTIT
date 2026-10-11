import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  renderTooltipValue,
} from '@components/chart-tooltip';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import * as S from './styled';

export { default as DonutChartSkeleton } from './DonutChartSkeleton';

/** Kích thước mặc định (px) của vòng donut. */
const DEFAULT_SIZE = 220;
/** Tỷ lệ bán kính trong so với bán kính ngoài, cho ra vòng dày như thiết kế. */
const INNER_RADIUS_RATIO = 0.62;
/** Khe hở giữa các cung, tính bằng độ. */
const SEGMENT_GAP_DEGREE = 2;
/** Tooltip phải nổi trên khối tổng số ở tâm, vốn đứng sau nó trong DOM. */
const TOOLTIP_Z_INDEX = 10;

export interface DonutChartItem {
  /** Nhãn hiển thị ở legend và tooltip */
  label: string;
  value: number;
  /** Màu của cung, chấm tròn, số liệu và thanh tỷ lệ */
  color: string;
  /** recharts yêu cầu dữ liệu truy cập được bằng khoá động */
  [key: string]: string | number;
}

export interface DonutChartProps {
  data: DonutChartItem[];
  /** Nhãn của tổng số hiển thị giữa vòng donut, ví dụ "Tổng số dự án" */
  totalLabel?: string;
  /** Đường kính vòng donut (px) */
  size?: number;
  /** Định dạng số hiển thị ở tâm, legend và tooltip. Mặc định giữ nguyên số. */
  formatValue?: (value: number) => string;
  /** Tắt khi tổng số không có ý nghĩa, ví dụ dữ liệu vốn đã là phần trăm. */
  showTotal?: boolean;
  /** Tắt để legend chỉ còn nhãn và số, không kèm thanh tỷ lệ. */
  showLegendBar?: boolean;
  emptyText?: string;
  className?: string;
}

const defaultFormatValue = (value: number): string => String(value);

const toPercent = (value: number, total: number): number =>
  total > 0 ? (value / total) * 100 : 0;

/**
 * Biểu đồ tròn dạng donut: tổng số nằm giữa vòng, legend kèm thanh tỷ lệ nằm dưới.
 * Thuần trình bày: dữ liệu, màu sắc và định dạng số đều do nơi gọi truyền vào.
 */
export default function DonutChart({
  data,
  totalLabel,
  size = DEFAULT_SIZE,
  formatValue = defaultFormatValue,
  showTotal = true,
  showLegendBar = true,
  emptyText = 'Chưa có dữ liệu',
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length || total <= 0) {
    return <S.EmptyState className={className}>{emptyText}</S.EmptyState>;
  }

  return (
    <S.Wrapper className={className}>
      <S.ChartArea $size={size}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={`${INNER_RADIUS_RATIO * 100}%`}
              outerRadius="100%"
              paddingAngle={SEGMENT_GAP_DEGREE}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: TOOLTIP_Z_INDEX }}
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(value, label) => {
                const safeValue = typeof value === 'number' ? value : 0;
                return [
                  renderTooltipValue(
                    `${formatValue(safeValue)} (${toPercent(safeValue, total).toFixed(1)}%)`,
                  ),
                  label,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {showTotal && (
          <S.CenterTotal>
            <span className="center-label">{totalLabel}</span>
            <span className="center-value">{formatValue(total)}</span>
          </S.CenterTotal>
        )}
      </S.ChartArea>

      <S.LegendList>
        {data.map((item) => (
          <S.LegendItem key={item.label}>
            <S.Dot $color={item.color} />
            <S.LegendLabel title={item.label}>{item.label}</S.LegendLabel>
            <S.LegendValue $color={item.color}>{formatValue(item.value)}</S.LegendValue>
            {showLegendBar && (
              <S.BarTrack>
                <S.BarFill $color={item.color} $percent={toPercent(item.value, total)} />
              </S.BarTrack>
            )}
          </S.LegendItem>
        ))}
      </S.LegendList>
    </S.Wrapper>
  );
}
