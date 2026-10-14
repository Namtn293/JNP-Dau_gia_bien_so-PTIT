import Header from '@/apps/admin/components/header/Header';
import { Outlet } from '@tanstack/react-router';
import React, { useState } from 'react';
import Sidebar from './sidebar';
import { ContentWrapper, LayoutWrapper } from './styled';
import AiChatWidget from './AI-chatboxSDK/AiChatWidget';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <LayoutWrapper>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <ContentWrapper $sidebarCollapsed={sidebarCollapsed}>
        <Outlet />
      </ContentWrapper>
      <AiChatWidget />
    </LayoutWrapper>
  );
};

export default AdminLayout;