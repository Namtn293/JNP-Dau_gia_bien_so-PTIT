import { useAction } from "./useAction";
import { useData } from "./useData";

export const useThongBaoPage = () => {
  const {
    setCurrentPage,
    setFilterDateRange,
    setFilterKeyword,
    setFilterNghiepVu,
    setFilterQuarter,
    setFilterYear,
    setPageSize,
    setReadFilter,
    ...data
  } = useData();

  const actions = useAction({
    setCurrentPage,
    setFilterDateRange,
    setFilterKeyword,
    setFilterNghiepVu,
    setFilterQuarter,
    setFilterYear,
    setPageSize,
    setReadFilter,
  });

  return {
    ...data,
    ...actions,
  };
};

export { useAction } from "./useAction";
export { useData } from "./useData";
export type {
  NotificationDateRange,
  NotificationNghiepVu,
  NotificationQueryParams,
  NotificationReadFilter,
  StateSetter,
} from "./useData";
