import type { ReactNode } from "react";
import type { UseQueryOptions } from "react-query";
export * from "./common";

export interface IQueryParams<
  TParams = any,
  TOptions = UseQueryOptions<any, any, any>,
> {
  options?: TOptions;
  params?: TParams;
}

export interface IReactChildren {
  children: ReactNode;
}

export interface IIconProps {
  size?: number | number;
  color?: string;
  style?: object;
}

export interface IBaseFilter {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  orderBy?: 1 | -1;
}

export type TFilter = {
  Query?: object;
  Keyword?: string;
} & IBaseFilter;
