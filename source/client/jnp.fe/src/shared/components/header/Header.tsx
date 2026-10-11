import React from 'react';
// Đã xoá 'Typography' vì không còn sử dụng
import { Avatar, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
// import { useNavigate } from '@tanstack/react-router';
import useHandleLogOut from '@apps/dashboard/hooks/useHandleLogOut';
import MenuButton from '@/shared/components/menu-button/MenuButton';
import ChangeLanguageButton from "@shared/components/change-language-button"

// Import các styled components mới từ file styled của bạn
import {
  HeaderWrapper,
  HeaderContent,
  LogoSection,
  LogoGroup,
  LogoImage,
  PartnerLogo,
  TextSection,
  MainTitle,
  // SubTitle,
} from './styled';

interface IHeader {
  sidebarCollapsed: boolean;
}

const Header: React.FC<IHeader> = ({ sidebarCollapsed }) => {
  const { handleLogOut } = useHandleLogOut();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        handleLogOut();
        break;
    }
  };

  return (
    <HeaderWrapper sidebarCollapsed={sidebarCollapsed}>
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
          <Space size="middle">
            {/* <Button
              type="text"
              icon={<BellOutlined />}
              size="large"
              className="notification-btn"
            /> */}
            <ChangeLanguageButton />
            <MenuButton />

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Space className="user-info" style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>Admin User</span>
              </Space>
            </Dropdown>
          </Space>
        </div>
      </HeaderContent>
    </HeaderWrapper>
  );
};

export default Header;