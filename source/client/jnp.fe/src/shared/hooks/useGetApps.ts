import { useEffect, useMemo } from "react";

import { lcStorage } from "@/shared/utils";
import QTBV from "@assets/images/APP_QLBV.png";
import QTHT from "@assets/images/APP_QTHT.png";
import XLHS from "@assets/images/APP_XLHS.png";
import { LOCAL_STORAGE_KEYS } from "@constants/storageKeys";
import { useMenuUser } from "@shared/services/query";
import type { MenuAppItem, MenuItem } from "@shared/services/type";
import { useNavigate } from "@tanstack/react-router";

const APP_LOGO_MAP: Record<string, string> = {
  DVC: XLHS,
  QTHT: QTHT,
  QLTT: QTBV,
};

// const APP_PATH_MAP: Record<string, string> = {
//   DVC: DANH_SACH_CHO_BO_SUNG_ROUTE,
//   QTHT: NHOM_THU_TUC_HANH_CHINH_ROUTE,
//   QLTT: BAI_VIET_SOAN_THAO_ROUTE,
// };

const isRootMenu = (item: MenuItem) => {
  return (
    item.idCha === null ||
    item.idCha === undefined ||
    item.capdo === 0 ||
    item.capdo === 1
  );
};
const isValidPath = (path?: string | null) => !!path && path.trim() !== "";

const findFirstValidPath = (item?: MenuItem): { path: string; menuId: number } => {
  if (!item) return { path: "", menuId: 0 };

  if (isValidPath(item.duongDanTrucTiep) && item.coTheTruyCap) {
    return { path: item.duongDanTrucTiep!.trim(), menuId: item.id };
  }

  if (item.capCon && item.capCon.length > 0) {
    for (const child of item.capCon) {
      const result = findFirstValidPath(child); 
      if (result.path) return result; 
    }
  }

  return { path: "", menuId: 0 };
};

const mapMenuToApps = (menus: MenuItem[]): MenuAppItem[] => {
  return (menus || [])
    .filter(isRootMenu)
    .map((item, index) => {
      const firstValid = findFirstValidPath(item);
      return {
        menuId: firstValid.menuId,
        maUD: item.ma,
        tenUD: item.ten,
        path: firstValid.path,
        imageSrc: item?.bieuTuong ? `${import.meta.env.VITE_RESOURCE_URL}${item?.bieuTuong}` : APP_LOGO_MAP[item.ma] || XLHS,
        pos: item.thuTuHienThi ?? index,
        disabled: !item.coTheTruyCap || !firstValid.path
      };
    })
    .sort((a, b) => a.pos - b.pos);
};

export const useGetApps = () => {
  const navigate = useNavigate();
  const navigateTo = (key: string, menuId?: number) => {
  const keyParts = key.split('?')[0]; 
  const search = key.split("?")[1] || "";
  const params =  Object.fromEntries(new URLSearchParams(search));
  if (key.startsWith('/quan-ly-tich-hop/quan-ly-diem-ket-noi/')) {
    const ma = key.split('/').pop();

    if (ma && ma !== 'undefined') {
      navigate({
        to: key,
        params: { ma },
      });
      return;
    }
  }
  if (key.startsWith('/sau-tiep-nhan/')) {
    const status = keyParts.split('/').pop();
    if (status && status !== 'undefined') {
      navigate({
        to: keyParts,
        params: { status },
        search: {...params, menuId: menuId}
      });
      return;
    }
  }
  navigate({ 
    to: keyParts as any , search: params as any
  });
};

  const { data: fetchedMenu, isLoading } = useMenuUser();
  useEffect(() => {
    if (fetchedMenu?.length) {
      lcStorage.set(LOCAL_STORAGE_KEYS.menu, fetchedMenu);
    }
  }, [fetchedMenu]);

  const menuData = fetchedMenu?.length ? fetchedMenu : [];

  const apps: MenuAppItem[] = useMemo(
    () => mapMenuToApps(menuData || []),
    [menuData]
  );  
  return { apps, isLoading, navigateTo };
};
export default useGetApps;
