import type { Dispatch, SetStateAction } from "react";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

import {
  layTatCaThongBao,
} from "@/apps/admin/components/header/thong-bao/services/api";
import type { Notification } from "@/apps/admin/components/header/thong-bao/services/type";
import tokenManager from "@/shared/utils/tokenManager";

export type NotificationDateRange = [Dayjs | null, Dayjs | null] | null;
export type NotificationReadFilter = "all" | "unread";
export type NotificationNghiepVu = "QLVB" | "CNHS" | "PAKN" | "XLHS";
export type NotificationQueryParams = Record<string, string | number | boolean>;
export type StateSetter<T> = Dispatch<SetStateAction<T>>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 / trang" },
  { value: 20, label: "20 / trang" },
  { value: 50, label: "50 / trang" },
];

const NGHIEP_VU_OPTIONS: Array<{ label: string; value: NotificationNghiepVu }> = [
  { value: "QLVB", label: "Quản lý văn bản" },
  { value: "CNHS", label: "Tiếp nhận hồ sơ" },
  { value: "PAKN", label: "Phản ánh kiến nghị" },
  { value: "XLHS", label: "Xử lý hồ sơ" },
];

const NGHIEP_VU_LABEL_MAP: Record<NotificationNghiepVu, string> = {
  QLVB: "Quản lý văn bản",
  CNHS: "Tiếp nhận hồ sơ",
  PAKN: "Phản ánh kiến nghị",
  XLHS: "Xử lý hồ sơ",
};

const hasDateRangeValue = (filterDateRange: NotificationDateRange) => {
  return Boolean(filterDateRange && (filterDateRange[0] || filterDateRange[1]));
};

const buildQueryParams = ({
  currentPage,
  pageSize,
  readFilter,
  filterDateRange,
  filterQuarter,
  filterYear,
  filterKeyword,
  filterNghiepVu,
}: {
  currentPage: number;
  pageSize: number;
  readFilter: NotificationReadFilter;
  filterDateRange: NotificationDateRange;
  filterQuarter: Dayjs | null;
  filterYear: Dayjs | null;
  filterKeyword: string;
  filterNghiepVu?: NotificationNghiepVu;
}): NotificationQueryParams => {
  const params: NotificationQueryParams = {
    page: currentPage,
    pageSize,
  };

  if (readFilter === "unread") {
    params["query.DaXem"] = false;
  }

  const normalizedKeyword = filterKeyword.trim();
  if (normalizedKeyword) {
    params.Keyword = normalizedKeyword;
  }

  if (filterNghiepVu) {
    params["Query.NghiepVu"] = filterNghiepVu;
  }

  if (hasDateRangeValue(filterDateRange)) {
    if (filterDateRange?.[0]) {
      params["query.NgayTu"] = filterDateRange[0].format("YYYY-MM-DD");
    }

    if (filterDateRange?.[1]) {
      params["query.NgayDen"] = filterDateRange[1].format("YYYY-MM-DD");
    }
  } else if (filterQuarter) {
    params["query.Quy"] = Math.ceil((filterQuarter.month() + 1) / 3);
    params["query.Nam"] = filterQuarter.year();
  } else if (filterYear) {
    params["query.Nam"] = filterYear.year();
  }

  return params;
};

const getActiveFilterLabel = ({
  filterDateRange,
  filterQuarter,
  filterYear,
  filterKeyword,
  filterNghiepVu,
}: {
  filterDateRange: NotificationDateRange;
  filterQuarter: Dayjs | null;
  filterYear: Dayjs | null;
  filterKeyword: string;
  filterNghiepVu?: NotificationNghiepVu;
}) => {
  let timeFilterLabel = "Toàn bộ thời gian";

  if (hasDateRangeValue(filterDateRange)) {
    const fromDate = filterDateRange?.[0]?.format("DD/MM/YYYY");
    const toDate = filterDateRange?.[1]?.format("DD/MM/YYYY");

    if (fromDate && toDate) {
      timeFilterLabel = `Từ ${fromDate} đến ${toDate}`;
    } else if (fromDate) {
      timeFilterLabel = `Từ ngày ${fromDate}`;
    } else if (toDate) {
      timeFilterLabel = `Đến ngày ${toDate}`;
    }
  } else if (filterQuarter) {
    timeFilterLabel = `Quý ${Math.ceil((filterQuarter.month() + 1) / 3)} năm ${filterQuarter.year()}`;
  } else if (filterYear) {
    timeFilterLabel = `Năm ${filterYear.year()}`;
  }

  const activeLabels: string[] = [];

  if (timeFilterLabel !== "Toàn bộ thời gian" || (!filterKeyword.trim() && !filterNghiepVu)) {
    activeLabels.push(timeFilterLabel);
  }

  if (filterKeyword.trim()) {
    activeLabels.push(`Từ khóa: "${filterKeyword.trim()}"`);
  }

  if (filterNghiepVu) {
    activeLabels.push(`Nghiệp vụ: ${NGHIEP_VU_LABEL_MAP[filterNghiepVu]}`);
  }

  return activeLabels.join(" | ");
};

const getVisibleRange = ({
  currentPage,
  pageSize,
  totalItems,
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}) => {
  if (totalItems === 0) {
    return {
      visibleStart: 0,
      visibleEnd: 0,
    };
  }

  return {
    visibleStart: (currentPage - 1) * pageSize + 1,
    visibleEnd: Math.min(currentPage * pageSize, totalItems),
  };
};

export const useData = () => {
  const [filterDateRange, setFilterDateRange] = useState<NotificationDateRange>(null);
  const [filterQuarter, setFilterQuarter] = useState<Dayjs | null>(null);
  const [filterYear, setFilterYear] = useState<Dayjs | null>(null);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterNghiepVu, setFilterNghiepVu] = useState<NotificationNghiepVu | undefined>();
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>("all");
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE);
  }, [filterDateRange, filterKeyword, filterNghiepVu, filterQuarter, filterYear, readFilter]);

  const queryParams = useMemo(
    () =>
      buildQueryParams({
        currentPage,
        pageSize,
        readFilter,
        filterDateRange,
        filterQuarter,
        filterYear,
        filterKeyword,
        filterNghiepVu,
      }),
    [currentPage, filterDateRange, filterKeyword, filterNghiepVu, filterQuarter, filterYear, pageSize, readFilter]
  );

  const unreadQueryParams = useMemo(
    () =>
      buildQueryParams({
        currentPage: DEFAULT_PAGE,
        pageSize: 1,
        readFilter: "unread",
        filterDateRange,
        filterQuarter,
        filterYear,
        filterKeyword,
        filterNghiepVu,
      }),
    [filterDateRange, filterKeyword, filterNghiepVu, filterQuarter, filterYear]
  );

  const isAuth = Boolean(tokenManager.getAccessToken());

  const { data, isFetching } = useQuery(
    ["admin_notifications_page", queryParams],
    () => layTatCaThongBao(queryParams),
    {
      enabled: isAuth,
      keepPreviousData: true,
    }
  );

  const { data: unreadTotalData } = useQuery(
    ["admin_notifications_unread_total", unreadQueryParams],
    () => layTatCaThongBao(unreadQueryParams),
    {
      enabled: isAuth,
      keepPreviousData: true,
      select: (response) => response?.metaData?.total ?? 0,
    }
  );

  const displayedList: Notification[] = data?.data ?? [];
  const totalItems = data?.metaData?.total ?? 0;
  const unreadCountOnPage = displayedList.filter((notification) => !notification.daXem).length;
  const unreadTotal = unreadTotalData ?? unreadCountOnPage;

  useEffect(() => {
    if (!isFetching && currentPage > DEFAULT_PAGE && displayedList.length === 0 && totalItems > 0) {
      setCurrentPage((prev) => Math.max(DEFAULT_PAGE, prev - 1));
    }
  }, [currentPage, displayedList.length, isFetching, totalItems]);

  const hasActiveFilters =
    hasDateRangeValue(filterDateRange) ||
    Boolean(filterQuarter) ||
    Boolean(filterYear) ||
    Boolean(filterKeyword.trim()) ||
    Boolean(filterNghiepVu);

  const activeFilterLabel = useMemo(
    () =>
      getActiveFilterLabel({
        filterDateRange,
        filterQuarter,
        filterYear,
        filterKeyword,
        filterNghiepVu,
      }),
    [filterDateRange, filterKeyword, filterNghiepVu, filterQuarter, filterYear]
  );

  const { visibleStart, visibleEnd } = useMemo(
    () =>
      getVisibleRange({
        currentPage,
        pageSize,
        totalItems,
      }),
    [currentPage, pageSize, totalItems]
  );

  return {
    activeFilterLabel,
    currentPage,
    displayedList,
    filterDateRange,
    filterKeyword,
    filterNghiepVu,
    filterQuarter,
    filterYear,
    hasActiveFilters,
    isFetching,
    nghiepVuOptions: NGHIEP_VU_OPTIONS,
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    readFilter,
    setCurrentPage,
    setFilterDateRange,
    setFilterKeyword,
    setFilterNghiepVu,
    setFilterQuarter,
    setFilterYear,
    setPageSize,
    setReadFilter,
    totalItems,
    unreadTotal,
    visibleEnd,
    visibleStart,
  };
};
