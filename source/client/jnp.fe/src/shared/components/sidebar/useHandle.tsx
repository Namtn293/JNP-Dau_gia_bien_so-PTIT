import { useNavigate } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Popover, Tooltip } from "antd";
import { PopoverMenuWrapper } from "./styled";
import type { AppMenuItem } from "./types";
import { routeMatchesItem, findAppMenuParentsById, normalizeRoute } from "@/shared/utils/getMenuAdmin";

export const useHandle = () => {
  const navigate = useNavigate();
  const navigateTo = (key: string, menuId?: number) => {
    const keyParts = key.split("?")[0]; // Remove query params if any
    const search = key.split("?")[1] || "";
    const params = Object.fromEntries(new URLSearchParams(search));

    window.dispatchEvent(new CustomEvent("SIDEBAR_MENU_CLICK", { detail: keyParts }));

    if (key.startsWith("/quan-ly-tich-hop/quan-ly-diem-ket-noi/")) {
      const ma = key.split("/").pop();

      if (ma && ma !== "undefined") {
        navigate({
          to: key,
          params: { ma },
        });
        return;
      }
    }

    // Màn Quản lý dự án cần menuId trên URL để sidebar active đúng và mang sang trang con
    if (keyParts.includes("/quan-ly-du-an") && menuId !== undefined) {
      navigate({
        to: keyParts as any,
        search: { ...params, menuId } as any,
      });
      return;
    }
    navigate({
      to: keyParts as any,
      search: params as any,
    });
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigateTo(e.key, (e.item as any).props.menuId);
  };
  const findParents = (
    items: AppMenuItem[] | undefined,
    path: string,
    parents: string[] = [],
  ): string[] | null => {
    if (!items) return null;

    // 1. Bắt buộc tìm bằng ID trước nếu có menuId trên URL
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const menuIdStr = urlParams.get("menuId");
    if (menuIdStr) {
      const menuId = parseInt(menuIdStr, 10);
      const matchedParents = findAppMenuParentsById(items, menuId, parents);
      if (matchedParents) return matchedParents;
    }

    // 2. Fallback tìm theo đường dẫn
    const normalizedPath = normalizeRoute(path);
    for (const item of items) {
      if (!item) continue;
      if (routeMatchesItem(item.key, normalizedPath))
        return [...parents, item.key];

      if (item.children && item.children.length > 0) {
        const result = findParents(item.children, path, [...parents, item.key]);
        if (result) return result;
      }
    }
    return null;
  };

  // Render submenu nhiều cấp bằng đệ quy , Tự động tăng padding theo depth và xử lý item có/không có children.
  const renderSubmenuItems = (items?: AppMenuItem[], depth: number = 1) => {
    return items?.map((item) => {
      if (!item) return null;

      if (item.children?.length) {
        return (
          <div key={item.key} className="my-popover-header">
            <div className="popover-header" style={{ paddingLeft: `${depth * 16 + 16}px` }}>
              {item.icon} {item.label}
            </div>
            <div className="my-submenu">
              {renderSubmenuItems(item.children, depth + 1)}
            </div>
          </div>
        );
      }

      return (
        <div
          key={item.key}
          onClick={() => navigateTo(item.key)}
          className="popover-submenu-item"
          style={{ paddingLeft: `${depth * 16 + 20}px` }}
        >
          {item.icon} {item.label}
        </div>
      );
    });
  };

  const createPopoverContent = (children?: AppMenuItem[]) => (
    <PopoverMenuWrapper>
      {children?.map(
        (child) =>
          child && (
            <div key={child.key}>
              {child.children?.length ? (
                <div className="my-popover-header">
                  <div className="popover-header">
                    {child.icon} {child.label}
                  </div>

                  <div className="my-submenu">

                    {/* {child.children.map((grandChild) => (
                      <div
                        key={grandChild.key}
                        onClick={() => navigateTo(grandChild.key)}
                        className="popover-submenu-item"
                      >
                        {grandChild.label}
                      </div>
                    ))} */}

                    {/* Render submenu nhiều cấp bằng đệ quy , Tự động tăng padding theo depth và xử lý item có/không có children. */}
                    {renderSubmenuItems(child.children)}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => navigateTo(child.key)}
                  className="popover-item"
                >
                  {child.icon} {child.label}
                </div>
              )}
            </div>
          ),
      )}
    </PopoverMenuWrapper>
  );

  const renderCollapsedMenuItem = (item: AppMenuItem) => {
    if (item.children?.length) {
      return (
        <Popover
          key={item.key}
          content={createPopoverContent(item.children)}
          trigger="hover"
          placement="rightTop"
        >
          <div className="collapsed-menu-item">{item.icon}</div>
        </Popover>
      );
    }

    return (
      <Tooltip key={item.key} title={item.label} placement="right">
        <div
          className="collapsed-menu-item"
          onClick={() => navigateTo(item.key)}
        >
          {item.icon}
        </div>
      </Tooltip>
    );
  };

  return {
    navigateTo,
    findParents,
    handleMenuClick,
    createPopoverContent,
    renderCollapsedMenuItem,
  };
};
export default useHandle;
