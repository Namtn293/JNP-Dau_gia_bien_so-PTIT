import type { AppMenuItem } from "@/shared/components/sidebar/types";
import type { MenuItem } from "@/shared/services";

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Strip "/xem-chi-tiet" from a route while preserving the query string.
 * e.g. "/some-path/xem-chi-tiet?id=1" → "/some-path?id=1"
 */
export const normalizeRoute = (route: string): string => {
  const [pathPart, queryPart] = route.split("?");

  const detailMarkers = ["/xem-chi-tiet", "/chi-tiet"];
  const marker = detailMarkers.find((item) => pathPart.includes(item));
  if (!marker) return route;

  const basePath = pathPart.split(marker)[0];
  return queryPart ? `${basePath}?${queryPart}` : basePath;
};

/**
 * Returns true when a menu item's path matches the given route.
 * Supports partial matching: route contains duongDan.
 */
export const routeMatchesItem = (duongDan: string, route: string): boolean => {
  if (!duongDan) return false;

  const [duongDanPath, duongDanQuery] = duongDan.split("?");
  const [routePath, routeQuery] = route.split("?");

  const duongDanParams = new URLSearchParams(duongDanQuery || "");
  const routeParams = new URLSearchParams(routeQuery || "");

  // Compare 'mod' and 'subMod' parameters if present
  if (duongDanParams.get("mod") !== routeParams.get("mod")) {
    return false;
  }
  if (duongDanParams.get("subMod") !== routeParams.get("subMod")) {
    return false;
  }

  if (route.includes("type=exact")) return duongDan === route;
  return duongDan === route || route.includes(duongDan) || (routePath.startsWith(duongDanPath) && duongDanPath !== "/");
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const mapMenuItemToAppMenuItem = (item: MenuItem): AppMenuItem => {
  const isParent = Array.isArray(item.capCon) && item.capCon.length > 0;
  return {
    key: isParent ? `menu-${item.id}` : item.duongDanTrucTiep || `leaf-${item.id}`,
    label: <span className="menu-label">{item.ten}</span>,
    icon: item.bieuTuong ? (
      <img
        src={`${import.meta.env.VITE_RESOURCE_URL}${item.bieuTuong}`}
        width={24}
        height={24}
      />
    ) : undefined,
    level: item.capdo,
    menuId: item.id,
    children: isParent ? item.capCon.map(mapMenuItemToAppMenuItem) : undefined,
    disabled: !item.coTheTruyCap,
  };
};

export const sortMenuByThuTu = (items: MenuItem[]): MenuItem[] =>
  [...items]
    .sort((a, b) => a.thuTuHienThi - b.thuTuHienThi)
    .map((item) => ({
      ...item,
      capCon: item.capCon?.length ? sortMenuByThuTu(item.capCon) : item.capCon,
    }));

export const findMenuById = (items: MenuItem[], id: number): MenuItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.capCon?.length) {
      const found = findMenuById(item.capCon, id);
      if (found) return found;
    }
  }
  return null;
};

export const findRootMenuByRoute = (
  items: MenuItem[],
  route: string | string[],
): MenuItem | null => {
  const normalizedRoute = typeof route === "string" ? normalizeRoute(route) : route;
  
  let matched: MenuItem | null = null;

  // 1. Try to match by menuId first if present in query string
  if (typeof route === "string") {
    const urlParams = new URLSearchParams(route.split("?")[1] || "");
    const menuIdStr = urlParams.get("menuId");
    if (menuIdStr) {
      const menuId = parseInt(menuIdStr, 10);
      matched = findMenuById(items, menuId);
    }
  }

  // 2. If not found or no menuId, match by path
  if (!matched) {
    const findMatchedItem = (menuList: MenuItem[]): MenuItem | null => {
      for (const item of menuList) {
        const itemPath = !item.duongDanTrucTiep?.includes("type=exact")
          ? item.duongDanTrucTiep
          : item.duongDanTrucTiep?.split("?")[0];
        const isMatch = Array.isArray(normalizedRoute)
          ? normalizedRoute.some((r) => routeMatchesItem(itemPath, r))
          : routeMatchesItem(itemPath, normalizedRoute);

        if (isMatch) {
          return item;
        }

        if (item.capCon?.length) {
          const found = findMatchedItem(item.capCon);
          if (found) return found;
        }
      }
      return null;
    };
    matched = findMatchedItem(items);
  }

  if (!matched) return null;

  let rootId: number | null = null;
  if (matched.duongDan) {
    const ids = matched.duongDan.split("|").filter(Boolean);
    if (ids.length > 0) {
      rootId = parseInt(ids[0], 10);
    }
  } else {
    rootId = matched.id;
  }

  if (rootId !== null) {
    const rootItem = items.find((item) => item.id === rootId);
    if (rootItem) return rootItem;
  }

  // Fallback to searching the hierarchy
  for (const item of items) {
    if (item.id === matched.id) return item;
    if (item.capCon?.length) {
      const found = findRootMenuByRoute(item.capCon, route);
      if (found) return found;
    }
  }

  return null;
};

export const findExactMenuRoute = (items: MenuItem[], path: string): MenuItem | null => {
  for (const item of items) {
    const itemPath = item.duongDanTrucTiep?.split("?")[0];
    if (itemPath && (itemPath === path || path.includes(itemPath))) return item;

    if (item.capCon?.length) {
      const found = findExactMenuRoute(item.capCon, path);
      if (found) return found;
    }
  }
  return null;
};

export const findAppMenuById = (
  items: AppMenuItem[] | undefined,
  id: number,
): AppMenuItem | null => {
  if (!items) return null;
  for (const item of items) {
    if (item.menuId === id) return item;
    if (item.children?.length) {
      const found = findAppMenuById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findAppMenuParentsById = (
  items: AppMenuItem[] | undefined,
  id: number,
  parents: string[] = [],
): string[] | null => {
  if (!items) return null;
  for (const item of items) {
    if (item.menuId === id) {
      return [...parents, item.key];
    }
    if (item.children?.length) {
      const found = findAppMenuParentsById(item.children, id, [...parents, item.key]);
      if (found) return found;
    }
  }
  return null;
};

export const findExactRoute = (
  items: AppMenuItem[] | undefined,
  path: string,
): AppMenuItem | null => {
  if (!items) return null;

  // 1. Bắt buộc tìm bằng ID trước nếu có menuId trên URL
  const urlParams = new URLSearchParams(path.split("?")[1] || "");
  const menuIdStr = urlParams.get("menuId");
  if (menuIdStr) {
    const menuId = parseInt(menuIdStr, 10);
    const matched = findAppMenuById(items, menuId);
    if (matched) return matched;
  }

  // 2. Fallback tìm theo đường dẫn
  const normalizedPath = normalizeRoute(path);
  for (const item of items) {
    const isMatch = routeMatchesItem(item.key, normalizedPath);
    if (isMatch) return item;

    if (item.children?.length) {
      const found = findExactRoute(item.children, normalizedPath);
      if (found) return found;
    }
  }
  return null;
};
