import { getUserInfo } from '@/apps/admin/services/api';
import type { Taikhoan } from '@/apps/admin/services/types';
import type { IResponse } from '@/shared/types/response.type';
import { useQuery, type UseQueryOptions, type UseQueryResult } from 'react-query';

export const USER_INFO_STORAGE_KEY = 'currentUserInfo';

const getCachedUserInfo = (): IResponse<Taikhoan> | undefined => {
    const cached = localStorage.getItem(USER_INFO_STORAGE_KEY);
    if (!cached) return undefined;

    try {
        return JSON.parse(cached);
    } catch {
        localStorage.removeItem(USER_INFO_STORAGE_KEY);
        return undefined;
    }
};

export const useUserInfo = (options?: UseQueryOptions<any, any, any>): UseQueryResult<IResponse<Taikhoan>> => {
    const queryKey = ['currentUserInfo'];
    const _options: UseQueryOptions<any, any, any> = {
        queryKey: queryKey,
        queryFn: async () => {
            const cachedUserInfo = getCachedUserInfo();
            if (cachedUserInfo) return cachedUserInfo;

            const userInfo = await getUserInfo();
            localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(userInfo));

            return userInfo;
        },
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        ...options,
    };
    
    return useQuery(_options);
};
