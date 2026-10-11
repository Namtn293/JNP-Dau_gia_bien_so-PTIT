import type { ReactNode } from 'react';
import * as S from './styled';

/** Collapse chỉ có một panel nên key nào cũng được, miễn là cố định. */
const PANEL_KEY = 'section';

export interface SectionCollapseProps {
  title: ReactNode;
  /** Dòng mô tả nhỏ dưới tiêu đề. */
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Section mở sẵn khi hiện ra, người dùng có thể thu lại. */
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Section đóng/mở được: header có icon và tiêu đề, thân là nội dung tuỳ ý.
 * Thuần trình bày, nội dung do nơi gọi truyền vào.
 */
export default function SectionCollapse({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  className,
  children,
}: SectionCollapseProps) {
  return (
    <S.Wrapper
      className={className}
      expandIconPosition="start"
      defaultActiveKey={defaultOpen ? [PANEL_KEY] : []}
      items={[
        {
          key: PANEL_KEY,
          label: (
            <S.Heading>
              {icon ? <span className="section-icon">{icon}</span> : null}
              <div className="section-text">
                <div className="section-title">{title}</div>
                {subtitle ? <div className="section-subtitle">{subtitle}</div> : null}
              </div>
            </S.Heading>
          ),
          children,
        },
      ]}
    />
  );
}
