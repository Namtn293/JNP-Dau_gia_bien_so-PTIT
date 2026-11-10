import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Dropdown, type MenuProps } from "antd";
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  LoginOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  TopNav,
  NavInner,
  Brand,
  BrandText,
  UserTrigger,
  NavActions,
  NotificationBellButton,
} from "./styled";
import { NotificationBell } from "./NotificationBell";
import { ADMIN_LOGIN_ROUTE } from "@/constants";
import tokenManager from "@/shared/utils/tokenManager";
import { parseJwt } from "@/shared/utils/jwt";

const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

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
  const [token, setToken] = useState<string | undefined>(() =>
    tokenManager.getAccessToken()
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(tokenManager.getAccessToken());
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const isLogin = Boolean(token);

  const displayName = useMemo(() => {
    if (!isLogin || !token) return "";

    // 1. Kiểm tra profile trong localStorage
    try {
      const raw = localStorage.getItem("auction_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.fullName || parsed.name || parsed.userName;
        if (name && name !== "Người dùng" && name !== "Bạn") return name;
        if (parsed.email) return parsed.email.split("@")[0];
      }
    } catch {
      // ignore
    }

    // 2. Kiểm tra thông tin trong JWT payload
    const payload = parseJwt(token);
    if (payload) {
      if (payload.sub === "admin" || payload.roles?.includes("ROLE_ADMIN")) {
        const name = payload.fullName || payload.name;
        return name && name !== "Người dùng" && name !== "Bạn" ? name : "Quản trị hệ thống";
      }
      const name =
        payload.fullName ||
        payload.name ||
        payload.sub ||
        (payload.email ? payload.email.split("@")[0] : undefined);
      if (name && name !== "Người dùng" && name !== "Bạn") return name;
    }

    // 3. Fallback theo prop userName nếu có giá trị thực tế
    if (userName && userName !== "Người dùng" && userName !== "Bạn") {
      return userName;
    }

    // Không sử dụng fallback tên mặc định
    return "";
  }, [isLogin, token, userName]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const handleLogout = () => {
    tokenManager.removeAllToken();
    setToken(undefined);
    if (onLogout) {
      onLogout();
    }
    navigate({ to: ADMIN_LOGIN_ROUTE });
  };

  const userMenuItems: MenuProps["items"] = isLogin
    ? [
        {
          key: "profile",
          icon: <UserOutlined style={{ color: "#256b8c" }} />,
          label: "Hồ sơ cá nhân & Ví tiền",
          onClick: () => navigate({ to: "/profile" }),
        },
        {
          type: "divider",
        },
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

        <NavActions>
          {isLogin ? (
            <NotificationBell />
          ) : (
            <NotificationBellButton
              title="Thông báo"
              onClick={() => navigate({ to: ADMIN_LOGIN_ROUTE })}
            >
              <BellOutlined />
            </NotificationBellButton>
          )}

          <Dropdown menu={{ items: userMenuItems }} trigger={["hover", "click"]} placement="bottomRight">
            <UserTrigger
              title={!isLogin ? "Đăng nhập" : displayName || "Tài khoản"}
              onClick={!isLogin ? () => navigate({ to: ADMIN_LOGIN_ROUTE }) : undefined}
            >
              <Avatar
                size={32}
                style={{
                  backgroundColor: "#256b8c",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
                icon={!isLogin || !initials ? <UserOutlined style={{ color: "#fff" }} /> : undefined}
              >
                {isLogin && initials ? initials : null}
              </Avatar>
              {isLogin && displayName ? <span className="user-name">{displayName}</span> : null}
              {isLogin ? <DownOutlined className="caret-icon" /> : null}
            </UserTrigger>
          </Dropdown>
        </NavActions>
      </NavInner>
    </TopNav>
  );
};

export default TopNavbar;
