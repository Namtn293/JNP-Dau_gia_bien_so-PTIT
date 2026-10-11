import { useMutation, useQueryClient } from 'react-query';
import {
  danhDauDaXem,
  danhDauTatCaDaXem,
  xoaThongBao,
} from './api';

const invalidateNotificationQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  options: { includeUnreadCount?: boolean } = {},
) => {
  const { includeUnreadCount = true } = options;

  queryClient.invalidateQueries({ queryKey: ['notifications'] });
  queryClient.invalidateQueries({ queryKey: ['admin_notifications_page'] });
  queryClient.invalidateQueries({ queryKey: ['admin_notifications_unread_total'] });

  if (includeUnreadCount) {
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
  }
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => danhDauDaXem(id),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: danhDauTatCaDaXem,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
};

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => xoaThongBao(ids),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
};


