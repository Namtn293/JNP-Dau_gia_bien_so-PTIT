export interface AppMenuItem {
  key: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  children?: AppMenuItem[];
  level?: number;
  badge?: number;
  menuId?: number;
  disabled?: boolean
}
export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  menuItems?: AppMenuItem[];
  title?: string;
}
