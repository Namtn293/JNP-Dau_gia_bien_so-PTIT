import { findExactRoute } from "@/shared/utils/getMenuAdmin";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useLocation } from "@tanstack/react-router";
import { Button, Menu, Tooltip, type MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { SidebarWrapper } from "./styled";
import type { AppMenuItem, SidebarProps } from "./types";
import useHandle from "./useHandle";

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  menuItems,
  title = "",
}) => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { findParents, handleMenuClick, renderCollapsedMenuItem } = useHandle();

  // Helper to find all sibling keys of a target key in the menuItems tree
  const getSiblings = (
    items: AppMenuItem[] | undefined,
    targetKey: string,
  ): string[] => {
    if (!items) return [];
    for (const item of items) {
      if (item.children?.some((child) => child.key === targetKey)) {
        return item.children
          .map((child) => child.key)
          .filter((k) => k !== targetKey);
      }
      const siblingSub = getSiblings(item.children, targetKey);
      if (siblingSub.length > 0) return siblingSub;
    }
    if (items.some((item) => item.key === targetKey)) {
      return items.map((item) => item.key).filter((k) => k !== targetKey);
    }
    return [];
  };

  // Handle Accordion Logic: Only allow one submenu to be open at a time
  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

    if (!latestOpenKey) {
      setOpenKeys(keys);
      return;
    }

    const siblings = getSiblings(menuItems, latestOpenKey);
    const nextOpenKeys = keys.filter((key) => !siblings.includes(key));
    setOpenKeys(nextOpenKeys);
  };

  useEffect(() => {
    let currentPath = location.href;
    const searchObj = location.search as any;
    if (searchObj && searchObj.returnUrl) {
      currentPath = searchObj.returnUrl;
    }

    const parentKeys = findParents(menuItems, currentPath) || [];
    const exactRoute = findExactRoute(menuItems, currentPath);
    if (exactRoute) {
      setSelectedKeys(exactRoute.key ? [exactRoute.key] : []);
      if (parentKeys?.length > 0) {
        setOpenKeys(parentKeys);
      }
      return;
    }

    // Fallback if no exact route found (optional based on your logic)
    if (parentKeys.length > 0) {
      setSelectedKeys(parentKeys);
      setOpenKeys(parentKeys.slice(0, -1));
    }
  }, [location.pathname, location.searchStr, menuItems]);
  return (
    <SidebarWrapper collapsed={collapsed}>
      <div className="sidebar-header">
        <Button
          type="text"
          icon={
            collapsed ? (
              <MenuUnfoldOutlined style={{ color: "var(--primary)" }} />
            ) : (
              <MenuFoldOutlined style={{ color: "var(--primary)" }} />
            )
          }
          onClick={onToggle}
          className="collapse-btn"
        />
        {!collapsed && (
          <Tooltip title={title}>
            <div className="sidebar-header-title">{title}</div>
          </Tooltip>
        )}
      </div>

      {collapsed ? (
        <div className="collapsed-icons">
          {menuItems?.map(renderCollapsedMenuItem)}
        </div>
      ) : (
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems as any}
          inlineIndent={8} // khoảng cách lề trái của menu
          onClick={(e) => handleMenuClick(e as any)}
          className="sidebar-menu"
        />
      )}
    </SidebarWrapper>
  );
};
export default Sidebar;
