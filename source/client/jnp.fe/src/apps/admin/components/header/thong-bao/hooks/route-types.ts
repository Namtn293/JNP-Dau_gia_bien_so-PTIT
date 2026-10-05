import type { Notification } from '../services/type';

export type RouteResolver = 'ho_so_by_ma_tiep_nhan';
export type RouteMatcher = (item: Notification) => boolean;

export interface RouteConfig {
  template?: string;
  detailTemplate?: string;
  listTemplate?: string;
  status?: string;
  resolver?: RouteResolver;
  when?: RouteMatcher;
}

export type RouteDefinition = string | RouteConfig;

export interface NghiepVuRouteConfig {
  routeBase?: string;
  loaiToRoutes: Record<string, RouteDefinition | RouteDefinition[]>;
}

export interface NavigateParams {
  routePath: string;
  params: Record<string, string>;
}

export interface NormalizedRouteConfig {
  when?: RouteMatcher;
  status?: string;
  detailTemplate?: string;
  listTemplate?: string;
  resolver?: RouteResolver;
}

export type ResolvableRouteConfig = NormalizedRouteConfig & {
  detailTemplate: string;
  resolver: RouteResolver;
};
