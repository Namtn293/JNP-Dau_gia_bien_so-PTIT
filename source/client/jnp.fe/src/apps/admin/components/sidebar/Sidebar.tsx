import { lcStorage } from "@/shared/utils";
import { LOCAL_STORAGE_KEYS } from "@constants/storageKeys";
import BaseSidebar from "@shared/components/sidebar";
import type {
  AppMenuItem,
  SidebarProps,
} from "@shared/components/sidebar/types";
import type { MenuItem } from "@shared/services/type";
import { useLocation } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";

import {
  findRootMenuByRoute,
  mapMenuItemToAppMenuItem,
  sortMenuByThuTu,
} from "@/shared/utils/getMenuAdmin";

const Sidebar: React.FC<SidebarProps> = (props) => {
  const location = useLocation();
  const [menuVersion, setMenuVersion] = useState<number>(Date.now());

  useEffect(() => {
    const handleRefresh = (event: any) => {
      setMenuVersion(event.detail || Date.now());
    };

    window.addEventListener('SIDEBAR_REFRESH', handleRefresh);
    
    return () => {
      window.removeEventListener('SIDEBAR_REFRESH', handleRefresh);
    };
  }, []);

  const storedMenuRaw = lcStorage.get<MenuItem[]>(LOCAL_STORAGE_KEYS.menu) ?? [];

  const rootMenu = useMemo(() => {
    const matched = findRootMenuByRoute(storedMenuRaw, location.pathname);
    if (matched) return matched;

    // Fallback cho các trang Kho tri thức được thêm thủ công
    if (location.pathname.startsWith('/kho-tri-thuc')) {
      return storedMenuRaw.find(item => 
        item.duongDanTrucTiep?.includes('/kho-tri-thuc') ||
        item.capCon?.some(c => c.duongDanTrucTiep?.includes('/kho-tri-thuc'))
      ) || null;
    }
    return null;
  }, [storedMenuRaw, location.pathname, menuVersion]);
  
  const menuItems: AppMenuItem[] = useMemo(() => {
    const isKhoTriThuc = location.pathname.startsWith('/kho-tri-thuc') || 
                         rootMenu?.duongDanTrucTiep === '/kho-tri-thuc' || 
                         rootMenu?.capCon?.some(c => c.duongDanTrucTiep?.startsWith('/kho-tri-thuc'));

    if (!rootMenu?.capCon) {
      if (isKhoTriThuc) {
        return [
          {
            key: "/kho-tri-thuc/quan-ly-nguon-du-lieu",
            label: <span className="menu-label">Quản lý nguồn dữ liệu</span>,
            level: 2,
            menuId: 99991,
            disabled: false,
          },
              {
            key: "/kho-tri-thuc/quan-ly-tri-thuc",
            label: <span className="menu-label">Quản lý tri thức</span>,
            level: 2,
            menuId: 99993,
            disabled: false,
          },
          {
            key: "/kho-tri-thuc/quan-ly-nhan",
            label: <span className="menu-label">Quản lý nhãn</span>,
            level: 2,
            menuId: 99994,
            disabled: false,
          },
          {
            key: "/kho-tri-thuc/quan-ly-canh-bao",
            label: <span className="menu-label">Quản lý cảnh báo</span>,
            level: 2,
            menuId: 99992,
            disabled: false,
          }
        ];
      }
      return [];
    }

    const sortedMenu = sortMenuByThuTu(rootMenu.capCon);
    
    const mappedItems = sortedMenu.map(mapMenuItemToAppMenuItem) ?? [];

    
     if (isKhoTriThuc) {
      const hasNguonDuLieu = mappedItems.some(item => item.key === "/kho-tri-thuc/quan-ly-nguon-du-lieu");
      const hasTriThuc = mappedItems.some(item => item.key === "/kho-tri-thuc/quan-ly-tri-thuc");
      const hasNhan = mappedItems.some(item => item.key === "/kho-tri-thuc/quan-ly-nhan");
      const hasCanhBao = mappedItems.some(item => item.key === "/kho-tri-thuc/quan-ly-canh-bao");

      const customItems: AppMenuItem[] = [];
      if (!hasNguonDuLieu) {
        customItems.push({
          key: "/kho-tri-thuc/quan-ly-nguon-du-lieu",
          label: <span className="menu-label">Quản lý nguồn dữ liệu</span>,
          level: 2,
          menuId: 99991,
          disabled: false,
        });
      }
      if (!hasTriThuc) {
        customItems.push({
          key: "/kho-tri-thuc/quan-ly-tri-thuc",
          label: <span className="menu-label">Quản lý tri thức</span>,
          level: 2,
          menuId: 99993,
          disabled: false,
        });
      }
      if (!hasNhan) {
        customItems.push({
          key: "/kho-tri-thuc/quan-ly-nhan",
          label: <span className="menu-label">Quản lý nhãn</span>,
          level: 2,
          menuId: 99994,
          disabled: false,
        });
      }
      if (!hasCanhBao) {
        customItems.push({
          key: "/kho-tri-thuc/quan-ly-canh-bao",
          label: <span className="menu-label">Quản lý cảnh báo</span>,
          level: 2,
          menuId: 99992,
          disabled: false,
        });
      }
      mappedItems.push(...customItems);
    }

    const appendCacheBuster = (items: AppMenuItem[]): AppMenuItem[] => {
      return items.map(item => {
      
        const newItem = { ...item };

      
        if (newItem.icon && typeof newItem.icon === 'string' && (newItem.icon.includes('/') || newItem.icon.startsWith('http'))) {
         
             const separator = newItem.icon.includes('?') ? '&' : '?';
             newItem.icon = `${newItem.icon}${separator}t=${menuVersion}`;
        }

      
        if (newItem.children && newItem.children.length > 0) {
          newItem.children = appendCacheBuster(newItem.children);
        }
        
        return newItem;
      });
    };

    return appendCacheBuster(mappedItems);

  }, [rootMenu, menuVersion, location.pathname]); 

  const title = rootMenu?.ten || "Quản trị hệ thống";

  return <BaseSidebar {...props} menuItems={menuItems} title={title} />;
};

export default Sidebar;