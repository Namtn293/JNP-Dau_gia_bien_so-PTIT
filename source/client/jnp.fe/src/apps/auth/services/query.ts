import { useQuery } from 'react-query';
import type { UseQueryOptions, UseQueryResult } from 'react-query';
import type { IQueryParams } from '@shared/types';
import { getAccoungList } from './api';

export const useGetAccountList = ({options}:IQueryParams<any> = {}): UseQueryResult<any> => {
  const _options: UseQueryOptions<any, any, any> = {
    queryKey: 'getAccountList',
    queryFn: () => getAccoungList(),
    ...options
  }
  return useQuery(_options)
}
