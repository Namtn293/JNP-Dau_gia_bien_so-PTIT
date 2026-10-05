import type { CSSProperties, ReactNode } from 'react';
import * as S from './styled';

export { default as StatCardSkeleton } from './StatCardSkeleton';

export interface StatCardProps {
  /** Nhãn của card, ví dụ "Tổng vốn đầu tư" */
  title: ReactNode;
  /** Giá trị đã được format sẵn bởi nơi gọi, ví dụ "19.43B USD" */
  value: ReactNode;
  /** Dòng mô tả phụ nằm dưới nhãn */
  description?: ReactNode;
  icon?: ReactNode;
  /** Màu nhấn dùng cho icon và giá trị */
  accentColor?: string;
  background?: string;
  borderColor?: string;
  iconBackground?: string;
  /** Độ trễ (ms) của hiệu ứng hiện ra. Bỏ trống thì card hiện ngay, không animate. */
  appearDelay?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Card hiển thị một chỉ số thống kê.
 * Thuần trình bày: nội dung, định dạng và màu sắc đều do nơi gọi truyền vào.
 */
export default function StatCard({
  title,
  value,
  description,
  icon,
  accentColor,
  background,
  borderColor,
  iconBackground,
  appearDelay,
  className,
  style,
  onClick,
}: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <S.Card
      className={className}
      style={style}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      $background={background}
      $borderColor={borderColor}
      $clickable={isClickable}
      $appearDelay={appearDelay}
    >
      {icon && (
        <S.IconBox $accentColor={accentColor} $iconBackground={iconBackground}>
          {icon}
        </S.IconBox>
      )}
      <div>
        <S.Title>{title}</S.Title>
        {description && <S.Description>{description}</S.Description>}
      </div>
      <S.Value $accentColor={accentColor}>{value}</S.Value>
    </S.Card>
  );
}
