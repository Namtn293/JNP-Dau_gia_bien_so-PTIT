import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  renderTooltipValue,
} from '@components/chart-tooltip';
import { useId } from 'react';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import * as S from './styled';

export { default as AreaChartSkeleton } from './AreaChartSkeleton';

const DEFAULT_HEIGHT = 380;
const GRID_COLOR = '#dfe5ee';
const X_AXIS_COLOR = '#1d1d1d';
const AXIS_FONT_SIZE = 13;
/** Độ đậm của vùng tô ở đỉnh và ở đáy, tạo hiệu ứng loang xuống. */
const AREA_OPACITY_TOP = 0.28;
const AREA_OPACITY_BOTTOM = 0;

export type AxisSide = 'left' | 'right';

export interface AreaChartSeries {
  /** Tên trường trong mỗi dòng dữ liệu */
  key: string;
  /** Nhãn hiển thị ở chú thích */
  name: string;
  /** Nhãn hiển thị ở tooltip. Bỏ trống thì dùng lại `name`. */
  tooltipName?: string;
  color: string;
  /** Trục Y mà series này bám theo. Mặc định trục trái. */
  axis?: AxisSide;
  /** Định dạng số ở tooltip. Mặc định giữ nguyên số. */
  formatValue?: (value: number) => string;
  /** Định dạng số ở trục Y. Mặc định dùng formatValue. */
  formatAxisValue?: (value: number) => string;
}

export interface AreaChartProps<T extends object> {
  data: readonly T[];
  /** Tên trường dùng làm trục X, ví dụ "nam" */
  xKey: keyof T & string;
  series: AreaChartSeries[];
  height?: number;
  /** Định dạng nhãn trục X ở tooltip, ví dụ 2021 -> "Năm 2021" */
  formatXLabel?: (label: string | number) => string;
  emptyText?: string;
  className?: string;
}

const defaultFormatValue = (value: number): string => String(value);

const toSafeNumber = (value: unknown): number => (typeof value === 'number' ? value : 0);

/**
 * Biểu đồ vùng nhiều series, mỗi series bám trục trái hoặc trục phải.
 * Thuần trình bày: dữ liệu, màu sắc và định dạng số đều do nơi gọi truyền vào.
 */
export default function AreaChart<T extends object>({
  data,
  xKey,
  series,
  height = DEFAULT_HEIGHT,
  formatXLabel,
  emptyText = 'Chưa có dữ liệu',
  className,
}: AreaChartProps<T>) {
  // Mỗi biểu đồ cần id gradient riêng, tránh trùng khi có nhiều biểu đồ trên cùng trang
  const gradientPrefix = useId();

  if (!data.length || !series.length) {
    return <S.EmptyState className={className}>{emptyText}</S.EmptyState>;
  }

  const gradientId = (key: string) => `${gradientPrefix}-${key}`;

  /** Trục Y lấy màu và định dạng của series đầu tiên bám vào nó. */
  const seriesOfAxis = (axis: AxisSide) =>
    series.find((item) => (item.axis ?? 'left') === axis);

  const renderYAxis = (axis: AxisSide) => {
    const owner = seriesOfAxis(axis);
    if (!owner) {
      return null;
    }

    const formatTick = owner.formatAxisValue ?? owner.formatValue ?? defaultFormatValue;

    return (
      <YAxis
        yAxisId={axis}
        orientation={axis}
        tickFormatter={formatTick}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
        tick={{ fill: owner.color, fontSize: AXIS_FONT_SIZE, fontWeight: 700 }}
      />
    );
  };

  const formatTooltipValue = (value: unknown, name: string) => {
    const owner = series.find((item) => (item.tooltipName ?? item.name) === name);
    const format = owner?.formatValue ?? defaultFormatValue;
    return [renderTooltipValue(format(toSafeNumber(value))), name];
  };

  return (
    <S.ChartBox $height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data as unknown as Array<Record<string, string | number>>}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <defs>
            {series.map((item) => (
              <linearGradient key={item.key} id={gradientId(item.key)} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity={AREA_OPACITY_TOP} />
                <stop offset="100%" stopColor={item.color} stopOpacity={AREA_OPACITY_BOTTOM} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            tick={{ fill: X_AXIS_COLOR, fontSize: AXIS_FONT_SIZE, fontWeight: 700 }}
          />
          {renderYAxis('left')}
          {renderYAxis('right')}

          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
            formatter={(value, name) => formatTooltipValue(value, String(name))}
            labelFormatter={(label) => (formatXLabel ? formatXLabel(label) : label)}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 16, fontWeight: 700, textTransform: 'uppercase' }}
            formatter={(_, entry) => {
              // Chú thích hiển thị `name`, còn tooltip dùng `tooltipName` nên phải tra lại theo khoá
              const owner = series.find((item) => item.key === entry?.dataKey);
              return owner?.name ?? '';
            }}
          />

          {series.map((item) => (
            <Area
              key={item.key}
              yAxisId={item.axis ?? 'left'}
              type="monotone"
              dataKey={item.key}
              name={item.tooltipName ?? item.name}
              stroke={item.color}
              strokeWidth={2.5}
              fill={`url(#${gradientId(item.key)})`}
              dot={{ r: 4, fill: item.color, stroke: item.color }}
              activeDot={{ r: 6, fill: item.color, stroke: '#fff', strokeWidth: 2 }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </S.ChartBox>
  );
}
