import { Skeleton } from 'antd';
import * as S from './styled';

const ICON_SIZE = 44;

/**
 * Khung chờ của StatCard.
 * Dùng lại S.Card nên giữ nguyên kích thước và khoảng cách của card thật,
 * tránh giật layout khi dữ liệu về.
 */
export default function StatCardSkeleton() {
  return (
    <S.Card>
      <Skeleton.Avatar active shape="square" size={ICON_SIZE} />
      <div>
        <Skeleton.Input active size="small" style={{ width: 140, height: 14 }} />
        <div style={{ marginTop: 6 }}>
          <Skeleton.Input active size="small" style={{ width: 180, height: 12 }} />
        </div>
      </div>
      <Skeleton.Input active style={{ width: 160, height: 30 }} />
    </S.Card>
  );
}
