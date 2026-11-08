import React, { useMemo } from "react";
import { Dropdown, type MenuProps } from "antd";
import { UserOutlined, DownOutlined, LogoutOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { TopNav, NavInner, Brand, BrandText, UserTrigger } from "./styled";
import { ADMIN_LOGIN_ROUTE } from "@/constants";
import tokenManager from "@/shared/utils/tokenManager";

interface TopNavbarProps {
  userName?: string;
  onLogout?: () => void;
  fluid?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  userName,
  onLogout,
  fluid = false,
}) => {
  const navigate = useNavigate();
  const token = tokenManager.getAccessToken();
  const isLogin = Boolean(token);

  const displayName = useMemo(() => {
    if (!isLogin) return "";
    if (userName && userName !== "Người dùng" && userName !== "Bạn") {
      return userName;
    }
    try {
      const raw = localStorage.getItem("auction_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.name || parsed.fullName || parsed.userName;
        if (name) return name;
      }
      if (token) {
        const parts = token.split(".");
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          const name = payload.fullName || payload.name || payload.sub || payload.email;
          if (name) return name;
        }
      }
    } catch (e) {
      // ignore
    }
    return userName || "Người dùng";
  }, [isLogin, userName, token]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      tokenManager.removeAllToken();
      localStorage.clear();
      navigate({ to: ADMIN_LOGIN_ROUTE });
    }
  };

  const userMenuItems: MenuProps["items"] = isLogin
    ? [
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          danger: true,
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: "login",
          icon: <LoginOutlined style={{ color: "#1b6284" }} />,
          label: "Đăng nhập",
          onClick: () => navigate({ to: ADMIN_LOGIN_ROUTE }),
        },
      ];

  return (
    <TopNav>
      <NavInner $fluid={fluid}>
        <Brand onClick={() => navigate({ to: "/" })}>
          <BrandText>
            <h2>Sàn Đấu Giá Biển Số Xe</h2>
            <span>Hệ thống Đấu giá Biển số Trực tuyến</span>
          </BrandText>
        </Brand>

        <Dropdown menu={{ items: userMenuItems }} trigger={["hover", "click"]} placement="bottomRight">
          <UserTrigger
            $isGuest={!isLogin}
            title={!isLogin ? "Đăng nhập" : displayName}
            onClick={!isLogin ? () => navigate({ to: ADMIN_LOGIN_ROUTE }) : undefined}
          >
            <UserOutlined className="user-icon" />
            {isLogin && (
              <>
                <span>{displayName}</span>
                <DownOutlined className="caret-icon" />
              </>
            )}
          </UserTrigger>
        </Dropdown>
      </NavInner>
    </TopNav>
  );
};

export default TopNavbar;
