import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import type { DefaultOptionType } from "antd/es/select";
import { useCallback, useMemo, useState } from "react";
import { httpService } from "@configs/httpService";
import { useInfiniteOptions } from "@shared/hooks/useInfiniteOptions";
import type { ISelectOption, SelectSourceName } from "./sources";
import { SELECT_SOURCES } from "./sources";

/** Value của row spinner cuối list — disabled nên không bao giờ chọn được. */
const LOAD_MORE_SENTINEL = "__select_input_custom_load_more__";

type SelectValue = string | number;

/** Bỏ dấu + thường hoá để search tiếng Việt không phụ thuộc dấu/hoa-thường. */
const foldText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim();

export interface SelectInputCustomProps
  extends Omit<SelectProps, "options" | "loading" | "onSearch" | "onPopupScroll"> {
  /**
   * Tên nguồn dữ liệu (khai trong SELECT_SOURCES). Mỗi nguồn tự map response
   * → option nên component không cần biết shape của từng API. Bỏ trống nếu
   * dùng `options` tĩnh.
   */
  name?: SelectSourceName;
  /**
   * Options tĩnh (VD enum). Khi truyền, component KHÔNG gọi API — search lọc
   * ngay trên client theo label. `name` khi đó bị bỏ qua.
   */
  options?: DefaultOptionType[];
  /** Tham số lọc thêm gửi kèm mỗi request (VD { TinhThanhPhoId: 2 }). */
  extraParams?: Record<string, unknown>;
  /** Tên param phân trang/từ khoá gửi lên BE. Mặc định Page / PageSize / Keyword. */
  pageKey?: string;
  pageSizeKey?: string;
  searchKey?: string;
  pageSize?: number;
  /** Seed nhãn cho value đã chọn khi item chưa nằm trong trang đã tải (autofill edit). */
  selectedOptions?: DefaultOptionType[];
}

/**
 * Selectbox dùng chung cho toàn hệ thống.
 *
 * - `name`  → gọi API danh mục theo nguồn đã khai (SELECT_SOURCES), tự xử lý
 *   search (debounce) + scroll nạp thêm trang; lazy (chỉ fetch khi mở dropdown).
 * - `options` → dùng danh sách tĩnh (enum), search client-side.
 *
 * Các prop AntD `Select` (value, onChange, defaultValue, disabled, status,
 * mode, allowClear, placeholder...) truyền thẳng như bình thường.
 */
export function SelectInputCustom({
  name,
  options,
  extraParams,
  pageKey = "Page",
  pageSizeKey = "PageSize",
  searchKey = "Keyword",
  pageSize = 20,
  selectedOptions,
  notFoundContent,
  ...rest
}: SelectInputCustomProps) {
  const [open, setOpen] = useState(false);
  const source = name ? SELECT_SOURCES[name] : undefined;
  const isStatic = !source;

  // Serialize để dùng làm dep/queryKey ổn định khi consumer không memo extraParams.
  const paramsKey = useMemo(() => JSON.stringify(extraParams ?? {}), [extraParams]);

  const fetchPage = useCallback(
    ({ page, pageSize: size, keyword }: { page: number; pageSize: number; keyword: string }) =>
      httpService
        .get<unknown>(source?.url ?? "", {
          ...(extraParams ?? {}),
          [pageKey]: page,
          [pageSizeKey]: size,
          [searchKey]: keyword,
        })
        .then((res) => source!.normalize(res)),
    // paramsKey đại diện cho extraParams (đã serialize) nên eslint-safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, pageKey, pageSizeKey, searchKey, paramsKey],
  );

  const infinite = useInfiniteOptions<ISelectOption, SelectValue>({
    queryKey: ["select-input-custom", name ?? "", paramsKey],
    fetchPage,
    getOptionValue: (item) => item.value,
    getOptionLabel: (item) => item.label,
    pageSize,
    enabled: !isStatic && open,
    selectedOptions,
  });

  // Lọc client theo label (không dấu). Giữ các row không phải chuỗi (spinner) hiển thị.
  const filterByLabel: SelectProps["filterOption"] = (input, option) => {
    if (typeof option?.label !== "string") return true;
    return foldText(option.label).includes(foldText(input));
  };

  // Chế độ options tĩnh: Select thuần, search lọc client-side theo label.
  if (isStatic) {
    return (
      <Select
        {...rest}
        options={options}
        showSearch
        allowClear
        filterOption={filterByLabel}
        notFoundContent={notFoundContent}
      />
    );
  }

  // Còn trang kế → chèn 1 row spinner cuối list (nằm trong list nên cuộn cùng,
  // không để khoảng trắng; item mới chèn trước nó nên panel không nhảy chiều cao).
  const mergedOptions: DefaultOptionType[] = [
    ...infinite.options,
    ...(infinite.hasNextPage
      ? [
          {
            value: LOAD_MORE_SENTINEL,
            disabled: true,
            label: (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spin size="small" />
              </div>
            ),
          } as DefaultOptionType,
        ]
      : []),
  ];

  return (
    <Select
      {...rest}
      options={mergedOptions}
      showSearch
      allowClear
      // Nguồn API tự lọc theo Keyword phía BE nên tắt lọc client (tránh gõ là
      // lọc client trước rồi API trả về set lại data gây nhấp nháy).
      filterOption={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) infinite.onSearch("");
      }}
      onSearch={infinite.onSearch}
      onPopupScroll={infinite.onPopupScroll}
      loading={infinite.loading}
      notFoundContent={infinite.loading ? <Spin size="small" /> : notFoundContent}
    />
  );
}
