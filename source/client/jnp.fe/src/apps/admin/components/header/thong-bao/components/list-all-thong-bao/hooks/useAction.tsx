import type { Dayjs } from "dayjs";
import { message } from "antd";
import { useNavigate } from "@tanstack/react-router";

import {
  coTheDieuHuongThongBao,
  giaiThamSoDieuHuong,
} from "@/apps/admin/components/header/thong-bao/hooks/utils";
import {
  useDeleteNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/apps/admin/components/header/thong-bao/services/mutation";
import type { Notification } from "@/apps/admin/components/header/thong-bao/services/type";
import useNotification from "@/shared/hooks/useNotification";

import type {
  NotificationDateRange,
  NotificationNghiepVu,
  NotificationReadFilter,
  StateSetter,
} from "./useData";

interface UseActionProps {
  setCurrentPage: StateSetter<number>;
  setFilterDateRange: StateSetter<NotificationDateRange>;
  setFilterKeyword: StateSetter<string>;
  setFilterNghiepVu: StateSetter<NotificationNghiepVu | undefined>;
  setFilterQuarter: StateSetter<Dayjs | null>;
  setFilterYear: StateSetter<Dayjs | null>;
  setPageSize: StateSetter<number>;
  setReadFilter: StateSetter<NotificationReadFilter>;
}

export const useAction = ({
  setCurrentPage,
  setFilterDateRange,
  setFilterKeyword,
  setFilterNghiepVu,
  setFilterQuarter,
  setFilterYear,
  setPageSize,
  setReadFilter,
}: UseActionProps) => {
  const navigate = useNavigate();
  const { showSuccessNotify } = useNotification();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isLoading: isMarkingAll } = useMarkAllAsRead();
  const { mutateAsync: deleteNotifications, isLoading: isDeletingNotification } = useDeleteNotifications();

  const handleDateRangeChange = (value: NotificationDateRange) => {
    setFilterDateRange(value);
    setFilterQuarter(null);
    setFilterYear(null);
  };

  const handleQuarterChange = (value: Dayjs | null) => {
    setFilterQuarter(value);
    setFilterDateRange(null);
    setFilterYear(null);
  };

  const handleYearChange = (value: Dayjs | null) => {
    setFilterYear(value);
    setFilterDateRange(null);
    setFilterQuarter(null);
  };

  const handleReadFilterChange = (value: NotificationReadFilter) => {
    setReadFilter(value);
  };

  const handleKeywordChange = (value: string) => {
    setFilterKeyword(value);
  };

  const handleNghiepVuChange = (value?: NotificationNghiepVu) => {
    setFilterNghiepVu(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterDateRange(null);
    setFilterKeyword("");
    setFilterNghiepVu(undefined);
    setFilterQuarter(null);
    setFilterYear(null);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotifications = async (ids: number[]) => {
    await deleteNotifications(ids);
    showSuccessNotify(
      ids.length > 1 ? `Xóa ${ids.length} thông báo thành công` : "Xóa thông báo thành công"
    );
  };

  const handleClickCard = async (notification: Notification) => {
    if (!notification.daXem) {
      markAsRead(notification.id);
    }

    try {
      const shouldNavigate = coTheDieuHuongThongBao(notification);
      const navParams = shouldNavigate ? await giaiThamSoDieuHuong(notification) : null;

      if (navParams) {
        navigate({
          to: navParams.routePath as never,
          params: navParams.params as never,
        });
        return;
      }

      if (shouldNavigate) {
        message.warning("Thông báo này chưa có dữ liệu điều hướng phù hợp.");
      }
    } catch {
      // Axios interceptor already handles API errors.
    }
  };

  return {
    clearFilters,
    handleClickCard,
    handleDateRangeChange,
    handleDeleteNotifications,
    handleKeywordChange,
    handleMarkAllRead,
    handleNghiepVuChange,
    handlePageChange,
    handlePageSizeChange,
    handleQuarterChange,
    handleReadFilterChange,
    handleYearChange,
    isDeletingNotification,
    isMarkingAll,
  };
};
