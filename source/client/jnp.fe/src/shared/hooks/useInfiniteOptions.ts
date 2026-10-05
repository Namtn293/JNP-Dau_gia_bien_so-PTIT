import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "react-query";
import type { QueryKey } from "react-query";
import { throttle } from "lodash";
import type { DefaultOptionType } from "antd/es/select";
import { DEBOUNCE_TIME } from "@constants/index";

export interface InfinitePageParams {
  page: number;
  pageSize: number;
  keyword: string;
}

export interface InfinitePageResult<T> {
  items: T[];
  total: number;
}

export interface UseInfiniteOptionsParams<T, V> {
  /** Base query key — keyword được nối vào bên trong hook để cache theo từ khoá. */
  queryKey: QueryKey;
  /** Fetch 1 trang; trả về items + tổng số bản ghi để tính còn trang kế hay không. */
  fetchPage: (params: InfinitePageParams) => Promise<InfinitePageResult<T>>;
  getOptionValue: (item: T) => V;
  getOptionLabel: (item: T) => React.ReactNode;
  pageSize?: number;
  /** Cho phép lazy-fetch: chỉ bật khi mở dropdown/khi cần. */
  enabled?: boolean;
  /** Debounce cho search (ms). Mặc định DEBOUNCE_TIME. */
  debounceMs?: number;
  /** Throttle cho scroll (ms). Mặc định 300. */
  throttleMs?: number;
  /** Seed option cho value đã chọn nhưng chưa nằm trong trang đã tải (autofill). */
  selectedOptions?: DefaultOptionType[];
  /** Ngưỡng px tính là "gần đáy" để nạp trang kế. */
  scrollThreshold?: number;
}

export interface UseInfiniteOptionsResult<T, V> {
  options: DefaultOptionType[];
  itemsByValue: Map<V, T>;
  /** true khi đang tải lần đầu hoặc tải trang kế. */
  loading: boolean;
  /** true chỉ khi đang tải trang kế (đã có sẵn items) — dùng cho spinner cuối danh sách. */
  loadingMore: boolean;
  keyword: string;
  hasNextPage: boolean;
  onSearch: (keyword: string) => void;
  onPopupScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_THROTTLE = 300;
const DEFAULT_SCROLL_THRESHOLD = 24;

/**
 * Logic infinite-scroll dùng chung, không gắn UI — build trên react-query `useInfiniteQuery`
 * (cache/dedupe/accumulate chuẩn, an toàn StrictMode). Ngoài selectbox có thể tái sử dụng cho
 * list/table lazy-load: chỉ cần cung cấp `fetchPage` trả `{ items, total }`.
 *
 * - Search: gọi BE qua `keyword` (đã debounce) — reset về trang 1 nhờ đổi query key.
 * - Scroll: `onPopupScroll` đã throttle, chặn nạp trang chồng khi trang trước chưa xong.
 */
export function useInfiniteOptions<T, V = string | number>({
  queryKey,
  fetchPage,
  getOptionValue,
  getOptionLabel,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
  debounceMs = DEBOUNCE_TIME,
  throttleMs = DEFAULT_THROTTLE,
  selectedOptions,
  scrollThreshold = DEFAULT_SCROLL_THRESHOLD,
}: UseInfiniteOptionsParams<T, V>): UseInfiniteOptionsResult<T, V> {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setDebouncedKeyword(value), debounceMs);
    },
    [debounceMs],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const baseKey = useMemo(
    () => (Array.isArray(queryKey) ? queryKey : [queryKey]),
    [queryKey],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<InfinitePageResult<T>>({
    queryKey: [...baseKey, debouncedKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchPage({ page: pageParam as number, pageSize, keyword: debouncedKeyword }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const rawItems = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data],
  );

  const itemsByValue = useMemo(() => {
    const map = new Map<V, T>();
    rawItems.forEach((item) => map.set(getOptionValue(item), item));
    return map;
  }, [rawItems, getOptionValue]);

  const options = useMemo(() => {
    const seen = new Set<V>();
    const result: DefaultOptionType[] = [];
    // Seed các option đã chọn (autofill) trước, để hiển thị đúng nhãn dù chưa tải tới.
    (selectedOptions ?? []).forEach((opt) => {
      const v = opt.value as V;
      if (v != null && !seen.has(v)) {
        seen.add(v);
        result.push(opt);
      }
    });
    rawItems.forEach((item) => {
      const v = getOptionValue(item);
      if (!seen.has(v)) {
        seen.add(v);
        result.push({ label: getOptionLabel(item), value: v as DefaultOptionType["value"], title: '' });
      }
    });
    return result;
  }, [rawItems, selectedOptions, getOptionValue, getOptionLabel]);

  // Giữ refs để throttle function stable — tránh re-create instance mỗi khi fetch state đổi,
  // vì nếu đưa hasNextPage/isFetchingNextPage vào deps của useMemo thì bộ đếm throttle reset
  // mỗi lần fetch xong, làm vô hiệu hoá việc chặn scroll liên tục.
  const fetchStateRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  useEffect(() => {
    fetchStateRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
  });

  const loadMore = useMemo(
    () =>
      throttle(
        () => {
          const { hasNextPage: next, isFetchingNextPage: fetching, fetchNextPage: fetch } = fetchStateRef.current;
          if (next && !fetching) fetch();
        },
        throttleMs,
        { leading: true, trailing: true },
      ),
    [throttleMs],
  );

  useEffect(() => () => loadMore.cancel(), [loadMore]);

  const onPopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (!target) return;
      const nearBottom =
        target.scrollTop + target.offsetHeight >= target.scrollHeight - scrollThreshold;
      if (nearBottom) loadMore();
    },
    [loadMore, scrollThreshold],
  );

  return {
    options,
    itemsByValue,
    loading: isLoading || isFetchingNextPage,
    loadingMore: isFetchingNextPage,
    keyword,
    hasNextPage,
    onSearch,
    onPopupScroll,
  };
}
