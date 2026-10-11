import React from "react";
import { Dropdown, type MenuProps } from "antd";
import {  UserOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { TopNav, NavInner, Brand, BrandText, UserTrigger } from "./styled";
import { ADMIN_LOGIN_ROUTE } from "@/constants";

interface TopNavbarProps {
  userName?: string;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  userName = "Trần Đức An",
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate({ to: ADMIN_LOGIN_ROUTE });
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <TopNav>
      <NavInner>
        <Brand onClick={() => navigate({ to: "/" })}>
          
          <BrandText>
            <h2>Sàn Đấu Giá Biển Số Xe</h2>
            <span>Hệ thống Đấu giá Biển số Trực tuyến</span>
          </BrandText>
        </Brand>

        <Dropdown menu={{ items: userMenuItems }} trigger={["hover"]} placement="bottomRight">
          <UserTrigger>
            <UserOutlined className="user-icon" />
            <span>{userName}</span>
            <DownOutlined className="caret-icon" />
          </UserTrigger>
        </Dropdown>
      </NavInner>
    </TopNav>
  );
};

export default TopNavbar;
