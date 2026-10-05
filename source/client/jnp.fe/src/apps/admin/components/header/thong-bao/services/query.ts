import { useInfiniteQuery, useQuery } from "react-query";
import { demSoLuongThongBaoChuaXem, layTatCaThongBao } from "./api";
import type { NotificationResponse } from "./type";

interface GetNotificationsOptions {
  enabled?: boolean;
  refreshKey?: number;
}

// LAY TAT CA THONG BAO
export const useGetNotifications = (
  options?: GetNotificationsOptions,
  filterParams?: any,
) => {
  const { refreshKey = 0, ...queryOptions } = options || {};

  return useInfiniteQuery<NotificationResponse>({
    queryKey: ["notifications", filterParams, refreshKey],
    queryFn: ({ pageParam = 1 }) =>
      layTatCaThongBao({ page: pageParam, pageSize: 20, ...filterParams }),
    getNextPageParam: (lastPage) => {
      const { page, totalPage } = lastPage.metaData;
      return page < totalPage ? page + 1 : undefined;
    },
    ...queryOptions,
  });
};

// DEM SO LUONG THONG BAO CHUA XEM
export const useGetUnreadCount = () => {
  return useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: demSoLuongThongBaoChuaXem,
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
