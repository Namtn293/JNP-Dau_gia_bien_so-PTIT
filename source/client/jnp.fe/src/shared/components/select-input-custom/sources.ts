import type { ReactNode } from "react";
import { SERVICE_ADMIN_PREFIX } from "@/shared/constants";
import type { InfinitePageResult } from "@shared/hooks/useInfiniteOptions";

/** Option chuẩn hoá mà SelectInputCustom tiêu thụ (mọi nguồn map về dạng này). */
export interface ISelectOption {
  value: string | number;
  label: ReactNode;
}

/**
 * Một nguồn dữ liệu cho SelectInputCustom:
 * - `url`: endpoint gọi.
 * - `normalize`: map response (ĐÃ unwrap qua interceptor) → { items, total }.
 *   Mỗi API trả shape khác nhau nên phần map nằm ở đây, không nằm trong component.
 */
export interface ISelectSource {
  url: string;
  normalize: (res: unknown) => InfinitePageResult<ISelectOption>;
}

/** Helper: response dạng object map { "<id>": "<tên>" } — BE trả hết một lần. */
const fromIdNameMap = (res: unknown): InfinitePageResult<ISelectOption> => {
  const envelope = res as { data?: Record<string, string> } | Record<string, string>;
  const map = (envelope as { data?: Record<string, string> })?.data ??
    (envelope as Record<string, string>) ?? {};
  const items = Object.entries(map).map(([value, label]) => ({ value, label }));
  return { items, total: items.length };
};

/**
 * Helper: response phân trang { data: T[], metaData: { total } }.
 * Chỉ ra field id/tên của item để map — mỗi API đặt tên field khác nhau.
 */
const fromPaging =
  (valueKey = "id", labelKey = "ten") =>
  (res: unknown): InfinitePageResult<ISelectOption> => {
    const body = res as {
      data?: Array<Record<string, unknown>>;
      metaData?: { total?: number } | null;
    };
    const rows = body?.data ?? [];
    return {
      items: rows.map((row) => ({
        value: row[valueKey] as string | number,
        label: row[labelKey] as ReactNode,
      })),
      total: body?.metaData?.total ?? rows.length,
    };
  };

/**
 * Danh mục các nguồn dữ liệu Select. Thêm API mới = thêm 1 entry ở đây
 * (không sửa component). Key chính là `name` truyền vào SelectInputCustom.
 */
export const SELECT_SOURCES = {
  // Tỉnh/Thành phố: BE trả object map { id: tên }.
  tinhThanhPho: {
    url: `${SERVICE_ADMIN_PREFIX}/TinhThanhPho/lay-danh-sach-chon`,
    normalize: fromIdNameMap,
  },
  // Ví dụ nguồn mảng phân trang — CHỈ TÊN FIELD id/label của API đó tại đây:
  // response { data: [{ adminId, tenDonVi }], metaData } → { value: adminId, label: tenDonVi }
  // donVi: {
  //   url: `${SERVICE_ADMIN_PREFIX}/DonVi/lay-danh-sach-chon`,
  //   normalize: fromPaging("adminId", "tenDonVi"),
  // },
} satisfies Record<string, ISelectSource>;

export type SelectSourceName = keyof typeof SELECT_SOURCES;

// Tránh cảnh báo unused khi chưa khai nguồn phân trang nào ở trên.
export { fromPaging };
