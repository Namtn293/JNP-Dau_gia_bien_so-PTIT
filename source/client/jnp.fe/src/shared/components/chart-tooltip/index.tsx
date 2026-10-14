import type { CSSProperties, ReactNode } from 'react';

/**
 * Style tooltip dùng chung cho các biểu đồ recharts,
 * để donut, bar và area có cùng một kiểu tooltip.
 */
export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e8ecf3',
  boxShadow: '0 4px 16px rgba(29, 29, 29, 0.12)',
  fontSize: 14,
};

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 700,
  color: '#1d1d1d',
};

/** Không đặt `color` ở đây để mỗi dòng giữ đúng màu của series tương ứng. */
export const TOOLTIP_ITEM_STYLE: CSSProperties = {
  padding: '3px 0',
  fontSize: 14,
  fontWeight: 600,
};

/**
 * Bọc phần số của tooltip cho nổi hơn phần nhãn.
 * Không đặt màu để chữ số thừa hưởng màu series từ dòng chứa nó.
 */
export const renderTooltipValue = (text: string): ReactNode => (
  <span style={{ fontWeight: 800, fontSize: 15 }}>{text}</span>
);
