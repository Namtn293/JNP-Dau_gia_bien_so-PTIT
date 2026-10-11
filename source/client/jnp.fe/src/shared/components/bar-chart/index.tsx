import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  renderTooltipValue,
} from '@components/chart-tooltip';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import * as S from './styled';

export { default as BarChartSkeleton } from './BarChartSkeleton';

const DEFAULT_HEIGHT = 380;
/** Góc nghiêng của nhãn trục X, đủ để tên tỉnh thành dài không chồng nhau. */
const X_LABEL_ANGLE = -20;
/** Bo góc cột dọc (đầu trên): [trên-trái, trên-phải, dưới-phải, dưới-trái] */
const BAR_RADIUS_VERTICAL: [number, number, number, number] = [6, 6, 0, 0];
/** Bo góc cột ngang (đầu phải) */
const BAR_RADIUS_HORIZONTAL: [number, number, number, number] = [0, 6, 6, 0];
/** Bề rộng chừa cho nhãn danh mục ở trục dọc khi vẽ cột ngang. */
const CATEGORY_AXIS_WIDTH = 90;
const AXIS_COLOR = '#1d1d1d';
const GRID_COLOR = '#dfe5ee';
const AXIS_FONT_SIZE = 13;
/** Chừa thêm khoảng trống phía trên cột cao nhất cho thoáng. */
const Y_AXIS_HEADROOM = 1.08;

export interface BarChartItem {
  /** Nhãn hiển thị ở trục X và tooltip */
  label: string;
  value: number;
  color: string;
  /** recharts yêu cầu dữ liệu truy cập được bằng khoá động */
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartItem[];
  height?: number;
  /** Định dạng số ở tooltip. Mặc định giữ nguyên số. */
  formatValue?: (value: number) => string;
  /** Định dạng số ở trục Y. Mặc định dùng formatValue. */
  formatAxisValue?: (value: number) => string;
  /** Tên series hiển thị ở tooltip */
  valueName?: string;
  /** Hướng cột: 'vertical' (mặc định) hoặc 'horizontal' (nhãn nằm trục dọc). */
  orientation?: 'vertical' | 'horizontal';
  emptyText?: string;
  className?: string;
}

const defaultFormatValue = (value: number): string => String(value);

/**
 * Trục danh mục (tên) và trục giá trị (số) một series.
 * Tách theo hướng để phần render bên dưới không phải rẽ nhánh nhiều lần: cột dọc
 * đặt danh mục ở trục X, cột ngang đảo lại — danh mục ở trục Y, giá trị ở trục X.
 */
function buildAxes(orientation: 'vertical' | 'horizontal', formatTick: (value: number) => string) {
  const categoryAxis = {
    dataKey: 'label' as const,
    type: 'category' as const,
    tickLine: false,
    axisLine: { stroke: GRID_COLOR },
    tick: { fill: AXIS_COLOR, fontSize: AXIS_FONT_SIZE, fontWeight: 700 },
  };
  const valueAxis = {
    type: 'number' as const,
    domain: [0, (dataMax: number) => Math.ceil(dataMax * Y_AXIS_HEADROOM)] as const,
    tickFormatter: formatTick,
    tickLine: false,
    axisLine: { stroke: GRID_COLOR },
    tick: { fill: AXIS_COLOR, fontSize: AXIS_FONT_SIZE, fontWeight: 700 },
  };

  if (orientation === 'horizontal') {
    return {
      xAxis: <XAxis {...valueAxis} />,
      yAxis: <YAxis {...categoryAxis} width={CATEGORY_AXIS_WIDTH} interval={0} />,
    };
  }

  return {
    xAxis: (
      <XAxis
        {...categoryAxis}
        interval={0}
        angle={X_LABEL_ANGLE}
        textAnchor="end"
        height={60}
      />
    ),
    yAxis: <YAxis {...valueAxis} />,
  };
}

/**
 * Biểu đồ cột một series, đổi hướng qua prop `orientation`.
 * Thuần trình bày: dữ liệu, màu sắc và định dạng số đều do nơi gọi truyền vào.
 */
export default function BarChart({
  data,
  height = DEFAULT_HEIGHT,
  formatValue = defaultFormatValue,
  formatAxisValue,
  valueName = 'Giá trị',
  orientation = 'vertical',
  emptyText = 'Chưa có dữ liệu',
  className,
}: BarChartProps) {
  if (!data.length) {
    return <S.EmptyState className={className}>{emptyText}</S.EmptyState>;
  }

  const isHorizontal = orientation === 'horizontal';
  const formatTick = formatAxisValue ?? formatValue;
  const { xAxis, yAxis } = buildAxes(orientation, formatTick);

  return (
    <S.ChartBox $height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 16, left: 8, bottom: isHorizontal ? 8 : 32 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke={GRID_COLOR}
            vertical={isHorizontal}
            horizontal={!isHorizontal}
          />
          {xAxis}
          {yAxis}
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
            formatter={(value) => [
              renderTooltipValue(formatValue(typeof value === 'number' ? value : 0)),
              valueName,
            ]}
          />
          <Bar
            dataKey="value"
            radius={isHorizontal ? BAR_RADIUS_HORIZONTAL : BAR_RADIUS_VERTICAL}
            maxBarSize={64}
          >
            {data.map((item) => (
              <Cell key={item.label} fill={item.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </S.ChartBox>
  );
}
