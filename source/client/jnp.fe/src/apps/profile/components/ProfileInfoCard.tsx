import React, { useMemo } from "react";
import {
  UserOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { UserProfile } from "../services/type";
import { ProfileCardWrapper } from "./style";

interface ProfileInfoCardProps {
  user: UserProfile | null;
}

const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user }) => {
  const initials = useMemo(
    () => getInitials(user?.displayName || user?.fullName || user?.username),
    [user]
  );

  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") || user?.username === "admin";

  return (
    <ProfileCardWrapper>
      <div className="card-header-row">
        <div className="avatar-circle">
          {initials || <UserOutlined />}
        </div>
        <div className="user-header-meta">
          <h2 className="display-name">{user?.displayName || "Người dùng"}</h2>
          <div className="username-sub">
            <span>@{user?.username || "user"}</span>
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <div className="info-label">
            <MailOutlined />
            <span>Địa chỉ Email</span>
          </div>
          <div className="info-value">
            {user?.email || `${user?.username || "user"}@daugia.ptit.vn`}
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">
            <SafetyCertificateOutlined />
            <span>Trạng thái tài khoản</span>
          </div>
          <div className="info-value" style={{ color: "#16a34a" }}>
            Đã kích hoạt &amp; Sẵn sàng đấu giá
          </div>
        </div>

        <div className="info-item" style={{ gridColumn: "1 / -1" }}>
          <div className="info-label">
            <UserOutlined />
            <span>Vai trò hệ thống</span>
          </div>
          <div className="info-value">
            {isAdmin ? "Hệ thống Quản trị Sàn" : "Thành viên đấu giá trực tuyến"}
          </div>
        </div>
      </div>
    </ProfileCardWrapper>
  );
};

export default ProfileInfoCard;
