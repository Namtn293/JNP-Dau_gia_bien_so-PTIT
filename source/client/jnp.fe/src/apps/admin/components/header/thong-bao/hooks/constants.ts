import type { NghiepVuRouteConfig } from './route-types';

export const NGHIEP_VU_ALIASES: Record<string, string> = {
  DAUGIA: 'DAU_GIA',
};

export const NGHIEP_VU_ROUTE_CONFIG: Record<string, NghiepVuRouteConfig> = {
  DAU_GIA: {
    routeBase: '/admin',
    loaiToRoutes: {
      DAU_GIA_MOI: 'quan-ly-dau-gia',
      DAU_GIA_THANH_CONG: 'ket-qua-dau-gia',
      DAU_GIA_HUY: 'quan-ly-dau-gia',
    },
  },
};
