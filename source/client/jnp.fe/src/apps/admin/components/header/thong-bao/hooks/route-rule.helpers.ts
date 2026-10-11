import type { RouteConfig, RouteMatcher } from './route-types';

const normalizeText = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const matchNotificationByKeywords =
  (...keywords: string[]): RouteMatcher =>
  (item) => {
    const haystack = normalizeText([item.tieuDe, item.noiDung, item.urlDieuHuong].filter(Boolean).join(' '));

    return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
  };

export const taoQuyTacChiTiet = (detailTemplate: string, overrides: Partial<RouteConfig> = {}): RouteConfig => ({
  detailTemplate,
  ...overrides,
});

export const taoQuyTacChiTietTheoMaTiepNhan = (
  detailTemplate: string,
  when?: RouteMatcher,
): RouteConfig => ({
  detailTemplate,
  resolver: 'ho_so_by_ma_tiep_nhan',
  when,
});
