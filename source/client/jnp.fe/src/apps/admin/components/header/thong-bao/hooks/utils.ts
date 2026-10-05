import { NGHIEP_VU_ALIASES, NGHIEP_VU_ROUTE_CONFIG } from './constants';
import { coTheGiaiBangResolver, giaiIdQuaResolver } from './route-resolvers';
import type {
  NavigateParams,
  NghiepVuRouteConfig,
  NormalizedRouteConfig,
  RouteDefinition,
} from './route-types';
import type { Notification } from '../services/type';

export type { NavigateParams } from './route-types';

const layNghiepVuTuLoai = (loai?: string): string | null => {
  if (!loai) return null;
  if (loai.startsWith('DAU_GIA_')) return 'DAU_GIA';
  return null;
};

const chuanHoaNghiepVuDieuHuong = (nghiepVu?: string | null): string | null => {
  if (!nghiepVu) return null;
  return NGHIEP_VU_ALIASES[nghiepVu] || nghiepVu;
};

export const layNghiepVuThongBao = (item: Notification): string | null => {
  return item.nghiepVu || layNghiepVuTuLoai(item.loai);
};

const layNghiepVuDieuHuong = (item: Notification): string | null => {
  return chuanHoaNghiepVuDieuHuong(item.nghiepVu) || layNghiepVuTuLoai(item.loai);
};

const layDanhSachQuyTac = (config: NghiepVuRouteConfig, loai: string): RouteDefinition[] => {
  const routeDefinition = config.loaiToRoutes[loai];
  if (!routeDefinition) return [];

  return Array.isArray(routeDefinition) ? routeDefinition : [routeDefinition];
};

const layCauHinhDieuHuong = (item: Notification) => {
  const nghiepVu = layNghiepVuDieuHuong(item);
  if (!nghiepVu) return null;

  const config = NGHIEP_VU_ROUTE_CONFIG[nghiepVu];
  if (!config) return null;

  const rules = layDanhSachQuyTac(config, item.loai);
  if (rules.length === 0) return null;

  return {
    config,
    rules,
  };
};

const taoThamSoDieuHuong = (
  routePath: string,
  params: Record<string, string | undefined>,
): NavigateParams => ({
  routePath,
  params: Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string>,
});

const chuanHoaQuyTacDieuHuong = (
  config: NghiepVuRouteConfig,
  routeDefinition: RouteDefinition,
): NormalizedRouteConfig => {
  if (typeof routeDefinition === 'string') {
    return {
      status: routeDefinition,
      listTemplate: config.routeBase ? `${config.routeBase}/$status` : undefined,
      detailTemplate: config.routeBase ? `${config.routeBase}/$status/xem-chi-tiet/$id` : undefined,
    };
  }

  return {
    when: routeDefinition.when,
    status: routeDefinition.status,
    detailTemplate: routeDefinition.detailTemplate || routeDefinition.template,
    listTemplate: routeDefinition.listTemplate,
    resolver: routeDefinition.resolver,
  };
};

const layIdDoiTuong = (value: Notification['idDoiTuongLienQuan']): string | null => {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
};

const layQuyTacDieuHuongChuanHoa = (item: Notification): NormalizedRouteConfig | null => {
  const routeConfig = layCauHinhDieuHuong(item);
  if (!routeConfig) return null;

  for (const routeDefinition of routeConfig.rules) {
    const normalizedRule = chuanHoaQuyTacDieuHuong(routeConfig.config, routeDefinition);

    if (!normalizedRule.when || normalizedRule.when(item)) {
      return normalizedRule;
    }
  }

  return null;
};

const taoDieuHuongChiTiet = (
  rule: NormalizedRouteConfig,
  id?: string | null,
): NavigateParams | null => {
  if (!id || !rule.detailTemplate) return null;

  return taoThamSoDieuHuong(rule.detailTemplate, {
    id,
    status: rule.status,
  });
};

const taoDieuHuongDanhSach = (rule: NormalizedRouteConfig): NavigateParams | null => {
  if (!rule.listTemplate || !rule.status) return null;

  return taoThamSoDieuHuong(rule.listTemplate, {
    status: rule.status,
  });
};

const layThamSoDieuHuongDongBo = (item: Notification): NavigateParams | null => {
  const normalizedRule = layQuyTacDieuHuongChuanHoa(item);
  if (!normalizedRule) return null;

  return (
    taoDieuHuongChiTiet(normalizedRule, layIdDoiTuong(item.idDoiTuongLienQuan)) ||
    taoDieuHuongDanhSach(normalizedRule)
  );
};

export const layThamSoDieuHuong = (item: Notification): NavigateParams | null => {
  return layThamSoDieuHuongDongBo(item);
};

export const coTheDieuHuongThongBao = (item: Notification): boolean => {
  if (layThamSoDieuHuongDongBo(item)) return true;

  return coTheGiaiBangResolver(item, layQuyTacDieuHuongChuanHoa(item));
};

export const giaiThamSoDieuHuong = async (item: Notification): Promise<NavigateParams | null> => {
  const directNavigateParams = layThamSoDieuHuongDongBo(item);
  if (directNavigateParams) return directNavigateParams;

  const normalizedRule = layQuyTacDieuHuongChuanHoa(item);
  const resolvedTargetId = await giaiIdQuaResolver(item, normalizedRule);
  if (!normalizedRule || !resolvedTargetId) return null;

  return taoDieuHuongChiTiet(normalizedRule, resolvedTargetId);
};
