import MenuButton from "@/shared/components/menu-button/MenuButton";
import {
  BellOutlined,
  HomeOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import useHandleLogOut from "@apps/dashboard/hooks/useHandleLogOut";
import useGetApps from "@shared/hooks/useGetApps";
import type { MenuProps } from "antd";
import { Avatar, Dropdown, Tooltip } from "antd";
import React, { useEffect } from "react";
import ThongBao from "./thong-bao/ThongBao";

import {
  useUserInfo,
  type Taikhoan,
  type ThongTinTaiKhoan,
} from "@/apps/admin/services";
import { useNavigate } from "@tanstack/react-router";
import {
  HeaderActions,
  HeaderContent,
  HeaderIconButton,
  HeaderWrapper,
  LogoGroup,
  LogoImage,
  LogoSection,
  MainTitle,
  // SubTitle,
  TextSection,
} from "./styled";

interface IHeader {
  sidebarCollapsed: boolean;
}

const Header: React.FC<IHeader> = ({ sidebarCollapsed }) => {
  const { handleLogOut } = useHandleLogOut();
  const { data } = useUserInfo();
  const userInfo = data?.data;
  const canAuthorize = Boolean((userInfo as Taikhoan & { coTheUyQuyen?: boolean })?.coTheUyQuyen);

  useEffect(() => {
    if (userInfo?.maVaiTro) {
      localStorage.setItem("maVaiTro", JSON.stringify(userInfo.maVaiTro));
    }
  }, [userInfo?.maVaiTro]);

  const navigate = useNavigate();
  const { apps } = useGetApps();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    ...(canAuthorize
      ? [
          {
            key: "uy-quyen",
            label: "Ủy quyền",
            icon: <SafetyCertificateOutlined />,
          },
        ]
      : []),
    {
      key: "notifications",
      label: "Tất cả thông báo",
      icon: <BellOutlined />,
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "profile":
        navigate({ to: "/uy-quyen-tai-khoan/quan-ly-thong-tin-ca-nhan" });
        break;
      case "uy-quyen":
        navigate({ to: "/uy-quyen-tai-khoan/quan-ly-uy-quyen-tai-khoan" });
        break;
      case "notifications":
        navigate({ to: "/uy-quyen-tai-khoan/quan-ly-thong-bao" });
        break;
      case "logout":
        handleLogOut();
        break;
    }
  };

  return (
    <HeaderWrapper $sidebarCollapsed={sidebarCollapsed}>
      <HeaderContent>
        <LogoSection>
          <LogoGroup>
            <img src="/vite.svg" alt="Vite Logo" style={{ width: 34, height: 34 }} />
          </LogoGroup>
          <TextSection>
            <MainTitle>SÀN ĐẤU GIÁ BIỂN SỐ XE</MainTitle>
            <span style={{ fontSize: 11, color: "var(--design-primary-subtitle, #586979)" }}>Hệ thống Đấu giá Trực tuyến</span>
          </TextSection>
        </LogoSection>

        <div className="header-right">
          <HeaderActions>
            <Tooltip title="Trang chủ">
              <HeaderIconButton
                type="button"
                aria-label="Trang chá»§"
                onClick={() => navigate({ to: "/" })}
              >
                <HomeOutlined />
              </HeaderIconButton>
            </Tooltip>

            {/* apps */}
            {apps && apps.length > 1 && <MenuButton />}

            {/* Notification */}
            <ThongBao />

          </HeaderActions>

          {/* user */}
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
            arrow
          >
            <div className="user-info" style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined style={{ color: "#fff" }} />} />
              <span>{userInfo?.thongTinTaiKhoan.hoTen ?? "Admin"}</span>
            </div>
          </Dropdown>
        </div>
      </HeaderContent>
    </HeaderWrapper>
  );
};

export default Header;

/* eslint-disable react-refresh/only-export-components */
export const EMPTY_THONG_TIN_TAI_KHOAN: ThongTinTaiKhoan = {
  idTaiKhoan: 0,
  hoTen: "",
  email: "",
  soDienThoai: "",
  diaChi: "",
  anhDaiDien: "",
  gioiTinh: "",
  ngaySinh: "",
  canCuocCongDan: "",
  chucVuId: "",
  tenChucVu: "",
  donViId: "",
  donVi_RId: null,
  tenDonVi: "",
  ngayTao: "",
};

export const EMPTY_TAI_KHOAN: Taikhoan = {
  taiKhoanId: 0,
  tenDangNhap: "",
  ngayTao: "",
  trangThai: false,
  thongTinTaiKhoan: EMPTY_THONG_TIN_TAI_KHOAN,
  roles: [],
  maVaiTro: [],
};
