import type { Notification } from '../services/type';
import type {
  NormalizedRouteConfig,
  ResolvableRouteConfig,
  RouteResolver,
} from './route-types';

interface RouteResolverHandler {
  canResolve: (item: Notification) => boolean;
  resolveTargetId: (item: Notification) => Promise<string | null>;
}

const ROUTE_RESOLVER_MAP: Record<RouteResolver, RouteResolverHandler> = {
  ho_so_by_ma_tiep_nhan: {
    canResolve: (item) => Boolean(item.urlDieuHuong?.trim()),
    resolveTargetId: async (item) => {
      const maHoSoTiepNhan = item.urlDieuHuong?.trim();
      if (!maHoSoTiepNhan) return null;

      return maHoSoTiepNhan ? String(maHoSoTiepNhan) : null;
    },
  },
};

export const coTheGiaiBangResolver = (
  item: Notification,
  rule: NormalizedRouteConfig | null,
): rule is ResolvableRouteConfig => {
  if (!rule?.resolver || !rule.detailTemplate) return false;

  const resolverHandler = ROUTE_RESOLVER_MAP[rule.resolver];
  return Boolean(resolverHandler && resolverHandler.canResolve(item));
};

export const giaiIdQuaResolver = async (
  item: Notification,
  rule: NormalizedRouteConfig | null,
): Promise<string | null> => {
  if (!coTheGiaiBangResolver(item, rule)) return null;

  return ROUTE_RESOLVER_MAP[rule.resolver].resolveTargetId(item);
};
