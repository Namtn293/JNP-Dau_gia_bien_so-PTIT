import type { UseQueryOptions, UseQueryResult } from "react-query";
import { useQuery } from "react-query";

import {
  getMenuUser,
  getUserInfo,
  getDsQuyenUser,
  getCountryPhoneCodes,
} from "@/shared/services/api";
import type { IUser, MenuItem } from "@/shared/services/type";
import type { IQueryParams } from "@/shared/types";

/**
 * @query
 * @description Lấy thông tin người dùng
 */
export const useGetUserInfo = ({
  options,
}: IQueryParams = {}): UseQueryResult<IUser> => {
  const _options: UseQueryOptions<IUser, any, any> = {
    queryKey: "getUserInfo",
    queryFn: getUserInfo,
    ...options,
  };
  return useQuery(_options);
};
// lấy menu app
export const useMenuUser = ({ options }: IQueryParams = {}): UseQueryResult<
  MenuItem[]
> => {
  const _options: UseQueryOptions<MenuItem[], any, any> = {
    queryKey: ["menuUser"],
    queryFn: getMenuUser,
    ...options,
  };
  return useQuery(_options);
};

export const quyenUserQueryKey = "quyen-user";
export const useQuyenUserQuery = ({ options }: any) => {
  const queryKey = [quyenUserQueryKey];
  const _options: UseQueryOptions<any, any, any> = {
    queryKey: queryKey,
    queryFn: getDsQuyenUser,
    enabled: !!queryKey,
    ...options,
  };
  return useQuery(_options);
};

export const useCountryPhoneCodes = () => {
  return useQuery({
    queryKey: ["country-phone-codes"],
    queryFn: getCountryPhoneCodes,
    select: (response: any) => {
      const data = response?.data || {};
      return Object.entries(data).map(([country, code]: [string, any]) => ({
        label: `+ ${code} - ${country}`,
        selectedLabel: `(+${code}) ${country}`,
        value: `+${code}`,
        key: `${code}-${country}`,
        country,
        code: String(code),
      }));
    },
  });
};
