import {
  DANH_MUC_BO_NGANH_ROUTE,
  DANH_MUC_CHUC_VU_ROUTE,
  DANH_MUC_CHUYEN_VIEN_KHU_KINH_TE_ROUTE,
  DANH_MUC_CHUYEN_VIEN_SO_KHDT_ROUTE,
  DANH_MUC_KHU_KINH_TE_ROUTE,
  DANH_MUC_PHONG_BAN_KHU_KINH_TE_ROUTE,
  DANH_MUC_PHONG_BAN_SO_KHDT_ROUTE,
  DANH_MUC_SO_KHDT_ROUTE,
  DANH_MUC_UY_BAN_NHAN_DAN_ROUTE,
} from "@/apps/quan-ly-danh-muc-du-lieu/constants";
import type { MenuItem } from "@/shared/services/type";

const DON_VI_CHILD_ROUTES = [
  DANH_MUC_BO_NGANH_ROUTE,
  DANH_MUC_KHU_KINH_TE_ROUTE,
  DANH_MUC_UY_BAN_NHAN_DAN_ROUTE,
  DANH_MUC_PHONG_BAN_KHU_KINH_TE_ROUTE,
  DANH_MUC_SO_KHDT_ROUTE,
  DANH_MUC_PHONG_BAN_SO_KHDT_ROUTE,
  DANH_MUC_CHUYEN_VIEN_KHU_KINH_TE_ROUTE,
  DANH_MUC_CHUYEN_VIEN_SO_KHDT_ROUTE,
];

const findNode = (
  items: MenuItem[],
  predicate: (item: MenuItem) => boolean,
  parent?: MenuItem
): { node: MenuItem; parent?: MenuItem } | null => {
  for (const item of items) {
    if (predicate(item)) return { node: item, parent };
    if (item.capCon?.length) {
      const found = findNode(item.capCon, predicate, item);
      if (found) return found;
    }
  }
  return null;
};

const findDonViGroup = (items: MenuItem[]): MenuItem | null => {
  for (const item of items) {
    if (item.capCon?.some((child) => DON_VI_CHILD_ROUTES.includes(child.duongDanTrucTiep))) {
      return item;
    }
    if (item.capCon?.length) {
      const found = findDonViGroup(item.capCon);
      if (found) return found;
    }
  }
  return null;
};

const removeNodeByReference = (items: MenuItem[], target: MenuItem): MenuItem[] => {
  return items
    .filter((item) => item !== target)
    .map((item) => ({
      ...item,
      capCon: item.capCon ? removeNodeByReference(item.capCon, target) : item.capCon,
    }));
};

export const normalizeMenuWithChucVu = (menu?: MenuItem[] | null): MenuItem[] => {
  if (!Array.isArray(menu)) return [];

  const clonedMenu: MenuItem[] = JSON.parse(JSON.stringify(menu));

  const donViGroup = findDonViGroup(clonedMenu);
  const chucVuNodeInfo = findNode(
    clonedMenu,
    (item) => item.duongDanTrucTiep === DANH_MUC_CHUC_VU_ROUTE
  );

  if (!donViGroup || !chucVuNodeInfo?.node) return clonedMenu;

  if (chucVuNodeInfo.parent && chucVuNodeInfo.parent.id === donViGroup.id) {
    return clonedMenu;
  }

  const chucVuNode = { ...chucVuNodeInfo.node, capCon: chucVuNodeInfo.node.capCon ?? [] };
  const cleanedMenu = removeNodeByReference(clonedMenu, chucVuNodeInfo.node);

  const donViGroupAfterClean = findDonViGroup(cleanedMenu);
  if (!donViGroupAfterClean) return clonedMenu;

  const alreadyHasChucVu = donViGroupAfterClean.capCon?.some(
    (child) => child.duongDanTrucTiep === DANH_MUC_CHUC_VU_ROUTE
  );
  if (alreadyHasChucVu) return cleanedMenu;

  const capCon = donViGroupAfterClean.capCon ?? [];
  const nextOrder =
    typeof chucVuNode.thuTuHienThi === "number"
      ? chucVuNode.thuTuHienThi
      : capCon.length + 1;

  const normalizedChucVu: MenuItem = {
    ...chucVuNode,
    idCha: donViGroupAfterClean.id ?? chucVuNode.idCha,
    capdo:
      typeof donViGroupAfterClean.capdo === "number"
        ? donViGroupAfterClean.capdo + 1
        : chucVuNode.capdo,
    thuTuHienThi: nextOrder,
    capCon: chucVuNode.capCon ?? [],
  };

  donViGroupAfterClean.capCon = [...capCon, normalizedChucVu];

  return cleanedMenu;
};

export default normalizeMenuWithChucVu;

